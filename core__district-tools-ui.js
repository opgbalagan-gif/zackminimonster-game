import {AtlasControls} from './core__atlas-controls.js?v=8a0ece6e2747';
import {drawDistrictMap} from './core__district-map.js?v=8a0ece6e2747';
import {GRAFFITI_CATALOG,graffitiUnlocked} from './core__graffiti-catalog.js?v=8a0ece6e2747';
import {GRAFFITI_ART} from './content__district_01__graffiti-art.js?v=8a0ece6e2747';
import {PAINT_STOCK,buyPaint} from './core__paint-shop.js?v=8a0ece6e2747';
import {uiIcon} from './core__ui-kit.js?v=8a0ece6e2747';
import {gestureHint} from './core__gesture-hints.js?v=8a0ece6e2747';
export class DistrictToolsUI{
  constructor(ui){
    this.ui=ui;this.s=ui.session;this.destination=null;this.lastMap=0;this.signature='';this.events=new AbortController();document.getElementById('app').dataset.sandbox=String(!!this.s.world.sandbox);
    for(const id of ['mini-map','graffiti-picker','paint-shop'])document.getElementById(id)?.remove();
    this.mini=document.createElement('button');this.mini.id='mini-map';this.mini.setAttribute('aria-label','Открыть карту района');this.mini.innerHTML='<canvas width="140" height="140"></canvas><span>КАРТА ↗</span>';document.getElementById('app').append(this.mini);this.mini.onclick=()=>ui.toggleMap();
    this.picker=document.createElement('div');this.picker.id='graffiti-picker';this.picker.className='wall-swipe-picker';this.picker.hidden=true;this.picker.setAttribute('role','dialog');this.picker.setAttribute('aria-modal','true');this.picker.setAttribute('aria-label','Выбор граффити на стене');document.getElementById('app').append(this.picker);
    this.picker.innerHTML='<button class="wall-choice-close" aria-label="Отменить выбор граффити">×</button><div class="wall-choice-help">Свайпни по стене</div><button class="wall-choice-prev" aria-label="Предыдущее граффити">‹</button><button class="wall-choice-next" aria-label="Следующее граффити">›</button><div class="wall-choice-footer"><div aria-live="polite" aria-atomic="true"><small class="wall-choice-count"></small><h2 class="wall-choice-name"></h2><p class="wall-choice-unlocks"></p></div><button class="wall-choice-confirm">Рисовать ↗</button></div>';
    this.picker.querySelector('.wall-choice-close').onclick=()=>{this.s.cancelGraffiti();this.ui.sync();};
    this.picker.querySelector('.wall-choice-help').innerHTML=gestureHint('swipe')+'<span>Свайпни — выбери рисунок</span>';
    this.picker.querySelector('.wall-choice-prev').onclick=()=>this.cycleArt(-1);
    this.picker.querySelector('.wall-choice-next').onclick=()=>this.cycleArt(1);
    this.picker.querySelector('.wall-choice-confirm').onclick=()=>{this.s.graffiti?.confirm();this.ui.sync();document.getElementById('cancel-graffiti').focus({preventScroll:true});};
    let swipe=null;
    this.picker.addEventListener('pointerdown',e=>{if(e.target.closest('button')||swipe||e.button!==0)return;e.preventDefault();swipe={id:e.pointerId,x:e.clientX,y:e.clientY};this.picker.setPointerCapture(e.pointerId);},{signal:this.events.signal});
    this.picker.addEventListener('pointerup',e=>{if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.25)this.cycleArt(dx<0?1:-1);},{signal:this.events.signal});
    for(const event of ['pointercancel','lostpointercapture'])this.picker.addEventListener(event,()=>{swipe=null;},{signal:this.events.signal});
    document.addEventListener('keydown',e=>{if(this.picker.hidden)return;if(['ArrowLeft','ArrowRight','Escape','Enter',' ','Tab'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(e.key==='ArrowLeft'||e.key==='ArrowRight')this.cycleArt(e.key==='ArrowLeft'?-1:1);else if(e.key==='Escape')this.picker.querySelector('.wall-choice-close').click();else if(e.key==='Tab'){const buttons=[...this.picker.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}else if(document.activeElement?.matches('#graffiti-picker button'))document.activeElement.click();else this.picker.querySelector('.wall-choice-confirm').click();}},{capture:true,signal:this.events.signal});
    this.shop=document.createElement('section');this.shop.id='paint-shop';this.shop.className='district-dialog';this.shop.hidden=true;this.shop.setAttribute('role','dialog');this.shop.setAttribute('aria-modal','true');this.shop.setAttribute('aria-label','Магазин красок COLOR LAB');document.getElementById('app').append(this.shop);
    this.shop.innerHTML='<div class="district-dialog-card"><header><div><small>КРАСКИ / КЭПЫ / ЦВЕТ</small><h2>COLOR LAB</h2></div><button aria-label="Закрыть магазин">×</button></header><p class="shop-wallet"></p><div class="shop-stock"></div><p>Цвет покупается навсегда. Выбрать его снова можно в квартире.</p></div>';
    this.shop.querySelector('header button').onclick=()=>this.closeShop();
    document.addEventListener('keydown',e=>{if(this.s.mode!=='paint-shop')return;if(e.key==='Escape'){e.stopImmediatePropagation();this.closeShop();}if(e.key==='Tab'){const buttons=[...this.shop.querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}},{capture:true,signal:this.events.signal});
    if(this.s.world.sandbox)this.atlas=new AtlasControls(this);
    document.getElementById('route-select').addEventListener('change',()=>{this.destination=null;},{signal:this.events.signal});
    document.getElementById('route-button').onclick=()=>{const p=this.destination;ui.toggleMap(false);if(p)this.s.routeTo(p,p.label);else ui.callbacks.route(document.getElementById('route-select').value);};
    if(this.s.world.sandbox)document.querySelector('.map-legend').innerHTML='<span class="territory-zak">● ЗАК</span><span class="territory-rival">● ОППЫ</span><span>Пунктир — спор / свободно</span><span>Счёт на квартале: Зак : оппы</span><span>✎ Стена · × Соперник · ▰ Дворник · ! Полиция</span>';
  }
  destroy(){this.events.abort();}
  availableArt(){return GRAFFITI_CATALOG.filter(item=>graffitiUnlocked(this.s.save,item.id)&&this.s.definitions.some(d=>d.id===item.id));}
  cycleArt(direction){const g=this.s.graffiti;if(!g?.choosing)return;const list=this.availableArt(),at=list.findIndex(a=>a.id===g.definition.id);if(!list.length)return;this.picker.dataset.swiped='true';this.s.chooseGraffiti(list[(Math.max(0,at)+direction+list.length)%list.length].id);this.ui.sync();}
  closeShop(){this.s.mode='district';this.shop.hidden=true;this.s.emit('mode');this.ui.sync();}
  drawMap(){const canvas=document.getElementById('map-canvas');this.map=drawDistrictMap(canvas.getContext('2d'),this.s,canvas.width,canvas.height,false,this.destination??this.s.waypoint,this.atlas?.view);const zones=this.map.territories;this.atlas?.sync(zones);canvas.setAttribute('aria-label','Карта территорий. '+zones.map(z=>z.name+': Зак '+z.zak+', оппы '+z.rival).join('. '));const zak=zones.filter(z=>z.owner==='zak').length,rival=zones.filter(z=>z.owner==='rival').length;document.getElementById('map-progress').textContent='КВАРТАЛЫ  ЗАК '+zak+' : '+rival+' ОППЫ';document.getElementById('city-status').textContent=this.destination?this.destination.label+' · нажми «Проложить маршрут»':'Нажми на карту или метку, чтобы поставить точку маршрута.';}
  sync(){
    const s=this.s;this.mini.hidden=!s.world.sandbox||s.mode!=='district'||this.ui.mapOpen;
    const now=performance.now();if(now-this.lastMap>120){this.lastMap=now;if(!this.mini.hidden){const c=this.mini.querySelector('canvas');drawDistrictMap(c.getContext('2d'),s,c.width,c.height,true,s.waypoint);}if(s.world.sandbox&&this.ui.mapOpen)this.drawMap();}
    const opening=this.shop.hidden&&s.mode==='paint-shop';this.shop.hidden=s.mode!=='paint-shop';if(opening)this.shop.querySelector('header button').focus();
    if(!this.shop.hidden){
      const key=s.save.money+':'+s.save.paintShop.owned.join(',');
      if(this.shopKey!==key){this.shopKey=key;this.shop.querySelector('.shop-wallet').textContent='У тебя '+s.save.money+' ₽';const grid=this.shop.querySelector('.shop-stock');grid.replaceChildren();
        for(const item of PAINT_STOCK){const owned=s.save.paintShop.owned.includes(item.id)||item.id==='wide_cap'&&s.save.hideout.upgrades.includes('spray_rack'),button=document.createElement('button');button.disabled=owned||s.save.money<item.price;button.innerHTML=uiIcon('spray')+'<strong>'+item.name+'</strong><span>'+(owned?'КУПЛЕНО':item.price+' ₽')+'</span>';button.style.setProperty('--paint-color',item.color);button.onclick=()=>{buyPaint(s,item.id);this.shopKey='';this.sync();};grid.append(button);}
      }
    }
    const g=s.graffiti,wasHidden=this.picker.hidden;this.picker.hidden=s.mode!=='graffiti'||!g?.choosing;
    document.getElementById('app').dataset.choosingGraffiti=String(!this.picker.hidden);
    if(this.picker.hidden)return;
    if(wasHidden){this.picker.dataset.swiped='false';this.picker.querySelector('.wall-choice-confirm').focus({preventScroll:true});}
    const signature=g.definition.id+':'+s.save.graffiti_unlocks.join(',');if(signature===this.signature)return;this.signature=signature;
    const available=this.availableArt(),index=available.findIndex(a=>a.id===g.definition.id),next=GRAFFITI_CATALOG.find(a=>!graffitiUnlocked(s.save,a.id));
    this.picker.querySelector('.wall-choice-name').textContent=GRAFFITI_ART[g.definition.id]?.name??g.definition.id;
    this.picker.querySelector('.wall-choice-count').textContent=(index+1)+' / '+available.length;
    this.picker.querySelector('.wall-choice-unlocks').textContent=next?'Следующий рисунок · ещё '+Math.max(0,next.walls-s.save.painted_walls.length)+' стен':'';
  }
}
