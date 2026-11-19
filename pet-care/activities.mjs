export function toyName(species,toy){return ({dog:{ball:'매듭공',bone:'뼈 인형'},cat:{ball:'굴리는 공',bone:'깃털'},pig:{ball:'코로 미는 공',bone:'찾기 공'}}[species]||{} )[toy]||'장난감';}
export function lifeSuggestion(s,rain){
 if(s.bond.last==='play')return 'water';
 if(s.bond.last==='food')return 'brush';
 if(s.bond.last==='brush'||s.bond.last==='touch')return 'rest';
 return rain?'window':null;
}
