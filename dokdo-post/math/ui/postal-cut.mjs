import {node,button,clear,setPressed} from './dom.mjs';
import {createSolidView} from './solid-view.mjs?v=six-mission-20261117';
import {netFigure,createFoldView} from './net-board.mjs';
import {unfoldByFolds} from '../lib/net.mjs';
import {cuboid,FACE_LABEL} from '../lib/geometry.mjs';

function loopEdges(folds){
 const solid=cuboid(1,1,1),links=folds.map(edge=>({edge,faces:solid.faces.filter(f=>f.edges.includes(edge)).map(f=>f.id)}));
 for(const excluded of links){const [from,to]=excluded.faces,queue=[[from,[]]],seen=new Set([from]);while(queue.length){const [face,path]=queue.shift();if(face===to)return [...path,excluded.edge];for(const link of links){if(link===excluded||!link.faces.includes(face))continue;const next=link.faces.find(f=>f!==face);if(!seen.has(next)){seen.add(next);queue.push([next,[...path,link.edge]]);}}}}
 return folds;
}
// Inspect first; unfolding and the cause of failure appear only after submission.
export function postalCut(step){
 let selected=null,fold=null;
 const choices=node('div',{class:'cut-choices'}),preview=node('div',{class:'cut-preview'}),feedback=node('div',{class:'cut-feedback',role:'status'}),buttons=new Map();
 const el=node('div',{class:'cut-workbench'},[choices,preview,feedback]);
 function inspect(plan){
  clear(preview);clear(feedback);el.classList.remove('cut-reviewed');
  const v=createSolidView({dims:{x:2,y:2,z:2},size:300,scale:68,postal:true,mode:'none',transparent:false,ariaLabel:`절개안 ${plan.id} 확대 · 끌어서 뒤쪽도 살펴요`});v.markWrong(plan.cuts);
  preview.append(node('strong',{text:`절개안 ${plan.id} · 빨간 선을 잘라요`}),v.el,node('small',{text:'상자를 끌어 뒤쪽도 봐요'}),button('뒤쪽 보기',()=>v.rotate(Math.PI,0)));
  return v;
 }
 function choose(id){selected=id;buttons.forEach((b,k)=>{setPressed(b,k===id);b.classList.remove('wrong');});inspect(step.plans.find(p=>p.id===id));}
 for(const plan of step.plans){const thumb=createSolidView({dims:{x:2,y:2,z:2},size:90,scale:20,mode:'none',transparent:false});thumb.markWrong(plan.cuts);thumb.svg.removeAttribute('tabindex');thumb.el.inert=true;
 const b=button('',()=>choose(plan.id),{attrs:{'aria-label':`절개안 ${plan.id} 선택`,'aria-pressed':'false'}});b.replaceChildren(thumb.el,node('span',{text:`${plan.id}안 · ${plan.cuts.length}곳 자르기`}));choices.append(b);buttons.set(plan.id,b);}
 inspect(step.plans[0]);
 return {el,tools:[],getAnswer:()=>({selected}),restore(a){if(step.plans.some(p=>p.id===a.selected))choose(a.selected);},markWrong(r){for(const id of r.wrong||[])buttons.get(id)?.classList.add('wrong');},
 afterCheck(result){if(!selected)return;const plan=step.plans.find(p=>p.id===selected),r=unfoldByFolds({x:1,y:1,z:1},plan.folds);clear(feedback);el.classList.add('cut-reviewed');
 if(result.ok)return;
 clear(preview);
 if(r.status==='disconnected'){
  const missing=cuboid(1,1,1).faces.filter(f=>!r.pieces.some(p=>p.id===f.id));
  const right=Math.max(...r.pieces.map(p=>p.x+p.w));
  const pieces=[...r.pieces,...missing.map((f,i)=>({id:f.id,x:right+1.2,y:i*1.5,w:1,h:1}))];
  preview.append(node('strong',{text:'잘라 보니 면이 떨어져요'}),netFigure(pieces,{size:300}),node('small',{text:missing.map(f=>FACE_LABEL[f.id]).join('·')+'이 다른 면과 이어져 있지 않아요.'}));
 }else{
  const v=createSolidView({dims:{x:2,y:2,z:2},size:300,scale:68,mode:'none',transparent:true});v.markWrong(loopEdges(plan.folds));v.el.classList.add('uncut-preview');
  preview.append(node('strong',{text:'주황 연결이 고리를 만들어요'}),v.el,node('small',{text:'주황선은 자르지 않고 남은 연결이에요.'}),button('뒤쪽 보기',()=>v.rotate(Math.PI,0)));
 }
 feedback.textContent=r.status==='disconnected'?'너무 많이 잘라 한 장으로 이어지지 않아요.':r.status==='not-flat'?'붙은 모서리가 고리처럼 이어져 평평하게 펼칠 수 없어요.':result.message;
 },
 summaryArt(){if(!selected)return null;const r=unfoldByFolds({x:1,y:1,z:1},step.plans.find(p=>p.id===selected).folds);if(!r.ok)return null;fold=createFoldView({pieces:r.pieces,size:290});fold.setT(1);fold.el.querySelector('.slider-row').hidden=true;const replay=button('다시 펼쳐 보기',()=>{fold.stop();fold.setT(1);fold.play();});const box=node('div',{class:'cut-success'},[node('strong',{text:'여섯 면이 한 장으로 펼쳐져요'}),fold.el,replay]);requestAnimationFrame(()=>{if(!box.isConnected)return;const art=fold.el.querySelector('svg');fold.setT(0);const flat=art.getBBox();fold.setT(1);const closed=art.getBBox();const x=Math.min(flat.x,closed.x)-20,y=Math.min(flat.y,closed.y)-20,w=Math.max(flat.x+flat.width,closed.x+closed.width)-x+20,h=Math.max(flat.y+flat.height,closed.y+closed.height)-y+20;art.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);fold.play();});return box;},destroy(){fold?.stop();}};
}
