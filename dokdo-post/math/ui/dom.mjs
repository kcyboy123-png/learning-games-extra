// 작은 DOM/SVG 도우미. 프레임워크 없이 쓴다.
export const SVG_NS = 'http://www.w3.org/2000/svg';
export function node(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  applyAttrs(el, attrs);
  append(el, children);
  return el;
}
export function svg(tag, attrs = {}, children = []) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  append(el, children);
  return el;
}
function applyAttrs(el, attrs) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k in el && typeof v === 'boolean') el[k] = v;
    else el.setAttribute(k, v);
  }
}
function append(el, children) {
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
}
export function button(text, onClick, {primary = false, cls = '', icon = '', attrs = {}} = {}) {
  const b = node('button', {class: `btn ${primary ? 'primary' : ''} ${cls}`.trim(), type: 'button', ...attrs});
  if (icon) b.append(node('span', {class: 'btn-icon', 'aria-hidden': 'true', text: icon}));
  b.append(node('span', {text}));
  if (onClick) b.addEventListener('click', onClick);
  return b;
}
export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
// SVG 요소를 버튼처럼: 키보드 Enter/Space로도 누를 수 있게 한다.
let lastTouchActivation=0;
export function pressable(el, handler, label) {
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  if (label) el.setAttribute('aria-label', label);
  el.classList.add('pressable');
  let touch=null;
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&e.isPrimary)touch={id:e.pointerId,x:e.clientX,y:e.clientY};});
  el.addEventListener('pointermove',e=>{if(touch&&Math.hypot(e.clientX-touch.x,e.clientY-touch.y)>10)touch=null;});
  el.addEventListener('pointercancel',()=>{touch=null;});
  el.addEventListener('pointerup',e=>{const start=touch;touch=null;if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>10)return;e.preventDefault();lastTouchActivation=performance.now();handler(e);});
  el.addEventListener('click', e => { e.preventDefault();if((e.pointerType==='touch'||e.sourceCapabilities?.firesTouchEvents)&&performance.now()-lastTouchActivation<700)return;handler(e); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(e); } });
  return el;
}
export function setPressed(el, on) { el.setAttribute('aria-pressed', on ? 'true' : 'false'); el.classList.toggle('on', !!on); }
export function announce(text) {
  const live = document.getElementById('live');
  if (live) { live.textContent = ''; setTimeout(() => { live.textContent = text; }, 30); }
}
export function reducedMotion() {
  return document.getElementById('app')?.classList.contains('reduce-motion') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
export const KOREAN_LABELS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
