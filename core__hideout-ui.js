import {OUTFITS,INKS,TROPHIES,outfit,ink,heroSprite,roomLayout,ROOM_POINTS,ROOM_REGIONS,wallCount} from './core__hideout.js?v=97af9e9c19c3';
import {homeIcon} from './core__home-icons.js?v=97af9e9c19c3';
import {drawBall} from './core__ball-art.js?v=97af9e9c19c3';
const $=id=>document.getElementById(id);
export class HideoutUI{
  constructor(session,renderer,onChange,audio){
    this.s=session;this.renderer=renderer;this.onChange=onChange;this.tab='home';this.signature='';
    session.room.camera??={x:0,y:0};
    delete session.room.camera.overview;
    const canvas=$('game');
    const hint=document.createElement('span');hint.id='room-pan-hint';hint.textContent='Нажми на предмет · потяни, чтобы осмотреться';$('hideout-ui').append(hint);
    let pan=null;
    canvas.addEventListener('pointerdown',e=>{
      if(e.button!==0||session.mode!=='hideout'||this.tab!=='home')return;
      e.preventDefault();canvas.setPointerCapture(e.pointerId);
      const r=roomLayout(canvas.width,canvas.height,false,session.room.camera);
      pan={id:e.pointerId,x:e.clientX,y:e.clientY,rx:r.x,ry:r.y,w:r.w,h:r.h};
    });
    canvas.addEventListener('pointermove',e=>{
      if(!pan||pan.id!==e.pointerId||session.mode!=='hideout')return;
      const rect=canvas.getBoundingClientRect(),x=pan.rx+(e.clientX-pan.x)*canvas.width/rect.width,y=pan.ry+(e.clientY-pan.y)*canvas.height/rect.height;
      session.room.camera.x=Math.max(canvas.width-pan.w,Math.min(0,x))-(canvas.width-pan.w)/2;
      session.room.camera.y=Math.max(canvas.height-pan.h,Math.min(0,y))-(canvas.height-pan.h)/2;
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>{pan=null;});
    for(const el of document.querySelectorAll('.home-dock button,.room-hotspot')){
      const icon=el.querySelector('i');if(icon)icon.innerHTML=homeIcon(el.dataset.homeTab??el.dataset.roomAction??'exit');
      const region=ROOM_REGIONS[el.dataset.hotspot];
      if(region){const xs=region.map(p=>p[0]),ys=region.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;el.classList.add('object-hotspot');el.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" aria-hidden="true"><polygon points="'+region.map(p=>(p[0]-x)+','+(p[1]-y)).join(' ')+'"/></svg><span>'+el.querySelector('span').textContent+'</span>';el.roomBounds={x,y,w,h};}
      el.addEventListener('click',()=>el.animate([{filter:'brightness(2) drop-shadow(0 0 10px #ffe195)',scale:'.84'},{filter:'brightness(1)',scale:'1'}],{duration:420,easing:'ease-out'}));
    }
    for(const el of document.querySelectorAll('[data-home-tab]'))el.onclick=()=>this.open(el.dataset.homeTab);
    this.audio=audio;
    for(const el of document.querySelectorAll('[data-room-action]'))el.onclick=()=>{
      if(el.dataset.roomAction==='music')audio.radio.toggle();else session.roomAction(el.dataset.roomAction);
      onChange();
    };
    $('home-panel-close').onclick=()=>this.open('home');
    const tabs=document.createElement('nav');tabs.className='studio-tabs';tabs.setAttribute('aria-label','Твои вещи');
    for(const [id,label] of [['wardrobe','Одежда'],['sprays','Краски'],['collection','Трофеи']]){const button=document.createElement('button');button.textContent=label;button.dataset.studioTab=id;button.onclick=()=>this.open(id);tabs.append(button);}
    document.querySelector('.hideout-panel-heading').after(tabs);
    $('hideout-panel').addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.open('home');return;}
      if(e.key==='Tab'){const items=[...$('hideout-panel').querySelectorAll('button:not(:disabled)')].filter(b=>b.getClientRects().length);const i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?-1:1)+items.length)%items.length]?.focus();}
      if(['ArrowLeft','ArrowRight'].includes(e.key)&&e.target.matches('.loadout-card')){const cards=[...e.target.parentNode.querySelectorAll('button:not(:disabled)')],i=cards.indexOf(e.target);e.preventDefault();cards[(i+(e.key==='ArrowRight'?1:-1)+cards.length)%cards.length]?.focus();}
    });
    this.populate();this.open('home');
  }
  open(tab){
    if(tab!=='home'&&this.s.life&&!this.s.life.iconVisible(tab))return;
    const was=this.tab;this.tab=tab;document.getElementById('hideout-ui').dataset.tab=tab;
    for(const el of document.querySelectorAll('[data-home-pane]'))el.hidden=el.dataset.homePane!==tab;
    for(const el of document.querySelectorAll('.home-dock [data-home-tab]')){el.classList.toggle('active',el.dataset.homeTab===tab);el.setAttribute('aria-pressed',el.dataset.homeTab===tab);}
    $('home-panel-title').textContent={home:'Твоя территория',wardrobe:'ТВОЙ СТИЛЬ',sprays:'ЦВЕТ УЛИЦЫ',collection:'ТВОЯ КОЛЛЕКЦИЯ'}[tab];
    $('home-panel-kicker').textContent={home:'КВАРТИРА',wardrobe:'ГАРДЕРОБ / ЗАК',sprays:'КРАСКА / 400 МЛ',collection:'КОЛЛЕКЦИЯ'}[tab];
    for(const b of document.querySelectorAll('[data-studio-tab]')){b.setAttribute('aria-pressed',String(b.dataset.studioTab===tab));b.hidden=!!this.s.life&&!this.s.life.iconVisible(b.dataset.studioTab);}
    this.sync();
    if(tab!==was){if(tab==='home')document.querySelector('[data-hotspot="'+was+'"]')?.focus({preventScroll:true});else requestAnimationFrame(()=>$('hideout-panel').querySelector('[data-studio-tab="'+tab+'"]')?.focus({preventScroll:true}));}
  }
  populate(){
    const create=(parent,item,kind)=>{
      const button=document.createElement('button');button.className='loadout-card';button.dataset.kind=kind;button.dataset.id=item.id;
      const art=document.createElement('canvas');art.width=200;art.height=220;art.setAttribute('aria-hidden','true');
      const text=document.createElement('span'),name=document.createElement('strong'),detail=document.createElement('small'),status=document.createElement('b');
      name.textContent=item.name;detail.textContent=item.detail??'400 ML · '+item.name;status.className='card-status';
      text.append(name,detail,status);button.append(art,text);
      button.onclick=()=>{if(this.s.prepare(kind,item.id)){this.signature='';this.onChange();this.sync();}};
      $(parent).append(button);
      const c=art.getContext('2d');c.scale(2,2);c.imageSmoothingEnabled=false;
      if(kind==='outfit')this.renderer.atlas.draw(c,heroSprite(item.id),50,105,null,98);
      else if(kind==='display')this.renderer.drawTrophy(c,item.id,50,88,60);
      else{
        c.fillStyle=item.color;c.beginPath();c.ellipse(50,91,33,9,0,0,Math.PI*2);c.fill();
        c.imageSmoothingEnabled=true;this.renderer.atlas.draw(c,'can_threequarter',50,94,null,86);
        c.fillStyle=item.color;c.strokeStyle='#172f3c';c.lineWidth=1.5;c.beginPath();c.arc(76,85,10,0,Math.PI*2);c.fill();c.stroke();
      }
    };
    for(const item of OUTFITS)create('outfit-list',item,'outfit');
    for(const item of INKS)create('ink-list',item,'ink');
    for(const item of TROPHIES)if(item.id!=='mini'||(!this.s.world.tutorial&&this.s.save.campaign?.companionUnlocked!==false))create('trophy-list',item,'display');
    const trophy=document.createElement('div');trophy.id='court-trophy';trophy.className='court-trophy';trophy.hidden=true;
    trophy.innerHTML='<canvas width="160" height="160" aria-label="Твой расписанный мяч"></canvas><div><strong>COURT CUSTOM</strong><p>Мяч с твоим рисунком.<br>Подарок от Дэна и Ти.</p></div>';$('trophy-list').append(trophy);
  }
  sync(){
    const s=this.s,canvas=$('game'),rect=canvas.getBoundingClientRect(),r=roomLayout(canvas.width,canvas.height,s.world.tutorial&&!s.world.sandbox,s.room.camera);
    $('room-pan-hint').hidden=this.tab!=='home';
    document.querySelector('[data-room-action="pet"]').hidden=s.world.tutorial||s.save.campaign?.companionUnlocked===false;
    document.querySelector('.home-status>strong').textContent=s.save.campaign?.companionUnlocked===false?'ZACK / ДОМА':'ZACK + MINI';
    for(const el of document.querySelectorAll('[data-hotspot]')){
      if(s.life){el.hidden=!s.life.iconVisible(el.dataset.hotspot);el.classList.toggle('new-room-icon',s.life.tour&&({rest:1,wardrobe:2,sprays:3,collection:4,save:5,music:6}[el.dataset.hotspot]===s.life.introStep));}
      const p=ROOM_POINTS[el.dataset.hotspot];el.style.left=((r.x+p.x*r.w)*rect.width/canvas.width)+'px';el.style.top=((r.y+p.y*r.h)*rect.height/canvas.height)+'px';
      if(el.roomBounds){const b=el.roomBounds;el.style.left=(r.x+b.x/1024*r.w)*rect.width/canvas.width+'px';el.style.top=(r.y+b.y/1536*r.h)*rect.height/canvas.height+'px';el.style.width=b.w/1024*r.w*rect.width/canvas.width+'px';el.style.height=b.h/1536*r.h*rect.height/canvas.height+'px';}
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
      const inShop=kind==='ink'&&['pink','lime','blue'].includes(id)&&!s.save.paintShop?.owned.includes(id),locked=inShop||walls<(item.walls??0),chosen=id===(kind==='outfit'?s.save.player.skin:kind==='ink'?s.save.player.ink:s.save.hideout.display);
      el.disabled=locked;el.classList.toggle('equipped',chosen);el.setAttribute('aria-pressed',chosen);
      el.querySelector('.card-status').textContent=inShop?'В МАГАЗИНЕ COLOR LAB':locked?'ЕЩЁ '+wallCount(item.walls-walls).toUpperCase():chosen?'✓ '+(kind==='outfit'?'НАДЕТО':kind==='ink'?'В РЮКЗАКЕ':'НА СТОЛИКЕ'):'ВЫБРАТЬ';
    }
    $('equipped-outfit').textContent=outfit(s.save.player.skin).name;$('equipped-ink').textContent=ink(s.save.player.ink).name;
    const next=TROPHIES.find(t=>t.walls>walls);$('next-unlock').textContent=next?'ДАЛЬШЕ: '+next.name+' · ещё '+wallCount(next.walls-walls):'Все трофеи района собраны.';
    const p=$('home-tag-preview'),c=p.getContext('2d');c.clearRect(0,0,p.width,p.height);this.renderer.drawGraffiti(c,'zack_tag',0,0,p.width,p.height,ink(s.save.player.ink).color);
  }
}
