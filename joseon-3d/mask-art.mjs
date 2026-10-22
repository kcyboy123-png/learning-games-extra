// Code-drawn Korean mask-dance masks (generalized 탈 designs, not a specific regional set).
export const maskKinds=['yangban','malttugi','halmi','gaksi'];
export const maskNames={yangban:'양반탈',malttugi:'말뚝이탈',halmi:'할미탈',gaksi:'각시탈'};
export function drawMask(g,cx,cy,r,kind='yangban'){
 const skin={yangban:'#e9d6b4',malttugi:'#a8603c',halmi:'#8f6a4a',gaksi:'#f1dcc8'}[kind]||'#e9d6b4';
 g.save();g.translate(cx,cy);
 g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(r*.06,r*.08,r*.92,r*1.12,0,0,Math.PI*2);g.fill();
 g.fillStyle=skin;g.strokeStyle='#4a3424';g.lineWidth=r*.06;
 g.beginPath();g.moveTo(0,-r*1.1);g.bezierCurveTo(r*.95,-r*1.1,r*1.02,r*.3,r*.5,r*.95);g.quadraticCurveTo(0,r*1.25,-r*.5,r*.95);g.bezierCurveTo(-r*1.02,r*.3,-r*.95,-r*1.1,0,-r*1.1);g.closePath();g.fill();g.stroke();
 if(kind==='yangban'){g.fillStyle='#262626';g.beginPath();g.ellipse(0,-r*.86,r*.7,r*.3,0,Math.PI,0);g.fill();}
 if(kind==='gaksi'){g.fillStyle='#c33b3b';for(const x of [-r*.45,r*.45])g.beginPath(),g.arc(x,r*.2,r*.1,0,7),g.fill();g.beginPath();g.arc(0,-r*.55,r*.09,0,7);g.fill();}
 g.strokeStyle='#2b1d14';g.lineWidth=r*.09;g.lineCap='round';
 for(const s of [-1,1]){
  g.beginPath();g.moveTo(s*r*.15,-r*.5);g.quadraticCurveTo(s*r*.42,kind==='malttugi'?-r*.78:-r*.62,s*r*.66,-r*.45);g.stroke();
  g.fillStyle='#17110c';g.beginPath();
  if(kind==='halmi'||kind==='yangban')g.ellipse(s*r*.38,-r*.22,r*.19,r*.08,s*.25,0,Math.PI*2);else g.ellipse(s*r*.38,-r*.22,r*.14,r*.14,0,0,Math.PI*2);g.fill();
  if(kind==='halmi'){g.lineWidth=r*.045;g.beginPath();g.moveTo(s*r*.55,r*.05);g.lineTo(s*r*.82,r*.3);g.moveTo(s*r*.5,r*.25);g.lineTo(s*r*.78,r*.5);g.stroke();g.lineWidth=r*.09;}
 }
 g.fillStyle=kind==='malttugi'?'#7c3f27':'rgba(70,45,30,.55)';g.beginPath();g.moveTo(0,-r*.2);g.lineTo(kind==='malttugi'?r*.3:r*.17,r*.3);g.lineTo(kind==='malttugi'?-r*.3:-r*.17,r*.3);g.closePath();g.fill();
 g.fillStyle='#3a1d16';g.beginPath();
 if(kind==='gaksi')g.ellipse(0,r*.6,r*.14,r*.07,0,0,Math.PI*2);else{g.moveTo(-r*.5,r*.5);g.quadraticCurveTo(0,r*(kind==='halmi'?.62:.98),r*.5,r*.5);g.quadraticCurveTo(0,r*.72,-r*.5,r*.5);}
 g.fill();
 if(kind==='yangban'||kind==='malttugi'){g.fillStyle='#f3ebdc';g.beginPath();g.moveTo(-r*.3,r*.55);g.quadraticCurveTo(0,r*.72,r*.3,r*.55);g.quadraticCurveTo(0,r*.66,-r*.3,r*.55);g.fill();}
 g.restore();
}
