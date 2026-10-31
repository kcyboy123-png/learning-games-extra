// 화면 기준 수동 이동. 순수 함수만 둔다(DOM·three 없음) — 테스트 가능.
// 카메라는 center+(sin a, ·, cos a) 방향에서 center를 본다. 따라서 화면 위 = 지면 (-sin a, -cos a), 화면 오른쪽 = (cos a, -sin a).
export function groundVector(angle,ix,iy){const x=Math.cos(angle)*ix-Math.sin(angle)*iy,z=-Math.sin(angle)*ix-Math.cos(angle)*iy,l=Math.hypot(x,z);return l<1e-6?null:{x:x/l,z:z/l};}
export const inputVector=keys=>({ix:(keys.has('right')?1:0)-(keys.has('left')?1:0),iy:(keys.has('up')?1:0)-(keys.has('down')?1:0)});
// 연속 벡터 v(정규화)를 그대로 적분한다(축 스냅 없음 — 아이소메트릭에서는 단일 축이 곧 화면 대각선). 0.1 이하 서브스텝으로 X·Z를 따로 밀어
// 반지름 r의 네 모서리가 들어갈 칸을 검사한다. 막힌 축만 멈추므로 벽을 따라 미끄러지고 코너·강·건물은 뚫지 못한다.
export function step(pos,v,dist,walk,cell,toCell,r=.3){const p={x:pos.x,z:pos.z};const n=Math.max(1,Math.ceil(dist/.1)),d=dist/n;
 const ok=(x,z)=>[[x-r,z-r],[x+r,z-r],[x-r,z+r],[x+r,z+r]].every(([cx,cz])=>{const c=toCell(cx,cz);return walk(c.gx,c.gy);});
 for(let i=0;i<n;i++){const nx=p.x+v.x*d;if(v.x&&ok(nx,p.z))p.x=nx;const nz=p.z+v.z*d;if(v.z&&ok(p.x,nz))p.z=nz;}return p;}
