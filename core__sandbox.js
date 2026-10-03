import {createSneakWorld} from './core__sneak.js?v=09df463d6cde';
import {distance,moveAlongPath} from './core__geometry.js?v=09df463d6cde';
import {updateStreetNpcs} from './core__street-npcs.js?v=09df463d6cde';
import {addWaterfront} from './core__waterfront-layout.js?v=09df463d6cde';
import {WallRivals} from './core__wall-rivals.js?v=09df463d6cde';

export function createSandboxWorld(){
  const w=createSneakWorld();w.id='sandbox';w.sandbox=true;w.levelNumber=1;w.name='СВОЙ РАЙОН';
  w.width=2300;w.height=1500;w.mapBounds={x:72,y:92,w:2150,h:1320};w.walkableAreas=[{...w.mapBounds}];
  w.targets[0]={...w.targets[0],wall_id:'SANDBOX_WALL_1',name:'Стена у дома',graffiti_id:'zack_tag',rep_reward:60,heat_reward:1};
  w.targets[1]={...w.targets[1],wall_id:'SANDBOX_HOME',rep_reward:60,heat_reward:1};
  // Keep one freestanding wall by home; the rest of the district's art belongs on buildings.
  w.extraWalls=[];
  w.streetNpcs=[{id:'roby',name:'Робби',x:440,y:362,approach:{x:409,y:389},sprite:'roby_dog_se_0',roaming:true,direction:'se',path:[],pauseFor:2,line:'',exchange:0,speakingFor:0}];
  w.roads=[{x:76,y:412,w:2142,h:112},{x:76,y:916,w:2142,h:112},{x:950,y:96,w:112,h:1130}];
  const homes=[['north_house','Кирпичная мастерская',700,132,'brick'],['corner_house','Синий склад',1120,132,'blue'],['brick_house','Дом во дворе',350,650,'brick'],['music_house','Репетиционная',740,650,'blue'],['end_house','Дом у перекрёстка',1120,650,'apartment']];
  homes.push(['record_house','Магазин пластинок',1560,132,'brick'],['east_house','Восточный дом',1910,132,'apartment'],['yard_house','Дом у линии',320,1090,'blue'],['studio_house','Студия у метро',690,1090,'brick']);
  for(const [id,name,x,y,artType] of homes){
    const b={id,type:'apartment',artType,x,y,w:166,h:156};w.buildings.push(b);
    w.targets.push({...w.targets[1],wall_id:'SANDBOX_'+id.toUpperCase(),buildingId:id,name:'Фасад · '+name,x:x+b.w,y:y+b.h,approach:{x:x+b.w+37,y:y+b.h+17},graffiti_id:id==='music_house'?'monster':'zack_tag'});
  }
  for(const b of w.buildings)b.poster=({first_house:'posca',north_house:'converse',music_house:'reebok',record_house:'wilson'})[b.id];
  for(const [i,x,y] of [[2,620,825],[3,1360,825]]){const b={id:'block_bin_'+i,name:'Бак во дворе',x,y,approach:{x,y:y+38}};w.bins.push(b);w.obstacles.push({x:x-24,y:y-18,w:48,h:27});}
  w.blockProps=[{id:'lamp',x:900,y:385,w:44},{id:'lamp',x:1400,y:390,w:44},{id:'lamp',x:650,y:880,w:44},{id:'lamp',x:1350,y:880,w:44},{id:'bench',x:550,y:870,w:91},{id:'planter',x:1025,y:580,w:62}];
  w.blockProps.push({id:'lamp',x:1800,y:385,w:44},{id:'lamp',x:2110,y:880,w:44},{id:'lamp',x:1610,y:860,w:44},{id:'bench',x:1870,y:1075,w:91},{id:'planter',x:1550,y:1080,w:62});
  w.court={x:1640,y:620,w:420,h:260};
  w.courtActivity={id:'court',name:'Баскетбольная площадка',x:1840,y:825,reward:300,friends:[{x:1795,y:802,sprite:'court_dan'},{x:1860,y:802,sprite:'court_ti'}]};
  w.hoops=[{x:1654,y:750,facing:1},{x:2050,y:750,facing:-1}];
  for(const h of w.hoops)w.obstacles.push({x:h.x-8,y:h.y-8,w:16,h:16});
  w.surfaceMetro={start:80,end:2210,y:1350,height:12,loop:true,station:{x:1770,y:1350,dx:-1,dy:0},approach:{x:1770,y:1220}};
  w.obstacles.push({x:72,y:1302,w:2150,h:100,railway:true});
  return addWaterfront(w);
}

// Uses the small level infrastructure, with no scripted tutorial checkpoints.
export class SandboxFlow{
  constructor(s){
    this.rivals=new WallRivals(s);
    this.s=s;this.stage='free';this.age=0;this.actor=null;this.tag=0;this.coating=0;this.bin=null;this.saveIn=3;
    s.mode=s.save.campaign.sandboxAtHome?'hideout':'district';s.save.phone.unlocked=true;
    const resume=s.save.resume;if(resume?.level==='sandbox'){
      s.mode=resume.mode;if(s.nav.canWalk(resume.x,resume.y))Object.assign(s.player,{x:resume.x,y:resume.y,facing:resume.facing});
      s.heat=s.mode==='district'?resume.heat:0;if(s.heat>0){this.age=4;this.actor={...s.world.tutorialEntry,sprite:'officer',path:[],repath:0,moving:false};}
    }
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
    this.rivals.repaired(target.wall_id);
    if(first)s.save.rep+=target.rep_reward;
    this.wall=s.painted.has(s.world.targets[0].wall_id)?'own':'blank';s.graffiti=null;s.mode='district';s.player.state='IDLE';s.near=null;
    s.heat=Math.min(5,s.heat+1);this.age=0;
    if(!this.actor)this.actor={...s.world.tutorialEntry,sprite:'officer',path:[],repath:0,moving:false};
    s.save.campaign.sandboxComplete=s.world.targets.every(t=>s.painted.has(t.wall_id));s.persist();
    s.notice(first?'Ещё одна моя стена. +'+target.rep_reward+' REP.':'Свежая краска. Теперь звучит по-другому.');s.emit('mode');
  }
  hideIn(bin){this.bin=bin;this.age=0;this.s.hiddenFor=600;Object.assign(this.s.player,bin.approach,{path:[],state:'HIDE'});this.s.notice('У этого укрытия сложный аромат.');}
  update(dt){
    const s=this.s;updateStreetNpcs(s,dt);this.rivals.update(dt);if(s.mode!=='district')return;this.age+=dt;
    this.saveIn-=dt;if(this.saveIn<=0){this.saveIn=3;s.persist();}
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
