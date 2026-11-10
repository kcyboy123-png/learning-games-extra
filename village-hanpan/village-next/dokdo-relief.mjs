import {dokdoHeight,nearestWalk,slotCells,coastlines,insideCoast} from './dokdo-terrain.mjs';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const plots=slotCells.map(([x,z])=>[(x-8.5)*2.4,(z-8.5)*2.4]);
// Visual relief only: keep the original surface under paths and every buildable/fixed plot.
export function cliffPoint(x,z){
 const h=dokdoHeight(x,z);if(h<.5)return [x,h,z];
 const path=nearestWalk(x,z);let clearance=path.d-path.width/2;
 for(const [px,pz]of plots)clearance=Math.min(clearance,Math.max(Math.abs(x-px),Math.abs(z-pz))-1.25);
 const mask=smooth(.6,1.45,clearance)*smooth(.5,2,h);
 if(!mask)return [x,h,z];
 const groove=Math.pow(.5+.5*Math.sin(x*.78+z*.43+Math.sin(z*.31)*.55+Math.sin(z*.19-x*.28)*.8+h*.07+Math.sin(h*.35)*.16),5);
 const shoulder=.5+.5*Math.sin(x*.46-z*.57+Math.sin(z*.23));
 const y=h+mask*(shoulder*shoulder*(.95+.48*smooth(3,10,h))-groove*(x<0?2.90:2.05)+.12*Math.sin(h*1.35+x*.32-z*.21)*smooth(2,7,h));
 const sideMask=smooth(.75,1.75,clearance)*smooth(1.5,4,h);
 const shift=.72*sideMask*Math.sin(z*.68+x*.41+Math.sin(z*.29)+h*.06);
 const px=x+shift,pz=z+shift*(x<0?.38:-.22);
 return coastlines.some(c=>insideCoast(c,px,pz))?[px,y,pz]:[x,y,z];
}

export const cliffHeight=(x,z)=>cliffPoint(x,z)[1];
