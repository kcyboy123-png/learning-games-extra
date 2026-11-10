// Reuse the approved food/cloth assets. Only the current meal is framed up close;
// classmates' eating poses are driven by their actual network actions, not local random animation.
import * as T from './vendor/three.module.js';
import {sharedTable} from './lib/together.mjs';
import {worldAt,elevation} from './trail.mjs';
import {groupOf,diningSeat,diningOffset} from './lib/mealgroup.mjs';
const wood=new T.MeshStandardMaterial({color:'#c2a479',roughness:.9});
const plate=new T.MeshStandardMaterial({color:'#f7efd9',roughness:.8});
const steamGeometry=new T.SphereGeometry(.04,7,5),steamMaterial=new T.MeshBasicMaterial({color:'#fff9e9',transparent:true,opacity:.25,depthWrite:false});
const cylinder=new T.CylinderGeometry(1,1,1,20),cube=new T.BoxGeometry(1,1,1);
function part(parent,geo,mat,x,y,z,sx,sy,sz){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
export function createDining(scene,templates){
  const root=new T.Group();root.name='classroom-dining';root.visible=false;scene.add(root);
  const positions=new Map();let positionKey=null;
  const tables=new Map(),center=new T.Vector3();let context=null,roster=[],layoutKey=null;
  function table(group){
    if(tables.has(group))return tables.get(group);
    const g=new T.Group();root.add(g);
    const cloth=part(g,cube,templates?.clothMat||plate,0,.03,0,2.9,.025,2.9);
    const top=part(g,cylinder,wood,0,.53,0,1.12,.07,1.12);
    const leg=part(g,cylinder,wood,0,.26,0,.16,.5,.16);
    const places=Array.from({length:5},()=>{
      const stool=templates?.stool.clone(true)||new T.Group();stool.visible=true;g.add(stool);
      if(!templates)part(stool,cylinder,wood,0,.4,0,.25,.06,.25);
      const dish=new T.Group();g.add(dish);
      const lunch=templates?.lunch.clone(true)||new T.Group();lunch.scale.setScalar(1.65);dish.add(lunch);
      if(!templates)part(lunch,cube,plate,0,.05,0,.4,.1,.25);
      const cup=templates?.cup.clone(true)||new T.Group();cup.position.set(0,0,0);cup.scale.setScalar(1.7);dish.add(cup);
      // Template steam is animated by the solo props; its material is shared but its transforms are not.
      for(const child of [...cup.children])if(child.userData.i!==undefined)cup.remove(child);
      if(!templates)part(cup,cylinder,plate,0,.09,0,.075,.18,.075);
      const puff=part(dish,steamGeometry,steamMaterial,0,.33,0,1,1,1);
      for(const object of [stool,lunch,cup])object.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;});
      return {stool,dish,lunch,cup,puff};
    });
    const data={g,cloth,top,leg,places};tables.set(group,data);return data;
  }
  const tagCanvas=document.createElement('canvas');tagCanvas.width=128;tagCanvas.height=80;
  const ctx=tagCanvas.getContext('2d');ctx.fillStyle='#f4d47d';ctx.beginPath();ctx.roundRect(5,5,118,64,25);ctx.fill();ctx.fillStyle='#234c3d';ctx.font='bold 40px sans-serif';ctx.textAlign='center';ctx.fillText('나',64,51);
  const tag=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(tagCanvas),depthTest:false,toneMapped:false}));tag.scale.set(.52,.33,1);tag.renderOrder=20;root.add(tag);
  const held=(templates?.gimbap.clone(true)||new T.Group());held.scale.setScalar(1.65);scene.add(held);held.visible=false;
  const sticks=templates?.sticks.clone(true)||new T.Group();scene.add(sticks);sticks.visible=false;
  const thermos=templates?.thermos.clone(true)||new T.Group();scene.add(thermos);thermos.visible=false;
  const stream=part(scene,cylinder,new T.MeshBasicMaterial({color:'#d8eef2',transparent:true,opacity:.75}),0,0,0,.008,1,.008);stream.visible=false;
  const tmp=new T.Vector3(),end=new T.Vector3(),up=new T.Vector3(0,1,0);
  function groupCenter(group){
    const o=context.shared?sharedTable(group):diningOffset(group,context.group),s=(context.kind==='picnic'?364:704)-o.z,p=worldAt(s,o.x);
    return {x:p.x,y:elevation(s)+(context.kind==='picnic'?.12:.14),z:p.z};
  }
  function point(slot,group=context.group){
    const key=group+":"+slot;if(positions.has(key))return positions.get(key);
    const s=diningSeat(slot,context.shared?0:context.slot),c=groupCenter(group);
    const value={x:c.x+s.x,y:c.y,z:c.z+s.z,yaw:s.yaw};positions.set(key,value);return value;
  }
  function begin(c,members){
    const key=JSON.stringify([c,members]);if(key===layoutKey)return;layoutKey=key;
    const pk=c?[c.kind,c.shared,c.slot,c.group].join(':'):null;if(pk!==positionKey){positions.clear();positionKey=pk;}
    context=c;roster=members;root.visible=!!c;
    if(!c){held.visible=sticks.visible=thermos.visible=stream.visible=false;return;}
    if(c.watch)held.visible=sticks.visible=thermos.visible=stream.visible=false;
    const s=c.kind==='picnic'?364:704,p=worldAt(s,0);center.set(p.x,elevation(s)+(c.kind==='picnic'?.12:.14),p.z);root.position.copy(center);
    for(const t of tables.values())t.g.visible=false;
    const groups=new Set([...(c.watch?[]:[c.group]),...members.map(m=>groupOf(m.slot))]);
    for(const group of groups){
      const t=table(group),o=groupCenter(group);t.g.visible=true;t.g.position.set(o.x-center.x,o.y-center.y,o.z-center.z);t.cloth.visible=c.kind==='picnic';t.top.visible=t.leg.visible=c.kind==='noodle';
      for(let i=0;i<5;i++){
        const local=diningSeat(i,c.shared?0:c.slot),q=t.places[i];q.stool.position.set(local.x,0,local.z);q.stool.rotation.y=local.yaw;q.stool.updateMatrix();
        q.dish.position.set(local.x*.55,c.kind==='picnic'?.045:.57,local.z*.55);q.dish.rotation.y=local.yaw;
        const member=members.find(m=>groupOf(m.slot)===group&&((m.slot%5+5)%5)===i);
        q.dish.visible=!!member;q.stool.visible=group===c.group||!!member;
        q.lunch.visible=c.kind==='picnic';q.cup.visible=c.kind==='noodle';q.puff.visible=c.kind==='noodle'&&member?.action!=='prepare';
        if(member&&templates){
          q.lunch.children[2].rotation.x=-1.95;q.lunch.children[2].updateMatrix();
          for(let j=0;j<3;j++)q.lunch.children[3+j].visible=j<3-member.bites;
        }
      }
    }
    const own=point(c.slot);tag.visible=!c.watch;tag.position.set(own.x-center.x,1.65,own.z-center.z);
  }
  function update(time,hands,meal,reduced){
    if(!context)return;
    held.visible=context.kind==='picnic'&&meal.action?.id==='bite'&&!!hands.heroR;
    sticks.visible=context.kind==='noodle'&&meal.action?.id==='bite'&&!!hands.heroR;
    const item=held.visible?held:sticks.visible?sticks:null;
    if(item){item.position.copy(hands.heroR).addScaledVector(hands.heroForward,.1);item.position.y+=.025;item.rotation.set(-.4,Math.atan2(hands.heroForward.x,hands.heroForward.z),.2,'YXZ');}
    thermos.visible=context.kind==='noodle'&&meal.action?.id==='pour'&&!!hands.teacherR;stream.visible=false;
    if(thermos.visible){
      thermos.position.copy(hands.teacherR);const own=point(context.slot);end.set(center.x+(own.x-center.x)*.55,center.y+.75,center.z+(own.z-center.z)*.55);
      thermos.rotation.set(1.2,Math.atan2(end.x-thermos.position.x,end.z-thermos.position.z),0,'YXZ');thermos.updateMatrixWorld(true);
      tmp.set(0,.16,0);thermos.localToWorld(tmp);end.sub(tmp);stream.position.copy(tmp).addScaledVector(end,.5);stream.scale.y=end.length();stream.quaternion.setFromUnitVectors(up,end.normalize());stream.visible=!reduced;
    }
    for(const t of tables.values())if(t.g.visible)for(const [i,q] of t.places.entries())if(q.puff.visible){q.puff.position.y=.3+(reduced?.06:(time*.15+i*.08)%.28);}
  }
  return {begin,update,point,center,teacherPoint(){const own=point(context.slot);return {x:own.x+.85,y:own.y,z:own.z-.25,yaw:-Math.PI/2};},
    snapshot:()=>({active:!!context&&!context.watch,kind:context?.kind,group:context?.group,slot:context?.slot,near:roster.filter(m=>groupOf(m.slot)===context?.group).map(m=>m.id),members:roster.map(m=>({id:m.id,slot:m.slot,action:m.action,position:context?point(m.slot,groupOf(m.slot)):null})),tables:[...tables].filter(([,t])=>t.g.visible&&root.visible).map(([group,t])=>({group,dishes:t.places.filter(p=>p.dish.visible).length}))})};
}

