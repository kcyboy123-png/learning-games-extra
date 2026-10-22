// A deliberately simplified learning reconstruction; no astronomical time is calculated.
export function createObservatoryEvent({THREE,scene,world,camera,getPosition,canAct,go,stop,onComplete}){
 const sun=world.inspectables.find(p=>p.id==='sundial'),water=world.inspectables.find(p=>p.id==='waterclock');
 const group=new THREE.Group();group.name='observatory-event';scene.add(group);group.visible=false;
 const material=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1});
 const add=(geometry,mat,x,y,z)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;};
 const shadowMat=material(0x302e35,.85),points=[];
 for(let i=0;i<=16;i++){const x=i*.028;points.push(new THREE.Vector3(sun.x+x,1.45-Math.sqrt(.65*.65-x*x)+.025,sun.z+.05));}
 const shadow=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),16,.025,6,false),shadowMat,0,0,0);
 const shadeCanvas=document.createElement('canvas');shadeCanvas.width=shadeCanvas.height=128;const shadeContext=shadeCanvas.getContext('2d'),gradient=shadeContext.createRadialGradient(64,64,8,64,64,64);
 gradient.addColorStop(0,'rgba(255,255,255,.8)');gradient.addColorStop(.45,'rgba(255,255,255,.5)');gradient.addColorStop(.8,'rgba(255,255,255,.15)');gradient.addColorStop(1,'rgba(255,255,255,0)');shadeContext.fillStyle=gradient;shadeContext.fillRect(0,0,128,128);
 const shadeMat=material(0x343e5b,0);shadeMat.map=new THREE.CanvasTexture(shadeCanvas);const shade=add(new THREE.CircleGeometry(6.5,48),shadeMat,8,.09,-.5);shade.rotation.x=-Math.PI/2;shade.scale.set(1,.7,1);
 const cloud=new THREE.Group();group.add(cloud);const cloudMat=new THREE.MeshStandardMaterial({color:0xc4cdd4,roughness:1});
 for(const [x,y,z,s] of [[-1,0,0,1.2],[0,.35,0,1.5],[1.3,.05,.1,1.1],[.3,0,.8,1]]){const puff=new THREE.Mesh(new THREE.SphereGeometry(s,16,10),cloudMat);puff.position.set(x,y,z);puff.scale.y=.5;cloud.add(puff);}
 // Visible cutaway marks overlay the existing receiving vessel, preserving its detailed body.
 const liquid=add(new THREE.CylinderGeometry(.2,.2,1,16),material(0x63d7ed,.8),water.x+.9,.9,water.z+.46);
 const float=add(new THREE.CylinderGeometry(.23,.23,.06,16),material(0xffe4a0),water.x+.9,1.3,water.z+.46);
 const stream=add(new THREE.CylinderGeometry(.035,.035,.5,8),material(0x84e5ff,.9),water.x+.9,1.35,water.z+.46);
 const signal=add(new THREE.TorusGeometry(.38,.035,8,32),material(0xffd66e,.9),water.x-.4,3.2,water.z-.5);
 const panel=document.createElement('section');panel.className='event-panel event-ui';panel.id='observatory-event-panel';panel.hidden=true;panel.setAttribute('aria-label','구름이 가린 관측 마당');
 panel.innerHTML='<strong>구름이 가린 관측 마당</strong><p aria-live="polite"></p><small>원리를 살펴보는 학습용 재구성</small><button type="button" class="event-guide">도구 가까이 걸어가기</button><button type="button" class="event-continue" hidden>관측 기록으로 이어가기</button><button type="button" class="event-cancel">나중에 이어 하기</button>';
 document.body.append(panel);const description=panel.querySelector('p'),next=panel.querySelector('.event-continue');
 const label=document.createElement('button');label.className='world-clue event-ui';label.hidden=true;label.style.minHeight='44px';label.style.minWidth='44px';document.body.append(label);
 for(const button of panel.querySelectorAll('button'))button.style.minHeight='44px';
 let phase='sunny',active=false,complete=false,cloudProgress=0,elapsed=0,observed=0,walking=false;
 const target=()=>phase==='water'||phase==='flow'||phase==='summary'?water:sun;
 const near=()=>active&&Math.hypot(getPosition().x-target().stand.x,getPosition().z-target().stand.z)<1.3;
 const text={sunny:'① 해시계로 다가가 영침의 그림자를 살펴봐요. 맑은 날에는 해 그림자로 시각을 알 수 있어요.',cloud:'구름이 관측 마당 위로 흘러와요. 해시계의 그림자가 어떻게 달라질까요?',cloudy:'② 같은 해시계를 다시 살펴봐요. 햇빛이 가려진 지금도 그림자를 읽을 수 있을까요?',water:'③ 자격루로 다가가 물의 흐름과 떠오르는 부표를 살펴봐요.',flow:'구름 아래에서도 물이 흐르고 부표가 올라가요. 시각을 알리는 장치의 신호를 기다려 봐요.',summary:'맑을 때는 해시계의 그림자로, 햇빛이 가려져도 물시계의 물 흐름으로 시각을 알 수 있어요. 실제 자격루는 물과 부표, 자동 시보 장치를 이용했어요.'};
 const actionText=()=>phase==='sunny'?'해시계 살펴보기':phase==='cloudy'?'흐린 해시계 다시 살펴보기':phase==='water'?'물시계 살펴보기':phase==='summary'?'관측 기록으로 이어가기':'';
 function refresh(){description.textContent=text[phase];panel.dataset.phase=phase;next.hidden=phase!=='summary';panel.querySelector('.event-guide').hidden=!['sunny','cloudy','water'].includes(phase);label.textContent=actionText()+' · E';}
 function hide(){panel.hidden=true;label.hidden=true;}
 function interact(){if(!active||!canAct()||!near())return false;
  if(phase==='sunny'){phase='cloud';cloudProgress=0;}else if(phase==='cloudy')phase='water';else if(phase==='water'){phase='flow';observed=0;}else if(phase==='summary'){finish();return true;}else return false;
  walking=false;stop();refresh();return true;
 }
 function request(){if(!active||!canAct()||!actionText())return;if(near()){interact();return;}walking=go(target().stand);}
 function finish(){if(!active||complete||!canAct()||phase!=='summary')return;complete=true;active=false;walking=false;stop();hide();group.visible=false;onComplete();}
 next.onclick=finish;label.onclick=request;panel.querySelector('.event-guide').onclick=request;
 panel.querySelector('.event-cancel').onclick=()=>{if(!canAct())return;active=false;walking=false;stop();hide();group.visible=false;};
 function start(){if(complete)return false;active=true;walking=false;stop();refresh();return true;}
 function hit(ray){if(!active||!canAct()||!actionText())return false;const p=target(),box=new THREE.Box3(new THREE.Vector3(p.x-(p===sun ? .8 : 1.5),.1,p.z-.8),new THREE.Vector3(p.x+(p===sun ? .8 : 1.5),p===sun?1.9:3.6,p.z+.8));if(!ray.ray.intersectsBox(box))return false;request();return true;}
 function update(dt,enabled,reduced){const visible=active&&enabled;panel.hidden=!visible;group.visible=active;label.disabled=!visible;for(const button of panel.querySelectorAll('button'))button.disabled=!visible;if(!visible){label.hidden=true;return;}
  elapsed+=dt;if(walking&&near()){walking=false;interact();if(!active)return;}
  if(phase==='cloud'){cloudProgress=reduced?1:Math.min(1,cloudProgress+dt/3.5);if(cloudProgress===1){phase='cloudy';refresh();}}
  if(phase==='flow'){observed+=dt;if(reduced||observed>=4){phase='summary';refresh();}}
  const cloudy=phase!=='sunny';cloud.visible=cloudy;cloud.position.set(2+cloudProgress*6,5.6,-.8);shadeMat.opacity=.24*cloudProgress;shadowMat.opacity=.85*(1-cloudProgress);
  const rise=reduced?.75:(elapsed*.16)%1;liquid.scale.y=.15+rise*.55;liquid.position.y=.65+liquid.scale.y/2;float.position.y=.67+liquid.scale.y;stream.scale.y=reduced?1:.8+Math.sin(elapsed*8)*.2;
  signal.visible=phase==='summary'||phase==='flow'&&observed>2.8;signal.scale.setScalar(reduced?1:1+Math.sin(elapsed*5)*.18);
  const p=target(),v=new THREE.Vector3(p.x,p===sun?2.8:4.6,p.z).project(camera);label.hidden=!actionText()||v.z>1||Math.abs(v.x)>.95||Math.abs(v.y)>.8;
  label.style.left=Math.max(125,Math.min(innerWidth-125,(v.x*.5+.5)*innerWidth))+'px';const panelBottom=innerWidth<600?(panel.getBoundingClientRect?.().bottom||330)+56:125;label.style.top=Math.max(panelBottom,Math.min(innerHeight-200,(-v.y*.5+.5)*innerHeight))+'px';
 }
 refresh();return {start,interact,hit,guide:request,near,update,active:()=>active,completed:()=>complete,cancelPending(){walking=false;},state:()=>({phase,active,complete,cloudProgress,observed}),actionText};
}
