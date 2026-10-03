import {distance,moveAlongPath} from './core__geometry.js?v=09df463d6cde';

export const TUTORIAL_WALL='TUTORIAL_FIRST_WALL';
export const TUTORIAL_FACADE='TUTORIAL_HOME_FACADE';
export function createTutorialWorld(){
  return {id:'tutorial',tutorial:true,name:'ПЕРВЫЙ СЛЕД',width:720,height:640,
    spawn:{x:268,y:350},hideout:{id:'first_home',name:'Твой дом',x:245,y:324},
    buildings:[{id:'first_house',type:'apartment',x:112,y:132,w:166,h:156}],
    obstacles:[{x:392,y:252,w:202,h:14,wallCollider:true}],props:[],roads:[],police:[],safeSpots:[],bridges:[],
    targets:[{wall_id:TUTORIAL_WALL,name:'Первая стена',x:492,y:265,axis:'x',approach:{x:492,y:310},graffiti_id:'zack_tag',wall_type:'concrete_wall',rep_reward:50,heat_reward:0,difficulty:1,graffiti_size:'M',state:'CLEAN'},
      {wall_id:TUTORIAL_FACADE,buildingId:'first_house',name:'Фасад твоего дома',x:278,y:278,axis:'y',approach:{x:315,y:305},graffiti_id:'zack_tag',wall_type:'concrete_wall',rep_reward:0,heat_reward:0,difficulty:1,graffiti_size:'M',state:'CLEAN'}],
    zones:[],boundaries:[],parkingLots:[],pointsOfInterest:[],walkableAreas:[{x:72,y:92,w:560,h:460}],
    tutorialEntry:{x:604,y:472},mapBounds:{x:70,y:70,w:570,h:510}};
}

