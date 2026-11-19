export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const mul=(a,t)=>a.map(v=>v*t);
export const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const close=(a,b,eps=1e-6)=>a.length===b.length&&a.every((v,i)=>Math.abs(v-b[i])<eps);
export const key=v=>v.map(x=>Math.round(x*1e6)/1e6).join(',');
export const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
export const CORNERS=[[-1,-1],[1,-1],[1,1],[-1,1]];
export const SIDE_NAMES=['아래','오른쪽','위','왼쪽'];
const rotate=(v,axis,t)=>add(add(mul(v,Math.cos(t)),mul(cross(axis,v),Math.sin(t))),mul(axis,dot(axis,v)*(1-Math.cos(t))));

export function canonical(cells){
  const variants=[];
  for(let mirror=0;mirror<2;mirror++)for(let r=0;r<4;r++){
    let pts=cells.map(([a,b])=>{let x=mirror?-a:a,y=b;for(let k=0;k<r;k++)[x,y]=[-y,x];return [x,y];});
    const minX=Math.min(...pts.map(p=>p[0])),minY=Math.min(...pts.map(p=>p[1]));
    pts=pts.map(([x,y])=>[x-minX,y-minY]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    variants.push(JSON.stringify(pts));
  }
  return variants.sort()[0];
}

export function enumerateHexominoes(){
  let shapes=new Map([['[[0,0]]',[[0,0]]]]);
  for(let n=2;n<=6;n++){
    const next=new Map();
    for(const shape of shapes.values())for(const [x,y] of shape)for(const [dx,dy] of DIRS){
      if(shape.some(p=>p[0]===x+dx&&p[1]===y+dy))continue;
      const k=canonical([...shape,[x+dx,y+dy]]);next.set(k,JSON.parse(k));
    }
    shapes=next;
  }
  return [...shapes.values()];
}

export function topology(cells,rootIndex){
  if(!Array.isArray(cells)||cells.length<1||cells.length>6||cells.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isInteger(v)||Math.abs(v)>20)))throw Error('격자 좌표가 올바르지 않아요.');
  if(new Set(cells.map(key)).size!==cells.length)throw Error('같은 칸에 면을 두 번 놓을 수 없어요.');
  const adjacent=cells.map(([x,y])=>DIRS.flatMap(([dx,dy])=>{
    const id=cells.findIndex(p=>p[0]===x+dx&&p[1]===y+dy);return id<0?[]:[{id,dx,dy}];
  }));
  const root=rootIndex??adjacent.reduce((best,list,i)=>list.length>adjacent[best].length?i:best,0);
  if(!Number.isInteger(root)||!cells[root])throw Error('기준면이 올바르지 않아요.');
  const visited=new Set([root]), order=[root], links=[];
  for(let i=0;i<order.length;i++)for(const step of adjacent[order[i]])if(!visited.has(step.id)){
    visited.add(step.id);order.push(step.id);links.push({parent:order[i],child:step.id,dx:step.dx,dy:step.dy});
  }
  return {root,order,links,connected:visited.size===cells.length,cycle:adjacent.reduce((s,a)=>s+a.length,0)/2>links.length};
}

export function poses(net,angles=1){
  const result=Array(net.faces.length);
  result[net.root]={c:[0,0,0],u:[1,0,0],v:[0,1,0],n:[0,0,1]};
  for(const [i,link] of net.links.entries()){
    const p=result[link.parent];if(!p)throw Error('면 연결 순서가 올바르지 않아요.');
    const a=typeof angles==='number'?angles:(angles[i]??0);
    const axis=link.dx?p.v:p.u;
    const theta=(link.dx||-link.dy)*Math.PI/2*a;
    const u=rotate(p.u,axis,theta),v=rotate(p.v,axis,theta),n=rotate(p.n,axis,theta);
    const pf=net.faces[link.parent],cf=net.faces[link.child];
    const hinge=add(p.c,mul(link.dx?p.u:p.v,(link.dx||link.dy)*(link.dx?pf.w:pf.h)/2));
    const c=add(hinge,mul(link.dx?u:v,(link.dx||link.dy)*(link.dx?cf.w:cf.h)/2));
    result[link.child]={c,u,v,n};
  }
  return result;
}

