import {TIER_REASONS,CASH_STRESS_LIMIT} from './core.mjs?v=economy3';
import {realSeconds} from './data.mjs?v=80min1';
import {villagePromises} from './promises.mjs?v=economy3';

export function gradeNote(r){return r&&Number.isFinite(r.rawTotal)&&r.rawTotal>r.total&&Array.isArray(r.reasons)&&r.reasons.every(k=>Object.hasOwn(TIER_REASONS,k))?`<p class="dim"><b>원점수 ${r.rawTotal} → 평가점수 ${r.total}</b><br>${r.reasons.map(k=>TIER_REASONS[k]).join('<br>')}</p>`:'';}
export function tierRules(s){return s.scoringV===2?'<p class="dim"><b>새 마을의 상위 티어 조건</b><br>다이아: 생활 서비스 각각 80% · 전력 90% 이상.<br>이모탈: 생활 서비스 각각 90% · 전력 98% 이상.<br>레디언트: 생활 서비스 각각 100% · 전력 100%.<br>평가가 시작된 서비스만 확인해요. 6번째 달부터 다이아 이상은 소방서·배수 시설도 운영해야 해요.<br>기금 고갈·운영비 부족이 누적 3개월이면 최대 799점이에요. 월 순수입을 0 이상으로 만들거나 한 달 적자분을 마련하면 해제돼요. 잠깐의 텃밭 수입은 부족 시간만 멈춰요.<br>조건을 회복하면 현재 평가는 다시 올라가요. 확정한 연차·최종 기록은 보존해요.</p>':'<p class="dim">이 작품은 이전 평가 규칙을 유지해요. 새 상위 티어 조건은 새로 시작한 마을부터 적용해요.</p>';}
export function developmentSummary(s){const late=villagePromises(s).filter(p=>p.unlockIndex>=12);return late.length?`후반 발전 약속 ${late.filter(p=>p.done).length}/${late.length} 달성 · 운영 티어와 별도로 확인해요.`:'후반 발전 약속은 2년 차부터 열려요. 운영 티어와 별도로 확인해요.';}
export function shortageNote(s){return s.mode==='free'?'자유 꾸미기에서는 부족 시간을 더 쌓지 않아요. 최종 기록은 보존돼요.':s.scoringV===2?`운영비 부족 누적 ${Math.round(realSeconds(s.cashStress))} / ${realSeconds(CASH_STRESS_LIMIT)}초 · 흑자 회복 또는 한 달 적자분 확보 시 해제`:'';}
