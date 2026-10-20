(function(root){
'use strict';
const old=root.ThinkstarPictures.render,esc=DrawerActivities.esc;
const svg=(label,body)=>`<figure class="puzzle-diagram"><svg viewBox="0 0 400 180" role="img" aria-label="${esc(label)}">${body}</svg></figure>`;
const text=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle">${s}</text>`;
const poly=(n,r=65,cx=200,cy=88)=>Array.from({length:n},(_,i)=>[cx+r*Math.cos(-Math.PI/2+i*2*Math.PI/n),cy+r*Math.sin(-Math.PI/2+i*2*Math.PI/n)].join(',')).join(' ');
root.ThinkstarPictures.render=function(id,q,index){
 if(id==='csx-03')return svg(index===0?'가로 7m 세로 4m 직사각형 화단의 모양 예시':'둘레22m 직사각형 화단의 모양 예시',`<rect x="85" y="40" width="220" height="105" rx="4"/>${text(195,28,index===0?'가로 7m':'가로 ? m')}${text(345,100,index===0?'세로 4m':'세로 ? m')}${text(195,169,'네 변을 모두 둘러싸는 울타리')}`);
 if(id==='csx-06')return svg('샘터를 중심으로 북쪽 큰바위, 동쪽 오두막, 서쪽 다리',`<path d="M200 140V35M75 140H325"/>${text(200,20,'큰바위 · 북')}${text(255,90,'5cm')}${text(200,166,'샘터')}${text(70,120,'다리 · 서')}${text(330,120,'오두막 · 동')}${text(135,157,'2cm')}${text(265,157,'3cm')}<circle cx="200" cy="140" r="5"/>`);
 if(id==='csx-13')return svg('온도 눈금: 영하3도부터 영상5도까지 1도 간격',`<path d="M55 90H345"/>${Array.from({length:9},(_,i)=>`<path d="M${60+i*35} 80v20"/>${text(60+i*35,124,i-3)}`).join('')}${text(60,55,'아침')}${text(165,55,'저녁')}${text(340,55,'낮')}${text(200,168,'한 눈금은 1℃')}`);
 if(id==='csx-14'&&index<2)return svg(index===0?'정사각형 타일':'정육각형 결정',`<polygon points="${poly(index===0?4:6)}"/>${text(200,174,'어디를 접으면 두 부분이 겹칠까요?')}`);
 if(id==='csx-17')return `<div class="tile-stages">${[1,2,3].map(n=>`<div><b>${n}단계</b><span>${'◆'.repeat(n*2)}</span></div>`).join('')}</div>`;
 if(id==='csx-19')return svg('가로6m 세로4m 직사각형에서 오른쪽 위 가로2m 세로1m를 뺀 방',`<path d="M70 40H220V70H290V145H70Z"/><path d="M220 40H290V70" class="dashed"/>${text(180,25,'전체 가로 6m')}${text(35,103,'4m')}${text(256,57,'2m')}${text(320,58,'1m')}${text(195,173,'점선 부분은 기둥 자리 · 모양 예시')}`);
 if(id==='csx-26'&&index===2)return svg('직각삼각형의 두 각은90도와35도, 남은 각은물음표',`<polygon points="95,140 95,30 305,140"/><path d="M95 122h18v18"/>${text(126,110,'90°')}${text(247,129,'35°')}${text(127,67,'?')}${text(200,172,'모양 예시 · 실제 각도 비율과 달라요')}`);
 if(id==='csx-31'&&index===0)return svg('가로5칸 세로4칸의 빈 깃발',`${Array.from({length:20},(_,i)=>`<rect x="${90+i%5*43}" y="${10+Math.floor(i/5)*32}" width="43" height="32"/>`).join('')}${[1,2,3,4,5].map((n,i)=>text(111+i*43,157,n+'열')).join('')}`);
 if(id==='csx-36')return `<div class="dock-diagram">${[1,2,3,4].map(n=>`<span><b>${n}번 부두</b><i>⛵</i><small>어떤 배일까요?</small></span>`).join('')}</div>`;
 if(id==='csx-39'&&index===2)return svg('5개의 점을 연결할 때 닫힌 모양과 열린 모양을 비교해요',`<polyline points="${poly(5,55,100,85)}" fill="none"/>${poly(5,55,100,85).split(' ').map(pt=>{const [x,y]=pt.split(',');return `<circle cx="${x}" cy="${y}" r="5"/>`}).join('')}<polygon points="${poly(5,55,295,85)}" fill="none"/>${text(100,165,'한 줄로 이어진 모양')}${text(295,165,'닫힌 모양')}`);
 if(id==='csx-43')return svg('정다각형의 모든 변 길이는 같아요',`<polygon points="${poly([6,4,8][index])}"/>${text(200,174,index===0?'모든 변의 길이 4m':'모든 변의 길이가 같아요')}`);
 if(id==='csx-45')return `<div class="flag-palette"><div><b>위쪽 색</b>${['#e77765','#efc85e','#72a8d6'].map(c=>`<i style="background:${c}"></i>`).join('')}</div><div><b>아래쪽 색</b>${(index===2?['#e77765','#efc85e','#72a8d6']:index===1?['#fff','#273143','#aaa']:['#fff','#273143']).map(c=>`<i style="background:${c}"></i>`).join('')}</div></div>`;
 return old(id,q,index);
};
})(globalThis);
