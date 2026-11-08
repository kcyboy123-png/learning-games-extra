import {cliffSites,fixedTypes,baseTrailCells,trailSet,gardenTypes,freePlot,gardenSites,plotSurface} from './dokdo-terrain.mjs';
// Coastal building pockets leave the volcanic ridgelines untouched.
export const DOKDO_VERSION=1;
export const dokdoLand=(x,y)=>(x>=3&&x<=7&&y>=10&&y<=14)||(x>=12&&x<=16&&y>=9&&y<=14);
export const dokdoBridge=(x,y)=>y===12&&x>=8&&x<=11;
// Preserve acceptance of every formerly valid saved plot after coastline refinement.
const legacyLand=new Set(["2,7","2,8","2,9","2,10","3,1","3,2","3,3","3,4","3,5","3,6","3,7","3,8","3,9","3,10","3,11","3,12","3,13","4,3","4,4","4,5","4,6","4,7","4,8","4,9","4,10","4,11","4,12","4,13","5,7","5,8","5,9","5,10","5,11","5,12","6,8","12,5","12,6","12,7","12,8","12,9","13,2","13,3","13,4","13,5","13,6","13,7","13,8","13,9","13,10","13,11","13,12","14,4","14,5","14,6","14,7","14,8","14,9","14,10","14,11","14,12","15,5","15,6","15,7","15,8","15,9","15,10","15,11","15,12","16,4","16,5","16,6","16,7","16,8","16,9","16,10","16,11","16,12","17,4","17,7","17,8","17,9","17,10"]);
export const dokdoWalk=(x,y)=>trailSet.has(`${x},${y}`)||freePlot(x,y)||legacyLand.has(x+','+y)||dokdoLand(x,y)||dokdoBridge(x,y)||(x>=2&&x<18&&y>=0&&y<18&&plotSurface(x,y).low>0);
export const DOKDO_SITES=cliffSites;
export const DOKDO_FREE=new Set(gardenTypes);
export function dokdoPlacement(s,type,x,y,ignoreId=0){
 if(!DOKDO_SITES[type]&&!DOKDO_FREE.has(type))return '독도에서는 표시된 전용 자리에 시설을 지어요. 산책로는 그대로 이용해요.';
 if(!DOKDO_SITES[type]&&!freePlot(x,y))return '바다·산책로·실제 시설 자리는 비워 두어요. 빛나는 빈 부지를 눌러 주세요.';
 if(DOKDO_SITES[type]&&!DOKDO_SITES[type].some(p=>p[0]===x&&p[1]===y))return '표시된 시설 자리 중 한 곳을 골라 주세요.';
 if((fixedTypes.has(type)||type==='dokdoFlag')&&s.buildings.some(b=>b.type===type&&b.id!==ignoreId))return '이 특별한 시설은 독도에 한 곳만 만들어요.';
 return '';
}
export function seedDokdo(s){
 const r={pop:0,buildings:[],landscape:{version:1,cleared:[]}};
 for(const [x,y]of new Map(baseTrailCells.map(p=>[p.join(','),p])).values())r.buildings.push({id:s.nextId++,type:x===11&&y===12?'bridge':'road',x,y,opts:[],progress:1,starter:true,completedAt:s.t});
 return r;
}
// Caller must durably back up the full save BEFORE committing this replacement.
export function migrateDokdo(s){
 if(s.dokdoV===DOKDO_VERSION)return alignFacilities(s);
 if(s.island==='mist'&&s.otherIsland){const old={pop:s.pop,buildings:s.buildings,landscape:s.landscape};Object.assign(s,s.otherIsland);s.otherIsland=old;s.island='main';}
 if(s.otherIsland){
  if(!Number.isSafeInteger(s.nextId)||s.nextId>Number.MAX_SAFE_INTEGER-32)throw Error('시설 번호를 확인해 주세요.');
  const old=s.otherIsland;
  const refund=old.buildings.reduce((n,b)=>n+(!b.starter&&Number.isSafeInteger(b.paidCost)?b.paidCost:0),0);
  if(s.money+refund>1e8)throw Error('환급 기금 한도를 확인해 주세요. 원본을 유지합니다.');s.money+=refund;s.pop+=old.pop;
  s.dokdoRefund=refund;s.otherIsland=seedDokdo(s);
 }
 s.dokdoV=DOKDO_VERSION;alignFacilities(s);
 return true;
}

// Plan all moves before applying; caller backs up and validates the entire save atomically.
export function alignFacilities(s){
 const region=s.island==='mist'?s:s.otherIsland;if(!region)return false;
 const moves=region.buildings.filter(b=>fixedTypes.has(b.type)&&!cliffSites[b.type].some(([x,y])=>x===b.x&&y===b.y));if(!moves.length)return false;
 const target=new Set(moves.map(b=>cliffSites[b.type][0].join(','))),displaced=region.buildings.filter(b=>!fixedTypes.has(b.type)&&target.has(`${b.x},${b.y}`));
 const affected=new Set([...moves,...displaced]),used=new Set(region.buildings.filter(b=>!affected.has(b)).map(b=>`${b.x},${b.y}`));
 const plan=moves.map(b=>({b,x:cliffSites[b.type][0][0],y:cliffSites[b.type][0][1]}));for(const p of plan)used.add(`${p.x},${p.y}`);
 for(const b of displaced){const candidates=gardenSites.filter(([x,y])=>!used.has(`${x},${y}`)).sort((a,c)=>Math.hypot(a[0]-b.x,a[1]-b.y)-Math.hypot(c[0]-b.x,c[1]-b.y));if(!candidates.length)throw Error('시설을 안전하게 옮길 공간이 없어요. 원본 저장을 유지합니다.');const [x,y]=candidates[0];plan.push({b,x,y});used.add(`${x},${y}`);}
 for(const {b,x,y}of plan){b.x=x;b.y=y;}return true;
}
