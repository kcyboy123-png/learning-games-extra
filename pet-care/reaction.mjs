import {afterglowWeight} from './companion.mjs';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Amplitudes are fractions of body size; feet and props retain their shared anchor.
export function reactionTargets(kind,species,t,age,stroke,reduced,out={},contactStage=null,affection=null,touchPart='head'){
 out.angle=0;out.shift=0;out.breath=0;out.lift=0;if(reduced)return out;
 const rhythm=species==='cat'?1.12:species==='pig'?1.22:1,envelope=1-Math.exp(-Math.max(0,age)/(stroke?16:220)),phase=t/rhythm;
 out.breath=Math.sin(phase/1350)*.0015;
 if(kind==='sleep'||kind==='rest'){out.breath=Math.sin(phase/1750)*.0025;return out;}
 if(kind==='walk'){out.breath=0;return out;}
 if(kind==='water'||kind==='food'){out.angle=Math.sin(phase/(kind==='water'?240:380))*.004;out.breath=Math.sin(phase/700)*.001;}
 else if(kind==='play'){out.angle=Math.sin(phase/410)*.006;out.shift=Math.sin(phase/650)*.002;}
 else if(kind==='brush'){out.angle=Math.sin(phase/650)*.004;out.shift=Math.sin(phase/850)*.002;}
 else if(['name','found','peek','hello','invite'].includes(kind)){out.angle=Math.sin(phase/850)*.004;out.shift=Math.sin(phase/1100)*.002;}
 else if(kind==='window'||kind==='hide'){out.angle=Math.sin(phase/1300)*.003;}
 if(kind==='touch'&&!stroke){const press=age<240?Math.sin(Math.max(0,age)/240*Math.PI):0;out.angle=press?press*(touchPart==='chin'?.009:touchPart==='back'?-.005:-.008):0;out.breath-=press*.0012;}
 if(stroke){const freshness=Math.exp(-Math.max(0,t-stroke.at)/240),speed=(stroke.speed||0)*freshness,calm=1-clamp(speed/1.5,0,.7),direction=clamp((stroke.x-stroke.box.x)/stroke.box.w-.5,-.5,.5);const leanIn=clamp((stroke.calmRun||0)/500,0,1),part=stroke.part,angleMul=part==='chin'?1.35:part==='back'?.65:.85,shiftMul=part==='chin'?1.25:part==='back'?1.4:.8,lean=(stroke.lean||0)*freshness*3;out.angle=clamp(lean,-.0148,.0148)*angleMul*calm*(.5+.5*leanIn);out.shift=clamp(direction*.004+lean/.028*.005,-.00428,.00428)*shiftMul*calm*(.4+.6*leanIn);out.breath*=part==='head'?.6:part==='chin'?.75:.7;out.breath-=Math.tanh((stroke.pitch||0)*freshness/.025)*.025*(part==='chin'?.16:part==='head'?.1:.07);}
 if(stroke?.inside!==false&&stroke&&Number.isFinite(stroke.started)){const u=clamp((t-Math.max(stroke.started,stroke.reenteredAt??stroke.started,stroke.partStarted??stroke.started))/180,0,1),press=Math.sin(u*Math.PI)**(u<.5?1:2);out.angle+=press*((stroke.partStarted??stroke.started)>(stroke.reenteredAt??stroke.started)? .25:1)*(stroke.part==='chin'?.009:stroke.part==='back'?-.005:-.008);out.breath-=press*.0012;}
 if(stroke?.inside!==false&&stroke&&contactStage==='accept'){const hold=clamp((t-(stroke.partStarted??stroke.started??t)-(stroke.noticeMs??320))/900,0,1),trust=clamp((480-(stroke.noticeMs??320))/240,0,1),weight=hold*(.7+.3*trust);out.breath*=1-weight*.25;out.angle+=(stroke.part==='chin'?-.004:stroke.part==='back'?.003:-.003)*weight;out.shift+=clamp((stroke.x-stroke.box.x)/stroke.box.w-.5,-.5,.5)*.004*weight;}
 if(contactStage==='notice'){out.angle*=.7;out.shift*=.8;}if(contactStage==='pause'){if(!stroke||stroke.inside===false||(stroke.speed||0)*Math.exp(-Math.max(0,t-stroke.at)/240)>.75){out.angle=stroke?.inside===true?clamp(stroke.lean||0,-.002,.002):0;out.shift=stroke?.inside===true?-clamp((stroke.x-stroke.box.x)/stroke.box.w-.5,-.5,.5)*.002:0;}out.breath*=.5;}if(affection){const linger=afterglowWeight(t,affection),blend=1-Math.exp(-Math.max(0,t-affection.at)/400),strength=species==='cat'?.75:species==='pig'?.55:1;out.angle=(affection.from?.angle??affection.direction*.008*strength)*linger;out.shift=(affection.from?.shift??affection.direction*.004*strength)*linger;out.breath=(affection.from?.breath??0)*(1-blend)+Math.sin(phase/1550)*.002*blend;return out;}
 const weight=stroke?(species==='cat'?.92:species==='pig'?.84:1):1;out.angle*=envelope*weight;out.shift*=envelope*weight;return out;
}
export function easeReaction(current,target,dt,ms=180){const f=1-Math.exp(-Math.max(0,Math.min(64,dt))/ms);for(const key of ['angle','shift','breath','lift'])current[key]=(current[key]||0)+(target[key]- (current[key]||0))*f;return current;}

