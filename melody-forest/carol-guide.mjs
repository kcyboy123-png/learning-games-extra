// Suggestions never write notes or restrict the child’s choices.
export function carolGuide(song,bar){
 if(song.progression!=='christmas-carol'||!Number.isInteger(bar)||bar<0||bar>7)return null;
 const phrases=['미–미–솔 · 같은 음을 두 번 반복해 봐요','라–솔–미 · 종소리처럼 내려와요','파–라–라 · 같은 리듬으로 대답해요','라–파–레 · 살짝 내려와 쉬어 가요','미–솔–솔 · 처음 가락을 다시 불러요','라–미–미 · 따뜻하게 이어 가요','파–레–시 · 다음 도를 기다리는 소리예요','솔–미–도 · 마지막 도는 길게!'];
 return {text:phrases[bar],pitches:[[64,67],[69,67,64],[65,69],[69,65,62],[64,67],[69,64],[65,62,71],[67,64,60]][bar]};
}
