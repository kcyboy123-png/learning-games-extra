// New buildings use the village's shared materials, geometry cache and instancing.
export function expansionModels(h){
 const {paintPart,T,box,ball,dot,cylinder,taper,cone,rounded,softBlock,mesh,geometry,flat,roof,cottageRoof,casement,door,sign,label,flower,shrub,pot,bench,clump,amusementModel,GLASS,GLOW,WATER}=h;
 const shopTextures=new Map(),shopMaterials=new Map();
 function shopSurface(g,kind,colors){
  if(!shopTextures.has(kind)){
   const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#eee7d8';ctx.fillRect(0,0,256,256);
   let seed=271;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   for(let i=0;i<5000;i++){ctx.fillStyle=`rgba(${rand()<.5?'255,255,245':'90,64,40'},${kind==='stone'?.012+rand()*.035:.025+rand()*.08})`;const r=kind==='clay'?2+rand()*6:1+rand()*2;ctx.fillRect(rand()*256,rand()*256,r,r);}
   if(kind==='bread'){const glaze=ctx.createLinearGradient(0,0,0,256);glaze.addColorStop(0,'rgba(255,244,202,.22)');glaze.addColorStop(.5,'rgba(218,151,64,.05)');glaze.addColorStop(1,'rgba(129,66,24,.16)');ctx.fillStyle=glaze;ctx.fillRect(0,0,256,256);}
   if(kind==='brick'){for(let row=0;row<10;row++)for(let col=-1;col<7;col++){const x=col*44+(row%2)*22,y=row*26;ctx.fillStyle='rgba(80,50,30,.18)';ctx.fillRect(x,y,44,2);ctx.fillRect(x,y,2,26);ctx.fillStyle=`rgba(255,240,215,${.05+rand()*.2})`;ctx.fillRect(x+3,y+3,38,20);}}
   if(kind==='clay'){for(let row=0;row<14;row++)for(let col=-1;col<12;col++){const x=col*25+(row%2)*12.5,y=row*19;ctx.fillStyle='rgba(255,225,183,.19)';ctx.fillRect(x,y,25,1);ctx.fillRect(x,y,1,19);ctx.fillStyle=`rgba(75,40,25,${rand()*.1})`;ctx.fillRect(x+2,y+2,22,16);}}
   if(kind==='clay'){ctx.lineWidth=1;ctx.strokeStyle='rgba(255,221,185,.13)';for(let y=9;y<256;y+=13){ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(80,y-2,180,y+2,256,y);ctx.stroke();}}
   if(kind==='stone'){ctx.strokeStyle='rgba(95,85,65,.12)';ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(0,i*64);ctx.lineTo(256,i*64);ctx.stroke();}ctx.fillStyle='rgba(90,75,55,.10)';ctx.fillRect(128,0,1,256);}
   if(kind==='wood'){for(let i=0;i<28;i++){ctx.strokeStyle=`rgba(80,50,25,${.04+rand()*.08})`;ctx.beginPath();ctx.moveTo(i*10,0);ctx.bezierCurveTo(i*10+8,80,i*10-6,160,i*10,256);ctx.stroke();}}
   const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.userData.shared=true;t.wrapS=t.wrapT=T.RepeatWrapping;shopTextures.set(kind,t);
  }
  g.traverse(o=>{if(!o.isMesh||!colors.includes('#'+o.material.color.getHexString()))return;const key=o.material.uuid+kind;if(!shopMaterials.has(key)){const m=o.material.clone();m.map=shopTextures.get(kind);m.roughness=kind==='bread'?.68:.9;shopMaterials.set(key,m);}o.material=shopMaterials.get(key);});
 }
 const part=(g,x=0,y=0,z=0,scale=1)=>{const p=new T.Group();p.position.set(x,y,z);p.scale.setScalar(scale);g.add(p);return p;};
 const lawn=(g,size=7.5)=>{rounded(g,'#c2cba2',0,.02,0,size,size,.12,.35);rounded(g,'#e4d4b6',0,.16,0,size*.85,1.1,.035,.3);};
 function fence(g,x,z,length,turn=0){const p=part(g,x,0,z);p.rotation.y=turn;for(let i=0;i<=Math.round(length/.4);i++)softBlock(p,'#f2e5cb',-length/2+i*length/Math.round(length/.4),.49,0,.085,.8,.085,.025);for(const y of[.32,.67])box(p,'#c8af89',0,y,0,length,.065,.07);}
 function beds(g,x,z,color,r=.6){clump(g,'#7f9e62',x,.26,z,r,.23,r*.7);for(let i=0;i<7;i++){const t=i*2.399;flower(g,x+Math.sin(t)*r*.8,z+Math.cos(t)*r*.55,color);}}
 function star(g,x,y,z,r=.3){const s=new T.Shape();for(let i=0;i<10;i++){const t=i*Math.PI/5,rr=i%2?r*.46:r;i?s.lineTo(Math.sin(t)*rr,Math.cos(t)*rr):s.moveTo(0,r);}s.closePath();const geo=geometry('gold-star:'+r,()=>new T.ExtrudeGeometry(s,{depth:.07,bevelEnabled:false}));return mesh(g,geo,'#eac96c',x,y,z,1,1,1,{metalness:.35,roughness:.4,emissive:'#b68c36',emissiveIntensity:.15});}
 function arch(g,x,z,w=2.5,color='#d8c09c'){const p=part(g,x,0,z);for(const k of[-1,1]){softBlock(p,color,k*w/2,1.1,0,.13,2.2,.15,.03);beds(p,k*w/2,0,'#e9a3b6',.32);}const curve=new T.CatmullRomCurve3(Array.from({length:17},(_,i)=>new T.Vector3(Math.cos(i*Math.PI/16)*w/2,2.1+Math.sin(i*Math.PI/16)*w/2,0)));mesh(p,geometry('arch:'+w,()=>new T.TubeGeometry(curve,20,.085,6,false)),color,0,0,0);for(let i=0;i<11;i++){const t=i*Math.PI/10,x=Math.cos(t)*w/2,y=2.1+Math.sin(t)*w/2;clump(p,'#7ca36d',x,y,0,.18,.16,.13);for(let k=0;k<3;k++)dot(p,['#f2b6c8','#e083a0','#fff0d6'][k],x+(k-1)*.1,y+.08,.14,.09,.075,.065);}return p;}
 function fountain(g,gold=false){const stone=gold?'#d2af55':'#d8d0b9',p=part(g);cylinder(p,stone,0,.23,0,1.45,.32);cylinder(p,'#6eaaa7',0,.41,0,1.27,.035,WATER);cylinder(p,stone,0,.65,0,.16,.9);cylinder(p,stone,0,1.0,0,.82,.13);cylinder(p,'#84c2be',0,1.08,0,.71,.025,WATER);cylinder(p,stone,0,1.35,0,.12,.6);cylinder(p,stone,0,1.67,0,.43,.1);ball(p,'#b4e3da',0,1.9,0,.09,.27,.09,WATER);for(let i=0;i<8;i++){const t=i*Math.PI/4;const stream=cylinder(p,'#b8e5dc',Math.sin(t)*.64,.76,Math.cos(t)*.64,.02,.5,WATER);stream.rotation.z=.12;dot(p,'#e2f5de',Math.sin(t)*1.07,.44,Math.cos(t)*1.07,.08,.015,.08);}if(gold)star(p,0,2.24,0,.25);return p;}
 function duplex(g){flat(g,2.7,3.05,2.2,'#f4ddbc','#7f9e91','#b8ac90',true);cottageRoof(g,3.37,3.25,2.75,false,2.7,2.2);door(g,0,.8,1.12,.62,1.2);for(const x of[-.85,.85]){casement(g,x,1.02,1.12,.52,.6);casement(g,x,2.42,1.12,.64,.72);beds(g,x,1.6,'#e4a0b2',.32);}softBlock(g,'#d7b68e',0,1.85,1.4,2.4,.12,.65,.035);for(let i=0;i<9;i++)box(g,'#7f9e91',-1.08+i*.27,2.08,1.72,.035,.42,.035);box(g,'#7f9e91',0,2.31,1.72,2.4,.055,.06);pot(g,1.45,1.4);return[];}
 function gardenhouse(g){lawn(g,3.7);const p=part(g,-.15,.12,-.4,.78);flat(p,2.65,1.9,2.05,'#f6e5c8','#b87869','#b8ac90',true);cottageRoof(p,2.22,3.1,2.6,false,2.65,2.05);door(p,0,.8,1.04,.64,1.15);for(const x of[-.86,.86])casement(p,x,1.03,1.04,.5,.64);fence(g,0,-1.72,3.3);fence(g,-1.7,0,3.2,Math.PI/2);for(const x of[-1.2,1.2])beds(g,x,1.2,'#efd598',.45);box(g,'#c19975',.4,.23,1.25,.6,.3,.42);for(let i=0;i<3;i++)flower(g,.2+i*.2,1.25,'#e695b0');cylinder(g,'#927252',1.55,.7,.7,.04,1.1);softBlock(g,'#7ca6a0',1.55,1.25,.7,.32,.28,.3,.06);return[];}
 function terracehouse(g){lawn(g);for(let i=0;i<3;i++){const p=part(g,-2.25+i*2.25,.15,-.5,.76);flat(p,2.7,3.2,3.3,['#f1d6c3','#c4d8d2','#e9dfb9'][i],'#78968a');door(p,0,.8,1.67,.66,1.2);for(const y of[1.1,2.5])for(const x of[-.82,.82])casement(p,x,y,1.67,.54,.63);box(p,'#d7c29b',0,3.53,0,2.65,.07,3.25);for(const x of[-1.18,1.18])box(p,'#6d8b76',x,3.8,0,.06,.5,3.15);for(const z of[-1.48,1.48])box(p,'#6d8b76',0,3.8,z,2.4,.5,.07);const garden=part(p,0,3.57,0);beds(garden,0,-.8,'#edafb4',.65);bench(garden,0,.5);}for(const x of[-2.5,2.5])beds(g,x,2.5,'#f2cf7b',.62);return[];}
 function chicken(g){flat(g,2.9,1.95,2.2,'#f8df9e','#b76a4b','#b8ac90',true);roof(g,0,2.2,0,3.3,2.7,'#be6554','#a85549');door(g,0,.75,1.12,.6,1.1);for(const x of[-.98,.98])casement(g,x,.98,1.12,.62,.72);sign(g,'치킨집',1.85,1.4,2.35,'#d18a47','#fff7df');const p=part(g,0,2.6,0);ball(p,'#fff0cb',0,.35,0,.47,.4,.34);ball(p,'#fff4dd',.32,.65,.05,.23);cone(p,'#e5ad47',.55,.65,.09,.12,.28).rotation.z=-Math.PI/2;for(let i=0;i<3;i++)ball(p,'#c76d5b',.17+i*.12,.87,0,.08,.12,.08);dot(p,'#4a4539',.42,.7,.21,.028);for(const x of[-1.2,1.2])pot(g,x,1.55);return[];}
 function neighborhood(g,type){
  const cream='#f3ead6',wood='#a9805a',sage='#72998a',brick='#b87869',gold='#d7b785';
  rounded(g,'#c5bc9f',0,.02,0,3.65,3.65,.13,.22);
  const rib=(parent,points,color,r=.035)=>{const key='shop-rib:'+JSON.stringify(points)+':'+r;return mesh(parent,geometry(key,()=>new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),12,r,5,false)),color,0,0,0);};
  const vase=(x,y,z,scale,color)=>mesh(g,geometry('artisan-vase',()=>new T.LatheGeometry([[.19,0],[.38,.2],[.42,.45],[.23,.7],[.2,.9],[.26,.94]].map(p=>new T.Vector2(...p)),10)),color,x,y,z,scale,scale,scale);
  const window=(x,y,z,w=.6,h=.9)=>casement(g,x,y,z,w,h);
  const awning=(color,y=1.9)=>{for(let i=0;i<8;i++){const a=box(g,i%2?cream:color,-1.4+i*.4,y,1.4,.4,.08,.65);a.rotation.x=.2;box(g,i%2?cream:color,-1.4+i*.4,y-.14,1.72,.4,.22,.04);}};
  if(type==='bakery'){
   flat(g,2.8,1.7,2.3,'#f6dfaa',wood,'#b8ac90',true);
   // The pastry is the whole roof, not a decoration on a conventional cottage.
   for(let i=0;i<7;i++){
    const x=(i-3)*.43,edge=Math.abs(i-3)/3,y=2.2+.38*(1-edge),z=.32*edge*edge,d=1.4-.42*edge,h=.65-.1*edge,loaf=part(g,x,y,z);loaf.rotation.z=(3-i)*.1;ball(loaf,i%2?'#dda04f':'#e8b968',0,0,0,.52,h,d);
    rib(loaf,[-.75,-.35,.35,.75].map((v,j)=>{const xx=-.14+j*.055;return[xx,h*Math.sqrt(1-v*v-(xx/.52)**2)+.012,v*d];}),'#fff0ba',.025);
   }

   door(g,-.75,.77,1.17,.72,1.25);window(.65,.95,1.17,1.05,.9);awning('#c88b64',1.72);sign(g,'동네 빵집',1.56,1.79,2.2,wood,cream);
   for(let i=0;i<3;i++){box(g,wood,.35+i*.4,.32,1.49,.36,.35,.35);for(let j=0;j<3;j++)ball(g,'#e8b968',.25+i*.4+j*.09,.55,1.5,.07,.2,.08);}pot(g,-1.4,1.4);
  }else if(type==='florist'){
   softBlock(g,'#e4bdc6',0,.25,0,3.1,.35,2.7,.06);
   box(g,'#bbd5c6',0,1.2,0,2.9,1.65,2.5,{transparent:true,opacity:.52,depthWrite:false});
   for(const z of[-1.3,-.65,0,.65,1.3])rib(g,[[-1.55,1.75,z],[-1.25,2.7,z],[0,3.15,z],[1.25,2.7,z],[1.55,1.75,z]],sage,.065);
   const glass=geometry('florist-vault',()=>{const a=new T.CylinderGeometry(1,1,2.6,16,1,true,0,Math.PI);a.rotateZ(Math.PI/2);a.rotateY(Math.PI/2);return a;});mesh(g,glass,'#c8dace',0,1.8,0,1.5,1.3,1,{transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide});
   for(const x of[-1.5,-.75,.75,1.5])box(g,sage,x,1.16,1.32,.055,1.8,.07);door(g,0,.85,1.35,.68,1.3);sign(g,'꽃집',1.85,1.41,1.0,'#c088a2',cream);
   for(const x of[-1.35,1.35]){beds(g,x,1.47,'#e7adc1',.37);vase(x,.15,1.4,.5,sage);for(let i=0;i<4;i++){const p=part(g,x,2.15-i*.19,.7-i*.12,.42);beds(p,0,0,i%2?'#c4a9d6':'#edb1c5',.5);}}
   const top=part(g,0,2.8,-.7,.7);beds(top,0,0,'#efd598',.8);
  }else if(type==='seasideCafe'){
   rounded(g,wood,0,.2,0,3.25,3.2,.13,.35);box(g,'#c1d9cf',0,1.2,-.15,2.8,1.85,2.2,GLASS);
   for(const x of[-1.4,-.7,0,.7,1.4])box(g,cream,x,1.2,1.0,.065,1.9,.09);
   for(const x of[-1.45,1.45])box(g,cream,x,1.2,-1.1,.1,1.9,.1);
   const shellPoint=(u,v)=>[u*1.7,2.35+.5*Math.cos(u*Math.PI/2)+.26*Math.sin(v*Math.PI)+.12*u,v*1.45];
   mesh(g,geometry('cafe-shell',()=>{const a=[],n=12;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const u=i/n*2-1,v=j/n*2-1,U=(i+1)/n*2-1,V=(j+1)/n*2-1;a.push(...shellPoint(u,v),...shellPoint(U,v),...shellPoint(U,V),...shellPoint(u,v),...shellPoint(U,V),...shellPoint(u,V));}const q=new T.BufferGeometry();q.setAttribute('position',new T.Float32BufferAttribute(a,3));q.computeVertexNormals();return q;}),'#6eaaa7',0,0,0,1,1,1,{side:T.DoubleSide});
   for(let i=0;i<7;i++)rib(g,Array.from({length:9},(_,j)=>shellPoint(j/4-1,i/3-1)),gold,.025);
   door(g,0,.8,1.02,.6,1.2);sign(g,'바닷가 카페',1.95,1.1,2,cream,'#537c86');for(const x of[-1,1]){cylinder(g,wood,x,.62,1.45,.3,.06);cylinder(g,wood,x,.35,1.45,.04,.55);cylinder(g,cream,x,.69,1.45,.065,.09);}pot(g,1.5,-1.3);
  }else if(type==='pottery'){
   mesh(g,geometry('kiln-house',()=>new T.LatheGeometry([[1.48,.15],[1.5,.9],[1.35,1.7],[1.0,2.4],[.52,2.85],[.45,3]].map(p=>new T.Vector2(...p)),20)),brick,0,0,-.15);
   for(const [y,r] of [[.78,1.50],[1.16,1.45],[1.54,1.39],[1.92,1.25],[2.30,1.06]]){
    const seam=mesh(g,geometry('kiln-mortar-ring',()=>new T.TorusGeometry(1,.012,3,24)), '#e4bd95',0,y,-.15,r,r,r);seam.rotation.x=Math.PI/2;
   }
   box(g,wood,0,.85,1.2,1.15,1.4,.12);rib(g,[[-.62,.35,1.35],[-.62,1.2,1.35],[0,1.75,1.35],[.62,1.2,1.35],[.62,.35,1.35]],'#e4bd95',.14);door(g,0,.78,1.33,.72,1.2);
   cylinder(g,'#a9694a',-.85,2.65,-.65,.23,1.65);cylinder(g,'#694f42',-.85,3.48,-.65,.19,.04);sign(g,'도예 공방',1.82,1.27,1.65,wood,cream);
   for(let i=0;i<3;i++)vase(-1.2+i*.42,.2,1.45,.55,i%2?sage:'#caa573');cylinder(g,wood,1.1,.6,1.3,.4,.08);cylinder(g,sage,1.1,.7,1.3,.23,.1);vase(1.1,.75,1.3,.35,brick);
  }else if(type==='artGallery'){
   softBlock(g,cream,-.65,1.25,-.35,1.4,2.25,2.35,.18);softBlock(g,'#c88b78',1,1.45,-.7,.85,2.65,1.8,.12);
   box(g,'#c1d9cf',.25,1.18,.9,1.75,1.9,.08,GLASS);for(const x of[-.6,.2,1.05])box(g,gold,x,1.18,.97,.045,1.95,.045);
   const canopyShape=new T.Shape();canopyShape.moveTo(-1.7,-1.03);canopyShape.bezierCurveTo(-.65,-1.55,1.6,-1.3,1.7,-.45);canopyShape.bezierCurveTo(1.85,.7,.7,1.65,-.35,1.35);canopyShape.bezierCurveTo(-1.55,1.15,-1.8,.2,-1.7,-1.03);
   const canopyGeo=geometry('gallery-leaf-roof',()=>{const q=new T.ExtrudeGeometry(canopyShape,{depth:.1,bevelEnabled:false,curveSegments:8});q.rotateX(-Math.PI/2);const a=q.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)+.14*a.getX(i)+.06*a.getZ(i)**2);q.computeVertexNormals();return q;});
   mesh(g,canopyGeo,cream,0,2.62,-.05);mesh(g,canopyGeo,gold,0,2.602,-.05,1.012,1,1.012);

   for(let i=0;i<3;i++){box(g,gold,-1.36,.8+i*.53,.6,.035,.4,.5);box(g,['#81a89b','#d59983','#e8c988'][i],-1.38,.8+i*.53,.6,.02,.32,.4);}
   sign(g,'작은 미술관',.55,1.25,1.25,cream,'#537c86');softBlock(g,'#d9d2c0',-1.0,.28,1.4,.65,.35,.5,.03);
   const sculpture=mesh(g,geometry('museum-sculpture',()=>new T.TorusKnotGeometry(.25,.055,36,6,2,3)),gold,-1,.91,1.4);sculpture.scale.y=1.6;pot(g,1.4,1.35);
  }else{
   flat(g,2.6,1.85,2.4,brick,cream,'#b8ac90',true);
   const mansard=mesh(g,geometry('post-mansard',()=>new T.CylinderGeometry(.75,1,.75,4)),'#678e87',0,2.48,0,1.9,1,1.75);mansard.rotation.y=Math.PI/4;
   box(g,cream,-.4,2.32,1.13,.8,.8,.15);window(-.4,2.38,1.24,.48,.5);door(g,0,.82,1.23,.85,1.4);rib(g,[[-.56,.3,1.32],[-.56,1.4,1.32],[0,1.9,1.32],[.56,1.4,1.32],[.56,.3,1.32]],cream,.085);
   softBlock(g,brick,1,1.8,-.65,.85,3.2,.9,.06);cylinder(g,cream,1,3.38,-.65,.63,.14);cone(g,'#678e87',1,3.82,-.65,.64,.85);ball(g,gold,1,4.28,-.65,.065);
   cylinder(g,cream,1,2.93,-.17,.3,.04).rotation.x=Math.PI/2;box(g,'#536e66',1,2.98,-.13,.025,.22,.025);box(g,'#536e66',1.08,2.93,-.13,.18,.025,.025);
   sign(g,'마을 우체국',1.95,1.33,1.7,cream,brick);cylinder(g,'#b3584e',-1.35,.65,1.35,.24,1);ball(g,'#b3584e',-1.35,1.16,1.35,.25,.13,.25);box(g,'#553f35',-1.35,.98,1.58,.28,.06,.025);pot(g,1.3,1.45);
  }
  if(type==='florist'){
   for(let i=0;i<11;i++){const x=-1.3+i*.26,y=2.25+.7*Math.sin(i*Math.PI/10);dot(g,sage,x,y,1.32,.25,.18,.18);for(let j=0;j<5;j++){const t=j*Math.PI*2/5;dot(g,i%3?'#edb1c5':'#efd598',x+Math.cos(t)*.12,y+Math.sin(t)*.12,1.48,.11,.11,.08);}dot(g,'#f4cf77',x,y,1.56,.065);}
   for(const x of[-1.25,-.65,.65,1.25])box(g,'#72998a',x,.48,1.55,.5,.32,.42);for(const z of[-.9,0,.9])for(const side of[-1,1])box(g,cream,side*1.52,1.1,z,.045,1.55,.045);
   for(let i=0;i<16;i++){const side=i%2?1:-1,x=side*(1.50+(i%3)*.04),y=i<8?.8:2.0+(i%4)*.2,z=i<8?1.58:-1.0+(i%4)*.65;dot(g,sage,x,y,z,.24,.18,.2);for(let j=0;j<5;j++){const t=j*Math.PI*2/5;dot(g,i%3?'#edb1c5':'#efd598',x+Math.cos(t)*.12,y+.08+Math.sin(t)*.12,z+.12,.1,.1,.07);}dot(g,'#f4cf77',x,y+.08,z+.19,.065);}
   for(const z of[-.8,0,.8])for(const side of[-1,1]){box(g,cream,side*1.54,1.15,z,.03,.045,.7);}
  }
  if(type==='artGallery'){
   for(const y of[.55,1.15,1.75,2.3])box(g,'#d9d2c0',-.69,y,.84,1.35,.018,.025);
   for(let i=0;i<3;i++){box(g,gold,-.35+i*.5,1.3,.83,.37,.62,.025);box(g,['#81a89b','#d59983','#e8c988'][i],-.35+i*.5,1.3,.85,.3,.54,.025);}
   for(const x of[-.5,.4])box(g,cream,x,.12,1.4,.65,.09,.55);beds(g,-1.3,-1.2,'#edb1c5',.4);
  }
  if(type==='seasideCafe'){
   for(const z of[-.8,-.2,.4]){box(g,cream,1.42,1.15,z,.05,1.75,.06);box(g,gold,1.45,1.6,z,.055,.04,.55);}
   const p=part(g,-1.05,.15,1.15,.55);cylinder(p,wood,0,1.5,0,.04,2.8);cone(p,'#6eaaa7',0,2.8,0,.85,.45);for(let i=0;i<6;i++){const t=i*Math.PI/3;rib(p,[[0,3.02,0],[Math.sin(t)*.82,2.6,Math.cos(t)*.82]],cream,.025);}pot(g,1.4,1.45);
  }
  if(type==='pottery'){

   box(g,wood,-1.08,.65,-.7,.65,.08,.9);for(let i=0;i<3;i++)vase(-1.08,.7,-1+i*.3,.35,sage);
  }
  // Readable silhouette details share the existing low-poly primitives.
  if(type==='bakery'){
   rib(g,[[-1.2,.3,1.24],[-1.2,1.05,1.24],[-.75,1.48,1.24],[-.3,1.05,1.24]],'#e4bd95',.09);
   for(let row=0;row<3;row++){box(g,wood,.65,.6+row*.26,1.32,1.0,.035,.18);for(let i=0;i<4;i++)dot(g,'#e8b968',.28+i*.24,.7+row*.26,1.36,.09,.07,.07);}
   for(const x of[-1.45,1.45]){box(g,wood,x,1.22,1.18,.13,.24,.15);box(g,'#efd598',x,1.22,1.28,.09,.17,.035);}
  }else if(type==='florist'){
   for(const side of[-1,1])for(let j=0;j<4;j++){
    const x=side*1.5,z=-1.0+j*.75,y=.45+(j%2)*.25;box(g,wood,x,y-.16,z,.55,.3,.5);dot(g,sage,x,y+.1,z,.38,.24,.32);
    for(let k=0;k<9;k++){const a=k*2.399;dot(g,j%2?'#edb1c5':'#c4a9d6',x+Math.sin(a)*.23,y+.28+(k%2)*.12,z+Math.cos(a)*.23,.15,.13,.15);}
   }
   for(let j=0;j<6;j++){const x=-1.25+j*.5,y=2.8+.25*Math.sin(j);for(let k=0;k<6;k++)dot(g,j%2?'#edb1c5':'#efd598',x+(k%3-.8)*.13,y+Math.floor(k/3)*.13,-.9,.16,.13,.15);}
  }else if(type==='pottery'){
   ball(g,'#a9694a',-1.05,.65,.95,.63,.65,.55);box(g,'#463d32',-1.05,.48,1.51,.56,.53,.025);rib(g,[[-1.4,.25,1.55],[-1.36,.65,1.55],[-1.05,.9,1.55],[-.74,.65,1.55],[-.7,.25,1.55]],'#e4bd95',.09);
   for(let i=0;i<4;i++){const log=cylinder(g,wood,-1.28+i*.15,.2,1.58,.06,.3);log.rotation.x=Math.PI/2;dot(g,'#d59983',-1.25+i*.14,.37,1.56,.07,.04,.025);}
   const roof=box(g,wood,1.15,1.75,.75,1.15,.08,1.65);roof.rotation.z=-.16;for(const z of[.05,1.45])cylinder(g,wood,1.65,.9,z,.045,1.7);
  }else if(type==='artGallery'){
   box(g,cream,.1,1.65,1.02,2.5,.12,.48);box(g,'#536e66',.1,1.57,1.18,2.4,.035,.06);
   for(let i=0;i<7;i++)box(g,gold,-1.15+i*.38,1.87,1.23,.018,.36,.018);box(g,gold,0,2.06,1.23,2.55,.025,.025);
   for(const y of[.48,1.05,2.1]){box(g,gold,1.44,y,-.35,.025,.42,.55);box(g,'#81a89b',1.46,y,-.35,.015,.34,.47);}
   const tree=part(g,-1.3,0,-1.0,.5);cylinder(tree,wood,0,1.6,0,.1,2.5);for(let i=0;i<5;i++)dot(tree,'#edb1c5',Math.sin(i*2.4)*.6,2.6+(i%2)*.3,Math.cos(i*2.4)*.5,.6,.38,.5);
  }else if(type==='seasideCafe'){
   for(let i=0;i<11;i++)box(g,'#caa573',0,.28,-1.4+i*.28,3.15,.025,.02);
   for(const side of[-1,1]){box(g,wood,side*1.5,.57,1.3,.035,.6,.035);box(g,cream,side*1.5,.87,.2,.045,.06,2.3);for(let i=0;i<6;i++)box(g,cream,side*1.5,.58,-.8+i*.4,.03,.55,.03);}
   for(let i=0;i<3;i++){box(g,wood,0,.7+i*.3,1.03,2.6,.025,.1);for(const x of[-.8,.8])cylinder(g,cream,x,.77+i*.3,1.1,.06,.1);}
  }else{
   for(let i=0;i<3;i++){const p=part(g,-.8+i*.65,0,0);box(p,cream,0,2.55,.95,.48,.55,.12);window(-.8+i*.65,2.57,1.04,.3,.35);}
   for(const x of[-1.2,1.2]){box(g,cream,x,1.0,1.24,.1,1.75,.12);box(g,cream,x,1.9,1.24,.23,.09,.17);}
   for(let i=0;i<12;i++){const t=i*Math.PI/6;dot(g,'#536e66',1+Math.sin(t)*.23,2.93+Math.cos(t)*.23,-.12,.018,.018,.01);}box(g,gold,-.62,.78,1.29,.18,.08,.03);
  }

  if(type==='bakery'){
   for(const x of[-1.15,1.15]){const tip=ball(g,'#dda04f',x,2.08,.7,.42,.34,.8);tip.rotation.y=-x*.45;}
   for(let i=0;i<7;i++)dot(g,'#fff0ba',-.9+i*.3,2.94-Math.abs(3-i)*.13,.25,.025,.02,.06);
   box(g,wood,1.52,.7,.25,.13,.75,.9);box(g,'#efd598',1.6,.73,.25,.02,.5,.68);
  }else if(type==='florist'){
   for(const side of[-1,1])for(let j=0;j<5;j++){
    const x=side*(1.12+j*.08),y=2.86-j*.19,z=-.3+j*.31;dot(g,sage,x,y,z,.32,.23,.3);
    for(let k=0;k<5;k++){const t=k*2.399;dot(g,j%2?'#e083a0':'#edb1c5',x+Math.sin(t)*.18,y+.1,z+Math.cos(t)*.18,.17,.15,.17);}
   }
   for(const x of[-1.05,1.05]){vase(x,.2,1.56,.48,'#e4bdc6');for(let j=0;j<5;j++){const t=j*2.4;dot(g,'#efd598',x+Math.sin(t)*.17,.73+(j%2)*.14,1.57+Math.cos(t)*.12,.12,.13,.12);}}
  }else if(type==='pottery'){
   for(let i=0;i<7;i++)cylinder(g,'#e4bd95',-.85,2.08+i*.2,-.65,.235,.022);
   for(let i=0;i<3;i++){box(g,wood,1.49,.65+i*.36,.32,.18,.04,1.0);vase(1.5,.68+i*.36,.1,.29,i%2?sage:'#caa573');vase(1.5,.68+i*.36,.55,.24,'#caa573');}
   box(g,'#caa573',.15,.18,1.62,.65,.07,.35);dot(g,brick,.15,.27,1.62,.18,.1,.13);
  }else if(type==='artGallery'){
   // Recessed glazing and a projecting pale gallery wing define a modern facade.
   box(g,'#536e66',.1,2.29,1.0,2.1,.34,.035);box(g,cream,.1,2.48,1.12,2.6,.13,.45);
   for(const x of[-.85,.05,.95])box(g,gold,x,2.29,1.04,.025,.33,.025);
   box(g,cream,-1.15,1.95,1.14,.28,.95,.45);box(g,cream,1.24,2.29,1.14,.2,.36,.45);
   box(g,'#536e66',.35,.69,1.02,.7,1.05,.025);box(g,gold,.35,.69,1.05,.025,1.05,.025);
  }else if(type==='seasideCafe'){
   for(const x of[-.95,.95])for(const z of[1.0,1.72]){
    cylinder(g,wood,x,.43,z,.16,.06);for(const dx of[-.1,.1])box(g,cream,x+dx,.28,z,.025,.3,.025);box(g,cream,x,.61,z+(z>1.2?.1:-.1),.3,.26,.04);
   }
   for(const side of[-1,1]){box(g,wood,side*1.5,.45,-1.2,.45,.35,.4);for(let j=0;j<4;j++)dot(g,sage,side*1.5,.68+j*.09,-1.2,.22-j*.035,.16,.22-j*.035);}
  }else{
   box(g,cream,.53,1.08,1.29,.47,.32,.035);rib(g,[[.3,1.21,1.32],[.53,1.05,1.32],[.76,1.21,1.32]],brick,.018);
   for(const y of[.52,1.68,2.58])box(g,cream,1.0,y,-.65,.89,.06,.94);
   for(const x of[-.9,.7]){box(g,sage,x,.54,1.47,.54,.18,.25);for(let j=0;j<4;j++)dot(g,'#edb1c5',x-.17+j*.11,.71,1.47,.1,.1,.09);}
  }
  // Side and rear elevations matter when a shop faces the opposite side of a street.
  if(type==='bakery'){
   const back=part(g,0,0,-1.19);back.rotation.y=Math.PI;casement(back,-.65,.92,0,.65,.85);casement(back,.65,.92,0,.65,.85);box(back,wood,0,.38,.05,2.55,.14,.16);
  }else if(type==='florist'){
   box(g,'#e4bdc6',0,.49,-1.31,2.9,.55,.08);
   for(const x of[-1.4,-.7,0,.7,1.4])box(g,sage,x,1.25,-1.35,.055,1.5,.055);
   for(const x of[-1.05,-.35,.35,1.05])box(g,'#c1d9cf',x,1.28,-1.32,.63,1.1,.035,GLASS);
   box(g,sage,0,1.86,-1.36,2.9,.07,.06);
   for(let j=0;j<7;j++){const x=-1.2+j*.4;dot(g,sage,x,.65,-1.5,.28,.26,.26);for(let k=0;k<5;k++)dot(g,j%2?'#edb1c5':'#c4a9d6',x+(k%3-1)*.12,.88+(k%2)*.11,-1.53,.13,.12,.12);}
  }else if(type==='pottery'){
   for(const side of[-1,1]){const p=part(g,side*1.42,0,-.15);p.rotation.y=side*Math.PI/2;box(p,'#463d32',0,1.12,0,.38,.42,.04);rib(p,[[-.25,.9,.04],[-.25,1.3,.04],[0,1.48,.04],[.25,1.3,.04],[.25,.9,.04]],'#e4bd95',.065);}
  }else if(type==='artGallery'){
   const side=part(g,-1.37,0,-.3);side.rotation.y=-Math.PI/2;
   box(side,'#c1d9cf',0,1.35,.03,1.7,1.4,.035,GLASS);for(const x of[-.8,0,.8])box(side,gold,x,1.35,.065,.035,1.48,.035);
   box(side,cream,0,.58,.1,1.95,.2,.25);box(side,cream,0,2.09,.12,2.0,.11,.32);
  }else if(type==='seasideCafe'){
   const back=part(g,0,0,-1.27);back.rotation.y=Math.PI;
   for(const x of[-1,0,1]){casement(back,x,1.15,0,.65,1.25);box(back,wood,x,.4,.08,.8,.12,.18);}box(back,cream,0,1.95,.07,2.9,.1,.1);
  }else{
   const back=part(g,0,0,-1.24);back.rotation.y=Math.PI;for(const x of[-.8,.1])casement(back,x,1.12,0,.6,.9);box(back,cream,-.35,.45,.06,1.8,.1,.1);
   const side=part(g,-1.31,0,0);side.rotation.y=-Math.PI/2;for(const x of[-.65,.65])casement(side,x,1.08,0,.6,.85);
  }
  if(type==='florist'){
   for(const side of[-1,1])for(let j=0;j<9;j++){
    const x=side*(1.32+.12*Math.sin(j)),z=-1.05+j*.28,y=2.5+.24*Math.sin(j*.6);dot(g,sage,x,y,z,.3,.22,.29);
    for(let k=0;k<5;k++){const t=k*2.4;dot(g,j%3?'#edb1c5':'#c4a9d6',x+Math.cos(t)*.17,y+.13+Math.sin(t)*.14,z,.13,.12,.15);}
    if(j%2===0)for(let k=0;k<3;k++)dot(g,'#c4a9d6',x,y-.24-k*.19,z,.12-k*.018,.15,.12-k*.018);
   }
   for(const z of[-1.35,1.35])for(let i=0;i<5;i++){const t=(i-2)*.5,p=dot(g,'#e4bdc6',Math.sin(t)*.48,2.72+Math.cos(t)*.25,z,.14,.3,.035);p.rotation.z=-t;}
  }else if(type==='pottery'){
   cylinder(g,'#463d32',0,2.99,-.15,.36,.03);for(let i=0;i<10;i++){const t=i*Math.PI/5;const b=box(g,i%2?'#cc9674':'#a9694a',Math.sin(t)*.43,3.035,Math.cos(t)*.43-.15,.18,.12,.15);b.rotation.y=t;}
   const p=part(g,-.95,0,-1.08);p.rotation.y=Math.PI;box(p,wood,0,.8,.08,.95,.05,.26);box(p,wood,0,.45,.08,.95,.05,.26);for(let j=0;j<3;j++){vase(-1.12+j*.3,.83,-1.1,.32,j%2?sage:'#caa573');}
  }else if(type==='artGallery'){
   mesh(g,geometry('gallery-rounded-tower',()=>new T.CylinderGeometry(1,1,1,24)),cream,.9,2.7,-.63,.63,1.45,.63);cylinder(g,gold,.9,3.435,-.63,.64,.025);
   for(const y of[2.25,2.65,3.05]){const seam=mesh(g,geometry('gallery-tower-seam',()=>new T.TorusGeometry(.635,.008,3,24)),'#d9d2c0',.9,y,-.63);seam.rotation.x=Math.PI/2;}
  }else if(type==='postOffice'){
   const clock=part(g,1.46,2.93,-.65);clock.rotation.y=Math.PI/2;cylinder(clock,cream,0,0,0,.28,.04).rotation.x=Math.PI/2;box(clock,'#536e66',0,.07,.04,.025,.2,.025);box(clock,'#536e66',.07,0,.04,.17,.025,.025);
   for(let i=0;i<5;i++){const x=-1.12+i*.55;rib(g,[[x,2.09,1.2],[x*.7,2.8,.65]],sage,.018);}
  }
  if(type==='bakery'){
   for(let i=0;i<6;i++)dot(g,sage,-1.43,1.3-i*.15,-1.1,.11,.13,.12);
  }else if(type==='florist'){
   for(let i=0;i<9;i++){const x=-1.13+i*.28,y=2.3+.66*Math.sin(i*Math.PI/8);dot(g,'#f4cf77',x,y,1.56,.055,.055,.03);}
   for(const x of[-1.5,1.5])for(let i=0;i<4;i++)dot(g,sage,x,.65+i*.13,1.1,.14,.09,.18);
  }else if(type==='pottery'){
   for(let i=0;i<6;i++){const log=cylinder(g,wood,-.6+(i%3)*.18,.25+Math.floor(i/3)*.14,-1.46,.075,.37);log.rotation.z=Math.PI/2;}
   for(const z of[.05,1.45]){const brace=box(g,wood,1.43,1.45,z,.05,.55,.05);brace.rotation.z=-.65;}
  }else if(type==='artGallery'){
   for(const x of[-.4,.5])box(g,cream,x,1.05,1.04,.018,.8,.008);
   box(g,'#536e66',1.46,1.58,-.37,.025,.12,.65);
  }else if(type==='seasideCafe'){
   rib(g,[[-1.4,2.12,1.12],[-.7,2.52,1.12],[0,2.65,1.12],[.7,2.6,1.12],[1.4,2.36,1.12]],cream,.045);
   for(const x of[-.8,0,.8]){box(g,wood,x,2.18,1.08,.018,.3,.018);dot(g,'#efd598',x,2.02,1.08,.11,.15,.11);}
  }else{
   for(let i=0;i<7;i++){dot(g,sage,-1.33,1.6-i*.16,.85,.11,.13,.13);if(i%2===0)dot(g,'#edb1c5',-1.43,1.6-i*.16,.87,.09,.08,.09);}
   box(g,cream,0,.18,1.5,1.2,.1,.35);
  }
  const finishes={bakery:['bread',['#dda04f','#e8b968']],florist:['wood',['#72998a']],seasideCafe:['wood',['#a9805a']],pottery:['clay',['#b87869','#a9694a']],artGallery:['stone',['#f3ead6','#c88b78']],postOffice:['brick',['#b87869']]};shopSurface(g,...finishes[type]);
  return[];
 }

 function buffet(g){lawn(g);flat(g,6.3,2.7,4.9,'#f2e4cb','#8b9f84');for(let i=0;i<5;i++)casement(g,-2.4+i*1.2,1.35,2.47,.95,1.55);door(g,0,.9,2.5,.84,1.5);for(let i=0;i<8;i++){const b=box(g,i%2?'#c1d9cf':'#d7b785',-2.8+i*.8,3.1,0,.75,.08,4.4,GLASS);b.rotation.z=.0;}sign(g,'숲속 뷔페',2.8,2.62,3.8,'#607f6d','#fff2cf');for(const x of[-2.5,2.5]){cylinder(g,'#b99670',x,.64,3.2,.5,.07);cylinder(g,'#6b7563',x,.35,3.2,.04,.6);for(let i=0;i<3;i++){cylinder(g,'#fff2ce',x-.26+i*.26,.7,3.2,.09,.025);dot(g,['#dd9a62','#85a862','#e0bd65'][i],x-.26+i*.26,.75,3.2,.065,.04,.065);}beds(g,x,-3.1,'#edb1c5',.6);}return[];}
 function police(g){flat(g,2.9,2.2,2.2,'#f3ead6','#658ea5','#b8ac90',true);roof(g,0,2.5,0,3.3,2.65,'#64879a','#4b6b7a');door(g,0,.8,1.12,.65,1.2);for(const x of[-.94,.94])casement(g,x,1.08,1.12,.58,.7);sign(g,'경찰서',2.18,1.2,1.9,'#537a92','#fff1cf');star(g,0,3.0,.65,.29);const car=part(g,.3,.15,1.64,.65);softBlock(car,'#f0eee3',0,.28,0,1.6,.35,.6,.12);softBlock(car,'#658ca1',0,.56,0,.82,.3,.54,.08);for(const x of[-.5,.5])for(const z of[-.31,.31]){const wheel=cylinder(car,'#495453',x,.18,z,.16,.09);wheel.rotation.x=Math.PI/2;}box(car,'#d67f73',-.15,.77,0,.23,.1,.25);box(car,'#7ca3b8',.15,.77,0,.23,.1,.25);return[];}
 function cinema(g){lawn(g);flat(g,6.4,3.5,4.8,'#f1dbc5','#568480');for(const x of[-2.8,2.8]){softBlock(g,'#67938b',x,2.4,2.52,.34,4.5,.34,.07);star(g,x,4.95,2.55,.24);}for(const x of[-1.3,0,1.3])door(g,x,1.05,2.5,.8,1.7);softBlock(g,'#d9ac65',0,2.5,3.0,5.8,.45,1.0,.1);sign(g,'숲빛 영화관',2.59,3.54,4.7,'#a66459','#fff0d3',76);for(let i=0;i<12;i++)ball(g,'#ffe9ad',-2.6+i*.47,2.32,3.5,.055,.055,.055,GLOW);for(const x of[-2.4,2.4]){box(g,'#c5a177',x,1.15,2.53,.72,1.45,.07);box(g,'#516e75',x,1.15,2.58,.61,1.31,.03);star(g,x,1.24,2.62,.23);}const reel=part(g,0,4.6,0);cylinder(reel,'#d4c7a8',0,0,0,.75,.15).rotation.x=Math.PI/2;for(let i=0;i<5;i++){const t=i*Math.PI*2/5;cylinder(reel,'#6e8582',Math.sin(t)*.43,Math.cos(t)*.43,.1,.17,.02).rotation.x=Math.PI/2;}return[];}
 function harbor(g){rounded(g,'#bcad8d',0,.02,0,7.4,7.5,.15,.25);const house=part(g,-1.4,.15,-.75);flat(house,3.3,2.25,3.0,'#e7e6cf','#6f999f','#b8ac90',true);roof(house,0,2.57,0,3.7,3.4,'#6e99a6','#537786');door(house,0,.8,1.52,.72,1.2);sign(house,'도토리 마을 항구',2.18,1.64,2.9,'#537c86','#fff3d9');for(let i=0;i<15;i++)box(g,i%2?'#c9ad83':'#d5ba92',0,.27,2.4+i*.28,1.4,.12,.25);for(const x of[-.6,.6])for(const z of[3,4.6,6.2])cylinder(g,'#8e7558',x,.52,z,.055,1.0);const light=part(g,2,.15,-1.4);for(let i=0;i<5;i++)cylinder(light,i%2?'#d18870':'#f4ead5',0,.4+i*.65,0,.65-i*.06,.66);cylinder(light,'#567a83',0,3.5,0,.48,.12);cylinder(light,'#f6dd96',0,3.85,0,.35,.6,GLOW);cone(light,'#567a83',0,4.35,0,.6,.48);const boat=part(g,2.4,-.05,5.8);ball(boat,'#c37e5f',0,.2,0,.65,.28,1.05);box(boat,'#f3e3c5',0,.32,0,1.05,.1,1.5);cylinder(boat,'#bba17b',0,1.1,0,.035,1.6);const sail=mesh(boat,geometry('boat-sail',()=>{const s=new T.Shape();s.moveTo(0,0);s.lineTo(.9,0);s.lineTo(0,1.3);return new T.ShapeGeometry(s);}), '#fff0cd',.05,.5,0,1,1,1,{side:T.DoubleSide});sail.rotation.y=.35;return[];}
 function skyTower(g){lawn(g);rounded(g,'#d7d8cd',0,.16,0,5.1,5.1,.4,.35);for(let i=0;i<10;i++){const w=3.8-i*.23,y=.78+i*.75;softBlock(g,i%2?'#9dbfc1':'#aacdcd',0,y,0,w,.72,w*.76,.1,GLASS);for(const x of[-.36,0,.36])paintPart(box(g,'#e7dfc8',x*w,y,w*.38+.035,.045,.72,.045),'accent');for(const x of[-1,1])paintPart(box(g,'#e7dfc8',x*w/2,y,0,.05,.72,w*.76),'accent');}cone(g,'#bcd5cf',0,8.85,0,1.05,1.7,GLASS);cylinder(g,'#e3cf9a',0,9.9,0,.035,1.0);door(g,0,.85,1.94,.85,1.3);sign(g,'하늘빛 타워',.64,3.4,2.5,'#496c75','#f4e9cb');for(const x of[-2.7,2.7]){beds(g,x,2.2,'#e9bf9b',.55);cylinder(g,'#b99a6a',x,.8,-2.4,.03,1.3);ball(g,'#fff2c9',x,1.5,-2.4,.13,.13,.13,GLOW);}return[];}
 function rabbitTower(g){lawn(g);paintPart(cylinder(g,'#d0ba94',0,.36,0,1.8,.5),'roof');paintPart(cylinder(g,'#f1dfb9',0,.8,0,1.48,.5),'wall');const p=part(g,0,1.05,0);ball(p,'#f4e8d1',0,1.45,0,1.0,1.45,.8);ball(p,'#fff1d6',0,3.0,0,1.08,.95,.88);for(const x of[-.5,.5]){const ear=ball(p,'#f5e5cc',x,4.25,0,.3,1.0,.26);ear.rotation.z=-x*.25;ball(p,'#e4b0a9',x,4.3,.235,.14,.7,.045);ball(p,'#f6e7ce',x*.9,.25,.55,.43,.25,.5);dot(p,'#414c43',x*.65,3.12,.84,.085,.11,.035);ball(p,'#dba69e',x*1.15,2.83,.78,.16,.09,.035);}dot(p,'#c68e82',0,2.88,.91,.095,.07,.03);paintPart(softBlock(p,'#749c8c',0,2.1,.1,1.6,.25,1.6,.1),'accent');for(const x of[-1.1,1.1])ball(p,'#f3e3c9',x,1.6,.1,.3,.65,.33);star(p,0,1.58,.86,.4);for(const x of[-2.65,2.65])beds(g,x,1.8,'#e5a6bb',.6);sign(g,'토끼탑',.5,3.4,2.0,'#749c8c','#fff1d3');return[];}
 function rosePark(g){lawn(g);arch(g,0,2.7,2.5);fountain(part(g,0,0,-.5,.72));for(const x of[-2.6,2.6]){for(const z of[-2.4,-.5,1.5])beds(g,x,z,z<0?'#df8fa9':'#f2b2c4',.7);const p=part(g,x,0,0);p.rotation.y=x<0?Math.PI/2:-Math.PI/2;bench(p,0,0);}fence(g,0,-3.5,6.8);return[];}
 function farmAnimal(g,x,z,cow=false){const p=part(g,x,.14,z);ball(p,cow?'#eee8d6':'#e9e4ce',0,.55,0,.48,.35,.3);for(const xx of[-.3,.3])for(const zz of[-.18,.18])cylinder(p,cow?'#827a67':'#9a8b71',xx,.24,zz,.055,.4);ball(p,cow?'#f0e8d2':'#ab9b7d',.42,.67,.02,.22,.24,.21);for(const zz of[-.2,.2])ball(p,'#9e9278',.4,.78,zz,.15,.06,.09);dot(p,'#343f36',.55,.73,.18,.03);if(cow){ball(p,'#776d5c',-.15,.8,0,.22,.06,.24);ball(p,'#d7ada1',.6,.56,.04,.12,.09,.17);}else for(let i=0;i<8;i++)ball(p,'#f3eedb',-.3+(i%4)*.2,.6+Math.floor(i/4)*.18,(i%2?1:-1)*.16,.2,.19,.18);}
 function animalFarm(g){lawn(g);const barn=part(g,-1.4,.15,-1.5);flat(barn,3.5,2.15,2.5,'#c67d65','#e8d7b6','#b8ac90',true);roof(barn,0,2.47,0,3.9,3,'#73968c','#57796f');box(barn,'#f1e4c8',0,.93,1.3,1.4,1.5,.06);for(const k of[-1,1]){const cross=box(barn,'#bd7b60',0,.93,1.35,1.8,.09,.05);cross.rotation.z=k*.8;}sign(barn,'동물농장',2.12,1.36,2.4,'#7c9a74','#fff2d1');fence(g,0,3.5,7);fence(g,3.5,0,7,Math.PI/2);fence(g,-3.5,0,7,Math.PI/2);farmAnimal(g,1.5,1,true);farmAnimal(g,-.6,1.8);farmAnimal(g,1.8,-1.8);for(let i=0;i<3;i++){const x=-2.8+i*.5;ball(g,'#f9eed3',x,.35,2.4,.17,.17,.16);ball(g,'#f9eed3',x+.12,.5,2.4,.1);dot(g,'#d48756',x+.23,.49,2.4,.05);}return[];}
 function largePark(g){lawn(g,15.2);const rides=part(g,-3.7,.15,-2.9,.9);amusementModel(rides);const castle=part(g,.6,.14,3.7);flat(castle,3.2,2.8,2.5,'#e8cfc2','#a7b7bd');door(castle,0,1.1,1.27,1.0,1.8);for(const x of[-1.9,1.9]){cylinder(castle,'#eee0c6',x,1.8,0,.55,3.4);cone(castle,'#7b98a9',x,4.0,0,.76,1.3);star(castle,x,4.85,0,.18);}cone(castle,'#b988a4',0,4.4,-.4,1.1,1.9);star(castle,0,5.5,-.4,.25);sign(g,'도토리 마을 놀이동산',1.2,7.3,5.8,'#658b83','#fff3d4');for(const x of[-4.9,4.9]){cylinder(g,'#b8a37c',x,1,7,.09,1.7);ball(g,'#ffe8ad',x,1.95,7,.23,.23,.23,GLOW);}const curve=new T.CatmullRomCurve3(Array.from({length:32},(_,i)=>{const t=i*Math.PI/16;return new T.Vector3(4.1+Math.cos(t)*2.45,1.9+Math.sin(t*2)*.65,-1.8+Math.sin(t)*3.1);}),true);for(const delta of[-.2,.2]){const c=curve.clone();c.points=c.points.map(p=>new T.Vector3(p.x+delta,p.y,p.z));mesh(g,geometry('park-track:'+delta,()=>new T.TubeGeometry(c,72,.065,6,true)),'#c98f6d',0,0,0);}for(let i=0;i<12;i++){const p=curve.getPoint(i/12);cylinder(g,'#86a49c',p.x,p.y/2,p.z,.055,p.y);box(g,'#d8bf8f',p.x,p.y,p.z,.7,.08,.08);}const train=part(g);train.userData.ride='train';train.userData.track=curve;for(let i=0;i<3;i++){softBlock(train,['#cf8b79','#ddb866','#91ada2'][i],0,.23,-i*.65,.6,.4,.53,.08);box(train,'#e9e4cb',0,.46,-i*.65,.55,.06,.5);}train.traverse(o=>{o.userData.keepArtHierarchy=true;});for(const x of[-6.7,6.7])for(const z of[-6.6,6.5])beds(g,x,z,'#eaa9bd',.4);fence(g,0,-7.3,14);return[];}
 function lavender(g){lawn(g,3.5);for(let row=0;row<3;row++)for(let i=0;i<7;i++){const x=-1.2+row*1.2,z=-1.2+i*.4;cylinder(g,'#7b9b64',x,.32,z,.022,.4);for(let j=0;j<3;j++)dot(g,['#ad96c8','#9987b9','#c7b0d9'][row],x,.48+j*.09,z,.07,.11,.07);}return[];}
 function hydrangea(g){lawn(g,3.5);for(const side of[-1,1])for(let i=0;i<3;i++){const x=side*1.1,z=-1+i;clump(g,'#79985f',x,.33,z,.45,.28,.4);for(let j=0;j<8;j++){const t=j*2.399;ball(g,side<0?'#a0b8d8':'#d5a8c2',x+Math.sin(t)*.28,.57+(j%2)*.13,z+Math.cos(t)*.24,.18,.15,.17);}}for(let i=0;i<4;i++)softBlock(g,'#c7c6b3',0,.2,-1.2+i*.8,.65,.04,.55,.12);return[];}
 function smallFountain(g){lawn(g,3.65);fountain(part(g,0,.1,0,.85));for(const x of[-1.35,1.35])beds(g,x,-1.2,'#e9b6bd',.23);return[];}
 function flowerArch(g){lawn(g,3.65);arch(g,0,0,2.5);for(const x of[-1.4,1.4])beds(g,x,.85,'#e7a4bc',.35);return[];}
 function moonGarden(g){lawn(g);cylinder(g,'#a7b4ba',0,.3,0,2.6,.3);cylinder(g,'#8babb5',0,.47,0,2.4,.035,WATER);const shape=new T.Shape();shape.absarc(0,0,1.65,Math.PI*.25,Math.PI*1.75,false);shape.absarc(.68,0,1.37,-Math.PI*.43,-Math.PI*1.57,true);const geo=geometry('garden-crescent',()=>new T.ExtrudeGeometry(shape,{depth:.32,bevelEnabled:true,bevelSegments:2,bevelSize:.06,bevelThickness:.06,curveSegments:24}));mesh(g,geo,'#f0d99c',0,2.3,-.2,1,1,1,{emissive:'#e4c98d',emissiveIntensity:.35,roughness:.55});for(let i=0;i<10;i++){const t=i*Math.PI/5,x=Math.sin(t)*3,z=Math.cos(t)*3;beds(g,x,z,i%2?'#e8e6e4':'#b7afcd',.3);cylinder(g,'#ab9c7d',x,.7,z,.025,1);star(g,x,1.25,z,.17);}bench(g,0,3.2);return[];}
 function goldFountain(g){lawn(g);cylinder(g,'#c8ae76',0,.22,0,3.0,.22);fountain(part(g,0,.25,0,1.65),true);for(let i=0;i<8;i++){const t=i*Math.PI/4,x=Math.sin(t)*3.3,z=Math.cos(t)*3.3;cylinder(g,'#d7c08d',x,.5,z,.24,.7);ball(g,'#e8d493',x,.93,z,.23,.23,.23,{metalness:.4,roughness:.35});beds(g,x,z,'#f1d4a3',.27);}return[];}
 function starTree(g){lawn(g);cylinder(g,'#d3be8c',0,.25,0,2.4,.3);taper(g,'#b39059',0,2.0,0,.32,3.6);for(let i=0;i<7;i++){const t=i*2.399,x=Math.sin(t)*1.55,z=Math.cos(t)*1.5,y=2.8+(i%3)*.6;const branch=taper(g,'#bc9c60',x*.45,y-.45,z*.45,.13,1.8);branch.rotation.set(Math.cos(t)*.85,0,-Math.sin(t)*.85);clump(g,['#a3b8a5','#c2cca7','#d4ce9f'][i%3],x,y,z,.85,.68,.8);for(let j=0;j<3;j++){const xx=x+(j-1)*.38,yy=y-.5-j*.12; cylinder(g,'#cdbd89',xx,yy,z,.012,.5);star(g,xx,yy-.35,z,.2);}}star(g,0,5.1,0,.48);for(const x of[-2.9,2.9])beds(g,x,1.8,'#e2c8a0',.55);bench(g,0,3.2);return[];}
 function islandCafe(g){
  lawn(g);const house=part(g,0,.1,-.65);flat(house,5.1,2.45,3.65,'#f4e8d2','#7aa9a2');roof(house,0,2.75,0,5.9,4.3,'#6faaa9','#58868c');door(house,0,.85,1.85,.8,1.4);
  for(const x of[-1.65,1.65])casement(house,x,1.25,1.85,1.1,1.3);sign(g,'물빛 찻집',2.35,1.85,3,'#577f87','#fff1d4');
  rounded(g,'#cbb58f',0,.2,2.45,5.9,1.9,.17,.2);for(const x of[-1.7,1.7]){cylinder(g,'#b99570',x,.9,2.5,.52,.08);cylinder(g,'#867963',x,.55,2.5,.05,.65);cylinder(g,'#fff1d5',x,.99,2.5,.1,.12);bench(part(g,x,0,3.1,.6),0,0);pot(g,x*1.7,1.7);}return[];
 }
 function glassGarden(g){
  lawn(g);rounded(g,'#ddd4b5',0,.24,0,5.8,5.3,.3,.22);
  for(const x of[-2.6,2.6])for(const z of[-2.25,0,2.25])softBlock(g,'#d5c590',x,1.8,z,.1,3.1,.1,.02);
  for(const x of[-2.65,2.65])box(g,'#b6ddd4',x,1.75,0,.04,2.8,4.5,{...GLASS,transparent:true,opacity:.42,depthWrite:false});
  box(g,'#b6ddd4',0,1.75,-2.3,5.3,2.8,.04,{...GLASS,transparent:true,opacity:.42,depthWrite:false});
  for(const x of[-1.34,1.34]){const panel=box(g,'#c6e4dc',x,3.6,0,2.95,.05,4.7,{...GLASS,transparent:true,opacity:.42,depthWrite:false});panel.rotation.z=-Math.sign(x)*.37;}
  for(const z of[-2.4,0,2.4])for(const x of[-1.35,1.35]){const beam=box(g,'#d5c590',x,3.65,z,2.95,.09,.10);beam.rotation.z=-Math.sign(x)*.37;}
  for(const x of[-1.65,1.65])for(const z of[-1.4,.4]){beds(part(g,0,.45,0),x,z,z<0?'#c0a9e3':'#f2bed9',.65);taper(g,'#78986e',x,.9,z,.045,1);clump(g,'#a1ba83',x,1.25,z,.4,.33,.38);dot(g,z<0?'#c0a9e3':'#f2bed9',x,1.58,z,.19,.13,.19);}
  door(g,0,1.0,2.36,1.1,1.7);star(g,0,4.5,0,.5);for(const x of[-2.9,2.9])pot(g,x,2.7);sign(g,'별빛 온실',2.75,2.5,2.8,'#6d8e83','#fff0cc');return[];
 }
 function cloudObservatory(g){
  lawn(g);cylinder(g,'#d3d0b9',0,.35,0,2.55,.4);cylinder(g,'#b6a886',0,2.6,0,.55,4.6);
  for(let i=0;i<18;i++){const a=i*.36,p=part(g,Math.sin(a)*1.65,.55+i*.20,Math.cos(a)*1.65);p.rotation.y=a;softBlock(p,'#d1c4a5',0,0,0,1.05,.15,.68,.06);cylinder(p,'#a68b64',0,.48,.34,.035,.85);}
  cylinder(g,'#d9ceb2',0,4.3,0,2.45,.24);for(let i=0;i<14;i++){const a=i*Math.PI*2/14;cylinder(g,'#a9916b',Math.sin(a)*2.2,4.8,Math.cos(a)*2.2,.04,.85);ball(g,'#e8e5da',Math.sin(a)*2.2,5.25,Math.cos(a)*2.2,.18,.12,.18);}
  for(const x of[-1.5,1.5])for(const z of[-1.3,1.3])cylinder(g,'#e5dbc3',x,5.5,z,.07,2.2);
  cone(g,'#a3c3cf',0,6.9,0,2.25,1.3);star(g,0,7.75,0,.35);
  const scope=part(g,.2,4.65,.25);cylinder(scope,'#9a8462',0,.6,0,.06,1.2);const tube=cylinder(scope,'#6d9fa9',0,1.25,0,.17,1);tube.rotation.x=Math.PI*.35;sign(g,'구름 전망대',.6,3.0,2.7,'#7f98b1','#fff2d9');return[];
 }
 function mistHydrangea(g){
  lawn(g);for(const x of[-2.1,2.1]){const p=part(g,x,.1,0,.92);hydrangea(p);}arch(g,0,-1.5,2.6,'#c8c4d7');for(let i=0;i<5;i++)softBlock(g,'#dcd9cb',0,.18,-1.7+i*.85,.9,.06,.65,.15);bench(g,0,2.8);return[];
 }
 function fireflyPond(g){
  lawn(g);cylinder(g,'#b8c6b6',0,.27,0,2.65,.28);cylinder(g,'#659fa8',0,.43,0,2.4,.045,WATER);
  for(let i=0;i<9;i++){const a=i*2.399,x=Math.sin(a)*1.85,z=Math.cos(a)*1.85;cylinder(g,'#8db49c',x,.48,z,.33,.025);flower(part(g,x,.46,z,.55),0,0,'#f0c8e4');}
  for(let i=0;i<10;i++){const a=i*2.399,x=Math.sin(a)*2.8,z=Math.cos(a)*2.8;clump(g,'#819c7b',x,.24,z,.35,.25,.3);dot(g,'#f4efb1',x,.9+(i%3)*.26,z,.065,.065,.065,GLOW);}bench(g,0,3.1);return[];
 }
 function wishTree(g){
  lawn(g);cylinder(g,'#c4c5b6',0,.25,0,2.2,.28);taper(g,'#b29280',0,2.1,0,.3,3.8);
  for(let i=0;i<7;i++){const a=i*2.399,x=Math.sin(a)*1.5,z=Math.cos(a)*1.5,y=3.2+(i%3)*.45;const branch=taper(g,'#b29280',x*.5,y-.6,z*.5,.11,1.9);branch.rotation.set(Math.cos(a)*.8,0,-Math.sin(a)*.8);clump(g,['#bcb3db','#d5c2e5','#e8cee8'][i%3],x,y,z,.95,.7,.85);cylinder(g,'#cdbd99',x,y-.72,z,.012,.8);const ribbon=box(g,i%2?'#f5e5bc':'#c6e2df',x,y-1.15,z,.14,.37,.035);ribbon.rotation.z=.18*Math.sin(i);star(g,x+.16,y-.9,z,.15);}
  for(const x of[-2.8,2.8])beds(g,x,1.8,'#dfc8e7',.45);bench(g,0,3.1);return[];
 }

 // Static factory details share cached primitives and the existing building batch.
 function factory(g,kind){
  const colors={cookieFactory:['#f2dfbc','#bd7957'],woodFactory:['#cfb38c','#71896a'],toyFactory:['#eed5bd','#6b9792'],brickFactory:['#b87659','#8e9973']},[wall,top]=colors[kind];
  rounded(g,'#c9b99b',0,.06,0,7.2,6.8,.13,.3);
  flat(g,4.8,2.65,3.7,wall,top,'#b8ac90',true);
  roof(g,0,2.95,0,5.3,4.2,top,'#806d54');
  door(g,-.6,.85,1.88,.85,1.45);
  for(const x of[-1.65,1.45])casement(g,x,1.35,1.88,.8,.9);
  for(const x of[-2.15,2.15])box(g,'#947552',x,1.3,1.94,.13,2.6,.12);
  const chimney=kind==='brickFactory'?4.3:3.55;
  box(g,'#a47c62',1.7,chimney/2,-.8,.55,chimney,.6);box(g,'#d0b593',1.7,chimney,-.8,.76,.17,.8);
  sign(g,({cookieFactory:'과자공장',woodFactory:'목재공장',toyFactory:'장난감공장',brickFactory:'벽돌공장'})[kind],2.45,2.15,3.1,top,'#fff0d3');
  box(g,'#987957',1.2,.55,2.6,2.4,.14,.85);
  if(kind==='cookieFactory'){
   for(let i=0;i<6;i++){const x=.35+i%3*.6,z=2.35+Math.floor(i/3)*.45;cylinder(g,'#dca85f',x,.68,z,.22,.09);dot(g,'#885f43',x,.74,z,.035);}
   for(const x of[-2.8,-2.2])ball(g,'#e4d1a5',x,.5,2.1,.34,.5,.3);
   cylinder(g,'#b28757',0,3.65,.3,.45,.18).rotation.x=Math.PI/2;
  }else if(kind==='woodFactory'){
   for(let i=0;i<5;i++){const log=cylinder(g,'#a98154',-2.75+(i%2)*.48,.32+Math.floor(i/2)*.35,1.5,.22,2);log.rotation.x=Math.PI/2;}
   for(let i=0;i<4;i++)box(g,'#dab582',1.2,.7+i*.14,2.6,2.2,.11,.7);
   cylinder(g,'#9baba5',.8,1.18,2.5,.42,.07).rotation.x=Math.PI/2;
  }else if(kind==='toyFactory'){
   for(let i=0;i<4;i++)box(g,['#cc8f75','#88aaa0'][i%2],.35+i*.5,.85,2.6,.38,.4,.4);
   ball(g,'#e6bc70',-.5,3.6,.3,.5,.32,.3);ball(g,'#e6bc70',-.12,3.95,.3,.23);cone(g,'#ce8e52',.12,3.95,.3,.12,.25).rotation.z=-Math.PI/2;
   for(const x of[-1.4,0,1.4])box(g,'#b9d8d0',x,3.15,-.2,.7,.12,1.3);
  }else{
   for(let i=0;i<12;i++)box(g,i%2?'#c48866':'#b27256',-2.6+i%3*.52,.22+Math.floor(i/3)*.25,2.4,.48,.22,.65);
   rounded(g,'#7c6252',1.4,1.1,1.95,1.15,1.3,.12,.35);box(g,'#dcab63',1.4,.9,2.05,.75,.55,.08);
  }
  for(const x of[-3,3])pot(g,x,-2.5);
  return [];
 }
 return {bakery:[g=>neighborhood(g,'bakery'),.6],florist:[g=>neighborhood(g,'florist'),.6],seasideCafe:[g=>neighborhood(g,'seasideCafe'),.6],pottery:[g=>neighborhood(g,'pottery'),.6],artGallery:[g=>neighborhood(g,'artGallery'),.6],postOffice:[g=>neighborhood(g,'postOffice'),.6],cookieFactory:[g=>factory(g,'cookieFactory'),.6],woodFactory:[g=>factory(g,'woodFactory'),.6],toyFactory:[g=>factory(g,'toyFactory'),.6],brickFactory:[g=>factory(g,'brickFactory'),.6],islandCafe:[islandCafe,.6],glassGarden:[glassGarden,.6],cloudObservatory:[cloudObservatory,.6],mistHydrangea:[mistHydrangea,.6],fireflyPond:[fireflyPond,.6],wishTree:[wishTree,.6],duplex:[duplex,.6],gardenhouse:[gardenhouse,.6],terracehouse:[terracehouse,.6],chicken:[chicken,.6],buffet:[buffet,.6],police:[police,.6],cinema:[cinema,.6],harbor:[harbor,.6],skyTower:[skyTower,.6],rabbitTower:[rabbitTower,.6],rosePark:[rosePark,.6],animalFarm:[animalFarm,.6],largePark:[largePark,.6],lavender:[lavender,.6],hydrangea:[hydrangea,.6],fountain:[smallFountain,.6],flowerArch:[flowerArch,.6],moonGarden:[moonGarden,.6],goldFountain:[goldFountain,.6],starTree:[starTree,.6]};
}

