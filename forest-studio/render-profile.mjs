// Device preference is separate from student artwork; touch laptops can choose high quality.
export function chooseProfile(preference,touch){return preference==='quality'?false:preference==='classroom'?true:touch;}
let preference;try{preference=localStorage.getItem('forest-render-profile');}catch{}
export const classroom=chooseProfile(preference,globalThis.matchMedia?.('(any-pointer: coarse)').matches??false);

// Bound the 3D buffer, not the DOM; a large landscape tablet must not draw millions of extra pixels.
export function renderRatio(width,height,dpr,classroom,scale=1){
 return classroom?Math.min(dpr,1,Math.sqrt(1024000/Math.max(1,width*height)))*scale:Math.min(dpr,1.5);
}
export function nextRenderScale(scale,slow,total){return total>=60&&slow/total>.2?Math.max(.65,Math.round(scale*.8*100)/100):scale;}
