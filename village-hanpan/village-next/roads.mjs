// Read-only cached sets; coordinates/order/completion are checked on every access.
const cache=new WeakMap();
function roadsFor(s){
 const points=[];for(const b of s.buildings)if(b.progress>=1&&(b.type==='road'||b.type==='bridge'))points.push(`${b.x},${b.y}`);
 const key=points.join('|');let value=cache.get(s);
 if(!value||value.key!==key){value={key,roads:new Set(points)};cache.set(s,value);}
 return value;
}
export const roadSet=s=>roadsFor(s).roads;
export function network(s){
 const value=roadsFor(s),cozy=s.cozyV===1;if(value.net&&value.cozy===cozy)return value.net;
 const roads=value.roads,seen=new Set(),q=cozy&&!roads.has('5,3')?[...roads].slice(0,1):['5,3'];
 while(q.length){const k=q.pop();if(seen.has(k)||!roads.has(k))continue;seen.add(k);const[x,y]=k.split(',').map(Number);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])q.push(`${x+dx},${y+dy}`);}
 value.cozy=cozy;return value.net=seen;
}
