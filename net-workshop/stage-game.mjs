
export const STAGE_KEY='net-workshop-stages-v1';
export const STAGES=[
 {id:'basics',limit:180,cutoffs:[32,48,65,90,125,180]},
 {id:'opposite',limit:300,cutoffs:[65,90,120,165,225,300]},
 {id:'vertex',limit:420,cutoffs:[95,130,180,240,320,420]},
 {id:'edge',limit:480,cutoffs:[110,155,205,280,365,480]},
 {id:'valid',limit:540,cutoffs:[125,175,235,320,410,540]},
 {id:'complete',limit:660,cutoffs:[160,220,300,400,500,660]},
 {id:'length',limit:840,cutoffs:[210,290,390,520,650,840]},
 {id:'build',limit:960,cutoffs:[270,360,480,640,780,960]}
];
export const TIERS=['챌린저','마스터','다이아','플래티넘','골드','실버','브론즈'];
export const TIER_COLORS=['#f5d58b','#c4b1ec','#a4ccfa','#8dcfc6','#e8c080','#c5d0dc','#c69b76'];
export function stageTier(index,elapsedMs,wrong=0,assisted=false){
 if(!STAGES[index]||!Number.isFinite(elapsedMs)||elapsedMs<0||!Number.isInteger(wrong)||wrong<0)throw new RangeError('Invalid stage result');
 const seconds=elapsedMs/1000+wrong*10;
 let tier=STAGES[index].cutoffs.findIndex(t=>seconds<=t);
 if(tier<0)tier=6;
 if(tier===0&&(wrong>0||assisted))tier=1;
 return {tier,name:TIERS[tier],seconds,remaining:Math.max(0,STAGES[index].limit-seconds)};
}
export function readStages(raw){
 try{const value=JSON.parse(raw);if(value?.version!==1||!Array.isArray(value.results))return Array(8).fill(null);
 return Array.from({length:8},(_,i)=>{const r=value.results[i];return r&&r.complete===true&&(r.legacy===true||Number.isInteger(r.tier)&&r.tier>=0&&r.tier<=6&&Number.isFinite(r.seconds)&&r.seconds>=0)?{complete:true,legacy:r.legacy===true,tier:r.legacy?null:r.tier,seconds:r.legacy?null:r.seconds}:null;});
 }catch{return Array(8).fill(null);}
}
export function stageOpen(results,index){return Number.isInteger(index)&&index>=0&&index<8&&results.slice(0,index).length===index&&results.slice(0,index).every(r=>r?.complete===true);}
export function mergeStage(old,rank){
 if(old?.complete&&!old.legacy&&(old.tier<rank.tier||old.tier===rank.tier&&old.seconds<=rank.seconds))return old;
 return {complete:true,tier:rank.tier,seconds:rank.seconds,legacy:false};
}
export function stageRecordMessage(previous,rank){
 if(!previous?.complete)return '첫 완주!';
 if(previous.legacy)return '첫 시간 기록!';
 if(rank.tier<previous.tier||rank.tier===previous.tier&&rank.seconds<previous.seconds)return '새 최고 기록!';
 if(rank.tier===previous.tier&&rank.seconds===previous.seconds)return '최고 기록과 같아요';
 return previous.tier<rank.tier?'최고 '+TIERS[previous.tier]+' 유지':'최고 기록 유지';
}
