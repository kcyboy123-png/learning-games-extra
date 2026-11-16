import {enableCozy,parseSave,serialize} from './core.mjs?v=perf1';
import {switchIsland} from './islands.mjs';
import {developedVillage} from './qa-developed.mjs';
const frame=document.querySelector('iframe'),report=document.querySelector('#report'),history=document.querySelector('#history');
const KEY='qa-islands-town',OWNER='qa-islands-owner';let mounting=0,currentLabel='';
const fixture=enableCozy(developedVillage());fixture.pop=120;fixture.populationPeak=120;fixture.money=600000;fixture.t=6000;
fixture.buildings=fixture.buildings.filter(b=>!(b.x>=9&&b.x<=10&&b.y>=1&&b.y<=2));
fixture.buildings.push({id:fixture.nextId++,type:'harbor',x:9,y:1,progress:1,opts:[],starter:false,paidCost:90000,completedAt:0});
parseSave(serialize(fixture));
async function mount(kind){
 const ticket=++mounting,isBaseline=kind==='baseline',base=new URL(isBaseline?'../baseline/':'./',location.href),s=structuredClone(fixture);
 if(kind==='locked'){const port=s.buildings.find(b=>b.type==='harbor');port.progress=.1;delete port.completedAt;}if(kind.startsWith('mist'))switchIsland(s);parseSave(serialize(s));
 const source=await(await fetch(new URL('index.html',base))).text();
 const appPath=source.match(/<script type="module" src="([^"]*app\.mjs[^\"]*)"><\/script>/)?.[1];if(!appPath)throw Error('QA app entry missing');
 const appURL=new URL(appPath,base).href,app=await(await fetch(appURL)).text(),worldPath=app.match(/import \{World\} from '([^']+)'/)?.[1];if(!worldPath)throw Error('QA world import missing');
 if(ticket!==mounting)return;currentLabel=isBaseline?'기존 배포본':kind.startsWith('mist')?'새 섬'+(kind.endsWith('Before')?' 개선 전':' 개선 후'):'기존 마을'+(kind.endsWith('Before')?' 개선 전':' 개선 후');report.textContent=currentLabel+' 로딩 · 입장 후 측정하세요';
 const storageScript=`const data=new Map([[${JSON.stringify(KEY)},${JSON.stringify(serialize(s))}]]);const storage={getItem:k=>data.get(String(k))??null,setItem:(k,v)=>data.set(String(k),String(v)),removeItem:k=>data.delete(String(k)),clear:()=>data.clear(),key:i=>[...data.keys()][i]??null,get length(){return data.size;}};Object.defineProperty(window,'localStorage',{value:storage});`;
 const map={imports:{[new URL('./app-keys.mjs?v=perf1',base).href]:'data:text/javascript,'+encodeURIComponent(`export const KEY='${KEY}',BACKUP='qa-islands-backup',OWNER='${OWNER}',A_KEY='qa-islands-a';`)}};
 for(const name of ['core','data','expansion-models','economy-ui'])map.imports[new URL('./'+name+'.mjs?v=perf1',base).href]=new URL('./'+name+'.mjs?v=acorn2',base).href;
 if(kind.endsWith('Before'))map.imports[new URL('./island-scenery.mjs?v=acorn2',base).href]=new URL('./qa-scenery-before.mjs',base).href;
 // Instrument completed child World.frame calls, not the outer page's animation clock.
 const bootstrap=`import {World} from ${JSON.stringify(new URL(worldPath,base).href)};
 const original=World.prototype.frame;let sample=null;
 World.prototype.frame=function(...args){const start=performance.now();const result=original.apply(this,args);const finish=performance.now();if(sample){const gap=start-sample.last;sample.last=start;if(gap>0)sample.gaps.push(gap);sample.work.push(finish-start);sample.calls.push(this.renderer.info.render.calls);sample.triangles.push(this.renderer.info.render.triangles);if(finish-sample.start>=10000){const q=(xs,p)=>{const a=[...xs].sort((a,b)=>a-b);return Number(a[Math.min(a.length-1,Math.floor(a.length*p))].toFixed(2));};const elapsed=finish-sample.start;const result={label:${JSON.stringify(currentLabel)},durationMs:Math.round(elapsed),frames:sample.gaps.length,fps:Number((sample.gaps.length*1000/elapsed).toFixed(2)),frameMedianMs:q(sample.gaps,.5),frameP95Ms:q(sample.gaps,.95),renderCpuMedianMs:q(sample.work,.5),renderCpuP95Ms:q(sample.work,.95),drawCallsMedian:q(sample.calls,.5),drawCallsMax:Math.max(...sample.calls),trianglesMax:Math.max(...sample.triangles),viewport:[innerWidth,innerHeight],pixelRatio:this.renderer.getPixelRatio(),geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures,visibility:document.visibilityState};const resolve=sample.resolve;clearTimeout(sample.timeout);sample=null;window.__qaLastResult=result;resolve(result);}}return result;};
 window.__qaMeasure=()=>{if(sample)return Promise.reject(Error('이미 측정 중이에요.'));if(document.hidden)return Promise.reject(Error('이 시험 탭을 보이게 한 뒤 측정해 주세요.'));if(document.querySelector('#entranceDialog[open]'))return Promise.reject(Error('먼저 마을 입장 후 오프닝을 마쳐 주세요.'));const w=window.__world;if(!w)return Promise.reject(Error('아직 준비 중이에요.'));if(window.__vn.state.paused)document.querySelector('#resume').click();w.followPlayer=false;w.player.route=[];w.angle=.65;w.cameraHeight=36;w.lookHeight=.2;w.zoom=w.targetZoom=window.__vn.state.island==='mist'?.32:.25;w.center.set(window.__vn.state.island==='mist'?0:8,0,window.__vn.state.island==='mist'?0:-12);return new Promise((resolve,reject)=>{const start=performance.now();sample={start,last:start,gaps:[],work:[],calls:[],triangles:[],resolve,timeout:setTimeout(()=>{sample=null;reject(Error('20초 동안 프레임 측정을 완료하지 못했어요. 탭 표시 상태를 확인하세요.'));},20000)};});};
 await import(${JSON.stringify(appURL)});`;
 frame.srcdoc=source.replace(/<script type="importmap">[\s\S]*?<\/script>/g,'').replace('<meta charset="utf-8">',`<meta charset="utf-8"><base href="${base.href}"><script>${storageScript}<\/script><script type="importmap">${JSON.stringify(map)}<\/script>`).replace(/<script type="module" src="[^\"]*app\.mjs[^\"]*"><\/script>/,`<script type="module">${bootstrap}<\/script>`);
}
for(const kind of ['baseline','main','mist','locked','mainBefore','mistBefore'])document.querySelector('#'+kind).onclick=()=>mount(kind).catch(e=>report.textContent=e.message);
document.querySelector('#performance').onclick=async()=>{try{report.textContent=currentLabel+' · 실제 게임 프레임 10초 측정 중';const result=await frame.contentWindow.__qaMeasure();report.textContent=`${result.label}: ${result.fps} FPS · p95 ${result.frameP95Ms}ms · ${result.drawCallsMedian} calls`;history.textContent+=JSON.stringify(result)+'\n';}catch(e){report.textContent=e.message;}};
mount('main').catch(e=>report.textContent=e.message);

