let context;
// Share the device setup; music and effects keep their separate gain paths.
export function audioContext(){if(!context||context.state==='closed')context=new AudioContext();return context;}
export function prepareAudio(){try{audioContext();}catch{}}
