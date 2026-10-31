// 격자↔월드 좌표, 출입구 방향, 추천 부지, 보행 경로. 경제 상태는 읽기만 한다.
import {SIZE,RIVER,TYPES,cells,at,network,terrain,unlocked} from './core.mjs?v=animals8';
import {naturalFeature} from './landscape.mjs?v=animals8';
export const CELL=2.4, GROUND_Y=.103, ROAD_Y=.133;
export const DIRS=[[0,1],[1,0],[0,-1],[-1,0]]; // 0 남(+z) 1 동(+x) 2 북 3 서. 모델의 문은 로컬 +z.
export const toWorld=(gx,gy)=>({x:(gx-(SIZE-1)/2)*CELL,z:(gy-(SIZE-1)/2)*CELL});
export const toCell=(x,z)=>({gx:Math.round(x/CELL+(SIZE-1)/2)+0,gy:Math.round(z/CELL+(SIZE-1)/2)+0});
export const inside=(gx,gy)=>gx>=0&&gy>=0&&gx<SIZE&&gy<SIZE;
export const foot=type=>TYPES[type].foot||1;
// 모델 원점: 점유 칸들의 바닥 중앙(2×2는 네 칸 가운데).
export const origin=(type,gx,gy)=>{const n=foot(type),o=(n-1)/2;return toWorld(gx+o,gy+o);};
export const roadSet=s=>new Set(s.buildings.filter(b=>b.progress>=1&&['road','bridge'].includes(b.type)).map(b=>`${b.x},${b.y}`));
// 둘레 칸 목록: [바깥 칸 gx,gy, 방향 d] — 건물 칸에서 d 방향으로 한 칸 나간 자리.
export function perimeter(type,gx,gy){const n=foot(type),out=[];for(let i=0;i<n;i++){out.push([gx+i,gy+n,0]);out.push([gx+n,gy+i,1]);out.push([gx+i,gy-1,2]);out.push([gx-1,gy+i,3]);}return out;}
// 건물은 저장값 없이 인접한 길 쪽으로 문을 낸다. 길이 나중에 생겨도 자동으로 그쪽을 향한다. 2×2도 둘레 어느 변이든 길이 닿으면 그 변을 향한다.
export function facing(s,b,roads=roadSet(s)){for(const[x,y,d]of perimeter(b.type,b.x,b.y))if(roads.has(`${x},${y}`))return d;return 0;}
export function entrance(s,b,roads=roadSet(s)){for(const[x,y,d]of perimeter(b.type,b.x,b.y))if(roads.has(`${x},${y}`))return{gx:x,gy:y,dir:d};const n=foot(b.type);return{gx:b.x,gy:b.y+n,dir:0};}
export function placeInfo(s,type,gx,gy){const net=network(s),adj=perimeter(type,gx,gy).filter(([x,y])=>net.has(`${x},${y}`)).length,natural=cells({type,x:gx,y:gy}).some(([x,y])=>naturalFeature(x,y)&&!s.landscape?.cleared.includes(`${x},${y}`));return{adjacentRoads:adj,connected:adj>0,natural};}
const free=(s,type,gx,gy)=>cells({type,x:gx,y:gy}).every(([x,y])=>inside(x,y)&&x>=2&&(type==='bridge'?x===RIVER:x!==RIVER)&&!at(s,x,y)&&(terrain(x,y)!=='warehouse'||type==='workshop'));
// 추천 부지: 마을 입구와 이어진 길에 붙은 빈 땅. 정비비 없는 자리와 집 가까운 자리를 앞세운다. 정답이 아니라 접근성 좋은 후보 2~3곳.
// 길·다리는 길 끝에 이어지는 칸, 창고 재생은 (14,7) 고정.
export function spots(s,type,limit=3){const net=network(s),homes=s.buildings.filter(b=>TYPES[b.type].cap),out=[],seen=new Set();
 if(type==='workshop')return free(s,type,14,7)?[{gx:14,gy:7}]:[];
 const push=(gx,gy,score)=>{const k=`${gx},${gy}`;if(seen.has(k))return;seen.add(k);out.push({gx,gy,score});};
 const cost=(gx,gy)=>cells({type,x:gx,y:gy}).filter(([x,y])=>naturalFeature(x,y)&&!s.landscape?.cleared.includes(`${x},${y}`)).length*10;
 if(type==='road'||type==='bridge'){for(const k of net){const[x,y]=k.split(',').map(Number);for(const[dx,dy]of DIRS){const gx=x+dx,gy=y+dy;if(free(s,type,gx,gy))push(gx,gy,cost(gx,gy)+Math.abs(gx-5)+Math.abs(gy-8));}}}
 else for(let gx=2;gx<SIZE;gx++)for(let gy=0;gy<SIZE;gy++){if(!free(s,type,gx,gy))continue;const adj=perimeter(type,gx,gy).filter(([x,y])=>net.has(`${x},${y}`)).length;if(!adj)continue;
  const near=homes.length?Math.min(...homes.map(h=>Math.abs(h.x-gx)+Math.abs(h.y-gy))):0;push(gx,gy,cost(gx,gy)+near+(adj>1?-1:0));}
 return out.sort((a,b)=>a.score-b.score).slice(0,limit).map(({gx,gy})=>({gx,gy}));}
export function walkable(s,gx,gy,roads=roadSet(s)){if(!inside(gx,gy)||gx<2)return false;if(gx===RIVER)return roads.has(`${gx},${gy}`);const b=at(s,gx,gy);return !b||b.type==='road'||b.type==='bridge';}
// BFS. roadsOnly면 길 위로만 걷고 출발·도착 칸은 건물 칸이어도 허용(문 앞 드나들기).
export function path(s,from,to,roadsOnly=false){const roads=roadSet(s),key=(x,y)=>`${x},${y}`,ok=(x,y)=>roadsOnly?roads.has(key(x,y))||(x===to.gx&&y===to.gy):walkable(s,x,y,roads);
 if(!inside(to.gx,to.gy)||(!roadsOnly&&!walkable(s,to.gx,to.gy,roads)))return[];const start=[from.gx,from.gy],seen=new Map([[key(...start),null]]),q=[start];
 for(let i=0;i<q.length;i++){const p=q[i];if(p[0]===to.gx&&p[1]===to.gy){const r=[];let c=p;while(c){r.push(toWorld(...c));c=seen.get(key(...c));}return r.reverse().slice(1);}
  for(const[dx,dy]of DIRS){const n=[p[0]+dx,p[1]+dy],k=key(...n);if(!seen.has(k)&&inside(...n)&&ok(...n)){seen.set(k,p);q.push(n);}}}return[];}
export const canOffer=(s,type)=>unlocked(s,type);
