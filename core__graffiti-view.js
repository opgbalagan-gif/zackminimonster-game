import {EffectPool} from './core__effects.js?v=014abf6eb9c6';
import {MotionShake} from './core__motion-shake.js?v=014abf6eb9c6';
import {wallSurface} from './core__surfaces.js?v=014abf6eb9c6';
import {ink} from './core__hideout.js?v=014abf6eb9c6';
import {GRAFFITI_CONFIG as CONFIG} from './content__graffiti__config.js?v=014abf6eb9c6';

export function renderPaintLayer(context,art,game,width,height){
  context.clearRect(0,0,width,height);
  context.save();context.beginPath();
  for(let i=0;i<game.covered.length;i++)if(game.covered[i])
    context.rect(i%game.cols*width/game.cols,Math.floor(i/game.cols)*height/game.rows,width/game.cols,height/game.rows);
  // An empty clipping region paints nothing. Filling an empty destination-in path
  // leaves the original image untouched, which previously revealed all art at 0%.
  context.clip();context.drawImage(art,0,0);context.restore();
}

export class GraffitiView{
  constructor(canvas,session,renderer,audio){
    this.canvas=canvas;this.c=canvas.getContext('2d');this.session=session;this.renderer=renderer;this.audio=audio;
    this.area={...CONFIG.paintArea};this.activePointer=null;this.game=null;this.effects=new EffectPool(48);this.time=0;this.cursor=null;
    this.motionUntil=0;
    this.motion=new MotionShake(amount=>{
      if(this.session.mode!=='graffiti'||this.game?.phase!=='shake')return;
      this.game.shakeDevice(amount);this.audio.tick();this.motionUntil=this.time+.23;
    });
    canvas.width=CONFIG.canvas.width;canvas.height=CONFIG.canvas.height;
    const move=e=>{
      if(!this.game||this.activePointer!==e.pointerId)return;
      if(this.game.phase==='shake'&&this.motion.listening&&!this.motion.manual)return;
      const r=canvas.getBoundingClientRect(),p={x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};
      this.cursor=p;const g=this.game,phase=g.phase,old=Math.floor(g.shakeProgress*12),a=this.bounds();
      const x=phase==='shake'?p.x/canvas.width:(p.x-a.x)/a.w,y=phase==='shake'?p.y/canvas.height:(p.y-a.y)/a.h;
      g.move(x,y,true);
      if(phase==='shake'&&Math.floor(g.shakeProgress*12)>old)this.audio.tick();
      if(phase==='spray'&&x>=0&&x<=1&&y>=0&&y<=1)this.effects.emit(p.x,p.y,ink(g.ink).color,2);
      if(g.phase!==phase){g.end();this.activePointer=null;this.cursor=null;}
    };
    canvas.addEventListener('pointerdown',e=>{
      if(!this.game||this.activePointer!==null||this.game.done)return;
      e.preventDefault();this.activePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);this.game.end();move(e);
    });
    canvas.addEventListener('pointermove',move);
    const end=e=>{if(e?.pointerId!==undefined&&this.activePointer!==null&&e.pointerId!==this.activePointer)return;this.activePointer=null;this.cursor=null;this.game?.end();};
    for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,end);
    window.addEventListener('blur',end);
  }
  bounds(){const g=this.game;return {...this.area,x:this.area.x+(g?.phase==='stencil'?0:g?.stencilOffset.x??0),y:this.area.y+(g?.phase==='stencil'?0:g?.stencilOffset.y??0)};}
  bind(game){
    this.game=game;this.activePointer=null;this.cursor=null;this.time=0;this.lastStroke=-1;this.effects=new EffectPool(48);
    this.motionUntil=0;this.motion.setActive(false);this.motion.setActive(this.motion.mobile&&game.phase==='shake');
    const create=()=>{const v=document.createElement('canvas');v.width=this.area.w;v.height=this.area.h;return v;};
    this.art=create();this.stencil=create();this.painted=create();
    const c=this.art.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;
    this.renderer.drawGraffiti(c,game.definition.id,0,0,this.area.w,this.area.h,ink(game.ink).color);
    game.setMask(c.getImageData(0,0,this.area.w,this.area.h).data,this.area.w,this.area.h);
    const stencil=this.stencil.getContext('2d');stencil.filter='grayscale(1)';stencil.drawImage(this.art,0,0);stencil.filter='none';
  }
  draw(dt){
    const g=this.game;if(!g)return;const c=this.c,a=this.area,atlas=this.renderer.atlas;this.time+=dt;
    c.clearRect(0,0,768,512);c.imageSmoothingEnabled=false;
    if(this.session.world.tutorial){atlas.draw(c,'graffiti_wall',384,512,768,512);c.fillStyle='#15292566';c.fillRect(0,0,768,512);}
    else if(g.target.wall_type==='brick_wall'||g.definition.wall_asset==='urban_blocks')atlas.draw(c,'graffiti_wall',384,512,768,512);
    else wallSurface(c,g.target.wall_type,0,0,768,512);
    if(g.phase==='shake'){
      c.fillStyle='#101821d9';c.fillRect(0,0,768,512);
      c.strokeStyle='#d4b86033';c.lineWidth=2;c.beginPath();c.arc(384,251,170,0,Math.PI*2);c.stroke();
      const active=this.activePointer!==null||this.time<this.motionUntil,frame=Math.floor(this.time*(active?12:3))%4;
      c.save();c.translate(384+g.canOffset*.65,413);c.rotate(active?Math.sin(this.time*27)*.16:Math.sin(this.time*2)*.025);
      atlas.draw(c,active?CONFIG.shakeFrames[frame]:'can_front',0,0,null,322);c.restore();
      atlas.draw(c,'can_side',146,361,null,126,false,.68);atlas.draw(c,'can_threequarter',622,361,null,126,false,.68);
      c.fillStyle='#ead293';c.font='bold 35px monospace';c.textAlign='center';c.fillText('‹',220,265);c.fillText('›',548,265);
      c.fillStyle='#b7b3ad';c.font='12px monospace';c.fillText('ZACK ORIGINAL / 400 ML',384,466);
    }else{
      const x=a.x+g.stencilOffset.x,y=a.y+g.stencilOffset.y;
      if(g.phase==='stencil'||g.phase==='spray'){
        c.globalAlpha=g.phase==='stencil'?.20:.12;c.drawImage(this.stencil,x,y);c.globalAlpha=1;
        if(g.phase==='stencil'){
          c.strokeStyle='#de98f2';c.lineWidth=5;
          for(const [px,py,sx,sy] of [[x,y,1,1],[x+a.w,y,-1,1],[x,y+a.h,1,-1],[x+a.w,y+a.h,-1,-1]]){
            c.beginPath();c.moveTo(px+sx*22,py);c.lineTo(px,py);c.lineTo(px,py+sy*22);c.stroke();
          }
          atlas.draw(c,'can_threequarter',705,462,null,114);
        }else{
          if(this.lastStroke!==g.strokeCount){
            renderPaintLayer(this.painted.getContext('2d'),this.art,g,a.w,a.h);this.lastStroke=g.strokeCount;
          }
          c.drawImage(this.painted,x,y);
          if(this.cursor){
            const frame=Math.floor(this.time*14)%3;
            c.strokeStyle='#f3e9ca77';c.lineWidth=2;c.beginPath();c.arc(this.cursor.x,this.cursor.y,g.sprayRack?33:23,0,Math.PI*2);c.stroke();
            c.fillStyle=ink(g.ink).color;
            for(let i=0;i<10;i++){const angle=i*2.4+this.time*4,radius=7+(i*7+frame*3)%25;c.globalAlpha=.3;c.fillRect(this.cursor.x+Math.cos(angle)*radius,this.cursor.y+Math.sin(angle)*radius,3,3);}c.globalAlpha=1;
            atlas.draw(c,CONFIG.sprayFrames[frame],this.cursor.x-42,this.cursor.y+104,null,142);
          }else atlas.draw(c,'can_threequarter',702,465,null,122);
        }
      }else{
        c.drawImage(this.art,x,y);
        atlas.draw(c,'can_success',683,148,null,86+Math.sin(this.time*3)*4);
      }
    }
    this.effects.update(dt);
    for(const p of this.effects.items)if(p.life>0){c.globalAlpha=Math.min(1,p.life);c.fillStyle=p.color;c.fillRect(p.x,p.y,4,4);}c.globalAlpha=1;
  }
}
