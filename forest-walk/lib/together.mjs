// Shared positions and teacher invitations; no personal activity progress travels here.
export const ACTIVITIES={picnic:{s:362,label:'함께 김밥 먹기'},noodle:{s:712,label:'함께 컵라면 먹기'},photo:{s:712,label:'단체사진 찍기'}};
export const atActivity=(y,kind)=>Number.isFinite(y)&&!!ACTIVITIES[kind]&&Math.abs(y-ACTIVITIES[kind].s)<=12;
export function photoSlot(slot){if(slot<0)return {x:0,s:708.5};const i=slot;return {x:(i%7-3)*.95,s:710+Math.floor(i/7)*1.25};}
export function sharedTable(group){return {x:group<0?0:(group%2?2.1:-2.1),z:group<0?3.5:-Math.floor(group/2)*4.3};}
