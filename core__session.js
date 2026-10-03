import {NavigationGrid} from './core__navigation.js?v=0b8195c8da56';
import {PoliceSystem} from './core__police.js?v=0b8195c8da56';
import {GraffitiGame} from './core__graffiti.js?v=0b8195c8da56';
import {Camera,clamp,distance,moveAlongPath,project} from './core__geometry.js?v=0b8195c8da56';
import {EffectPool} from './core__effects.js?v=0b8195c8da56';
import {OUTFITS,INKS,TROPHIES} from './core__hideout.js?v=0b8195c8da56';
import {TrafficSystem} from './core__traffic.js?v=0b8195c8da56';
import {CitizenSystem} from './core__citizens.js?v=0b8195c8da56';
import {COURT,COURT_LINES,BallArtGame} from './core__basketball.js?v=0b8195c8da56';
import {GRAFFITI_CONFIG} from './content__graffiti__config.js?v=0b8195c8da56';
import {cityProgress,canEnter,regionAt,gateMessage} from './core__city-progress.js?v=0b8195c8da56';
import {POSTERS,posterApproach} from './content__district_01__posters.js?v=0b8195c8da56';
import {BridgeGangs} from './core__bridge-gangs.js?v=0b8195c8da56';
import {TutorialFlow} from './core__tutorial.js?v=0b8195c8da56';
import {StreetLife} from './core__street-life.js?v=0b8195c8da56';
import {SneakFlow} from './core__sneak.js?v=0b8195c8da56';
import {SandboxFlow} from './core__sandbox.js?v=0b8195c8da56';
import {talkToStreetNpc} from './core__street-npcs.js?v=0b8195c8da56';

