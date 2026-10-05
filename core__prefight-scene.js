import {dialogFocus} from './core__dialog-focus.js?v=252855055fad';
export class PrefightScene{
  constructor(session,audio){
    this.s=session;this.audio=audio;this.active=false;this.phase='intro';
    this.el=document.createElement('section');this.el.id='prefight-scene';this.el.hidden=true;this.el.setAttribute('role','dialog');this.el.setAttribute('aria-modal','true');this.el.setAttribute('aria-label','Дуэль за стену');
    this.el.innerHTML='<div class="film-stage"><img class="film-last-frame" alt="Зак и соперник перед дракой" hidden><video playsinline muted preload="none"></video><div class="film-duel" hidden><div class="film-tap-sides"><button class="film-tap-zak" aria-label="Тапай за Зака"><span class="film-tap-prompt" aria-hidden="true">TAP!</span></button><div class="film-tap-rival" aria-label="Соперник играет автоматически"></div></div></div><button class="prefight-play" aria-label="Продолжить видео" hidden><span aria-hidden="true">▷</span></button></div>';
    document.getElementById('app').append(this.el);this.el.tabIndex=-1;this.video=this.el.querySelector('video');this.frame=this.el.querySelector('.film-last-frame');
    this.frame.src='./content__levels__first-mark__art__prefight-last-frame-v19.png';
    this.video.poster='./content__levels__first-mark__art__prefight-portrait-v18.png';this.video.src='./content__levels__first-mark__art__prefight-kling-portrait-v18.mp4';this.video.muted=true;
    this.duelEl=this.el.querySelector('.film-duel');this.tapButton=this.el.querySelector('.film-tap-zak');this.playButton=this.el.querySelector('.prefight-play');
    this.focus=dialogFocus(this.el,()=>this.phase==='duel'?this.pauseDuel():this.advance());
    this.playButton.onclick=()=>this.startVideo();
    this.tapButton.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();this.tap(e);});
    this.tapButton.onclick=e=>{if(e.detail===0)this.tap();};
    this.el.addEventListener('keydown',e=>{if(this.phase==='duel'&&['KeyE','Space','Enter'].includes(e.code)){e.preventDefault();e.stopPropagation();if(!e.repeat)this.tap();}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.phase==='duel'&&this.active)this.pauseDuel(true);});
    this.video.onended=()=>this.advance();this.video.onerror=()=>this.failed();
    this.video.onplaying=()=>{clearTimeout(this.timer);this.timer=setTimeout(()=>this.failed(),18000);};
  }
  play(){
    if(!this.active){this.phase='intro';this.el.dataset.phase='intro';this.shownRival=0;this.paused=false;this.frame.hidden=true;this.duelEl.hidden=true;this.playButton.hidden=true;this.video.hidden=false;this.video.muted=true;this.video.poster='./content__levels__first-mark__art__prefight-portrait-v18.png';this.video.src='./content__levels__first-mark__art__prefight-kling-portrait-v18.mp4';this.video.currentTime=0;for(const mark of this.el.querySelectorAll('.film-tap-mark'))mark.remove();}
    if(this.active)return;this.active=true;this.s.cinematic=true;this.s.player.moving=false;this.el.hidden=false;this.focus.open();this.el.focus();this.resumeRadio=this.audio.radio.wanted;this.audio.radio.media.muted=true;
    this.startVideo();
  }
  startVideo(){
    if(!this.active)return;this.playButton.hidden=true;clearTimeout(this.timer);this.timer=setTimeout(()=>this.failed(),12000);
    const phase=this.phase;
    this.video.play().catch(async()=>{
      if(!this.active||this.phase!==phase)return;
      // Mobile browsers may require muted autoplay after the timed tap contest.
      if(!this.video.muted){this.video.muted=true;try{await this.video.play();return;}catch{}}
      if(!this.active||this.phase!==phase)return;
      clearTimeout(this.timer);this.playButton.hidden=false;this.playButton.focus();
    });
  }
  failed(){
    clearTimeout(this.timer);this.video.pause();
    if(this.phase==='duel'||!this.active)return;
    if(this.phase==='intro')this.beginDuel();
    else this.finish();
  }
  advance(){if(this.phase==='intro')this.beginDuel();else if(this.phase==='outcome')this.finish();}
  beginDuel(){
    if(!this.active||this.phase!=='intro')return;clearTimeout(this.timer);this.video.pause();this.video.hidden=true;this.frame.hidden=false;this.phase='duel';this.el.dataset.phase='duel';this.duelEl.hidden=false;this.playButton.hidden=true;this.paused=false;this.tapButton.focus();this.lastTime=performance.now();
    const tick=now=>{if(!this.active||this.phase!=='duel')return;const dt=Math.min(.08,(now-this.lastTime)/1000);this.lastTime=now;if(!document.hidden&&!this.paused)this.s.tutorial.duel.update(dt);this.syncDuel();if(this.s.tutorial.duel.phase==='result'){this.playOutcome();return;}this.raf=requestAnimationFrame(tick);};this.syncDuel();this.raf=requestAnimationFrame(tick);
  }
  tap(event){if(this.phase!=='duel')return;if(this.paused){this.paused=false;this.lastTime=performance.now();this.syncDuel();return;}if(this.s.tutorial.duel.phase==='ready')this.lastTime=performance.now();if(this.s.tutorial.duel.tap()){this.tapFeedback(this.tapButton,event);this.syncDuel();}}
  tapFeedback(zone,event){
    const r=zone.getBoundingClientRect(),mark=document.createElement('span');mark.className='film-tap-mark';mark.setAttribute('aria-hidden','true');mark.textContent='+1';
    mark.style.left=(event?Math.max(24,Math.min(r.width-24,event.clientX-r.left)):r.width*.5)+'px';mark.style.top=(event?Math.max(24,Math.min(r.height-24,event.clientY-r.top)):r.height*.55)+'px';zone.append(mark);setTimeout(()=>mark.remove(),480);
  }
  pauseDuel(force=false){if(this.phase!=='duel')return;this.paused=force||!this.paused;this.syncDuel();}
  syncDuel(){
    const d=this.s.tutorial.duel;this.duelEl.dataset.ready=String(d.phase==='ready');
    this.tapButton.setAttribute('aria-label',this.paused?'Продолжить дуэль':d.phase==='ready'?'Начать дуэль · тапай за Зака':'Тапнуть за Зака');
    const rivalZone=this.el.querySelector('.film-tap-rival');if(d.rival>(this.shownRival??0)){const r=rivalZone.getBoundingClientRect();this.tapFeedback(rivalZone,{clientX:r.left+r.width*(.35+(d.rival%3)*.15),clientY:r.top+r.height*(.4+(d.rival%4)*.07)});}this.shownRival=d.rival;this.el.dataset.paused=String(this.paused);
  }
  playOutcome(){
    this.phase='outcome';this.el.dataset.phase='outcome';this.duelEl.hidden=true;this.el.focus();const d=this.s.tutorial.duel;
    const wins=['./content__levels__first-mark__art__fight-win-kling-v19.mp4','./content__levels__first-mark__art__fight-win-anime-v20.mp4'];
    this.video.poster=this.frame.src;this.video.src=d.won?wins[Math.floor(Math.random()*wins.length)]:'./content__levels__first-mark__art__fight-loss-kling-v19.mp4';this.video.muted=!this.audio.enabled;this.video.volume=.7;this.video.hidden=false;this.video.load();
    this.startVideo();
  }
  finish(){
    if(!this.active)return;this.active=false;clearTimeout(this.timer);cancelAnimationFrame(this.raf);this.video.pause();this.audio.radio.media.muted=!this.audio.enabled;this.el.hidden=true;this.focus.close();this.s.cinematic=false;this.s.tutorial.finishFight(this.s.tutorial.duel.won);if(this.resumeRadio)void this.audio.radio.resume();
  }
}