export function makeNet(cells,dimensions=[1,1,1],rootIndex){
  if(!Array.isArray(dimensions)||dimensions.length!==3||dimensions.some(d=>!Number.isFinite(d)||d<=0||d>20))throw Error('상자의 세 길이를 확인해 주세요.');
  const t=topology(cells,rootIndex);
  const net={cells:cells.map(p=>p.slice()),dimensions:dimensions.slice(),...t,faces:cells.map((_,i)=>({id:i,w:1,h:1}))};
  if(!t.connected)return net;
  const unit=poses(net,1);
  const axisLength=v=>dimensions[v.findIndex(n=>Math.abs(n)>.9)];
  net.faces=unit.map((frame,i)=>({id:i,w:axisLength(frame.u),h:axisLength(frame.v)}));
  return net;
}

export function corners(face,pose){
  return CORNERS.map(([x,y])=>add(add(pose.c,mul(pose.u,x*face.w/2)),mul(pose.v,y*face.h/2)));
}

export function flatBounds(net){
  const flat=poses(net,0),points=net.faces.flatMap((f,i)=>corners(f,flat[i]));
  return {minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1]))};
}

export function analyze(net){
  if(!net.connected)return {valid:false,reason:'disconnected',message:'면들이 떨어져 있어요. 모서리를 맞대어 한 덩어리로 이어 보세요.'};
  if(net.faces.length!==6)return {valid:false,reason:'count',message:`면이 ${net.faces.length}개예요. 상자를 닫으려면 6개의 면이 필요해요.`};
  if(net.cycle)return {valid:false,reason:'cycle',message:'네 면이 둘러 붙은 곳은 상자의 꼭짓점처럼 접히지 않아요. 면 하나를 옮겨 보세요.'};
  const flat=poses(net,0),final=poses(net,1);
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){
    const a=net.faces[i],b=net.faces[j];
    if(Math.abs(flat[i].c[0]-flat[j].c[0])<(a.w+b.w)/2-1e-6&&Math.abs(flat[i].c[1]-flat[j].c[1])<(a.h+b.h)/2-1e-6)
      return {valid:false,reason:'flat-overlap',pair:[i,j],message:'펼친 종이에서 두 면이 겹쳐요. 겹치지 않는 자리로 옮겨 보세요.'};
  }
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)if(close(final[i].n,final[j].n))return {valid:false,reason:'overlap',pair:[i,j],message:'두 면이 같은 방향으로 접혀 상자의 빈자리를 모두 채우지 못해요.'};
  const vertexGroups=new Map(),edgeGroups=new Map();
  net.faces.forEach((f,i)=>{
    const pts=corners(f,final[i]);
    pts.forEach((pt,k)=>{const id=key(pt);if(!vertexGroups.has(id))vertexGroups.set(id,[]);vertexGroups.get(id).push(`${i}:v${k}`);});
    pts.forEach((pt,k)=>{const id=[key(pt),key(pts[(k+1)%4])].sort().join('|');if(!edgeGroups.has(id))edgeGroups.set(id,[]);edgeGroups.get(id).push(`${i}:e${k}`);});
  });
  const closed=vertexGroups.size===8&&edgeGroups.size===12&&[...vertexGroups.values()].every(a=>a.length===3)&&[...edgeGroups.values()].every(a=>a.length===2);
  return {valid:closed,reason:closed?'valid':'closure',message:closed?'여섯 면이 겹치지 않고 상자를 닫아요.':'모서리의 길이나 위치가 맞지 않아 상자가 닫히지 않아요.',vertexGroups,edgeGroups,final};
}

