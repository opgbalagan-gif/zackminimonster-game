import {createTutorialWorld,TutorialFlow} from './core__tutorial.js?v=715810e652df';
import {distance,moveAlongPath} from './core__geometry.js?v=715810e652df';
export function createSneakWorld(){
  const w=createTutorialWorld();w.id='sneak';w.levelNumber=2;w.name='ТИШЕ УЛИЦЫ';w.width=980;w.height=700;
  w.walkableAreas=[{x:72,y:92,w:810,h:460}];w.mapBounds={x:70,y:70,w:820,h:510};w.tutorialEntry={x:838,y:470};
  w.targets[0]={...w.targets[0],wall_id:'SNEAK_GIFT_WALL',name:'Новый след · PAPER GHOST',graffiti_id:'monster',rep_reward:75};
  w.bins=[{id:'bin_near',name:'Мусорный бак',x:544,y:354,approach:{x:544,y:389}},{id:'bin_far',name:'Бак в переулке',x:739,y:270,approach:{x:739,y:308}}];
  for(const b of w.bins)w.obstacles.push({x:b.x-24,y:b.y-18,w:48,h:27});
  return w;
}
const lessons={
  gift:{step:1,title:'Подарок без бантика',who:'ЗАК',line:'Новый рисунок. Осталось найти стену, которая ещё не в курсе.',help:'В подарок открыт PAPER GHOST. Район стал больше; зелёные баки помогут скрыться от патруля.',button:'ЗАБРАТЬ РИСУНОК'},
  paint:{step:2,title:'Новый рисунок, старая стена',who:'ЗАК',line:'Сегодня у стены премьера. Билеты не нужны.',help:'Подойди к стене и нарисуй подарочный PAPER GHOST. Запомни, где стоят баки.',button:'К СТЕНЕ'},
  hide:{step:3,title:'Тише мусора',who:'ЗАК',line:'Критик в форме. Кажется, пора в закрытую выставку.',help:'Патруль идёт сюда! Подойди к зелёному баку и нажми «Спрятаться». Пережди поиск внутри.',button:'К БЛИЖНЕМУ БАКУ'},
  hidden:{step:4,title:'Современное укрытие',who:'ЗАК',line:'Аромат сложный. Зато меня не видно.',help:'Оставайся в баке, пока патруль не уйдёт. Поиск займёт несколько секунд.'},
  photo:{step:5,title:'Работа в кадре',who:'SMS · ZAK MINI MONSTER',line:'У стены жизнь короткая. У хорошего снимка — подлиннее.',help:'На раскладушку пришло сообщение. Открой телефон, прочти SMS и сфотографируй новый рисунок.',button:'ОТКРЫТЬ ТЕЛЕФОН'},
  complete:{step:6,title:'Исчезнуть. И оставить след.',who:'ЗАК',line:'Патруль ушёл, работа осталась. Фотография — тоже.',help:'Прятки и съёмка освоены: +75 REP. Снимок сохранён в телефоне. Днём здесь будут зрители.',button:'ДОМОЙ'}
};
export class SneakFlow extends TutorialFlow{
  constructor(s){
    super(s,false);this.actor=null;this.tag=0;this.coating=0;this.homeReturnStage=null;
    this.stage=s.save.campaign.sneakCheckpoint;this.age=0;this.wall=['hide','photo','complete'].includes(this.stage)?'own':'blank';
    s.mode='district';Object.assign(s.player,s.world.spawn);s.save.campaign.homeIntroStep=7;
    if(this.wall==='own')s.painted.add(s.world.targets[0].wall_id);
    if(this.stage==='gift'){s.save.streetLife.period='night';s.save.streetLife.elapsed=0;}
    if(this.stage==='hide')this.startPatrol();
    if(['photo','complete'].includes(this.stage))s.save.phone.unlocked=true;
  }
  get scripted(){return ['gift','hidden'].includes(this.stage);}
  get lesson(){
    if(this.s.mode==='hideout')return {...lessons.complete,title:'Дома',help:'Поспи до следующей части суток. Работы, деньги и снимки сохраняются.',button:'НА УЛИЦУ'};
    if(this.s.life&&!this.s.life.night&&this.stage==='paint')return {...lessons.paint,title:'Краска ждёт ночи',help:'Днём гуляем. Вернись домой и поспи до ночи, чтобы нарисовать новую работу.',button:'ДОМОЙ'};
    return lessons[this.stage];
  }
  set(stage){this.stage=stage;this.age=0;this.s.player.path=[];this.s.waypoint=null;this.s.save.campaign.sneakCheckpoint=stage==='hidden'?'hide':stage;this.s.persist();}
  leave(){if(this.s.life?.sleeping)return;this.s.mode='district';Object.assign(this.s.player,this.s.world.spawn,{path:[],state:'IDLE'});}
  allowedTarget(target){return this.s.life?.night&&this.stage==='paint'&&target===this.s.world.targets[0];}
  act(){
    const s=this.s;if(s.mode==='hideout')return this.leave();
    if(this.stage==='gift'){s.save.campaign.giftUnlocked=true;this.set('paint');s.notice('ПОДАРОК · PAPER GHOST открыт!');return;}
    if(this.stage==='paint'){if(!s.life.night)s.routeTo(s.world.hideout,'Дом / поспать');else s.routeTo(s.world.targets[0].approach,'Новый рисунок');}
    if(this.stage==='hide'){const b=s.world.bins.reduce((a,b)=>distance(a.approach,s.player)<distance(b.approach,s.player)?a:b);s.routeTo(b.approach,'Бак / спрятаться');}
    if(this.stage==='photo')s.emit('phone-open');
    if(this.stage==='complete')s.routeTo(s.world.hideout,'Дом');
  }
  painted(){const s=this.s;s.graffiti=null;s.mode='district';s.player.state='IDLE';this.wall='own';s.painted.add(s.world.targets[0].wall_id);s.world.targets[0].state='PAINTED';this.set('hide');this.startPatrol();}
  startPatrol(){this.actor={...this.s.world.tutorialEntry,sprite:'officer',path:[],repath:0,moving:false};this.s.heat=2;this.age=0;}
  hideIn(bin){if(this.stage!=='hide')return;this.bin=bin;this.s.hiddenFor=600;Object.assign(this.s.player,bin.approach,{path:[],state:'HIDE'});this.set('hidden');this.actor.path=this.s.nav.path(this.actor,this.s.world.tutorialEntry);this.s.notice('Тихо. Патруль не видит Зака в баке.');}
  finishPhoto(){if(this.stage!=='photo')return;const s=this.s;if(!s.save.campaign.sneakComplete)s.save.rep+=75;s.save.campaign.sneakComplete=true;this.set('complete');s.notice('УРОВЕНЬ 02 ПРОЙДЕН · +75 REP');}
  goHome(){if(['hide','hidden'].includes(this.stage)){this.s.notice('Сначала спрячься от патруля в баке.');return;}this.s.mode='hideout';this.s.near=null;this.s.persist();}
  update(dt){
    if(this.s.mode!=='district')return;this.age+=dt;
    if(this.stage==='hide'){
      this.actor.repath-=dt;if(this.actor.repath<=0){this.actor.path=this.s.nav.path(this.actor,this.s.player);this.actor.repath=.5;}
      if(this.age>3)moveAlongPath(this.actor,this.actor.path,86,dt);
      if(this.age>4&&distance(this.actor,this.s.player)<23){Object.assign(this.s.player,{x:492,y:310,path:[]});this.startPatrol();this.s.notice('Заметили! Попробуй ещё раз: добеги до бака и нажми «Спрятаться».');}
    }
    if(this.stage==='hidden'){
      moveAlongPath(this.actor,this.actor.path,90,dt);
      if(this.age>=7){this.s.hiddenFor=0;this.s.heat=0;this.actor=null;this.bin=null;this.s.save.phone.unlocked=true;this.set('photo');this.s.emit('phone-message');this.s.notice('Патруль ушёл. На раскладушку пришло SMS.');}
    }
  }
}
