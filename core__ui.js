import {GraffitiView} from './core__graffiti-view.js?v=252855055fad';
import {HideoutUI} from './core__hideout-ui.js?v=252855055fad';
import {CourtView} from './core__court-view.js?v=252855055fad';
import {PhoneUI} from './core__phone-ui.js?v=252855055fad';
import {PeriodTransition} from './core__period-transition.js?v=252855055fad';
import {POSTERS,ARTIST_URL} from './content__district_01__posters.js?v=252855055fad';
import {GRAFFITI_ART} from './content__district_01__graffiti-art.js?v=252855055fad';
import {GRAFFITI_CONFIG} from './content__graffiti__config.js?v=252855055fad';
import {URBAN_WALL} from './content__graffiti__walls__urban.js?v=252855055fad';
import {regionAt,gateMessage} from './core__city-progress.js?v=252855055fad';
import {initUITheme,syncUIStats,setUIButton} from './core__ui-kit.js?v=252855055fad';
import {DistrictToolsUI} from './core__district-tools-ui.js?v=252855055fad';
import {PrefightScene} from './core__prefight-scene.js?v=252855055fad';
const $=id=>document.getElementById(id);
export class GameUI{
  constructor(callbacks){
    initUITheme();
    $('action-button').classList.remove('primary','ui-primary');
    document.querySelector('.player-card').append($('toast'));
    this.callbacks=callbacks;this.mapOpen=false;this.debug=false;this.toastUntil=0;this.lastMode='';
    $('start-button').onclick=callbacks.start;$('leave-button').onclick=callbacks.leave;
    $('upgrade-button').onclick=callbacks.upgrade;$('action-button').onclick=callbacks.action;
    $('map-button').onclick=()=>this.toggleMap();$('close-map').onclick=()=>this.toggleMap(false);
    $('home-route').onclick=callbacks.home;$('sound-button').onclick=callbacks.sound;
    $('cancel-graffiti').onclick=callbacks.cancel;$('confirm-stencil').onclick=callbacks.confirm;
    $('route-button').onclick=()=>{
      const id=$('route-select').value;this.toggleMap(false);callbacks.route(id);
    };
  }
  loading(progress,error=''){
    $('start-button').disabled=!error;$('load-progress').hidden=!!error;$('load-progress').value=progress;
    $('load-status').textContent=error||'ЗАГРУЗКА УРОВНЯ · '+Math.round(progress*100)+'%';
    if(error)$('start-button').textContent='ПОВТОРИТЬ';
  }
  bind(session,renderer,audio){
    this.session=session;this.renderer=renderer;this.audio=audio;
    this.prefight=new PrefightScene(session,audio);
    if(session.world.sandbox){document.querySelector('.map-legend').innerHTML='<span><i class="gold"></i> Дом</span><span><i class="purple"></i> Граффити</span><span><i class="blue"></i> Канал</span><span>● Зак — розовая точка</span>';}
    this.graffitiView=new GraffitiView($('graffiti-canvas'),session,renderer,audio);
    this.courtView=new CourtView(session,renderer);
    this.posterLinks=new Map();
    for(const poster of POSTERS){
      const link=document.createElement('button');link.className='world-poster-link';
      link.setAttribute('aria-label','Открыть плакат '+poster.brand);link.title=poster.brand+' × ZAK MINI MONSTER';link.innerHTML='<span class="comic-interest">!</span>';link.onclick=()=>this.openPoster(poster.id);
      link.hidden=true;$('poster-links').append(link);this.posterLinks.set(poster.id,link);
    }
    $('close-poster').onclick=()=>this.closePoster();
    $('close-poi').onclick=()=>this.closePoi();
    $('poi-talk').onclick=()=>{$('poi-quote').textContent=this.currentPoi.line;};
    $('poi-wall').onclick=()=>{const target=session.world.targets.find(t=>t.wall_id===this.currentPoi.wall);this.closePoi();if(target)session.routeTo(target.approach,target.name);};
    $('poster-instagram').href=ARTIST_URL;
    for(const poster of POSTERS){const button=document.createElement('button');button.textContent=poster.brand;button.onclick=()=>this.openPoster(poster.id);$('poster-gallery').append(button);}
    for(const region of session.world.sandbox?[{id:'all',name:'ВСЁ'},{id:'home',name:'КВАРТАЛ'},{id:'canal',name:'КАНАЛ'},{id:'park',name:'ПАРК'},{id:'marina',name:'ПРИЧАЛ'}]:[{id:'all',name:'ВЕСЬ ГОРОД'},...session.city]){
      const button=document.createElement('button');button.dataset.region=region.id;button.textContent=region.name;
      button.onclick=()=>{session.mapRegion=region.id==='all'?null:region.id;this.drawMap();};$('city-tabs').append(button);
    }
    $('motion-enable').onclick=async()=>{await this.graffitiView.motion.enable();this.sync();};
    $('motion-touch').onclick=()=>{this.graffitiView.motion.useTouch();this.sync();};
    this.hideoutUI=new HideoutUI(session,renderer,()=>this.sync(),audio);
    this.periodTransition=new PeriodTransition(session,()=>{if(this.pendingComment){const text=this.pendingComment;this.pendingComment='';this.showToast(text);}},renderer);
    if(session.world.tutorial)this.phoneUI=new PhoneUI(session,renderer,audio);
    $('radio-stop').onclick=()=>{audio.radio.stop();this.sync();};
    $('radio-toggle').onclick=()=>{audio.radio.toggle();this.sync();};
    $('radio-retry').onclick=()=>{audio.radio.start();this.sync();};
    $('radio-volume').value=Math.round(audio.radio.media.volume*100);
    $('radio-volume').oninput=()=>{audio.radio.setVolume(Number($('radio-volume').value)/100);this.sync();};
    $('radio-volume').onchange=()=>{session.save.settings.radioVolume=audio.radio.media.volume;session.persist();};
    $('title-screen').hidden=true;$('hud').hidden=false;
    this.districtTools?.destroy();this.districtTools=new DistrictToolsUI(this);
    this.updateRoutes();this.sync();
  }
  updatePosterLinks(){
    if(!this.posterLinks)return;
    const canvas=$('game'),r=canvas.getBoundingClientRect();
    for(const [id,link] of this.posterLinks){
      const hit=this.renderer.posterHits.find(p=>p.id===id);link.hidden=this.session.mode!=='district'||this.mapOpen||!hit||hit.x+hit.w<0||hit.y+hit.h<0||hit.x>canvas.width||hit.y>canvas.height;
      if(!link.hidden){link.style.left=hit.x*r.width/canvas.width+'px';link.style.top=hit.y*r.height/canvas.height+'px';link.style.width=Math.max(24,hit.w*r.width/canvas.width)+'px';link.style.height=Math.max(36,hit.h*r.height/canvas.height)+'px';}
    }
  }
  openPoster(id){
    const poster=POSTERS.find(p=>p.id===id);if(!poster)return;
    this.posterMode=this.session.mode;this.session.mode='poster';
    $('poster-title').textContent=poster.brand+' × ZAK MINI MONSTER';$('poster-screen').hidden=false;
    const canvas=$('poster-canvas'),c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);
    this.renderer.atlas.draw(c,'poster_'+id,256,768,512,768);$('close-poster').focus();this.sync();
  }
  closePoster(){if(this.session?.mode!=='poster')return;$('poster-screen').hidden=true;this.session.mode=this.posterMode??'district';this.sync();}
  openPoi(id){
    const p=this.session.world.pointsOfInterest.find(p=>p.id===id);if(!p)return;this.currentPoi=p;this.session.mode='poi';
    $('poi-screen').hidden=false;$('poi-title').textContent=p.name;$('poi-description').textContent=p.description;$('poi-quote').textContent='Место добавлено в твою карту.';
    const c=$('poi-canvas').getContext('2d');c.clearRect(0,0,600,450);const rect=this.renderer.atlas.rect(p.sprite),height=Math.min(390,530*rect[3]/rect[2]);this.renderer.atlas.draw(c,p.sprite,300,425,null,height);$('close-poi').focus();this.sync();
  }
  closePoi(){if(this.session.mode!=='poi')return;$('poi-screen').hidden=true;this.session.mode='district';this.sync();}
  updateRoutes(){
    const s=this.session,select=$('route-select'),old=select.value;select.replaceChildren();
    const options=[{id:'home',name:'⌂ Убежище'},{id:'court',name:'◉ Баскетбол · Не просто мяч'},...s.world.targets.map(t=>({id:t.wall_id,name:(s.painted.has(t.wall_id)?'✓ ':'▣ ')+t.name+' · '+t.rep_reward+' REP'})),...s.world.safeSpots.map(t=>({id:t.id,name:'? '+t.name}))];
    if(s.world.sandbox)options.splice(2,0,...s.world.mapRoutes);
    else options.splice(2,0,...POSTERS.map(p=>({id:'poster_'+p.id,name:'↗ Плакат '+p.brand+' × ZAK MINI MONSTER'})));
    options.splice(2,0,...(s.world.bridges??[]).map(b=>({id:b.id,name:'⇄ '+b.name})),...(s.world.hideouts??[]).slice(1).map(h=>({id:h.id,name:'⌂ '+h.name})));
    options.splice(2,0,...(s.world.pointsOfInterest??[]).map(p=>({id:p.id,name:'! '+p.name})));
    for(const opt of options){const el=document.createElement('option');el.value=opt.id;el.textContent=opt.name;select.append(el);}
    if(old)select.value=old;
  }
  toggleMap(force){
    if(this.session?.tutorial&&!this.session.world.sandbox)return;
    if(!this.session||!['hideout','district'].includes(this.session.mode))return;
    this.mapOpen=force??!this.mapOpen;$('map-screen').hidden=!this.mapOpen;
    $('app').dataset.map=String(this.mapOpen);
    if(this.session.world.sandbox){document.querySelector('.map-header h1').textContent='РАЙОН';document.querySelector('.map-header .eyebrow').textContent='КВАРТАЛЫ · КАНАЛ · ПАРК';$('poster-gallery').hidden=true;}
    if(this.mapOpen){this.updateRoutes();this.drawMap();}
  }
  drawMap(){
    if(!this.mapOpen)return;const canvas=$('map-canvas'),rect=canvas.getBoundingClientRect();
    if(rect.width<50||rect.height<100)return;
    const padding=parseFloat(getComputedStyle(canvas).paddingTop)||0;
    canvas.width=Math.round(rect.width);canvas.height=Math.max(1,Math.round(rect.height-padding));
    if(this.session.world.sandbox)this.renderer.map(canvas.getContext('2d'),this.session,canvas.width,canvas.height);
    else this.renderer.world(canvas.getContext('2d'),this.session,canvas.width,canvas.height,true);
    $('map-progress').textContent=this.session.painted.size+' / '+this.session.world.targets.length+' СТЕН';
    for(const button of $('city-tabs').children)button.classList.toggle('active',button.dataset.region===(this.session.mapRegion??'all'));
    const selected=this.session.city.find(r=>r.id===this.session.mapRegion);
    $('city-status').textContent=this.session.world.sandbox?'Ты — розовая точка. Выбери место, чтобы проложить пеший маршрут.':selected?selected.open?selected.subtitle+' · Сохранено '+selected.rep+' REP':gateMessage(this.session.city,selected.id):'Единый город · река · кольцо метро. Проходы: 800 → 1200 → 1600 REP в предыдущем районе.';
    if(this.session.world.sandbox)this.districtTools?.drawMap();
  }
  showToast(text){if(this.periodTransition?.active){this.pendingComment=text;return;}$('toast').textContent=text;$('toast').hidden=false;this.toastUntil=performance.now()+4500;}
  sync(){
    const s=this.session;if(!s)return;
    this.districtTools?.sync();
    $('app').dataset.mode=s.mode;
    const gang=s.gangs.speech;$('gang-callout').hidden=!gang||s.mode!=='district'||this.mapOpen;
    if(gang){$('gang-name').textContent=gang.name;$('gang-line').textContent=gang.line;$('gang-requirement').textContent=gang.detail;}
    const region=regionAt(s.world,s.player);document.querySelector('.district-title strong').textContent=region?.name??'НАБЕРЕЖНАЯ';
    document.querySelector('.district-title .eyebrow').textContent=region?'DISTRICT 0'+(s.city.findIndex(r=>r.id===region.id)+1):'MINI MONSTER CITY';
    const radio=this.audio.radio;
    $('radio-panel').hidden=radio.state==='off';
    $('radio-status').textContent=['error','paused'].includes(radio.state)?radio.message:radio.state==='loading'?'Подключаемся к эфиру…':!this.audio.enabled?'Звук выключен · кнопка ♪':radio.media.volume===0?'Громкость 0%':'В ЭФИРЕ · HIP-HOP / R&B';
    $('radio-panel').dataset.state=radio.state;
    $('radio-retry').hidden=!['error','paused'].includes(radio.state);
    $('radio-volume-value').textContent=Math.round(radio.media.volume*100)+'%';
    if(s.mode==='hideout')this.hideoutUI?.sync();
    $('hideout-ui').hidden=s.mode!=='hideout';$('district-ui').hidden=!['district','caught'].includes(s.mode);
    $('graffiti-screen').hidden=!!this.graffitiView.world||s.mode!=='graffiti'||!!s.graffiti?.choosing;
    this.courtView.sync();
    $('rep-label').innerHTML=s.save.rep+' <small>REP</small>';$('run-rep').textContent='Вылазка +'+s.runRep;
    syncUIStats(s,radio);
    $('heat-stars').setAttribute('aria-label','Розыск '+s.heat+' из 5');
    $('heat-note').textContent=s.hiddenFor>0?'СКРЫТ':s.police.units.some(u=>u.state==='CHASE')?'ПОГОНЯ':s.heat?'Патрули активны':'Чисто';
    $('home-rep').textContent=s.save.rep;$('home-walls').textContent=s.save.painted_walls.length+' / '+s.world.targets.length;
    const bought=s.save.hideout.upgrades.includes('spray_rack');
    $('upgrade-button').disabled=bought;$('upgrade-button').querySelector('b').textContent=bought?'УСТАНОВЛЕН':'500 REP';
    $('objective-label').textContent=s.knockedFor>0?'СБИЛИ · Зак поднимается…':s.waypoint?'↗ '+s.waypoint.label:s.runRep?'Вернись в убежище, чтобы сохранить':s.painted.size===s.world.targets.length?'Район полностью твой':'Найди свободную стену · берегись машин';
    const near=s.tutorial?.stage==='fight'?null:s.near;$('interaction').hidden=!near||s.hiddenFor>0||s.mode!=='district';
    $('action-button').hidden=$('interaction').hidden||!!s.tutorial?.scripted;
    if(near){const [label,icon]=near.type==='rival'?['Вызвать на дуэль','fight']:near.type==='target'?['Рисовать','spray']:near.type==='shop'?['Магазин красок','spray']:near.type==='hideout'?['Войти','home']:near.type==='npc'?['Поговорить с '+near.item.name,'talk']:near.type==='court'?['Баскетбол','ball']:['Спрятаться','bin'];$('action-button').setAttribute('aria-label',label);$('action-button').title=label+' · нажми; тяни, чтобы идти';setUIButton($('action-button'),label,icon);}
    if(near){
      $('interaction-type').textContent=near.type==='court'?'COURT STORY':near.type==='target'?'GRAFFITI SPOT':near.type==='safe'?'SAFE SPOT':'HIDEOUT / SAVE';
      $('interaction-name').textContent=near.item.name??(near.type==='rival'?'Соперник':'');
      if(near.type==='rival'){$('interaction-type').textContent='ДУЭЛЬ';$('interaction-detail').textContent='Не дай перекрыть свою работу';}
      $('interaction-detail').textContent=near.type==='court'?(s.save.basketball.completed?'Поговорить и украсить новый мяч':'Два друга спорят о мяче · +300 REP'):near.type==='target'?'+'+near.item.rep_reward+' REP · HEAT +'+near.item.heat_reward:near.type==='safe'?(near.item.cooldown>0?'Повторно через '+Math.ceil(near.item.cooldown)+' сек.':'Спрятаться и снизить розыск'):'Сохранить вылазку и сбросить HEAT';
      $('action-button').disabled=near.type==='safe'&&near.item.cooldown>0;
      if(near.type==='bin'){$('interaction-type').textContent='УКРЫТИЕ';$('interaction-detail').textContent='Спрятаться и переждать патруль';}
      if(near.type==='npc'){$('interaction-type').textContent='РАЗГОВОР';$('interaction-detail').textContent='Нажми, чтобы обменяться репликами';}
      if(near.type==='poster'){$('interaction-type').textContent='ART COLLAB';$('interaction-detail').textContent='Открыть плакат · Instagram художника';}
      if(near.type==='poi'){$('interaction-type').textContent='МЕСТО В ГОРОДЕ';$('interaction-detail').textContent=near.item.kind==='meet'?'Сходка стритрейсеров · поговорить':'Заглянуть и узнать, что рядом';}
      if(near.type==='bridge'){$('interaction-type').textContent='БАНДА / ПРОХОД В РАЙОН';$('interaction-detail').textContent=gateMessage(s.city,near.item.to);}
    }
    if(s.mode==='graffiti'){
      const g=s.graffiti;if(this.graffitiView.game!==g)this.graffitiView.bind(g);
      const art=GRAFFITI_ART[g.definition.id];$('graffiti-art-name').textContent=art.name;
      [...$('graffiti-palette').children].forEach((dot,i)=>{dot.style.background=art.palette[i];});
      $('graffiti-screen').dataset.phase=g.phase;
      $('graffiti-screen').classList.toggle('exiting',g.done&&g.resultTime>GRAFFITI_CONFIG.resultSeconds-.4);
      $('graffiti-wall-state').textContent=URBAN_WALL.states[g.phase==='shake'?'clean':g.phase];
      $('graffiti-reward').hidden=!g.done;$('graffiti-rep').textContent='+'+(s.world.sandbox&&s.painted.has(g.target.wall_id)?0:g.target.rep_reward)+' REP';$('graffiti-heat').textContent='HEAT +'+g.target.heat_reward;
      $('cancel-graffiti').hidden=g.done;
      $('wall-id').textContent=(this.session.world.tutorial?'УРОВЕНЬ '+String(s.world.levelNumber??1).padStart(2,'0'):'EAST BLOCK')+(g.target.buildingId?' / ФАСАД':' / СТЕНА');$('wall-name').textContent=g.target.name;
      if(g.target.rep_reward===0&&g.target.buildingId)$('graffiti-rep').textContent='ТВОЙ ДОМ';
      const phases=['shake','stencil','spray','result'];
      for(const el of document.querySelectorAll('[data-phase]')){
        el.classList.toggle('active',el.dataset.phase===g.phase);el.classList.toggle('complete',phases.indexOf(el.dataset.phase)<phases.indexOf(g.phase));
      }
      const title={shake:'Встряхни баллон',stencil:'Размести трафарет',spray:'Оставь свой след',result:'Стена твоя!'};
      const help={shake:'Зажми баллон и води влево-вправо.',stencil:'Подвинь рисунок в рамке и закрепи трафарет.',spray:'Води баллоном по силуэту. Нужно закрасить '+Math.round(g.required*100)+'%.',result:'Работа готова. Забери награду и возвращайся на улицу.'};
      $('phase-title').textContent=title[g.phase];$('phase-help').textContent=help[g.phase];
      const motion=this.graffitiView.motion;
      $('motion-controls').hidden=g.phase!=='shake'||!motion.mobile;
      if(g.phase==='shake'&&motion.mobile){
        $('motion-enable').hidden=motion.listening&&!motion.manual;
        $('motion-enable').disabled=!motion.supported||motion.status==='requesting';
        $('motion-enable').textContent=motion.status==='requesting'?'ОЖИДАЕМ РАЗРЕШЕНИЕ…':'ВКЛЮЧИТЬ ВСТРЯХИВАНИЕ';
        $('motion-touch').hidden=motion.manual||(!motion.allowed&&motion.status!=='requesting');
        const messages={unavailable:'Датчик недоступен. Открой игру по HTTPS или двигай баллон пальцем.',
          denied:'Доступ не разрешён. Можно двигать баллон пальцем.',
          'no-data':'Нет данных датчика. Попробуй режим «Пальцем».',requesting:'Разреши доступ к движению телефона.',
          listening:'Держи телефон крепко и встряхивай его.',off:'Включи датчик движения или двигай баллон пальцем.'};
        $('motion-status').textContent=messages[motion.status]??'';
        if(motion.listening&&!motion.manual){$('phase-title').textContent='ПОТРЯСИ ТЕЛЕФОНОМ';$('phase-help').textContent='Несколько движений — и баллон готов.';}
      }
      const progress=g.done?1:g.phase==='shake'?g.shakeProgress:g.phase==='stencil'?0:g.coverage;
      $('coverage-label').textContent=g.phase==='stencil'?'✓':Math.round(progress*100)+'%';$('graffiti-progress').value=progress;
      $('confirm-stencil').hidden=!['stencil','result'].includes(g.phase);
      setUIButton($('confirm-stencil'),g.done?'ЗАБРАТЬ НАГРАДУ':'ЗАКРЕПИТЬ ТРАФАРЕТ',g.done?'rep':'spray');
    }
    this.graffitiView.world?.sync();
    this.graffitiView.motion.setActive(!this.graffitiView.world&&this.graffitiView.motion.mobile&&s.mode==='graffiti'&&!s.graffiti?.choosing&&s.graffiti?.phase==='shake');
    $('debug-overlay').hidden=!this.debug;
    if(this.debug)$('debug-overlay').textContent='FPS '+s.metrics.fps+'\nFRAME '+s.metrics.frame+' ms\nMEM '+s.metrics.memory+'\nPACK '+s.world.id+'\nDRAW '+s.metrics.drawCalls+'\nPOLICE '+s.metrics.activePolice+'\nNPC '+s.citizens.people.length+'\nTRAFFIC '+s.traffic.cars.filter(c=>c.travel>0).length+' / '+s.traffic.cars.length+'\nHEAT '+s.heat;
    if(performance.now()>this.toastUntil)$('toast').hidden=true;
    for(const event of s.events.splice(0)){
      if(event.type==='prefight')this.prefight.play();
      if(event.type==='next-level')this.callbacks.nextLevel?.(event.level);
      // Continuous time changes lighting in place, without a blocking cutscene.
      if(event.type==='phone-open')this.phoneUI?.open();
      if(event.type==='poster-open')this.openPoster(event.id);
      if(event.type==='poi-open')this.openPoi(event.id);
      if(event.type==='notice')this.showToast(event.message);
      if(event.type==='graffiti-start'){
        $('transition').classList.add('flash');requestAnimationFrame(()=>requestAnimationFrame(()=>$('transition').classList.remove('flash')));
      }
    }
  }
}

