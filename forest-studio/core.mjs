// core.mjs — materials, work state, migration/validation, placement and support rules. Pure module (no DOM, no three).
import {SITE,BOUND,TERRAINS,DEFAULT_TERRAIN,ENTRANCE,height,insideSite,EDIT_MARGIN,WALK_MARGIN} from './terrain.mjs';
export {SITE,BOUND,TERRAINS,DEFAULT_TERRAIN,ENTRANCE,height,insideSite,EDIT_MARGIN,WALK_MARGIN};
export const KEY='changyong-forest-studio-v1';
export const LEGACY_KEY='changyong-forest-studio-v1-legacy';
export const LIMIT=100;
export const DRAWERS=[
 {id:'rec',name:'추천',emoji:'✿'},
 {id:'tree',name:'큰 나무',emoji:'🌳'},
 {id:'shrub',name:'낮은 식물',emoji:'🌿'},
 {id:'flower',name:'꽃',emoji:'🌼'},
 {id:'ground',name:'길·바닥',emoji:'🪨'},
 {id:'rest',name:'쉼터·경관',emoji:'🪑'},
 {id:'water',name:'물·돌봄',emoji:'💧'}
];
const D=(id,name,tag,drawer,color,extra={})=>({id,name,tag,drawer,color,base:'point',body:[],foot:null,group:false,onDeck:false,maxTilt:0,recommended:false,...extra});
const box=(w,d,x=0,z=0)=>({x,z,w,d});
export const MATERIALS=[
 // A. 큰 나무 — trunk collides, canopy spreads overhead
 D('oak','느티나무','둥글고 넓은 그늘','tree','#58834d',{body:[box(.24,.24)],recommended:true}),
 D('birch','자작나무','가는 흰 줄기의 반복','tree','#a6b968',{body:[box(.14,.14)],recommended:true}),
 D('pine','소나무','옆으로 뻗은 가지와 굽은 줄기','tree','#4f6e45',{body:[box(.22,.22)]}),
 D('fir','전나무','뾰족한 수관과 수직 리듬','tree','#3f6448',{body:[box(.2,.2)]}),
 D('cherry','벚나무','밝고 둥근 꽃 수관','tree','#e8b7c6',{body:[box(.2,.2)]}),
 D('willow','버드나무','아래로 늘어진 가지','tree','#8da85f',{body:[box(.24,.24)]}),
 D('maple','단풍나무','손바닥 잎과 펼쳐진 수관','tree','#c8643f',{body:[box(.2,.2)]}),
 D('bamboo','대나무','마디 있는 줄기와 세로선','tree','#7fa65a',{body:[box(.4,.4)]}),
 // B. 낮은 식물
 D('hydrangea','수국','둥근 꽃송이 덩어리','shrub','#dba5b9',{body:[box(.45,.45)],recommended:true}),
 D('fern','고사리','펼쳐진 낮은 잎','shrub','#567d48',{group:true,recommended:true}),
 D('azalea','철쭉','낮고 넓은 꽃 관목','shrub','#e07a9a',{body:[box(.5,.5)]}),
 D('camellia','동백 관목','짙고 윤기 있는 잎','shrub','#2f5a3a',{body:[box(.45,.45)]}),
 D('silvergrass','억새','가늘게 흔들리는 긴 잎','shrub','#d8cfa4',{group:true}),
 D('boxwood','회양목','다듬은 둥근 관목','shrub','#5f8a46',{body:[box(.4,.4)]}),
 D('moss','이끼 덩이','낮은 융단 같은 질감','shrub','#6f9a4c',{group:true}),
 D('liriope','맥문동','줄 모양 잎과 작은 꽃대','shrub','#5c7f4e',{group:true}),
 // C. 꽃 — passable, 1/3/5 bundles
 D('daisy','데이지','밝은 작은 꽃','flower','#f3ecd5',{group:true,recommended:true}),
 D('lavender','라벤더','보라색 세로 꽃대','flower','#9984bc',{group:true,recommended:true}),
 D('poppy','양귀비','넓고 얇은 꽃잎','flower','#e9a073',{group:true,recommended:true}),
 D('tulip','튤립','단순한 컵 모양','flower','#e5635f',{group:true}),
 D('cosmos','코스모스','가는 줄기와 열린 꽃잎','flower','#ef9ac2',{group:true}),
 D('bellflower','초롱꽃','아래로 향한 종 모양','flower','#8c93d6',{group:true}),
 D('iris','붓꽃','칼 같은 잎과 입체적인 꽃잎','flower','#6a5fb8',{group:true}),
 D('wildaster','들국화','작고 촘촘한 꽃 무리','flower','#f1e9c6',{group:true}),
 // D. 길·바닥 — covers follow the ground; the deck is a level walking top
 D('stonepath','디딤돌','간격을 둔 걸음','ground','#c4bba5',{base:'cover',foot:{w:.7,d:.45},recommended:true}),
 D('woodpath','나무 데크','판재의 반복 · 평평한 보행면','ground','#bc9872',{base:'deck',foot:{w:.55,d:.6},maxTilt:.32,walkTop:0,recommended:true}),
 D('gravel','모래길','부드러운 밝은 바닥','ground','#dbc9a6',{base:'cover',foot:{w:.62,d:.62,round:true},recommended:true}),
 D('gravelpath','자갈길','거친 알갱이와 질감','ground','#a8a394',{base:'cover',foot:{w:.75,d:.5}}),
 D('soilpath','흙길','자연스러운 갈색 연결','ground','#9b7a55',{base:'cover',foot:{w:.8,d:.5}}),
 D('grasspatch','잔디 조각','작은 열린 빈터','ground','#8fb45a',{base:'cover',foot:{w:.7,d:.7,round:true}}),
 D('barkpath','나무껍질 조각길','불규칙한 갈색 결','ground','#7e5a3c',{base:'cover',foot:{w:.75,d:.5}}),
 D('logpads','통나무 디딤판','둥근 단면의 반복','ground','#b08a5c',{base:'cover',foot:{w:.7,d:.4}}),
 // E. 쉼터·경관 — rigid tops stay level; short legs absorb small height differences
 D('bench','나란히 벤치','둘이 머무는 자리','rest','#b0895d',{base:'rigid',foot:{w:.85,d:.32},maxTilt:.22,onDeck:true,body:[box(.85,.32)],recommended:true}),
 D('rock','이끼 바위','묵직한 덩어리','rest','#87917c',{body:[box(.6,.45)],recommended:true}),
 D('logseat','통나무 의자','혼자 머무는 자리','rest','#a37a4e',{base:'rigid',foot:{w:.32,d:.32},maxTilt:.2,onDeck:true,body:[box(.32,.32)]}),
 // Pavilion: posts + railings on three sides collide; the front (+z) is open and the floor is a walking surface.
 D('pavilion','작은 정자','지붕이 만드는 둘러싸임','rest','#8c6a48',{base:'rigid',foot:{w:1.2,d:1.2},maxTilt:.3,walkTop:.175,body:[box(.12,.12,-1.05,-1.05),box(.12,.12,1.05,-1.05),box(.12,.12,-1.05,1.05),box(.12,.12,1.05,1.05),box(.06,1.05,-1.05,0),box(.06,1.05,1.05,0),box(1.05,.06,0,-1.05)]}),
 D('arch','덩굴 아치','입구의 틀과 시선 유도','rest','#7d9b5c',{base:'rigid',foot:{w:.85,d:.25},maxTilt:.25,body:[box(.13,.13,-.75,0),box(.13,.13,.75,0)]}),
 D('lantern','낮은 등불','작은 빛의 강조','rest','#e2c27a',{base:'rigid',foot:{w:.16,d:.16},maxTilt:.12,onDeck:true,body:[box(.16,.16)]}),
 D('signpost','나무 안내판','숲의 이름과 길 안내','rest','#a98b63',{body:[box(.1,.1)]}),
 D('table','작은 탁자','모이는 중심','rest','#b59a74',{base:'rigid',foot:{w:.5,d:.5},maxTilt:.2,onDeck:true,body:[box(.5,.5)]}),
 // F. 물·돌봄 소품
 D('pond','작은 연못','물빛과 주변 식재의 관계','water','#7fb0c4',{base:'pond',foot:{w:1.1,d:.8,round:true},maxTilt:.22,body:[box(1.05,.75)]}),
 D('drystream','마른 개울','돌과 굽은 흐름','water','#a9a79a',{base:'cover',foot:{w:1.2,d:.45}}),
 D('reeds','갈대 군락','가장자리를 세우는 선','water','#c9b57a',{group:true}),
 D('birdbath','새 물그릇','생물을 배려하는 자리','water','#9aa6ad',{base:'rigid',foot:{w:.25,d:.25},maxTilt:.15,body:[box(.22,.22)]}),
 D('birdhouse','새집','나무 가까운 작은 구조물','water','#c79a62',{body:[box(.08,.08)]}),
 D('insecthotel','곤충 쉼터','다양한 작은 공간','water','#8f7652',{base:'rigid',foot:{w:.38,d:.2},maxTilt:.18,body:[box(.38,.2)]}),
 D('rainbarrel','빗물통','물을 모아 활용하는 아이디어','water','#5f7a8a',{base:'rigid',foot:{w:.3,d:.3},maxTilt:.15,body:[box(.3,.3)]}),
 D('compost','퇴비함','식물 돌봄과 자원 순환','water','#6e6a4a',{base:'rigid',foot:{w:.42,d:.42},maxTilt:.18,body:[box(.42,.42)]})
];
export const LEGACY_IDS=['oak','birch','hydrangea','fern','daisy','lavender','poppy','stonepath','woodpath','gravel','bench','rock'];
const byId=new Map(MATERIALS.map(m=>[m.id,m]));
export const material=kind=>byId.get(kind);
export const MISSIONS=[
 {
  "name": "어릴 적 나와 함께한 친구",
  "short": "친구와 다시 만날 숲",
  "from": "그때의 친구가",
  "letter": "우리, 해가 지는 줄도 모르고 놀던 날 기억나? 나란히 앉아 작은 비밀을 나누던 시간이 가끔 생각나. 다시 만나면 오래 이야기할 수 있도록, 우리 둘만의 자리를 만들어 줄래?",
  "focus": "둘러쌈과 개방 · 높낮이 · 균형",
  "question": "친구와 다시 앉고 싶은 자리에는 어떤 나무와 풍경이 있으면 좋을까요?",
  "image": "friend",
  "imageAlt": "나무 그늘 아래 벤치에 나란히 앉아 이야기를 나누는 두 어린 친구"
 },
 {
  "name": "할머니와 걷는 길",
  "short": "할머니와 천천히 걷기",
  "from": "할머니가",
  "letter": "네 작은 손을 잡고 걷던 날이 아직도 선하구나. 오늘은 네가 만든 길을 따라 천천히 걸어 보고 싶어. 꽃 앞에서 잠깐 멈추고, 나무 그늘에 앉아 네 이야기를 들을 수 있으면 좋겠구나.",
  "focus": "반복 · 리듬 · 질감",
  "question": "할머니와 나란히 걷다가 쉬어 갈 자리는 어디에 만들까요?",
  "image": "grandmother",
  "imageAlt": "꽃이 핀 정원 길을 손잡고 천천히 걷는 할머니와 아이"
 },
 {
  "name": "우리 강아지와 마음껏 뛰노는 정원",
  "short": "강아지와 뛰노는 정원",
  "from": "꼬리 흔드는 강아지가",
  "letter": "네가 신발을 신으면 나는 벌써 꼬리가 흔들려! 오늘은 너랑 공도 쫓고, 풀 냄새도 맡으며 한참 놀고 싶어. 신나게 뛰다가 지치면 네 옆 그늘에 폭 기대어 쉴 수 있는 정원을 만들어 줄래?",
  "focus": "동선 · 여백 · 공간의 연결",
  "question": "마음껏 뛰놀 빈자리와 함께 쉴 그늘을 어떻게 이어 줄까요?",
  "image": "puppy",
  "imageAlt": "햇살 가득한 잔디 정원에서 공을 따라 즐겁게 뛰노는 아이와 강아지"
 }
];
export const SCALES=[.7,.85,1,1.2,1.4];
export const ROTATION_STEP=Math.PI/6;
export const TAU=Math.PI*2;
export const clone=x=>JSON.parse(JSON.stringify(x));
export const uuid=()=>(globalThis.crypto?.randomUUID?.()??('id-'+Math.random().toString(36).slice(2)+Date.now().toString(36)));
export const normRot=r=>((r%TAU)+TAU)%TAU;
export function item(kind,x,z,scale=1,rotation=0,group=null,on=null){return {id:uuid(),kind,x,z,scale,rotation:normRot(rotation),group,on};}
export function initial(){return {version:2,terrain:{id:DEFAULT_TERRAIN,rev:TERRAINS[DEFAULT_TERRAIN].rev},mission:0,title:'너를 위한 작은 숲',intention:'',reason:'',tags:[],items:[],before:null,walk:null,tutorial:0,intro:false};}
export const isLegacy=state=>state.terrain.id==='flat-v1';

