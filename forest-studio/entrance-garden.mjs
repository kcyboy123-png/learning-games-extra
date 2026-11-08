import {sample,item,evaluate} from './core.mjs';

// A planted border, a water garden and a shaded terrace share a clear central walk.
// The 240-piece opening is staged separately from the unchanged 80-piece artwork limit.
export function entranceGarden(){
 const garden=sample().filter(it=>!['compost','rainbarrel','signpost','soilpath','poppy','tulip','reeds','maple'].includes(it.kind));
 // Keep tall crowns at the edges so the pond, fork and pavilion share an open sightline.
 for(const it of garden){if(it.kind==='cherry'){it.x=6.5;it.z=3.8;it.scale=.95;}if(it.kind==='willow'){it.x=-8.3;it.z=4.8;it.scale=.85;}if(it.kind==='birch'&&it.x>0){it.x=8.2;it.scale=.9;}}
 // The arrival stones lead into the shaded flower border, while the player's landing remains clear.
 const approach=[[-1.1,9.4,.9],[-1.6,8.1,1.05],[-1.95,6.8,1.35],[-1.55,5.5,1.0],[-1.15,4.2,1.2],[-1.5,2.9,1.15],[-2,1.6,.95]];
 garden.filter(it=>it.kind==='stonepath').forEach((it,i)=>{const p=approach[i];if(p){it.x=p[0];it.z=p[1];it.rotation=p[2];it.scale=i<3?1.42:1.18;}});
 const openingPond=garden.find(it=>it.kind==='pond');openingPond.scale=1.55;
 const pavilion=garden.find(it=>it.kind==='pavilion');pavilion.x=-4.8;pavilion.z=-1.9;pavilion.scale=1.12;
 const add=(kind,x,z,scale=1,rotation=0)=>garden.push(item(kind,x,z,scale,rotation));
 add('cherry',-2.4,-9.2,1.15);
 add('arch',3.5,-3.2,1.05,-.6);
 // The fork connects the arrival walk to the pavilion and the distant bench.
 for(const [x,z,r] of [[-2,1.5,-.6],[-2.9,.6,-.7],[-3.8,-.3,-.6],[-4.6,-1.2,-.6],[.6,-.8,.7],[1.65,-1.7,.7],[2.7,-2.6,.7],[3.75,-3.5,.7],[4.8,-4.4,.7]])add('stonepath',x,z,.85,r);
 // Repeated groups give each border a recognizable colour and height rhythm.
 for(const [x,z,s] of [[-3.7,8.6,1.0],[-5,4.3,.9],[-4.8,1.7,.8],[4.1,2.9,.85],[4.8,1.3,.85],[-6.9,-4.9,.8]])add('hydrangea',x,z,s);
 for(const [x,z,s] of [[-3.1,9.3,.65],[-3.3,5.5,.7],[-3.5,2.8,.7],[3.6,5.8,.65],[4.1,4.8,.7],[-6.9,-2,.75]])add('fern',x,z,s);
 for(const [x,z] of [[-2.7,6.5],[-2.8,4.8],[-3.1,3.3],[3.5,6.5],[3.9,4.6],[4.4,2.3]])add('daisy',x,z,.75);
 for(const [x,z] of [[-3.1,5.8],[-3.7,3.7],[-4.2,1.2],[3.3,6.9],[4.1,3.7],[5,1.5]])add('cosmos',x,z,.8,.4);
 for(const [x,z] of [[-2.5,5.5],[-2.8,3.8],[3.4,2.1],[-6.7,-1.2]])add('lavender',x,z,.7);
 // Low waterside planting leaves the pond's surface visible during the descent.
 add('iris',.1,4.2,.65);add('iris',2.6,4.9,.7);add('liriope',2.9,3.1,.7);
 add('boxwood',-6.8,-6.2,.8);add('boxwood',5.9,-7.3,.85);
 add('birdbath',-4.8,3.5,.9);add('lantern',-3.3,.25,.85);
 for(const [x,z] of [[-2.9,7.3],[-3.9,2.2],[3.1,6.4]])add('wildaster',x,z,.65);
 const base=garden.map((it,i)=>({...it,id:'entrance-'+i,
  kind:it.kind==='azalea'?'boxwood':it.kind,
  scale:it.scale*(['daisy','cosmos','lavender','wildaster'].includes(it.kind)?1.35:it.kind==='hydrangea'?1.12:it.kind==='fern'?1.2:it.kind==='stonepath'&&i<33?.9:1)
 }));
 // Four garden rooms: cool waterside, sunny flower walk, woodland shade, quiet terrace.
 const features=[
  ['oak',-5.8,5.8,1.05],['birch',8,-5.8,.9],['oak',-8.1,-5.3,.85],['birch',8.4,.8,.8],
  ['bench',-5.7,7,.85,.2],['bench',5.7,.5,.85,-1.4],
  ['signpost',4.3,7.5,.95,-.35],['birdhouse',-7.6,-6.2,1],
  ['lantern',-4.6,6.6,.8],['lantern',4.8,-.5,.8],['lantern',-4.3,-2.1,.8],['lantern',3.9,-5.4,.8],
  ['rock',-6.8,5.9,.6],['rock',3.5,3.9,.55],['rock',6.5,-4.6,.65],['rock',-7.5,-7.7,.65],
  ['boxwood',-6.9,8,.8],['boxwood',-4.7,7.9,.8],['boxwood',6.5,-2,.8],['boxwood',6.8,-7,.8],
  ['hydrangea',-5.2,-6.2,.85],['hydrangea',-3.7,-5.8,.85],['hydrangea',4.5,-7.7,.9],['hydrangea',2.9,-7.6,.9],
  ['stonepath',-2.3,7.6,.75,-.8],['stonepath',-3.3,7.4,.75,-.8],['stonepath',-4.3,7.2,.75,-.8],['stonepath',-5.1,6.9,.75,-.8],
  ['stonepath',3.1,-1.5,.75,.5],['stonepath',4.1,-1.1,.75,.5],['stonepath',5,-.7,.75,.5],['birdbath',-3.2,-6.9,.85]
 ];
 for(const [kind,x,z,scale,rotation=0] of features)base.push({...item(kind,x,z,scale,rotation),id:'entrance-'+base.length});
 const borders=[
  {x:-4.5,z:4.2,rx:1.6,rz:2.3,k:['cosmos','daisy','fern','moss']},
  {x:4.7,z:4.3,rx:1.3,rz:2.5,k:['iris','daisy','fern','moss']},
  {x:-3.9,z:9.3,rx:1.4,rz:.9,k:['cosmos','cosmos','fern','moss']},
  {x:3.4,z:9,rx:1.3,rz:1.1,k:['cosmos','daisy','fern','moss']},
  {x:-6.7,z:.8,rx:1.3,rz:2,k:['fern','liriope','wildaster','moss']},
  {x:6.7,z:1,rx:1.3,rz:2,k:['fern','bellflower','daisy','moss']},
  {x:-4.7,z:-7.4,rx:2.2,rz:1.1,k:['daisy','cosmos','liriope','fern']},
  {x:3.7,z:-7.8,rx:2.2,rz:1.3,k:['lavender','wildaster','iris','fern']}
 ];
 const hard=base.filter(it=>['stonepath','pavilion','bench','pond','arch'].includes(it.kind));
 for(const bed of borders){let placed=0;
  for(let j=0;j<240&&placed<16;j++){const angle=j*2.39996,r=Math.sqrt((j%31+.5)/31),x=bed.x+Math.cos(angle)*bed.rx*r,z=bed.z+Math.sin(angle)*bed.rz*r;
   if(hard.some(it=>Math.hypot(it.x-x,it.z-z)<(it.kind==='pavilion'?1.65:it.kind==='pond'?1.45:it.kind==='bench'?1.1:.8)))continue;
   if(base.slice(112).some(it=>Math.hypot(it.x-x,it.z-z)<.38))continue;
   const kind=bed.k[Math.floor(placed/4)],candidate={...item(kind,x,z,((kind==='moss'?1.15:.62)+(placed%3)*.10)*(bed.z>8&&['cosmos','daisy'].includes(kind)?1.22:1),angle),id:'entrance-'+base.length};
   if(!evaluate(base,candidate).ok)continue;base.push(candidate);placed++;
  }
  if(placed!==16)throw Error('Opening border lacks planting space');
 }
 if(base.length!==240)throw Error('Opening garden must contain 240 pieces');
 return base;
}
