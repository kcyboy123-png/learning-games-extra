// Small props are cached once; pet atlases and their resolution stay unchanged.
export function makeToyArt(species){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d');
 if(species==='cat'){
  c.translate(128,128);c.rotate(-.24);
  const g=c.createLinearGradient(-45,0,45,0);g.addColorStop(0,'#607a79');g.addColorStop(.42,'#a4c8bd');g.addColorStop(.54,'#d4e2d0');g.addColorStop(1,'#6d9c96');c.fillStyle=g;
  c.beginPath();c.moveTo(0,-111);c.bezierCurveTo(-76,-70,-61,65,-3,94);c.bezierCurveTo(49,80,63,-57,0,-111);c.fill();
  c.save();c.clip();c.lineWidth=1.8;
  for(let y=-90;y<87;y+=6){const w=48*Math.sqrt(Math.max(0,1-(y/108)**2));c.strokeStyle=y%12?'rgba(234,240,216,.65)':'rgba(49,87,83,.42)';c.beginPath();c.moveTo(0,y+16);c.quadraticCurveTo(-w*.4,y+5,-w,y-13);c.moveTo(1,y+16);c.quadraticCurveTo(w*.4,y+8,w,y-9);c.stroke();}
  c.restore();c.strokeStyle='#f1e8c7';c.lineWidth=3;c.beginPath();c.moveTo(-4,119);c.quadraticCurveTo(7,0,0,-107);c.stroke();
 }else{
  const g=c.createRadialGradient(94,72,8,133,135,105);g.addColorStop(0,'#f9d5ac');g.addColorStop(.35,'#dca176');g.addColorStop(.8,'#b47153');g.addColorStop(1,'#744e40');c.fillStyle=g;c.beginPath();c.arc(128,128,108,0,Math.PI*2);c.fill();
  c.save();c.clip();c.strokeStyle='rgba(253,230,185,.8)';c.lineWidth=17;c.beginPath();c.ellipse(111,128,58,108,-.4,0,Math.PI*2);c.stroke();c.strokeStyle='rgba(107,65,47,.2)';c.lineWidth=2;for(let y=26;y<235;y+=7){c.beginPath();c.moveTo(20,y);c.quadraticCurveTo(130,y+12,238,y);c.stroke();}c.restore();
 }
 return canvas;
}
