(function(root){
 'use strict';
 const swaps={3:['g3-14','g3-11'],4:['g4-37','g4-11'],6:['g6-18','g6-11']};
 for(const [grade,ids] of Object.entries(swaps)){
  const catalog=root.ThinkstarGradeCatalogs?.[grade];if(!catalog)continue;
  const hard=catalog.find(m=>m.id===ids[0]),easy=catalog.find(m=>m.id===ids[1]);
  if(!hard||!easy||hard.difficulty!=='spicy')continue;
  catalog.forEach(m=>{m.gateRegion??=m.region||0;});
  hard.region=0;easy.region=hard.gateRegion;
 }

 const picks={"3":["g3-14","g3-35","g3-22","g3-17","g3-58","g3-34","g3-13","g3-56","g3-31","g3-08","g3-04","g3-30"],"4":["g4-55","g4-45","g4-60","g4-22","g4-51","g4-13","g4-18","g4-27","g4-03","g4-47","g4-04","g4-44"],"5":["cs-truth-clue","cs-cipher-table","csx-07","csx-31","csx-06","cs-library-guide","cs-plant-fair","csx-15","cs-fraction-snack","csx-02","csx-10","csx-27"],"6":["g6-40","g6-20","g6-30","g6-52","g6-36","g6-22","g6-15","g6-10","g6-09","g6-01","g6-32","g6-54"]};
 root.ThinkstarEntrySelection=picks;
 for(const [grade,ids] of Object.entries(picks)){
  const catalog=root.ThinkstarGradeCatalogs?.[grade];
  if(!catalog)continue;
  catalog.forEach(m=>{m.previousEntryRegion=m.region||0;m.gateRegion??=m.region||0;});
  const incoming=ids.map(id=>catalog.find(m=>m.id===id)).filter(m=>m&&m.region);
  const outgoing=catalog.filter(m=>!m.region&&!ids.includes(m.id));
  if(incoming.length!==outgoing.length)throw new Error('첫 지대 배치 수 불일치');
  incoming.forEach((m,i)=>{outgoing[i].region=m.region;m.region=0;});
  ids.forEach((id,i)=>{const m=catalog.find(m=>m.id===id);if(m)m.entryRank=i;});
 }
 const premiumPicks={"3":["g3-05","g3-30","g3-56","g3-08","g3-28","g3-31","g3-35","g3-34","g3-22","g3-58","g3-13","g3-14"],"4":["g4-03","g4-04","g4-01","g4-44","g4-47","g4-60","g4-45","g4-22","g4-13","g4-27","g4-55","g4-37"],"5":["csx-02","cs-fraction-snack","csx-27","cs-plant-fair","csx-10","csx-07","csx-31","cs-cipher-table","csx-06","cs-library-guide","cs-truth-clue","csx-23"],"6":["g6-32","g6-09","g6-54","g6-01","g6-10","g6-30","g6-20","g6-36","g6-22","g6-15","g6-40","g6-18"]};
 for(const [grade,ids] of Object.entries(premiumPicks)){
  const catalog=root.ThinkstarGradeCatalogs?.[grade];if(!catalog)continue;
  catalog.forEach(m=>{m.premiumPreviousRegion=m.region||0;delete m.entryRank;});
  const incoming=ids.map(id=>catalog.find(m=>m.id===id)).filter(m=>m&&m.region);
  const outgoing=catalog.filter(m=>!m.region&&!ids.includes(m.id));
  if(incoming.length!==outgoing.length)throw new Error('첫 지대 배치 수 불일치');
  incoming.forEach((m,i)=>{outgoing[i].region=m.region;m.region=0;});
  ids.forEach((id,i)=>{catalog.find(m=>m.id===id).entryRank=i;});
 }
 root.ThinkstarEntrySelection=premiumPicks;

})(globalThis);
