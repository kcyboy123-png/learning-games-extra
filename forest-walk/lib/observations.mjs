// Memories belong to this walk only; revisiting a place replaces its memory.
export const observations = {
  24: {mark:'bird', choices:[
    {id:'listen',label:'귀 기울이기',hint:'가지 위에서 짹짹, 새가 노래해요.',memory:'가지 위에서 노래하던 작은 새',duration:2.5},
    {id:'watch',label:'새 바라보기',hint:'작은 새가 고개를 돌려 숲을 둘러봐요.',memory:'고개를 갸웃하던 작은 새',duration:2.5}]},
  62: {mark:'water', choices:[
    {id:'leaf',label:'흐르는 잎 따라 보기',hint:'물 위의 노란 잎이 흐름을 따라 내려가요.',memory:'물길을 따라 흘러가던 노란 잎',duration:3},
    {id:'ripples',label:'물결 살펴보기',hint:'동그란 물결이 겹쳤다가 퍼져 나가요.',memory:'다리 아래 겹쳐지던 물결',duration:3}]},
  91: {mark:'water', choices:[
    {id:'listen',label:'물소리에 귀 기울이기',hint:'졸졸, 바위 사이로 물이 흘러요.',memory:'바위 사이로 흐르던 물소리',duration:3}]},
  136: {mark:'squirrel', choices:[
    {id:'wait',label:'조용히 기다리기',hint:'거리를 두고 기다려요. 다람쥐가 고개를 들어요.',memory:'조용히 기다리자 고개를 든 다람쥐',duration:4},
    {id:'space',label:'멀리서 지켜보기',hint:'다가가지 않고 봐요. 다람쥐가 열매를 살펴봐요.',memory:'멀리서 바라본 다람쥐의 작은 앞발',duration:4}]},
  198: {mark:'mountain', choices:[
    {id:'view',label:'걸어온 숲 바라보기',hint:'나무 사이로 걸어온 숲길이 내려다보여요.',memory:'발아래 넓게 펼쳐진 숲',duration:2}]}
};
export function beginObservation(spot,id){
  const choice=observations[spot]?.choices.find(item=>item.id===id);
  return choice?{spot,...choice,elapsed:0,done:false}:null;
}
export function advanceObservation(active,dt,memories){
  if(!active||active.done||!Number.isFinite(dt)||dt<=0)return false;
  active.elapsed=Math.min(active.duration,active.elapsed+dt);
  if(active.elapsed<active.duration)return false;
  active.done=true;memories.set(active.spot,{mark:observations[active.spot].mark,text:active.memory});
  return true;
}