export const LESSONS={
  home:{step:1,title:'Одна дверь. Целый город.',who:'ЗАК',line:'Дом есть. Денег почти нет. Зато баллон полный — уже подозрительно хорошее начало.',help:'Здесь ты сохраняешь заработанное и сбрасываешь розыск. Начинаем без напарника: на улицу Зак выходит один.',button:'ВЫЙТИ ИЗ ДОМА'},
  walk:{step:1,title:'Первые шаги',who:'ЗАК',line:'Сначала научимся ходить. Легендой района лёжа не станешь.',help:'Подойди к стене справа от дома: WASD / стрелки, джойстик или клик по земле. На фасаде дома тоже можно рисовать — нажми значок баллона.',button:'ПОКАЗАТЬ ПУТЬ'},
  paint:{step:2,title:'Оставь свой след',who:'ЗАК',line:'Чистая стена. Даже неловко прерывать такую скучную жизнь.',help:'Нажми «Рисовать»: встряхни баллон, размести рисунок и закрась силуэт. Подсказки появятся на каждом шаге.',button:'РИСОВАТЬ'},
  first_done:{step:2,title:'Первая работа',who:'ЗАК',line:'Ну всё. Мама, я художник. Правда, выставку пока никто не согласовал.',help:'Работа приносит REP. Пока ты на улице, награда ещё не сохранена. А у стены уже появился зритель…',button:'ПОСМОТРЕТЬ'},
  rival:{step:3,title:'Улица не спрашивает',who:'ГРАФФИТЧИК',line:'Неплохо, новичок. Теперь тут хотя бы моя подпись есть.',help:'Другой граффитчик подходит к стене и оставляет свой тег поверх твоего рисунка.'},
  rival_done:{step:3,title:'Ты сейчас серьёзно?',who:'ЗАК',line:'Подпись вижу. А разрешение где? Сейчас обсудим твою композицию.',help:'Чужой тег поверх работы — повод для ссоры. Зак подходит к граффитчику…'},
  fight:{step:3,title:'Разговор в облаке',who:'ЗАК',line:'Аргументы закончились. Началась физкультура.',help:'Из облака пыли летят звёздочки. Спор за стену явно вышел за рамку рисунка.'},
  recovery:{step:3,title:'Знакомый потолок',who:'ЗАК',line:'Так. Это моя квартира. Значит, художественную дискуссию я проиграл.',help:'Зак пришёл в себя дома. Стена осталась на улице — пора выйти и посмотреть, что с ней.',button:'СНОВА НА УЛИЦУ'},
  return_wall:{step:4,title:'У стены новый зритель',who:'ЗАК',line:'Только не говорите, что этот с валиком тоже из творческой тусовки.',help:'Вернись к стене. Там уже стоит мужчина с ведром белой краски.',button:'К СТЕНЕ'},
  cleaner:{step:4,title:'Самая короткая выставка',who:'РАБОЧИЙ',line:'У меня тоже стиль. Называется «два слоя белого».',help:'Мужчина закрашивает стену белой краской. Твоя работа и чужой тег исчезают под валиком.'},
  cleaner_done:{step:4,title:'Чистый лист. Опять.',who:'ЗАК',line:'Вот это продуктивность. За минуту отменил две карьеры.',help:'Закрашенная стена снова доступна. Вернись к ней и нарисуй заново. Сохранённый дома прогресс не пропадает из-за чужой краски.',button:'ВЕРНУТЬ СВОЮ РАБОТУ'},
  repaint:{step:4,title:'Стена снова твоя',who:'ЗАК',line:'Ладно. Второй заход. Белому тоже нужен достойный соперник.',help:'Подойди к стене и повтори рисование. Теперь ты знаешь все три действия с баллоном.',button:'К СТЕНЕ'},
  cop:{step:5,title:'Зритель в форме',who:'ПОЛИЦЕЙСКИЙ',line:'Гражданин художник, автограф оставите в объяснительной.',help:'Рисование повышает HEAT — уровень розыска. Патруль заметил Зака. Дом рядом: доберись до двери и войди.',button:'ПОРА ДОМОЙ'},
  escape:{step:5,title:'Ноги — тоже инструмент',who:'ЗАК',line:'Выставка закрывается по техническим причинам. Технические причины догоняют.',help:'Уходи от полицейского к дому. Нажми «Домой» для маршрута, у двери — «Войти». В доме розыск исчезнет.',button:'ДОМОЙ'},
  caught:{step:5,title:'Первое предупреждение',who:'ПОЛИЦЕЙСКИЙ',line:'Для первого раза — лекция. В следующий раз будет длиннее и с протоколом.',help:'В обучении можно попробовать ещё раз без потерь. Держи дистанцию и возвращайся к двери дома.',button:'ПОПРОБОВАТЬ ЕЩЁ'},
  complete:{step:6,title:'Первый след оставлен',who:'ЗАК',line:'Стена пережила троих. Я — тоже. Для первого дня вполне прилично.',help:'Первый урок завершён: +100 REP. В телефоне, во вкладке «Обучение», открыт урок «Тише улицы». Можно поспать до утра и увидеть зрителей своих работ.',button:'НА УЛИЦУ'},
  free:{step:6,title:'Твой маленький район',who:'ЗАК',line:'Ночью — краска. Днём — признание. Неплохой график.',help:'Гуляй, украшай фасад ночью, наблюдай за прохожими днём. В кровати можно проспать до следующей части суток.',button:'ДОМОЙ'}
};

