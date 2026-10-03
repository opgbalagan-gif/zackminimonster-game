import {createSneakWorld} from './core__sneak.js?v=3e5b725efe0e';
import {distance,moveAlongPath} from './core__geometry.js?v=3e5b725efe0e';

export function createSandboxWorld(){
  const w=createSneakWorld();w.id='sandbox';w.sandbox=true;w.levelNumber=1;w.name='СВОЙ РАЙОН';
  w.targets[0]={...w.targets[0],wall_id:'SANDBOX_WALL_1',name:'Стена у дома',graffiti_id:'zack_tag',rep_reward:60};
  w.targets[1]={...w.targets[1],wall_id:'SANDBOX_HOME',rep_reward:60};
  w.extraWalls=[{x:680,y:172,w:160},{x:670,y:344,w:180}];
  for(const [i,wall] of w.extraWalls.entries()){
    w.obstacles.push({x:wall.x,y:wall.y,w:wall.w,h:14,wallCollider:true});
    w.targets.push({...w.targets[0],wall_id:'SANDBOX_WALL_'+(i+2),name:i?'Стена у дороги':'Стена переулка',x:wall.x+wall.w/2,y:wall.y+14,approach:{x:wall.x+wall.w/2,y:wall.y+56},graffiti_id:i?'zack_tag':'monster'});
  }
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
