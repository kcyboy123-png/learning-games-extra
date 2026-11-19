import {BANK,CHAPTERS,BANK_VERSION} from './bank-data.mjs';
import {makeNet,marks,key} from './geometry.mjs';
import {LESSON,TYPES,makeQuestion} from './questions.mjs';
export {BANK,CHAPTERS,BANK_VERSION};
export const gridKey=cells=>cells.map(key).sort().join('|');
export function parseGrid(value){try{const cells=value.split('|').map(s=>s.split(',').map(Number));if(cells.length<1||cells.length>6||new Set(cells.map(key)).size!==cells.length||cells.some(p=>p.length!==2||p.some(v=>!Number.isInteger(v)||Math.abs(v)>2)))return null;return cells;}catch{return null;}}
export const chapterFor=practice=>CHAPTERS.find(c=>practice===`bank:${c.id}`);
export const questionCount=practice=>chapterFor(practice)?.count??(practice==='course'?12:null);
export const validPractice=practice=>practice==='course'||Object.hasOwn(TYPES,practice)||!!chapterFor(practice);
export function getQuestion(practice,seed,index){
  const ch=chapterFor(practice);
  if(!ch)return makeQuestion(practice==='course'?LESSON[index]:practice,seed,index);
  const spec=BANK.filter(q=>q.chapter===ch.id)[index];if(!spec)throw Error('문제 순서를 확인해 주세요.');
  const q=structuredClone(spec);q.net=makeNet(q.cells,q.dimensions);
  if(typeof q.target==='string'&&q.target.includes(':')){q.marks=marks(q.net,q.type==='vertex'||q.focusKind==='vertex'?'vertex':'edge');if(q.type==='length')q.marks=q.marks.filter(m=>m.refs.length===1);q.options.forEach(o=>{if(o.markId)o.mark=q.marks.find(m=>m.id===o.markId);});}
  return q;
}
