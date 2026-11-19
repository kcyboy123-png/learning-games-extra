import {grade} from './questions.mjs';
import {getQuestion,questionCount,validPractice,parseGrid,gridKey} from './curriculum.mjs';

export const PROGRESS_KEY='net-workshop-progress-v1';
export function readProgress(raw){
  try{
    if(!raw||raw.length>200000)return null;
    const s=JSON.parse(raw),integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
    if(s.version!==1||!integer(s.seed,1,999999)||!integer(s.index,0,(questionCount(s.practice)??10000)-1)||
      !validPractice(s.practice)||!['auto','guided','predict'].includes(s.assistance)||
      !integer(s.attempts,0,50)||!Number.isFinite(s.progress)||s.progress<0||s.progress>1||
      !['solved','revealed','helped','locked','viewModel'].every(k=>typeof s[k]==='boolean')||
      s.solved&&s.revealed||!Array.isArray(s.session)||s.session.length>500)return null;
    if(!s.session.every(r=>r&&typeof r.id==='string'&&typeof r.correct==='boolean'&&typeof r.helped==='boolean'&&integer(r.attempt,1,50)))return null;
    const q=getQuestion(s.practice,s.seed,s.index),valid=v=>{
      if(v===null)return true;
      if(q.type==='build'){const cells=parseGrid(v);return cells&&q.initialCells.every(p=>cells.some(c=>c[0]===p[0]&&c[1]===p[1]));}
      if(q.answerMode==='all')return Array.isArray(v)&&v.length>0&&new Set(v).size===v.length&&v.every(id=>q.options.some(o=>o.id===id));
      return q.options.some(o=>o.id===v);
    };
    if(!valid(s.selected)||!valid(s.lastSubmitted)||s.solved&&!grade(q,s.selected)||s.revealed&&!grade(q,s.selected))return null;
    if(q.type==='build'&&s.makerCells!==undefined&&(!Array.isArray(s.makerCells)||!parseGrid(gridKey(s.makerCells))||gridKey(s.makerCells)!==s.selected))return null;
    if((s.solved||s.revealed)&&s.attempts===0)return null;
    return s;
  }catch{return null;}
}
