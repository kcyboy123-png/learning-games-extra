'use strict';
// v21: the single source of the 왕실 관측소 (mission 5) grading rule, shared by the live renderer (v2-missions.js) and the
// save restore below. Exactly two distinct tools; all required tools present and, where a choice exists, one of them.
// Request 0, clear day after rain (rain amount + time): 측우기 + 앙부일구 or 측우기 + 자격루.
// Request 1, cloudy day without sun (rain amount + time): 측우기 + 자격루 only.
// Request 2, night (movement of the heavens + time): 혼천의 + 자격루 only, so every pair with 앙부일구 at night is wrong.
window.JOSEON_OBSERVATORY={
 rules:[{need:['rain'],any:['sun','water']},{need:['rain','water'],any:[]},{need:['sky','water'],any:[]}],
 fits(stage,tools){const r=window.JOSEON_OBSERVATORY.rules[stage];return !!r&&Array.isArray(tools)&&tools.length===2&&new Set(tools).size===2&&r.need.every(k=>tools.includes(k))&&(!r.any.length||r.any.some(k=>tools.includes(k)));}
};
// Keep only known values when a local save or user-selected save file is restored.
// v21: `done` tells whether this mission is already in the save's done list. Drafts of completed missions are kept as they
// are (core, score and record stay untouched); only an unfinished observatory draft may lose a core flag it did not earn.
window.JOSEON_SAVE_DRAFT=(m,x,done=false)=>{
 const out={play:{},core:x.core===true,hintUsed:x.hintUsed===true},src=x.play&&typeof x.play==='object'?x.play:{},p=out.play;
 if(m.id===8&&src.educationRev!==11){
  const remap=n=>n===4?3:n;
  for(const k of ['matched','leftOrder','rightOrder'])if(Array.isArray(src[k]))src[k]=src[k].filter(n=>n!==3).map(remap);
  if(src.left===3)delete src.left;else if(Number.isInteger(src.left))src.left=remap(src.left);
 }
 if(m.id===8)p.educationRev=11;
 const num=(k,min,max)=>{if(Number.isInteger(src[k])&&src[k]>=min&&src[k]<=max)p[k]=src[k];};
 const choice=(k,values)=>{if(values.includes(src[k]))p[k]=src[k];};
 const ints=(k,min,max,limit=max-min+1)=>{if(Array.isArray(src[k]))p[k]=[...new Set(src[k].filter(n=>Number.isInteger(n)&&n>=min&&n<=max))].slice(0,limit);};
 const text=s=>typeof s==='string'&&s.length<200&&!/[<>]/.test(s);
 const texts=(k,limit=50)=>{if(Array.isArray(src[k]))p[k]=src[k].filter(text).slice(0,limit);};
 const mapping=(k,maxKey,maxValue)=>{if(src[k]&&typeof src[k]==='object'&&!Array.isArray(src[k])){p[k]={};for(let i=0;i<=maxKey;i++)if(Number.isInteger(src[k][i])&&src[k][i]>=0&&src[k][i]<=maxValue)p[k][i]=src[k][i];}};
 const order=(k,n)=>{if(Array.isArray(src[k])&&src[k].length===n&&new Set(src[k]).size===n&&src[k].every(i=>Number.isInteger(i)&&i>=0&&i<n))p[k]=src[k];};
 if(Array.isArray(x.answerOrder)&&x.answerOrder.length===4&&new Set(x.answerOrder).size===4&&x.answerOrder.every(i=>Number.isInteger(i)&&i>=0&&i<4))out.answerOrder=x.answerOrder;
 if(text(x.choice))out.choice=x.choice;if(Number.isInteger(x.checkStep)&&x.checkStep>=0&&x.checkStep<=(m.extraChecks||[]).length)out.checkStep=x.checkStep;
 num('confirmChoice',0,3);choice('confirmStage',['palace:0','palace:1','palace:2','status:0','status:1','status:2','status:3','meaning']);
 switch(m.type){
 case'origin':p.entered=src.entered===true;p.villageViewed=src.villageViewed===true;ints('found',0,5);ints('answered',0,2);num('place',0,2);num('chosen',0,3);choice('stage',['map','record','founding']);for(let i=0;i<3;i++)order('order'+i,4);p.answered=(p.answered||[]).filter(i=>p.found?.includes(i*2)&&p.found?.includes(i*2+1));if(['record','founding'].includes(p.stage)&&p.answered.length!==3)p.stage='map';break;
 case'evidence':ints('selected',0,m.cards.length-1);order('order',m.cards.length);break;
 case'story-match':m={...m,pairs:[0,1,2]};
 case'match':if(m.id===28){p.tradeMeaning=src.tradeMeaning===true;p.tradeDebrief=src.tradeDebrief===true;}ints('matched',0,m.pairs.length-1);num('left',0,m.pairs.length-1);order('leftOrder',m.pairs.length);order('rightOrder',m.pairs.length);break;
 case'observe':ints('found',0,m.spots.length-1);break;
 case'tools':{const raw=Array.isArray(src.tools)?src.tools:[],picked=[...new Set(raw.filter(s=>['rain','water','sun','sky'].includes(s)))];num('stage',0,2);p.tools=picked.slice(0,2);texts('plans',3);
  // v21: an in-progress "관측 성공" survives only when the saved request is a real stage (0-2) and the saved list is exactly
  // two distinct known tools that fit that request (rule shared with v2-missions.js). The check runs on the original values,
  // before any trimming, so a 3-tool list or an out-of-range stage cannot be reduced into a pass. An older build could store
  // 밤 + 혼천의/앙부일구 as observed; that pair is dropped so the tools are chosen again, with a short note at render time.
  // Scores, penalties and completed missions live outside this draft and are not changed.
  const stageOk=Number.isInteger(src.stage)&&src.stage>=0&&src.stage<=2;
  p.observed=src.observed===true&&stageOk&&raw.length===2&&picked.length===2&&window.JOSEON_OBSERVATORY.fits(src.stage,picked);
  if(src.observed===true&&!p.observed){p.tools=[];p.redo=true;}
  // v21: core (the "all three requests done, go to the record" flag read by app.js openMission) is only trustworthy for an
  // unfinished mission when the draft really holds a valid success on the last request (stage 2). A night 혼천의+앙부일구
  // success from an older build, a draft already normalised to observed:false, or a core set after a single stage 0 request
  // would otherwise skip tool selection entirely. Dropping the flag sends the player back to picking tools for the current
  // request only, with the short note at render time and no penalty. Missions already in done keep their core unchanged.
  if(!done&&out.core&&!(p.stage===2&&p.observed)){out.core=false;if(!p.observed){p.tools=[];p.redo=true;}}break;}
 case'letters':num('stage',0,1);if(Array.isArray(src.letters))p.letters=src.letters.filter(s=>['ㄹ','ㅁ','ㅂ','ㅏ','ㅜ','ㄴ'].includes(s)).slice(0,3);break;
 case'trial':p.intro=src.intro===true;num('case',0,2);break;
 case'sort':mapping('groups',m.items.length-1,m.groups.length-1);order('sortOrder',m.items.length);break;
 case'route':num('attempts',0,10000);num('pos',0,48);if([1,2,3,5,8,12,15,16,19,23,26,30,33,37,38].includes(p.pos))delete p.pos;num('steps',0,100000);ints('trail',0,48,49);if(Array.isArray(src.visited))p.visited=[...new Set(src.visited.filter(n=>n===10||n===35))];break;
 case'battle':ints('ready',0,2);num('attempt',0,10000);break;
 case'winter':num('winterAcknowledged',1,2);p.intro=src.intro===true;num('phase',0,3);ints('read',0,1);if(Array.isArray(src.stock)&&src.stock.length===4&&src.stock.every(n=>Number.isInteger(n)&&n>=0&&n<=12)&&src.stock.reduce((a,b)=>a+b,0)<=[12,10,8,8][p.phase||0])p.stock=src.stock;break;
 case'palace':num('step',0,2);break;
 case'hangul':num('stage',0,3);if(Array.isArray(src.letters))p.letters=src.letters.filter(v=>['ㅁ','ㅜ','ㄹ','ㅂ','ㅏ','ㄴ'].includes(v)).slice(0,3);break;
 case'statuses':order('statusPositions11',4);order('statusLabels11',4);num('stage',0,3);p.revealed=src.revealed===true;order('statusOrder',4);break;
 case'crop-orders':num('stage',0,2);ints('chosen',0,3,2);break;
 case'painting-clues':ints('selected',0,3);p.zoom=src.zoom===true;break;
 case'street':num('stage',0,2);break;
 case'farm':num('selected',0,3);mapping('fields',3,3);order('farmOrder',4);break;
 case'crops':if(Array.isArray(src.plots))p.plots=src.plots.slice(0,3).map(n=>Number.isInteger(n)&&n>=0&&n<4?n:null);break;
 case'trade':if(src.bag&&['money','beans','rice','cloth','herb'].every(k=>Number.isInteger(src.bag[k])&&src.bag[k]>=0&&src.bag[k]<100001))p.bag=Object.fromEntries(['money','beans','rice','cloth','herb'].map(k=>[k,src.bag[k]]));texts('log',200);break;
 case'proposal':ints('solved',0,2,2);for(const k of ['issue','evidence','method'])num(k,0,2);order('evOrder',3);order('metOrder',3);break;
 case'story':ints('sequence',0,2);choice('style',['차분히 읽어 주기','인물의 목소리로 들려주기','그림을 보여 주며 말하기']);order('storyOrder',3);break;
 case'painting':ints('found',0,2);break;
 case'folk':num('family',0,2);choice('picture',['books','fortune','long']);texts('gifts',3);break;
 case'performance':num('performanceStep',0,2);ints('cast',0,2);num('line',0,2);order('lineOrder',3);break;
 case'debate':ints('read',0,1);choice('stance',['새 문물을 통한 발전','나라의 안전과 보호']);break;
 case'network':num('selected',0,3);mapping('links',3,3);order('networkOrder',4);break;
 case'newspaper':ints('articles',0,4,3);break;
 }
 return out;
};
