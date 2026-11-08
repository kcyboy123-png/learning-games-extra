import {ANIMALS} from './life.mjs';
export function observationInvitation(spot){
 if(spot===115||spot===475)return '조금 더 머물까요? 흔적을 찾아 동물을 수첩에 담아 봐요.';
 if(spot===210)return '이번에는 내 잎을 띄우고, 물길을 직접 따라가 볼까요?';
 if(spot===362)return '물소리를 들으며 도시락을 먹거나, 마음에 드는 풍경을 찍어 봐요.';
 return '마음에 드는 풍경인가요? 직접 사진에 담아도 좋아요.';
}
export function summitInvitation(journal){
 const missing=ANIMALS.filter(a=>!journal.includes(a.id));
 return missing.length?'아직 못 만난 '+missing.slice(0,2).map(a=>a.name).join('·')+'도 있어요. 수첩에서 힌트를 보고 걸어온 길을 다시 살펴봐요.':'동물들을 모두 만났어요. 가장 좋았던 풍경을 사진으로 남겨 볼까요?';
}
