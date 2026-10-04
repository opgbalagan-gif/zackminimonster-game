import {uiIcon,setUIButton,applyUIComponents} from './core__ui-kit.js?v=97af9e9c19c3';
export class TutorialUI{
  constructor(session,onComplete){
    this.s=session;this.signature='';this.panel=document.createElement('section');this.panel.id='tutorial-panel';this.panel.className='tutorial-hint';this.panel.setAttribute('aria-label','Обучение');
    this.panel.innerHTML='<div class="lesson-copy" aria-live="polite" aria-atomic="true"><div class="lesson-kicker"></div><h2></h2><p class="lesson-help"></p></div><button class="primary"></button>';
    document.getElementById('app').append(this.panel);
    this.panel.querySelector('button').onclick=()=>{session.tutorial.act();this.sync();};
    this.markers=document.createElement('div');this.markers.id='tutorial-markers';document.getElementById('app').append(this.markers);
    this.status=document.createElement('div');this.status.id='street-status';this.status.setAttribute('aria-label','Время и деньги');document.getElementById('app').append(this.status);
    this.status.innerHTML='<span class="street-time"></span><span class="street-money"></span><span class="street-fame"></span>';
    for(const [id,label,icon] of [['home','Твой дом','home'],['wall','Первая стена','spray'],['facade','Рисовать на доме','spray']]){
      const b=document.createElement('button');b.className='world-marker';b.dataset.marker=id;b.setAttribute('aria-label',label);b.title=label;b.innerHTML=uiIcon(icon);
      b.onclick=()=>{if(session.tutorial.scripted)return;if(id==='facade')session.routeTo(session.world.targets[1].approach,label);else if(id==='wall')session.routeTo(session.world.targets[0].approach,label);else session.routeTo(session.world.hideout,label);};this.markers.append(b);
    }
    for(const bin of session.world.bins??[]){const b=document.createElement('button');b.className='world-marker';b.dataset.marker=bin.id;b.setAttribute('aria-label',bin.name+' · укрытие');b.innerHTML=uiIcon('bin');b.onclick=()=>session.routeTo(bin.approach,'Бак / спрятаться');this.markers.append(b);}
    for(const npc of session.world.streetNpcs??[]){const b=document.createElement('button');b.className='world-marker';b.dataset.marker=npc.id;b.setAttribute('aria-label',npc.name+' · подойти поговорить');b.innerHTML=uiIcon('talk');b.onclick=()=>session.routeTo(npc.approach,npc.name);this.markers.append(b);}
    if(session.world.sandbox)for(const [id,label,icon,point] of [['court','Баскетбольная площадка','ball',session.court],['station','Станция наземного метро','metro',session.world.surfaceMetro.approach]]){const b=document.createElement('button');b.className='world-marker';b.dataset.marker=id;b.setAttribute('aria-label',label);b.innerHTML=uiIcon(icon);b.onclick=()=>session.routeTo(point,label);this.markers.append(b);}
    for(const target of session.world.targets.slice(2)){const b=document.createElement('button');b.className='world-marker';b.dataset.marker=target.wall_id;b.setAttribute('aria-label',target.name);b.innerHTML=uiIcon('spray');b.onclick=()=>session.routeTo(target.approach,target.name);this.markers.append(b);}
    this.paintTargets=new Map(session.world.targets.map((target,i)=>[i===0?'wall':i===1?'facade':target.wall_id,target]));
    for(const b of this.markers.children){
      if(!this.paintTargets.has(b.dataset.marker))continue;
      b.classList.add('paint-marker');
      const label=document.createElement('span');label.className='paint-marker-label';label.setAttribute('aria-hidden','true');label.textContent='Рисовать';b.append(label);
      b.setAttribute('aria-label','Место для граффити · '+this.paintTargets.get(b.dataset.marker).name);
    }
  }
  updateWorldMarkers(renderer){
    const s=this.s,canvas=document.getElementById('game'),rect=canvas.getBoundingClientRect();this.markers.hidden=s.mode!=='district';
    let nearest=null,nearestDistance=180;
    for(const [id,t] of this.paintTargets){const d=Math.hypot(t.approach.x-s.player.x,t.approach.y-s.player.y);if(d<nearestDistance){nearest=id;nearestDistance=d;}}
    for(const b of this.markers.children){const p=renderer.markerHits?.find(p=>p.id===b.dataset.marker);b.hidden=!p||p.x<0||p.x>canvas.width||p.y<0||p.y>canvas.height;if(b.hidden)continue;b.style.left=p.x*rect.width/canvas.width+'px';b.style.top=p.y*rect.height/canvas.height+'px';b.dataset.active=String(b.dataset.marker==='home'?s.tutorial.stage==='escape':['walk','paint','return_wall','repaint'].includes(s.tutorial.stage));
      if(this.paintTargets.has(b.dataset.marker)){b.dataset.near=String(b.dataset.marker===nearest);const text=s.life.night?'Рисовать':'Рисовать ночью',label=b.querySelector('.paint-marker-label');if(label.textContent!==text)label.textContent=text;b.title=text+' · '+this.paintTargets.get(b.dataset.marker).name;}
    }
  }
  sync(){
    const s=this.s,t=s.tutorial,l=t.lesson;this.panel.hidden=s.world.sandbox||['graffiti','phone'].includes(s.mode)||(s.mode==='hideout'&&document.getElementById('hideout-ui').dataset.tab!=='home');
    const app=document.getElementById('app');app.dataset.lessonVisible=String(!this.panel.hidden);app.dataset.homeIntro=String(!!s.life?.tour);app.dataset.period=s.life?.state.period??'night';
    app.dataset.sandbox=String(!!s.world.sandbox);
    app.dataset.phone=String(s.mode==='phone');
    this.status.hidden=!!s.life?.tour;
    this.status.querySelector('.street-time').textContent=(s.life?.night?'Ночь ':'День ')+(s.life?.state.day??1);
    this.status.querySelector('.street-money').textContent=s.save.money.toLocaleString('ru-RU')+' ₽';
    this.status.querySelector('.street-fame').textContent=s.life.fame.name;
    this.status.title='Узнаваемость: '+s.life.fame.score+(s.life.fame.next?' / '+s.life.fame.next:' · максимальная ступень')+'. Новые работы, снимки разных работ и встречи со зрителями.';
    document.getElementById('chapter-button').hidden=!!s.life?.tour;
    document.getElementById('app').dataset.tutorial='true';
    document.querySelector('.control-hint').textContent='WASD / стрелки для ходьбы, E для действия';
    document.getElementById('hideout-ui').hidden=s.mode!=='hideout';
    document.getElementById('lesson-meter').value=l.step;
    this.markers.hidden=s.mode!=='district';
    document.getElementById('objective-label').textContent=l.help;
    const number=String(s.world.levelNumber??1).padStart(2,'0');
    document.querySelector('.district-title strong').textContent=s.world.name[0]+s.world.name.slice(1).toLocaleLowerCase('ru');
    document.querySelector('.district-title .eyebrow').textContent='Уровень '+number+(s.world.sandbox?' / Песочница':' / Обучение');
    document.querySelector('#chapter-button strong').textContent=number;
    document.getElementById('home-route').hidden=t.stage!=='escape';
    if(t.scripted)document.getElementById('interaction').hidden=true;
    if(s.near?.type==='target')setUIButton(document.getElementById('action-button'),'РИСОВАТЬ','spray');
    else if(s.near?.type==='hideout')setUIButton(document.getElementById('action-button'),'ВОЙТИ','home');
    else if(s.near?.type==='bin')setUIButton(document.getElementById('action-button'),'СПРЯТАТЬСЯ','bin');
    else if(s.near?.type==='npc')setUIButton(document.getElementById('action-button'),'ПОГОВОРИТЬ','talk');
    else if(s.near?.type==='court')setUIButton(document.getElementById('action-button'),'БАСКЕТБОЛ','ball');
    const signature=JSON.stringify([t.stage,l,s.mode,s.life?.sleeping>0]);if(this.signature===signature)return;this.signature=signature;
    const count=s.life?.tour?7:6,step=s.life?.tour?s.life.introStep+1:l.step;
    this.panel.querySelector('.lesson-kicker').textContent=(s.life?.tour?'ДОМА':'ПЕРВЫЕ ШАГИ')+' · '+step+' / '+count;
    this.panel.querySelector('h2').textContent=l.title;
    this.panel.querySelector('.lesson-help').textContent=l.help;
    const button=this.panel.querySelector('button');button.hidden=!l.button;setUIButton(button,l.button??'',t.stage==='paint'?'spray':['home','recovery','escape'].includes(t.stage)?'home':'');
    button.disabled=!!s.life?.sleeping;
    this.panel.dataset.stage=t.stage;
    applyUIComponents(this.panel);
  }
}
