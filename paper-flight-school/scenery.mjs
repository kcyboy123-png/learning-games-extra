import * as T from './vendor/three.module.js?v=20261120-quality6';
import {loadTexture} from './art-assets.mjs?v=20261120-quality6';
const mat=(c,extra={})=>new T.MeshStandardMaterial({color:c,roughness:.86,...extra});
function mesh(g,m,s,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;s.add(o);return o;}
function box(s,w,h,d,x,y,z,c){return mesh(new T.BoxGeometry(w,h,d),mat(c),s,x,y,z);}
function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
export function studioDetails(s,onChange=()=>{}){
 const grid=texture(1024,1024,(c,w,h)=>{c.fillStyle='#638578';c.fillRect(0,0,w,h);for(let i=0;i<=48;i++){c.strokeStyle=i%5===0?'#dfdfb785':'#dfdfb738';c.lineWidth=i%5===0?1.8:1;c.beginPath();c.moveTo(i*w/48,0);c.lineTo(i*w/48,h);c.moveTo(0,i*h/48);c.lineTo(w,i*h/48);c.stroke();}c.strokeStyle='#d9e2cd';c.lineWidth=2;c.strokeRect(13,13,w-26,h-26);c.strokeStyle='#e8e4be55';for(const r of [190,310,430]){c.beginPath();c.arc(w/2,h/2,r,0,Math.PI*2);c.stroke();}c.fillStyle='#5f7864';c.font='18px sans-serif';for(let i=5;i<45;i+=5){c.fillText(String(i),i*w/48+3,32);c.fillText(String(i),20,i*h/48);}});
 const board=mesh(new T.BoxGeometry(.48,.003,.48),mat(0xc1ccba),s,0,-.058,0);const face=mesh(new T.PlaneGeometry(.475,.475),mat(0xffffff,{map:grid,roughness:.9}),s,0,-.0564,0);face.rotation.x=-Math.PI/2;
 const sheet=mesh(new T.BoxGeometry(.21,.001,.297),mat(0xfffdf1),s,-.35,-.057,.04);sheet.rotation.y=.16;for(let i=0;i<2;i++){const p=mesh(new T.BoxGeometry(.21,.001,.297),mat(0xf6f1df),s,-.35-i*.003,-.058-i*.001,.04);p.rotation.y=.16-i*.015;}
 const pencil=new T.Group();const shaft=mesh(new T.CylinderGeometry(.003,.003,.17,6),mat(0xc69754),pencil);shaft.rotation.z=Math.PI/2;const wood=mesh(new T.ConeGeometry(.003,.017,6),mat(0xdfc9a0),pencil,-.0935,0,0);wood.rotation.z=Math.PI/2;const lead=mesh(new T.ConeGeometry(.0011,.005,6),mat(0x424942),pencil,-.104,0,0);lead.rotation.z=Math.PI/2;pencil.position.set(.24,-.054,-.20);pencil.rotation.y=.2;s.add(pencil);
 const pot=mesh(new T.CylinderGeometry(.045,.036,.075,32),mat(0xd2c1a0),s,-.29,-.016,-.42);mesh(new T.CylinderGeometry(.041,.041,.006,32),mat(0x5e5140),s,-.29,.023,-.42);
 const leafMap=loadTexture('forest-foliage-v2.png',onChange),leafMat=mat(0xa3b586,{map:leafMap,alphaTest:.4,side:T.DoubleSide});leafMat.alphaToCoverage=true;
 for(let i=0;i<7;i++){const angle=i*2.4,leaf=mesh(new T.PlaneGeometry(.085,.067),leafMat,s,-.29+Math.cos(angle)*.028,.07+(i%3)*.025,-.42+Math.sin(angle)*.028);leaf.rotation.set(-.3,angle,.2*Math.cos(angle));leaf.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:leafMap,alphaTest:.4,side:T.DoubleSide});}
 const frame=box(s,.15,.13,.008,.10,.015,-.56,0xf5eee0);frame.rotation.x=-.2;
 const blueprint=texture(512,448,c=>{c.fillStyle='#244e4a';c.fillRect(0,0,512,448);c.strokeStyle='#c8d9c533';c.lineWidth=1;for(let x=20;x<512;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,448);c.stroke();}for(let y=0;y<448;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(512,y);c.stroke();}c.strokeStyle='#f2e8c7';c.lineWidth=4;c.beginPath();c.moveTo(256,65);c.lineTo(445,340);c.lineTo(286,288);c.lineTo(256,366);c.lineTo(226,288);c.lineTo(67,340);c.closePath();c.moveTo(256,65);c.lineTo(256,366);c.stroke();c.setLineDash([6,8]);c.strokeStyle='#a8c6c1';c.beginPath();c.moveTo(67,395);c.lineTo(445,395);c.stroke();});
 const framed=mesh(new T.PlaneGeometry(.13,.11),mat(0xffffff,{map:blueprint,roughness:.7}),s,.10,.016,-.553);framed.rotation.x=-.2;
 const scissors=new T.Group(),metal=mat(0xd8dddb,{metalness:.9,roughness:.24}),handle=mat(0x36594c,{roughness:.38});
 for(const side of [-1,1]){const ring=mesh(new T.TorusGeometry(.018,.004,12,32),handle,scissors,side*.017,0,-.065);ring.rotation.x=Math.PI/2;ring.scale.y=1.2;
  const shape=new T.Shape();shape.moveTo(side*.008,-.035);shape.lineTo(side*.004,.075);shape.quadraticCurveTo(side*.024,.07,side*.022,-.015);shape.closePath();const blade=mesh(new T.ExtrudeGeometry(shape,{depth:.001,bevelEnabled:true,bevelThickness:.0004,bevelSize:.0004,bevelSegments:2}),metal,scissors);blade.rotation.x=-Math.PI/2;blade.rotation.z=side*.08;
 }const screw=mesh(new T.CylinderGeometry(.004,.004,.004,20),metal,scissors,0,.002,-.012);scissors.position.set(-.19,-.053,-.13);scissors.rotation.y=.6;s.add(scissors);
 const note=texture(512,512,(c,w,h)=>{c.fillStyle='#f7f0df';c.fillRect(0,0,w,h);c.strokeStyle='#839c9560';c.lineWidth=2;for(let y=55;y<480;y+=38){c.beginPath();c.moveTo(35,y);c.lineTo(475,y);c.stroke();}c.strokeStyle='#517568';c.lineWidth=3;c.beginPath();c.moveTo(90,340);c.lineTo(400,110);c.lineTo(320,393);c.lineTo(232,304);c.lineTo(178,365);c.lineTo(198,260);c.closePath();c.moveTo(198,260);c.lineTo(400,110);c.lineTo(232,304);c.stroke();});
 const sketch=mesh(new T.PlaneGeometry(.18,.25),mat(0xffffff,{map:note}),s,-.38,-.0255,-.31);sketch.rotation.x=-Math.PI/2;
 // Physical paper geometry stays separate from these decorative desk objects.
 return board;
}
