// Only the active region is rendered. Funds, time, unlocks and history stay shared.
export const ISLAND_OPEN=false;
export const ISLAND_HOLD='독도 업데이트 준비 중이에요. 항구 건설과 섬 여행은 잠시 쉬어요.';
export const islandName=s=>s.island==='mist'?'안개꽃섬':'우리 마을';
export const totalPopulation=s=>s.pop+(s.otherIsland?.pop||0);
export const allBuildings=s=>s.otherIsland?[...s.buildings,...s.otherIsland.buildings]:s.buildings;
export const hasPassage=s=>!!s.otherIsland||s.buildings.some(b=>b.type==='harbor'&&b.progress>=1&&!b.closed);
export function switchIsland(s){
 if(!ISLAND_OPEN&&s.island!=='mist')return false;
 if(!hasPassage(s)||(!s.otherIsland&&(!Number.isSafeInteger(s.nextId)||s.nextId>Number.MAX_SAFE_INTEGER-7)))return false;
 const next=s.otherIsland||{pop:0,buildings:[],landscape:{version:1,cleared:[]}};
 if(!s.otherIsland){for(let y=3;y<=8;y++)next.buildings.push({id:s.nextId++,type:'road',x:5,y,opts:[],progress:1,starter:true,completedAt:s.t});}
 s.otherIsland={pop:s.pop,buildings:s.buildings,landscape:s.landscape};
 s.pop=next.pop;s.buildings=next.buildings;s.landscape=next.landscape;
 s.island=s.island==='mist'?'main':'mist';s.populationPeak=Math.max(s.populationPeak||0,totalPopulation(s));
 return true;
}
// Existing ports remain valid; only newly placed ports use these river-mouth sites.
export const harborSites=[[9,1],[12,1],[9,15],[12,15]];
export const harborSite=(x,y)=>harborSites.some(p=>p[0]===x&&p[1]===y);

// Sail outside the build grid so even legacy bridges cannot intersect the ferry.
export function ferryMouth(region){
 const harbor=region?.buildings.find(b=>b.type==='harbor'&&b.progress>=1&&!b.closed);
 return harbor&&harbor.y>=9?1:-1;
}
export function ferryPose(progress,from=-1,to=-1){
 const arriving=progress>=.5,phase=arriving?(progress-.5)*2:progress*2;
 const eased=phase*phase*(3-2*phase),side=arriving?to:from;
 return {x:6,z:side*(arriving?47-22*eased:25+22*eased),angle:(arriving?-side:side)>0?0:Math.PI};
}
