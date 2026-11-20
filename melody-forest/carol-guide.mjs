// Suggestions never write notes or restrict the child’s choices.
export function carolGuide(song,bar){
 if(song.progression!=='christmas-carol'||!Number.isInteger(bar)||bar<0||bar>7)return null;
 const phrases=['미','라','파','라','미','라','파','솔'];
 const second=['미','솔','라','파','솔','미','레','미'];
 const last=['솔','미','라','레','솔','미','시','도'];
 return {text:`예시: ${phrases[bar]} 1박 → ${second[bar]} 1박 → ${last[bar]} 2박`,instruction:`‘1박’을 고르고 ${phrases[bar]}·${second[bar]}, ‘2박’을 고르고 ${last[bar]}를 눌러요. 다른 음과 리듬으로 바꿔도 좋아요.`,pitches:[[64,67],[69,67,64],[65,69],[69,65,62],[64,67],[69,64],[65,62,71],[67,64,60]][bar]};
}
