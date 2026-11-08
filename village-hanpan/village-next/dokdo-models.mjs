import * as T from '../lib/three.module.min.js';
const mats=new Map(),geos=new Map();
function material(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(c);}
function shape(k){if(!geos.has(k))geos.set(k,k==='box'?new T.BoxGeometry(1,1,1):k==='cylinder'?new T.CylinderGeometry(1,1,1,12):k==='cone'?new T.ConeGeometry(1,1,12):new T.SphereGeometry(1,12,8));return geos.get(k);}
export function part(g,k,c,x,y,z,sx,sy=sx,sz=sx){const m=new T.Mesh(shape(k),material(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
export function makeFlag(g,x=0,z=0){
 part(g,'cylinder','#a5b6b4',x,1.55,z,.035,3.1,.035);part(g,'sphere','#d7b66b',x,3.15,z,.075);
 const canvas=document.createElement('canvas');canvas.width=450;canvas.height=300;const c=canvas.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,450,300);
 c.save();c.translate(225,150);c.rotate(Math.atan2(2,3));const r=75;
 c.fillStyle='#cd2e3a';c.beginPath();c.arc(0,0,r,Math.PI,0);c.arc(r/2,0,r/2,0,Math.PI);c.arc(-r/2,0,r/2,0,Math.PI,true);c.fill();
 c.fillStyle='#0047a0';c.beginPath();c.arc(0,0,r,0,Math.PI);c.arc(-r/2,0,r/2,Math.PI,0);c.arc(r/2,0,r/2,Math.PI,0,true);c.fill();c.restore();
 // Viewed from the front: geon NW, gam NE, ri SW, gon SE.
 for(const [x,y,angle,broken]of[[95,65,-.588,[0,0,0]],[355,65,.588,[1,0,1]],[95,235,.588,[0,1,0]],[355,235,-.588,[1,1,1]]]){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle='#111';for(let i=0;i<3;i++){if(broken[i]){c.fillRect(-33,(i-1)*15-5,28,10);c.fillRect(5,(i-1)*15-5,28,10);}else c.fillRect(-33,(i-1)*15-5,66,10);}c.restore();}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const geo=new T.PlaneGeometry(1.35,.9,12,3),mat=new T.MeshStandardMaterial({map:texture,side:T.DoubleSide,roughness:.8});
 const flag=new T.Mesh(geo,mat);flag.position.set(x+.71,2.65,z);flag.userData.dokdoFlag=true;flag.userData.keepArtHierarchy=true;g.add(flag);return flag;
}
export function flowers(g,sedum=false){for(let i=0;i<15;i++){const a=i*2.399,r=.16+Math.sqrt(i/15)*.75,x=Math.sin(a)*r,z=Math.cos(a)*r;part(g,'sphere','#719864',x,.14,z,.16,.1,.17);for(let k=0;k<6;k++){const b=k*Math.PI/3;part(g,'sphere',sedum?'#f5d873':'#c1a2df',x+Math.cos(b)*.09,.25+(i%3)*.025,z+Math.sin(b)*.09,.08,.025,.055);}part(g,'sphere','#ecd17b',x,.27,z,.045,.025,.045);}}
export function dokdoModel(g,type){
 const finish=[];
 if(type==='dokdoFlag'){makeFlag(g,-.5);part(g,'cylinder','#d2c7ad',0,.06,0,1,.12,1);return finish;}
 if(['dokdoFlower','dokdoSedum'].includes(type)){flowers(g,type==='dokdoSedum');return finish;}
 if(type==='dokdoHistory'){part(g,'box','#beb8a5',0,.12,0,1.7,.24,1.4);part(g,'box','#7c8a85',0,.65,-.1,1.1,1,.25);part(g,'box','#e5d7b1',0,.72,.04,.8,.5,.02);flowers(g);return finish;}
 if(type==='dokdoDeck'){part(g,'box','#bda17d',0,.08,0,2,.16,1.8);for(const x of[-.8,.8])part(g,'box','#7d7563',x,.45,-.7,.08,.8,.08);part(g,'box','#dfc49c',0,.8,-.7,1.7,.07,.06);part(g,'box','#b38b5c',0,.4,0,1.2,.12,.45);part(g,'box','#c6a475',0,.65,-.2,1.2,.35,.08);return finish;}
 if(type==='dokdoSolar'){part(g,'box','#b6b9ae',0,.35,0,.9,.7,.9);const panel=part(g,'box','#385b72',0,.92,0,1.8,.08,1.3);panel.rotation.x=-.25;for(let i=-2;i<=2;i++)part(g,'box','#99bdc3',i*.3,.99,0,.02,.02,1.2);return finish;}
 const colors={dokdoTea:'#c29375',dokdoGuest:'#7c9d91',dokdoHome:'#648f87',dokdoMemory:'#679b9d',dokdoKeeper:'#537d91',dokdoResearch:'#79928c',dokdoWeather:'#acb9b3'};
 part(g,'box','#e9e1cd',0,.55,0,1.7,1.1,1.45);part(g,'box','#b7aa8e',0,.08,0,1.95,.16,1.65);
 for(const side of[-1,1]){const roof=part(g,'box',colors[type]||'#718e86',side*.45,1.28,0,1.12,.12,1.7);roof.rotation.z=side*-.4;}
 part(g,'box','#886f50',0,.38,.74,.36,.76,.06);part(g,'sphere','#e8cb78',.1,.4,.79,.035);
 for(const x of[-.57,.57]){part(g,'box','#f2dfad',x,.65,.745,.39,.44,.04);part(g,'box','#608c96',x,.65,.775,.30,.34,.025);part(g,'box','#f7e9c9',x,.65,.80,.025,.36,.025);}
 part(g,'box','#507b70',0,1.02,.80,.9,.15,.06);
 if(type==='dokdoTea'){for(let i=0;i<5;i++)part(g,'box',i%2?'#f1dec3':'#b38165',-.6+i*.3,.95,1.02,.30,.07,.55);part(g,'cylinder','#c5a77a',.66,.32,1.02,.20,.08,.20);part(g,'cylinder','#e4d5b0',.66,.12,1.02,.04,.30,.04);}
 if(type==='dokdoGuest'){for(const x of[-.68,.68]){part(g,'cylinder','#af8665',x,.16,.9,.15,.26,.15);part(g,'sphere','#8aa778',x,.36,.9,.20,.17,.18);}}
 if(type==='dokdoTea'||type==='dokdoGuest')g.traverse(o=>{if(!o.isMesh||!o.material.color)return;const hex='#'+o.material.color.getHexString();if(hex==='#e9e1cd')o.userData.paintRole='wall';else if(hex===colors[type])o.userData.paintRole='roof';});
 if(type==='dokdoWeather'){part(g,'cylinder','#d7dcd5',.6,1.8,-.2,.025,1.4,.025);part(g,'sphere','#f1eee2',-.45,1.8,0,.4,.35,.4);part(g,'box','#698c9c',.6,2.4,-.2,.7,.04,.05);}
 if(type==='dokdoResearch'){const dish=part(g,'sphere','#d8e0dc',.48,1.7,-.2,.36,.12,.36);dish.rotation.z=.4;}
 if(type==='dokdoMemory'){part(g,'sphere','#ae8159',-.56,.3,1,.23,.3,.18);part(g,'sphere','#c49367',-.56,.62,1,.18);}
 return finish;
}
export const dokdoModels=Object.fromEntries(['Tea','Guest','Keeper','Home','Memory','Weather','Research','History','Flag','Flower','Sedum','Deck','Solar'].map(s=>['dokdo'+s,[g=>dokdoModel(g,'dokdo'+s),1]]));
// Batch static parts within each moving limb; motion stays on the parent groups.
export function batchParts(root){
 for(const child of [...root.children])if(child.isGroup)batchParts(child);
 const groups=new Map();for(const m of root.children)if(m.isMesh&&!m.isInstancedMesh&&!m.material.map&&!m.geometry.attributes.color){const key=m.geometry.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(m);}
 for(const list of groups.values()){if(list.length<2)continue;const mat=new T.MeshStandardMaterial({color:'#ffffff',roughness:.86}),mesh=new T.InstancedMesh(list[0].geometry,mat,list.length);list.forEach((m,i)=>{m.updateMatrix();mesh.setMatrixAt(i,m.matrix);mesh.setColorAt(i,m.material.color);root.remove(m);});mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);}
}
export function createGangchi(){
 const g=new T.Group();g.name='gangchi-memory-guide';g.userData.keepArtHierarchy=true;
 const body=new T.Group();g.add(body);part(body,'sphere','#a87b50',0,.56,0,.46,.62,.41);part(body,'sphere','#d4af7a',0,.55,.30,.29,.44,.13);
 const head=new T.Group();head.position.set(0,1.13,.11);body.add(head);part(head,'sphere','#bb9062',0,0,0,.4,.37,.36);part(head,'sphere','#e6cb99',0,-.12,.31,.25,.16,.10);
 for(const x of[-1,1]){part(head,'sphere','#9d754f',x*.37,-.03,-.04,.08,.12,.06);part(head,'sphere','#241e1a',x*.16,.055,.32,.065,.079,.035);part(head,'sphere','#fff5dd',x*.15,.08,.353,.02);part(head,'sphere','#d39c83',x*.26,-.08,.29,.08,.045,.02);for(let i=0;i<3;i++){const w=part(head,'cylinder','#5a4b3b',x*.25,-.12+i*.045,.39,.006,.28,.006);w.rotation.z=x*(1.3+i*.16);}}
 part(head,'sphere','#493a2f',0,-.04,.40,.07,.045,.04);
 const flippers=[];for(const side of[-1,1]){const f=new T.Group();f.position.set(side*.34,.38,.07);body.add(f);const m=part(f,'sphere','#966d49',side*.18,-.15,.08,.15,.12,.39);m.rotation.z=side*.3;flippers.push(f);part(body,'sphere','#99704b',side*.19,.06,-.42,.18,.07,.34);}
 batchParts(body);return {g,tick(t,reduced){head.rotation.y=reduced?0:Math.sin(t*.45)*.18;body.position.y=reduced?0:Math.sin(t*1.8)*.016;flippers[1].rotation.z=reduced?0:Math.max(0,Math.sin(t*.7))*.65;}};
}
