export class ChallengeClock {
 constructor(now=performance.now()){this.elapsed=0;this.last=now;this.running=false;}
 reset(elapsed=0,now=performance.now()){this.elapsed=elapsed;this.last=now;this.running=false;}
 advance(now,running){if(this.running)this.elapsed+=Math.max(0,now-this.last);this.last=now;this.running=running;return this.elapsed;}
}
export function savedChallenge(value){return value&&Number.isFinite(value.elapsed)&&value.elapsed>=0&&value.elapsed<=604800000?{elapsed:value.elapsed}:null;}
export function challengeRank(correct,total){
 if(!Number.isInteger(total)||total<1||total>96||!Number.isInteger(correct)||correct<0||correct>total)throw new RangeError('Invalid result');
 const accuracy=correct/total*100;
 return {accuracy:Math.round(accuracy),name:accuracy===100?'전개도 마스터':accuracy>=85?'상자 설계가':accuracy>=70?'접기 전문가':accuracy>=50?'도전 탐험가':'새싹 탐험가'};
}
export function clockText(ms){const seconds=Math.floor(Math.max(0,ms)/1000);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
