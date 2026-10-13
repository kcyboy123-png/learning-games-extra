'use strict';
(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grids={'instruments':[2,2],'npc-roles':[4,2],supplies:[4,2],western:[2,2],'warships':[2,1],folk:[3,1],diplomacy:[3,1]};let pictureSerial=0;
function picture(ref,cls='',label='역사 학습 삽화'){
 if(!ref)return'';ref=({'folk-books':'folk:0','folk-fortune':'folk:1','folk-long':'folk:2'})[ref]||ref;const [file,n]=ref.split(':');
 if(n===undefined){const direct={painting:'assets/v2/painting-hd.jpg',samgang:'assets/v2/samgang.webp',geunjeong:'assets/v2/geunjeong.webp',ending:'assets/v3/ending-v3.webp'};return`<img class="lesson-image ${cls}" src="${direct[file]||'assets/v2/'+file+'.webp'}" alt="${esc(label)}">`;}
 const [cols,rows]=grids[file]||[3,2],i=+n,x=i%cols,y=Math.floor(i/cols),w=1536/cols,h=1024/rows,clip='art-clip-'+(++pictureSerial),fit='meet';return`<svg class="atlas-picture ${cls}" viewBox="${x*w} ${y*h} ${w} ${h}" preserveAspectRatio="xMidYMid ${fit}" role="img" aria-label="${esc(label)}"><defs><clipPath id="${clip}"><rect x="${x*w}" y="${y*h}" width="${w}" height="${h}"/></clipPath></defs><image href="assets/v2/${file}.webp" width="1536" height="1024" clip-path="url(#${clip})"/></svg>`;
}
function person(kind='stand',cls=''){
 const isCat=kind.startsWith('cat'),rect={stand:[243, 10, 432, 979],cheer:[833, 5, 431, 995],cat:[258,649,364,370],catWalk:[879,649,493,370]}[kind],clip='person-clip-'+(++pictureSerial),src=isCat?'assets/v2/byeolha-poses.webp':'assets/v3/byeolha-poses-v3.webp';
 return `<svg class="character-cutout ${cls}" viewBox="${rect.join(' ')}" role="img" aria-label="${isCat?'먹동이':'별하'}"><defs><clipPath id="${clip}"><rect x="${rect[0]}" y="${rect[1]}" width="${rect[2]}" height="${rect[3]}"/></clipPath></defs><image href="${src}" width="1536" height="1024" clip-path="url(#${clip})"/></svg>`;
}
function learning(m,q){return`<section class="learning-card">${picture(m.art||q.art,'','배운 내용을 떠올리는 그림')}<div><span class="eyebrow">잠깐! 이건 기억해요</span><h3>${esc(m.learnTitle||'그림으로 한 번 더')}</h3>${m.record?`<p class="knowledge-fact">${esc(m.record)}</p>`:''}<p>${esc(q.why)}</p></div></section>`;}
window.JOSEON_V2_ART={picture,person,learning};
})();
