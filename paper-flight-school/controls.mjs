import {cleanLaunch,cleanDesign} from './physics.mjs?v=20261120-quality6';
export const GAUGE_HALF_MS=1600, MIN_CHARGE_MS=300;
export function gaugePower(elapsed){
  if(!Number.isFinite(elapsed)||elapsed<0)return 0;
  const cycle=(elapsed/GAUGE_HALF_MS)%2;
  return Math.round((cycle<=1?cycle:2-cycle)*100);
}
export function launchFromGauge(launch,elapsed){
  if(!Number.isFinite(elapsed)||elapsed<MIN_CHARGE_MS)return null;
  return cleanLaunch({...launch,power:gaugePower(elapsed),method:'gauge'});
}
export function designChanges(before,after){
  const a=cleanDesign(before),b=cleanDesign(after),names={type:'기본 모양',paperGsm:'종이 무게',fold:'날개 폭',tip:'끝 접는 길이',tipDirection:'끝 접는 방향',tipAngle:'끝 접는 각도',elevator:'뒤쪽 각도',clipCount:'클립 개수',clipPosition:'클립 위치'};
  return Object.keys(names).filter(k=>a[k]!==b[k]&&!(k==='clipPosition'&&!a.clip&&!b.clip)&&!(['tipDirection','tipAngle'].includes(k)&&a.tip===0&&b.tip===0)).map(k=>names[k]);
}
export const missionDesignReady=(mission,design)=>mission?.id!=='fold'||designChanges({},design).length>0;
