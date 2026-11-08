import {buildingSpec} from './city-rules.mjs?v=perf1';
export const PAINTABLE=new Set(['dokdoGuest','dokdoTea','house','duplex','gardenhouse','apartment','terracehouse','snack','convenience','chicken','western','japanese','chinese','buffet','supermarket','cinema','animalFarm','harbor','skyTower','rabbitTower']);
export const PALETTES=[
 {name:'기본색',wall:'#f1e3c3',roof:'#719784',accent:'#547668'},
 {name:'따뜻한 크림',wall:'#f6e8c6',roof:'#ad895a',accent:'#826b49'},
 {name:'벚꽃 분홍',wall:'#f2ded7',roof:'#bb7b88',accent:'#865d70'},
 {name:'숲속 민트',wall:'#dfebe0',roof:'#69a394',accent:'#427b71'},
 {name:'벽돌 주황',wall:'#edd2b5',roof:'#b9684c',accent:'#8d503f'},
 {name:'밤하늘 남색',wall:'#e9e0cc',roof:'#435e79',accent:'#34495d'}
];
export const validPaint=n=>Number.isInteger(n)&&n>=0&&n<PALETTES.length;
export const canPaint=b=>!!b&&b.progress>=1&&PAINTABLE.has(b.type);
export const paintCost=(s,b,value)=>(b.paint??0)===value?0:Math.min(100,Math.max(5,Math.ceil(buildingSpec(s,b.type).cost/100)));
export function setBuildingPaint(s,id,value){
 const b=s.buildings.find(b=>b.id===id);
 if(!canPaint(b)||!validPaint(value))return {error:'완성된 건물과 색을 다시 골라 주세요.'};
 if(s.ended)return {error:'마을을 이어서 가꾼 뒤 바꿔 주세요.'};
 const cost=paintCost(s,b,value);
 if(!Number.isFinite(s.money)||s.money<cost)return {error:`색을 바꾸려면 ${cost}코인이 필요해요.`};
 s.money-=cost;
 if(value===0)delete b.paint;else b.paint=value;
 return {cost};
}
// Only explicitly tagged exterior parts change; shared source materials stay untouched.
export function paintPart(mesh,role){mesh.userData.paintRole=role;return mesh;}
const finishes=new Map();
export function applyBuildingPaint(group,b){
 if(!canPaint(b)||!b.paint)return;
 const palette=PALETTES[b.paint];if(!palette)return;
 group.traverse(mesh=>{
  const role=mesh.userData.paintRole;if(!mesh.isMesh||!role)return;
  const source=mesh.material,key=source.uuid+':'+b.paint+':'+role;
  if(!finishes.has(key)){const finish=source.clone();finish.onBeforeCompile=source.onBeforeCompile;finish.customProgramCacheKey=source.customProgramCacheKey;finish.color.set(palette[role]);finish.userData.paintFinish=true;finishes.set(key,finish);}
  mesh.material=finishes.get(key);
 });
}
export function paintSwatch(type,index){
 const p=PALETTES[index],tower=type==='skyTower',rabbit=type==='rabbitTower',tall=['duplex','apartment','terracehouse'].includes(type);
 const shape=rabbit?`<ellipse cx="29" cy="15" rx="4" ry="10" fill="#f5e5cc"/><ellipse cx="43" cy="15" rx="4" ry="10" fill="#f5e5cc"/><ellipse cx="36" cy="41" rx="17" ry="18" fill="#f4e8d1"/><circle cx="36" cy="27" r="15" fill="#fff1d6"/><path d="M20 42h32" stroke="${p.accent}" stroke-width="7"/><circle cx="31" cy="27" r="1.5"/><circle cx="41" cy="27" r="1.5"/>`:tower?`<path d="M23 58L28 13 36 3 44 13 49 58Z" fill="#aacdcd" stroke="${p.accent}" stroke-width="3"/><path d="M36 12v46M27 25h18M25 41h22" stroke="${p.accent}" stroke-width="2"/>`:`<rect x="14" y="${tall?17:28}" width="44" height="${tall?40:29}" rx="3" fill="${p.wall}"/><path d="M8 ${tall?21:32}L36 ${tall?5:16} 64 ${tall?21:32}Z" fill="${p.roof}"/><rect x="30" y="40" width="12" height="17" rx="2" fill="#9a7757"/><path d="M19 37h7M46 37h7${tall?'M19 26h7M46 26h7':''}" stroke="#e5c47d" stroke-width="6"/><path d="M14 57h44" stroke="${p.accent}" stroke-width="3"/>`;
 return `<svg viewBox="0 0 72 64" aria-hidden="true"><ellipse cx="36" cy="58" rx="27" ry="4" fill="#d8dcca"/>${shape}</svg>`;
}
