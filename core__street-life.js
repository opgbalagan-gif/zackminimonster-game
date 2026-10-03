import {moveAlongPath,distance} from './core__geometry.js?v=4c2aa9d50742';
import {recognition,rememberWorks,RECOGNITION_TIERS} from './core__recognition.js?v=4c2aa9d50742';

export const HOME_TOUR=[
  ['Знакомый потолок','Кровать — мой первый спонсор. Пока платит только сном.','Это дом Зака. Радио — в телефоне справа. Остальные значки появятся по ходу знакомства.','О КРОВАТИ'],
  ['Ночью — на стены','Днём все куда-то спешат. Ночью хотя бы стены свободны.','Значок кровати: сон до следующей части суток. Ночью рисуем, днём люди смотрят работы, фотографируются и оставляют деньги.','СПАТЬ ДО НОЧИ'],
  ['Шкаф с характером','Одежда чистая. Ненадолго.','Появился гардероб. Нажми значок над одеждой, чтобы выбрать образ. Затем закрой меню и продолжи.','ДАЛЬШЕ'],
  ['Цвет вместо слов','Баллон маленький. Амбиции — нет.','Значок баллонов открывает краски. Выбери цвет акцентных брызг для рисунка.','ДАЛЬШЕ'],
  ['Место для истории','Полка пока не ломится. Есть над чем работать.','Значок коллекции: здесь появятся трофеи за твои работы. Напарника у Зака пока нет.','ДАЛЬШЕ'],
  ['Сохраняй своё','Память у города короткая. У этой кнопки — получше.','Значок сохранения записывает прогресс. Деньги от прохожих сохраняются сразу и считаются отдельно от REP.','ДАЛЬШЕ'],
  ['Пора оставить след','Квартира осмотрена. Теперь посмотрим, что скажет улица.','Ночью доступно рисование. Днём можно гулять, смотреть на зрителей и вернуться домой поспать. Радио всегда с тобой.','НА УЛИЦУ']
];
export class StreetLife{
  constructor(s){this.s=s;this.visitors=[];this.spawnIn=2;this.sleeping=0;this.saveIn=15;if(rememberWorks(s))s.persist();this.knownLevel=this.fame.level;}
  get fame(){return recognition(this.s.save);}
  syncRecognition(){
    const changed=rememberWorks(this.s),fame=this.fame,promoted=fame.level>this.knownLevel;this.knownLevel=fame.level;
    if(changed)this.s.persist();
    if(promoted)this.s.notice('Теперь я здесь «'+fame.name+'». Кажется, меня начинают узнавать.');
    return promoted;
  }
  get state(){return this.s.save.streetLife;}
  get night(){return this.state.period==='night';}
  get tour(){return !this.s.world.sandbox&&this.s.mode==='hideout'&&this.s.save.campaign.homeIntroStep<7;}
  get introStep(){return this.s.save.campaign.homeIntroStep;}
  iconVisible(id){if(!this.tour)return id!=='pet';return ({rest:1,wardrobe:2,sprays:3,collection:4,save:5,music:6}[id]??99)<=this.introStep;}
  tourLesson(){const [title,line,help,button]=HOME_TOUR[this.introStep];return {step:1,who:'ЗАК · ДОМА '+(this.introStep+1)+'/7',title,line,help,button};}
  nextIntro(){
    if(this.sleeping)return;
    if(this.introStep===1)return this.sleep();
    this.s.save.campaign.homeIntroStep++;this.s.persist();
    if(!this.tour)this.s.tutorial.leave();
  }
  sleep(){
    if(this.s.mode!=='hideout'||this.sleeping||this.tour&&this.introStep!==1)return;
    this.sleeping=2.6;this.s.room.action='rest';this.s.room.remaining=2.6;this.s.emit('mode');
  }
  changePeriod(){
    const state=this.state,from=state.period;
    if(this.night){state.period='day';state.day++;state.donations=[];state.audienceTier=null;}else state.period='night';
    state.elapsed=0;this.visitors=[];this.spawnIn=2;this.s.persist();
    this.s.emit('period-change',{from,to:state.period});
    this.s.notice(this.night?'Наступила ночь. Пора рисовать.':'Доброе утро. Посмотрим, кому понравились работы.');
  }
  works(){return this.s.world.targets.filter(t=>this.s.painted.has(t.wall_id)&&(this.s.world.sandbox||t.buildingId||this.s.tutorial.wall==='own'&&this.s.tutorial.tag===0&&this.s.tutorial.coating===0));}
  update(dt){
    this.syncRecognition();
    if(this.sleeping){this.sleeping=Math.max(0,this.sleeping-dt);if(!this.sleeping){if(!(this.tour&&this.introStep===1&&this.night))this.changePeriod();if(this.tour&&this.introStep===1){this.s.save.campaign.homeIntroStep=2;this.s.persist();}}return;}
    if(this.tour||this.s.mode==='graffiti'||this.s.mode==='phone'||this.s.tutorial.scripted)return;
    this.state.elapsed+=dt;this.saveIn-=dt;
    if(this.state.elapsed>=(this.night?300:180))this.changePeriod();
    if(this.saveIn<=0){this.saveIn=15;this.s.persist();}
    if(this.night||this.s.mode!=='district'){this.visitors=[];return;}
    this.spawnIn-=dt;
    if(this.spawnIn<=0&&this.visitors.length<3){
      if(this.state.audienceTier===null){this.state.audienceTier=this.fame.level;this.s.persist();}
      const audience=RECOGNITION_TIERS[this.state.audienceTier];this.spawnIn=audience.interval;
      const slots=this.works().flatMap(target=>Array.from({length:audience.audience},(_,n)=>({target,n,key:target.wall_id+':'+n,bonus:audience.bonus})));
      const slot=slots.find(v=>!this.state.donations.includes(v.key)&&!this.visitors.some(p=>p.key===v.key));
      if(slot){const start=this.s.world.tutorialEntry;const goal={x:slot.target.approach.x+12+(slot.n%2)*18,y:slot.target.approach.y+20+Math.floor(slot.n/2)*14};
        const path=this.s.nav.path(start,goal);if(path.length)this.visitors.push({...slot,...start,path,phase:'walk',age:0,moving:false,sprite:'citizen_'+(slot.n%3+1)+'_0'});}
    }
    for(const v of this.visitors){
      if(v.phase==='walk'||v.phase==='leave'){moveAlongPath(v,v.path,70,dt);if(!v.path.length){if(v.phase==='leave')v.done=true;else{v.phase='photo';v.age=0;const fame=this.fame;v.line=fame.level>=2&&distance(v,this.s.player)<150?(fame.level===3?'Зак! Можно фото с тобой?':'Зак, крутая работа!'):fame.lines[v.n%fame.lines.length];}}}
      else{v.age+=dt;if(v.phase==='photo'&&v.age>=2.8){v.phase='tip';v.age=0;
          if(!this.state.donations.includes(v.key)){this.state.donations.push(v.key);v.tip=10+(v.n%2)*5+v.bonus;this.s.save.money+=v.tip;this.s.save.recognition.encounters=Math.min(60,this.s.save.recognition.encounters+1);const promoted=this.syncRecognition();this.s.persist();if(!promoted)this.s.notice('Спасибо! +'+v.tip+' ₽ на следующую краску.');}}
        else if(v.phase==='tip'&&v.age>=2){v.phase='leave';v.path=this.s.nav.path(v,this.s.world.tutorialEntry);}}
    }
    this.visitors=this.visitors.filter(v=>!v.done);
  }
}
