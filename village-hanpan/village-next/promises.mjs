import {metrics,TYPES,month,RIVER,calendarMonth} from './core.mjs?v=economy3';
import {season} from './data.mjs?v=80min1';

// Optional, live challenges: completing one never changes money, scores or saved records.
export function villagePromises(s){
 const v=metrics(s),homes=v.live.filter(b=>TYPES[b.type].cap),insulated=homes.filter(b=>b.opts.includes('ins')).length;
 const greenery=v.live.filter(b=>['tree','avenue','flower'].includes(b.type)),benches=v.live.filter(b=>b.type==='bench');
 const near=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<=3;
 const gardenHomes=homes.filter(h=>greenery.some(g=>near(h,g))&&benches.some(b=>near(h,b))).length;
 const solar=v.live.some(b=>b.type==='solar'),reuse=v.live.some(b=>b.type==='workshop'||b.opts.includes('reuse'));
 const east=v.live.filter(b=>b.x>RIVER),eastHome=east.some(b=>TYPES[b.type].cap),eastFood=east.some(b=>TYPES[b.type].food);
 const solarPower=v.live.filter(b=>b.type==='solar').length*TYPES.solar.e*[.7,1,1.2,.9][season(calendarMonth(s))],share=v.production?solarPower/v.production:0;
 const late=[];
 if(month(s)>=12)late.push({id:'east',title:'개울 건너 새 이웃',description:'입구와 연결된 다리·산책길을 이어 강 건너에 집과 식생활 시설을 완공해요.',done:eastHome&&eastFood,progress:`강 건너 집 ${eastHome?'준비됨':'준비 중'} · 식생활 ${eastFood?'준비됨':'준비 중'}`,unlockIndex:12,type:![...v.net].some(k=>Number(k.split(',')[0])===RIVER)?(s.buildings.some(b=>b.type==='road'&&b.x===RIVER-1&&v.net.has(`${b.x},${b.y}`))?'bridge':'road'):![...v.net].some(k=>Number(k.split(',')[0])>RIVER)?'road':eastHome?'snack':'house'});
 if(month(s)>=24)late.push({id:'renewal',title:'창고에 다시 켜진 불',description:'강 건너 오래된 창고(14,7)를 재생 공간으로 열고 입구와 길을 연결해요.',done:v.live.some(b=>b.type==='workshop'),progress:v.live.some(b=>b.type==='workshop')?'재생 공간 운영 중':'재생 공간 준비 중',unlockIndex:24,type:s.buildings.some(b=>b.type==='workshop')?'road':'workshop'},{id:'sunlight',title:'햇살로 살아가는 마을',description:'현재 계절 기준 태양광이 전체 발전량의 50% 이상을 맡고 전력 수요를 모두 충족해요. 겨울에는 다시 살펴보세요.',done:share>=.5&&v.energy===1,progress:`태양광 ${Math.floor(share*100)}% · 전력 ${Math.floor(v.energy*100)}%`,unlockIndex:24,type:'solar'});
 return[
  {id:'food',title:'밥 걱정 없는 마을',description:'길에 연결된 식당·장보기 시설의 식생활 수요 충족률을 100%로 만들어요.',done:v.food===1,progress:`식생활 ${Math.floor(v.food*100)}%`,unlockIndex:0,type:'snack'},
  {id:'comfort',title:'포근한 우리 집',description:'길에 연결된 모든 집에 단열을 보강해 겨울·여름 전력 사용을 줄여요.',done:homes.length>0&&insulated===homes.length,progress:`단열 ${insulated}/${homes.length}집`,unlockIndex:0,type:'house',option:'ins'},
  {id:'garden',title:'집 앞 작은 쉼터',description:'길에 연결된 모든 집에서 가로·세로 거리 합 3칸 안에 정원·나무·꽃밭 중 하나와 벤치를 놓아요.',done:homes.length>0&&gardenHomes===homes.length,progress:`쉼터 가까운 집 ${gardenHomes}/${homes.length}`,unlockIndex:3,type:benches.length?'flower':'bench'},
  {id:'safety',title:'비와 불에 대비해요',description:'소방서와 빗물 배수 시설을 완공하고 마을 길에 연결해요.',done:v.fire&&v.drain,progress:`대비 시설 ${Number(v.fire)+Number(v.drain)}/2종`,unlockIndex:4,type:v.drain?'fire':'drain'},
  {id:'energy',title:'햇살도 보태는 전력',description:'길에 연결된 태양광 설비를 운영하면서 현재 계절의 전력 수요를 모두 충족해요.',done:solar&&v.energy===1,progress:`태양광 ${solar?'운영 중':'준비 중'} · 전력 ${Math.floor(v.energy*100)}%`,unlockIndex:0,type:'solar'},
  {id:'reuse',title:'다시 쓰는 건축가',description:'길에 연결된 시설에 재사용 자재를 적용하거나 오래된 창고를 재생 공간으로 열어요.',done:reuse,progress:reuse?'재사용 실천 중':'재사용 실천 준비',unlockIndex:0,type:'house',option:'reuse'},...late
 ];
}

// A completed-plan comparison at today's population/season, with no save or money changes.
export function promisePreview(s,type,x,y,moving=null){
 const current=villagePromises(s),buildings=moving?s.buildings.map(b=>b.id===moving?{...b,x,y}:b):[...s.buildings,{id:s.nextId,type,x,y,progress:1,opts:[],completedAt:s.t}];
 return villagePromises({...s,buildings}).flatMap((p,i)=>p.progress===current[i].progress&&p.done===current[i].done?[]:[{id:p.id,title:p.title,before:current[i].progress,after:p.progress,done:p.done}]);
}
