'use strict';
(()=>{
const V=JOSEON_V2_ART,originalPicture=V.picture,originalPerson=V.person;let serial=0;
const sprites={origin:'origin-scenes',farm4:'farm-evidence'};
V.picture=(ref,cls='',label='역사 학습 삽화')=>{
 const [key,index]=String(ref||'').split(':'),file=sprites[key],clip='v4-art-'+(++serial);
 if(file){const x=(+index%2)*768,y=Math.floor(+index/2)*512;return `<svg class="atlas-picture v4-picture ${cls}" viewBox="${x} ${y} 768 512" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label}"><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="768" height="512"/></clipPath></defs><image href="assets/v4/${file}.webp" width="1536" height="1024" clip-path="url(#${clip})"/></svg>`;}
 const direct={king4:'king-council',village4:'goryeo-village',home4:'home-book-final'};
 if(direct[key])return `<img class="lesson-image v4-picture ${cls}" src="assets/v4/${direct[key]}.webp" alt="${label}">`;
 return originalPicture(ref,cls,label);
};
V.person=(kind='stand',cls='')=>{
 if(kind.startsWith('cat'))return originalPerson(kind,cls);
 const rect={"stand": [200, 12, 450, 987], "cheer": [726, 64, 803, 946]}[kind]||{"stand": [200, 12, 450, 987], "cheer": [726, 64, 803, 946]}.stand,clip='v4-person-'+(++serial);
 return `<svg class="character-cutout ${cls}" viewBox="${rect.join(' ')}" role="img" aria-label="${kind==='cheer'?'별하와 먹동이의 하이파이브':'별하'}"><defs><clipPath id="${clip}"><rect x="${rect[0]}" y="${rect[1]}" width="${rect[2]}" height="${rect[3]}"/></clipPath></defs><image href="assets/v4/hero-poses.webp" width="1536" height="1024" clip-path="url(#${clip})"/></svg>`;
};
V.learning=(m,q)=>`<section class="learning-card">${V.picture(m.art||q.art,'','배운 내용을 떠올리는 그림')}<div><span class="eyebrow">잠깐! 이건 기억해요</span><h3>${JOSEON.escape(m.learnTitle||'그림으로 한 번 더')}</h3>${m.record?`<p class="knowledge-fact">${JOSEON.escape(m.record)}</p>`:''}<p>${JOSEON.escape(q.why)}</p></div></section>`;
})();
