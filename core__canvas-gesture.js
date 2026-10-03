// Resolve taps on release so a two-finger pinch never starts a walking route.
export function bindCanvasGesture(canvas,{tap,pan,zoom,start}={}){
  const points=new Map();let pinched=false,dragged=false,lastDistance=0;
  const span=()=>{const [a,b]=[...points.values()];return Math.hypot(a.x-b.x,a.y-b.y);};
  const reset=()=>{points.clear();pinched=false;dragged=false;lastDistance=0;};
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);
    if(!points.size){pinched=false;dragged=false;start?.();}
    points.set(e.pointerId,{x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY});
    if(points.size===2){pinched=true;lastDistance=span();}
  });
  canvas.addEventListener('pointermove',e=>{
    const p=points.get(e.pointerId);if(!p)return;e.preventDefault();
    const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(Math.hypot(p.x-p.originX,p.y-p.originY)>9)dragged=true;
    if(points.size===2){const d=span();if(lastDistance>8&&d>8)zoom?.(d/lastDistance);lastDistance=d;}
    else if(!pinched)pan?.(dx,dy);
  });
  const end=e=>{if(!points.has(e.pointerId))return;const isTap=e.type==='pointerup'&&!pinched&&!dragged&&points.size===1;points.delete(e.pointerId);if(isTap)tap?.(e.clientX,e.clientY);if(!points.size)reset();};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,end);
  canvas.addEventListener('wheel',e=>{if(!zoom)return;e.preventDefault();zoom(Math.exp(-Math.max(-150,Math.min(150,e.deltaY))*.002));},{passive:false});
  return reset;
}
