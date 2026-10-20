(function(root){
  'use strict';
  // Open-ended inquiry steps: building, tiling, toggling and collecting. Arranging is free; only an explicit check or collect is judged.
  const types=['chain','combo','tiles','lights','place','truth','open'];
  const is=q=>!!q&&types.includes(q.type);
  const sorted=v=>v.slice().sort((x,y)=>x-y);

  // chain: number cards in a row; neighbours must be factor and multiple. State: order (card indexes), found (collected codes).
  const linked=(a,b)=>a!==b&&(a%b===0||b%a===0);
  function chainProblem(q,order){
    const min=q.min||q.cards.length;
    if(order.some(i=>!Number.isInteger(i)||i<0||i>=q.cards.length)||new Set(order).size!==order.length)return {text:'같은 카드는 한 번만 쓸 수 있어요.'};
    if(order.length<min)return {incomplete:true,text:`카드를 ${min}장${min<q.cards.length?' 이상':''} 이어 주세요.`};
    const v=order.map(i=>q.cards[i]);
    for(let i=1;i<v.length;i++)if(!linked(v[i-1],v[i]))return {text:`${i}번째 칸 ${v[i-1]}, ${i+1}번째 칸 ${v[i]}: 두 수는 약수와 배수 사이가 아니에요.`};
    if(q.end!=null&&v[0]!==q.end&&v[v.length-1]!==q.end)return {text:`${q.end} 카드가 열차의 맨 앞이나 맨 뒤에 있어야 해요.`};
    return null;
  }
  const digits=order=>Number(order.map(i=>i+1).join(''));
  const chainCode=(q,order)=>q.directed?digits(order):Math.min(digits(order),digits(order.slice().reverse()));
  const chainDecode=code=>String(code).split('').map(d=>Number(d)-1);

  // combo: counts of each bundle size reaching an exact target. State: slots (counts), found.
  const comboSum=(q,s)=>q.units.reduce((t,u,i)=>t+u.size*(s[i]||0),0);
  const packs=s=>s.reduce((t,n)=>t+(n||0),0);
  function comboAll(q){const out=[],cur=q.units.map(()=>0);(function go(i,left){if(i===q.units.length){if(left===0)out.push(cur.slice());return;}for(let c=0;c*q.units[i].size<=left;c++){cur[i]=c;go(i+1,left-c*q.units[i].size);}cur[i]=0;})(0,q.target);return out;}
  function comboProblem(q,s){
    if(s.length!==q.units.length||s.some(n=>!Number.isInteger(n)||n<0||n>99))return {incomplete:true,text:'묶음 수를 다시 골라 주세요.'};
    if(packs(s)===0)return {incomplete:true,text:'묶음을 하나 이상 담아 주세요.'};
    const sum=comboSum(q,s);
    if(sum!==q.target)return {text:`지금 꾸러미는 ${sum}${q.unit}입니다. 목표는 정확히 ${q.target}${q.unit}입니다.`};
    if(q.best==='min'&&packs(s)>Math.min(...comboAll(q).map(packs)))return {text:`정확히 ${q.target}${q.unit}는 맞아요. 하지만 묶음 수가 더 적은 꾸러미가 있어요.`};
    return null;
  }
  const comboCode=s=>s.reduce((t,n)=>t*100+n,1);
  function comboDecode(q,code){const s=[];let c=code;for(let i=q.units.length-1;i>=0;i--){s[i]=c%100;c=Math.floor(c/100);}return c===1?s:[];}

  // tiles: rectangles placed on a grid. State: selected (piece*64+top-left cell), rotation (chosen piece index), found.
  const blockedSet=q=>new Set((q.blocked||[]).map(([x,y])=>y*q.w+x));
  const pieceOf=code=>Math.floor(code/64);
  function tileCells(q,code){if(!Number.isInteger(code)||code<0)return null;const p=q.pieces[pieceOf(code)],c=code%64;if(!p||c>=q.w*q.h)return null;const x=c%q.w,y=Math.floor(c/q.w),out=[];for(let dy=0;dy<p.h;dy++)for(let dx=0;dx<p.w;dx++){if(x+dx>=q.w||y+dy>=q.h)return null;out.push((y+dy)*q.w+x+dx);}return out;}
  function tileMap(q,list){const map=new Map(),bl=blockedSet(q);let ok=true;for(const code of list){const cs=tileCells(q,code);if(!cs||cs.some(c=>bl.has(c)||map.has(c))){ok=false;continue;}cs.forEach(c=>map.set(c,code));}return {map,ok,free:q.w*q.h-bl.size};}
  function tileFit(q,list,piece,cell){const p=q.pieces[piece];if(!p)return null;const x=cell%q.w,y=Math.floor(cell/q.w),{map}=tileMap(q,list),bl=blockedSet(q);for(let dy=0;dy<p.h;dy++)for(let dx=0;dx<p.w;dx++){const ax=x-dx,ay=y-dy;if(ax<0||ay<0)continue;const code=piece*64+ay*q.w+ax,cs=tileCells(q,code);if(cs&&cs.every(c=>!bl.has(c)&&!map.has(c)))return code;}return null;}
  function tileProblem(q,list){
    const {map,ok,free}=tileMap(q,list),g=q.goal||{};
    if(!list.length)return {incomplete:true,text:'빈칸을 눌러 하나 이상 놓아 주세요.'};
    if(!ok||new Set(list).size!==list.length)return {text:'겹치거나 밖으로 나간 것이 있어요.'};
    if(g.full!==false&&map.size<free)return {incomplete:true,text:`아직 빈칸이 ${free-map.size}칸 남았어요.`};
    if(g.max!=null&&list.length>g.max)return {text:g.maxText||'빈틈없이 채웠어요. 하지만 더 적은 장수로 채우는 방법이 있어요.'};
    if(g.min!=null&&list.length<g.min)return {text:g.minText||'놓는 자리를 바꾸면 더 많이 놓을 수 있어요.'};
    for(const u of g.use||[]){const n=list.filter(c=>pieceOf(c)===u.piece).length;if((u.min!=null&&n<u.min)||(u.max!=null&&n>u.max))return {text:u.text};}
    return null;
  }
  const tileCode=list=>sorted(list).reduce((t,c)=>t*256+c,1);
  function tileDecode(code){const out=[];let c=code;while(c>1&&out.length<6){out.unshift(c%256);c=Math.floor(c/256);}return c===1?out:[];}
  function tileAll(q){const bl=blockedSet(q),n=q.w*q.h,used=new Set(),cur=[],out=[];(function go(){let cell=0;while(cell<n&&(bl.has(cell)||used.has(cell)))cell++;if(cell===n){if(!tileProblem(q,cur))out.push(tileCode(cur));return;}q.pieces.forEach((p,i)=>{const code=i*64+cell,cs=tileCells(q,code);if(!cs||cs.some(c=>bl.has(c)||used.has(c)))return;cs.forEach(c=>used.add(c));cur.push(code);go();cur.pop();cs.forEach(c=>used.delete(c));});})();return out;}

  // lights: toggle cells so every row and column holds an even number of lit cells. State: selected (toggled cells).
  function lightOn(q,toggles){const on=new Set(q.on||[]);for(const t of toggles)on.has(t)?on.delete(t):on.add(t);return on;}
  function lightOdd(q,on){const rows=Array(q.h).fill(0),cols=Array(q.w).fill(0);for(const i of on){rows[Math.floor(i/q.w)]++;cols[i%q.w]++;}return rows.some(n=>n%2)||cols.some(n=>n%2);}
  function lightProblem(q,t){
    if(!t.length)return {incomplete:true,text:'칸을 눌러 불을 바꿔 주세요.'};
    if(t.some(i=>!Number.isInteger(i)||i<0||i>=q.w*q.h)||new Set(t).size!==t.length)return {text:'칸을 다시 골라 주세요.'};
    const on=lightOn(q,t);
    if(q.minLit&&on.size<q.minLit)return {incomplete:true,text:`켜진 칸이 ${q.minLit}칸 이상이어야 해요. 지금은 ${on.size}칸이에요.`};
    if(q.toggles!=null&&t.length!==q.toggles)return {text:`정확히 ${q.toggles}칸만 바꿔야 해요.`};
    if(lightOdd(q,on))return {text:'켜진 칸 수가 홀수인 줄이 아직 있어요. 가로줄과 세로줄을 모두 세어 봐요.'};
    return null;
  }

  // place: number cards on linked cells; every group must have the same sum. State: slots (cell values), crossIndex (chosen cell).
  const placeSums=(q,s)=>q.groups.map(g=>g.every(i=>s[i]!=null)?g.reduce((t,i)=>t+s[i],0):null);
  function placeProblem(q,s){
    if(s.length!==q.cells||s.some(v=>v==null))return {incomplete:true,text:'빈칸에 수 카드를 모두 놓아 주세요.'};
    if(new Set(s).size!==s.length||s.some(v=>!q.digits.includes(v)))return {text:'수 카드는 한 번씩만 쓸 수 있어요.'};
    const sums=placeSums(q,s);
    if(sums.some(v=>v!==sums[0]))return {text:`${q.groupNames.map((n,i)=>n+' '+sums[i]).join(', ')}. 세 합이 서로 달라요.`};
    if(q.sum!=null&&sums[0]!==q.sum)return {text:`세 줄의 합이 모두 ${sums[0]}이에요. 이번에는 합이 ${q.sum}이어야 해요.`};
    return null;
  }

  // truth: a candidate-by-statement table. State: selected (cells marked true), order (cells marked false), found (chosen candidates).
  const truthAt=(q,c,s)=>q.statements[s].true.includes(c);
  const truthCount=(q,c)=>q.statements.filter(st=>st.true.includes(c)).length;
  function truthOpen(q){const n=q.statements.length,out=[];q.candidates.forEach((_,c)=>q.statements.forEach((_,s)=>{if(!(q.given||[]).includes(s))out.push(c*n+s);}));return out;}
  const truthWant=q=>q.candidates.map((_,c)=>c).filter(c=>truthCount(q,c)===q.exact);
  function truthProblem(q,a){
    const n=q.statements.length,cells=truthOpen(q),T=new Set(a.selected),F=new Set(a.order),left=cells.filter(i=>!T.has(i)&&!F.has(i)).length;
    if(left)return {incomplete:true,text:`표에 아직 정하지 않은 칸이 ${left}칸 있어요.`};
    if(!a.found.length)return {incomplete:true,text:'표를 다 채웠어요. 이제 조건에 맞는 번호를 골라 주세요.'};
    if(cells.some(i=>T.has(i)!==truthAt(q,Math.floor(i/n),i%n)))return {text:'표에 참·거짓을 다시 확인할 칸이 있어요. 문장에 번호를 하나씩 넣어 읽어 봐요.'};
    const want=truthWant(q);
    if(want.length!==new Set(a.found).size||want.some(c=>!a.found.includes(c)))return {text:'표는 맞아요. 참인 문장 수가 조건과 같은 번호를 빠짐없이, 그것만 골랐는지 확인해요.'};
    return null;
  }

  // open: number fields judged by a rule, so several different answers pass.
  function openProblem(q,a,previous){
    if(a.values.length!==q.fields.length||a.values.some(x=>String(x).trim()===''||!Number.isFinite(Number(x))))return {incomplete:true,text:'모든 칸에 수를 적어 주세요.'};
    const r=q.test(a.values.map(Number),previous&&Array.isArray(previous.values)?previous.values.map(Number):[]);
    return r===true?null:{text:String(r)};
  }

  function problem(q,a,previous){
    switch(q.type){
      case 'chain':return chainProblem(q,a.order);
      case 'combo':return comboProblem(q,a.slots);
      case 'tiles':return tileProblem(q,a.selected);
      case 'lights':return lightProblem(q,a.selected);
      case 'place':return placeProblem(q,a.slots);
      case 'truth':return truthProblem(q,a);
      case 'open':return openProblem(q,a,previous);
      default:return {text:''};
    }
  }
  const memo=new WeakMap();
  function need(q){
    if(q.need!=='all')return Number.isInteger(q.need)&&q.need>0?q.need:1;
    if(!memo.has(q))memo.set(q,q.type==='combo'?comboAll(q).length:q.type==='tiles'?tileAll(q).length:1);
    return memo.get(q);
  }
  const collects=q=>['chain','combo','tiles'].includes(q.type)&&need(q)>1;
  const code=(q,a)=>q.type==='chain'?chainCode(q,a.order):q.type==='combo'?comboCode(a.slots):tileCode(a.selected);
  const decode=(q,c)=>q.type==='chain'?{order:chainDecode(c)}:q.type==='combo'?{slots:comboDecode(q,c)}:{selected:tileDecode(c)};
  function codeValid(q,c){if(!Number.isSafeInteger(c)||c<=0)return false;const b=decode(q,c);return problem(q,b)===null&&code(q,b)===c;}
  function valid(q,a,previous){
    if(collects(q))return a.found.length>=need(q)&&new Set(a.found).size===a.found.length&&a.found.every(c=>codeValid(q,c));
    return problem(q,a,previous)===null;
  }
  function ready(q,a){if(collects(q))return a.found.length>=need(q);const p=problem(q,a);return !(p&&p.incomplete);}
  function fingerprint(q,a,collect=false){
    if(collects(q)&&!collect)return sorted(a.found);
    switch(q.type){
      case 'chain':return a.order;
      case 'combo':case 'place':return a.slots;
      case 'tiles':case 'lights':return sorted(a.selected);
      case 'truth':return [a.selected,a.order,a.found].map(sorted);
      case 'open':return a.values.map(Number);
      default:return null;
    }
  }
  function fresh(q){const b={order:[],selected:[],found:[],crossIndex:0,rotation:0};if(q.type==='combo')b.slots=q.units.map(()=>0);if(q.type==='place')b.slots=Array(q.cells).fill(null);return b;}
  function clear(q,a){
    if(q.type==='chain')a.order=[];
    else if(q.type==='combo')a.slots=q.units.map(()=>0);
    else if(q.type==='tiles'||q.type==='lights')a.selected=[];
    else if(q.type==='place'){a.slots=Array(q.cells).fill(null);a.crossIndex=0;}
    else if(q.type==='truth'){a.selected=[];a.order=[];a.found=[];}
  }
  function pending(q,a){
    if(collects(q))return q.hideTotal?'아직 찾지 못한 방법이 남아 있어요. 빠진 경우가 없는지 나누어 살펴봐요.':`서로 다른 방법을 ${need(q)-a.found.length}개 더 모아요.`;
    const p=problem(q,a);return p?p.text:'';
  }
  function explain(q,a,previous){if(collects(q))return '모은 것을 비우고 다시 모아 주세요.';const p=problem(q,a,previous);return p?p.text:'';}

  const api={types,is,linked,problem,need,collects,code,decode,codeValid,valid,ready,fingerprint,fresh,clear,pending,explain,chainProblem,chainCode,comboSum,comboAll,comboProblem,blockedSet,tileCells,tileMap,tileFit,tileProblem,tileAll,lightOn,lightOdd,lightProblem,placeSums,placeProblem,truthAt,truthCount,truthWant,truthProblem,openProblem};
  root.DrawerExplore=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis==='undefined'?window:globalThis);
