export const PLACES=Object.freeze({
 home:{name:'우리 집',description:'익숙한 방에서 편안하게 쉬어요.'},
 lane:{name:'집 앞 산책길',description:'천천히 걷고 새로운 냄새를 맡아요.',activity:'풀숲 살펴보기',kind:'sniff',memory:'집 앞 산책길에서 함께 풀숲의 냄새를 맡았어요'},
 park:{name:'꽃잎 공원',description:'꽃잎을 따라가고 공을 굴려요.',activity:'꽃잎 따라가기',kind:'petal',memory:'꽃잎 공원에서 날리는 꽃잎을 함께 따라갔어요'},
 picnic:{name:'숲속 피크닉',description:'물 한 모금, 돗자리에서 쉬어 가요.',activity:'물 한 모금',kind:'water',memory:'숲속 피크닉에서 함께 물을 마셨어요'},
 waterside:{name:'물가 쉼터',description:'마른 데크에서 잔잔한 물결을 바라봐요.',activity:'물결 바라보기',kind:'watch',memory:'물가 쉼터에서 나란히 물결을 바라보았어요'}
});
export function outingPose(kind,species,elapsed){if(elapsed<1800)return 5;if(elapsed>=5100||elapsed>=3400&&elapsed<4000)return 11;if(kind==='sniff')return species==='pig'?22:species==='cat'?5:2;if(kind==='petal')return species==='cat'?7:species==='pig'?22:5;return 5;}
const placeLoads=new Map();
export async function loadPlaceImage(id){if(placeLoads.has(id))return placeLoads.get(id);const task=decodePlaceImage(id);placeLoads.set(id,task);try{return await task;}catch(error){placeLoads.delete(id);throw error;}}
async function decodePlaceImage(id){if(!Object.hasOwn(PLACES,id)||id==='home')throw Error('장소를 확인해 주세요.');const image=new Image();image.decoding='async';image.src='assets/places/'+id+'.webp';let timer;try{await Promise.race([image.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('장소를 불러오는 시간이 길어지고 있어요.')),12000);})]);return image;}finally{clearTimeout(timer);}}
const OUTDOOR_MOMENTS={
 lane:{dog:['sniff','greet','watch'],cat:['watch','sniff','greet'],pig:['sniff','greet','settle']},
 park:{dog:['toy','watch','greet'],cat:['petal','greet','watch'],pig:['sniff','toy','greet']},
 picnic:{dog:['settle','greet','sniff'],cat:['watch','settle','greet'],pig:['sniff','settle','greet']},
 waterside:{dog:['watch','greet','settle'],cat:['watch','settle','greet'],pig:['watch','greet','sniff']}
};
export function outdoorMoment(place,species,turn=0){const choices=OUTDOOR_MOMENTS[place]?.[species];return choices?choices[turn%choices.length]:null;}
export function curiosityPose(kind,species,elapsed){if(elapsed<1200)return 11;if(kind==='settle')return elapsed<2400?1:23;if(elapsed>=4300)return 11;if(kind==='greet')return 11;if(elapsed>=3000&&elapsed<3500)return 11;if(kind==='sniff')return species==='pig'?22:species==='cat'?5:2;if(kind==='petal'||kind==='toy')return species==='cat'?7:species==='pig'?22:2;return 5;}
