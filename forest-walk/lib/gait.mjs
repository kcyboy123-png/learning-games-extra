export const STRIDE=.96, STANCE=.55;
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// During stance, the foot moves back exactly as far as the character moves forward.
export function footStep(distance,side=0,stride=STRIDE){
  const phase=((distance/stride+side*.5)%1+1)%1,half=stride*STANCE/2;
  if(phase<STANCE){const t=phase/STANCE;return {z:half-stride*phase,lift:0,roll:-.055*(1-ease(t/.23))+.085*ease((t-.72)/.28),phase};}
  const u=(phase-STANCE)/(1-STANCE),arc=Math.sin(Math.PI*(u+.10*Math.sin(Math.PI*u)));
  // Match stance velocity and zero acceleration at lift-off and landing.
  return {z:-half-stride*(1-STANCE)*u+stride*u*u*u*(10+u*(-15+6*u)),lift:.065*arc*arc,roll:.085*(1-ease(u))-.055*ease(u)-.12*Math.sin(u*Math.PI*2)*arc,phase};
}
