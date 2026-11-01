import {moveActor} from './lib/movement.mjs';
export const LENGTH=200, SPEED=1.3;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const valleyX=s=>Math.sin(s*.035)*6+Math.sin(s*.075)*1.8;
export const pathX=s=>{const t=clamp((s-100)/45,0,1);return valleyX(s)+8*Math.tanh((s-62)/7)*(1-t*t*(3-2*t));};
export const pathSlope=s=>(pathX(s+.01)-pathX(s-.01))/.02;
// Quiet shelves at the bird, bridge and wildlife stops separate the climbs.
const heights=[[-10,-1.5],[0,0],[18,3.2],[30,4],[54,11.5],[70,12.5],[84,16.5],[98,17.2],[127,29],[144,30.2],[185,48],[194,50],[210,50]];
export function elevation(s){
  if(s<=heights[0][0])return heights[0][1]*.72;
  for(let i=1;i<heights.length;i++)if(s<=heights[i][0]){
    const [a,h]=heights[i-1],[b,k]=heights[i],t=(s-a)/(b-a);
    return (h+(k-h)*t*t*(3-2*t))*.72;
  }
  return heights.at(-1)[1]*.72;
}
export const grade=s=>(elevation(s+.1)-elevation(s-.1))/.2;
export const riverX=s=>valleyX(s)+1.2*Math.sin((s-62)*.075);
export const halfWidth=s=>s>56&&s<68?1.12:2.35;
export function terrain(x,s){
  const base=elevation(s), d=Math.abs(x-pathX(s)), river=Math.abs(x-riverX(s));
  const side=x-pathX(s),rise=clamp((s-98)/45,0,1),outside=Math.max(0,d-4);
  const hills=outside*.035+Math.sin(x*.19+s*.045)*.27*Math.min(1,Math.max(0,d-3)/3);
  const mountain=rise*(side<0?Math.min(12,outside*.7):-Math.min(24,outside*.85));
  // Keep the stream bed below its water when the mountain shoulder begins to rise.
  const stream=clamp((118-s)/12,0,1),bank=Math.exp(-Math.pow(river/3.8,4))*stream;
  return base+(hills+mountain)*(1-bank)-1.4*Math.exp(-Math.pow(river/2.2,4))*stream-clamp((s-207)/22,0,1)*48;
}
export function worldAt(s,offset=0){return {x:pathX(s)+offset,y:elevation(s)+.09,z:-s};}
export function advance(state,input,dt){
  const x=clamp(Number(input.x)||0,-1,1), y=clamp(Number(input.y)||0,-1,1);
  const outward=Math.sign(x)===Math.sign(state.x)&&Math.abs(state.x)>halfWidth(state.y)-.5;
  const edge=outward?clamp((halfWidth(state.y)-Math.abs(state.x))/.5,.2,1):1;
  const result=moveActor(state,{x,y},dt,SPEED*(outward&&Math.abs(x)>Math.abs(y)?edge:1),
    (lateral,s)=>s>=0&&s<=LENGTH&&Math.abs(lateral)<=halfWidth(s));
  // shortcut: route-relative movement keeps young players on the trail; use terrain navigation for a free-roaming map.
  return result;
}
export function place(s){return s<48?'햇살 오르막':s<75?'계곡 나무다리':s<101?'물소리 쉼터':s<144?'다람쥐 산허리':s<192?'하늘 능선':'바람봉 정상';}
export const stops=[
  {s:24,r:8,name:'새소리 듣기',text:'잠깐 멈춰 봐요. 나뭇가지에서 새가 노래해요.'},
  {s:62,r:7,name:'다리 아래 물길 보기',text:'난간 안에서 잠깐 멈춰 봐요. 바위 사이로 물이 흘러가요.'},
  {s:91,r:10,name:'물소리 듣기',text:'서두르지 않아도 괜찮아요. 물이 흐르는 쪽을 바라봐요.'},
  {s:136,r:10,name:'다람쥐 기다리기',text:'가만히 있으면 다람쥐가 조심조심 다가와요.'},
  {s:198,r:8,name:'정상 풍경 보기',text:'발아래로 숲이 펼쳐져요. 여기까지 함께 올라왔어요.'}
];
export function nearby(s){return stops.find(p=>Math.abs(p.s-s)<p.r)||null;}
