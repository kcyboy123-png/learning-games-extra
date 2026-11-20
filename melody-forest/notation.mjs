// Small notation primitives use the same staff coordinates as the editor.
export function restGlyph(ticks,x){
 if(ticks>=4)return `<rect class="rest-mark" x="${x-8}" y="${ticks===8?130:140}" width="16" height="6"/>`;
 if(ticks===1)return `<g class="rest-mark" transform="translate(${x} 146)"><circle cx="-3" cy="-9" r="4"/><path d="M-2 -6 Q7 -3 8 -13 L1 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></g>`;
 return `<path class="rest-mark" transform="translate(${x} 146)" d="M-3 -23 L7 -12 L1 -5 L7 5 Q-7 0 -3 14 Q-13 7 -6 1 L-2 0 L-8 -10 L-1 -16 Z"/>`;
}

export function beamPairs(notes,yAt){
 const pairs=new Map();let tick=0;
 for(let i=0;i<notes.length;i++){
  const a=notes[i],b=notes[i+1];
  if(tick%2===0&&a.ticks===1&&b?.ticks===1&&a.pitch!==null&&b.pitch!==null){
   const y1=yAt(a.pitch),y2=yAt(b.pitch),down=(y1+y2)/2<=146;
   const start=down?Math.max(y1,y2)+42:Math.min(y1,y2)-42,slope=Math.max(-8,Math.min(8,(y2-y1)*.25));
   const pair={first:i,last:i+1,down,y1:start,y2:start+slope};pairs.set(i,pair);pairs.set(i+1,pair);
  }tick+=a.ticks;
 }return pairs;
}
