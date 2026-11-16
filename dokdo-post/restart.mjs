// Archive before replacing the active record; a failed backup must never erase progress.
export function savedRuns(storage,key){
 const raw=storage?.getItem(key+':previous-runs');
 if(!raw)return [];
 const runs=JSON.parse(raw);
 if(!Array.isArray(runs)||runs.some(r=>typeof r?.raw!=='string'||typeof r?.at!=='string'))throw Error('보관 기록을 읽지 못했어요. 현재 기록은 그대로 두었어요.');
 return runs;
}
export function switchRun(storage,key,expected,next){
 if(!storage)throw Error('저장 공간을 사용할 수 없어 새로 시작하지 못했어요.');
 if(storage.getItem(key)!==expected)throw Error('다른 창에서 기록이 바뀌었어요. 새로고침한 뒤 다시 시도해 주세요.');
 const runs=savedRuns(storage,key);
 if(expected!==null){
  const archive=JSON.stringify([...runs,{at:new Date().toISOString(),raw:expected}]);
  storage.setItem(key+':previous-runs',archive);
  if(storage.getItem(key+':previous-runs')!==archive)throw Error('기록 보관을 확인하지 못했어요. 다시 시도해 주세요.');
 }
 if(storage.getItem(key)!==expected)throw Error('다른 창의 기록을 보호했어요. 새로고침해 주세요.');
 storage.setItem(key,next);
 if(storage.getItem(key)!==next)throw Error('새 기록을 저장하지 못했어요. 이전 기록은 보관되어 있어요.');
}
