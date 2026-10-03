import {OUTFITS,INKS,TROPHIES,outfit,ink,heroSprite,roomLayout,ROOM_POINTS,wallCount} from './core__hideout.js?v=0eb11640c641';
import {homeIcon} from './core__home-icons.js?v=0eb11640c641';
import {drawBall} from './core__ball-art.js?v=0eb11640c641';
const $=id=>document.getElementById(id);
export class HideoutUI{
  constructor(session,renderer,onChange,audio){
    this.s=session;this.renderer=renderer;this.onChange=onChange;this.tab='home';this.signature='';
    for(const el of document.querySelectorAll('.home-dock button,.room-hotspot')){
      const icon=el.querySelector('i');if(icon)icon.innerHTML=homeIcon(el.dataset.homeTab??el.dataset.roomAction??'exit');
    }
    for(const el of document.querySelectorAll('[data-home-tab]'))el.onclick=()=>this.open(el.dataset.homeTab);
    this.audio=audio;
    for(const el of document.querySelectorAll('[data-room-action]'))el.onclick=()=>{
      if(el.dataset.roomAction==='music')audio.radio.toggle();else session.roomAction(el.dataset.roomAction);
      onChange();
    };
    $('home-panel-close').onclick=()=>this.open('home');
    this.populate();this.open('home');
  }
  open(tab){
    if(tab!=='home'&&this.s.life&&!this.s.life.iconVisible(tab))return;
    this.tab=tab;document.getElementById('hideout-ui').dataset.tab=tab;
    for(const el of document.querySelectorAll('[data-home-pane]'))el.hidden=el.dataset.homePane!==tab;
    for(const el of document.querySelectorAll('.home-dock [data-home-tab]')){el.classList.toggle('active',el.dataset.homeTab===tab);el.setAttribute('aria-pressed',el.dataset.homeTab===tab);}
    $('home-panel-title').textContent={home:'Твоя территория',wardrobe:'ТВОЙ СТИЛЬ',sprays:'ЦВЕТ УЛИЦЫ',collection:'ТВОЯ КОЛЛЕКЦИЯ'}[tab];
    $('home-panel-kicker').textContent={home:'КВАРТИРА',wardrobe:'ГАРДЕРОБ / ЗАК',sprays:'КРАСКА / 400 МЛ',collection:'КОЛЛЕКЦИЯ'}[tab];
    this.sync();
  }
  populate(){
    const create=(parent,item,kind)=>{
      const button=document.createElement('button');button.className='loadout-card';button.dataset.kind=kind;button.dataset.id=item.id;
      const art=document.createElement('canvas');art.width=100;art.height=110;art.setAttribute('aria-hidden','true');
      const text=document.createElement('span'),name=document.createElement('strong'),detail=document.createElement('small'),status=document.createElement('b');
      name.textContent=item.name;detail.textContent=item.detail??'400 ML · '+item.name;status.className='card-status';
      text.append(name,detail,status);button.append(art,text);
      button.onclick=()=>{if(this.s.prepare(kind,item.id)){this.signature='';this.onChange();this.sync();}};
      $(parent).append(button);
      const c=art.getContext('2d');c.imageSmoothingEnabled=false;
      if(kind==='outfit')this.renderer.atlas.draw(c,heroSprite(item.id),50,105,null,98);
      else if(kind==='display')this.renderer.drawTrophy(c,item.id,50,88,60);
      else{
        c.fillStyle='#0b1018';c.fillRect(29,22,42,75);c.fillStyle='#d7d2c2';c.fillRect(32,25,36,69);c.fillStyle=item.color;c.fillRect(33,46,34,34);
        c.fillStyle='#141923';c.fillRect(35,17,30,10);c.fillStyle=item.color;c.fillRect(45,9,10,10);c.font='bold 12px monospace';c.fillStyle='#141923';c.textAlign='center';c.fillText('ZACK',50,68);
      }
    };
    for(const item of OUTFITS)create('outfit-list',item,'outfit');
    for(const item of INKS)create('ink-list',item,'ink');
    for(const item of TROPHIES)if(item.id!=='mini'||(!this.s.world.tutorial&&this.s.save.campaign?.companionUnlocked!==false))create('trophy-list',item,'display');
    const trophy=document.createElement('div');trophy.id='court-trophy';trophy.className='court-trophy';trophy.hidden=true;
    trophy.innerHTML='<canvas width="160" height="160" aria-label="Твой расписанный мяч"></canvas><div><strong>COURT CUSTOM</strong><p>Мяч с твоим рисунком.<br>Подарок от Дэна и Ти.</p></div>';$('trophy-list').append(trophy);
  }
  sync(){
    const s=this.s,canvas=$('game'),rect=canvas.getBoundingClientRect(),r=roomLayout(canvas.width,canvas.height,s.world.tutorial);
    document.querySelector('[data-room-action="pet"]').hidden=s.world.tutorial||s.save.campaign?.companionUnlocked===false;
    document.querySelector('.home-status>strong').textContent=s.save.campaign?.companionUnlocked===false?'ZACK / ДОМА':'ZACK + MINI';
    for(const el of document.querySelectorAll('[data-hotspot]')){
      if(s.life){el.hidden=!s.life.iconVisible(el.dataset.hotspot);el.classList.toggle('new-room-icon',s.life.tour&&({rest:1,wardrobe:2,sprays:3,collection:4,save:5,music:6}[el.dataset.hotspot]===s.life.introStep));}
      const p=ROOM_POINTS[el.dataset.hotspot];el.style.left=((r.x+p.x*r.w)*rect.width/canvas.width)+'px';el.style.top=((r.y+p.y*r.h)*rect.height/canvas.height)+'px';
    }
    if(s.life){const rest=document.querySelector('[data-room-action="rest"]');rest.setAttribute('aria-label',s.life.night?'Спать до утра':'Спать до ночи');rest.disabled=!!s.life.sleeping;}
    $('home-status-text').textContent=s.room.action==='rest'?'Пять минут тишины…':s.room.action==='pet'?'MINI рад тебя видеть.':s.room.beat?'Наш маленький afterparty.':'Дома. Можно выдохнуть.';
    for(const el of document.querySelectorAll('[data-room-action="music"]')){
      el.setAttribute('aria-pressed',String(this.audio.radio.wanted));
      el.setAttribute('aria-label',this.audio.radio.wanted?'Выключить радио':'Включить хип-хоп радио');
    }
    const signature=JSON.stringify([s.save.player,s.save.hideout,s.save.painted_walls.length,s.save.basketball]);
    if(signature===this.signature)return;this.signature=signature;
    $('court-trophy').hidden=!s.save.basketball.completed;
    if(s.save.basketball.completed){const ball=$('court-trophy').querySelector('canvas'),bc=ball.getContext('2d');bc.clearRect(0,0,160,160);drawBall(bc,s.save.basketball,160,{atlas:this.renderer.atlas});}
    const walls=s.save.painted_walls.length;
    for(const el of document.querySelectorAll('.loadout-card')){
      const kind=el.dataset.kind,id=el.dataset.id,catalog=kind==='outfit'?OUTFITS:kind==='ink'?INKS:TROPHIES,item=catalog.find(x=>x.id===id);
      const locked=walls<(item.walls??0),chosen=id===(kind==='outfit'?s.save.player.skin:kind==='ink'?s.save.player.ink:s.save.hideout.display);
      el.disabled=locked;el.classList.toggle('equipped',chosen);el.setAttribute('aria-pressed',chosen);
      el.querySelector('.card-status').textContent=locked?'ЕЩЁ '+wallCount(item.walls-walls).toUpperCase():chosen?'✓ '+(kind==='outfit'?'НАДЕТО':kind==='ink'?'В РЮКЗАКЕ':'НА СТОЛИКЕ'):'ВЫБРАТЬ';
    }
    $('equipped-outfit').textContent=outfit(s.save.player.skin).name;$('equipped-ink').textContent=ink(s.save.player.ink).name;
    const next=TROPHIES.find(t=>t.walls>walls);$('next-unlock').textContent=next?'ДАЛЬШЕ: '+next.name+' · ещё '+wallCount(next.walls-walls):'Все трофеи района собраны.';
    const p=$('home-tag-preview'),c=p.getContext('2d');c.clearRect(0,0,p.width,p.height);this.renderer.drawGraffiti(c,'zack_tag',0,0,p.width,p.height,ink(s.save.player.ink).color);
  }
}
