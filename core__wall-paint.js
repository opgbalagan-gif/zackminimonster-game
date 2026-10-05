import {wallUV,wallPoint,VerticalShake} from './core__wall-paint-input.js?v=252855055fad';
import {dialogFocus} from './core__dialog-focus.js?v=252855055fad';
import {GRAFFITI_CONFIG} from './content__graffiti__config.js?v=252855055fad';
export class WallPaint{
  constructor(view){
    this.view=view;this.s=view.session;this.shake=new VerticalShake();this.pointer=null;this.cursor=null;this.keys={x:.5,y:.5};this.time=0;
    document.getElementById('wall-paint')?.remove();
    this.el=document.createElement('section');this.el.id='wall-paint';this.el.hidden=true;this.el.setAttribute('role','dialog');this.el.setAttribute('aria-modal','true');this.el.setAttribute('aria-label','Рисование на стене');
    this.el.innerHTML='<canvas class="wall-paint-input" tabindex="0" aria-label="Резко води вверх-вниз, чтобы встряхнуть баллон"></canvas><button class="wall-paint-close" aria-label="Отменить рисование">×</button><div class="wall-paint-hint"><strong></strong><span></span><progress max="1" value="0" aria-label="Готовность баллона"></progress><button class="wall-paint-done" hidden>Готово ↗</button></div>';
    document.getElementById('app').append(this.el);this.canvas=this.el.querySelector('canvas');this.c=this.canvas.getContext('2d');
    this.focus=dialogFocus(this.el,()=>this.cancel());this.el.querySelector('.wall-paint-close').onclick=()=>this.cancel();this.el.querySelector('.wall-paint-done').onclick=()=>{this.s.completeGraffiti();this.sync();};
    const end=()=>{this.pointer=null;this.cursor=null;this.shake.reset();this.view.game?.end();};this.end=end;
    this.canvas.addEventListener('pointerdown',e=>{
      if(e.button!==0||this.view.game?.done)return;
      if(this.pointer!==null){end();return;}e.preventDefault();this.canvas.focus({preventScroll:true});this.pointer=e.pointerId;this.canvas.setPointerCapture(e.pointerId);this.view.game.end();this.shake.reset();this.move(e);
    });
    this.canvas.addEventListener('pointermove',e=>{if(e.pointerId===this.pointer)this.move(e);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])this.canvas.addEventListener(type,e=>{if(e.pointerId===this.pointer)end();});
    window.addEventListener('blur',end);document.addEventListener('visibilitychange',()=>{if(document.hidden)end();});
    this.el.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.cancel();return;}
      if(e.target!==this.canvas)return;
      const g=this.view.game,dirs={ArrowLeft:[-.035,0],ArrowRight:[.035,0],ArrowUp:[0,-.035],ArrowDown:[0,.035]};
      if(!dirs[e.key]&&![' ','Enter'].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();
      if(g.done){if(e.key==='Enter'){this.s.completeGraffiti();this.sync();}return;}
      if(g.phase==='shake'){
        if(!e.repeat&&['ArrowUp','ArrowDown'].includes(e.key)&&this.lastShakeKey!==e.key){this.lastShakeKey=e.key;g.shakeDevice(.18);this.view.audio.tick();this.ready();}return;
      }
      if(dirs[e.key]){const d=dirs[e.key];this.keys.x=Math.max(0,Math.min(1,this.keys.x+d[0]));this.keys.y=Math.max(0,Math.min(1,this.keys.y+d[1]));}
      if(g.surface)this.cursor=wallPoint(g.surface,this.keys.x,this.keys.y);
      if(e.key===' '||e.key==='Enter'||e.shiftKey){g.move(this.keys.x,this.keys.y);g.end();}
    },true);
  }
  cancel(){this.end();this.s.cancelGraffiti();this.sync();}
  ready(){const g=this.view.game;if(g?.phase==='stencil'){g.stencilOffset={x:0,y:0};g.confirm();this.end();}}
  move(e){
    const g=this.view.game;if(!g||g.choosing||g.done)return;
    const r=this.canvas.getBoundingClientRect(),x=(e.clientX-r.left)*this.canvas.width/r.width,y=(e.clientY-r.top)*this.canvas.height/r.height;this.cursor={x,y};
    if(g.phase==='shake'){
      const amount=this.shake.sample(e.clientX,e.clientY,e.timeStamp);if(amount){g.shakeDevice(amount);this.view.audio.tick();this.ready();}return;
    }
    const p=wallUV(g.surface,x,y);if(!p||p.x<0||p.x>1||p.y<0||p.y>1){g.end();return;}
    g.move(p.x,p.y);
  }
  sync(){
    const g=this.s.graffiti,active=this.s.mode==='graffiti'&&!!g&&!g.choosing;
    this.el.hidden=!active;document.getElementById('app').dataset.wallPainting=String(active);
    if(!active){if(this.opened){this.end();this.opened=false;this.focus.close();}return;}
    if(!this.opened){this.opened=true;this.keys={x:.5,y:.5};this.lastShakeKey=null;this.focus.open();this.canvas.focus({preventScroll:true});}
    this.ready();const shaking=g.phase==='shake',done=g.done,progress=this.el.querySelector('progress');this.el.dataset.phase=g.phase;
    this.el.querySelector('strong').textContent=done?'Стена твоя!':shaking?'Встряхни баллон':'Закрась трафарет';
    this.el.querySelector('.wall-paint-hint>span').textContent=done?'':shaking?'Резкие свайпы вверх-вниз':'Зажми и веди по рисунку';
    progress.value=shaking?g.shakeProgress:g.coverage;progress.setAttribute('aria-label',shaking?'Готовность баллона':'Закрашено');
    this.el.querySelector('.wall-paint-done').hidden=!done;this.el.querySelector('.wall-paint-close').hidden=done;
    this.canvas.setAttribute('aria-label',shaking?'Встряхни баллон: свайпы вверх-вниз или чередуй стрелки вверх и вниз':'Рисуй на стене: веди пальцем; стрелки перемещают баллон, пробел распыляет');
  }
  draw(dt){
    this.sync();if(this.el.hidden)return;this.time+=dt;
    const source=document.getElementById('game');if(this.canvas.width!==source.width)this.canvas.width=source.width;if(this.canvas.height!==source.height)this.canvas.height=source.height;
    const c=this.c,g=this.view.game;c.clearRect(0,0,this.canvas.width,this.canvas.height);if(!g||g.done)return;
    const shaking=g.phase==='shake',p=this.cursor??(shaking?{x:this.canvas.width*.5,y:this.canvas.height*.64}:g.surface?wallPoint(g.surface,.8,.8):{x:0,y:0});
    const cssScale=this.canvas.width/this.canvas.getBoundingClientRect().width,size=shaking?112:72;
    c.save();c.imageSmoothingEnabled=true;c.translate(p.x,p.y);c.scale(cssScale,cssScale);
    if(shaking){c.rotate(g.canOffset*.008);this.view.renderer.atlas.draw(c,'can_threequarter',0,size*.8,null,size);c.fillStyle='#ffedaa';c.font='bold 26px sans-serif';c.textAlign='center';c.fillText('↕',-50,35);}
    else{
      c.strokeStyle='#fff4c4bb';c.lineWidth=1.4;c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.stroke();
      if(this.pointer!==null){const gradient=c.createRadialGradient(0,0,1,0,0,22);gradient.addColorStop(0,'#eac5ff66');gradient.addColorStop(1,'#eac5ff00');c.fillStyle=gradient;c.fillRect(-22,-22,44,44);}
      this.view.renderer.atlas.draw(c,this.pointer===null?'can_threequarter':GRAFFITI_CONFIG.sprayFrames[Math.floor(this.time*12)%3],-23,67,null,size);
    }c.restore();
  }
}
