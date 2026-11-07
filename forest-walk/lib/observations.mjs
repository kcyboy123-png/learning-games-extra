// Memories belong to this walk only; revisiting a place replaces its memory. Nothing is marked as missed.
// `duration` is the length of the scene's reaction (bird turns, leaf drifts, squirrel climbs) in seconds; the recommended
// time to stay in each section lives in trail.mjs `sections[].rest` and is guidance only.
// A choice with `after` is a follow-up: it is offered only once the named look has been completed at that place
// (availableChoices), so the creek leaf can be followed only after it was floated. `result` is the line shown once a
// summit action has finished (otherwise the card shows its stay suggestion).
export const observations = {
  30: {mark:'wave', single:true, choices:[
    {id:'wave',label:'손 흔들기',hint:'친구도 손을 흔들어 인사해요. 오늘 함께 걸어요.',memory:'숲 입구에서 손 흔들어 인사한 친구',duration:2.5}]},
  115: {mark:'bird', choices:[
    {id:'listen',label:'귀 기울이기',hint:'가지 위에서 짹짹, 새가 노래해요.',memory:'가지 위에서 노래하던 작은 새',duration:2.5},
    {id:'watch',label:'새 바라보기',hint:'작은 새가 고개를 돌려 숲을 둘러봐요.',memory:'고개를 갸웃하던 작은 새',duration:2.5}]},
  210: {mark:'water', choices:[
    {id:'leaf',label:'나뭇잎 띄우기',hint:'노란 잎이 다리 아래에서 나와 물길을 따라 흘러가요.',memory:'다리에서 띄운 노란 잎',duration:4},
    {id:'follow',label:'잎 따라가 보기',after:'leaf',hint:'시냇물을 따라 잎을 쫓아가요. 바위에 살짝 걸렸다가, 다시 굽이 쪽으로 흘러가요.',memory:'다리에서 띄우고 시냇물 따라 끝까지 지켜본 노란 잎',duration:5}]},
  362: {mark:'water', choices:[
    {id:'sit',label:'자리에 앉기',hint:'앉아서 쉬어요. 졸졸, 바위 사이로 물이 흘러요.',memory:'쉼터에 앉아 듣던 물소리',duration:3},
    {id:'falls',label:'폭포 바라보기',hint:'쏴아, 저 위에서 폭포가 쏟아져요. 물보라가 피어오르고, 햇살에 작은 무지개가 걸려요.',memory:'쉼터 폭포의 물보라에 걸린 작은 무지개',duration:5}]},
  475: {mark:'squirrel', choices:[
    {id:'wait',label:'조용히 기다리기',hint:'거리를 두고 기다려요. 수풀이 흔들리고 다람쥐가 고개를 들어요.',memory:'조용히 기다리자 고개를 든 다람쥐',duration:4},
    {id:'space',label:'멀리서 지켜보기',hint:'다가가지 않고 봐요. 다람쥐가 꼬리를 세우고 나무 위로 올라가요.',memory:'멀리서 바라본, 나무를 오르던 다람쥐',duration:4}]},
  578: {mark:'valley', choices:[
    {id:'lookback',label:'계곡 쪽 보기',hint:'바람 속에서 뒤돌아봐요. 걸어온 다람쥐 숲과 쉼터 계곡이 저 아래로 이어져요.',memory:'전망대에서 내려다본 지나온 계곡',duration:3},
    {id:'ahead',label:'정상 쪽 보기',hint:'고개를 들어 봐요. 다음 고개 길가에 바람봉으로 가는 노란 길잡이 깃발이 서 있어요. 정상은 그 너머예요.',memory:'전망대에서 올려다본 바람봉 가는 길잡이 깃발',duration:3}]},
  712: {mark:'mountain', choices:[
    {id:'view',label:'걸어온 숲 바라보기',hint:'나무 사이로 걸어온 숲길이 내려다보여요.',memory:'발아래 넓게 펼쳐진 숲',duration:2},
    {id:'group',label:'다 같이 사진 찍기',hint:'선생님과 친구가 곁으로 와서 나란히 서요. 손을 흔들어요!',memory:'정상에서 선생님·친구들과 함께 찍은 사진',result:'찰칵! 선생님, 친구들과 함께 찍었어요. 사진 저장을 누르면 이 장면을 남겨요.',duration:3.5}]}
};
// The creek flows downstream past the bridge (the shelter is upstream), so the leaf question only offers places downstream or imagined.
// After the scene has reacted, each place asks one light question. There is no right answer and nothing has to be
// chosen; a chosen line is attached to that place's memory ("· 잎은 바다까지 갈 거예요") and shown on the summit card.
export const reflections = {
  30: {prompt:'오늘 산책, 어떤 마음으로 출발할까요?',options:[
    {id:'excited',label:'설레요',note:'설레는 마음으로 출발'},{id:'easy',label:'느긋하게',note:'느긋한 마음으로 출발'},{id:'curious',label:'궁금해요',note:'궁금한 마음으로 출발'}]},
  115: {prompt:'새는 무엇을 하는 것 같았어요?',options:[
    {id:'sing',label:'노래해요',note:'새는 노래하는 중이었어요'},{id:'call',label:'친구를 불러요',note:'새는 친구를 부르고 있었어요'},{id:'look',label:'숲을 살펴요',note:'새는 숲을 살피고 있었어요'}]},
  210: {prompt:'띄운 잎은 어디까지 갈까요?',options:[
    {id:'bend',label:'굽이 너머로',note:'잎은 굽이 너머로 갈 거예요'},{id:'sea',label:'바다까지',note:'잎은 바다까지 갈 거예요'},{id:'rock',label:'바위에서 잠깐 쉬어요',note:'잎은 바위에서 잠깐 쉴 거예요'}]},
  362: {prompt:'여기까지 오며 마음에 남은 풍경은?',options:[
    {id:'sunlit',label:'햇살 숲',note:'마음에 남은 풍경은 햇살 숲'},{id:'bridge',label:'계곡 다리',note:'마음에 남은 풍경은 계곡 다리'},{id:'falls',label:'쉼터 폭포',note:'마음에 남은 풍경은 쉼터 폭포'}]},
  475: {prompt:'다람쥐를 볼 때 나는?',options:[
    {id:'quiet',label:'조용히 바라봤어요',note:'조용히 바라보며 지켜봤어요'},{id:'still',label:'가만히 있었어요',note:'가만히 서서 지켜봤어요'},{id:'smile',label:'살짝 웃었어요',note:'살짝 웃으며 지켜봤어요'}]},
  578: {prompt:'전망대에서 바라보니 어때요?',options:[
    {id:'far',label:'멀리 왔어요',note:'정말 멀리 왔다고 느꼈어요'},{id:'wind',label:'바람이 시원해요',note:'바람이 시원했어요'},{id:'up',label:'정상이 궁금해요',note:'정상이 궁금해졌어요'}]},
  712: {prompt:'오늘 산책은 어땠어요?',options:[
    {id:'fresh',label:'시원했어요',note:'오늘은 시원했어요'},{id:'proud',label:'뿌듯해요',note:'오늘은 뿌듯했어요'},{id:'calm',label:'조용해서 좋았어요',note:'오늘은 조용해서 좋았어요'}]}
};
export function beginObservation(spot,id){
  const choice=observations[spot]?.choices.find(item=>item.id===id);
  return choice?{spot,...choice,elapsed:0,done:false,note:null}:null;
}
// Choices the card may offer right now: follow-ups (`after`) appear once that look (or the follow-up itself) is the memory here.
export const availableChoices=(spot,memories)=>(observations[spot]?.choices||[]).filter(c=>!c.after||[c.after,c.id].includes(memories.get(spot)?.choiceId));
// Completing the look stores the memory. A line chosen earlier at this place (this visit or a previous one) stays with it;
// nothing is written that the child did not pick.
export function advanceObservation(active,dt,memories){
  if(!active||active.done||!Number.isFinite(dt)||dt<=0)return false;
  active.elapsed=Math.min(active.duration,active.elapsed+dt);
  if(active.elapsed<active.duration)return false;
  active.done=true;const previous=memories.get(active.spot),note=active.note||(previous?.noteId?{id:previous.noteId,note:previous.note}:null);
  memories.set(active.spot,{mark:observations[active.spot].mark,text:active.memory,choiceId:active.id,...(note?{noteId:note.id,note:note.note}:{})});
  return true;
}
// Picks (or changes) the one-line answer for the place being looked at. Applied at once when the memory already exists,
// otherwise it waits for the look to complete; walking away before that discards it together with the unfinished look.
export function reflect(active,optionId,memories){
  const option=active&&reflections[active.spot]?.options.find(item=>item.id===optionId);
  if(!option)return false;
  active.note={id:option.id,note:option.note};
  const memory=memories.get(active.spot);
  if(!memory)return false;
  memory.noteId=option.id;memory.note=option.note;return true;
}
export const chosenNote=(active,memories)=>active?.note?.id??memories.get(active?.spot)?.noteId??null;
export const memoryLine=entry=>entry.note?entry.text+' · '+entry.note:entry.text;
// Line for the summit card once an action there has finished (its own `result`, or the fallback the app passes in).
export const resultText=(active,fallback='')=>active?.done&&active.result?active.result:fallback;
