// A short in-scene time lapse: evening/twilight or dawn/morning, then the new period.
// Only the two saved gameplay periods remain; weather phases do not change save data.
export class PeriodTransition{
  constructor(session,onDone,renderer){this.s=session;this.onDone=onDone;this.renderer=renderer;this.active=false;this.reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;}
  snapshot(period){
    const game=document.getElementById('game'),canvas=document.createElement('canvas');
    canvas.width=game.width;canvas.height=game.height;canvas.setAttribute('aria-hidden','true');
    const state=this.s.life.state,saved=state.period;
    try{state.period=period;const draw=this.s.mode==='hideout'?'hideout':'world';this.renderer[draw](canvas.getContext('2d'),this.s,canvas.width,canvas.height);}
    finally{state.period=saved;}
    return canvas;
  }
  play(from,to){
    if(from===to||!['day','night'].includes(to)||this.active)return;
    this.active=true;this.s.cinematic=true;this.previousFocus=document.activeElement;this.timers=[];this.animations=[];
    const app=document.getElementById('app');
    this.inert=[...app.children].map(el=>[el,el.inert]);this.inert.forEach(([el])=>el.inert=true);
    const overlay=document.createElement('section');this.overlay=overlay;overlay.id='period-transition';overlay.dataset.to=to;
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',to==='night'?'Вечер переходит в ночь':'Рассвет и утро');
    overlay.innerHTML='<div class="period-warmth"></div><div class="period-twilight"></div><div class="period-caption" role="status"><small></small><h2></h2></div><button class="period-skip">Пропустить →</button>';
    try{
      const before=this.snapshot(from),after=this.snapshot(to);before.className='period-before';after.className='period-after';overlay.prepend(before,after);
    }catch{this.finish(true);return;}
    app.append(overlay);const button=overlay.querySelector('button');button.onclick=()=>this.finish();button.focus();
    this.onKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.finish();}else if(e.key==='Tab'){e.preventDefault();button.focus();}};
    window.addEventListener('keydown',this.onKey,true);
    const reduced=this.reduceMotion(),duration=reduced?450:14000;
    const animate=(selector,frames)=>this.animations.push(overlay.querySelector(selector).animate(frames,{duration,fill:'forwards',easing:'ease-in-out'}));
    const caption=(label,title)=>{if(!this.active||this.finishing)return;overlay.querySelector('small').textContent=label;overlay.querySelector('h2').textContent=title;};
    if(reduced){caption('Время суток',to==='night'?'Ночь':'День');animate('.period-after',[{opacity:0},{opacity:1}]);}
    else{
      const night=to==='night';caption(night?'День → вечер':'Ночь → рассвет',night?'Солнце садится':'Город просыпается');
      animate('.period-after',[{opacity:0,offset:0},{opacity:night?.10:.08,offset:.25},{opacity:night?.36:.50,offset:.55},{opacity:1,offset:1}]);
      animate('.period-warmth',[{opacity:0,offset:0},{opacity:night?.42:.32,offset:.28},{opacity:night?.28:.24,offset:.56},{opacity:0,offset:.92},{opacity:0,offset:1}]);
      animate('.period-twilight',[{opacity:0,offset:0},{opacity:night?.12:.22,offset:.32},{opacity:night?.38:.08,offset:.65},{opacity:0,offset:1}]);
      this.timers.push(setTimeout(()=>caption(night?'Вечер → сумерки':'Рассвет → утро',night?'Зажигаются фонари':'Мягкий свет утра'),duration*.37));
      this.timers.push(setTimeout(()=>caption(night?'Сумерки → ночь':'Утро → день',night?'Ночь принадлежит нам':'Новый день, новый след'),duration*.74));
    }
    this.timers.push(setTimeout(()=>this.finish(),duration));
  }
  finish(immediate=false){
    if(!this.active||this.finishing)return;this.finishing=true;this.timers.forEach(clearTimeout);
    this.overlay.classList.add('leaving');
    const cleanup=()=>{
      this.animations.forEach(a=>a.cancel());this.overlay.remove();
      this.inert.forEach(([el,value])=>el.inert=value);if(this.onKey)window.removeEventListener('keydown',this.onKey,true);
      this.active=false;this.finishing=false;this.s.cinematic=false;
      if(this.previousFocus?.isConnected&&!this.previousFocus.closest('[hidden]'))this.previousFocus.focus({preventScroll:true});
      this.onDone?.();
    };
    if(immediate)cleanup();else setTimeout(cleanup,this.reduceMotion()?100:500);
  }
}
