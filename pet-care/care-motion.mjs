// Mouth landmarks in the alpha-trimmed meal art, measured for all nine variants.
const MEAL_MOUTH={puppy:[.36,.955],'shiba-red':[.27,.92],'shiba-black':[.24,.93],'cat-cheese':[.25,.92],'cat-silver':[.24,.87],'cat-gray':[.28,.91],'pig-pink':[.29,.89],'pig-spotted':[.32,.87],'pig-panda':[.30,.92]};
const REST_MOUTH={puppy:[.45,.86],'shiba-red':[.34,.82],'shiba-black':[.35,.82],'cat-cheese':[.31,.80],'cat-silver':[.37,.79],'cat-gray':[.68,.82],'pig-pink':[.30,.79],'pig-spotted':[.31,.83],'pig-panda':[.31,.85]};
export const careMouth=(id,resting=false)=>(resting?REST_MOUTH:MEAL_MOUTH)[id]??MEAL_MOUTH.puppy;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function mealMotion(kind,age,species,reduced=false){
 const water=kind==='water',t=Math.max(0,age)/(species==='cat'?.94:species==='pig'?1.13:1);
 const rhythm=water?164:310,group=water?970:1350;
 const phase=(t%rhythm)/rhythm,active=t%group<(water?690:930)&&age>430&&age<3630;
 const pulse=active?Math.sin(phase*Math.PI)**2:0;
 const lift=water?(t%group>=690?2.2:0):(t%group>=930?4.8:0);
 return {lowered:age>=380&&age<3810,pulse:reduced?0:pulse,head:reduced?0:pulse*(water?3.5:5.6)-lift};
}
export function bowlAnchor(box,landmark,artRatio,ground){
 const x=box.x+landmark[0]*box.w,y=box.y+landmark[1]*box.h;
 // The bowl sits on the floor, and only its rim meets the lower muzzle.
 const bottom=ground+13,needed=Math.max(8,bottom-y+4);
 return {x,y,bottom,width:clamp(needed/(artRatio*.74),box.w*.245,box.w*.335)};
}
