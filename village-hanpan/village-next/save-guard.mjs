import {parseSave,serialize} from './core.mjs?v=perf1';
import {KEY,BACKUP} from './app-keys.mjs?v=perf1';
export const AUTO_BACKUP=KEY+'-auto-backup-v1';
export function homeRecord(storage){
 const primary=storage.getItem(KEY);
 if(primary!==null)return {text:primary,state:parseSave(primary),recovered:false};
 const backup=storage.getItem(AUTO_BACKUP);
 if(backup!==null)return {text:backup,state:parseSave(backup),recovered:true};
 return null;
}
export function guardedSave(storage,state,hadSave=false,explicitRecovery=false){
 const text=serialize(state);parseSave(text);
 const previous=storage.getItem(KEY);
 if(previous===null&&hadSave)throw Error('기존 저장이 사라져 덮어쓰기를 중단했어요. 마을 파일을 보관해 주세요.');
 if(previous!==null){
  let valid=true;try{parseSave(previous);}catch(error){valid=false;if(!explicitRecovery||![BACKUP,BACKUP+'-corrupt'].some(key=>storage.getItem(key)===previous))throw error;}
  if(valid&&previous!==text){storage.setItem(AUTO_BACKUP,previous);if(storage.getItem(AUTO_BACKUP)!==previous)throw Error('복구본 보관 실패');}
 }
 storage.setItem(KEY,text);
 if(storage.getItem(KEY)!==text)throw Error('저장 확인 실패');
 return text;
}
