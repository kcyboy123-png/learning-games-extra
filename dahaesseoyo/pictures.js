(function(root){
'use strict';
const esc=DrawerActivities.esc;
function render(id,q,index){
 if(id==='cs-library-space')return `<figure class="lesson-picture"><img src="assets/library-rooms.png" alt="왼쪽은 혼자 읽는 아이, 가운데는 책 이야기를 나누는 아이들, 오른쪽은 책갈피를 만드는 아이들"><figcaption class="room-labels"><span><b>ㄱ 조용한 방</b>소리 없이 혼자 읽기</span><span><b>ㄴ 이야기 방</b>작은 소리로 함께 이야기</span><span><b>ㄷ 만들기 방</b>도구를 사용해 만들기</span></figcaption></figure>`;
 if(id==='cs-weather')return `<div class="weather-cards" aria-label="같은 장소 오후 2시 가상 관측 기록">${[['월','☀',20,0],['화','☀',22,0],['수','☂',18,8]].map(([day,icon,t,r])=>`<div><b>${day}요일</b><span aria-hidden="true">${icon}</span><strong>${t}℃</strong><small>비 ${r}mm</small></div>`).join('')}</div>`;
 if(id==='cs-budget-bundle')return `<div class="price-pictures">${[['✎','연필',300],['▰','지우개',500],['▤','공책',700]].map(([icon,name,price])=>`<span><i aria-hidden="true">${icon}</i><b>${name}</b>${price}원</span>`).join('')}</div>`;
 if(id==='cs-garden-int')return '<figure class="fence-picture"><svg viewBox="0 0 360 150" role="img" aria-label="직사각형의 네 변을 모두 더한 둘레가 20m입니다. 가로와 세로는 아직 정하지 않았습니다."><rect x="80" y="30" width="200" height="80" rx="4" fill="#e4f2cb" stroke="#a97950" stroke-width="6" stroke-dasharray="8 3"/><text x="180" y="21" text-anchor="middle">가로 ? m</text><text x="290" y="75">세로 ? m</text><text x="180" y="78" text-anchor="middle">울타리 전체 20m</text><text x="180" y="142" text-anchor="middle">모양 예시 · 실제 비율이 아니에요</text></svg></figure>';
 if(id==='cs-fraction-snack'&&q.type!=='combo')return `<figure class="snack-diagram"><figcaption>전체 간식판 · 같은 크기의 12칸</figcaption><div>${Array.from({length:12},()=>'<i></i>').join('')}</div><small>조각이 차지하는 칸 수를 전체 12칸과 비교해요.</small></figure>`;
 if(id==='cs-cipher-table')return '<div class="machine-picture" aria-label="넣은 수에 일정한 수를 곱하고 일정한 수를 더해 나온 수가 됩니다"><span>넣은 수</span><b>→</b><strong>× ?<br>＋ ?</strong><b>→</b><span>나온 수</span></div>';
 if(id==='cs-truth-clue'&&q.statements)return `<div class="witness-pictures">${q.statements.map((s,i)=>`<div><span aria-hidden="true">${['☁','≈','♧'][i]}</span><b>${esc(s.who)}</b><p>“${esc(s.text)}”</p></div>`).join('')}</div>`;
 return '';
}
root.ThinkstarPictures={render};
})(globalThis);