export class TutorialFlow{
  constructor(session,resume=true){
    this.s=session;this.stage='home';this.age=0;this.actor=null;this.coating=0;this.tag=0;this.wall='blank';
    if(session.save.campaign.tutorialFacadePainted){session.painted.add(TUTORIAL_FACADE);session.world.targets[1].state='PAINTED';}
    if(!resume)return;
    const saved=session.save.campaign?.tutorialCheckpoint;
    if(saved==='walk'){this.stage='walk';session.mode='district';}
    // Resume at an actionable milestone, never midway through an NPC animation.
    if(['first_done','rival_done','recovery','return_wall'].includes(saved)){
      this.wall='own';this.tag=saved==='first_done'?0:1;this.stage=saved;
      if(saved!=='recovery'){session.mode='district';Object.assign(session.player,{x:440,y:340});}
      if(saved==='first_done'){session.painted.add(TUTORIAL_WALL);session.runRep=50;}
      if(saved==='rival_done')this.actor={x:514,y:302,sprite:'citizen_3_0',path:[],moving:false};
      if(saved==='return_wall')this.placeCleaner();
    }
    if(saved==='repaint'){this.stage='repaint';this.coating=1;this.wall='blank';session.world.targets[0].heat_reward=1;session.mode='district';Object.assign(session.player,{x:360,y:354});}
    if(saved==='escape'){this.wall='own';session.mode='district';this.prepareEscape();}
    if(saved==='complete'){this.stage='complete';this.wall='own';session.painted.add(TUTORIAL_WALL);session.world.targets[0].state='PAINTED';}
    if(session.save.campaign.tutorialAtHome){session.mode='hideout';this.homeReturnStage=this.stage;}
  }
  get lesson(){
    if(this.s.life?.tour)return this.s.life.tourLesson();
    if(this.s.mode==='hideout'&&!['home','recovery','complete'].includes(this.stage))return {...LESSONS.free,title:'Дома можно выдохнуть',button:'НА УЛИЦУ'};
    if(this.s.life&&!this.s.life.night&&!this.scripted&&this.s.mode==='district')return {...LESSONS.free,title:'Город проснулся',help:'Днём рисование недоступно. Прохожие фотографируются у готовых работ и оставляют деньги. Подойди к двери дома и поспи до ночи.',button:'ДОМОЙ'};
    return LESSONS[this.stage];
  }
  get scripted(){return ['first_done','rival','rival_done','fight','cleaner','cleaner_done','cop','caught'].includes(this.stage);}
  set(stage,checkpoint){this.stage=stage;this.age=0;this.s.player.path=[];this.s.waypoint=null;if(checkpoint){this.s.save.campaign.tutorialCheckpoint=checkpoint;this.s.persist();}}
  leave(){
    if(this.s.life?.tour||this.s.life?.sleeping)return;
    if(this.homeReturnStage){this.stage=this.homeReturnStage;this.homeReturnStage=null;this.s.mode='district';Object.assign(this.s.player,this.s.world.spawn);this.s.save.campaign.tutorialAtHome=false;this.s.persist();return;}
    if(this.stage==='complete'||this.stage==='free'){this.stage='free';this.s.mode='district';this.s.save.campaign.tutorialAtHome=false;this.s.persist();return;}
    const returning=this.stage==='recovery';
    this.s.mode='district';Object.assign(this.s.player,this.s.world.spawn,{path:[],moving:false,state:'IDLE'});this.s.camera.ready=false;
    if(returning){this.placeCleaner();this.set('return_wall','return_wall');}
    else this.set('walk','walk');
  }
  allowedTarget(target=this.s.world.targets[0]){
    if(this.s.life&&!this.s.life.night)return false;
    if(target.wall_id===TUTORIAL_FACADE)return !this.s.painted.has(TUTORIAL_FACADE)&&['walk','paint','return_wall','repaint','free'].includes(this.stage);
    return target.wall_id===TUTORIAL_WALL&&['paint','repaint'].includes(this.stage);
  }
  act(){
    const s=this.s;
    if(s.life?.sleeping)return;
    if(s.life?.tour)return s.life.nextIntro();
    if(s.mode==='hideout')return this.leave();
    if(s.life&&!s.life.night||this.stage==='free'){s.routeTo(s.world.hideout,'Дом / поспать');return;}
    if(this.stage==='home'||this.stage==='recovery')return this.leave();
    if(['walk','repaint','return_wall'].includes(this.stage)){s.routeTo(s.world.targets[0].approach,'Первая стена');return;}
    if(this.stage==='paint'){s.near={type:'target',item:s.world.targets[0]};s.interact();return;}
    if(this.stage==='first_done')return this.beginActor('rival','citizen_3_0');
    if(this.stage==='cleaner_done'){this.actor=null;s.world.targets[0].heat_reward=1;this.set('repaint','repaint');return;}
    if(this.stage==='cop'||this.stage==='caught')return this.prepareEscape();
    if(this.stage==='escape')s.routeTo(s.world.hideout,'Дом / сохранить');
  }
  beginActor(stage,sprite){
    this.actor={...this.s.world.tutorialEntry,sprite,path:this.s.nav.path(this.s.world.tutorialEntry,{x:514,y:302}),moving:false};this.set(stage);
  }
  placeCleaner(){this.actor={x:514,y:302,sprite:'citizen_2_0',path:[],moving:false};}
  beginFight(){
    this.set('fight');this.fightBurst=0;
    this.s.player.path=this.s.nav.path(this.s.player,{x:this.actor.x-22,y:this.actor.y+20});
  }
  recoverAtHome(){
    const s=this.s;s.mode='hideout';s.heat=0;s.runRep=0;s.near=null;this.actor=null;
    Object.assign(s.player,s.world.spawn,{path:[],moving:false,state:'IDLE'});
    s.room.action='idle';s.room.remaining=0;this.set('recovery','recovery');s.emit('mode');
  }
  painted(target=this.s.graffiti?.target){
    if(target?.wall_id===TUTORIAL_FACADE){
      const s=this.s;s.graffiti=null;s.mode='district';s.player.state='IDLE';s.near=null;
      s.painted.add(TUTORIAL_FACADE);target.state='PAINTED';s.save.campaign.tutorialFacadePainted=true;s.persist();
      s.notice('Теперь и дом с характером. Рисунок на фасаде сохранён.');s.emit('mode');return;
    }
    this.s.graffiti=null;this.s.mode='district';this.s.player.state='IDLE';this.wall='own';this.tag=0;this.coating=0;
    this.s.painted.add(TUTORIAL_WALL);this.s.world.targets[0].state='PAINTED';this.s.runRep=50;
    if(this.stage==='repaint'){this.actor={...this.s.world.tutorialEntry,sprite:'officer',path:[]};this.s.heat=1;this.set('cop','escape');}
    else this.set('first_done','first_done');
  }
  prepareEscape(){
    const s=this.s;s.mode='district';s.heat=1;s.near=null;
    Object.assign(s.player,{x:492,y:310,path:[],moving:false,state:'IDLE'});
    this.actor={...s.world.tutorialEntry,sprite:'officer',path:[],moving:false,repath:0};this.set('escape','escape');
  }
  goHome(){
    if(this.stage!=='escape'){
      if(this.scripted)return;
      this.homeReturnStage=this.stage;this.s.mode='hideout';this.s.near=null;this.s.save.campaign.tutorialAtHome=true;this.s.persist();this.s.emit('mode');return;
    }
    const s=this.s,first=!s.save.campaign.tutorialComplete;
    s.save.campaign.tutorialComplete=true;s.save.campaign.tutorialCheckpoint='complete';
    if(first)s.save.rep+=100;
    s.persist();s.heat=0;s.runRep=0;s.mode='hideout';this.actor=null;this.set('complete');s.emit('mode');
  }
  update(dt){
    this.age+=dt;const s=this.s;
    if(s.mode!=='district')return;
    if(this.stage==='walk'&&s.life?.night&&distance(s.player,s.world.targets[0].approach)<60)this.set('paint');
    if(this.stage==='return_wall'&&distance(s.player,s.world.targets[0].approach)<95)this.set('cleaner');
    if(this.stage==='rival_done'&&this.age>=2.2)this.beginFight();
    if(this.stage==='fight'){
      moveAlongPath(s.player,s.player.path,120,dt);
      if(!s.player.path.length){this.fightBurst+=dt;if(this.fightBurst>=3.6)this.recoverAtHome();}
      return;
    }
    if(['rival','cleaner'].includes(this.stage)){
      moveAlongPath(this.actor,this.actor.path,86,dt);
      if(this.actor.path.length)return;
      if(this.stage==='rival')this.tag=Math.min(1,this.tag+dt/2.4);
      else this.coating=Math.min(1,this.coating+dt/3);
      if(this.tag===1&&this.stage==='rival')this.set('rival_done','rival_done');
      if(this.coating===1&&this.stage==='cleaner'){
        this.wall='blank';s.painted.delete(TUTORIAL_WALL);s.world.targets[0].state='CLEAN';s.runRep=0;this.set('cleaner_done','repaint');
      }
    }
    if(this.stage==='escape'&&this.age>2){
      this.actor.repath-=dt;if(this.actor.repath<=0){this.actor.path=s.nav.path(this.actor,s.player);this.actor.repath=.4;}
      moveAlongPath(this.actor,this.actor.path,94,dt);
      if(distance(this.actor,s.player)<24){s.player.path=[];this.set('caught');}
    }
  }
}
