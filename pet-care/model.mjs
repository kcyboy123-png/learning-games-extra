import {petById} from './pets.mjs';
import {validateHealth} from './health.mjs?v=hospital-20261122';
export const KEY='pet-bond-20261116-v1', DAY=86400000, PHOTO_LIMIT=350000;
export const cleanName=s=>String(s??'').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,12);
export function createPet(name,t=Date.now()){return {v:1,variant:'puppy',name:cleanName(name)||'모아',adoptedAt:t,seenAt:t,affection:0,lastBondAt:0,toys:{ball:0,bone:0},memories:[],photos:[],restUntil:0,care:{water:0,food:0,brush:0,touch:0},sound:false,music:true,weather:'auto',bond:{lastToy:null,lastEnding:null,discoveryAttemptDay:0,discoveryAttempts:0,discoveryAt:0,discoveryDay:0,days:[],plays:0,invitations:0,spot:.55,toy:null,toyX:.73,last:'',touches:{head:0,chin:0,back:0},calmMs:{head:0,chin:0,back:0},experiences:[]}};}
export function experience(s,key){if(!s.bond.experiences.includes(key))s.bond.experiences.push(key);}
export function playEnding(s,toy=favorite(s),random=Math.random){const choices=['return','tease','nest'];if(s.bond.plays>=3&&['rest','food','brush'].includes(s.bond.last))choices.push('nest','nest');if(s.toys[toy]>0&&toy===favorite(s))choices.push('tease');if(bondStage(s)>=2)choices.push('return');const available=choices.filter(k=>k!==s.bond.lastEnding);return available[Math.min(available.length-1,Math.max(0,Math.floor(random()*available.length)))];}
export function companionPlace(s){return [.64,.59,.54,.5][bondStage(s)];}
export function playMemory(species,ending){return ending==='tease'?({dog:'장난감을 놓았다가 다시 물고 장난쳤어요',cat:'앞발로 장난감을 톡 밀며 장난쳤어요',pig:'코로 장난감을 밀며 장난쳤어요'}[species]):ending==='nest'?'좋아하는 자리에 장난감을 놓고 나를 기다렸어요':'장난감을 내 앞에 돌려주었어요';}
export function touchPart(y){return y<.43?'head':y<.65?'chin':'back';}
export function age(s,t=Date.now()){return Math.max(0,Math.max(t,s.seenAt)-s.adoptedAt)/DAY;}
export function day(s,t=Date.now()){return Math.floor(age(s,t))+1;}
export function canEndRest(s,t=Date.now()){
 const hour=new Date(t).getHours();
 return t<s.restUntil&&hour>=7&&hour<22;
}
export function asleep(s,t=Date.now()){const h=new Date(t).getHours();return t<s.restUntil||((h>=22||h<7)&&t-s.adoptedAt>600000);}
export function favorite(s){return s.toys.bone>s.toys.ball?'bone':'ball';}
export function remember(s,text,t=Date.now()){if(!s.memories.some(m=>m.text===text&&m.day===day(s,t)))s.memories.push({text,day:day(s,t),at:t});s.memories=keepMemories(s.memories);}
export function interact(s,type,t=Date.now()){s.seenAt=Math.max(s.seenAt,t);const d=day(s,t);s.bond.days??=[];if(!s.bond.days.includes(d)&&s.bond.days.length<30)s.bond.days.push(d);if(t-s.lastBondAt>=60000){s.affection=Math.min(100,s.affection+1);s.lastBondAt=t;}if(type==='ball'||type==='bone')s.toys[type]=Math.min(100000,s.toys[type]+1);}
export function validate(raw,t=Date.now()){
 if(!raw||raw.v!==1||!cleanName(raw.name))throw Error('이 게임의 기록 파일이 아니에요.');
 const finite=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 if(!finite(raw.adoptedAt,1577836800000,t+DAY)||!finite(raw.seenAt,raw.adoptedAt,t+DAY))throw Error('기록의 날짜를 확인해 주세요.');
 const s=createPet(raw.name,raw.adoptedAt);s.seenAt=raw.seenAt;s.variant=petById(raw.variant).id;
 s.affection=finite(raw.affection,0,100)?raw.affection:0;s.lastBondAt=finite(raw.lastBondAt,0,t+DAY)?raw.lastBondAt:0;
 for(const k of ['ball','bone'])s.toys[k]=finite(raw.toys?.[k],0,100000)?Math.floor(raw.toys[k]):0;
 s.restUntil=finite(raw.restUntil,0,t+DAY)?raw.restUntil:0;
 for(const k of ['water','food','brush','touch'])s.care[k]=finite(raw.care?.[k],0,t+DAY)?raw.care[k]:0;
 s.sound=raw.sound===true;s.music=raw.music!==false;s.weather=['auto','rain','clear'].includes(raw.weather)?raw.weather:'auto';
 const b=raw.bond;
 s.bond.discoveryDay=finite(b?.discoveryDay,0,day(s,t))?Math.floor(b.discoveryDay):0;
 s.bond.discoveryAttemptDay=finite(b?.discoveryAttemptDay,0,day(s,t))?Math.floor(b.discoveryAttemptDay):0;
 s.bond.discoveryAttempts=finite(b?.discoveryAttempts,0,2)?Math.floor(b.discoveryAttempts):0;
 s.bond.discoveryAt=finite(b?.discoveryAt,0,t+DAY)?b.discoveryAt:0;
 s.bond.lastEnding=['return','tease','nest'].includes(b?.lastEnding)?b.lastEnding:null;
 for(const k of ['plays','invitations'])s.bond[k]=finite(b?.[k],0,100000)?Math.floor(b[k]):0;
 for(const k of ['head','chin','back'])s.bond.touches[k]=finite(b?.touches?.[k],0,100000)?Math.floor(b.touches[k]):0;
 for(const k of ['head','chin','back'])s.bond.calmMs[k]=finite(b?.calmMs?.[k],0,100000000)?b.calmMs[k]:b?.calmMs?0:Math.min(100000000,s.bond.touches[k]*900);
 s.bond.spot=finite(b?.spot,.3,.7)?b.spot:.55;s.bond.toyX=finite(b?.toyX,.24,.76)?b.toyX:.73;
 s.bond.toy=['ball','bone'].includes(b?.toy)?b.toy:null;
 s.bond.lastToy=['ball','bone'].includes(b?.lastToy)?b.lastToy:b?.last==='play'&&s.bond.toy&&s.toys[s.bond.toy]>0?s.bond.toy:null;
 s.bond.last=['play','water','food','brush','rest','window','touch'].includes(b?.last)?b.last:'';
 s.bond.experiences=[...new Set((Array.isArray(b?.experiences)?b.experiences:[]).filter(k=>['return','tease','nest','head','chin','back','name','rest','window','waterAfterPlay','brushAfterFood'].includes(k)))];
 s.memories=keepMemories((Array.isArray(raw.memories)?raw.memories:[]).slice(0,1000).filter(m=>m&&typeof m.text==='string'&&finite(m.at,0,t+DAY)&&finite(m.day,1,100000)).map(m=>({text:m.text.slice(0,100),day:Math.floor(m.day),at:m.at}))); 
 const days=Array.isArray(b?.days)?b.days:s.affection>0?s.memories.map(m=>m.day):[];s.bond.days=[...new Set(days.filter(d=>Number.isInteger(d)&&d>=1&&d<=day(s,t)))].sort((a,b)=>a-b).slice(0,30);
 s.photos=(Array.isArray(raw.photos)?raw.photos:[]).slice(0,12).filter(p=>p&&typeof p.url==='string'&&/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(p.url)&&p.url.length<=PHOTO_LIMIT&&finite(p.at,0,t+DAY)).map(p=>({url:p.url,at:p.at}));
 if(raw.health!=null)s.health=validateHealth(raw.health);
 return s;
}
// Invitations survive petting; only actual invitations consume the schedule.
export function inviteReady({now,next,lastInput,busy,blocked,sleeping}){return now>=next&&now-lastInput>=8000&&!busy&&!blocked&&!sleeping;}


