import {bindCanvasGesture} from './core__canvas-gesture.js?v=cfa54f753bac';
export class InputController{
  constructor(canvas,callbacks){
    this.canvas=canvas;this.callbacks=callbacks;this.keys=new Set();this.stick={x:0,y:0};this.activeStick=null;
    const handled=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyE','KeyM','Space','Escape','F3'];
    document.addEventListener('keydown',event=>{
      if(event.target.matches('select,input,textarea'))return;
      if(event.target.closest('button')&&['Enter','Space'].includes(event.code))return;
      if(handled.includes(event.code))event.preventDefault();
      this.keys.add(event.code);
      if(!event.repeat){
        if(['KeyE','Space','Enter'].includes(event.code))callbacks.action();
        if(event.code==='KeyM')callbacks.map();
        if(event.code==='Escape')callbacks.back();
        if(event.code==='F3')callbacks.debug();
      }
    });
    document.addEventListener('keyup',e=>this.keys.delete(e.code));
    window.addEventListener('blur',()=>this.reset());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});
    this.resetCanvas=bindCanvasGesture(canvas,{zoom:callbacks.zoom,tap:(x,y)=>{const r=canvas.getBoundingClientRect();callbacks.destination((x-r.left)*canvas.width/r.width,(y-r.top)*canvas.height/r.height);}});
    const pad=document.querySelector('#joystick'),knob=pad.querySelector('.stick-knob'),action=document.querySelector('#action-button');
    knob.append(action);
    // Pointer actions are resolved on release, so dragging never also activates an object.
    action.addEventListener('click',e=>{if(e.detail){e.preventDefault();e.stopImmediatePropagation();}},true);
    let gesture=null;
    const update=e=>{
      const r=pad.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,length=Math.hypot(dx,dy);
      const magnitude=Math.min(1,length/(r.width*.32));
      this.stick=length<8?{x:0,y:0}:{x:dx/length*magnitude,y:dy/length*magnitude};
      knob.style.transform='translate('+this.stick.x*24+'px,'+this.stick.y*24+'px)';
    };
    pad.addEventListener('pointerdown',e=>{if(e.button!==0||this.activeStick!==null)return;e.preventDefault();pad.setPointerCapture(e.pointerId);this.activeStick=e.pointerId;gesture={x:e.clientX,y:e.clientY,tap:action.contains(e.target)&&!action.hidden&&!action.disabled,dragged:false};if(!gesture.tap)update(e);});
    pad.addEventListener('pointermove',e=>{if(e.pointerId!==this.activeStick)return;if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>10)gesture.dragged=true;if(!gesture.tap||gesture.dragged)update(e);});
    const end=e=>{if(e.pointerId!==this.activeStick)return;const tap=e.type==='pointerup'&&gesture?.tap&&!gesture.dragged&&!action.hidden&&!action.disabled;gesture=null;this.activeStick=null;this.stick={x:0,y:0};knob.style.transform='';if(tap)callbacks.action();};
    this.resetStick=()=>{gesture=null;this.activeStick=null;this.stick={x:0,y:0};knob.style.transform='';};
    for(const name of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(name,end);
  }
  movement(){
    const k=this.keys;let x=this.stick.x,y=this.stick.y;
    if(k.has('ArrowLeft')||k.has('KeyA'))x--;if(k.has('ArrowRight')||k.has('KeyD'))x++;
    if(k.has('ArrowUp')||k.has('KeyW'))y--;if(k.has('ArrowDown')||k.has('KeyS'))y++;
    const n=Math.hypot(x,y);return n>1?{x:x/n,y:y/n}:{x,y};
  }
  reset(){this.keys.clear();this.resetCanvas?.();this.resetStick?.();this.stick={x:0,y:0};this.activeStick=null;}
}