// ---- local/world helpers (match three's rotation.y) ----
export function toLocal(o,x,z){const c=Math.cos(o.rotation),s=Math.sin(o.rotation),dx=x-o.x,dz=z-o.z;return {x:(dx*c-dz*s)/o.scale,z:(dx*s+dz*c)/o.scale};}
export function toWorld(o,lx,lz){const c=Math.cos(o.rotation),s=Math.sin(o.rotation);return {x:o.x+(lx*c+lz*s)*o.scale,z:o.z+(-lx*s+lz*c)*o.scale};}
export function inFoot(o,foot,x,z,inset=0){const c=Math.cos(o.rotation),s=Math.sin(o.rotation),dx=x-o.x,dz=z-o.z,lx=(dx*c-dz*s)/o.scale,lz=(dx*s+dz*c)/o.scale;const w=foot.w-inset/o.scale,d=foot.d-inset/o.scale;if(w<=0||d<=0)return false;return foot.round?(lx/w)**2+(lz/d)**2<=1:Math.abs(lx)<=w&&Math.abs(lz)<=d;}
// Sample points across the whole footprint (rotation and scale applied), not only the centre.
export function footSamples(o,foot,n=5){const out=[],c=Math.cos(o.rotation),s=Math.sin(o.rotation);for(let i=0;i<n;i++)for(let j=0;j<n;j++){const lx=-foot.w+2*foot.w*i/(n-1),lz=-foot.d+2*foot.d*j/(n-1);if(foot.round&&(lx/foot.w)**2+(lz/foot.d)**2>1.001)continue;out.push({lx,lz,x:o.x+(lx*c+lz*s)*o.scale,z:o.z+(-lx*s+lz*c)*o.scale});}return out;}
export const decksOf=items=>items.filter(i=>material(i.kind)?.base==='deck');
export function deckTop(deck,terrain){let max=-Infinity;for(const s of footSamples(deck,material(deck.kind).foot))max=Math.max(max,height(s.x,s.z,terrain));return max+.14;}
export const dependents=(items,id)=>items.filter(i=>i.on===id);
export const groupMembers=(items,group)=>group?items.filter(i=>i.group===group):[];

