import {validateSong} from './core.mjs';
export const codeText=value=>String(value).trim().toUpperCase().replace(/[\s-]/g,'');
export function validCode(value){const code=codeText(value);if(!/^[A-Z0-9]{8}$/.test(code))throw Error('학급 코드 8자리를 확인해 주세요.');return code;}
export function submission(song,label){const studentLabel=String(label).trim();if(!studentLabel||studentLabel.length>30)throw Object.assign(Error(),{userMessage:'번호나 별명을 30자 이내로 적어 주세요.'});const safe=validateSong(song);if(!safe.bars.some(b=>b.some(n=>n.pitch!==null)))throw Object.assign(Error(),{userMessage:'음을 하나 이상 만든 뒤 제출해 주세요.'});return {studentLabel,title:safe.title,songJSON:JSON.stringify(safe)};}
// Content-addressed receipts make a retry safe while preserving every different work.
export async function submissionId(uid,data){
 const bytes=new TextEncoder().encode(JSON.stringify([uid,data.studentLabel,data.songJSON]));
 const hash=await crypto.subtle.digest('SHA-256',bytes);
 return uid+'_'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
}
export function makeCode(random=crypto){const a=new Uint8Array(8);random.getRandomValues(a);return Array.from(a,n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');}
export function connectionMessage(error){const code=String(error?.code||'');if(code.includes('popup-closed')||code.includes('cancelled-popup'))return '로그인을 취소했어요. 다시 로그인할 수 있어요.';if(code.includes('permission-denied'))return '학급 코드·제출 기간·관리 권한을 확인해 주세요. 연결이 안 되면 작품 파일로 제출해 주세요.';if(code.includes('resource-exhausted')||code.includes('quota'))return '무료 사용 한도에 도달했어요. 추가 결제 없이 작품 파일로 제출해 주세요.';return error?.userMessage||'서버 응답을 확인하지 못했어요. 제출 확인을 다시 누르거나 작품 파일로 제출해 주세요.';}
export async function deadline(promise,ms=12000){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),ms);})]);}finally{clearTimeout(timer);}}

export async function connectClassroom(config){
 if(!config?.projectId||!config.apiKey)throw Error('학급방 서버 준비 중');
 const [appSDK,authSDK,dbSDK]=await Promise.all([import('./lib/firebase/firebase-app.js'),import('./lib/firebase/firebase-auth.js'),import('./lib/firebase/firebase-firestore-lite.js')]);
 const app=appSDK.initializeApp(config,'classroom'),auth=authSDK.getAuth(app),db=dbSDK.getFirestore(app);
 await deadline(auth.authStateReady());
 const teacher=()=>auth.currentUser?.providerData.some(p=>p.providerId==='google.com');
 const student=async()=>{if(!auth.currentUser)await deadline(authSDK.signInAnonymously(auth));return auth.currentUser.uid;};
 const roomRef=code=>dbSDK.doc(db,'rooms',validCode(code));
 const teacherOnly=()=>{if(!teacher())throw Error('선생님 로그인이 필요합니다.');};
 const roomData=snap=>{if(!snap.exists())throw Object.assign(Error(),{userMessage:'학급 코드를 찾지 못했어요. 선생님께 코드를 확인해 주세요.'});return {code:snap.id,...snap.data()};};
 return {
  teacher,
  login:()=>authSDK.signInWithPopup(auth,new authSDK.GoogleAuthProvider()),
  logout:()=>authSDK.signOut(auth),
  async rooms(){teacherOnly();const q=dbSDK.query(dbSDK.collection(db,'rooms'),dbSDK.where('ownerUid','==',auth.currentUser.uid),dbSDK.limit(20));return (await deadline(dbSDK.getDocs(q))).docs.map(roomData).sort((a,b)=>b.createdAt.toMillis()-a.createdAt.toMillis());},
  async create(title){teacherOnly();title=String(title).trim();if(!title||title.length>80)throw Object.assign(Error(),{userMessage:'학급방 이름을 80자 이내로 적어 주세요.'});const code=makeCode(),stamp=dbSDK.serverTimestamp();await deadline(dbSDK.setDoc(roomRef(code),{ownerUid:auth.currentUser.uid,title,open:true,createdAt:stamp,updatedAt:stamp,expiresAt:dbSDK.Timestamp.fromMillis(Date.now()+29*86400000)}));return code;},
  async join(code){await student();return roomData(await deadline(dbSDK.getDoc(roomRef(code))));},
  async submit(code,song,label){const data=submission(song,label),uid=await student(),id=await submissionId(uid,data),ref=dbSDK.doc(roomRef(code),'submissions',id),previous=await deadline(dbSDK.getDoc(ref));if(previous.exists())return {id,...data};const legacy=await deadline(dbSDK.getDoc(dbSDK.doc(roomRef(code),'submissions',uid)));if(legacy.exists()&&legacy.data().songJSON===data.songJSON&&legacy.data().studentLabel===data.studentLabel)return {id:uid,...data};await deadline(dbSDK.setDoc(ref,{...data,createdAt:dbSDK.serverTimestamp(),updatedAt:dbSDK.serverTimestamp()}));return {id,...data};},
  async mine(code,song,label){const uid=await student(),data=submission(song,label),id=await submissionId(uid,data),snap=await deadline(dbSDK.getDoc(dbSDK.doc(roomRef(code),'submissions',id)));if(snap.exists())return snap.data();const old=await deadline(dbSDK.getDoc(dbSDK.doc(roomRef(code),'submissions',uid)));return old.exists()&&old.data().songJSON===data.songJSON&&old.data().studentLabel===data.studentLabel?old.data():null;},
  async works(code,after=null){teacherOnly();const q=dbSDK.query(dbSDK.collection(roomRef(code),'submissions'),...(after?[dbSDK.startAfter(after)]:[]),dbSDK.limit(100));const docs=(await deadline(dbSDK.getDocs(q))).docs;let invalid=0;const works=[];for(const d of docs){try{const data=d.data();works.push({id:d.id,name:String(data.studentLabel).slice(0,30),song:validateSong(JSON.parse(data.songJSON))});}catch{invalid++;}}return {works,invalid,next:docs.length===100?docs.at(-1):null};},
  async close(code,open){teacherOnly();await deadline(dbSDK.updateDoc(roomRef(code),{open,updatedAt:dbSDK.serverTimestamp()}));}
 };
}

