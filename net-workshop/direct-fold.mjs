import {foldAngles,intersections} from './geometry.mjs';
export function faceFoldPlan(net,sequence,progress,face){
  const hinge=net.links.findIndex(link=>link.child===face);
  if(hinge<0)return null;
  const count=net.links.length,done=Math.round(progress*count),position=sequence.indexOf(hinge),closing=position>=done;
  const next=sequence.filter(index=>index!==hinge);
  next.splice(closing?done:done-1,0,hinge);
  const target=(done+(closing?1:-1))/count;
  for(let i=0;i<=40;i++)if(intersections(net,foldAngles(net,progress+(target-progress)*i/40,next)).length)return {blocked:true};
  return {sequence:next,progress:target};
}
