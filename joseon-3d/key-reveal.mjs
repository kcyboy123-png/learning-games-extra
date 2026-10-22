// v20: shared briefing block for mission entry/completion sheets (chapters 1~8).
// Text is split into short chunks that fade in by CSS. The key phrase always stays in the DOM
// (screen readers read it) and is only visually veiled until the learner presses '핵심 확인'.
// No timers, no auto-advance: the next button appears on that click. Handlers are onclick
// properties of dialog children, so the next innerHTML replacement discards them.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function briefHTML({chunks=[],key='',label='핵심 기록',revealed=false}={}){
 const items=chunks.filter(k=>k&&k.text);
 return `<div class="chapter-brief${revealed?' is-revealed':''}">${items.map((k,n)=>`<p class="brief-chunk${k.voice?' voice':''}${k.caption?' chapter-caption':''}" style="--i:${n}">${esc(k.text)}</p>`).join('')}<div class="brief-key brief-chunk" style="--i:${items.length}"><span class="eyebrow">${esc(label)}</span><strong class="key-phrase">${esc(key)}</strong></div>${revealed?'':'<button id="chapter-key" type="button">핵심 확인 · 핵심 기록 살펴보기</button>'}</div>`;
}
export function armKeyReveal(root,nextId){
 const k=root.querySelector('#chapter-key'),n=root.querySelector('#'+nextId);
 if(!n)return;if(!k){n.hidden=false;return;}
 n.hidden=true;k.onclick=()=>{root.querySelector('.chapter-brief')?.classList.add('is-revealed');k.hidden=true;n.hidden=false;n.focus();};
}
