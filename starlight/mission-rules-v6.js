'use strict';
window.STAR_PLAY_RULES=(()=>{
 const puzzleSeconds={mosaic:15,tower:15,roads:15};
 const puzzleTime=(id,mode)=>id==='GG02'?30:(puzzleSeconds[mode]||0);
 // Judge the visible marker, including either edge touching the green zone.
 const timingHit=(cursor,zone)=>cursor.right>=zone.left-.5&&cursor.left<=zone.right+.5;
 const timingZone=hits=>hits<5?{left:.32,width:.36,period:2100}:{left:[.16,.55,.28,.62,.4][hits-5]??.4,width:.17,period:1100/.8};
 const boatCourse={rows:8,cols:5,start:[7,2],goal:[0,2],cargo:[[5,0],[2,4]],rocks:[[6,1],[6,2],[6,4],[5,2],[5,4],[4,0],[4,3],[3,0],[3,1],[2,1],[2,3],[1,0],[1,4],[0,0],[0,4]]};
 const sameCell=(a,b)=>a[0]===b[0]&&a[1]===b[1];
 function shortestBoatRoute(course=boatCourse){
  const all=(1<<course.cargo.length)-1,queue=[{cell:course.start,mask:0,path:[]}],seen=new Set([course.start.join(',')+',0']);
  for(let head=0;head<queue.length;head++){
   const current=queue[head];
   if(sameCell(current.cell,course.goal)&&current.mask===all)return current.path;
   for(const [dr,dc] of [[-1,0],[0,-1],[0,1],[1,0]]){
    const cell=[current.cell[0]+dr,current.cell[1]+dc];
    if(cell[0]<0||cell[0]>=course.rows||cell[1]<0||cell[1]>=course.cols||course.rocks.some(rock=>sameCell(rock,cell)))continue;
    let mask=current.mask;course.cargo.forEach((cargo,i)=>{if(sameCell(cargo,cell))mask|=1<<i;});
    // Arriving at the dock without both crates ends the attempt in the game.
    if(sameCell(cell,course.goal)&&mask!==all)continue;
    const key=cell.join(',')+','+mask;if(seen.has(key))continue;seen.add(key);
    queue.push({cell,mask,path:[...current.path,cell]});
   }
  }
  return null;
 }
 function createBoatJourney(course=boatCourse){
  const route=shortestBoatRoute(course);if(!route)throw Error('No valid cargo route');
  const minimum=route.length;let row,col,moves,phase;const collected=new Set();
  const snapshot=()=>({row,col,moves,phase,minimum,collected:[...collected]});
  function reset(){[row,col]=course.start;moves=0;phase='running';collected.clear();return snapshot();}
  function step(r,c){
   if(phase!=='running'||r<0||r>=course.rows||c<0||c>=course.cols||Math.abs(r-row)+Math.abs(c-col)!==1)return {type:'ignored',...snapshot()};
   if(course.rocks.some(rock=>sameCell(rock,[r,c]))){phase='failed';return {type:'blocked',...snapshot()};}
   row=r;col=c;moves++;course.cargo.forEach((cargo,i)=>{if(sameCell(cargo,[r,c]))collected.add(i);});
   let type='moved';
   if(sameCell([row,col],course.goal))type=collected.size!==course.cargo.length?'missing':moves===minimum?'arrived':'too-long';
   else if(moves>=minimum)type='too-long';
   if(type==='arrived')phase='won';else if(type!=='moved')phase='failed';
   return {type,...snapshot()};
  }
  reset();return {snapshot,step,reset};
 }
 function shuffle(values,random=Math.random){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
 function mixedOrder(length,random=Math.random){const order=shuffle(Array.from({length},(_,i)=>i),random);if(length>1&&order.every((n,i)=>n===i))order.push(order.shift());return order;}
 const accepts=(item,target)=>(item.targets||[item.target]).includes(target);
 function sortOrder(items,targetCount,random=Math.random){
  const targets=mixedOrder(targetCount,random),objects=shuffle(items.map((_,i)=>i),random);
  // Never lay out all matching pairs in identical visual positions.
  if(objects.length===targets.length&&objects.every((n,i)=>accepts(items[n],targets[i])))objects.push(objects.shift());
  return {objects,targets};
 }
 // Speeds are relative to v5. Only archery is eased; the forge keeps its pace.
 const timingPeriod=(period,forge,slow)=>period/(forge?1:.9)*(slow?1.45:1);
 function createClock({seconds,onChange=()=>{},onTick=()=>{},onExpire=()=>{},now=()=>performance.now(),schedule=fn=>setInterval(fn,100),cancel=clearInterval}){
  let remaining=seconds*1000,phase='ready',anchor=0,handle=null,lastSecond=seconds;
  const snapshot=()=>({phase,remaining,seconds:Math.ceil(remaining/1000),total:seconds});
  const notify=()=>onChange(snapshot());
  function clear(){if(handle!==null){cancel(handle);handle=null;}}
  function pulse(){
   if(phase!=='running')return;
   const time=now();remaining=Math.max(0,remaining-Math.max(0,time-anchor));anchor=time;
   if(remaining===0){phase='expired';clear();notify();onExpire();return;}
   const next=Math.ceil(remaining/1000);if(next!==lastSecond){lastSecond=next;notify();onTick(next);}
  }
  function run(){phase='running';anchor=now();clear();handle=schedule(pulse);notify();}
  return {snapshot,start(){remaining=seconds*1000;lastSecond=seconds;run();},pause(){if(phase!=='running')return;pulse();if(phase==='running'){phase='paused';clear();notify();}},resume(){if(phase==='paused')run();},stop(){phase='stopped';clear();notify();},dispose(){phase='disposed';clear();}};
 }
 function createTapChallenge({seconds=5,target=20,now=()=>performance.now()}={}){
  let phase,remaining,count,anchor;
  const snapshot=()=>({phase,remaining,count,target});
  function reset(){phase='ready';remaining=seconds*1000;count=0;anchor=0;return snapshot();}
  function pulse(){if(phase==='running'){const t=now();remaining=Math.max(0,remaining-Math.max(0,t-anchor));anchor=t;if(!remaining)phase='failed';}return snapshot();}
  function tap(){if(phase==='ready'){phase='running';anchor=now();}pulse();if(phase==='running'){count++;if(count===target)phase='won';}return snapshot();}
  function pause(){pulse();if(phase==='running')phase='paused';return snapshot();}
  function resume(){if(phase==='paused'){phase='running';anchor=now();}return snapshot();}
  reset();return {snapshot,reset,pulse,tap,pause,resume};
 }
 return {puzzleTime,timingHit,timingZone,createTapChallenge,puzzleSeconds,boatCourse,shortestBoatRoute,createBoatJourney,shuffle,mixedOrder,accepts,sortOrder,timingPeriod,createClock};
})();
