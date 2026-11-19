const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function rollTarget(start,end,ms){const delta=end-start,speed=Math.abs(delta)/Math.max(80,ms);return clamp(end+Math.sign(delta)*clamp(speed*380,.04,.24),.22,.78);}
export function rollPosition(roll,now){const t=clamp((now-roll.at)/roll.duration,0,1);return roll.from+(roll.to-roll.from)*(1-(1-t)**3);}
