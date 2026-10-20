(function(root){
'use strict';
const base=[[0,0],[0,1],[1,1]],names=['A','B','C','D'];
function rotate(n){let a=base.map(p=>p.slice());for(let i=0;i<n;i++)a=a.map(([x,y])=>[-y,x]);const mx=Math.min(...a.map(p=>p[0])),my=Math.min(...a.map(p=>p[1]));return a.map(([x,y])=>[x-mx,y-my]);}
const cells=p=>rotate(p.r).map(([x,y])=>[x+p.x,y+p.y]);
function canPlace(q,placements,key,p){const target=cells(p),blocked=(q.blocked||[]).map(p=>p.join(',')),occupied=Object.entries(placements).filter(([k])=>k!==key).flatMap(([,v])=>cells(v).map(p=>p.join(',')));return target.every(([x,y])=>x>=0&&x<q.w&&y>=0&&y<q.h&&!blocked.includes([x,y].join(','))&&!occupied.includes([x,y].join(',')));}
function validShape(q,placements){return Object.keys(placements).length===4&&names.every(k=>placements[k]&&canPlace(q,placements,k,placements[k]))&&(!q.rule||cells(placements[q.rule.piece]).some(p=>p.join(',')===q.rule.cell.join(',')));}
function solveShape(q){function search(p,i){if(i===4)return validShape(q,p)?p:null;const k=names[i];for(let y=0;y<q.h;y++)for(let x=0;x<q.w;x++)for(let r=0;r<4;r++){const v={x,y,r};if(canPlace(q,p,k,v)&&(!q.rule||q.rule.piece!==k||cells(v).some(c=>c.join(',')===q.rule.cell.join(',')))){const result=search({...p,[k]:v},i+1);if(result)return result;}}return null;}return search({},0);}
function robotPath(q,commands){let [x,y]=q.start;const path=[[x,y]];for(const d of commands){const delta={R:[1,0],L:[-1,0],U:[0,-1],D:[0,1]}[d];if(!delta)return {path,valid:false,reason:'방향'};x+=delta[0];y+=delta[1];if(x<0||x>=q.w||y<0||y>=q.h)return {path,valid:false,reason:'지도 밖'};if((q.blocks||[]).some(p=>p[0]===x&&p[1]===y))return {path,valid:false,reason:'막힌 칸'};path.push([x,y]);}return {path,valid:true,arrived:x===q.goal[0]&&y===q.goal[1]};}
const X=root.DrawerExplore||(typeof require==='function'?require('./explore.js'):null);
function fresh(q){const base={cross:Array(9).fill(null),crossIndex:0,choice:null,order:[],selected:[],values:(q.fields||[]).map(()=>''),checks:[],slots:Array(q.len||0).fill(null),found:[],placements:{},piece:'A',rotation:0,commands:q.initial?.slice()||[],commandIndex:null,robotIndex:0,ran:false,hint:0,solutionUsed:false,passed:false};return X&&X.is(q)?{...base,...X.fresh(q)}:base;}
const same=(a,b)=>a.length===b.length&&a.every(v=>b.includes(v));
function valid(q,a,previous){
if(X&&X.is(q))return X.valid(q,a,previous);
if(q.type==='crossword'){const v=a.cross;if(v.length!==9||!v.every(n=>Number.isInteger(n)&&n>=1&&n<=9)||new Set(v).size!==9)return false;const [b,c,d,e,f,g,h,i,j]=v;return b*c+d===57&&e*f-g===9&&h===i*(j+1)&&b+e+h===24&&c+f+i===12&&d+g+j===9;}
if(q.type==='order')return a.order.length===q.answer.length&&a.order.every((v,i)=>v===q.answer[i]);
if(q.type==='choice')return a.choice===q.answer;
if(q.type==='multi')return same(a.selected,q.answers);
if(q.type==='numbers'&&q.unordered){const v=a.values.map(x=>String(x).trim());return v.length===q.answers.length&&v.every(x=>x!=='')&&new Set(v.map(Number)).size===v.length&&q.answers.every(x=>v.map(Number).includes(x));}
if(q.type==='numbers')return q.answers.every((v,i)=>String(a.values[i]).trim()!==''&&Number(a.values[i])===v);
if(q.type==='grid'){if(a.selected.length!==q.count)return false;if(q.symmetry==='vertical')return a.selected.every(i=>Number.isInteger(i)&&i>=0&&i<q.total&&(!q.excludeCenter||i%q.cols!==Math.floor(q.cols/2))&&a.selected.includes(Math.floor(i/q.cols)*q.cols+q.cols-1-i%q.cols));return true;}
if(q.type==='cards')return q.all?same(a.found,q.answers):a.slots.every(v=>v!==null)&&new Set(a.slots).size===a.slots.length&&q.answers.includes(Number(a.slots.join('')));
if(q.type==='shape')return validShape(q,a.placements);
if(q.type==='robot'){const p=robotPath(q,a.commands),changes=a.commands.filter((d,i)=>d!==q.initial[i]).length;return a.ran&&p.valid&&p.arrived&&(q.maxChanges==null||changes===q.maxChanges)&&(!q.differentFromPrevious||!previous||a.commands.join('')!==previous.commands.join(''));}
if(q.type==='write')return a.values.every((v,i)=>v.trim().length>=(q.minChars?.[i]||8))&&a.checks.length===q.checks.length&&new Set(a.values.map(v=>v.trim())).size===a.values.length;
return false;
}
const api={rotate,cells,canPlace,validShape,solveShape,robotPath,fresh,valid,names};root.DrawerLogic=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis==='undefined'?window:globalThis);
