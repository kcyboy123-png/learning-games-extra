// Examples never write notes or change the child's composition.
const phrases=[
 [[64,2],[64,2],[67,4]],[[69,1],[67,1],[64,2],[64,4]],
 [[65,2],[69,2],[69,4]],[[69,2],[65,2],[62,2],[null,2]],
 [[64,2],[67,2],[67,4]],[[69,1],[64,1],[64,2],[69,4]],
 [[65,2],[62,2],[71,4]],[[67,2],[64,2],[60,4]]
];
const names={60:'도',62:'레',64:'미',65:'파',67:'솔',69:'라',71:'시'};
const length=ticks=>ticks===1?'반 박':`${ticks/2}박`;
export function carolGuide(song,bar,{remaining=8,editing=false}={}){
 if(song.progression!=='christmas-carol'||!Number.isInteger(bar)||bar<0||bar>7)return null;
 const events=phrases[bar],pitches=[...new Set(events.map(e=>e[0]).filter(p=>p!==null))];
 if(editing)return {pitches,text:'고른 음표를 고치는 중이에요.',instruction:'건반으로 음을 바꾸거나 길이를 고쳐요. 새 음을 넣으려면 ‘수정 끝’을 눌러요.'};
 if(remaining<=0)return {pitches,text:'한 마디를 완성했어요!',instruction:'들어 보고 다음 마디로 이어 가거나, 음표를 눌러 고쳐 보세요.'};
 if(remaining<8){const ticks=remaining>=4?4:remaining>=2?2:1,pitch=events[0][0];return {pitches,text:`${length(remaining)} 남았어요 · 다음 음 예시: ${names[pitch]} ${length(ticks)}`,instruction:`‘${length(ticks)}’을 고르고 ${names[pitch]} 건반을 눌러요. 다른 음이나 쉼표도 좋아요.`,events:[[pitch,ticks]]};}
 return {pitches,events,text:'한 마디 예시: '+events.map(([pitch,ticks])=>`${pitch===null?'쉼표':names[pitch]} ${length(ticks)}`).join(' → '),instruction:'각 음 앞에서 표시된 길이를 고른 뒤 건반을 눌러요. 쉼표는 ‘＋ 쉼표 넣기’를 눌러요. 다른 음과 리듬으로 바꿔도 좋아요.'};
}
