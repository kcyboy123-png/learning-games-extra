import {isCode} from './lib/protocol.mjs';

export function attendance(classroom,peers){
  const members=[...peers.values(),{role:classroom.role,online:classroom.connected}];
  const students=members.filter(m=>m.role==='student');
  return {online:students.filter(m=>m.online).length,away:students.filter(m=>!m.online).length,teachers:members.filter(m=>m.role==='teacher'&&m.online).length};
}
export function setupLobby(classroom,peers){
  const $=id=>document.getElementById(id),panels=[...document.querySelectorAll('.room-share')];
  let choices=[],selected=0;
  const code=new URLSearchParams(location.hash.slice(1)).get('room');
  if(code){$('join-code').value=code.toUpperCase();$('join-note').textContent=isCode(code.toUpperCase())?'우리 반 코드가 준비됐어요. 방에 들어가기를 눌러요.':'방 코드를 다시 확인해 주세요.';}
  function update(){
    if(!classroom.token)return;
    const a=attendance(classroom,peers),text=classroom.closed?'교실 연결이 끝났어요. 새 방에 들어가려면 화면을 다시 열어 주세요.':!classroom.connected?'연결 확인 중 · 인원은 다시 연결되면 갱신돼요':`접속 학생 ${a.online}명 / 목표 25명 · 선생님 ${a.teachers}명`+(a.away?` · 연결 끊김 ${a.away}명`:'');
    for(const el of document.querySelectorAll('.attendance'))if(el.textContent!==text)el.textContent=text;
    $('lobby-status').hidden=false;
    $('classroom').classList.toggle('joined',!!classroom.token);
    if(classroom.closed)for(const p of panels)p.hidden=true;
  }
  function render(){
    for(const p of panels){
      const image=p.querySelector('img'),link=p.querySelector('input'),select=p.querySelector('select');
      const item=choices[selected];image.hidden=!item;link.hidden=!item;p.querySelector('button').hidden=!item;
      p.querySelector('.share-code').textContent=classroom.code;
      select.replaceChildren(...choices.map((v,i)=>{const o=document.createElement('option');o.value=i;o.textContent=new URL(v.url).host;return o;}));select.value=selected;select.parentElement.hidden=choices.length<2;
      if(item){image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(item.svg);link.value=item.url;}
      p.querySelector('.share-note').textContent=item?(classroom.online?'QR을 찍고 방에 들어가기를 눌러요. 다른 와이파이에서도 함께할 수 있어요.':'같은 와이파이에서 QR을 찍고, 방에 들어가기를 눌러요.'):'태블릿용 주소가 없어요. 교실 실행 파일로 서버를 열고 네트워크 연결을 확인해 주세요.';
    }
  }
  for(const p of panels){
    p.querySelector('select').onchange=e=>{selected=Number(e.target.value);render();};
    p.querySelector('button').onclick=async()=>{const input=p.querySelector('input');input.focus();input.select();try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(input.value);p.querySelector('.share-note').textContent='학생용 주소를 복사했어요.';}catch{p.querySelector('.share-note').textContent='주소를 선택했어요. Ctrl+C 또는 길게 눌러 복사해 주세요.';}};
  }
  return {update,reset(){choices=[];selected=0;for(const p of panels)p.hidden=true;$('lobby-status').hidden=true;$('classroom').classList.remove('joined');},async adopt(){
    update();$('start').textContent=classroom.role==='teacher'?'학생들과 산책 시작':'함께 산책 시작';
    $('teacher-entry').hidden=true;
    if(classroom.role!=='teacher')return;
    for(const p of panels)p.hidden=false;
    try{const r=await classroom.request('invite',undefined,'GET');choices=r.addresses;render();}
    catch{for(const p of panels)p.querySelector('.share-note').textContent='접속 안내를 가져오지 못했어요. 서버 연결을 확인해 주세요.';}
  }};
}
