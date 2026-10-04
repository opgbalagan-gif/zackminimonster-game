import {drawTeamMark} from './core__team-marks.js?v=97af9e9c19c3';
export class AtlasControls{
  constructor(owner){
    this.owner=owner;this.view={zoom:window.innerWidth<700?1.5:1.15,center:null,filter:'all',atlas:owner.ui.renderer.atlas};this.pointers=new Map();
    const screen=document.getElementById('map-screen'),canvas=document.getElementById('map-canvas'),signal=owner.events.signal;
    screen.querySelector('.atlas-controls')?.remove();this.el=document.createElement('div');this.el.className='atlas-controls';
    this.el.innerHTML='<div class="atlas-score"><span class="zak"><canvas width="100" height="64" data-team="zak" aria-hidden="true"></canvas><b></b></span><i>/</i><span class="rivals"><canvas width="120" height="64" data-team="rival" aria-hidden="true"></canvas><b></b></span></div><nav class="atlas-filters" aria-label="Слой карты"><button data-filter="all" aria-pressed="true">Все</button><button data-filter="paint" aria-pressed="false">Стены</button><button data-filter="people" aria-pressed="false">Люди</button></nav><div class="atlas-zoom"><button data-tool="in" aria-label="Приблизить карту">+</button><button data-tool="out" aria-label="Отдалить карту">−</button><button data-tool="player" aria-label="Найти Зака">◎</button><button data-tool="fit" aria-label="Весь район">⛶</button></div><nav class="atlas-places" aria-label="Места"><button data-place="home" aria-label="Квартира">⌂</button><button data-place="shop" aria-label="Магазин красок">▥</button><button data-place="ball" aria-label="Баскетбол">◉</button><button data-place="metro" aria-label="Метро">M</button></nav><div class="atlas-route"><div><small>ТОЧКА МАРШРУТА</small><strong class="atlas-destination">Выбери место</strong></div><button class="atlas-go" disabled>Маршрут ↗</button></div>';
    screen.append(this.el);for(const logo of this.el.querySelectorAll('[data-team]'))drawTeamMark(logo.getContext('2d'),this.view.atlas,logo.dataset.team,logo.width/2,logo.height/2,logo.width-8);canvas.tabIndex=0;screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label','Карта района');
    document.addEventListener('keydown',e=>{if(!owner.ui.mapOpen||!owner.s.world.sandbox)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();owner.ui.toggleMap(false);owner.mini.focus();}else if(e.key==='Tab'){const items=[...screen.querySelectorAll('button:not(:disabled),canvas[tabindex]')].filter(el=>el.getClientRects().length),at=items.indexOf(document.activeElement);e.preventDefault();e.stopImmediatePropagation();items[(at+(e.shiftKey?-1:1)+items.length)%items.length]?.focus();}},{capture:true,signal});
    const close=document.getElementById('close-map');close.textContent='×';close.setAttribute('aria-label','Закрыть карту');
    for(const button of this.el.querySelectorAll('[data-filter]'))button.onclick=()=>{this.view.filter=button.dataset.filter;for(const b of this.el.querySelectorAll('[data-filter]'))b.setAttribute('aria-pressed',String(b===button));owner.drawMap();};
    for(const button of this.el.querySelectorAll('[data-tool]'))button.onclick=()=>{
      const tool=button.dataset.tool;
      if(tool==='fit'){this.view.center=null;this.view.zoom=1;}
      else if(tool==='player'){this.view.center={x:owner.s.player.x,y:owner.s.player.y};this.view.zoom=2.5;}
      else this.zoom(tool==='in'?1.3:1/1.3);
      owner.drawMap();
    };
    for(const button of this.el.querySelectorAll('[data-place]'))button.onclick=()=>{
      const s=owner.s,kind=button.dataset.place,p={home:s.world.hideout,shop:s.world.paintShop,ball:s.court,metro:s.world.surfaceMetro.approach}[kind];
      owner.destination={x:p.x,y:p.y,label:button.getAttribute('aria-label')};this.view.route=owner.s.nav.path(owner.s.player,p);this.view.center={x:p.x,y:p.y};owner.drawMap();
    };
    this.el.querySelector('.atlas-go').onclick=()=>{if(!owner.destination)return;const p=owner.destination;owner.ui.toggleMap(false);owner.s.routeTo(p,p.label);};
    const pos=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};};
    canvas.addEventListener('pointerdown',e=>{if(!owner.s.world.sandbox||!owner.ui.mapOpen||e.button!==0)return;e.preventDefault();const p=pos(e);this.pointers.set(e.pointerId,{...p,start:p,moved:false});if(this.pointers.size>1)for(const a of this.pointers.values())a.moved=true;canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});},{signal});
    canvas.addEventListener('pointermove',e=>{
      const old=this.pointers.get(e.pointerId);if(!old||!owner.map)return;const p=pos(e),other=[...this.pointers.entries()].find(([id])=>id!==e.pointerId)?.[1];
      if(other){const before=Math.hypot(old.x-other.x,old.y-other.y),after=Math.hypot(p.x-other.x,p.y-other.y);if(before>10)this.zoom(after/before,{x:(p.x+other.x)/2,y:(p.y+other.y)/2});old.moved=true;}
      else if(Math.hypot(p.x-old.start.x,p.y-old.start.y)>7||old.moved){this.pan((old.x-p.x)/owner.map.transform.scale,(old.y-p.y)/owner.map.transform.scale);old.moved=true;}
      Object.assign(old,p);owner.drawMap();
    },{signal});
    canvas.addEventListener('pointerup',e=>{const p=this.pointers.get(e.pointerId);this.pointers.delete(e.pointerId);if(!p||p.moved||this.pointers.size)return;this.select(pos(e));},{signal});
    for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>this.pointers.delete(e.pointerId),{signal});
    canvas.addEventListener('wheel',e=>{if(!owner.ui.mapOpen||!owner.s.world.sandbox)return;e.preventDefault();this.zoom(Math.exp(-e.deltaY*.0015),pos(e));owner.drawMap();},{signal,passive:false});
    canvas.addEventListener('keydown',e=>{
      if(!owner.ui.mapOpen||!owner.s.world.sandbox)return;
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Enter'].includes(e.key)){e.preventDefault();e.stopPropagation();const step=70/owner.map.transform.scale;if(e.key.startsWith('Arrow'))this.pan(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0,e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0);else if(e.key==='Enter')this.select({x:canvas.width/2,y:canvas.height/2});else this.zoom(e.key==='-'?1/1.3:1.3);owner.drawMap();}
    },{signal});
  }
  center(){const b=this.owner.s.world.mapBounds;return this.view.center??{x:b.x+b.w/2,y:b.y+b.h/2};}
  pan(x,y){const p=this.center(),b=this.owner.s.world.mapBounds;this.view.center={x:Math.max(b.x,Math.min(b.x+b.w,p.x+x)),y:Math.max(b.y,Math.min(b.y+b.h,p.y+y))};}
  zoom(factor,anchor){
    const map=this.owner.map,old=this.view.zoom;this.view.zoom=Math.max(.85,Math.min(4,old*factor));
    if(anchor&&map){const w=map.transform.world(anchor.x,anchor.y),p=this.center(),ratio=old/this.view.zoom;this.view.center={x:w.x+(p.x-w.x)*ratio,y:w.y+(p.y-w.y)*ratio};this.pan(0,0);}
  }
  select(p){
    const o=this.owner;if(!o.map)return;const hit=o.map.hits.map(m=>({...m,d:Math.hypot(m.x-p.x,m.y-p.y)})).sort((a,b)=>a.d-b.d)[0];
    const target=hit?.d<20?hit.worldPoint:o.map.transform.world(p.x,p.y),cell=o.s.nav.closest(target),walk=cell>=0?o.s.nav.point(cell):null;
    if(!walk||Math.hypot(walk.x-target.x,walk.y-target.y)>180)return;
    o.destination={...(hit?.d<20?target:walk),label:hit?.d<20?hit.label:'Точка на карте'};this.view.route=o.s.nav.path(o.s.player,o.destination);o.drawMap();
  }
  sync(zones){
    this.el.querySelector('.zak b').textContent='ЗАК '+zones.filter(z=>z.owner==='zak').length;
    this.el.querySelector('.rivals b').textContent='ОППЫ '+zones.filter(z=>z.owner==='rival').length;
    const p=this.owner.destination;this.el.querySelector('.atlas-destination').textContent=p?.label??'Выбери место';this.el.querySelector('.atlas-go').disabled=!p;this.el.querySelector('.atlas-route').classList.toggle('has-destination',!!p);
  }
}