for(const [id,width,height]of [['phoneSize',390,744],['tabletSize',1024,648],['desktopSize',1265,600]])document.getElementById(id).onclick=()=>{frame.style.width=width+'px';frame.style.height=height+'px';};

document.querySelector('#finishHarbor').onclick=()=>{const s=frame.contentWindow.__vn?.state;const p=s?.buildings.find(b=>b.type==='harbor');if(p){p.progress=.9999;s.paused=false;}};

document.querySelector('#wholeMap').onclick=()=>frame.contentDocument.querySelector('#overview').click();
const compareButton=document.createElement('button');compareButton.id='compareScenery';compareButton.textContent='원경·섬 전후 성능 비교';document.querySelector('nav').append(compareButton);
compareButton.onclick=async()=>{compareButton.disabled=true;try{for(const kind of ['mainBefore','main','mistBefore','mist']){const ready=new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));await mount(kind);await ready;for(let i=0;i<100&&!frame.contentDocument.querySelector('#entranceDialog[open] #enterVillage')?.onclick;i++)await new Promise(resolve=>setTimeout(resolve,50));frame.contentDocument.querySelector('#enterVillage').click();frame.contentDocument.querySelector('#skipEntrance').click();await new Promise(resolve=>setTimeout(resolve,1000));report.textContent=currentLabel+' 측정 중';const r=await frame.contentWindow.__qaMeasure();history.textContent+=JSON.stringify(r)+'\n';}report.textContent='원경·섬 전후 4개 측정 완료';}catch(e){report.textContent=e.message;}finally{compareButton.disabled=false;}};
