import {ContentLoader} from './core__content-loader.js';
import {SaveStore} from './core__save-store.js';
import {AudioManager} from './core__audio.js';
import {GameSession} from './core__session.js';
import {InputController} from './core__input.js';
import {GameUI} from './core__ui.js';
import {POSTERS,posterApproach} from './content__district_01__posters.js';

const canvas=document.getElementById('game'),ctx=canvas.getContext('2d',{alpha:false});
const loader=new ContentLoader(),store=new SaveStore(),audio=new AudioManager();
let session=null,renderer=null,starting=false;
const ui=new GameUI({
  start,leave,action,upgrade:()=>session?.upgrade(),
  home:()=>{if(session){const h=(session.world.hideouts??[session.world.hideout]).reduce((a,b)=>Math.hypot(a.x-session.player.x,a.y-session.player.y)<Math.hypot(b.x-session.player.x,b.y-session.player.y)?a:b);session.routeTo(h,h.name);}},
  route:id=>{
    if(session.mode==='hideout')leave();
    if(id==='home')session.routeTo(session.world.hideout,'Убежище / сохранить');
    else if(id==='court')session.routeTo(session.court,'Баскетбол · Не просто мяч');
    else if(id.startsWith('poster_')){const p=POSTERS.find(p=>'poster_'+p.id===id);if(p)session.routeTo(posterApproach(session.world,p),'Плакат '+p.brand+' × ZAK MINI MONSTER');}
    else{
      const bridge=session.world.bridges?.find(b=>b.id===id),home=session.world.hideouts?.find(h=>h.id===id);
      if(bridge){session.routeTo(bridge.approach,bridge.name);ui.sync();return;}
      if(home){session.routeTo(home,home.name);ui.sync();return;}
      const target=session.world.targets.find(t=>t.wall_id===id);
      const safe=session.world.safeSpots.find(t=>t.id===id);
      if(target)session.routeTo(target.approach,target.name);else if(safe)session.routeTo(safe,safe.name);
    }ui.sync();
  },
  sound:()=>{
    if(!session)return;session.save.settings.sound=!session.save.settings.sound;
    audio.enabled=session.save.settings.sound;session.persist();ui.sync();
  },
  cancel:()=>session?.cancelGraffiti(),
  confirm:()=>{if(session?.graffiti?.done)session.completeGraffiti();else session?.graffiti?.confirm();ui.sync();}
});
const input=new InputController(canvas,{
  action,map:()=>ui.toggleMap(),back:()=>{
    if(session?.mode==='poster')ui.closePoster();else if(ui.mapOpen)ui.toggleMap(false);else if(session?.mode==='graffiti')session.cancelGraffiti();
    else if(['court-dialogue','ball-art','ball-result'].includes(session?.mode)){session.cancelCourt();ui.sync();}
    else if(session?.mode==='hideout')ui.hideoutUI.open('home');
  },
  debug:()=>{ui.debug=!ui.debug;ui.sync();},
  destination:(x,y)=>{
    if(session?.mode!=='district'||ui.mapOpen||session.hiddenFor>0)return;
    session.routeTo(session.camera.screenToWorld(x,y,canvas.width,canvas.height),'Точка на улице');
  }
});
async function start(){
  if(starting)return;starting=true;ui.loading(0);
  try{
    const pack=await loader.loadDistrict('district_01',p=>ui.loading(p));
    session=new GameSession(pack,store);renderer=pack.createRenderer(pack);
    audio.enabled=session.save.settings.sound;audio.radio.setVolume(session.save.settings.radioVolume);ui.bind(session,renderer,audio);
    if(store.warning)ui.showToast(store.warning);
  }catch(error){console.error(error);ui.loading(0,'Ошибка загрузки: '+error.message);}
  finally{starting=false;}
}
function leave(){if(!session)return;input.reset();session.enterDistrict();ui.sync();}
function action(){
  if(!session){start();return;}
  if(ui.mapOpen)return;
  if(session.mode==='hideout')leave();
  else if(session.mode==='court-dialogue')session.advanceCourt();
  else if(['ball-art','ball-result'].includes(session.mode))session.finishBall();
  else if(session.mode==='graffiti')session.graffiti.confirm();
  else session.interact();
  input.reset();ui.sync();
}
function resize(){
  const rect=canvas.getBoundingClientRect(),scale=Math.min(1,1600/rect.width,1000/rect.height);
  canvas.width=Math.max(1,Math.round(rect.width*scale));canvas.height=Math.max(1,Math.round(rect.height*scale));
  if(ui.mapOpen)ui.drawMap();
}
window.addEventListener('resize',resize);resize();
let previous=performance.now(),frames=0,elapsed=0,uiElapsed=0;
function frame(now){
  const rawDt=(now-previous)/1000,dt=Math.min(.05,rawDt);previous=now;
  const begin=performance.now();
  if(session){
    session.room.beat=audio.radio.audible;
    if(!ui.mapOpen)session.update(dt,input.movement());
    else if(session.mode==='district')session.traffic.update(dt);
    if(session.mode==='hideout')renderer.hideout(ctx,session,canvas.width,canvas.height);
    else{
      session.camera.follow(session.player,dt,canvas.width);
      renderer.world(ctx,session,canvas.width,canvas.height);
      ui.updatePosterLinks();
    }
    if(session.mode==='graffiti')ui.graffitiView.draw(dt);
    uiElapsed+=dt;if(uiElapsed>.1||session.events.length){ui.sync();if(ui.mapOpen)ui.drawMap();uiElapsed=0;}
    frames++;elapsed+=rawDt;
    if(elapsed>=1){
      session.metrics.fps=Math.round(frames/elapsed);frames=0;elapsed=0;
      session.metrics.memory=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576)+' MB':'н/д';
    }
    session.metrics.frame=Math.round((performance.now()-begin)*10)/10;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
