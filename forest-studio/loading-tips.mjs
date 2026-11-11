const pairs=[
 ['빈터는 비어 있는 게 아니라, 기다리고 있어요.','숲 꾸미기를 누르면 위에서 재료를 놓을 수 있어요.'],
 ['정답인 숲은 없어요. 나만의 숲이 있을 뿐이에요.','재료를 놓기 전에 돌려 보고 크기도 바꿔 보세요.'],
 ['누군가를 떠올리며 심은 나무는 조금 더 다정해요.','메뉴의 의뢰 편지에서 누구를 위한 숲인지 골라요.'],
 ['꽃 한 송이도 누군가에게는 선물이에요.','작은 식물은 세 개·다섯 개씩 함께 놓을 수 있어요.'],
 ['고쳐도 괜찮아요. 정원사는 늘 다듬는 사람이에요.','방금 한 작업은 되돌리기로 되돌릴 수 있어요.'],
 ['걷다가 잠깐 멈추고 싶은 풍경을 만들어 보세요.','숲 걷기를 누르면 내가 꾸민 곳을 걸어볼 수 있어요.'],
 ['아침의 숲과 밤의 숲은 다른 이야기를 해요.','아침·밤 버튼을 눌러 같은 정원의 다른 빛을 살펴봐요.'],
 ['작은 정원에 오늘의 마음을 남겨 보세요.','메뉴의 작품 엽서에서 내 숲을 그림으로 간직해요.']
];
const loading=document.querySelector('#loading'),thought=document.querySelector('#loadingThought'),hint=document.querySelector('#loadingHint');
let index=Math.floor(Math.random()*pairs.length),timer,stopped=false;
function show(){[thought.textContent,hint.textContent]=pairs[index];index=(index+1)%pairs.length;}
function schedule(){clearInterval(timer);if(!stopped&&!document.hidden)timer=setInterval(show,4000);}
function stop(){stopped=true;clearInterval(timer);observer.disconnect();document.removeEventListener('visibilitychange',schedule);window.removeEventListener('pagehide',stop);}
const observer=new MutationObserver(()=>{if(loading.hidden||loading.classList.contains('ready')||!thought.isConnected)stop();});
observer.observe(loading,{attributes:true,attributeFilter:['hidden','class'],childList:true});
show();schedule();document.addEventListener('visibilitychange',schedule);window.addEventListener('pagehide',stop);
