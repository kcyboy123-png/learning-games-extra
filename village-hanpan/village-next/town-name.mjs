export const RENAME_COST=10000,DEFAULT_TOWN_NAME='도토리 마을';
const letters=new Intl.Segmenter('ko',{granularity:'grapheme'});
export const nameLength=value=>Array.from(letters.segment(value)).length;
export const townName=s=>s.townName??DEFAULT_TOWN_NAME;
export function validTownName(value){return typeof value==='string'&&value.length<=80&&value===value.normalize('NFC').trim()&&!/[\u0000-\u001f\u007f-\u009f\u200b\u200e\u200f\u202a-\u202e\u2066-\u2069]/u.test(value)&&nameLength(value)>=1&&nameLength(value)<=5;}
export function renameTown(s,value){
 const name=typeof value==='string'?value.normalize('NFC').trim():'';
 if(!validTownName(name))return{error:'이름은 공백을 포함해 1~5글자로 적어 주세요.'};
 if(name===townName(s))return{error:'지금과 같은 이름이에요. 코인은 사용하지 않았어요.'};
 if(!Number.isFinite(s.money)||s.money<RENAME_COST)return{error:'이름을 바꾸려면 10,000코인이 필요해요.'};
 s.money-=RENAME_COST;s.townName=name;return{name};
}
