import {ContentLoader} from './core__content-loader.js?v=715810e652df';
import {SaveStore,freshSave} from './core__save-store.js?v=715810e652df';
import {AudioManager} from './core__audio.js?v=715810e652df';
import {GameSession} from './core__session.js?v=715810e652df';
import {InputController} from './core__input.js?v=715810e652df';
import {GameUI} from './core__ui.js?v=715810e652df';
import {POSTERS,posterApproach} from './content__district_01__posters.js?v=715810e652df';
import {TutorialUI} from './core__tutorial-ui.js?v=715810e652df';
import {showChapters} from './core__chapters.js?v=715810e652df';
import {setUIButton} from './core__ui-kit.js?v=715810e652df';

const canvas=document.getElementById('game'),ctx=canvas.getContext('2d',{alpha:false});
const loader=new ContentLoader(),store=new SaveStore(),audio=new AudioManager();
let session=null,renderer=null,starting=false,loadedPack=null,tutorialUI=null;
const ui=new GameUI({
  start,leave,action,upgrade:()=>session?.upgrade(),
  home:()=>{if(session){const h=(session.world.hideouts??[session.world.hideout]).reduce((a,b)=>Math.hypot(a.x-session.player.x,a.y-session.player.y)<Math.hypot(b.x-session.player.x,b.y-session.player.y)?a:b);session.routeTo(h,h.name);}},
  route:id=>{
    if(session.mode==='hideout')leave();
    if(id==='home')session.routeTo(session.world.hideout,'Убежище / сохранить');
    else if(id==='court')session.routeTo(session.court,'Баскетбол · Не просто мяч');
    else if(id.startsWith('poster_')){const p=POSTERS.find(p=>'poster_'+p.id===id);if(p)session.routeTo(posterApproach(session.world,p),'Плакат '+p.brand+' × ZAK MINI MONSTER');}
    else{
      const destination=session.world.mapRoutes?.find(p=>p.id===id);if(destination){session.routeTo(destination,destination.name);ui.sync();return;}
      const poi=session.world.pointsOfInterest?.find(p=>p.id===id);if(poi){session.routeTo(poi,poi.name);ui.sync();return;}
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
  zoom:factor=>{if(session?.mode==='district'&&!ui.mapOpen){session.camera.zoomFactor=Math.max(.65,Math.min(1.8,(session.camera.zoomFactor??1)*factor));session.player.path=[];}},
  action,map:()=>ui.toggleMap(),back:()=>{
    if(session?.mode==='phone')ui.phoneUI.close();else if(session?.mode==='poi')ui.closePoi();else if(session?.mode==='poster')ui.closePoster();else if(ui.mapOpen)ui.toggleMap(false);else if(session?.mode==='graffiti')session.cancelGraffiti();
    else if(['court-dialogue','ball-art','ball-result'].includes(session?.mode)){session.cancelCourt();ui.sync();}
    else if(session?.mode==='hideout')ui.hideoutUI.open('home');
  },
  debug:()=>{ui.debug=!ui.debug;ui.sync();},
  destination:(x,y)=>{
    if(session?.mode!=='district'||ui.mapOpen||session.hiddenFor>0||document.getElementById('chapter-select'))return;
    session.routeTo(session.camera.screenToWorld(x,y,canvas.width,canvas.height),'Точка на улице');
  }
});
async function start(choice,newRun=false){
  if(starting)return;starting=true;ui.loading(0);
  document.getElementById('new-game-button').disabled=true;
  try{
    const previousSave=store.load(),saved=newRun?freshSave():previousSave;if(newRun)saved.settings=previousSave.settings;
    const wanted=['tutorial','sneak','sandbox'].includes(choice)?choice:saved.campaign.activeLevel;
    const level=wanted==='sandbox'?'sandbox':wanted==='sneak'&&saved.campaign.tutorialComplete?'sneak':'tutorial';
    loadedPack=await loader.loadLevel(level,p=>ui.loading(p));
    if(choice==='tutorial'){saved.campaign.tutorialCheckpoint='home';saved.campaign.tutorialAtHome=false;store.write(saved);}
    saved.campaign.activeLevel=level;saved.campaign.started=true;if(newRun&&level==='sandbox')saved.campaign.homeIntroStep=7;store.write(saved);
    const pack=loadedPack;
    session=new GameSession(pack,store);renderer=pack.createRenderer(pack);
    audio.enabled=session.save.settings.sound;audio.radio.setVolume(session.save.settings.radioVolume);ui.bind(session,renderer,audio);
    tutorialUI=new TutorialUI(session,openChapters);
    document.getElementById('chapter-button').hidden=false;
    tutorialUI?.sync();
    if(store.warning)ui.showToast(store.warning);
  }catch(error){console.error(error);ui.loading(0,'Ошибка загрузки: '+error.message);}
  finally{starting=false;document.getElementById('new-game-button').disabled=false;}
}
function newGameMenu(){
  if(starting)return;document.getElementById('new-game-warning').hidden=!store.hasSave();
  document.getElementById('new-game-dialog').hidden=false;document.getElementById('new-game-training').focus({preventScroll:true});
}
function leave(){if(!session)return;input.reset();session.enterDistrict();ui.sync();}
function action(){
  if(!document.getElementById('new-game-dialog').hidden)return;
  if(session?.cinematic)return;
  if(document.getElementById('chapter-select'))return;
  if(session?.mode==='phone')return;
  if(!session){if(store.hasSave())start();else newGameMenu();return;}
  if(ui.mapOpen)return;
  if(session.tutorial?.stage==='home'){session.tutorial.act();ui.sync();tutorialUI.sync();return;}
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
    if(!ui.mapOpen&&!document.getElementById('chapter-select'))session.update(dt,input.movement());
    else if(session.mode==='district')session.traffic.update(dt,session.life.night);
    if(session.mode==='hideout')renderer.hideout(ctx,session,canvas.width,canvas.height);
    else{
      session.camera.follow(session.player,dt,canvas.width);
      renderer.world(ctx,session,canvas.width,canvas.height);
      tutorialUI?.updateWorldMarkers(renderer);
      ui.updatePosterLinks();
    }
    if(session.mode==='graffiti')ui.graffitiView.draw(dt);
    ui.phoneUI?.update(dt);
    uiElapsed+=dt;if(uiElapsed>.1||session.events.length){ui.sync();tutorialUI?.sync();if(ui.mapOpen)ui.drawMap();uiElapsed=0;}
    frames++;elapsed+=rawDt;
    if(elapsed>=1){
      session.metrics.fps=Math.round(frames/elapsed);frames=0;elapsed=0;
      session.metrics.memory=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576)+' MB':'н/д';
    }
    session.metrics.frame=Math.round((performance.now()-begin)*10)/10;
  }
  requestAnimationFrame(frame);
}
async function openChapters(){
  if(starting)return;
  try{
    const tab=document.getElementById('chapter-button').dataset.tab??'path';delete document.getElementById('chapter-button').dataset.tab;
    showChapters(session?.save??store.load(),id=>{
      if(session){sessionStorage.setItem('zack.chapter',id);location.reload();}
      else start(id);
    },tab);
  }catch(error){ui.showToast('Не удалось загрузить уровни: '+error.message);}
}
document.getElementById('title-chapters').onclick=openChapters;
document.getElementById('new-game-button').onclick=newGameMenu;
document.getElementById('new-game-cancel').onclick=()=>{document.getElementById('new-game-dialog').hidden=true;document.getElementById('new-game-button').focus({preventScroll:true});};
for(const [id,level] of [['new-game-training','tutorial'],['new-game-sandbox','sandbox']])document.getElementById(id).onclick=()=>{document.getElementById('new-game-dialog').hidden=true;start(level,true);};
document.getElementById('start-button').disabled=!store.hasSave();
document.getElementById('load-status').textContent=store.hasSave()?'Последнее сохранение готово к продолжению':'Выбери «Новая игра», чтобы начать';
window.addEventListener('pagehide',()=>session?.persist());
document.addEventListener('visibilitychange',()=>{if(document.hidden)session?.persist();});
document.getElementById('chapter-button').onclick=openChapters;
const pickedChapter=sessionStorage.getItem('zack.chapter');
if(pickedChapter){sessionStorage.removeItem('zack.chapter');start(pickedChapter);}
else setUIButton(document.getElementById('start-button'),'ПРОДОЛЖИТЬ');
requestAnimationFrame(frame);
