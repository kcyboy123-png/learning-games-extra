export const HIDE_SPOTS=Object.freeze([.14,.38,.62,.86]);
export function nextHideSpot(last,random=Math.random){
 const options=[0,1,2,3].filter(i=>i!==last);
 return options[Math.min(options.length-1,Math.floor(random()*options.length))];
}
