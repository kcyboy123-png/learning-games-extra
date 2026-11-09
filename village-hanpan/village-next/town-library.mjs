import {parseSave,serialize} from './core.mjs?v=perf1';

export const LIBRARY_KEY='village-next-town-library-v1';
export const MAX_TOWNS=20,MAX_LIBRARY_BYTES=3000000,MAX_SHARE_LENGTH=16000;
const MAX_FILE_BYTES=550000,MAX_TEXT=500000;
const clean=(value,max,fallback='')=>String(value??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max)||fallback;
function validateEntry(entry){
 if(!entry||typeof entry.save!=='string'||entry.save.length>MAX_TEXT)throw Error('마을 파일 크기를 확인해 주세요.');
 const state=parseSave(entry.save);
 return {id:clean(entry.id,80),name:clean(entry.name,32,'이름 없는 마을'),note:clean(entry.note,120),savedAt:Number.isFinite(entry.savedAt)?entry.savedAt:0,save:entry.save,thumbnail:typeof entry.thumbnail==='string'&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(entry.thumbnail)&&entry.thumbnail.length<50000?entry.thumbnail:'',state};
}
export function readLibrary(storage){
 const raw=storage.getItem(LIBRARY_KEY);if(!raw)return [];
 if(raw.length>MAX_LIBRARY_BYTES)throw Error('보관함 크기를 확인해 주세요.');
 let data;try{data=JSON.parse(raw);}catch{throw Error('보관함을 읽지 못했어요. 기존 자료는 그대로 보존했어요.');}
 if(data?.version!==1||!Array.isArray(data.towns)||data.towns.length>MAX_TOWNS)throw Error('보관함 형식을 확인해 주세요.');
 return data.towns.map(validateEntry);
}
export function archiveTown(storage,state,{name,note,thumbnail='',now=Date.now()}={}){
 const save=serialize(state);parseSave(save);
 const towns=readLibrary(storage).map(({state,...entry})=>entry);
 // Only exact duplicates are reused; a new student never silently replaces another work.
 const same=towns.find(t=>t.save===save&&t.name===clean(name,32,'우리 마을')&&t.note===clean(note,120));if(same)return same;
 if(towns.length>=MAX_TOWNS)throw Error('보관함에 20개 작품이 있어요. 새로 시작하기 전에 마을 파일을 별도로 보관해 주세요.');
 const entry=validateEntry({id:globalThis.crypto?.randomUUID?.()||`${now}-${Math.random().toString(36).slice(2)}`,name:clean(name,32,'우리 마을'),note,thumbnail,savedAt:now,save});
 delete entry.state;towns.unshift(entry);const next=JSON.stringify({version:1,towns});
 if(next.length>MAX_LIBRARY_BYTES)throw Error('보관함이 가득 찼어요. 현재 마을은 그대로예요.');
 try{storage.setItem(LIBRARY_KEY,next);}catch{throw Error('작품을 보관하지 못했어요. 저장 공간을 확인해 주세요. 현재 마을은 그대로예요.');}
 return entry;
}
export function removeArchivedTown(storage,id){
 const towns=readLibrary(storage).filter(entry=>entry.id!==id).map(({state,...entry})=>entry);
 try{storage.setItem(LIBRARY_KEY,JSON.stringify({version:1,towns}));}catch{throw Error('보관함을 변경하지 못했어요. 기존 작품은 그대로예요.');}
}
export function parseTownFile(text){
 if(typeof text!=='string'||text.length>MAX_TEXT)throw Error('마을 파일 크기를 확인해 주세요.');
 let data;try{data=JSON.parse(text);}catch{throw Error('마을 파일 형식이 아니에요.');}
 if(data?.format==='village-exhibit-1')return validateEntry(data);
 return validateEntry({save:text,name:'불러온 마을'});
}
export function townFile(state,name,note){
 const entry=validateEntry({save:serialize(state),name,note});
 return JSON.stringify({format:'village-exhibit-1',name:entry.name,note:entry.note,save:entry.save});
}
async function boundedBytes(stream,max){
 const reader=stream.getReader(),parts=[];let total=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;total+=value.byteLength;if(total>max){await reader.cancel();throw Error('공유 자료가 너무 커요. 마을 파일로 감상해 주세요.');}parts.push(value);}}finally{reader.releaseLock();}
 const all=new Uint8Array(total);let offset=0;for(const p of parts){all.set(p,offset);offset+=p.length;}return all;
}
export async function createVisitLink(state,name,note,base=new URL('./',import.meta.url).href){
 if(typeof CompressionStream==='undefined')throw Error('이 브라우저에서는 공유 파일을 이용해 주세요.');
 const text=townFile(state,name,note),bytes=await boundedBytes(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip')),MAX_SHARE_LENGTH);
 let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 const packed=btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 const url=new URL(base);url.search='';url.hash='visit=v1.'+packed;
 if(url.href.length>MAX_SHARE_LENGTH)throw Error('큰 마을은 링크 대신 마을 파일로 공유해 주세요.');
 return url.href;
}
export async function readVisitHash(hash=location.hash){
 if(!hash.startsWith('#visit='))return null;
 if(hash.length>MAX_SHARE_LENGTH||!/^#visit=v1\.[A-Za-z0-9_-]+$/.test(hash))throw Error('공유 주소를 확인해 주세요.');
 if(typeof DecompressionStream==='undefined')throw Error('이 브라우저에서는 마을 파일로 감상해 주세요.');
 try{const packed=hash.slice(10).replace(/-/g,'+').replace(/_/g,'/'),binary=atob(packed),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  const raw=await boundedBytes(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')),MAX_FILE_BYTES);
  return parseTownFile(new TextDecoder('utf-8',{fatal:true}).decode(raw));
 }catch(error){throw Error('공유 마을을 읽지 못했어요. '+error.message);}
}

export function createTownLibrary({getState,onVisit,onRestore,onNew,notify=()=>{},storage,captureThumbnail=()=>''}){
 // Some classroom browsers throw even when reading the localStorage property.
 storage??={getItem:key=>globalThis.localStorage.getItem(key),setItem:(key,value)=>globalThis.localStorage.setItem(key,value)};
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=()=>Promise.resolve().then(fn).catch(e=>notify(e.message));return b;};
 const dialog=el('dialog',null,'town-library'),heading=el('h2','우리 마을 보관함 · 전시회'),intro=el('p','이 태블릿에 작품을 모아 친구의 마을을 감상해요. 다른 기기에는 링크나 파일로 전해요.');
 const name=el('input'),note=el('input');name.maxLength=32;note.maxLength=120;name.placeholder='작품 이름';note.placeholder='어떤 마을을 만들었나요? (선택)';name.value='우리 마을';
 const nameLabel=el('label','작품 이름'),noteLabel=el('label','마을 소개');nameLabel.append(name);noteLabel.append(note);
 const close=button('닫기',()=>dialog.close()),top=el('div',null,'town-library-top');top.append(heading,close);
 const actions=el('div',null,'town-library-actions'),list=el('div',null,'town-library-list'),shareBox=el('section',null,'town-share');
 const shareTitle=el('b','친구에게 보내는 감상 전용 링크'),shareText=el('textarea');shareText.readOnly=true;shareText.setAttribute('aria-label','마을 감상 공유 주소');shareBox.hidden=true;
 shareBox.append(shareTitle,el('p','링크를 가진 사람은 작품을 볼 수 있어요. 실명 등 개인정보는 소개에 쓰지 않아요.'),shareText,button('링크 복사',async()=>{await navigator.clipboard.writeText(shareText.value);notify('감상 링크를 복사했어요.');}));
 const file=el('input');file.type='file';file.multiple=true;file.accept='.json,application/json';file.hidden=true;
 function archiveCurrent(title=name.value,description=note.value){return archiveTown(storage,getState(),{name:title,note:description,thumbnail:captureThumbnail()});}
 function startNew(){archiveCurrent();if(onNew())dialog.close();}
 function download(state=getState(),title=name.value,description=note.value){const a=el('a');const url=URL.createObjectURL(new Blob([townFile(state,title,description)],{type:'application/json'}));a.href=url;a.download='마을-전시작품.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);notify('감상용 마을 파일을 보관했어요.');}
 function render(){list.replaceChildren();const towns=readLibrary(storage);
  if(!towns.length){list.append(el('p','아직 보관한 작품이 없어요. 지금 마을부터 담아 보세요.'));return;}
  for(const entry of towns){const card=el('article',null,'town-library-card');
   if(entry.thumbnail){const img=el('img');img.src=entry.thumbnail;img.alt=entry.name+' 미리보기';img.loading='lazy';card.append(img);}
   else{const canvas=el('canvas');canvas.width=180;canvas.height=108;canvas.setAttribute('aria-label',entry.name+' 마을 배치 미리보기');const c=canvas.getContext('2d');c.fillStyle='#c8dcac';c.fillRect(0,0,180,108);c.fillStyle='#9dced5';c.fillRect(110,0,10,108);for(const b of entry.state.buildings){c.fillStyle=b.type==='road'?'#e9d9b6':b.type==='house'?'#729579':b.type==='tree'?'#5b845b':'#b68a70';c.fillRect(b.x*10,b.y*6,8,5);}card.append(canvas);}
   card.append(el('h3',entry.name),el('p',entry.note),el('small',new Date(entry.savedAt||Date.now()).toLocaleDateString('ko-KR')));
   card.append(button('마을 감상하기',()=>{onVisit({...entry,state:parseSave(entry.save)});dialog.close();}),button('이 마을 이어하기',()=>{archiveCurrent();onRestore({...entry,state:parseSave(entry.save)});dialog.close();}));
   const more=el('details'),summary=el('summary','파일 보관 · 정리');more.append(summary,button('이 작품 파일 보관',()=>download(entry.state,entry.name,entry.note)),button('보관함에서 지우기',()=>{if(!confirm('이 보관 작품을 지울까요? 필요한 작품은 먼저 파일로 보관해 주세요. 현재 진행 중인 마을은 바뀌지 않아요.'))return;removeArchivedTown(storage,entry.id);render();}));card.append(more);list.append(card);
  }
 }
 file.onchange=async()=>{const files=Array.from(file.files||[]);file.value='';let added=0;try{for(const f of files){if(f.size>MAX_FILE_BYTES)throw Error('파일이 너무 커요.');const entry=parseTownFile(await f.text());archiveTown(storage,entry.state,{name:entry.name,note:entry.note});added++;}render();notify(`${added}개 작품을 전시회에 담았어요.`);}catch(e){render();notify(`${added}개 보관됨 · ${e.message}`);}};
 actions.append(button('지금 마을 보관',()=>{archiveCurrent();render();notify('현재 마을을 보관했어요.');}),button('친구 작품 모으기',()=>file.click()),button('감상 링크 만들기',async()=>{shareText.value=await createVisitLink(getState(),name.value,note.value);shareBox.hidden=false;shareText.focus();shareText.select();}),button('작품 파일 내려받기',download));
 dialog.append(top,intro,nameLabel,noteLabel,actions,shareBox,list,file);document.body.append(dialog);
 return {open(){try{render();dialog.showModal();}catch(e){notify(e.message);}},archiveCurrent,startNew,async readSharedVisit(){return readVisitHash();},element:dialog};
}
