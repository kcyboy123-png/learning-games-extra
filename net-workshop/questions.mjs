import {CUBE_NETS,HEXOMINOES,makeNet,analyze,opposite,marks,candidateCells,key,canonical} from './geometry.mjs';

export const TYPES={opposite:'마주 보는 면',edge:'만나는 모서리',vertex:'만나는 꼭짓점',complete:'빠진 면 채우기',valid:'상자가 될까?',length:'직육면체의 길이'};
export const LESSON=['opposite','opposite','edge','edge','vertex','vertex','complete','complete','valid','valid','length','length'];
export function random(seed){let s=seed>>>0;return ()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function shuffled(values,rng){const a=values.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const invalid=HEXOMINOES.filter(c=>!analyze(makeNet(c)).valid);

export function makeQuestion(type,seed=1,index=0){
  if(!Object.hasOwn(TYPES,type))throw Error('문제 종류를 확인해 주세요.');
  const rng=random((seed+index*7919)>>>0),pick=a=>a[Math.floor(rng()*a.length)];
  let cells=pick(CUBE_NETS).map(p=>p.slice());
  const turn=Math.floor(rng()*4);cells=cells.map(([a,b])=>{let x=a,y=b;for(let i=0;i<turn;i++)[x,y]=[-y,x];return [x,y];});
  const dimensions=type==='length'?pick([[4,3,2],[5,3,2],[6,4,2]]):[1,1,1];
  if(type==='valid'&&rng()<.5)cells=pick(invalid);
  let net=makeNet(cells,dimensions);
  const labels=shuffled(['가','나','다','라','마','바'],rng);
  const q={id:`${type}-${seed}-${index}`,type,net,labels,answers:[],options:[],target:null,title:'',instruction:'',explanation:'',hint:''};
  if(type==='opposite'){
    q.target=Math.floor(rng()*6);const answer=opposite(net,q.target);q.answers=[String(answer)];
    q.options=net.faces.filter(f=>f.id!==q.target).map(f=>({id:String(f.id),label:`${labels[f.id]} 면`,face:f.id}));
    q.title=`${labels[q.target]} 면과 마주 보는 면은?`;q.instruction='마주 볼 것 같은 면을 하나 눌러 보세요.';
    q.explanation=`${labels[q.target]} 면과 ${labels[answer]} 면은 상자의 서로 반대쪽에 있어요. 두 면은 모서리나 꼭짓점에서 만나지 않아요.`;
    q.hint=`★ 표시가 있는 ${labels[q.target]} 면을 찾아요. 그 면과 모서리를 함께 쓰는 면은 마주 보는 면이 아니에요.`;
  }else if(type==='edge'||type==='vertex'){
    const all=marks(net,type);const possible=all.filter(m=>all.some(n=>n.id!==m.id&&m.foldedKey===n.foldedKey));
    const target=pick(possible);q.target=target.id;q.marks=all;
    const answers=all.filter(m=>m.id!==target.id&&m.foldedKey===target.foldedKey);
    q.answers=answers.map(m=>m.id);
    const eligible=all.filter(m=>m.id!==target.id&&(type!=='edge'||m.refs.length===1));
    const distractors=shuffled(eligible.filter(m=>!q.answers.includes(m.id)),rng).slice(0,Math.max(0,4-answers.length));
    q.options=shuffled([...answers,...distractors],rng).map((m,i)=>({id:m.id,label:String(i+1),mark:m}));
    q.title=type==='edge'?'★ 모서리와 만나는 모서리는?':'★ 꼭짓점과 만나는 꼭짓점은?';
    q.instruction='숫자가 붙은 곳을 하나 고르세요. 답이 여럿이면 하나만 골라도 돼요.';
    q.explanation=type==='edge'?'펼쳐졌을 때 떨어져 있던 두 모서리가 접으면 길이와 위치가 같아져 하나의 모서리가 돼요.':'펼쳐졌을 때 떨어져 있던 점들이 접으면 상자의 같은 꼭짓점에 모여요.';
    q.hint='★가 있는 면을 먼저 찾아요. 그 면의 움직임을 눈으로 따라가 보세요.';
  }else if(type==='complete'){
    const leaves=net.faces.filter(f=>net.links.filter(l=>l.parent===f.id||l.child===f.id).length===1);
    const removed=pick(leaves).id;q.missing=cells[removed];q.cells=cells.filter((_,i)=>i!==removed);q.net=makeNet(q.cells);
    q.options=candidateCells(q.cells).map((cell,i)=>({id:key(cell),label:String(i+1),cell}));
    q.answers=q.options.filter(o=>analyze(makeNet([...q.cells,o.cell])).valid).map(o=>o.id);
    q.title='한 면을 어디에 붙이면 상자가 될까?';q.instruction='점선으로 표시한 빈칸을 하나 고르세요. 답이 여럿일 수 있어요.';
    q.explanation='선택한 면까지 여섯 면이 서로 겹치지 않고 상자를 닫으면 정답이에요. 다른 자리도 가능한지 살펴보세요.';
    q.hint='이미 있는 다섯 면을 접으면 어느 쪽이 비어 있을까요? 그 빈자리를 덮을 면이 필요해요.';
  }else if(type==='valid'){
    const result=analyze(net);q.answers=[result.valid?'yes':'no'];q.options=[{id:'yes',label:'상자가 돼요'},{id:'no',label:'상자가 안 돼요'}];
    q.title='이 모양을 접으면 정육면체가 될까?';q.instruction='면이 여섯 개라는 것만으로 결정하지 말고, 접힌 모습을 상상해 보세요.';
    q.explanation=result.valid?'여섯 면이 서로 다른 쪽을 채워 닫힌 정육면체가 돼요.':result.message;
    q.hint='같은 자리를 덮는 면이 있거나 덮지 못한 빈자리가 남는지 생각해 보세요.';
  }else{
    const all=marks(net,'edge').filter(m=>m.refs.length===1),target=pick(all);
    const f=net.faces[target.face],length=target.corner%2===0?f.w:f.h;
    q.target=target.id;q.marks=all;q.length=length;q.answers=[String(length)];
    q.options=[...new Set([...dimensions,dimensions.reduce((s,n)=>s+n,0)])].sort((a,b)=>a-b).map(v=>({id:String(v),label:`${v} cm`}));
    q.title='★ 모서리의 길이는 몇 cm일까?';q.instruction=`가로 ${dimensions[0]} cm, 세로 ${dimensions[1]} cm, 높이 ${dimensions[2]} cm인 상자예요.`;
    q.explanation=`★ 모서리와 ＝ 표시 모서리는 각각 ${length} cm예요. 접으면 같은 자리에서 만나 하나의 모서리가 돼요. 접혀도 길이는 바뀌지 않아요.`;
    q.hint='펼친 면의 가로·세로 길이를 살펴보세요. 같은 직사각형에서 마주 보는 두 변은 길이가 같아요.';
  }
  if(!q.answers.length)throw Error('정답이 없는 문제는 내보내지 않아요.');
  return q;
}

export function sameResponse(a,b){return JSON.stringify(Array.isArray(a)?a.slice().sort():a)===JSON.stringify(Array.isArray(b)?b.slice().sort():b);}
export function grade(q,choice){
  if(q.answerMode==='all')return Array.isArray(choice)&&new Set(choice).size===choice.length&&sameResponse(choice,q.answers);
  return q.answers.includes(String(choice));
}
export function questionFingerprint(q){return `${q.type}|${canonical(q.net.cells)}|${q.target}|${q.net.dimensions.join(',')}`;}
