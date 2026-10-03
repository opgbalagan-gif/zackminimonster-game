import {createSneakWorld} from './core__sneak.js?v=858a2abe0ff4';
import {distance,moveAlongPath} from './core__geometry.js?v=858a2abe0ff4';

export function createSandboxWorld(){
  const w=createSneakWorld();w.id='sandbox';w.sandbox=true;w.levelNumber=1;w.name='СВОЙ РАЙОН';
  w.width=1650;w.height=1160;w.walkableAreas=[{x:72,y:92,w:1450,h:940}];w.mapBounds={x:72,y:92,w:1450,h:940};
  w.targets[0]={...w.targets[0],wall_id:'SANDBOX_WALL_1',name:'Стена у дома',graffiti_id:'zack_tag',rep_reward:60,heat_reward:1};
  w.targets[1]={...w.targets[1],wall_id:'SANDBOX_HOME',rep_reward:60,heat_reward:1};
  // Keep one freestanding wall by home; the rest of the district's art belongs on buildings.
  w.extraWalls=[];
  w.roads=[{x:76,y:412,w:1442,h:112},{x:76,y:916,w:1442,h:112},{x:950,y:96,w:112,h:928}];
  const homes=[['north_house','Кирпичная мастерская',700,132,'brick'],['corner_house','Синий склад',1120,132,'blue'],['brick_house','Дом во дворе',350,650,'brick'],['music_house','Репетиционная',740,650,'blue'],['end_house','Дом у перекрёстка',1120,650,'apartment']];
  for(const [id,name,x,y,artType] of homes){
    const b={id,type:'apartment',artType,x,y,w:166,h:156};w.buildings.push(b);
    w.targets.push({...w.targets[1],wall_id:'SANDBOX_'+id.toUpperCase(),buildingId:id,name:'Фасад · '+name,x:x+b.w,y:y+b.h,approach:{x:x+b.w+37,y:y+b.h+17},graffiti_id:id==='music_house'?'monster':'zack_tag'});
  }
  for(const [i,x,y] of [[2,620,825],[3,1360,825]]){const b={id:'block_bin_'+i,name:'Бак во дворе',x,y,approach:{x,y:y+38}};w.bins.push(b);w.obstacles.push({x:x-24,y:y-18,w:48,h:27});}
  w.blockProps=[{id:'lamp',x:900,y:385,w:44},{id:'lamp',x:1400,y:390,w:44},{id:'lamp',x:650,y:880,w:44},{id:'lamp',x:1350,y:880,w:44},{id:'bench',x:550,y:870,w:91},{id:'planter',x:1025,y:580,w:62}];
  return w;
}

// Uses the small level infrastructure, with no scripted tutorial checkpoints.
export class SandboxFlow{
  constructor(s){
    this.s=s;this.stage='free';this.age=0;this.actor=null;this.tag=0;this.coating=0;this.bin=null;
    s.mode=s.save.campaign.sandboxAtHome?'hideout':'district';s.save.phone.unlocked=true;
    if(!s.save.campaign.sandboxStarted){s.save.campaign.sandboxStarted=true;s.save.streetLife.period='night';s.save.streetLife.elapsed=0;}
    this.wall=s.painted.has(s.world.targets[0].wall_id)?'own':'blank';s.persist();
  }
  get scripted(){return false;}
  get lesson(){return {step:1,who:'ЗАК',title:'Свой район',line:'Стены есть. Остальное — дело краски.',help:'Ночью рисуй и прячься от патруля. Днём собирай зрителей. Дом, сон и телефон всегда доступны.'};}
  allowedTarget(){return this.s.life?.night&&!this.bin;}
  act(){if(this.s.mode==='hideout')this.leave();}
  leave(){if(this.s.life.sleeping)return;this.s.mode='district';this.s.save.campaign.sandboxAtHome=false;Object.assign(this.s.player,this.s.world.spawn,{path:[],state:'IDLE'});this.s.persist();}
  goHome(){const s=this.s;this.bin=null;this.actor=null;s.hiddenFor=0;s.heat=0;s.mode='hideout';s.near=null;s.player.path=[];s.save.campaign.sandboxAtHome=true;s.persist();s.emit('mode');}
  painted(){
    const s=this.s,g=s.graffiti,target=g.target,first=!s.painted.has(target.wall_id);
    s.painted.add(target.wall_id);target.state='PAINTED';s.save.painted_walls=[...s.painted];s.save.graffiti_by_wall[target.wall_id]=target.graffiti_id;s.save.wall_styles[target.wall_id]=g.ink??'purple';
    if(first)s.save.rep+=target.rep_reward;
    this.wall=s.painted.has(s.world.targets[0].wall_id)?'own':'blank';s.graffiti=null;s.mode='district';s.player.state='IDLE';s.near=null;
    s.heat=Math.min(5,s.heat+1);this.age=0;
    if(!this.actor)this.actor={...s.world.tutorialEntry,sprite:'officer',path:[],repath:0,moving:false};
    s.save.campaign.sandboxComplete=s.world.targets.every(t=>s.painted.has(t.wall_id));s.persist();
    s.notice(first?'Ещё одна моя стена. +'+target.rep_reward+' REP.':'Свежая краска. Теперь звучит по-другому.');s.emit('mode');
  }
  hideIn(bin){this.bin=bin;this.age=0;this.s.hiddenFor=600;Object.assign(this.s.player,bin.approach,{path:[],state:'HIDE'});this.s.notice('У этого укрытия сложный аромат.');}
  update(dt){
    const s=this.s;if(s.mode!=='district')return;this.age+=dt;
    if(this.bin){
      if(this.actor){if(!this.actor.path.length)this.actor.path=s.nav.path(this.actor,s.world.tutorialEntry);moveAlongPath(this.actor,this.actor.path,85,dt);}
      if(this.age>5){this.bin=null;this.actor=null;s.hiddenFor=0;s.heat=0;s.player.state='IDLE';s.notice('Ушёл. Можно продолжать.');}return;
    }
    if(!s.life.night){this.actor=null;s.heat=0;return;}
    if(this.actor){
      this.actor.repath-=dt;if(this.actor.repath<=0){this.actor.path=s.nav.path(this.actor,s.player);this.actor.repath=.7;}
      if(this.age>4)moveAlongPath(this.actor,this.actor.path,78,dt);
      if(distance(this.actor,s.player)<25){this.goHome();s.notice('Пришлось закончить прогулку. Работы остались на месте.');}
    }
  }
}
