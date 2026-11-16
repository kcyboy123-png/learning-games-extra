export const KEY='dotori-dokdo-post:full:v1';
export const REQUESTS=[
 ['모모','바다빛 컵과 선물','B','여러 모양의 용기 중 직육면체 상자를 함께 찾아줄래? 컵 모양과 상자 모양은 달라.','따뜻한 차를 마실 때마다 마을 친구들이 생각나!'],
 ['단단','마을 사진 액자','B','사진이 안전하게 도착하도록 면과 모서리, 꼭짓점을 살펴줘.','액자가 무사히 왔어. 마을 사진을 보니 반갑다!'],
 ['여울','기록장과 도구함','B','보이지 않는 모서리까지 그려두면 상자를 알아보기 쉬울 거야.','그림 덕분에 기록함의 모양을 바로 알아봤어.'],
 ['솔이','등불 보호 상자','C','등불을 받칠 면이 서로 어떻게 만나는지 확인해줘.','등불을 안전하게 꺼냈어. 고마운 마음이 환하게 빛나!'],
 ['보리','간식 선물 상자','C','정사각형 여섯 장을 접어 간식 상자를 만들어줄래?','정성껏 접은 상자에 담긴 간식을 함께 나눴어!'],
 ['꼬미','편지와 종이 우체부','C','크기가 다른 직사각형을 맞춰 편지 상자와 종이 우체부를 완성해줘.','종이 우체부가 편지를 전해줬어. 우리도 답장을 보낼게!'],
 ['마을 친구들','공동 소포','A','지금까지 익힌 방법으로 5×4×2cm 학습 모형을 완성해줘.','모두의 마음이 도착했어. 우리 마을과 독도가 한층 가까워졌네!']
].map(([name,item,destination,request,reply],id)=>({id,name,item,destination,request,reply}));
export function postal(progress){const s=progress.getExtra('postal');if(!s||!Array.isArray(s.accepted)||!Array.isArray(s.delivered))return{accepted:[],delivered:[],island:'main',place:'start',voyage:null};const ids=a=>[...new Set(a.filter(i=>Number.isInteger(i)&&i>=0&&i<7))],island=s.island==='mist'?'mist':'main',places=island==='mist'?['A','B','C']:['start','P','H','r0','r1','r2','r3','r4','r5'];return{accepted:ids(s.accepted),delivered:ids(s.delivered).filter(i=>sealed(progress,i)),island,place:places.includes(s.place)?s.place:places[0],voyage:['main','mist'].includes(s.voyage?.to)?{to:s.voyage.to}:null};}
export function sealed(progress,id){return id===6?progress.finalDone():progress.workshopDone(id);}
export function pending(progress,s=postal(progress)){return REQUESTS.filter(r=>sealed(progress,r.id)&&!s.delivered.includes(r.id));}
export function canAccept(progress,s,id){return progress.current()?.workshop===id&&(id===0||s.delivered.includes(0));}
export function deliver(progress,s,id,site){if(!sealed(progress,id)||s.delivered.includes(id)||REQUESTS[id]?.destination!==site||s.island!=='mist')return false;s.delivered.push(id);return true;}
