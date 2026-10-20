(function(root){
  'use strict';
  const X=root.DrawerExplore,esc=root.DrawerActivities.esc;
  const seq=(q,order)=>order.map(i=>q.cards[i]).join(' – ');
  const comboText=(q,s)=>q.units.map((u,i)=>`${u.label} ${s[i]||0}개`).join(' + ');
  const cellName=(q,i)=>`${Math.floor(i/q.w)+1}행 ${i%q.w+1}열`;

  function tools(q,resetLabel,collectLabel){return `<div class="explore-tools"><button class="text-button" data-action="explore-reset">${resetLabel}</button>${X.collects(q)?`<button class="secondary" data-action="explore-collect">${collectLabel}</button>`:''}</div>`;}
  function collection(q,a,items,empty){
    if(!X.collects(q))return '';
    return `<div class="explore-collection" aria-live="polite">${a.found.length?`<ul>${items.map(t=>`<li>${t}</li>`).join('')}</ul>`:`<p>${empty}</p>`}<small>${q.hideTotal?`${a.found.length}개 발견 · 모두 몇 개인지는 스스로 판단해요.`:`${a.found.length}/${X.need(q)}개 발견`}</small>${a.found.length?'<button class="text-button" data-action="explore-uncollect">모은 것 모두 비우기</button>':''}</div>`;
  }

  function chain(q,a){
    const full=!q.min||q.min>=q.cards.length;
    return `<div class="explore-work chain-work"><p class="order-label">내 열차 · ${a.order.length}칸 ${full?`/ ${q.cards.length}칸`:`(${q.min}칸 이상)`}</p><div class="train" aria-live="polite">${a.order.length?a.order.map((id,i)=>`${i?'<i class="train-link" aria-hidden="true"></i>':''}<button class="train-car" data-action="chain-remove" data-value="${id}" aria-label="${i+1}번째 칸 ${q.cards[id]} 빼기">${q.cards[id]}</button>`).join(''):'<span class="train-empty">아래 수 카드를 눌러 첫 칸부터 놓아요.</span>'}</div><p class="grid-caption">열차 칸을 누르면 그 카드만 빠져요.</p><div class="chain-cards">${q.cards.map((n,i)=>`<button class="chain-card" data-action="chain-add" data-value="${i}" ${a.order.includes(i)?'disabled':''} aria-label="수 카드 ${n}">${n}</button>`).join('')}</div>${tools(q,'열차 비우기','이 열차 모으기')}${collection(q,a,a.found.map(c=>esc(seq(q,X.decode(q,c).order))),'아직 모은 열차가 없어요.')}</div>`;
  }

  function combo(q,a){
    const s=a.slots,sum=X.comboSum(q,s),count=s.reduce((t,n)=>t+(n||0),0),unit=esc(q.unit);
    const pieces=q.id?.startsWith('g5-fraction-snack')?q.units.flatMap((u,i)=>Array((s[i]||0)*u.size).fill(i)):null;
    const tray=pieces?`<div class="snack-tray" role="img" aria-label="12칸 간식판 중 ${Math.min(sum,12)}칸 채움${sum>12?', '+(sum-12)+'칸 초과':''}">${Array.from({length:12},(_,i)=>`<span class="${i<pieces.length?'filled part-'+pieces[i]:''}"></span>`).join('')}</div>${sum>12?'<p class="grid-caption">간식판보다 '+(sum-12)+'칸 많아요.</p>':''}`:'';
    return `<div class="explore-work combo-work"><p class="rule-note">주문: 정확히 <b>${q.target}${unit}</b>${q.best==='min'?' · 묶음 수가 가장 적게':''}</p>${tray}<div class="combo-rows">${q.units.map((u,i)=>{const c=s[i]||0,max=Math.floor(q.target/u.size);return `<div class="combo-row"><span class="combo-name"><b>${esc(u.label)}</b><small>한 묶음 ${u.size}${unit}</small></span><button data-action="combo-minus" data-value="${i}" ${c<=0?'disabled':''} aria-label="${esc(u.label)} 하나 빼기">−</button><output aria-label="${esc(u.label)} ${c}개">${c}</output><button data-action="combo-plus" data-value="${i}" ${c>=max?'disabled':''} aria-label="${esc(u.label)} 하나 더 담기">＋</button><span class="combo-sub">${u.size*c}${unit}</span></div>`;}).join('')}</div><p class="combo-total" aria-live="polite">지금 꾸러미 <b>${sum}${unit}</b> · 묶음 ${count}개</p>${tools(q,'꾸러미 비우기','이 꾸러미 모으기')}${collection(q,a,a.found.map(c=>esc(comboText(q,X.decode(q,c).slots))),'아직 모은 꾸러미가 없어요.')}</div>`;
  }

  function board(q,list,live){
    const {map}=X.tileMap(q,list||[]),bl=X.blockedSet(q);
    return `<div class="tile-board${q.colored?' colored':''}" style="grid-template-columns:repeat(${q.w},1fr);--cols:${q.w}">${Array.from({length:q.w*q.h},(_,i)=>{
      const x=i%q.w,y=Math.floor(i/q.w),placed=map.get(i),dark=q.colored&&(x+y)%2===0;
      let cls='tile-cell'+(q.colored?(dark?' dark':' light'):'');
      if(bl.has(i))return live?`<button class="${cls} blocked" disabled aria-label="${cellName(q,i)} 막힌 칸">×</button>`:`<span class="${cls} blocked">×</span>`;
      if(placed!=null){cls+=' covered tp'+(Math.floor(placed/64)%4);if(x+1<q.w&&map.get(i+1)===placed)cls+=' jr';if(x>0&&map.get(i-1)===placed)cls+=' jl';if(map.get(i+q.w)===placed)cls+=' jb';if(map.get(i-q.w)===placed)cls+=' jt';}
      return live?`<button class="${cls}" data-action="tile-cell" data-value="${i}" aria-label="${cellName(q,i)}${q.colored?(dark?' 진한 칸':' 연한 칸'):''}${placed!=null?' · '+esc(q.pieces[Math.floor(placed/64)].name)+' 놓임, 누르면 떼기':' · 빈칸'}"></button>`:`<span class="${cls}"></span>`;
    }).join('')}</div>`;
  }
  function tiles(q,a){
    const {map,free}=X.tileMap(q,a.selected),chosen=Math.min(a.rotation||0,q.pieces.length-1);
    return `<div class="explore-work tiles-work"><div class="tile-palette" role="group" aria-label="놓을 것 고르기">${q.pieces.map((p,i)=>`<button class="tile-pick tp${i%4} ${chosen===i?'selected':''}" data-action="tile-piece" data-value="${i}" aria-pressed="${chosen===i}"><i class="tile-icon" style="--tw:${p.w};--th:${p.h}" aria-hidden="true"></i><span>${esc(p.name)}</span></button>`).join('')}</div>${board(q,a.selected,true)}<p class="grid-caption" aria-live="polite">놓은 수 ${a.selected.length}장 · 빈칸 ${free-map.size}칸<br>빈칸을 누르면 놓이고, 놓은 것을 누르면 떼어져요.</p>${tools(q,'모두 떼기','이 설계 모으기')}${collection(q,a,a.found.map(c=>`<div class="tile-mini">${board(q,X.decode(q,c).selected,false)}</div>`),'아직 모은 설계가 없어요.')}</div>`;
  }

  function lightBoard(q,toggles,live){
    const on=X.lightOn(q,toggles||[]),mine=new Set(toggles||[]);
    let html=`<div class="light-board" style="grid-template-columns:auto repeat(${q.w},1fr);max-width:${q.w*58+48}px"><span class="light-head"></span>${Array.from({length:q.w},(_,x)=>`<span class="light-head">${x+1}열</span>`).join('')}`;
    for(let y=0;y<q.h;y++){
      html+=`<span class="light-head">${y+1}행</span>`;
      for(let x=0;x<q.w;x++){const i=y*q.w+x,lit=on.has(i),cls=`light-cell${lit?' on':''}${mine.has(i)?' changed':''}`;html+=live?`<button class="${cls}" data-action="light" data-value="${i}" aria-pressed="${lit}" aria-label="${cellName(q,i)} ${lit?'켜짐':'꺼짐'}${mine.has(i)?' · 내가 바꾼 칸':''}">${lit?'●':''}</button>`:`<span class="${cls}">${lit?'●':''}</span>`;}
    }
    return html+'</div>';
  }
  function lights(q,a){
    return `<div class="explore-work lights-work">${lightBoard(q,a.selected,true)}<p class="grid-caption" aria-live="polite">켜진 칸 ${X.lightOn(q,a.selected).size}칸 · 내가 바꾼 칸 ${a.selected.length}칸<br>${q.toggles===1?'한 칸만 바꿀 수 있어요. 다른 칸을 누르면 바꿀 칸이 옮겨져요.':'칸을 누를 때마다 켜짐과 꺼짐이 바뀌어요.'}</p>${tools(q,'처음 모습으로','')}</div>`;
  }

  function placeBoard(q,a,live){
    const s=a?a.slots:[];
    return `<div class="place-board" style="grid-template-columns:repeat(${q.layout.cols},minmax(0,1fr))">${q.layout.pos.map(([x,y],i)=>{
      const groups=q.groups.map((g,k)=>g.includes(i)?k:-1).filter(k=>k>=0),cls='place-cell'+groups.map(k=>' g'+k).join(''),where=groups.map(k=>q.groupNames[k]).join('·'),v=s[i],at=`grid-column:${x+1};grid-row:${y+1}`;
      return live?`<button class="${cls}${a.crossIndex===i?' selected':''}" style="${at}" data-action="place-slot" data-value="${i}" aria-label="${esc(where)} 칸 ${v??'빈칸'}">${v??'·'}</button>`:`<span class="${cls}" style="${at}">□</span>`;
    }).join('')}</div>`;
  }
  function place(q,a){
    const sums=X.placeSums(q,a.slots);
    return `<div class="explore-work place-work">${placeBoard(q,a,true)}<ul class="place-sums" aria-live="polite">${q.groupNames.map((n,k)=>`<li class="g${k}"><b>${esc(n)}</b> 합 ${sums[k]??'—'}</li>`).join('')}</ul><div class="place-digits">${q.digits.map(n=>`<button data-action="place-digit" data-value="${n}" ${a.slots.includes(n)?'disabled':''} aria-label="수 카드 ${n}">${n}</button>`).join('')}</div><p class="grid-caption">칸을 고른 뒤 수 카드를 눌러요. 두 색이 섞인 칸은 두 줄에 함께 들어가요.</p><div class="explore-tools"><button class="text-button" data-action="place-clear">선택한 칸 비우기</button><button class="text-button" data-action="explore-reset">모두 비우기</button></div></div>`;
  }

  function truth(q,a,live){
    const n=q.statements.length,T=new Set(a?a.selected:[]),F=new Set(a?a.order:[]),given=q.given||[];
    let html=`<ol class="truth-says">${q.statements.map(s=>`<li><b>${esc(s.who)}</b>“${esc(s.text)}”</li>`).join('')}</ol><p class="rule-note">조건: ${n}문장 중 <b>정확히 ${q.exact}문장</b>만 참이에요.</p><div class="truth-table" role="group" aria-label="번호별 참·거짓 표" style="grid-template-columns:minmax(64px,auto) repeat(${n},minmax(44px,1fr)) minmax(38px,auto)"><span class="truth-head">번호</span>${q.statements.map(s=>`<span class="truth-head">${esc(s.who)}</span>`).join('')}<span class="truth-head">○ 수</span>`;
    q.candidates.forEach((label,c)=>{
      const picked=!!a&&a.found.includes(c);let marks=0;
      html+=live?`<button class="truth-pick${picked?' selected':''}" data-action="truth-pick" data-value="${c}" aria-pressed="${picked}" aria-label="${esc(label)} ${picked?'고름':'고르지 않음'}">${picked?'✓ ':''}${esc(label)}</button>`:`<span class="truth-head">${esc(label)}</span>`;
      q.statements.forEach((st,s)=>{
        const i=c*n+s;
        if(given.includes(s)){const yes=st.true.includes(c);if(yes)marks++;html+=`<span class="truth-cell given ${yes?'yes':'no'}" aria-label="${esc(label)}, ${esc(st.who)}의 말: ${yes?'참':'거짓'}">${yes?'○':'×'}</span>`;return;}
        const state=T.has(i)?'yes':F.has(i)?'no':'';if(state==='yes')marks++;
        html+=live?`<button class="truth-cell ${state}" data-action="truth-cell" data-value="${i}" aria-label="${esc(label)}, ${esc(st.who)}의 말: ${state==='yes'?'참':state==='no'?'거짓':'아직 정하지 않음'}">${state==='yes'?'○':state==='no'?'×':'·'}</button>`:'<span class="truth-cell"></span>';
      });
      html+=`<span class="truth-count">${live?marks:''}</span>`;
    });
    return html+'</div>'+(live?`<p class="grid-caption">칸을 누를 때마다 ○(참) → ×(거짓) → 빈칸으로 바뀌어요.<br>조건에 맞는 번호는 왼쪽 번호 단추를 눌러 골라요. 지금 고른 번호 ${a.found.length}개</p>`:'');
  }

  function open(q,a){return `<div class="answer-fields"><p class="open-note">맞는 답이 하나만 있는 것은 아니에요. 조건을 모두 지키면 통과해요.</p>${q.fields.map((f,i)=>`<label>${esc(f)}<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="8" data-field="${i}" aria-label="${esc(f)}" value="${esc(a.values[i])}" autocomplete="off"></label>`).join('')}</div>`;}

  function render(q,a){
    switch(q.type){
      case 'chain':return chain(q,a);
      case 'combo':return combo(q,a);
      case 'tiles':return tiles(q,a);
      case 'lights':return lights(q,a);
      case 'place':return place(q,a);
      case 'truth':return `<div class="explore-work truth-work">${truth(q,a,true)}${tools(q,'표 비우기','')}</div>`;
      case 'open':return open(q,a);
      default:return '';
    }
  }
  // A read-only board shown beside number or choice steps.
  function reference(q){const b=q.board;if(!b)return '';return `<figure class="math-diagram board-ref" role="img" aria-label="${esc(b.alt)}"><figcaption>${esc(b.caption)}</figcaption>${b.kind==='lights'?lightBoard(b,[],false):board(b,[],false)}${b.note?`<p>${esc(b.note)}</p>`:''}</figure>`;}
  function print(q){
    switch(q.type){
      case 'chain':return `<p>수 카드: ${q.cards.join(', ')}${q.end!=null?` · ${q.end} 카드는 맨 앞이나 맨 뒤에`:''}</p><p>${Array(q.cards.length).fill('□').join(' – ')}</p>${X.collects(q)?`<p>서로 다른 열차 ${X.need(q)}가지를 적어요.</p>`:''}`;
      case 'combo':return `<p>주문: 정확히 ${q.target}${esc(q.unit)}${q.best==='min'?' · 묶음 수가 가장 적게':''}</p><ul>${q.units.map(u=>`<li>${esc(u.label)} (한 묶음 ${u.size}${esc(q.unit)}): (　)개</li>`).join('')}</ul>${X.collects(q)?`<p>${q.hideTotal?'가능한 꾸러미를 빠짐없이 적어요.':`서로 다른 꾸러미 ${X.need(q)}가지를 적어요.`}</p>`:''}`;
      case 'tiles':return `<p>쓸 수 있는 것: ${q.pieces.map(p=>`${esc(p.name)} ${p.w}×${p.h}칸`).join(', ')}</p>${board(q,[],false)}${X.collects(q)?'<p>서로 다른 설계를 빠짐없이 그려요.</p>':''}`;
      case 'lights':return lightBoard(q,[],false);
      case 'place':return `<p>수 카드: ${q.digits.join(', ')}${q.sum!=null?` · 줄의 합 ${q.sum}`:''}</p>${placeBoard(q,null,false)}<p>${q.groupNames.map(esc).join(', ')}의 합이 모두 같게 놓아요.</p>`;
      case 'truth':return truth(q,null,false);
      default:return '';
    }
  }
  function summary(q,a){
    switch(q.type){
      case 'chain':return X.collects(q)?'모은 열차: '+a.found.map(c=>seq(q,X.decode(q,c).order)).join(' / '):'내 열차: '+seq(q,a.order);
      case 'combo':return X.collects(q)?'모은 꾸러미: '+a.found.map(c=>comboText(q,X.decode(q,c).slots)).join(' / '):'내 꾸러미: '+comboText(q,a.slots);
      case 'tiles':return X.collects(q)?`모은 설계 ${a.found.length}가지`:`내가 놓은 수: ${a.selected.length}장`;
      case 'lights':return '내가 바꾼 칸: '+a.selected.map(i=>cellName(q,i)).join(', ');
      case 'place':return q.groupNames.map((n,k)=>`${n} ${q.groups[k].map(i=>a.slots[i]).join('·')}`).join(' / ');
      case 'truth':return '고른 번호: '+a.found.slice().sort((x,y)=>x-y).map(c=>q.candidates[c]).join(', ');
      case 'open':return '내 답: '+q.fields.map((f,i)=>`${f} ${a.values[i]}`).join(' / ');
      default:return '';
    }
  }
  // Returns true when the click belonged to an inquiry step. c: {mutate,render,feedback,wrong,alive}
  function handle(act,b,q,a,c){
    const v=Number(b.dataset.value),t=q.type;
    if(act==='explore-reset'){c.mutate();X.clear(q,a);c.render();return true;}
    if(act==='explore-uncollect'){c.mutate();a.found=[];c.render();return true;}
    if(act==='explore-collect'){
      if(!X.collects(q))return true;
      const p=X.problem(q,a);
      if(p){if(p.incomplete){c.feedback(p.text+' 감점 없이 이어서 해봐요.');return true;}const note=c.wrong();if(c.alive())c.feedback(note+p.text);return true;}
      const key=X.code(q,a);
      if(a.found.includes(key)){c.feedback('이미 모은 것과 같아요. 다른 방법을 찾아봐요.');return true;}
      c.mutate();a.found=[...a.found,key];X.clear(q,a);c.feedback(`새로운 방법을 모았어요. 지금까지 ${a.found.length}개예요.`,true);return true;
    }
    if(t==='chain'&&act==='chain-add'){if(a.order.includes(v)||!(v>=0&&v<q.cards.length))return true;c.mutate();a.order=[...a.order,v];c.render();return true;}
    if(t==='chain'&&act==='chain-remove'){c.mutate();a.order=a.order.filter(n=>n!==v);c.render();return true;}
    if(t==='combo'&&(act==='combo-plus'||act==='combo-minus')){const u=q.units[v];if(!u)return true;const n=(a.slots[v]||0)+(act==='combo-plus'?1:-1);if(n<0||n>Math.floor(q.target/u.size))return true;c.mutate();a.slots=q.units.map((_,i)=>i===v?n:a.slots[i]||0);c.render();return true;}
    if(t==='tiles'&&act==='tile-piece'){if(q.pieces[v])a.rotation=v;c.render();return true;}
    if(t==='tiles'&&act==='tile-cell'){
      const {map}=X.tileMap(q,a.selected);
      if(map.has(v)){const placed=map.get(v);c.mutate();a.selected=a.selected.filter(n=>n!==placed);c.render();return true;}
      const fit=X.tileFit(q,a.selected,Math.min(a.rotation||0,q.pieces.length-1),v);
      if(fit==null){c.feedback('그 자리에는 놓을 수 없어요. 이웃한 칸이 비어 있는지, 밖으로 나가지 않는지 살펴봐요.');return true;}
      c.mutate();a.selected=[...a.selected,fit];c.render();return true;
    }
    if(t==='lights'&&act==='light'){c.mutate();a.selected=q.toggles===1?(a.selected.includes(v)?[]:[v]):a.selected.includes(v)?a.selected.filter(n=>n!==v):[...a.selected,v];c.render();return true;}
    if(t==='place'&&act==='place-slot'){a.crossIndex=v;c.render();return true;}
    if(t==='place'&&act==='place-digit'){if(a.slots.includes(v)||!q.digits.includes(v))return true;c.mutate();a.slots[a.crossIndex]=v;const next=a.slots.indexOf(null);if(next>=0)a.crossIndex=next;c.render();return true;}
    if(t==='place'&&act==='place-clear'){c.mutate();a.slots[a.crossIndex]=null;c.render();return true;}
    if(t==='truth'&&act==='truth-cell'){c.mutate();if(a.selected.includes(v)){a.selected=a.selected.filter(n=>n!==v);a.order=[...a.order,v];}else if(a.order.includes(v))a.order=a.order.filter(n=>n!==v);else a.selected=[...a.selected,v];c.render();return true;}
    if(t==='truth'&&act==='truth-pick'){c.mutate();a.found=a.found.includes(v)?a.found.filter(n=>n!==v):[...a.found,v];c.render();return true;}
    return false;
  }
  root.DrawerExploreUI={has:X.is,render,reference,print,summary,handle,board,lightBoard};
})(globalThis);
