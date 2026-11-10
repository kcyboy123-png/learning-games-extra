import {PLAY_SPEED} from './data.mjs?v=perf1';
export const ecoGuideDue=s=>s.cozyV===1&&!s.ecoGuideSeen&&!s.paused&&!s.ended&&s.t>=600*PLAY_SPEED;
export function ecoGuideHTML(v){
 const caps=[40,15,15,30],tips=['태양광 설비를 길에 연결해 부족한 전력을 채워 주세요. 전력이 이미 충분하면 더 지어도 이 점수는 오르지 않아요.','주민 수에 맞춰 꽃밭과 나무 정원을 늘리고 길 가까이에 놓아 주세요.','건물을 눌러 단열·차양·재사용 자재 중 첫 개선을 해 주세요. 한 건물에 모두 적용하기보다 아직 개선하지 않은 건물을 챙겨요.','집 가까이에 꽃·나무·벤치를 골고루 놓고 원래의 자연 조경도 남겨 주세요.'];
 const worst=v.environmentParts.map((n,i)=>n/caps[i]).indexOf(Math.min(...v.environmentParts.map((n,i)=>n/caps[i])));
 return `<p>친환경은 <b>현재 ${v.environment}점</b>이에요. 건물 개선만으로는 만점이 되지 않아요!</p><p><b>지금 해 볼 일</b><br>${tips[worst]}</p><ul>${['전력','녹지','건물 설계','조경'].map((name,i)=>`<li><b>${name} ${v.environmentParts[i].toFixed(1)} / ${caps[i]}점</b><br>${tips[i]}</li>`).join('')}</ul><p>공장 가동 감점: <b>−${v.factoryPollution||0}점</b>. 공장은 돈을 빨리 벌지만 환경 부담이 있어요. 공장을 눌러 휴업하면 수입과 공장 감점이 함께 멈춰요.</p><p>메뉴 → 도움말 → <b>친환경 점수 올리는 방법</b>에서 언제든 다시 볼 수 있어요.</p>`;
}
