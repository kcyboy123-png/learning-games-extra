import {moveActor} from './lib/movement.mjs';
// Full course: gate → sunlit forest → creek bridge → fork → shelter → squirrel forest → ridge → summit.
// 720 m at 1.56 m/s is about 7.7 minutes of straight walking: that straight walk
// plus `rest`, the recommended seconds to stay in each section looking, choosing and resting (346 s in all).
// lib/course.mjs turns walk + rest into the teacher timetable; nothing here is a timer, a score or a forced stop.
export const LENGTH=720, SPEED=1.56;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(s,a,b)=>{const t=clamp((s-a)/(b-a),0,1);return t*t*(3-2*t);};
export const sections=[
  {id:'gate',name:'숲 입구',from:0,to:70,rest:30,guide:'걷기와 둘러보기를 익히고, 먼저 온 친구에게 손 흔들어 인사해요.'},
  {id:'sunlit',name:'햇살 숲',from:70,to:160,rest:40,guide:'잠깐 멈춰 새소리를 듣고, 가지 위의 새가 무엇을 하는지 지켜봐요.'},
  {id:'creek',name:'계곡 나무다리',from:160,to:250,rest:40,guide:'다리 위에서 잎을 하나 띄우고, 시냇물을 따라 어디까지 가는지 따라가 봐요.'},
  {id:'fork',name:'두 갈래 숲길',from:250,to:340,rest:20,guide:'꽃길과 고사리길 중 마음에 드는 쪽으로. 어느 쪽이든 같은 쉼터에서 만나요.'},
  {id:'shelter',name:'물소리 쉼터',from:340,to:430,rest:75,guide:'자리에 앉아 물소리를 듣고, 저 위 폭포의 물보라와 무지개를 바라봐요.'},
  {id:'squirrel',name:'다람쥐 숲',from:430,to:520,rest:45,guide:'흔들리는 수풀에서 거리를 두고 조용히 기다리면 다람쥐가 나타나요.'},
  {id:'ridge',name:'하늘 능선',from:520,to:640,rest:36,guide:'전망대에서 바람을 느끼며, 지나온 계곡 쪽과 올라갈 정상 쪽을 번갈아 바라봐요.'},
  {id:'summit',name:'바람봉 정상',from:640,to:LENGTH,rest:60,guide:'전망 자리에서 풍경을 보고, 선생님·친구들과 단체 사진을 찍어요.'}
];
export const BRIDGE={from:204,to:216,center:210};
// The four named scenic places of the 15-minute course (world.mjs builds the visible object, app.mjs frames it):
// creek 시냇물 = the bridge leaf stop, waterfall 폭포 = a ledge on the creek above the shelter (seen from the shelter stop),
// lookout 전망대 = the ridge rock, summit 정상 = the deck. `stop` is the observation stop from which each is used.
export const SCENIC={creek:{s:BRIDGE.center,stop:BRIDGE.center},waterfall:{s:382,stop:362},lookout:{s:578,stop:578},summit:{s:717,stop:712}};
export const RIVER={start:60,end:455};
// Fork: two real lanes around a planted island. Left lane is the flower lane, right lane the fern lane.
export const FORK={from:262,to:326,gap:2.1,width:3.9};
export const SUMMIT={from:700,platform:712,rail:LENGTH};
// Rock outcrops on the mountain side of the ridge/summit (right of the trail): [s, distance from the trail, radius, height].
// terrain() raises a flat-topped knob at each one and world.mjs gathers its boulders there. None is closer than 9 m
// to the trail, so the walkable band, the summit deck (|offset| <= 4.4) and the camera clamp are never touched.
export const OUTCROPS=[[548,13,4.5,1.6],[571,21,6,2.6],[602,9.5,3.2,1.1],[633,17,5,2.2],[662,12,4,1.5],[689,24,6.5,3],[706,11,3.5,1.2]];
export const outcrop=(d,s)=>{let h=0;for(const [os,od,r,oh] of OUTCROPS){const q=Math.hypot((s-os)*.9,d-od)/r;if(q<1.8)h+=oh*Math.exp(-q*q*q)*(1+.18*Math.sin(s*1.3+d*.9));}return h;};
// Mountain-side profile (distance d from the trail, 0 inside 4 m): a slope whose steepness drifts along the ridge, a soft
// knee instead of the old hard 14 m shelf, cross-slope relief (gullies and spurs) from 5 m out, the outcrops, and a crest
// line that sags and bulges with s so the skyline is not one smooth dome. Everything is 0 for d <= 4 (and tiny until ~6 m).
export function mountainSide(d,s,x){
  const k=Math.max(0,d-4),steep=.62+.14*Math.sin(s*.023+1.3),knee=14+3*Math.sin(s*.041);
  const a=k*steep,soft=3,profile=a<knee-soft?a:a>knee+soft?knee+(a-knee)*.38:a-(1-.38)*Math.pow(a-knee+soft,2)/(4*soft);
  const relief=clamp((d-5)/9,0,1)*(1.1*Math.sin(s*.13+x*.05)*Math.cos(x*.11-s*.04)+.55*Math.sin(x*.31+s*.21)+.3*Math.sin(x*.9-s*.5))
    +clamp((d-8)/14,0,1)*1.6*Math.pow(Math.sin(s*.08+2),2);
  const crest=clamp((d-30)/22,0,1)*(2.4*Math.sin(s*.057+x*.02)+1.3*Math.sin(s*.19+2.2));
  return profile+relief+crest+outcrop(d,s);
}
// A gentle 74 m meander through the squirrel forest and the ridge (430–640) so the long climb is not one straight tunnel.
// It lives in valleyX, so the creek (which ends at 455), the banks and the mountain sides follow the trail together.
// Outside 425–645 the bend is exactly 0 (early return, so the product never yields -0).
export const meander=s=>(s<=425||s>=645)?0:3.2*Math.sin((s-430)*.085)*smooth(s,425,452)*(1-smooth(s,608,645));
const valleyX=s=>Math.sin(s*.012)*8+Math.sin(s*.027)*2.5+meander(s);
export const pathX=s=>valleyX(s)+8*Math.tanh((s-BRIDGE.center)/7);
export const pathSlope=s=>(pathX(s+.01)-pathX(s-.01))/.02;
// The creek keeps away from the gate and sunlit forest, meets the trail at the bridge and stays left of the trail until its spring.
export const riverX=s=>valleyX(s)+1.2*Math.sin((s-BRIDGE.center)*.075)+10*(1-smooth(s,135,190));
// Quiet shelves at every stop separate the climbs.
const heights=[[-40,-2.5],[0,0],[40,2.5],[70,4],[110,9],[125,9.3],[160,15],[185,19],[200,19.5],[222,20],[250,26],[262,28],[326,40],[340,41.5],[365,42.5],[400,46],[430,50],[470,56],[485,56.5],[520,66],[560,76],[580,77],[625,90],[650,94],[690,104],[705,105.5],[760,105.5]];
export function elevation(s){
  if(s<=heights[0][0])return heights[0][1];
  for(let i=1;i<heights.length;i++)if(s<=heights[i][0]){
    const [a,h]=heights[i-1],[b,k]=heights[i],t=(s-a)/(b-a);
    return h+(k-h)*t*t*(3-2*t);
  }
  return heights.at(-1)[1];
}
export const grade=s=>(elevation(s+.1)-elevation(s-.1))/.2;
export const halfWidth=s=>{
  if(s>BRIDGE.from&&s<BRIDGE.to)return 1.12;
  const widen=clamp(Math.min(s-FORK.from+2,FORK.to+2-s)/8,0,1);
  return 2.35+(FORK.width-2.35)*widen;
};
export const forkGap=s=>s>FORK.from&&s<FORK.to?FORK.gap*clamp(Math.min(s-FORK.from,FORK.to-s)/6,0,1):0;
// Height of the fork mound above the trail surface at a lateral offset (0 outside the fork). Used by terrain() and by the island mesh.
export const islandHeight=(side,s)=>{const gap=forkGap(s),ramp=clamp(gap/FORK.gap,0,1);return gap>0?.55*ramp*ramp*Math.exp(-Math.pow(side/Math.max(.3,gap*.62),4)):0;};
export const laneName=(lateral,s)=>forkGap(s)>0?(lateral<0?'꽃길':'고사리길'):null;
export const walkable=(lateral,s,from=0,to=LENGTH)=>s>=from&&s<=to&&Math.abs(lateral)<=halfWidth(s)&&Math.abs(lateral)>=forkGap(s);
export function terrain(x,s){
  const base=elevation(s), d=Math.abs(x-pathX(s)), river=Math.abs(x-riverX(s));
  const side=x-pathX(s),rise=clamp((s-430)/80,0,1),outside=Math.max(0,d-4);
  const shoulder=clamp((d-5)/13,0,1),lowerForest=1-clamp((s-440)/60,0,1);
  const hills=outside*.035+Math.sin(x*.19+s*.045)*.27*Math.min(1,Math.max(0,d-3)/3)
    +lowerForest*shoulder*shoulder*clamp((river-4)/5,0,1)*(2.4+1.5*Math.sin(s*.065+x*.08)+.6*Math.cos(x*.24-s*.11));
  // Above the squirrel forest the mountain rises on the right and the creek valley falls away on the left.
  // Neither side stops at a flat shelf any more: past the old 14 m / 42 m limits the slope keeps going (gently), and a
  // slow roll (only beyond 10 m from the trail) breaks the plane, so from the ridge the valley reads as hillside, not a wedge.
  const climb=outside*.7,fall=outside*.85;
  const roll=rise*clamp((d-10)/24,0,1)*(1.3*Math.sin(x*.07+s*.05)+.8*Math.cos(x*.15-s*.09));
  // Right side: mountainSide() (drifting steepness, soft knee, relief, outcrops, uneven crest). Left side: the valley fall.
  // The exposed valley shoulder needs shallow gullies too; fade outside the verge and before the next section.
  const valleyGullies=side<0?smooth(d,5,15)*smooth(s,520,530)*(1-smooth(s,580,590))*(1.8+.9*Math.sin(s*.35+d*.24)+.5*Math.cos(d*.6-s*.15)):0;
  const mountain=rise*(side>0?mountainSide(d,s,x):-(Math.min(42,fall)+Math.max(0,fall-42)*.45)-valleyGullies)+roll;
  // The land mesh is 140 m wide: its outer 12 m fold down so the mesh edge sinks under the fog instead of showing a rim.
  // On the mountain side the fold starts at a wandering distance (58 +-5.5 m with s) so the crest seen from the trail is a
  // broken ridge line, not a constant-radius dome. The valley side keeps the fixed 58 m start. `climb` is kept for reference.
  const fold=x>0?58+3.5*Math.sin(s*.083)+2*Math.sin(s*.21+1):58;
  const skirt=Math.pow(clamp((Math.abs(x)-fold)/12,0,1),2)*18;void climb;
  // Keep the stream bed below its water until the spring, where the carve fades out.
  const stream=clamp((RIVER.end-s)/15,0,1),bank=Math.exp(-Math.pow(river/3.8,4))*stream;
  // Planted mound between the two lanes. Its width and height follow the walkable gap at this s, so at the
  // narrow fork entry/exit the mound shrinks with the gap and both lane edges (|side| >= forkGap) stay above the feet.
  const island=islandHeight(side,s);
  // Beyond the summit rail the ground falls away along an irregular brow. G08: the old ease-out (initial slope ≈6, i.e. a
  // cliff lip 2.4 m behind the rail with a flat top) read as a brown plate with a ruler-straight edge from the deck. Now the
  // rim sits ~1 m behind the rail and the fall is a rounded shoulder (smoothstep: ~1.3 m down at 2 m, ~5 m down at 4 m)
  // that steepens into the valley, so the ground is seen falling continuously with no shelf and no hard lip. The deck
  // (s <= LENGTH) stays level because browRim(x) >= LENGTH+.4.
  const rim=browRim(x),bt=clamp((s-rim)/22,0,1),drop=bt*bt*(3-2*bt);
  const brow=drop*58+drop*(1-drop)*4*(1.2+1.0*Math.sin(x*.9+s*.6));
  return base+(hills+mountain)*(1-bank)-1.4*Math.exp(-Math.pow(river/2.2,4))*stream-brow-skirt+island;
}
// G08: where the ground starts to fall behind the summit rail, per x. Stays in [LENGTH+.4, LENGTH+1.8] so the deck
// (s <= LENGTH) is never touched; world.mjs puts rim rocks and the brow planting relative to it.
export const browRim=x=>LENGTH+1.1+.45*Math.sin(x*.55)+.25*Math.sin(x*1.7+2);
export function worldAt(s,offset=0){return {x:pathX(s)+offset,y:elevation(s)+.09,z:-s};}
export function advance(state,input,dt,range={from:0,to:LENGTH},speedScale=1){
  const x=clamp(Number(input.x)||0,-1,1), y=clamp(Number(input.y)||0,-1,1);
  const outward=Math.sign(x)===Math.sign(state.x)&&Math.abs(state.x)>halfWidth(state.y)-.5;
  const edge=outward?clamp((halfWidth(state.y)-Math.abs(state.x))/.5,.2,1):1;
  const speed=SPEED*clamp(Number(speedScale)||1,.2,2);
  const result=moveActor(state,{x,y},dt,speed*(outward&&Math.abs(x)>Math.abs(y)?edge:1),
    (lateral,s)=>walkable(lateral,s,range.from,range.to));
  // Walking straight into the fork slides onto the nearer lane; no menu, the child simply keeps walking.
  if(y&&result.y===state.y){
    // A child leaving a verge pickup should slide toward the narrower bridge, not hit an invisible wall.
    if(!x&&Math.abs(result.x)>halfWidth(state.y+Math.sign(y)*.3)){
      const nx=result.x-Math.sign(result.x)*speed*Math.min(Math.max(dt,0),.05)*.8;
      if(walkable(nx,result.y,range.from,range.to)){result.x=nx;result.moving=true;}
    }
    const gap=forkGap(state.y+Math.sign(y)*.3);
    if(gap>0&&Math.abs(result.x)<gap){
      const nx=result.x+(Math.sign(result.x)||1)*speed*Math.min(Math.max(dt,0),.05)*.8;
      if(walkable(nx,result.y,range.from,range.to)){result.x=nx;result.moving=true;}
    }
  }
  // shortcut: route-relative movement keeps young players on the trail; use terrain navigation for a free-roaming map.
  return result;
}
export const sectionAt=s=>sections.find(z=>s<z.to)||sections.at(-1);
export const sectionIndex=s=>Math.max(0,sections.indexOf(sectionAt(s)));
export function place(s){return sectionAt(s).name;}
export const stops=[
  {s:30,r:7,name:'친구에게 인사',text:'먼저 온 친구가 기다리고 있어요. 손을 흔들어 인사해요.'},
  {s:115,r:8,name:'새소리 듣기',text:'잠깐 멈춰 봐요. 흔들리는 나뭇가지 위에서 새가 노래해요.'},
  {s:BRIDGE.center,r:7,name:'나뭇잎 띄우기',text:'난간 안에서 잎을 하나 띄워요. 물길을 따라 흘러가요.'},
  {s:362,r:8,name:'쉼터에 앉기',text:'서두르지 않아도 괜찮아요. 앉아서 물이 흐르는 쪽을 바라봐요.'},
  {s:475,r:10,name:'다람쥐 기다리기',text:'거리를 두고 조용히 살펴봐요. 다람쥐는 무엇을 할까요?'},
  {s:578,r:8,name:'전망대에서 바라보기',text:'바람이 불어요. 뒤돌아보면 지나온 다람쥐 숲과 쉼터 계곡이 저 아래로 이어지고, 앞에는 정상이 보여요.'},
  {s:SUMMIT.platform,r:9,name:'정상 풍경 보기',text:'발아래로 숲이 펼쳐져요. 여기까지 함께 올라왔어요.'}
];
export function nearby(s){return stops.find(p=>Math.abs(p.s-s)<p.r)||null;}
// Seats at the shelter: a child sits on the one nearest to the side of the trail they are standing on.
export const seats=[{s:360,offset:-3.2,yaw:.35,kind:'bench'},{s:366,offset:3.0,yaw:-Math.PI*.35,kind:'log'}];
export function seatFor(lateral,s){let best=null,score=Infinity;for(const [i,seat] of seats.entries()){const d=Math.hypot((seat.offset-lateral)*1.5,seat.s-s);if(d<score){score=d;best=i;}}return best;}
export const straightWalkSeconds=LENGTH/SPEED;
