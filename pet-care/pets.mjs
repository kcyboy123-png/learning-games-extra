export const PETS = Object.freeze([
 {id:'puppy',name:'하얀 강아지',species:'dog',gait:'puppy'},
 {id:'shiba-red',name:'황시바',species:'dog',gait:'shiba'},
 {id:'shiba-black',name:'블랙탄 시바',species:'dog',gait:'shiba'},
 {id:'cat-cheese',name:'치즈 바이컬러',species:'cat',gait:'cat'},
 {id:'cat-silver',name:'장모 실버',species:'cat',gait:'cat'},
 {id:'cat-gray',name:'둥근 회색',species:'cat',gait:'cat'},
 {id:'pig-pink',name:'뽀얀 분홍',species:'pig',gait:'pig'},
 {id:'pig-spotted',name:'점박이',species:'pig',gait:'pig'},
 {id:'pig-panda',name:'판다',species:'pig',gait:'pig'}
]);
export const petById = id => PETS.find(p=>p.id===id) ?? PETS[0];
export const BANK_POSES = Object.freeze({base:[0,1,2,3,4,5,6,7],walk:[12,13,14,15,16,17,18,19],bond:[8,9,10,11,20,21,22,23]});
export const petArt = (id,bank) => `assets/pets/${petById(id).id}/${bank}.webp`;
// Tail-up and tail-down silhouettes need different heights to preserve body scale.
export function speciesHeight(id,pose){
 if(pose>=36&&pose<=39)return pose===39?.48:pose===38?.86:1;
 const pet=petById(id);
 if(pose>=28&&pose<=35)return pose===35?.72:pose===29?1.02:pose===30||pose===31?.96:1;
 if(pose>=24&&pose<=27){
  if(pose===26)return id==='puppy'?.85:pet.species==='dog'?.89:pet.species==='cat'?.90:.86;
  return pose===25?.98:1;
 }
 if(pet.species==='dog')return null;
 const cheese=id==='cat-cheese',pig=pet.species==='pig';
 if(pose>=12&&pose<20)return cheese?.88:pig?.68:.65;
 return ({2:cheese?.92:pig?.74:.82,3:.48,4:cheese?.78:.66,20:cheese?.88:pig?.68:id==='cat-gray'?.76:.65,21:.84,22:.72,23:.58})[pose]??1;
}
const PLAY_MOUTH={'shiba-red':[-.07,.23],'shiba-black':[-.07,.23],'cat-cheese':[-.20,.20],'cat-silver':[-.17,.15],'cat-gray':[-.14,.18],'pig-pink':[0,.20],'pig-spotted':[-.225,.18],'pig-panda':[-.205,.17]};
export function mouthAnchor(id,pose){
 if(pose>=12&&pose<20)return [-.43,id==='cat-cheese'?.47:id.startsWith('shiba-')?.60:.65];
 if(pose>=20&&pose<22)return [-.39,id==='cat-cheese'?.59:.65];
 if(pose===2)return PLAY_MOUTH[id]??[-.12,.28];
 if(pose===22)return [-.16,.32];
 if(pose===23)return [-.13,.55];
 return [pose===5?-.15:-.04,.68];
}
