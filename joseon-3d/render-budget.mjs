// Only the 3D canvas is scaled; lesson text and touch controls keep native resolution.
export function mobileDevice({width,touch=false}){return touch||width<=1024;}
export function renderRatio({width,height,dpr=1,mobile=false}){
 return mobile?Math.min(dpr,.85,Math.sqrt(650000/(Math.max(1,width)*Math.max(1,height)))):Math.min(dpr,1.5);
}
export function frameReady(now,last,interval){return !last||now-last>=interval-.5;}
