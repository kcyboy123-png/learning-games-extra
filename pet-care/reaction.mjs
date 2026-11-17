import {afterglowWeight} from './companion.mjs';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Amplitudes are fractions of body size; feet and props retain their shared anchor.
export function reactionTargets(kind,species,t,age,stroke,reduced,out={},contactStage=null,affection=null){
 out.angle=0;out.shift=0;out.breath=0;out.lift=0;if(reduced)return out;
 const rhythm=species==='cat'?1.12:species==='pig'?1.22:1,envelope=1-Math.exp(-Math.max(0,age)/220),phase=t/rhythm;
 out.breath=Math.sin(phase/1350)*.0015;
 if(kind==='sleep'||kind==='rest'){out.breath=Math.sin(phase/1750)*.0025;return out;}
 if(kind==='walk'){out.breath=0;return out;}
 if(kind==='water'||kind==='food'){out.angle=Math.sin(phase/(kind==='water'?240:380))*.004;out.breath=Math.sin(phase/700)*.001;}
 else if(kind==='play'){out.angle=Math.sin(phase/410)*.006;out.shift=Math.sin(phase/650)*.002;}
 else if(kind==='brush'){out.angle=Math.sin(phase/650)*.004;out.shift=Math.sin(phase/850)*.002;}
 else if(['name','found','peek','hello','invite'].includes(kind)){out.angle=Math.sin(phase/850)*.004;out.shift=Math.sin(phase/1100)*.002;}
 else if(kind==='window'||kind==='hide'){out.angle=Math.sin(phase/1300)*.003;}
 if(stroke){const freshness=Math.exp(-Math.max(0,t-stroke.at)/240),speed=(stroke.speed||0)*freshness,calm=1-clamp(speed/1.5,0,.7),direction=clamp((stroke.x-stroke.box.x)/stroke.box.w-.5,-.5,.5);out.angle=clamp((stroke.lean||0)*freshness,-.02,.02)*calm;out.shift=direction*.012*calm;out.breath*=.7;}
 if(contactStage==='notice'){out.angle*=.35;out.shift*=.4;}if(contactStage==='pause'){out.angle=0;out.shift=0;out.breath*=.5;}if(affection){const linger=afterglowWeight(t,affection),blend=1-Math.exp(-Math.max(0,t-affection.at)/400),strength=species==='cat'?.75:species==='pig'?.55:1;out.angle=(affection.from?.angle??affection.direction*.008*strength)*linger;out.shift=(affection.from?.shift??affection.direction*.004*strength)*linger;out.breath=(affection.from?.breath??0)*(1-blend)+Math.sin(phase/1550)*.002*blend;return out;}
 out.angle*=envelope;out.shift*=envelope;return out;
}
export function easeReaction(current,target,dt){const f=1-Math.exp(-Math.max(0,Math.min(64,dt))/180);for(const key of ['angle','shift','breath','lift'])current[key]=(current[key]||0)+(target[key]- (current[key]||0))*f;return current;}