export class GameSession{
  constructor(pack,store){
    this.world=pack.world;this.definitions=pack.graffiti;this.store=store;this.save=store.load();
    this.nav=new NavigationGrid(this.world);this.camera=new Camera();this.effects=new EffectPool();
    this.refreshCity();
    this.gangs=new BridgeGangs(this.world);
    this.player={...this.world.spawn,facing:'down',moving:false,state:'IDLE',path:[]};
    this.companion={x:this.player.x-24,y:this.player.y+24,path:[],moving:false,alert:0,repathIn:0};
    this.police=new PoliceSystem(this.world.police,this.nav);
    this.citizens=new CitizenSystem(this.world);this.traffic=new TrafficSystem(this.world);this.knockedFor=0;this.trafficGrace=0;
    this.mode='hideout';this.time=0;this.heat=0;this.runRep=0;this.runWalls=[];
    this.painted=new Set(this.save.painted_walls);this.events=[];this.near=null;this.waypoint=null;
    this.hiddenFor=0;this.hideTick=0;this.grace=0;this.victoryFor=0;this.caughtFor=0;this.graffiti=null;
    this.metrics={fps:0,frame:0,memory:'—',activePolice:0,drawCalls:0};this.refreshWalls();
    this.room={action:'idle',remaining:0,beat:false,reaction:'',reactionFor:0};
    this.runStyles={};this.court=this.world.courtActivity??COURT;this.courtLine=0;this.ballGame=null;this.ballReward=false;
    const checkpoint=this.save.active_run;
    if(!this.world.tutorial&&checkpoint?.district===this.world.id){
      this.runWalls=checkpoint.walls.filter(id=>this.world.targets.some(t=>t.wall_id===id)&&!this.painted.has(id));
      if(this.runWalls.length){
        for(const id of this.runWalls){this.painted.add(id);this.runStyles[id]=['purple','cyan','gold'].includes(checkpoint.styles[id])?checkpoint.styles[id]:'purple';}
        this.runRep=this.runWalls.reduce((sum,id)=>sum+this.world.targets.find(t=>t.wall_id===id).rep_reward,0);
        this.heat=checkpoint.heat;this.mode='district';this.grace=3;this.trafficGrace=3;
        if(checkpoint.position&&this.nav.canWalk(checkpoint.position.x,checkpoint.position.y))Object.assign(this.player,checkpoint.position);
        Object.assign(this.companion,{x:this.player.x-24,y:this.player.y+24});this.refreshWalls();
        this.notice('Вылазка восстановлена. Граффити на месте — отнеси REP домой.');
      }
    }
    if(this.world.tutorial){this.citizens.people=[];this.tutorial=this.world.sandbox?new SandboxFlow(this):this.world.id==='sneak'?new SneakFlow(this):new TutorialFlow(this);this.life=new StreetLife(this);}
  }
  emit(type,data={}){this.events.push({type,...data});}
  notice(message){this.emit('notice',{message});}
  persist(){
    if(this.world.sandbox&&['district','hideout'].includes(this.mode))this.save.resume={level:'sandbox',mode:this.mode,x:this.player.x,y:this.player.y,facing:this.player.facing,heat:this.hiddenFor>0?0:this.heat};
    try{this.store.write(this.save);return true;}
    catch{this.notice('Сохранение недоступно в этом браузере. Прогресс остаётся в текущей сессии.');return false;}
  }
  refreshWalls(){
    for(const t of this.world.targets)t.state=this.painted.has(t.wall_id)?'PAINTED':'CLEAN';
    this.refreshCity();
  }
  refreshCity(){this.city=cityProgress(this.world,this.save);this.nav.access=null;}
  enterDistrict(){
    if(this.tutorial)return this.tutorial.leave();
    this.gangs.reset();
    this.room.action='idle';this.room.remaining=0;this.runStyles={};
    const home=this.world.hideouts?.find(h=>h.regionId===this.save.district_progress[this.world.id]?.home&&this.city.find(r=>r.id===h.regionId)?.open);
    Object.assign(this.player,home?{x:home.x+38,y:home.y}:this.world.spawn,{path:[],state:'IDLE',moving:false});
    Object.assign(this.companion,{x:this.player.x-26,y:this.player.y+24,path:[],repathIn:0});
    this.camera.ready=false;this.mode='district';this.heat=0;this.runRep=0;this.runWalls=[];
    this.painted=new Set(this.save.painted_walls);this.police=new PoliceSystem(this.world.police,this.nav);
    this.grace=2;this.hiddenFor=0;this.waypoint=null;
    this.knockedFor=0;this.trafficGrace=2;
    const progress=this.save.district_progress[this.world.id]??={visits:0};
    progress.visits=(Number(progress.visits)||0)+1;
    this.refreshWalls();
    this.notice(this.painted.has(this.world.targets[0].wall_id)?'Выбери следующую стену на карте. Возвращайся домой, чтобы сохранить вылазку.':'Найди фиолетовый баллон. Первая стена — рядом с гаражом.');
  }
  returnHideout(caught=false){
    if(this.tutorial)return this.tutorial.goHome();
    this.gangs.reset();
    const openBefore=new Set(this.city.filter(r=>r.open).map(r=>r.id));
    const region=regionAt(this.world,this.player);
    if(region)(this.save.district_progress[this.world.id]??={visits:0}).home=region.id;
    const reward=caught?Math.floor(this.runRep*.5):this.runRep;
    this.save.rep+=reward;
    if(!caught){
      this.save.painted_walls=[...this.painted];
      for(const id of this.runWalls){
        this.save.graffiti_by_wall[id]=this.world.targets.find(t=>t.wall_id===id).graffiti_id;
        this.save.wall_styles[id]=this.runStyles[id]??'purple';
      }
      this.save.hideout.collectibles=[...new Set([...this.save.hideout.collectibles,...TROPHIES.filter(t=>this.save.painted_walls.length>=t.walls).map(t=>t.id)])];
    }
    this.save.active_run=null;this.persist();this.heat=0;this.runRep=0;this.runWalls=[];
    this.runStyles={};
    this.painted=new Set(this.save.painted_walls);this.refreshWalls();
    this.mode='hideout';this.player.path=[];this.player.state=caught?'CAUGHT':'VICTORY';this.near=null;this.waypoint=null;
    const opened=this.city.filter(r=>r.open&&!openBefore.has(r.id)).map(r=>r.name);
    this.notice(caught?'Поймали! Стены этой вылазки потеряны; спасено '+reward+' REP.':'Сохранено. +'+reward+' REP в коллекцию.'+(opened.length?' Открыт мост: '+opened.join(', ')+'.':''));
    this.emit('mode');
  }
  upgrade(){
    if(this.mode!=='hideout')return;
    if(this.save.hideout.upgrades.includes('spray_rack'))return this.notice('SPRAY RACK уже установлен.');
    if(this.save.rep<500)return this.notice('Нужно 500 сохранённых REP.');
    this.save.rep-=500;this.save.hideout.upgrades.push('spray_rack');this.persist();
    this.notice('SPRAY RACK I: радиус распыления увеличен на 45%.');this.emit('mode');
  }
  prepare(kind,id){
    if(this.mode!=='hideout')return false;
    const catalog=kind==='outfit'?OUTFITS:kind==='ink'?INKS:TROPHIES,item=catalog.find(x=>x.id===id);
    if(!item||this.save.painted_walls.length<(item.walls??0))return false;
    if(kind==='outfit')this.save.player.skin=id;
    else if(kind==='ink')this.save.player.ink=id;
    else if(kind==='display')this.save.hideout.display=id;
    else return false;
    this.room.action=kind==='ink'?'spray':'victory';this.room.remaining=1.4;
    const line=kind==='outfit'?'Надену '+item.name+'. Пусть район привыкает.':kind==='ink'?'Беру '+item.name+'. Стенам пойдёт.':'Поставлю '+item.name+' на видное место.';
    this.persist();this.notice(line);
    return true;
  }
  roomAction(action){
    if(this.mode!=='hideout')return;
    if(action==='save'){const ok=this.persist();if(ok)this.notice('Всё сохранил. Теперь можно выдохнуть.');}
    else if(action==='rest'){if(this.life)return this.life.sleep();this.room.action='rest';this.room.remaining=5;this.room.reaction='Тихо. Мы дома.';this.room.reactionFor=4;}
    else if(action==='pet'){this.room.action='pet';this.room.remaining=2;this.room.reaction='♥';this.room.reactionFor=2;}
  }
  routeTo(point,label='Точка назначения'){
    if(this.tutorial?.scripted)return;
    if(this.knockedFor>0||this.gangs.push)return;
    this.player.path=this.nav.path(this.player,point);this.waypoint={...point,label};
    if(!this.player.path.length){this.notice('К этой точке пока нет прохода.');this.waypoint=null;}
  }
  nearest(){
    const options=[];
    const add=(type,item,p,radius)=>{const d=distance(this.player,p);if(d<radius)options.push({type,item,d});};
    for(const home of this.world.hideouts??[this.world.hideout])add('hideout',home,home,62);
    for(const npc of this.world.streetNpcs??[])add('npc',npc,npc.approach,62);
    if(this.world.sandbox)add('court',this.court,this.court,68);
    if(this.tutorial){for(const target of this.world.targets)if(this.tutorial.allowedTarget(target))add('target',target,target.approach,62);if(this.tutorial.stage==='hide'||this.world.sandbox)for(const bin of this.world.bins??[])add('bin',bin,bin.approach,58);options.sort((a,b)=>a.d-b.d);return options[0]??null;}
    for(const poster of POSTERS)add('poster',{...poster,name:'Плакат '+poster.brand},posterApproach(this.world,poster),65);
    for(const bridge of this.world.bridges??[])add('bridge',bridge,bridge.approach,100);
    for(const poi of this.world.pointsOfInterest??[])add('poi',poi,poi,68);
    add('court',this.court,this.court,68);
    for(const t of this.world.targets)if(!this.painted.has(t.wall_id))add('target',t,t.approach,62);
    for(const s of this.world.safeSpots)add('safe',s,s,48);
    options.sort((a,b)=>a.d-b.d);return options[0]??null;
  }
  interact(){
    if(this.tutorial?.scripted)return;
    if(this.mode!=='district'||this.hiddenFor>0||this.knockedFor>0||this.gangs.push||!this.near)return;
    const {type,item}=this.near;this.player.path=[];this.waypoint=null;
    if(type==='target'&&this.tutorial&&!this.tutorial.allowedTarget(item))return;
    if(type==='bin')return this.tutorial.hideIn(item);
    if(type==='npc')return talkToStreetNpc(this,item);
    if(type==='hideout')return this.returnHideout();
    if(type==='poster'){this.emit('poster-open',{id:item.id});return;}
    if(type==='poi'){
      const progress=this.save.district_progress.city??={visited:[]};progress.visited=[...new Set([...(progress.visited??[]),item.id])];this.persist();
      this.emit('poi-open',{id:item.id});return;
    }
    if(type==='bridge'){this.gangs.confront(this,item,true);return;}
    if(type==='court'){
      this.streetDialogue=null;this.courtLine=0;this.mode='court-dialogue';this.player.state='IDLE';this.player.moving=false;this.emit('mode');return;
    }
    if(type==='safe'){
      if(item.cooldown>0)return this.notice('Укрытие восстановится через '+Math.ceil(item.cooldown)+' сек.');
      this.hiddenFor=3.2;this.hideTick=0;item.cooldown=26;this.player.state='HIDE';
      this.notice('LAY LOW · ты скрыт. Розыск снижается.');return;
    }
    item.state='PAINTING';
    this.graffiti=new GraffitiGame(item,this.definitions.find(g=>g.id===item.graffiti_id),this.save.hideout.upgrades.includes('spray_rack'));
    this.graffiti.ink=this.save.player.ink;
    this.mode='graffiti';this.player.state='SHAKE_CAN';this.emit('graffiti-start');
  }
  advanceCourt(){
    if(this.mode!=='court-dialogue')return;
    const lines=this.streetDialogue?.lines??COURT_LINES;
    if(this.courtLine<lines.length-1)this.courtLine++;
    else if(this.streetDialogue){this.cancelCourt();return;}
    else{this.ballGame=new BallArtGame();this.mode='ball-art';this.ballReward=false;}
    this.emit('mode');
  }
  cancelCourt(){
    if(!['court-dialogue','ball-art','ball-result'].includes(this.mode))return;
    this.ballGame?.end();this.ballGame=null;this.streetDialogue=null;this.mode='district';this.grace=2;this.player.state='IDLE';this.emit('mode');
  }
  finishBall(){
    if(this.mode==='ball-result')return this.cancelCourt();
    if(this.mode!=='ball-art'||!this.ballGame?.ready)return false;
    this.ballGame.end();this.ballReward=!this.save.basketball.completed;
    this.save.basketball={completed:true,pixels:[],stickers:this.ballGame.snapshot()};
    if(this.ballReward)this.save.rep+=COURT.reward;
    this.persist();this.refreshCity();this.mode='ball-result';this.emit('mode');return true;
  }
  cancelGraffiti(){
    if(!this.graffiti)return;
    if(this.graffiti.done)return this.completeGraffiti();
    this.graffiti.target.state='AVAILABLE';this.graffiti=null;this.mode='district';this.grace=1;
    this.player.state='IDLE';this.emit('mode');
  }
  completeGraffiti(){
    const g=this.graffiti;if(!g||!this.world.sandbox&&this.painted.has(g.target.wall_id))return;
    if(this.tutorial)return this.tutorial.painted();
    this.painted.add(g.target.wall_id);this.runWalls.push(g.target.wall_id);g.target.state='PAINTED';
    this.runStyles[g.target.wall_id]=g.ink??'purple';
    this.runRep+=g.target.rep_reward;this.heat=clamp(this.heat+g.target.heat_reward,0,5);
    this.save.active_run={district:this.world.id,walls:[...this.runWalls],styles:{...this.runStyles},heat:this.heat,position:{x:this.player.x,y:this.player.y}};
    this.persist();
    this.notice('+'+g.target.rep_reward+' REP · HEAT +'+g.target.heat_reward+' — вернись домой, чтобы сохранить.');
    const p=project(this.player.x,this.player.y);this.effects.emit(p.x,p.y-30,'#eac559',18);
    this.graffiti=null;this.mode='district';this.grace=2;this.victoryFor=1;this.player.state='VICTORY';this.emit('mode');
  }
  checkpointResult(g){
    if(this.tutorial)return;
    if(g.checkpointed)return;g.checkpointed=true;
    this.save.active_run={district:this.world.id,walls:[...new Set([...this.runWalls,g.target.wall_id])],
      styles:{...this.runStyles,[g.target.wall_id]:g.ink??'purple'},heat:clamp(this.heat+g.target.heat_reward,0,5),position:{x:this.player.x,y:this.player.y}};
    this.persist();
  }
  movePlayer(dt,movement){
    this.player.moving=false;
    if(this.tutorial?.scripted)return;
    if(this.knockedFor>0||this.gangs.push){this.player.state='HIT';return;}
    if(this.hiddenFor>0)return;
    const length=Math.hypot(movement.x,movement.y);
    if(length>.05){
      this.player.path=[];this.waypoint=null;
      // Screen-relative controls under a 2:1 projection.
      let dx=movement.y+movement.x*.65,dy=movement.y-movement.x*.65;
      const scale=178*dt/Math.hypot(dx,dy);dx*=scale;dy*=scale;
      const old={x:this.player.x,y:this.player.y};
      if(this.nav.canWalk(this.player.x+dx,this.player.y))this.player.x+=dx;
      if(this.nav.canWalk(this.player.x,this.player.y+dy))this.player.y+=dy;
      this.player.moving=distance(old,this.player)>.01;
      this.player.facing=Math.abs(movement.x)>Math.abs(movement.y)?(movement.x>0?'right':'left'):(movement.y>0?'down':'up');
    }else moveAlongPath(this.player,this.player.path,178,dt);
    if(this.waypoint&&!this.player.path.length){this.waypoint=null;this.notice('На месте. Нажми действие.');}
    if(this.victoryFor<=0)this.player.state=this.player.moving?'MOVE_'+this.player.facing.toUpperCase():'IDLE';
  }
  update(dt,movement={x:0,y:0}){
    if(this.cinematic)return;
    this.time+=dt;this.effects.update(dt);
    this.life?.update(dt);
    this.tutorial?.update(dt);
    if(this.mode==='hideout'){
      this.room.remaining=Math.max(0,this.room.remaining-dt);this.room.reactionFor=Math.max(0,this.room.reactionFor-dt);
      if(!this.room.remaining)this.room.action='idle';
      return;
    }
    if(this.mode==='graffiti'){
      this.player.state=this.graffiti.phase==='shake'?'SHAKE_CAN':'SPRAY';
      if(this.graffiti.done){this.checkpointResult(this.graffiti);this.graffiti.resultTime+=dt;if(this.graffiti.resultTime>GRAFFITI_CONFIG.resultSeconds)this.completeGraffiti();}
      return;
    }
    if(this.mode==='caught'){
      this.caughtFor-=dt;if(this.caughtFor<=0)this.returnHideout(true);return;
    }
    if(this.mode!=='district')return;
    this.grace=Math.max(0,this.grace-dt);this.victoryFor=Math.max(0,this.victoryFor-dt);
    for(const s of this.world.safeSpots)s.cooldown=Math.max(0,s.cooldown-dt);
    if(this.hiddenFor>0){
      this.hiddenFor-=dt;this.hideTick+=dt;
      if(this.hideTick>=1){this.heat=Math.max(0,this.heat-1);this.hideTick=0;}
      if(this.hiddenFor<=0){this.player.state='IDLE';this.grace=1.2;}
    }
    this.knockedFor=Math.max(0,this.knockedFor-dt);this.trafficGrace=Math.max(0,this.trafficGrace-dt);
    const previous={x:this.player.x,y:this.player.y};
    this.movePlayer(dt,movement);this.gangs.update(dt,this,previous);this.traffic.update(dt,this.life?.night??false);
    const car=this.hiddenFor<=0&&this.trafficGrace<=0&&this.grace<=0&&this.traffic.collision(previous,this.player);
    if(car)this.hitByTraffic(car);
    this.near=this.knockedFor>0||this.gangs.push?null:this.nearest();
    for(const t of this.world.targets)if(t.state!=='PAINTED')t.state=this.near?.item===t?'AVAILABLE':'CLEAN';
    this.metrics.activePolice=this.police.update(dt,this.player,this.heat,this.world,this.hiddenFor>0,this.grace);
    if(this.police.caught){this.mode='caught';this.caughtFor=1.6;this.player.state='CAUGHT';this.player.path=[];this.notice('ПЕРЕХВАТ! Половина REP спасена.');return;}
    if(this.save.campaign?.companionUnlocked===false){this.citizens.update(dt,this.player);return;}
    this.companion.repathIn-=dt;
    if(distance(this.companion,this.player)>38&&this.companion.repathIn<=0){
      this.companion.path=this.nav.path(this.companion,{x:this.player.x-18,y:this.player.y+18});this.companion.repathIn=.55;
    }
    moveAlongPath(this.companion,this.companion.path,190,dt);
    this.companion.alert=this.police.units.some(u=>u.active&&distance(u,this.player)<210&&this.heat>0)?1:0;
    this.citizens.update(dt,this.player);
  }
  hitByTraffic(car){
    this.knockedFor=1.6;this.trafficGrace=4;this.grace=Math.max(this.grace,2.5);this.victoryFor=0;
    this.player.state='HIT';this.player.moving=false;this.player.path=[];this.waypoint=null;car.hold=.6;
    for(let i=0;i<12;i++){
      const next={x:this.player.x,y:this.player.y};next[car.axis]+=car.direction*2;
      if(this.nav.canWalk(next.x,next.y)){this.player.x=next.x;this.player.y=next.y;}else break;
    }
    const p=project(this.player.x,this.player.y);this.effects.emit(p.x,p.y-12,'#f4cf74',18);
    this.notice('СБИЛИ! Зак поднимается… Смотри по сторонам.');this.emit('traffic-hit');
  }
}

