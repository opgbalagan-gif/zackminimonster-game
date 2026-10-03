const BACKGROUNDS={day:'./content__levels__first-mark__art__background-day.png',night:'./content__levels__first-mark__art__background-reference.png'};
const CLIPS={day:'./content__levels__first-mark__art__night-to-day.mp4',night:'./content__levels__first-mark__art__day-to-night.mp4'};

// A bounded, skippable interlude. Failed playback must never trap the player.
export class PeriodTransition{
  constructor(session,onDone){this.s=session;this.onDone=onDone;this.active=false;this.reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;}
  play(from,to){
    if(from===to||!CLIPS[to]||this.active)return;
    this.active=true;this.s.cinematic=true;this.previousFocus=document.activeElement;
    const app=document.getElementById('app');
    this.inert=[...app.children].map(el=>[el,el.inert]);this.inert.forEach(([el])=>el.inert=true);
    const overlay=document.createElement('section');this.overlay=overlay;overlay.id='period-transition';overlay.dataset.to=to;
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',to==='night'?'Наступает ночь':'Наступает день');
    overlay.innerHTML='<img class="period-before" alt=""><img class="period-after" alt=""><video muted playsinline preload="auto" aria-hidden="true"></video><div class="period-caption"><small>ВРЕМЯ ИДЁТ</small><h2></h2></div><button class="period-skip">ПРОПУСТИТЬ ›</button>';
    const before=overlay.querySelector('.period-before'),after=overlay.querySelector('.period-after'),video=overlay.querySelector('video');
    before.src=BACKGROUNDS[from];after.src=BACKGROUNDS[to];this.video=video;
    overlay.querySelector('h2').textContent=to==='night'?'НОЧЬ ПРИНАДЛЕЖИТ НАМ':'ГОРОД ПРОСЫПАЕТСЯ';
    overlay.querySelector('button').onclick=()=>this.finish();app.append(overlay);overlay.querySelector('button').focus();
    this.onKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.finish();}else if(e.key==='Tab'){e.preventDefault();overlay.querySelector('button').focus();}};
    window.addEventListener('keydown',this.onKey,true);
    this.deadline=setTimeout(()=>this.finish(),6500);
    if(this.reduceMotion()){this.fallback(450);return;}
    video.muted=true;video.playsInline=true;video.src=CLIPS[to];
    video.onended=()=>this.finish();video.onerror=()=>this.fallback();
    this.loadDeadline=setTimeout(()=>this.fallback(),1800);
    video.onplaying=()=>{if(this.active&&!this.fallingBack){clearTimeout(this.loadDeadline);overlay.classList.add('playing');}};
    video.play()?.catch(()=>this.fallback());
  }
  fallback(duration=1000){
    if(!this.active||this.fallingBack)return;this.fallingBack=true;clearTimeout(this.loadDeadline);this.video.pause();
    this.overlay.classList.remove('playing');this.overlay.style.setProperty('--period-fade',duration+'ms');
    this.overlay.classList.add('fallback');this.fallbackTimer=setTimeout(()=>this.finish(),duration+100);
  }
  finish(){
    if(!this.active||this.finishing)return;this.finishing=true;
    clearTimeout(this.deadline);clearTimeout(this.loadDeadline);clearTimeout(this.fallbackTimer);
    this.video.pause();this.video.onended=null;this.video.onerror=null;this.video.onplaying=null;
    this.overlay.classList.add('leaving');
    setTimeout(()=>{
      this.overlay.remove();this.video.removeAttribute('src');this.video.load();
      this.inert.forEach(([el,value])=>el.inert=value);window.removeEventListener('keydown',this.onKey,true);
      this.active=false;this.finishing=false;this.fallingBack=false;this.s.cinematic=false;
      if(this.previousFocus?.isConnected&&!this.previousFocus.closest('[hidden]'))this.previousFocus.focus({preventScroll:true});
      this.onDone?.();
    },300);
  }
}
