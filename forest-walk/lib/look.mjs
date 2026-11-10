const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function turnView(view,yaw,pitch){
  view.yaw=Math.atan2(Math.sin(view.yaw+yaw),Math.cos(view.yaw+yaw));
  view.pitch=clamp(view.pitch+pitch,-.85,.85);
}
// Turn the gaze at the existing camera position, without orbiting through trees.
export function sightTarget(eye,target,view,out={}){
  const x=target.x-eye.x,y=target.y-eye.y,z=target.z-eye.z;
  const distance=Math.hypot(x,y,z),angle=Math.atan2(x,-z)+view.yaw;
  const pitch=clamp(Math.atan2(y,Math.hypot(x,z))+view.pitch,-1.2,1.2);
  out.x=eye.x+Math.sin(angle)*Math.cos(pitch)*distance;out.y=eye.y+Math.sin(pitch)*distance;out.z=eye.z-Math.cos(angle)*Math.cos(pitch)*distance;return out;
}
