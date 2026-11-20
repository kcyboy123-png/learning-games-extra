export const bowRate=note=>note.end-note.start<=.34?.55/Math.max(.04,note.end-note.start):.8;
export function phraseBreath(note,time){
 if(!note||note.pitch===null||time<=note.start||time>=note.end)return 0;
 const duration=note.end-note.start,attack=Math.min(.18,duration*.3),release=Math.min(.24,duration*.3);
 return Math.min(1,(time-note.start)/attack,(note.end-time)/release);
}
export function playbackBeat(time,bpm){return Math.min(7,Math.floor(((time*bpm/30)%8+8)%8));}
// A bowed note follows its audio time, including gentle starts and releases.
export function bowStroke(note,time,reduced=false){
 if(reduced||!note||note.pitch===null||time<note.start||time>=note.end)return 0;
 if(time===note.start)return note.bowFrom??0;
 const phase=note.bowPhase??Math.acos(Math.max(-1,Math.min(1,note.bowFrom??0)));
 return Math.cos(phase+(time-note.start)*Math.PI*bowRate(note));
}
// One gesture per sounding note; a held note never becomes a repeated strum.
export function noteGesture(note,time,reduced=false){
  if(reduced||!note||note.pitch===null||time<=note.start||time>=note.end)return 0;
  const age=time-note.start,length=Math.min(.34,note.end-note.start);
  if(age>=length)return 0;
  const attack=Math.min(.045,length*.3);
  return age<attack?Math.sin(Math.PI*.5*age/attack)**2:Math.cos(Math.PI*.5*(age-attack)/(length-attack))**2;
}

// One shake, then a small recoil, all inside the authored hit.
export function shakerStroke(note,time,reduced=false){
 if(reduced||!note||note.pitch===null||time<=note.start||time>=note.end)return 0;
 const phase=(time-note.start)/Math.min(.18,note.end-note.start);
 if(phase>=1)return 0;
 return phase<.55?Math.sin(Math.PI*phase/.55)**2:-.18*Math.sin(Math.PI*(phase-.55)/.45)**2;
}

// Local weights keep the face, feet and instrument outside the hand regions fixed.
// shortcut: painted wrists/fingers bend in 2D; individual key/string fingering needs separated, rigged art.
export function handRig(geometry,regions){
  const position=geometry.attributes.position,uv=geometry.attributes.uv,base=position.array.slice();
  const weights=regions.map(({x,y,rx,ry})=>Array.from({length:position.count},(_,i)=>{
    const d=Math.hypot((uv.getX(i)-x)/rx,(1-uv.getY(i)-y)/ry);
    const k=Math.max(0,1-d*d);return k*k;
  }));
  return strengths=>{
    position.array.set(base);
    for(let r=0;r<regions.length;r++){
      const {dx=0,dy=0}=regions[r],strength=strengths[r]||0;if(!strength)continue;
      for(let i=0;i<position.count;i++){
        const k=weights[r][i]*strength;
        position.array[i*3]+=dx*k;position.array[i*3+1]+=dy*k;
      }
    }
    position.needsUpdate=true;
  };
}

export function pianoPressure(hand,time,dt){
 const age=time-(hand.start??0);
 if(hand.end&&age>=0&&time<hand.end)return .72*Math.sin(Math.min(1,age/.06)*Math.PI/2)**2;
 const released=(hand.hit||0)*Math.exp(-Math.max(0,dt)*18);return released<.001?0:released;
}