export function familiarTouch(s,part){return (s.bond.calmMs?.[part]??s.bond.touches[part]*900)>=2400;}
export function creditTouch(s,samples){let changed=false;for(const part of ['head','chin','back']){const ms=samples?.[part];if(!Number.isFinite(ms)||ms<500)continue;s.bond.calmMs[part]=Math.min(100000000,s.bond.calmMs[part]+Math.min(3000,ms));s.bond.touches[part]=Math.min(100000,s.bond.touches[part]+1);experience(s,part);changed=true;}if(changed){interact(s,'touch');s.bond.last='touch';}return changed;}

export function keepMemories(items){if(items.length<=120)return items;const protectedItems=new Set([items[0],items.find(m=>m.text==='우리의 첫 30일, 앞으로도 함께해요')].filter(Boolean));const recent=items.filter(m=>!protectedItems.has(m)).slice(-(120-protectedItems.size));const kept=new Set([...protectedItems,...recent]);return items.filter(m=>kept.has(m));}

export function sleepReady(s,action,t=Date.now()){return asleep(s,t)&&!(action&&['play','water','food','brush','touch','name','hide','found','peek','hello'].includes(action.kind)&&t<action.until);}
export function playChoice(x,inside){return inside?'tease':x>=.6?'nest':'return';}