// ---- placement evaluation: identical for preview, confirm and validation ----
const fail=(message,extra={})=>({ok:false,message,...extra});
export function evaluate(items,cand,terrain=DEFAULT_TERRAIN){
 const m=material(cand.kind);if(!m)return fail('알 수 없는 재료예요.');
 const o={x:cand.x,z:cand.z,scale:cand.scale,rotation:cand.rotation};
 const others=items.filter(i=>i.id!==cand.id),decks=decksOf(others);
 const deckAt=(x,z)=>decks.find(d=>inFoot(d,material(d.kind).foot,x,z,.05));
 if(!insideSite(o.x,o.z,EDIT_MARGIN))return fail('빈터 안쪽에 놓아 주세요. 바깥은 주변 숲이에요.',{outside:true});
 const samples=m.foot?footSamples(o,m.foot):[{x:o.x,z:o.z}];
 if(samples.some(s=>!insideSite(s.x,s.z,EDIT_MARGIN)))return fail('가장자리에 걸쳐 있어요. 빈터 안쪽으로 조금 옮겨 볼까요?',{outside:true});
 let min=Infinity,max=-Infinity;for(const s of samples){s.y=height(s.x,s.z,terrain);min=Math.min(min,s.y);max=Math.max(max,s.y);}
 const onDecks=decks.length?samples.map(s=>deckAt(s.x,s.z)):[];
 const anyDeck=onDecks.some(Boolean);
 if(m.base==='point'){if(anyDeck)return fail('데크 위에는 심을 수 없어요. 땅 위에 놓아 볼까요?');return {ok:true,y:samples[0].y,on:null,samples};}
 if(m.base==='cover'){if(anyDeck)return fail('데크 위에는 바닥재를 겹칠 수 없어요. 데크 옆에 이어 놓아 볼까요?');return {ok:true,y:min,on:null,samples};}
 if(m.base==='deck'){if(anyDeck)return fail('데크끼리 겹치지 않게 이어 놓아 주세요.');
  // A deck may not cover anything already placed (the covered item would float or straddle on reload).
  for(const other of others){if(other.on===cand.id)continue;const om=material(other.kind);const pts=om?.foot?footSamples(other,om.foot):[{x:other.x,z:other.z}];if(pts.some(p=>inFoot(o,m.foot,p.x,p.z,-.05)))return fail('이미 놓인 재료 위에는 데크를 놓을 수 없어요. 그 재료를 먼저 옮겨 볼까요?');}
  if(max-min>m.maxTilt)return fail('여기는 데크와 땅이 부드럽게 이어지기 어려워요. 조금 더 평평한 곳에 놓아 볼까요?');return {ok:true,y:max+.14,on:null,samples,skirt:max+.14-min};}
 if(m.base==='pond'){if(anyDeck)return fail('데크 위에 연못을 팔 수는 없어요. 땅 위에 놓아 볼까요?');if(max-min>m.maxTilt)return fail('물이 한쪽으로 쏟아질 것 같아요. 더 평평한 곳에 놓아 볼까요?');return {ok:true,y:max+.05,on:null,samples,skirt:max+.05-min};}
 // rigid: level top. Either fully on one deck, or fully on the ground within the tilt the legs can absorb.
 if(anyDeck){const first=onDecks[0];if(!onDecks.every(d=>d&&d.id===first?.id))return fail('데크와 땅에 걸쳐 있어요. 데크 위나 땅 위, 한쪽에 놓아 볼까요?');if(!m.onDeck)return fail('데크 위에는 놓을 수 없어요. 땅 위에 놓아 볼까요?');return {ok:true,y:deckTop(first,terrain),on:first.id,samples,skirt:0};}
 if(max-min>m.maxTilt)return fail('여기는 기울어져 있어요. 조금 더 평평한 곳에 놓아 볼까요?');
 return {ok:true,y:max,on:null,samples,skirt:max-min};
}
// The exact world y an item rests at. Same rule as evaluate; falls back gracefully for stored items.
export function restY(items,it,terrain=DEFAULT_TERRAIN){
 const m=material(it.kind);if(!m)return height(it.x,it.z,terrain);
 if(it.on){const deck=items.find(d=>d.id===it.on);if(deck)return deckTop(deck,terrain);}
 if(m.base==='point')return height(it.x,it.z,terrain);
 let max=-Infinity,min=Infinity;for(const s of footSamples(it,m.foot)){const y=height(s.x,s.z,terrain);max=Math.max(max,y);min=Math.min(min,y);}
 if(m.base==='cover')return min;if(m.base==='deck')return max+.14;if(m.base==='pond')return max+.05;return max;
}
// Bundles: fixed loose scatter from a seed so the preview equals the confirmed placement.
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function groupOffsets(n,seed='g'){
 if(n<=1)return [[0,0]];
 const h=hash(seed),base=(h%360)*Math.PI/180,radius=n===3?.5:.68;
 return Array.from({length:n},(_,i)=>{const a=base+i*TAU/n+((h>>(i*3))&7)*.04;const r=radius*(.85+((h>>(i*5))&15)/60);return [Math.cos(a)*r,Math.sin(a)*r];});
}
export function groupCandidates(kind,x,z,scale,rotation,n,seed){return groupOffsets(n,seed).map(([ox,oz],i)=>({kind,x:x+ox,z:z+oz,scale,rotation:normRot(rotation+i*.9),group:n>1?seed:null}));}
export function evaluateGroup(items,cands,terrain=DEFAULT_TERRAIN){const results=cands.map(c=>evaluate(items,c,terrain));return {ok:results.every(r=>r.ok),results,message:results.find(r=>!r.ok)?.message??''};}
// Whether a deck may be changed: not while something rests on it.
export function deckLocked(items,id){return items.some(i=>i.on===id);}

