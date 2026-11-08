// A small centre dead zone prevents accidental steps. Walking keeps the existing speed.
export function stickVector(dx,dy,radius,deadZone=.18){
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||!Number.isFinite(radius)||radius<=0)return {x:0,y:0,px:0,py:0};
  const distance=Math.hypot(dx,dy),ratio=distance?Math.min(1,radius/distance):0;
  return {x:distance>radius*deadZone?dx/distance:0,y:distance>radius*deadZone?-dy/distance:0,px:dx*ratio,py:dy*ratio};
}
export function createJoystick(element,knob,{enabled,onStart}){
  let pointer=null,origin=null;const value={x:0,y:0};
  function reset(){
    const previous=pointer;pointer=null;origin=null;value.x=0;value.y=0;
    knob.style.transform='translate(0px,0px)';element.classList.remove('active');
    if(previous!==null&&element.hasPointerCapture(previous))element.releasePointerCapture(previous);
  }
  function move(e){
    if(e.pointerId!==pointer)return;
    if(!enabled()){reset();return;}
    e.preventDefault();const v=stickVector(e.clientX-origin.x,e.clientY-origin.y,origin.radius);
    value.x=v.x;value.y=v.y;knob.style.transform=`translate(${v.px}px,${v.py}px)`;
  }
  element.addEventListener('pointerdown',e=>{
    if(pointer!==null||!enabled()||e.button!==0)return;
    e.preventDefault();onStart();const r=element.getBoundingClientRect();
    origin={x:r.left+r.width/2,y:r.top+r.height/2,radius:r.width*.3};pointer=e.pointerId;
    element.setPointerCapture(pointer);element.classList.add('active');move(e);
  });
  element.addEventListener('pointermove',move);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(event,e=>{if(e.pointerId===pointer)reset();});
  return {value,reset};
}
