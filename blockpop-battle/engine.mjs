export const W=10,H=24,TOP=4,TICK=50,DURATION=180000;
export const ATTACK_DELAY=600;
export const SHAPES=[
 [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
 [[1,1],[1,1]], [[0,1,0],[1,1,1],[0,0,0]],
 [[1,0,0],[1,1,1],[0,0,0]], [[0,0,1],[1,1,1],[0,0,0]],
 [[0,1,1],[1,1,0],[0,0,0]], [[1,1,0],[0,1,1],[0,0,0]]
];
export const blank=()=>Array.from({length:H},()=>Array(W).fill(0));
export function random(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
// Every second seven-piece bag adds one I/J/L, rotating equally across 45 pieces.
export function sequence(seed,count=3000){const r=random(seed),out=[];let round=0;while(out.length<count){const bag=[0,1,2,3,4,5,6];if(round%2)bag.push([0,3,4][Math.floor(round/2)%3]);for(let i=bag.length-1;i;i--){const j=Math.floor(r()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}out.push(...bag);round++;}return out;}
export function matrix(type,rotation=0){let m=SHAPES[type];for(let r=0;r<rotation%4;r++)m=m[0].map((_,x)=>m.map(row=>row[x]).reverse());return m;}
export function cells(piece){return matrix(piece.type,piece.rot).flatMap((row,y)=>row.flatMap((v,x)=>v?[[piece.x+x,piece.y+y]]:[]));}
export function fits(p,piece){return cells(piece).every(([x,y])=>x>=0&&x<W&&y>=0&&y<H&&!p.board[y][x]);}
export function ghost(p){if(!p.piece)return null;const g={...p.piece};while(fits(p,{...g,y:g.y+1}))g.y++;return g;}
export function landingRows(p){
 if(!p.piece||p.dead)return[];const points=cells(ghost(p));
 return p.board.flatMap((row,y)=>row.every((v,x)=>v||points.some(([px,py])=>px===x&&py===y))?[y]:[]);
}
export function player(seed){const p={board:blank(),rows:Array(H).fill(false),seq:sequence(seed),index:0,piece:null,pieceId:0,hold:null,holdUsed:false,gravity:0,ground:0,contact:null,resets:0,combo:0,comboMisses:0,best:0,lines:0,score:0,blocked:0,sent:0,queue:[],dead:false,locks:0,lastLock:-1000};spawn(p);return p;}
export function spawn(p,type=p.seq[p.index++%p.seq.length]){p.piece={type,rot:0,x:Math.floor((W-SHAPES[type][0].length)/2),y:TOP};p.pieceId++;p.holdUsed=false;p.gravity=0;p.ground=0;p.contact=null;p.resets=0;if(!fits(p,p.piece))p.dead=true;}
export function hold(p){if(p.dead||!p.piece||p.holdUsed)return false;const old=p.hold;p.hold=p.piece.type;spawn(p,old??undefined);p.holdUsed=true;return true;}
export function comboBonus(c){return c<4?0:c<8?1:2;}
export function attack(l,c){return l?Math.min(4,[0,0,1,2,4][l]+comboBonus(c)):0;}
export const queued=p=>p.queue.reduce((s,q)=>s+q.n,0);
export function cancel(p,n){let rest=n;while(rest&&p.queue.length){const q=p.queue[0],take=Math.min(rest,q.n);q.n-=take;rest-=take;if(!q.n)p.queue.shift();}return n-rest;}
export function move(p,action,now){
 if(p.dead||!p.piece)return false;
 const before=p.piece;let next={...before};
 if(action==='left')next.x--;else if(action==='right')next.x++;else if(action==='soft')next.y++;
 else if(action==='rotate'){
  if(before.type===1)return false;
  next.rot=(next.rot+1)%4;
  const options=[[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[-1,-1],[1,-1],[0,-2]];
  const found=options.map(([x,y])=>({...next,x:next.x+x,y:next.y+y})).find(q=>fits(p,q));
  if(!found)return false;next=found;
 }else return false;
 if(!fits(p,next))return false;
 const wasGrounded=!fits(p,{...before,y:before.y+1});p.piece=next;
 if(action!=='soft'&&wasGrounded&&p.resets<8&&(p.contact===null||now-p.contact<4000)){p.ground=0;p.resets++;}
 return true;
}
export function lock(p,now){
 const previousCombo=p.combo,previousBest=p.best,resumed=p.combo>0&&p.comboMisses>0;
 const occupied=cells(p.piece);for(const[x,y]of occupied)p.board[y][x]=p.piece.type+1;
 const cleared=[];for(let y=0;y<H;y++)if(p.board[y].every(Boolean))cleared.push(y);
 const fragments=cleared.flatMap(y=>p.board[y].map((color,x)=>[x,y,color]));
 const normal=cleared.filter(y=>!p.rows[y]).length;
 p.board=p.board.filter((_,y)=>!cleared.includes(y));p.rows=p.rows.filter((_,y)=>!cleared.includes(y));
 while(p.board.length<H){p.board.unshift(Array(W).fill(0));p.rows.unshift(false);}
 if(cleared.length){p.combo+=cleared.length;p.comboMisses=0;}
 else if(p.combo&&++p.comboMisses>2){p.combo=0;p.comboMisses=0;}
 p.best=Math.max(p.best,p.combo);p.lines+=cleared.length;p.score+=normal;p.locks++;p.lastLock=now;p.piece=null;
 return{lines:cleared.length,resumed:cleared.length>0&&resumed,combo:p.combo,comboMisses:p.comboMisses,previousCombo,newBest:p.best>previousBest,rows:cleared,normal,occupied,fragments};
}
export function progress(p,actions,dt,now){
 if(p.dead)return null;
 let heldFrom;
 for(const a of actions.slice(0,8)){
  // Inputs after a successful hold in this batch target the piece just taken out.
  if(a.pieceId!==undefined&&a.pieceId!==p.pieceId&&!(a.pieceId===heldFrom&&a.action!=='hold'))continue;
  if(a.action==='hold'){const oldId=p.pieceId;if(hold(p)){heldFrom=oldId;a.onHold?.();}if(p.dead)return null;continue;}
  if(a.action==='drop'&&now-p.lastLock>=150){p.piece=ghost(p);return lock(p,now);}
  const moved=move(p,a.action,now);
  if(a.action==='rotate')a.onRotate?.(moved,p.piece.type);
 }
 p.gravity+=dt;
 if(p.gravity>=1000){p.gravity%=1000;move(p,'soft',now);}
 if(!fits(p,{...p.piece,y:p.piece.y+1})){
  p.contact??=now;p.ground+=dt;
  if(p.ground>=700||now-p.contact>=4000)return lock(p,now);
 }else p.ground=0;
 return null;
}
export function readyAttack(p,now){const q=p.queue[0];return q&&q.due<=now?Math.min(4,q.n):0;}
export function insert(p,now){
 const limit=readyAttack(p,now);if(!limit)return 0;
 // Land one attack packet together; queued volleys still require separate placements.
 let n=0;
 while(n<limit){const q=p.queue[0];
  if(p.board[0].some(Boolean))p.dead=true;
  p.board.shift();p.rows.shift();p.board.push(Array.from({length:W},(_,x)=>x===q.hole?0:8));p.rows.push(true);
  q.n--;n++;if(!q.n)p.queue.shift();
 }
 return n;
}
export function match(seed=1){return{seed,players:[player(seed),player(seed)],time:0,events:[],eid:0,done:false,winner:null,reason:'',rng:random(seed^0x937b)};}
function emit(m,e){m.events.push({...e,id:++m.eid,time:m.time});if(m.events.length>40)m.events.shift();}
export function resolve(m,locks){
 const output=[0,0];
 locks.forEach((l,i)=>{if(!l)return;const p=m.players[i],q=queued(p),a=l.lines?attack(l.lines,l.combo):0;
  const d=l.lines?cancel(p,Math.min(q,Math.max(l.lines,a))):0;
  output[i]=Math.max(0,a-q);p.blocked+=d;
  emit(m,{type:'lock',player:i,...l,defended:d,attack:a});
 });
 const shared=Math.min(...output);if(shared){output[0]-=shared;output[1]-=shared;emit(m,{type:'clash',n:shared});}
 output.forEach((n,i)=>{if(!n)return;const target=m.players[1-i],accepted=Math.min(n,8-queued(target));
  if(accepted){target.queue.push({n:accepted,hole:Math.floor(m.rng()*W),due:m.time+ATTACK_DELAY,id:m.eid+1});m.players[i].sent+=accepted;emit(m,{type:'send',player:i,n:accepted,counter:!!locks[i]&&locks[i].lines>0&&m.events.some(e=>e.type==='lock'&&e.time===m.time&&e.player===i&&e.defended>0)});}
 });
 locks.forEach((l,i)=>{if(!l)return;const p=m.players[i];if(!l.lines){const n=insert(p,m.time);if(n)emit(m,{type:'rise',player:i,n});}spawn(p);if(p.board.slice(0,TOP).some(r=>r.some(Boolean)))p.dead=true;});
}
export function step(m,actions=[[],[]],dt=TICK){
 if(m.done)return;m.time+=dt;
 const locks=m.players.map((p,i)=>progress(p,actions[i]||[],dt,m.time));resolve(m,locks);
 const dead=m.players.map(p=>p.dead);
 if(dead.some(Boolean)){m.done=true;m.winner=dead[0]&&dead[1]?null:dead[0]?1:0;m.reason='stack';}
 else if(m.time>=DURATION){m.done=true;const[a,b]=m.players.map(p=>p.score);m.winner=a===b?null:a>b?0:1;m.reason='time';}
 if(m.done)emit(m,{type:'end',winner:m.winner,reason:m.reason});
}
export function snapshot(m){return{time:m.time,done:m.done,winner:m.winner,reason:m.reason,events:m.events,players:m.players.map(p=>({board:p.board,rows:p.rows,piece:p.piece,pieceId:p.pieceId,hold:p.hold,holdUsed:p.holdUsed,next:p.seq.slice(p.index,p.index+3),combo:p.combo,comboMisses:p.comboMisses,best:p.best,lines:p.lines,score:p.score,blocked:p.blocked,sent:p.sent,queue:p.queue,dead:p.dead,locks:p.locks}))};}
export function training(stage=0){
 const m=match(20261118),p=m.players[0];p.board=blank();p.rows.fill(false);p.seq=Array(3000).fill(1);p.index=0;spawn(p);
 const count=stage===1?6:1;
 for(let y=H-count;y<H;y++)p.board[y]=Array.from({length:W},(_,x)=>x===W/2-1||x===W/2?0:(x%7)+1);
 p.piece.x=W/2-1;if(stage===2)p.queue=[{n:2,hole:3,due:999999,id:0}];
 if(stage===3)spawn(p,0);
 return m;
}
// Search reachable moves from the actual piece; never teleport a rival to its target.
export function botPlan(p,rank=0){
 if(!p.piece||p.dead)return null;
 const queue=[{piece:{...p.piece},path:[]}],seen=new Set(),plans=[];
 for(let n=0;n<queue.length;n++){
  const current=queue[n],key=[current.piece.x,current.piece.y,current.piece.rot].join(',');
  if(seen.has(key))continue;seen.add(key);
  const c=ghost({...p,piece:current.piece}),b=p.board.map(row=>row.slice());
  for(const[x,y]of cells(c))b[y][x]=1;
  const lines=b.filter(row=>row.every(Boolean)).length,remaining=b.filter(row=>!row.every(Boolean));
  while(remaining.length<H)remaining.unshift(Array(W).fill(0));
  let holes=0;const heights=[];
  for(let x=0;x<W;x++){let seenCell=false,height=0;for(let y=0;y<H;y++){if(remaining[y][x]){if(!seenCell)height=H-y;seenCell=true;}else if(seenCell)holes++;}heights.push(height);}
  const bump=heights.slice(1).reduce((sum,h,i)=>sum+Math.abs(h-heights[i]),0);
  const value=lines*8-holes*6-heights.reduce((a,b)=>a+b,0)*.4-bump*.35-Math.max(...heights)*.35;
  plans.push({rot:c.rot,x:c.x,value,path:current.path});
  for(const action of ['left','right','rotate']){const clone={...p,piece:{...current.piece}};if(move(clone,action,0))queue.push({piece:clone.piece,path:[...current.path,action]});}
 }
 plans.sort((a,b)=>b.value-a.value||a.path.length-b.path.length);
 return plans[Math.min(Math.max(0,Math.floor(rank)),plans.length-1)]||null;
}