// ---- ground cover mask: recomputed from the confirmed covers every time items change ----
export const MASK_RES=128;
export function coverMask(items,data=new Uint8Array(MASK_RES*MASK_RES)){
 data.fill(0);
 for(const it of items){const m=material(it.kind);if(!m||m.base!=='cover')continue;const r=Math.max(m.foot.w,m.foot.d)*it.scale+.25;
  const i0=Math.max(0,Math.floor((it.x-r+BOUND.hx)/(2*BOUND.hx)*MASK_RES)),i1=Math.min(MASK_RES-1,Math.ceil((it.x+r+BOUND.hx)/(2*BOUND.hx)*MASK_RES));
  const j0=Math.max(0,Math.floor((it.z-r+BOUND.hz)/(2*BOUND.hz)*MASK_RES)),j1=Math.min(MASK_RES-1,Math.ceil((it.z+r+BOUND.hz)/(2*BOUND.hz)*MASK_RES));
  const c=Math.cos(it.rotation),s=Math.sin(it.rotation),w=m.foot.w+.12/it.scale,d=m.foot.d+.12/it.scale;
  for(let j=j0;j<=j1;j++){const dz=(j+.5)/MASK_RES*2*BOUND.hz-BOUND.hz-it.z;for(let i=i0;i<=i1;i++){const dx=(i+.5)/MASK_RES*2*BOUND.hx-BOUND.hx-it.x,lx=(dx*c-dz*s)/it.scale,lz=(dx*s+dz*c)/it.scale;if(m.foot.round?(lx/w)**2+(lz/d)**2<=1:Math.abs(lx)<=w&&Math.abs(lz)<=d)data[j*MASK_RES+i]=255;}}}
 return data;
}
export const maskAt=(data,x,z)=>{const i=Math.floor((x+BOUND.hx)/(2*BOUND.hx)*MASK_RES),j=Math.floor((z+BOUND.hz)/(2*BOUND.hz)*MASK_RES);return i<0||j<0||i>=MASK_RES||j>=MASK_RES?0:data[j*MASK_RES+i];};

