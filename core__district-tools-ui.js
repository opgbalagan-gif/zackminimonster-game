import {drawDistrictMap} from './core__district-map.js?v=5e1de61c4ab4';
import {GRAFFITI_CATALOG,graffitiUnlocked} from './core__graffiti-catalog.js?v=5e1de61c4ab4';
import {GRAFFITI_ART} from './content__district_01__graffiti-art.js?v=5e1de61c4ab4';
import {PAINT_STOCK,buyPaint} from './core__paint-shop.js?v=5e1de61c4ab4';
import {uiIcon} from './core__ui-kit.js?v=5e1de61c4ab4';
export class DistrictToolsUI{
  constructor(ui){
    this.ui=ui;this.s=ui.session;this.destination=null;this.lastMap=0;this.signature='';this.events=new AbortController();document.getElementById('app').dataset.sandbox=String(!!this.s.world.sandbox);
    for(const id of ['mini-map','graffiti-picker','paint-shop'])document.getElementById(id)?.remove();
    this.mini=document.createElement('button');this.mini.id='mini-map';this.mini.setAttribute('aria-label','Открыть карту района');this.mini.innerHTML='<canvas width="140" height="140"></canvas><span>КАРТА ↗</span>';document.getElementById('app').append(this.mini);this.mini.onclick=()=>ui.toggleMap();
    this.picker=document.createElement('div');this.picker.id='graffiti-picker';this.picker.setAttribute('aria-label','Выбор рисунка');document.querySelector('.graffiti-heading').after(this.picker);
    this.shop=document.createElement('section');this.shop.id='paint-shop';this.shop.className='district-dialog';this.shop.hidden=true;this.shop.setAttribute('role','dialog');this.shop.setAttribute('aria-modal','true');this.shop.setAttribute('aria-label','Магазин красок COLOR LAB');document.getElementById('app').append(this.shop);
    this.shop.innerHTML='<div class="district-dialog-card"><header><div><small>КРАСКИ / КЭПЫ / ЦВЕТ</small><h2>COLOR LAB</h2></div><button aria-label="Закрыть магазин">×</button></header><p class="shop-wallet"></p><div class="shop-stock"></div><p>Цвет покупается навсегда. Выбрать его снова можно в квартире.</p></div>';
    this.shop.querySelector('header button').onclick=()=>this.closeShop();
    document.addEventListener('keydown',e=>{if(this.s.mode!=='paint-shop')return;if(e.key==='Escape'){e.stopImmediatePropagation();this.closeShop();}if(e.key==='Tab'){const buttons=[...this.shop.querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}},{capture:true,signal:this.events.signal});
    document.getElementById('map-canvas').addEventListener('pointerup',e=>{
      if(!this.s.world.sandbox||!ui.mapOpen||!this.map)return;const canvas=e.currentTarget,r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;
      const hit=this.map.hits.map(p=>({...p,d:Math.hypot(p.x-x,p.y-y)})).sort((a,b)=>a.d-b.d)[0];
      const p=hit?.d<15?hit.worldPoint:this.map.transform.world(x,y);this.destination={...p,label:hit?.d<15?hit.label:'Отмеченная точка'};this.drawMap();
    },{signal:this.events.signal});
    document.getElementById('route-select').addEventListener('change',()=>{this.destination=null;},{signal:this.events.signal});
    document.getElementById('route-button').onclick=()=>{const p=this.destination;ui.toggleMap(false);if(p)this.s.routeTo(p,p.label);else ui.callbacks.route(document.getElementById('route-select').value);};
    if(this.s.world.sandbox)document.querySelector('.map-legend').innerHTML='<span>✎ Розовый — рисовать</span><span>● Зелёный — твоя работа</span><span>! Синий — полиция</span><span>× Красный — соперник</span><span>S Мята — краски</span><span>⌂ Дом · M Метро · ● Мяч · R Робби · H Укрытие</span>';
  }
  destroy(){this.events.abort();}
  closeShop(){this.s.mode='district';this.shop.hidden=true;this.s.emit('mode');this.ui.sync();}
  drawMap(){const canvas=document.getElementById('map-canvas');this.map=drawDistrictMap(canvas.getContext('2d'),this.s,canvas.width,canvas.height,false,this.destination??this.s.waypoint);document.getElementById('city-status').textContent=this.destination?this.destination.label+' · нажми «Проложить маршрут»':'Нажми на карту или метку, чтобы поставить точку маршрута.';}
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
    const g=s.graffiti;this.picker.hidden=s.mode!=='graffiti'||g?.phase!=='shake';
    if(!this.picker.hidden&&g.shakeProgress>0){this.signature='';for(const button of this.picker.children)button.disabled=true;return;}
    if(this.picker.hidden)return;
    const signature=g.definition.id+':'+s.save.graffiti_unlocks.join(',');if(signature===this.signature)return;this.signature=signature;this.picker.replaceChildren();
    for(const item of GRAFFITI_CATALOG){const art=GRAFFITI_ART[item.id];if(!art)continue;const button=document.createElement('button'),available=graffitiUnlocked(s.save,item.id);button.disabled=!available;button.setAttribute('aria-pressed',String(item.id===g.definition.id));button.setAttribute('aria-label',art.name+(available?'':' · откроется за '+item.walls+' стен'));const canvas=document.createElement('canvas');canvas.width=160;canvas.height=88;this.ui.renderer.drawGraffiti(canvas.getContext('2d'),item.id,5,4,150,78);button.append(canvas);const name=document.createElement('span');name.textContent=art.name;button.append(name);const state=document.createElement('small');state.textContent=available?item.id===g.definition.id?'ВЫБРАНО':'ВЫБРАТЬ':'🔒 '+item.walls+' СТЕН';button.append(state);button.onclick=()=>{s.chooseGraffiti(item.id);this.ui.sync();};this.picker.append(button);}
  }
}
