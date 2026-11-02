export const STRIDE=.70, STANCE=.55;
// During stance, the foot moves back exactly as far as the character moves forward.
export function footStep(distance,side=0){
  const phase=((distance/STRIDE+side*.5)%1+1)%1,half=STRIDE*STANCE/2;
  if(phase<STANCE)return {z:half-STRIDE*phase,lift:0,roll:0,phase};
  const u=(phase-STANCE)/(1-STANCE),arc=Math.sin(Math.PI*u);
  return {z:-half+half*2*(u-Math.sin(u*Math.PI*2)/(Math.PI*2)),lift:.075*arc*arc,roll:-.12*Math.sin(u*Math.PI*2)*arc,phase};
}