// ---- validation and migration ----
const err=msg=>{throw Error(msg);};
const str=(x,max)=>{if(typeof x!=='string'||[...x].length>max)err('작품 글자 수를 확인해 주세요.');return x;};
const num=(x,lo,hi)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)err('배치 정보가 올바르지 않아요. 기존 작품은 그대로 두었어요.');return x;};
export const TAGS=['색','간격','높이','여백','길','기타','그대로 유지'];
function legacyItems(a){
 if(!Array.isArray(a)||a.length>LIMIT)err(`재료는 최대 ${LIMIT}개까지 불러올 수 있어요.`);const ids=new Set();
 return a.map(o=>{if(!o||typeof o.id!=='string'||o.id.length>80||ids.has(o.id)||!LEGACY_IDS.includes(o.kind)||!Number.isFinite(o.x)||!Number.isFinite(o.z)||Math.abs(o.x)>4.5||Math.abs(o.z)>4.5||![.75,1,1.3].includes(o.scale)||![0,1,2,3].includes(o.rotation))err('배치 정보가 올바르지 않아요. 기존 작품은 그대로 두었어요.');ids.add(o.id);return {id:o.id,kind:o.kind,x:o.x,z:o.z,scale:o.scale,rotation:normRot(o.rotation*Math.PI/2),group:null,on:null};});
}
export const LEGACY_POSE={x:0,y:1.65,z:5.6,yaw:0,pitch:Math.asin(.65/Math.hypot(.65,6.6)),fov:58,aspect:1.6};
// v1 works (12 materials, flat 9x9 area) keep every coordinate and open on the flat preset.
export function migrateV1(raw){
 if(!raw||raw.version!==1||!Number.isInteger(raw.mission)||raw.mission<0||raw.mission>2)err('이 버전에서 열 수 있는 숲꾸미기 파일이 아니에요.');
 const items=legacyItems(raw.items);
 return {version:2,terrain:{id:'flat-v1',rev:TERRAINS['flat-v1'].rev},mission:raw.mission,title:str(raw.title,30),intention:str(raw.intention,120),reason:str(raw.reason,120),tags:Array.isArray(raw.tags)?raw.tags.filter(t=>TAGS.includes(t)).slice(0,7):[],items,before:raw.before===null||raw.before===undefined?null:{items:legacyItems(raw.before),pose:{...LEGACY_POSE}},walk:null,tutorial:Number.isInteger(raw.tutorial)?Math.max(0,Math.min(3,raw.tutorial)):3,intro:true};
}
// v2 items must pass the same grounding/footprint/support rules as a live placement, so every
// confirmed placement reloads and nothing floats or straddles silently. (v1 migration is separate.)
function itemsV2(a,terrain){
 if(!Array.isArray(a)||a.length>LIMIT)err(`재료는 최대 ${LIMIT}개까지 불러올 수 있어요.`);const ids=new Set();
 const out=a.map(o=>{if(!o||typeof o!=='object'||typeof o.id!=='string'||o.id.length>80||ids.has(o.id)||typeof o.kind!=='string'||!byId.has(o.kind))err('배치 정보가 올바르지 않아요. 기존 작품은 그대로 두었어요.');ids.add(o.id);
  num(o.x,-BOUND.hx,BOUND.hx);num(o.z,-BOUND.hz,BOUND.hz);
  const scale=num(o.scale,.6,1.6),rotation=normRot(num(o.rotation,-1e6,1e6));
  const group=o.group===null||o.group===undefined?null:str(o.group,80),on=o.on===null||o.on===undefined?null:str(o.on,80);
  return {id:o.id,kind:o.kind,x:o.x,z:o.z,scale,rotation,group,on};});
 if(terrain==='flat-v1'){
  // Legacy flat works: the original game allowed any overlap (e.g. a tree and a deck on one spot). Those
  // works must reopen unchanged on every reload, so only bounds, ids and declared support links are checked.
  for(const it of out){if(!insideSite(it.x,it.z,1))err('배치 정보가 올바르지 않아요. 기존 작품은 그대로 두었어요.');if(!it.on)continue;const deck=out.find(d=>d.id===it.on);const m=material(it.kind);
   if(!deck||material(deck.kind).base!=='deck'||!m.onDeck||m.base!=='rigid'||!footSamples(it,m.foot).every(s=>inFoot(deck,material(deck.kind).foot,s.x,s.z,.05)))err('데크 위 배치 정보가 올바르지 않아요. 기존 작품은 그대로 두었어요.');}
  return out;
 }
 for(const it of out){const r=evaluate(out,it,terrain);if(!r.ok)err('배치 정보가 지형과 맞지 않아요. 기존 작품은 그대로 두었어요.');if((r.on??null)!==(it.on??null))err('데크 위 배치 정보가 올바르지 않아요. 기존 작품은 그대로 두었어요.');}
 return out;
}
function poseV2(p){if(!p||typeof p!=='object')err('사진 정보가 올바르지 않아요.');return {x:num(p.x,-200,200),y:num(p.y,-20,60),z:num(p.z,-200,200),yaw:num(p.yaw,-1e6,1e6),pitch:num(p.pitch,-1.6,1.6),fov:num(p.fov,20,120),aspect:num(p.aspect,.3,4)};}
export function validate(raw){
 if(raw&&raw.version===1)return migrateV1(raw);
 if(!raw||typeof raw!=='object'||raw.version!==2||!raw.terrain||typeof raw.terrain!=='object'||typeof raw.terrain.id!=='string'||!Object.hasOwn(TERRAINS,raw.terrain.id)||!Number.isInteger(raw.mission)||raw.mission<0||raw.mission>2)err('이 버전에서 열 수 있는 숲꾸미기 파일이 아니에요.');
 const terrain={id:raw.terrain.id,rev:TERRAINS[raw.terrain.id].rev};
 if(!Number.isInteger(raw.terrain.rev)||raw.terrain.rev!==terrain.rev)err('지형 정보가 달라요. 기존 작품은 그대로 두었어요.');
 const items=itemsV2(raw.items,terrain.id);
 let before=null;if(raw.before!==null&&raw.before!==undefined){if(typeof raw.before!=='object')err('사진 정보가 올바르지 않아요.');before={items:itemsV2(raw.before.items,terrain.id),pose:poseV2(raw.before.pose)};}
 let walk=null;if(raw.walk!==null&&raw.walk!==undefined){if(typeof raw.walk!=='object')err('산책 위치가 올바르지 않아요.');walk={x:num(raw.walk.x,-BOUND.hx,BOUND.hx),z:num(raw.walk.z,-BOUND.hz,BOUND.hz),yaw:num(raw.walk.yaw,-1e6,1e6),pitch:num(raw.walk.pitch,-1.6,1.6)};if(!insideSite(walk.x,walk.z,1))err('산책 위치가 올바르지 않아요.');}
 return {version:2,terrain,mission:raw.mission,title:str(raw.title,30),intention:str(raw.intention,120),reason:str(raw.reason,120),tags:Array.isArray(raw.tags)?raw.tags.filter(t=>TAGS.includes(t)).slice(0,7):[],items,before,walk,tutorial:Number.isInteger(raw.tutorial)?Math.max(0,Math.min(3,raw.tutorial)):3,intro:raw.intro===true};
}
export function parse(text){if(new TextEncoder().encode(text).length>2*1024*1024)err('2MB 이하의 작품 파일을 골라 주세요.');return validate(JSON.parse(text));}
export class History{constructor(){this.states=[];}push(s){this.states.push(clone(s));if(this.states.length>20)this.states.shift();}undo(){return this.states.pop();}}
export function observe(items){
 const lavender=items.filter(x=>x.kind==='lavender'),poppies=items.filter(x=>x.kind==='poppy');
 for(const a of lavender)for(const b of poppies)if(Math.hypot(a.x-b.x,a.z-b.z)<1.8)return '보라색 라벤더 옆에 살구색 꽃을 놓았네요. 어떤 색이 먼저 보이나요?';
 const groups=new Map();for(const it of items)if(!it.group){if(!groups.has(it.kind))groups.set(it.kind,[]);groups.get(it.kind).push(it);}
 for(const m of MATERIALS){const a=groups.get(m.id);if(a?.length>=3&&a.some(p=>{let n=0;for(const q of a)if((Math.abs(q.x-p.x)<.5||Math.abs(q.z-p.z)<.5)&&++n>=3)return true;return false;}))return `같은 ${m.name}를 세 번 이상 줄지어 놓았네요. 간격을 바꾸면 어떨까요?`;}
 if(items.some(a=>a.kind==='bench'&&items.some(b=>material(b.kind)?.drawer==='tree'&&Math.hypot(a.x-b.x,a.z-b.z)<2)))return '벤치 가까이에 키 큰 나무가 있어요. 안에서 바라보면 어떤 모습일까요?';
 if(items.length&&!items.some(x=>x.z>4))return '입구 가까이에 빈 공간을 남겼네요. 이 여백을 어떻게 쓰고 싶나요?';
 if(!items.length)return '빈터를 걸어 본 느낌은 어땠나요? 누구를 위한 자리를 먼저 만들까요?';
 return '높이와 색, 재료 사이의 간격을 살펴보세요. 시선이 어디에 머무나요?';
}
// Sample work on the rolling clearing: a path up to the hill, a resting corner, flowers in the hollow.
export function sample(){const a=[];const add=(k,x,z,s=1,r=0,g=null)=>{const c=item(k,x,z,s,r,g);a.push(c);return c;};
 add('oak',-6.5,-7,1.2);add('birch',6.8,-1.5,1.2);add('birch',-7.5,2.2,.85);add('pine',7.5,-9,1);add('maple',-2,-9.5,1);add('cherry',4,6,1);add('willow',-6,6.5,1.1);
 add('bench',5.5,-6,1,-.5);add('lantern',4.3,-5.2,1);add('pavilion',-5.5,-3.5,1,.3);add('logseat',-2.5,-8.5,1);
 for(let i=0;i<7;i++)add('stonepath',-1.2+Math.sin(i*.7)*.9,8-i*1.3,1,i*.5);
 for(let i=0;i<4;i++)add('soilpath',2.2+i*.9,-2.2-i*.95,1,-.8);
 add('pond',1.35,4.35,1,.2);add('reeds',-.3,3.6,1,0,'reed-a');add('reeds',2.9,3.3,1,1,'reed-a');add('reeds',2.9,5.6,.85,2,'reed-a');
 for(const [x,z,k] of [[-3.5,4.5,'hydrangea'],[-4.5,3.3,'hydrangea'],[3.8,-2.5,'azalea'],[2.6,-4.2,'boxwood']])add(k,x,z);
 const fl=['lavender','daisy','poppy','cosmos','tulip'];for(let i=0;i<10;i++)add(fl[i%5],-2.5+Math.cos(i*1.26)*1.3,-.5+Math.sin(i*1.26)*1.1,.85,i*.9,'fl-'+(i%2));
 add('rock',-7.5,-1,1);add('rock',7,3,.85);add('signpost',1.2,8.2,1,.4);add('birdhouse',-6,-6,1);add('compost',-6.5,7.6,1);add('rainbarrel',-5.4,8.2,1);
 return a;
}
