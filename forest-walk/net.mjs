// Classroom client: same-origin JSON + SSE over fetch (so the token travels in a header, never in the URL).
import {parseSSE,LIMITS} from './lib/protocol.mjs?v=forest-public-20261108';
export class Classroom extends EventTarget{
  constructor(base='api/'){super();this.base=base;this.token=null;this.id=null;this.role=null;this.code=null;this.start=null;this.mealSlot=-1;this.connected=false;this.abort=null;this.retry=0;this.lastSent=0;this.lastState='';this.closed=true;}
  emit(type,detail={}){this.dispatchEvent(new CustomEvent(type,{detail}));}
  async detect(){try{const r=await fetch(this.base+'health',{cache:'no-store'});if(!r.ok)return false;const body=await r.json();return body?.classroom===true;}catch{return false;}}
  async request(path,body,method='POST'){
    const headers={'content-type':'application/json'};if(this.token)headers.authorization='Bearer '+this.token;
    const r=await fetch(this.base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
    let data=null;try{data=await r.json();}catch{}
    if(!r.ok||!data?.ok)throw Object.assign(new Error(data?.error||'request-failed'),{status:r.status});
    return data;
  }
  async create(){const r=await this.request('rooms',{});this.adopt(r);return r;}
  async join(code,look){const r=await this.request('join',{code,look});this.adopt(r);return r;}
  // start = the server-assigned gate slot for this member (null on old servers → the gate itself).
  adopt(r){this.mealSlot=r.members.find(m=>m.id===r.id)?.mealSlot??-1;this.token=r.token;this.id=r.id;this.role=r.role;this.code=r.code;this.start=Number.isFinite(r.start?.x)&&Number.isFinite(r.start?.y)?{x:r.start.x,y:r.start.y}:null;this.closed=false;this.connect();}
  // Reads the event stream; on any drop it retries with backoff while the token is still valid.
  async connect(){
    if(this.closed||!this.token)return;
    this.abort?.abort();const controller=new AbortController();this.abort=controller;
    try{
      const r=await fetch(this.base+'events',{headers:{authorization:'Bearer '+this.token,accept:'text/event-stream'},signal:controller.signal,cache:'no-store'});
      if(r.status===401){this.closed=true;this.emit('status',{state:'closed',reason:'unauthorized'});return;}
      if(!r.ok||!r.body)throw new Error('stream-failed');
      const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='';
      for(;;){
        const {value,done}=await reader.read();if(done)break;
        buffer+=decoder.decode(value,{stream:true});
        const parsed=parseSSE(buffer);buffer=parsed.rest;
        for(const e of parsed.events){let data=null;try{data=JSON.parse(e.data);}catch{continue;}
          if(e.event==='hello'){this.connected=true;this.retry=0;this.emit('status',{state:'connected'});}
          if(e.event==='closed'){this.closed=true;this.connected=false;this.emit('status',{state:'closed',reason:data.reason});controller.abort();return;}
          if(e.event==='error'){this.closed=true;this.emit('status',{state:'closed',reason:data.error});return;}
          this.emit(e.event,data);
        }
      }
      throw new Error('stream-ended');
    }catch(e){
      if(controller.signal.aborted&&this.abort!==controller)return;
      if(this.closed)return;
      const wasConnected=this.connected;this.connected=false;
      if(wasConnected)this.emit('status',{state:'reconnecting'});
      const delay=Math.min(10000,1000*2**Math.min(this.retry++,4));
      setTimeout(()=>{if(!this.closed&&this.abort===controller)this.connect();},delay);
    }
  }
  // Throttled position updates; unchanged states are not resent.
  sendState(state,now=performance.now()){
    if(!this.connected||now-this.lastSent<1000/8)return false;
    const packed=JSON.stringify(state);if(packed===this.lastState)return false;
    this.lastSent=now;this.lastState=packed;
    this.request('state',state).catch(()=>{});return true;
  }
  wave(){return this.request('wave',{}).catch(()=>null);}
  gather(section){return this.request('gather',{section});}
  async leave(){this.closed=true;this.abort?.abort();const token=this.token;this.token=null;this.connected=false;if(token){try{await fetch(this.base+'leave',{method:'POST',headers:{authorization:'Bearer '+token}});}catch{}}this.emit('status',{state:'left'});}
  resume(){if(!this.closed&&this.token&&!this.connected){this.retry=0;this.connect();}}
}
export const ROOM_SIZE=LIMITS.roomSize;
