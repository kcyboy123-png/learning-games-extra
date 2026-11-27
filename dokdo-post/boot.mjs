import {entryOpening} from './opening.mjs?v=gifts-math-final-20261119';
import {createPostSound} from './sound.mjs?v=gifts-math-final-20261119';
let soundStorage;try{soundStorage=localStorage;}catch{}
const openingSound=createPostSound(soundStorage);

// Show the film without waiting for the map's 3D dependency graph.
let ready=false;
const village=import('./post.mjs?v=tablet-performance-20261127').then(module=>{
  ready=true;return module;
}).catch(error=>{console.error('Village loading failed',error);return null;});
entryOpening(async()=>{
  let waiting;
  if(!ready){
    waiting=document.createElement('dialog');waiting.className='entry-opening';
    const label=document.createElement('strong');
    label.className='entry-title';label.textContent='마을로 가는 중…';
    waiting.append(label);document.body.append(waiting);waiting.showModal();
    waiting.addEventListener('cancel',e=>e.preventDefault());
  }
  const module=await village;
  if(module){await module.startVillage();waiting?.remove();return;}
  waiting.querySelector('strong').textContent='마을을 불러오지 못했어요';
  const retry=document.createElement('button');
  retry.className='entry-skip';retry.textContent='다시 연결';
  retry.onclick=()=>location.reload();waiting.append(retry);retry.focus();
},openingSound);