export function marks(net,kind){
  const flat=poses(net,0),folded=poses(net,1),map=new Map();
  net.faces.forEach((f,i)=>{
    const fpts=corners(f,flat[i]),pts=corners(f,folded[i]);
    fpts.forEach((pt,k)=>{
      const isEdge=kind==='edge';
      const pk=isEdge?[key(pt),key(fpts[(k+1)%4])].sort().join('|'):key(pt);
      const location=isEdge?mul(add(pt,fpts[(k+1)%4]),.5):pt;
      const foldedKey=isEdge?[key(pts[k]),key(pts[(k+1)%4])].sort().join('|'):key(pts[k]);
      if(!map.has(pk))map.set(pk,{id:`${i}:${isEdge?'e':'v'}${k}`,face:i,corner:k,flat:location,flatEnds:isEdge?[pt,fpts[(k+1)%4]]:null,foldedKey,refs:[]});
      map.get(pk).refs.push({face:i,corner:k});
    });
  });
  return [...map.values()];
}

export function opposite(net,faceId){
  const frame=poses(net,1);return frame.findIndex(p=>dot(p.n,frame[faceId].n)<-.99999);
}

export function candidateCells(cells){
  const map=new Map();
  for(const [x,y] of cells)for(const [dx,dy] of DIRS){const p=[x+dx,y+dy];if(!cells.some(q=>close(p,q)))map.set(key(p),p);}
  return [...map.values()].sort((a,b)=>b[1]-a[1]||a[0]-b[0]);
}

export function foldAngles(net,progress,sequence=net.links.map((_,i)=>i)){
  const values=net.links.map(()=>0),p=Math.max(0,Math.min(1,progress));
  sequence.forEach((idx,stage)=>values[idx]=Math.max(0,Math.min(1,p*sequence.length-stage)));
  return values;
}

// Face interiors crossing is an error; shared boundary contact is allowed.
export function intersections(net,angles){
  const ps=poses(net,angles),pts=net.faces.map((f,i)=>corners(f,ps[i])),hits=[];
  function pointInside(point,f,p){const d=sub(point,p.c);return Math.abs(dot(d,p.u))<f.w/2-1e-5&&Math.abs(dot(d,p.v))<f.h/2-1e-5;}
  for(let a=0;a<net.faces.length;a++)for(let b=a+1;b<net.faces.length;b++){
    const pa=ps[a],pb=ps[b];
    if(Math.abs(dot(pa.n,pb.n))>.999999&&Math.abs(dot(sub(pa.c,pb.c),pb.n))<1e-5){
      // Rectangles remain orthogonal in their plane at coplanar endpoints.
      const axes=[pa.u,pa.v,pb.u,pb.v];
      const overlap=axes.every(axis=>{
        const aa=pts[a].map(p=>dot(p,axis)),bb=pts[b].map(p=>dot(p,axis));
        return Math.min(Math.max(...aa),Math.max(...bb))-Math.max(Math.min(...aa),Math.min(...bb))>1e-5;
      });
      if(overlap)hits.push([a,b]);continue;
    }
    let found=false;
    for(const [i,j] of [[a,b],[b,a]]){
      const target=ps[j];
      for(let k=0;k<4;k++){
        const v=pts[i][k],w=pts[i][(k+1)%4],d1=dot(sub(v,target.c),target.n),d2=dot(sub(w,target.c),target.n);
        if(d1*d2>=-1e-10)continue;
        const t=d1/(d1-d2),pt=add(v,mul(sub(w,v),t));
        if(pointInside(pt,net.faces[j],target)){found=true;break;}
      }
    }
    if(found)hits.push([a,b]);
  }
  return hits;
}

export function findFoldSequence(net){
  const indices=net.links.map((_,i)=>i),zeros=indices.map(()=>0);
  function search(order,remaining){
    if(!remaining.length)return order;
    for(const i of remaining){
      const a=zeros.slice();order.forEach(k=>a[k]=1);
      let clear=true;
      for(let t=1;t<=18;t++){a[i]=t/18;if(intersections(net,a).length){clear=false;break;}}
      if(clear){const result=search([...order,i],remaining.filter(k=>k!==i));if(result)return result;}
    }
    return null;
  }
  return search([],indices);
}

export const HEXOMINOES=enumerateHexominoes();
export const CUBE_NETS=HEXOMINOES.filter(c=>analyze(makeNet(c)).valid);
export const CROSS_NET=[[0,0],[1,0],[2,0],[3,0],[1,1],[1,-1]];
