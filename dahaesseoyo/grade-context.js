(function(root){
'use strict';
const selected=Number(new URLSearchParams(root.location.search).get('grade'));
root.ThinkstarGrade=[3,4,5,6].includes(selected)?selected:5;
root.ThinkstarShowGrades=![3,4,5,6].includes(selected);
root.ThinkstarTeacherPreview=false;
try{root.ThinkstarTeacherPreview=root.sessionStorage.getItem('thinkstar-teacher-preview')==='1';}catch{}
root.ThinkstarKey=key=>(root.ThinkstarTeacherPreview?'teacher-preview-':'')+(root.ThinkstarGrade===5?key:key+'-grade'+root.ThinkstarGrade);
root.ThinkstarGate=(catalog,passed)=>{const meadow=catalog.filter(m=>(m.region||0)===0),current=meadow.filter(m=>passed(m.id)).length,need=Math.ceil(meadow.length*.7),old=Math.max(...['gateRegion','previousEntryRegion','premiumPreviousRegion'].map(key=>catalog.filter(m=>(m[key]??m.region??0)===0&&passed(m.id)).length)),keptOpen=current<need&&old>=need;return {done:keptOpen?old:current,need,total:meadow.length,keptOpen,open:root.ThinkstarTeacherPreview||meadow.length>0&&(current>=need||keptOpen)};};
})(globalThis);
