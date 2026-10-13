'use strict';
// Short, bounded excursions. The mission anchor stays fixed for navigation.
window.JOSEON_NPC_WANDER={create(map,allowed,random=Math.random){
 const states=map.nodes.map((anchor,i)=>({anchor:[...anchor],position:[...anchor],target:[...anchor],mode:'idle',wait:5+i*2.7,face:1,returning:false,held:false}));
 function update(dt,hero,reduced){
  states.forEach((s,i)=>{
   if(reduced){s.position=[...s.anchor];s.mode='idle';s.face=1;s.wait=6+i*2;return;}
   if(s.held||Math.hypot(hero[0]-s.anchor[0],hero[1]-s.anchor[1])<150)return;
   if(s.mode==='walk'){
    const dx=s.target[0]-s.position[0],dy=s.target[1]-s.position[1],d=Math.hypot(dx,dy),step=30*dt;
    if(d<=step){s.position=[...s.target];s.mode=s.returning?'idle':'look';s.wait=s.returning?9+random()*8:1.8+random()*1.6;s.returning=false;s.lookTurned=false;}
    else{s.position[0]+=dx/d*step;s.position[1]+=dy/d*step;}
    return;
   }
   s.wait-=dt;if(s.mode==='look'&&s.wait<1&&!s.lookTurned){s.face*=-1;s.lookTurned=true;}if(s.wait>0)return;
   if(s.mode==='look'){s.target=[...s.anchor];s.returning=true;s.mode='walk';s.face=s.target[0]<s.position[0]?-1:1;return;}
   const angle=random()*Math.PI*2,length=27+random()*13,target=[s.anchor[0]+Math.cos(angle)*length,s.anchor[1]+Math.sin(angle)*length];
   if([.25,.5,.75,1].every(t=>allowed(map,s.anchor[0]+(target[0]-s.anchor[0])*t,s.anchor[1]+(target[1]-s.anchor[1])*t))){s.target=target;s.mode='walk';s.face=target[0]<s.position[0]?-1:1;}
   else{s.wait=4+random()*4;s.face*=-1;}
  });
 }
 return{states,update,snapshot:()=>states.map(s=>({position:[...s.position],anchor:[...s.anchor],mode:s.mode,face:s.face}))};
}};