// Stages never decay during absence; existing actions remain available at every stage.
export function bondStage(s){const b=s.bond,calm=b.calmMs.head+b.calmMs.chin+b.calmMs.back,days=b.days?.length??0;if(days>=7&&s.affection>=18&&b.plays>=5&&calm>=15000)return 3;if(days>=3&&s.affection>=8&&b.plays>=2&&calm>=6000)return 2;return s.affection>=2&&b.experiences.length>=2&&calm>=2400?1:0;}
export function preferredPart(s){let part='head';for(const p of ['chin','back'])if(s.bond.calmMs[p]>s.bond.calmMs[part])part=p;return part;}
export function playBondPose(s){const stage=bondStage(s);return stage>=2?{head:8,chin:9,back:10}[preferredPart(s)]:stage===1?8:11;}
// Game care indicators, not real animal feeding or health recommendations.
export function careGauge(s,kind,t=Date.now()){const span=(kind==='brush'?24:12)*3600000,last=s.care[kind]||s.adoptedAt;return Math.round(Math.max(20,100-Math.max(0,Math.max(t,s.seenAt)-last)/span*80));}
export function reunionMemory(s,t=Date.now()){if(t-s.seenAt<60000||asleep(s,t))return null;if(['rest','window'].includes(s.bond.last)&&s.bond.experiences.includes(s.bond.last))return {kind:s.bond.last};if(s.bond.last==='play'&&(s.toys.ball||s.toys.bone))return {kind:'toy',toy:s.bond.lastToy&&s.toys[s.bond.lastToy]>0?s.bond.lastToy:favorite(s)};const part=preferredPart(s);if(s.bond.calmMs[part]>=2400)return {kind:'touch',part};if(s.toys.ball||s.toys.bone)return {kind:'toy',toy:favorite(s)};return null;}

export function lifeMoment(s,t=Date.now()){const stage=bondStage(s),today=day(s,t);if(!stage||asleep(s,t)||s.bond.discoveryDay===today||(s.bond.discoveryAttemptDay===today&&(s.bond.discoveryAttempts>=2||t-s.bond.discoveryAt<180000)))return null;const choices=['window'];if(stage>=2&&(s.toys.ball||s.toys.bone))choices.push('toy');if(stage>=3)choices.push('beside');return choices[(today+petById(s.variant).id.length)%choices.length];}

