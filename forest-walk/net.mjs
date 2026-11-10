// Online rooms use WebSockets; the PC server retains SSE. Tokens never enter URLs.
import {parseSSE,LIMITS} from './lib/protocol.mjs?v=together-20261110';
export class Classroom extends EventTarget{
  constructor(base='api/'){super();this.base=base;this.token=null;this.id=null;this.role=null;this.code=null;this.start=null;this.mealSlot=-1;this.connected=false;this.abort=null;this.retry=0;this.lastSent=0;this.lastState='';this.stateFlight=null;this.closed=true;}
  emit(type,detail={}){this.dispatchEvent(new CustomEvent(type,{detail}));}
  async detect(){try{const r=await fetch(this.base+'health',{cache:'no-store'});if(!r.ok)return false;const body=await r.json();this.online=body.online===true;this.transport=body.transport;return body?.classroom===true;}catch{return false;}}
  async request(path,body,method='POST'){
    if(path==='state'&&this.transport==='websocket')return this.socketState(body);
    const headers={'content-type':'application/json'};if(this.token)headers.authorization='Bearer '+this.token;
    if(this.code)headers['X-Room-Code']=this.code;
    const r=await fetch(this.base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:path==='state'?AbortSignal.timeout(4000):undefined});
    let data=null;try{data=await r.json();}catch{}
    if(!r.ok||!data?.ok)throw Object.assign(new Error(data?.error||'request-failed'),{status:r.status});
    return data;
  }
  async create(look){const r=await this.request('rooms',{look});this.adopt(r);return r;}
  async join(code,look){const r=await this.request('join',{code,look});this.adopt(r);return r;}
  // start = the server-assigned gate slot for this member (null on old servers → the gate itself).
  adopt(r){this.mealSlot=r.members.find(m=>m.id===r.id)?.mealSlot??-1;this.token=r.token;this.id=r.id;this.role=r.role;this.code=r.code;this.start=Number.isFinite(r.start?.x)&&Number.isFinite(r.start?.y)?{x:r.start.x,y:r.start.y}:null;this.closed=false;this.connect();}
  // Reads the event stream; on any drop it retries with backoff while the token is still valid.
  async connect(){
    if(this.closed||!this.token)return;
    if(this.transport==='websocket')return this.connectSocket();
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
  connectSocket(){
    const previous=this.socket;this.socket=null;previous?.close();
    const url=new URL(this.base+'ws',location.href);url.protocol=url.protocol==='https:'?'wss:':'ws:';url.searchParams.set('code',this.code);
    const socket=new WebSocket(url);this.socket=socket;const pending=new Map();let serial=0,lastHeard=Date.now();this.lastState='';
    this.socketState=state=>new Promise((resolve,reject)=>{if(socket.readyState!==WebSocket.OPEN)return reject(Error('disconnected'));const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('state-timeout'));},4000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({type:'state',id,state}));});
    socket.onopen=()=>{if(this.socket===socket)socket.send(JSON.stringify({type:'auth',token:this.token}));};
    socket.onmessage=e=>{if(this.socket!==socket)return;lastHeard=Date.now();let message;try{message=JSON.parse(e.data);}catch{return;}
      if(message.ack){const p=pending.get(message.ack);if(p){clearTimeout(p.timer);pending.delete(message.ack);message.ok?p.resolve(message):p.reject(Error(message.error));}return;}
      const {event,data}=message;if(event==='hello'){this.connected=true;this.retry=0;this.emit('status',{state:'connected'});}
      if(event==='closed'||event==='error'){this.closed=true;this.connected=false;this.emit('status',{state:'closed',reason:data?.reason||data?.error});socket.close();}
      if(event&&event!=='pong')this.emit(event,data);
    };
    const beat=setInterval(()=>{if(Date.now()-lastHeard>45000){socket.close();return;}if(socket.readyState===WebSocket.OPEN&&this.connected)socket.send(JSON.stringify({type:'ping'}));},20000);
    socket.onclose=()=>{clearInterval(beat);for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('disconnected'));}pending.clear();if(this.socket!==socket)return;this.socket=null;this.connected=false;if(this.closed)return;this.emit('status',{state:'reconnecting'});const delay=Math.min(10000,1000*2**Math.min(this.retry++,4));setTimeout(()=>{if(!this.closed&&!this.socket)this.connect();},delay);};
  }
  // Throttled position updates; unchanged states are not resent.
  canSendState(now){return this.connected&&!this.stateFlight&&now-this.lastSent>=1000/8;}
  sendState(state,now=performance.now()){
    if(!this.canSendState(now))return false;
    this.lastSent=now;
    const packed=JSON.stringify(state);if(packed===this.lastState)return false;
    const token=this.token,flight=this.request('state',state);this.stateFlight=flight;
    flight.then(()=>{if(this.token===token)this.lastState=packed;}).catch(()=>{}).finally(()=>{if(this.stateFlight===flight)this.stateFlight=null;});return true;
  }
  changeLook(look){return this.request('look',{look});}
  wave(){return this.request('wave',{}).catch(()=>null);}
  activity(kind){return this.request('activity',{kind});}
  gather(section){return this.request('gather',{section});}
  async leave(){this.closed=true;this.abort?.abort();this.socket?.close();const token=this.token;this.token=null;this.connected=false;if(token){try{await fetch(this.base+'leave',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json','X-Room-Code':this.code||''},body:'{}',signal:AbortSignal.timeout(4000)});}catch{}}this.id=null;this.role=null;this.code=null;this.start=null;this.mealSlot=-1;this.lastSent=0;this.lastState='';this.stateFlight=null;this.emit('status',{state:'left'});}
  resume(){if(!this.closed&&this.token&&!this.connected){this.retry=0;this.connect();}}
}
export const ROOM_SIZE=LIMITS.roomSize;
