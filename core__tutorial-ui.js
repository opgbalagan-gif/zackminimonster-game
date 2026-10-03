import {uiIcon,setUIButton,UIPanel,applyUIComponents} from './core__ui-kit.js?v=391ab0f86039';
export class TutorialUI{
  constructor(session,onComplete){
    this.s=session;this.signature='';this.panel=document.createElement('section');this.panel.id='tutorial-panel';this.panel.className='ui-panel';this.panel.setAttribute('aria-label','Обучение');
    this.panel.innerHTML='<div class="lesson-progress" aria-label="Этапы обучения"></div><div class="lesson-kicker"></div><h2></h2><p class="lesson-line"></p><p class="lesson-help"></p><button class="primary"></button>';
    UIPanel(this.panel);applyUIComponents(this.panel);document.getElementById('app').append(this.panel);
    this.panel.querySelector('button').onclick=()=>{session.tutorial.act();this.sync();};
    this.markers=document.createElement('div');this.markers.id='tutorial-markers';document.getElementById('app').append(this.markers);
    this.status=document.createElement('div');this.status.id='street-status';this.status.setAttribute('aria-label','Время и деньги');document.getElementById('app').append(this.status);
    for(const [id,label,icon] of [['home','Твой дом','home'],['wall','Первая стена','spray'],['facade','Рисовать на доме','spray']]){
      const b=document.createElement('button');b.className='world-marker';b.dataset.marker=id;b.setAttribute('aria-label',label);b.title=label;b.innerHTML=uiIcon(icon);
      b.onclick=()=>{if(session.tutorial.scripted)return;if(id==='facade')session.routeTo(session.world.targets[1].approach,label);else if(id==='wall')session.routeTo(session.world.targets[0].approach,label);else session.routeTo(session.world.hideout,label);};this.markers.append(b);
    }
    for(const bin of session.world.bins??[]){const b=document.createElement('button');b.className='world-marker';b.dataset.marker=bin.id;b.setAttribute('aria-label',bin.name+' · укрытие');b.innerHTML=uiIcon('bin');b.onclick=()=>session.routeTo(bin.approach,'Бак / спрятаться');this.markers.append(b);}
    for(const npc of session.world.streetNpcs??[]){const b=document.createElement('button');b.className='world-marker';b.dataset.marker=npc.id;b.setAttribute('aria-label',npc.name+' · подойти поговорить');b.innerHTML=uiIcon('talk');b.onclick=()=>session.routeTo(npc.approach,npc.name);this.markers.append(b);}
    if(session.world.sandbox)for(const [id,label,icon,point] of [['court','Баскетбольная площадка','ball',session.court],['station','Станция наземного метро','metro',session.world.surfaceMetro.approach]]){const b=document.createElement('button');b.className='world-marker';b.dataset.marker=id;b.setAttribute('aria-label',label);b.innerHTML=uiIcon(icon);b.onclick=()=>session.routeTo(point,label);this.markers.append(b);}
    for(const target of session.world.targets.slice(2)){const b=document.createElement('button');b.className='world-marker';b.dataset.marker=target.wall_id;b.setAttribute('aria-label',target.name);b.innerHTML=uiIcon('spray');b.onclick=()=>session.routeTo(target.approach,target.name);this.markers.append(b);}
  }
  updateWorldMarkers(renderer){
    const s=this.s,canvas=document.getElementById('game'),rect=canvas.getBoundingClientRect();this.markers.hidden=s.mode!=='district';
    for(const b of this.markers.children){const p=renderer.markerHits?.find(p=>p.id===b.dataset.marker);b.hidden=!p||p.x<0||p.x>canvas.width||p.y<0||p.y>canvas.height;if(b.hidden)continue;b.style.left=p.x*rect.width/canvas.width+'px';b.style.top=p.y*rect.height/canvas.height+'px';b.dataset.active=String(b.dataset.marker==='home'?s.tutorial.stage==='escape':['walk','paint','return_wall','repaint'].includes(s.tutorial.stage));}
  }
  sync(){
    const s=this.s,t=s.tutorial,l=t.lesson;this.panel.hidden=s.world.sandbox||['graffiti','phone'].includes(s.mode)||(s.mode==='hideout'&&document.getElementById('hideout-ui').dataset.tab!=='home');
    const app=document.getElementById('app');app.dataset.homeIntro=String(!!s.life?.tour);app.dataset.period=s.life?.state.period??'night';
    app.dataset.sandbox=String(!!s.world.sandbox);
    app.dataset.phone=String(s.mode==='phone');
    this.status.hidden=!!s.life?.tour;this.status.textContent=(s.life?.night?'☾ НОЧЬ':'☀ ДЕНЬ')+' '+(s.life?.state.day??1)+' · '+s.save.money+' ₽ · '+s.life.fame.name;
    this.status.title='Узнаваемость: '+s.life.fame.score+(s.life.fame.next?' / '+s.life.fame.next:' · максимальная ступень')+'. Новые работы, снимки разных работ и встречи со зрителями.';
    document.getElementById('chapter-button').hidden=!!s.life?.tour;
    document.getElementById('app').dataset.tutorial='true';
    document.querySelector('.control-hint').textContent='WASD / стрелки · E действие · клик по земле — маршрут';
    document.getElementById('hideout-ui').hidden=s.mode!=='hideout';
    document.getElementById('lesson-meter').value=l.step;
    this.markers.hidden=s.mode!=='district';
    document.getElementById('objective-label').textContent=l.help;
    const number=String(s.world.levelNumber??1).padStart(2,'0');
    document.querySelector('.district-title strong').textContent=s.world.name;
    document.querySelector('.district-title .eyebrow').textContent='УРОВЕНЬ '+number+(s.world.sandbox?' / ПЕСОЧНИЦА':' / ОБУЧЕНИЕ');
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
    this.panel.querySelector('.lesson-progress').style.gridTemplateColumns='repeat('+count+',1fr)';
    this.panel.querySelector('.lesson-progress').innerHTML=Array.from({length:count},(_,i)=>'<i class="'+(i<step?'active':'')+'"></i>').join('');
    this.panel.querySelector('.lesson-kicker').textContent=s.life?.tour?'ДОМА · '+step+' / 7 · ЗАК':l.step+' / 6 · '+l.who;
    this.panel.querySelector('h2').textContent=l.title;this.panel.querySelector('.lesson-line').textContent='«'+l.line+'»';
    this.panel.querySelector('.lesson-line').hidden=!l.who.startsWith('ЗАК')&&!!t.actor;
    this.panel.querySelector('.lesson-help').textContent=l.help;
    const button=this.panel.querySelector('button');button.hidden=!l.button;setUIButton(button,l.button??'',t.stage==='paint'?'spray':['home','recovery','escape'].includes(t.stage)?'home':'');
    button.disabled=!!s.life?.sleeping;
    this.panel.dataset.stage=t.stage;
    applyUIComponents(this.panel);
  }
}
