import {OPTIONS,upgradeError} from './core.mjs?v=expansion2';

export const UPGRADE_LOOKS={ins:'두꺼운 초록 창틀',shade:'초록 줄무늬 차양',reuse:'재사용 목재 화단'};
const BENEFITS={ins:'겨울·여름에 이 건물 전력 25% 절약',shade:'여름에 이 건물 전력 20% 절약',reuse:'친환경 설계와 재사용 약속에 반영'};
export function upgradeCards(s,b){
 return Object.entries(OPTIONS).map(([key,o])=>{
  const done=b.opts.includes(key),error=upgradeError(s,b.id,key),short=Math.ceil(o.cost-s.money);
  const label=done?'적용 완료':b.opts.length>=2?'2개 선택 완료':s.paused||s.ended?'재개 후 가능':b.progress<1?'완공 후 가능':short>0?`${short} 더 필요`:`${o.cost} 사용 · 적용`;
  const benefit=key==='reuse'&&b.type==='fire'?'재사용 약속에 반영':BENEFITS[key];
  return `<button class="upgrade-choice${done?' applied':''}" data-opt="${key}" ${error?'disabled':''}><span class="upgrade-icon" aria-hidden="true">${key==='ins'?'▣':key==='shade'?'☂':'♻'}</span><span class="upgrade-copy"><strong>${o.name}</strong><span>${s.cozyV===1?UPGRADE_LOOKS[key]:benefit}</span><small>${s.cozyV===1?"마을 모습이 달라져요":"모습: "+UPGRADE_LOOKS[key]}</small></span><b class="upgrade-price">${label}</b></button>`;
 }).join('');
}
