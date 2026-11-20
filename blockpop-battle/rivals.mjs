import {botPlan} from './engine.mjs';

// Early rivals send smaller volleys; combo and defence rules remain shared.
export const RIVALS = [
 {name:'모모',title:'첫 번째 친구',line:'천천히, 한 줄부터 같이 해 보자!',pace:'아주 천천히',delay:7400,think:800,interval:190,errorEvery:2,errorRank:4},
 {name:'토토',title:'발랄한 도전자',line:'빈칸을 찾아 착! 준비됐어?',pace:'천천히',delay:6500,think:700,interval:170,errorEvery:3,errorRank:3},
 {name:'피코',title:'반짝이는 발명가',line:'두 줄을 한 번에! 함께 도전해 볼까?',pace:'차근차근',delay:5600,think:600,interval:150,errorEvery:4,errorRank:2},
 {name:'루나',title:'차분한 전략가',line:'다음 블록을 보면 길이 보여.',pace:'차분하게',delay:4800,think:500,interval:130,errorEvery:5,errorRank:1},
 {name:'볼트',title:'번개 같은 승부사',line:'콤보를 이어 볼 시간이야!',pace:'조금 빠르게',delay:4100,think:450,interval:110,errorEvery:6,errorRank:1},
 {name:'타이탄',title:'흔들리지 않는 수호자',line:'공격이 와도 차분히 지워 봐.',pace:'단단하게',delay:3500,think:400,interval:100,errorEvery:0,errorRank:0},
 {name:'이클립스',title:'고요한 반격',line:'한 번 막고, 다시 보내 볼까?',pace:'빠르고 정확하게',delay:3000,think:350,interval:90,errorEvery:0,errorRank:0},
 {name:'노바',title:'하늘의 기사',line:'네 최고의 콤보를 보여 줘!',pace:'매우 빠르게',delay:2500,think:300,interval:80,errorEvery:0,errorRank:0},
 {name:'오닉스',title:'마지막 챔피언',line:'여기까지 왔구나. 멋진 승부를 하자!',pace:'챔피언',delay:2100,think:250,interval:70,errorEvery:0,errorRank:0}
].map((r,index)=>Object.freeze({...r,index,attackLimit:index<3?2:index<6?3:4,sheet:Math.floor(index/3)+1,column:index%3}));

export function accessible(index,cleared){return Number.isInteger(index)&&index>=0&&index<9&&index<=cleared;}
export function completeStage(cleared,index,winner){return winner===0&&accessible(index,cleared)?Math.max(cleared,Math.min(9,index+1)):cleared;}
export function advanceSeries(series,roundWinner){
 if(series.winner!==null)return series;
 const wins=series.wins.slice();
 if(roundWinner===0||roundWinner===1)wins[roundWinner]++;
 return {wins,winner:wins[0]===2?0:wins[1]===2?1:null};
}
export function createBot(index){if(!RIVALS[index])throw new RangeError('Unknown rival');return {index,pieceId:0,plan:null,start:0,next:0,path:[]};}
export function rivalActions(bot,p,now){
 if(p.dead||!p.piece)return [];
 const r=RIVALS[bot.index];
 if(bot.pieceId!==p.pieceId){
  bot.pieceId=p.pieceId;bot.start=now;bot.next=now+r.think;
  const rank=r.errorEvery&&(p.locks+1)%r.errorEvery===0?r.errorRank:0;
  bot.plan=botPlan(p,rank);bot.path=bot.plan?.path.slice()||[];
 }
 if(now<bot.next)return [];
 bot.next=now+r.interval;
 if(bot.path.length)return [{action:bot.path.shift(),pieceId:p.pieceId}];
 if(now-bot.start>=r.delay)return [{action:'drop',pieceId:p.pieceId}];
 return [];
}
