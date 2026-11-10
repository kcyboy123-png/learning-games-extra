import * as T from './vendor/three.module.js';
import {worldAt,terrain} from './trail.mjs';
import {WAYMARKERS} from './lib/wayfinding.mjs';

export function createWaymarkers(scene,wood,grain,contactPlane,contactMat){
 const atlas=document.createElement('canvas');atlas.width=atlas.height=1024;const ctx=atlas.getContext('2d'),tiles=[];
 // One static atlas for every sign: no per-frame canvas work or extra image request.
 function tile(label,distance,direction){const i=tiles.length,x=(i%2)*512,y=Math.floor(i/2)*100;
  ctx.save();ctx.beginPath();ctx.rect(x,y,512,100);ctx.clip();ctx.fillStyle='#745238';ctx.fillRect(x,y,512,100);
  if(grain){ctx.globalAlpha=.65;ctx.drawImage(grain,x,y,512,100);ctx.globalAlpha=1;ctx.fillStyle='#60412770';ctx.fillRect(x,y,512,100);}
  const edge=ctx.createLinearGradient(0,y,0,y+100);edge.addColorStop(0,'#efd7a355');edge.addColorStop(.12,'#0000');edge.addColorStop(.85,'#0000');edge.addColorStop(1,'#160e0c99');ctx.fillStyle=edge;ctx.fillRect(x,y,512,100);
  ctx.strokeStyle='#21170b55';ctx.lineWidth=1;for(let k=0;k<5;k++){ctx.beginPath();ctx.moveTo(x+30+k*61,y+17+k*13);ctx.lineTo(x+80+k*61,y+15+k*13);ctx.stroke();}
  ctx.font='750 34px SUIT, sans-serif';ctx.textBaseline='middle';ctx.fillStyle='#291e14';ctx.fillText(label,x+28,y+52);ctx.fillStyle='#fff0ce';ctx.fillText(label,x+28,y+50);
  if(distance!==undefined){ctx.font='750 33px SUIT, sans-serif';ctx.textAlign='right';ctx.fillText(distance+' m',x+466,y+50);ctx.textAlign='left';ctx.font='700 26px SUIT';ctx.fillText(direction==='back'?'↓':'↑',x+478,y+50);}
  ctx.restore();tiles.push({x,y});return i;
 }
 const specs=WAYMARKERS.map(marker=>({...marker,tiles:marker.rows.map(r=>tile(r.name,r.distance,r.direction)),headingTile:marker.heading?tile(marker.heading):null}));
 const texture=new T.CanvasTexture(atlas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 const faceMat=new T.MeshStandardMaterial({map:texture,roughness:.94,metalness:0,color:'#fff7e8'}),boltMat=new T.MeshStandardMaterial({color:'#4b4940',roughness:.74,metalness:.35});
 const outline=new T.Shape();outline.moveTo(-1.32,-.23);outline.lineTo(1.12,-.23);outline.lineTo(1.36,0);outline.lineTo(1.12,.23);outline.lineTo(-1.32,.23);outline.closePath();
 const boardGeo=new T.ExtrudeGeometry(outline,{depth:.09,bevelEnabled:true,bevelThickness:.012,bevelSize:.018,bevelSegments:1,steps:1});boardGeo.translate(0,0,-.045);
 const postGeo=new T.CylinderGeometry(.075,.095,2.45,8),boltGeo=new T.SphereGeometry(.023,6,4),capGeo=new T.CylinderGeometry(.11,.10,.065,8);
 const groups=[];
 for(const spec of specs){const g=new T.Group(),p=worldAt(spec.s,spec.offset);g.name='waymarker-'+spec.id;g.userData={s:spec.s,marker:spec};g.position.set(p.x,terrain(p.x,spec.s),p.z);g.rotation.y=spec.offset>0?Math.PI-.10:.10;scene.add(g);
  const height=spec.heading?2.95:2.45,post=new T.Mesh(postGeo,wood);post.scale.y=height/2.45;post.position.set(-.62,height/2,spec.offset>0?.18:-.18);post.castShadow=post.receiveShadow=true;g.add(post);const cap=new T.Mesh(capGeo,boltMat);cap.position.set(-.62,height,spec.offset>0?.18:-.18);g.add(cap);
  const pos=[],uv=[],indices=[],bolts=[];
  function face(tileIndex,y){const {x:tx,y:ty}=tiles[tileIndex],u0=(tx+1)/1024,u1=(tx+510)/1024,v0=1-(ty+99)/1024,v1=1-(ty+1)/1024;
   for(const side of [1,-1]){const base=pos.length/3;for(const [x,h] of [[-1.29,-.215],[1.09,-.215],[1.30,0],[1.09,.215],[-1.29,.215]]){pos.push(x,y+h,side*.059);const fx=side===1?(x+1.29)/2.59:1-(x+1.29)/2.59;uv.push(u0+(u1-u0)*fx,v0+(v1-v0)*(h+.215)/.43);}const tri=[0,1,2,0,2,3,0,3,4];for(let k=0;k<tri.length;k+=3)indices.push(base+tri[k],base+tri[k+(side===1?1:2)],base+tri[k+(side===1?2:1)]);}
  }
  const list=spec.tiles.map((t,i)=>({tile:t,y:2.02-i*.58}));if(spec.headingTile!==null)list.push({tile:spec.headingTile,y:2.64});
  for(const row of list){const board=new T.Mesh(boardGeo,wood);board.position.y=row.y;board.castShadow=board.receiveShadow=true;g.add(board);face(row.tile,row.y);for(const side of [1,-1])for(const x of [-1.17,.98])bolts.push([x,row.y,side*.076]);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const faceMesh=new T.Mesh(geo,faceMat);g.add(faceMesh);
  const screws=new T.InstancedMesh(boltGeo,boltMat,bolts.length),matrix=new T.Matrix4();bolts.forEach((p,i)=>screws.setMatrixAt(i,matrix.makeTranslation(...p)));screws.computeBoundingSphere();g.add(screws);
  const shadow=new T.Mesh(contactPlane,contactMat);shadow.scale.set(.36,1,.23);shadow.position.set(-.62,.015,0);g.add(shadow);
  // These markers never move; keep both local and world transforms out of the frame loop.
  g.updateMatrixWorld(true);g.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;});groups.push(g);
 }
 return {groups,atlas};
}

