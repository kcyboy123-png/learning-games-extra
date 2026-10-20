(function(root){
'use strict';
const names=['솔루미','그린엘','루나벨','피오라','아스트리온'];
const keys=['sun','forest','ice','harbor','stars'];
const descriptions=['태양 씨앗을 품은 작은 빛의 용. 열두 친구의 마음이 모여 깨어났어요.','안개 숲의 길을 지키는 비취 기린. 뿔의 등불이 잃어버린 길을 밝혀요.','얼음꽃 꼬리에 오로라를 담은 여우. 차가운 유적에도 따뜻한 마음을 전해요.','바다와 노을을 함께 품은 불사조. 날갯짓마다 새로운 항로가 열려요.','별자리의 기억을 지키는 은하의 용. 함께 찾은 해답을 별빛으로 간직해요.'];
const grade=root.ThinkstarGrade||5;
const missions=(root.ThinkstarMythicData?.[grade]||[]).map(m=>({...m,mythic:true,edition:'grade'+grade,grades:[grade],difficulty:'mythic',category:'신화의 시험',family:'pattern',color:'violet',friend:60+m.region,friendName:names[m.region],friendDesc:descriptions[m.region],art:'assets/mythic/'+keys[m.region]+'.webp',skill:'여러 단서를 연결하고 가능한 경우를 차근차근 확인해요.',prereq:'이 지대의 친구 12명과 함께 쌓은 생각의 힘',summary:m.summary||'조건을 하나씩 확인하고, 찾은 답이 모든 조건을 만족하는지 다시 검토했어요.'}));
function progress(m,catalog,passed){const regular=catalog.filter(c=>!c.mythic&&(c.region||0)===(m.region||0));const done=regular.filter(c=>passed(c.id)).length;return {done,total:regular.length,open:regular.length===12&&done===12};}
root.ThinkstarMythic={missions,progress};
// Keep the regular 60-entry catalog intact for map placement and region gates.
if(root.ThinkstarGradeReady)root.DrawerMissions=[...root.DrawerMissions,...missions];
})(globalThis);
