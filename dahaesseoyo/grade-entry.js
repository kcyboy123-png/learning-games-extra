(function(root){
'use strict';
const original=root.DrawerGrade5Catalog;
root.ThinkstarGradeCatalogs={...root.ThinkstarGradeCatalogs,5:original};
const grade=root.ThinkstarGrade||5,catalog=root.ThinkstarGradeCatalogs[grade];
root.ThinkstarGradeReady=Array.isArray(catalog)&&catalog.length===60;
if(root.ThinkstarGradeReady){root.DrawerMissions=catalog;root.DrawerGrade5Catalog=catalog;}
root.ThinkstarGradeScreen=()=>{
const copy={3:['첫 발견의 설렘','수와 모양, 관찰과 짧은 이야기'],4:['생각의 날개를 펼쳐요','도형과 자료, 생활 속 단서 찾기'],5:['단서를 이어 모험해요','수의 관계, 실험과 논리 탐구'],6:['나만의 해답을 찾아요','비율과 공간, 여러 근거로 판단하기']};
return `<main class="grade-entry"><p class="creator-credit"><img src="assets/changyong-profile-v2.jpg" width="48" height="48" alt="창용쌤 용 로고"><span>창용쌤 제작</span></p><h1>다했어요! 모험도감</h1><p class="grade-intro">${root.ThinkstarTeacherPreview?'교사용 미리보기 · 모든 지대가 열려 있어요.':'어느 세계에서 친구를 만날까요?'}</p><div class="grade-cards">${[3,4,5,6].map((g,i)=>{const ready=root.ThinkstarGradeCatalogs[g]?.length===60;let own=0;try{const key=(root.ThinkstarTeacherPreview?'teacher-preview-':'')+'thinkstar-passes-v1'+(g===5?'':'-grade'+g),records=JSON.parse(localStorage.getItem(key)||'{}').missions||{};own=(root.ThinkstarGradeCatalogs[g]||[]).filter(m=>records[m.id]?.count>0).length;}catch{}return `<a class="grade-card grade-${g}" ${ready?`href="?grade=${g}"`:'aria-disabled="true"'}><span class="grade-number">${g}<small>학년 탐험</small></span><img class="grade-world-preview" src="assets/maps-v4/${root.ThinkstarEntryWorlds?.[g]?.image||'meadow'}.webp" alt="${root.ThinkstarEntryWorlds?.[g]?.name||'첫 탐험 지대'}"><strong class="grade-world-name">${root.ThinkstarEntryWorlds?.[g]?.name||'첫 탐험'}</strong><h2>${copy[g][0]}</h2><p>${copy[g][1]}</p><span class="grade-progress">${ready?`내 친구 ${own}/60`:'문항 준비 중'}</span><b class="grade-go">${ready?'탐험 시작 →':'곧 만나요'}</b></a>`;}).join('')}</div><p class="grade-note">학년마다 다른 도전 · 친구와 기록은 학년별로 저장돼요.<br>첫 지대에서 12명 중 9명을 만나면 새로운 지대가 열려요.</p></main>`;
};
})(globalThis);
