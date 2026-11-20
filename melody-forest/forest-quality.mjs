export function forestQuality(mode, {touch=false, width=1024, height=768, dpr=1}={}) {
  const smooth=mode==='smooth'||(mode!=='clear'&&touch);
  return {smooth, ratio:Math.min(dpr,smooth?1:1.5,Math.sqrt((smooth?1100000:4000000)/Math.max(1,width*height))),shadow:smooth?1024:2048,particles:smooth?.5:1};
}
