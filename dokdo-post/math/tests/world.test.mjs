import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorld} from '../lib/world.mjs';
const manifest=JSON.parse(readFileSync(new URL('../assets/art-manifest.json',import.meta.url)));
const world=createWorld(manifest.world);
test('그림 지도: 출발점과 모든 작업장 사이의 경로가 발 충돌 없이 연결된다',()=>{
 const points=[world.start,...world.places.map(p=>p.door)];
 for(const from of points) for(const to of points){
  const path=world.findPath(from,to); assert.ok(path);
  for(let i=1;i<path.length;i++){
   const a=path[i-1],b=path[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4)||1;
   for(let j=0;j<=n;j++) assert.ok(world.canStand(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n),JSON.stringify({from,to,a,b}));
  }
 }
});
test('건물 탭은 걷는 길에서 멈추고 같은 칸의 가까운 탭도 이동한다',()=>{
 const w=createWorld({width:128,height:128,walkRects:[[0,32,128,64]],places:[],start:[48,48]});
 assert.deepEqual(w.findPath([48,48],[52,50]),[[48,48],[52,50]]);
 const path=w.findPath([48,48],[80,10]);assert.ok(w.canStand(...path.at(-1)));assert.notDeepEqual(path.at(-1),[80,10]);
});
