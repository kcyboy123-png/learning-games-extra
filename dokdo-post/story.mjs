export const placeNames={A:'독도 도착 부두',B:'동도 편지 마당',C:'서도 쉼터',H:'바다 선착장',P:'꽃 편지 우체국'};
export const STORIES=[
 {to:'아침 차를 마실 친구',opening:'컵이 깨지지 않게 싸 줄래?',why:'둥근 컵도 네모난 상자에 담을 수 있어. 먼저 여러 상자를 돌려 보며, 포장에 쓸 직육면체를 찾아보자.',first:'연습용 상자를 돌려 보고, 평평한 면 하나를 눌러 봐.',finish:'컵이 깨지지 않게, 포장 끝!',reply:'컵으로 따뜻한 차를 마셨어. 고마워!'},
 {to:'마을이 그리운 친구',opening:'액자가 다치지 않게 보호해 줄래?',why:'배가 흔들려도 액자가 다치지 않도록 상자의 면을 살피고, 모서리와 꼭짓점에 보호대를 붙이자.',first:'상자를 쓸어 돌려 보고, 먼저 눈앞의 면부터 살펴봐.',finish:'액자 모서리까지 안전하게!',reply:'사진을 보니 마을이 가까워진 것 같아!'},
 {to:'바다를 기록하는 친구',opening:'친구가 도구함을 찾게 그림을 그려 줄래?',why:'친구가 상자를 알아보기 쉽도록 모양을 그려 두자. 보이는 모서리는 실선, 가려진 모서리는 점선으로 남겨.',first:'먼저 세 면이 함께 보이는 그림을 찾아 살펴보자.',finish:'도구함 그림도 함께 담았어요.',reply:'그림 덕분에 도구함을 찾았어. 고마워!'},
 {to:'저녁 편지를 읽을 친구',opening:'등불이 흔들리지 않게 받쳐 줄래?',why:'등불이 기울지 않게 상자 안 받침을 생각해 보자. 마주 보는 면과 만나서 직각을 이루는 면을 살펴봐.',first:'별표가 있는 면을 찾고, 상자를 돌려 그 반대편을 봐.',finish:'등불이 흔들리지 않게, 준비 끝!',reply:'네가 보낸 등불로 저녁이 환해졌어!'},
 {to:'간식을 나눌 친구들',opening:'간식 담을 상자를 접어 줄래?',why:'간식을 담을 정육면체 상자를 만들자. 종이 여섯 면이 빈틈없이 접히는지 직접 확인해 봐.',first:'종이를 먼저 살펴보고, 접었을 때 서로 만날 면을 찾아봐.',finish:'직접 접은 상자에 간식을 담았어요.',reply:'간식을 함께 나눠 먹었어. 고마워!'},
 {to:'편지를 기다리는 친구',opening:'편지와 종이 우체부를 보내 줄래?',why:'길이가 다른 직사각형을 맞춰 편지 상자와 종이 우체부를 만들자. 여기는 실제 선물 크기가 아닌 학습용 cm 모형이야.',first:'보관함에서 종이를 고르고 모눈 칸을 눌러 놓아 봐. 다시 집어 옮겨도 돼.',finish:'편지와 종이 우체부, 준비 끝!',reply:'종이 우체부 곁에서 답장을 쓸게!'},
 {to:'독도 친구들',opening:'우리 편지를 한 상자에 담아 줄래?',why:'상자 모양, 구성 요소, 겨냥도와 전개도를 차례로 살펴보며 마지막 학습 모형을 준비하자.',first:'지금까지 했던 방법을 하나씩 떠올려 봐. 어려우면 조작 안내부터 다시 볼 수 있어.',finish:'친구들의 마음을 모두 담았어요.',reply:'우리 마음도 마을로 보낼게. 고마워!'}
];
export const portrait=id=>`assets/resident-${Math.min(id,5)}.png`;
// Small deterministic item illustrations remain separate from the assessed geometry.
const giftImages=new Map();
export function itemImage(id){
 if(giftImages.has(id))return giftImages.get(id);
 const art=[
 '<path d="M48 50h72v57q-36 30-72 0z" fill="#87b4bb" stroke="#547d85" stroke-width="5"/><path d="M121 60q42-2 26 34q-8 12-24 5" fill="none" stroke="#547d85" stroke-width="9"/><ellipse cx="84" cy="50" rx="36" ry="9" fill="#e0ede6"/><path d="M70 33q-10-9 0-20m25 20q-10-9 0-20" fill="none" stroke="#b4a78b" stroke-width="4"/><ellipse cx="88" cy="130" rx="56" ry="7" fill="#cfbd98"/>',
 '<rect x="25" y="24" width="130" height="112" rx="7" fill="#b48c5d"/><rect x="35" y="34" width="110" height="92" fill="#d5e4d2"/><path d="M35 92l30-26 25 20 30-38 25 42v36H35" fill="#89a36f"/><path d="M68 108V78h31v30" fill="#eee0bc"/><path d="M60 80l24-19 24 19" fill="#668477"/><circle cx="51" cy="54" r="10" fill="#f5d890"/>',
 '<rect x="25" y="36" width="75" height="102" rx="6" fill="#729a85"/><rect x="33" y="31" width="65" height="100" rx="5" fill="#eee2bd"/><path d="M43 55h43m-43 18h43m-43 18h33" stroke="#b6aa8a" stroke-width="4"/><rect x="104" y="60" width="50" height="73" rx="6" fill="#be966a"/><path d="M114 60V48h30v12" fill="none" stroke="#836447" stroke-width="6"/>',
 '<path d="M66 34V24q24-20 48 0v10" fill="none" stroke="#826b49" stroke-width="6"/><rect x="54" y="42" width="73" height="80" rx="10" fill="#f5d98c" stroke="#8b7954" stroke-width="7"/><path d="M58 40h65m-65 85h65M72 46v73m39-73v73" stroke="#8b7954" stroke-width="6"/><path d="M88 109q-25-10 1-47q24 35-1 47" fill="#ecad55"/>',
 '<rect x="24" y="64" width="133" height="71" rx="8" fill="#c6a16c"/><path d="M25 77h130" stroke="#92724d" stroke-width="5"/><g fill="#edc98b" stroke="#c1975e" stroke-width="3"><circle cx="51" cy="57" r="22"/><circle cx="90" cy="51" r="24"/><circle cx="128" cy="57" r="22"/></g><g fill="#946c47"><circle cx="46" cy="52" r="3"/><circle cx="60" cy="62" r="3"/><circle cx="84" cy="44" r="3"/><circle cx="98" cy="58" r="3"/><circle cx="126" cy="52" r="3"/></g>',
 '<rect x="25" y="85" width="84" height="51" rx="4" fill="#f5e5c3" stroke="#c3a173" stroke-width="3"/><path d="M26 86l41 30 41-30" fill="none" stroke="#c3a173" stroke-width="3"/><g fill="#bc986a" stroke="#826b4d" stroke-width="3"><rect x="103" y="28" width="39" height="34"/><rect x="100" y="65" width="44" height="45"/><path d="M103 111v22h13v-22m14 0v22h13v-22M88 70v32h10V70m47 0v32h10V70"/></g><circle cx="114" cy="44" r="3" fill="#384c47"/><circle cx="132" cy="44" r="3" fill="#384c47"/>',
 '<g stroke="#b99768" stroke-width="3"><path d="M25 58l28-20 110 18v78H25z" fill="#c5a06e"/><path d="M25 58h138"/><rect x="44" y="38" width="82" height="53" rx="4" fill="#f7e9cc"/><path d="M44 38l41 29 41-29" fill="none"/><path d="M75 92v41m17-41v41" stroke="#739885" stroke-width="9"/></g>'
 ][id]||'';
 const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="160" viewBox="0 0 180 160">${art}</svg>`);
 if(Number.isInteger(id)&&id>=0&&id<7)giftImages.set(id,url);return url;
}
export function coachFor(step){
 if(step.kind==='net-points')return {title:'접히는 자리를 따라가요',moves:[step.ask==='segment'?'노란 모서리와 만나게 될 가장자리 선을 눌러요.':'노란 기준점과 만나게 될 흰 점을 모두 눌러요.','접기 슬라이더를 움직여 만나는 자리를 살펴봐요.','같은 곳을 다시 누르면 취소돼요.']};
 if(step.kind==='tray-count')return {title:'포장 종이를 준비해요',moves:['필요한 종이 아래 +를 눌러 장수를 맞춰요.','너무 많이 골랐으면 −로 한 장씩 빼요.','가로와 세로 길이를 보고 상자의 면에 맞춰요.']};
 if(step.kind==='link')return {title:'같은 상자끼리 연결해요',moves:['각 상자의 선택 칸에서 겨냥도 A·B·C와 전개도 ㄱ·ㄴ·ㄷ을 골라요.','견본 그림에 적힌 길이를 서로 비교해요. 세로 화면에서는 작업대를 위아래로 밀어 봐요.','세 상자의 칸을 모두 골랐으면 확인해요.']};
 if(step.kind==='cut-plan')return {title:'종이가 이어지게 펼쳐요',moves:['빨간 선대로 잘랐을 때 한 장으로 펼쳐지는 카드를 눌러요.','뒤쪽 모서리도 비쳐 보여요.','선택한 뒤 확인하면 펼친 모습을 볼 수 있어요.']};
 if(step.kind==='solid'&&step.mode==='pairs')return {title:'면끼리 짝지어요',moves:['조건에 맞는 첫 면을 누르고, 돌려서 짝이 될 면을 눌러요.','같은 모양 표시가 붙으면 한 쌍이에요.','짝을 다시 누르면 풀 수 있어요.']};
 if(step.kind==='solid')return {title:step.mode==='vertices'?'보호캡을 붙여 볼까요?':step.mode==='edges'?'길쭉한 보호대를 붙여요':'상자를 돌려 살펴봐요',moves:step.mode==='vertices'?['상자의 끝점을 누르면 바로 붙어요. 보호캡을 끌어 놓아도 돼요.','화면을 쓸어 뒤쪽도 돌려 봐요.','같은 곳을 다시 누르면 뗄 수 있어요.']:[step.mode==='edges'?'상자의 모서리를 눌러 보호대를 붙여요.':step.mode==='faces'?'상자를 돌려 면이 넓게 보일 때 눌러요.':'상자의 면·모서리·꼭짓점을 눌러 표시해요.','쓸어서 돌리거나 아래 회전 버튼을 써요.','잘못 고르면 같은 곳을 다시 눌러요.']};
 if(step.kind==='peel')return {title:'포장 종이를 살펴봐요',moves:['네 변에 적힌 길이를 봐요.','모두 같은지 하나만 고른 뒤 내 답 확인을 눌러요.']};
 if(step.kind==='sort')return {title:'직육면체 상자를 찾아요',moves:['각 상자의 화살표로 다른 면도 살펴봐요.','알맞은 상자 아래 버튼을 눌러요.','여러 개를 골라도 돼요. 다시 누르면 취소돼요.']};
 if(step.kind==='net-build')return {title:'종이를 집어 상자를 만들어요',moves:[step.replaceable?'모눈의 바꿀 조각을 집고 ‘보관함에 넣기’를 눌러요.':step.movable?'모눈의 옮길 조각을 눌러 집어요.':'보관함의 종이를 누른 뒤 모눈 칸을 눌러요.',step.fixedBase?'처음 놓인 종이는 고정돼 있어요. 새로 붙인 조각은 다시 집을 수 있어요.':step.replaceable?'보관함에서 맞는 종이를 골라 빈자리에 붙여요.':step.movable?'옮길 종이를 눌러 집고, 빈 모눈 칸을 눌러 놓아요.':'놓은 종이를 다시 집어 옮겨도 돼요.','다 만들면 접어서 확인해요. 풀칠 날개는 공부하는 면에 세지 않아요.']};
 if(step.kind==='sketch')return {title:'받는 친구에게 모양을 알려 줘요',moves:[step.tool==='draw'?'실선·점선 중 선 종류를 먼저 골라요. 이을 꼭짓점 두 개를 차례로 눌러요.':'바꿀 모서리를 눌러 실선과 점선을 살펴봐요.','보이는 선과 가려진 선을 구분해요.','되돌리기로 마지막 동작을 취소할 수 있어요.']};
 return {title:step.kind==='fill'?'포장 기록을 함께 남겨요':'천천히 하나씩 살펴봐요',moves:[step.kind==='fill'?'빈칸이나 선택 칸을 눌러 답을 넣어요.':'그림과 종이를 먼저 살펴봐요.','위에 적힌 부탁을 읽고, 하나 고르기인지 모두 고르기인지 살펴봐요.','마지막 확인 전에는 자유롭게 바꿔도 돼요.']};
}
