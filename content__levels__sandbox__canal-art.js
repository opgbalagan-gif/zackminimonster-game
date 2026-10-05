import {project} from './core__geometry.js?v=8a0ece6e2747';
import {polygon} from './content__district_01__terrain.js?v=8a0ece6e2747';

// Sparse painted shapes stay anchored in world space while the surface drifts.
export function drawCanal(c,r,{night=false,time=0,view=r,bridges=[]}={}){
  const q=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(p=>project(...p));
  c.save();polygon(c,q,night?'#294f62':'#77adbb');c.clip();c.transform(1,.5,-1,.5,0,0);
  const gradient=c.createLinearGradient(r.x,0,r.x+r.w,0);
  for(const [at,color] of (night?[[0,'#416775'],[.12,'#315c6d'],[.48,'#244b60'],[.85,'#315e70'],[1,'#507a81']]:[[0,'#a2c9bf'],[.12,'#79b4bd'],[.48,'#619cab'],[.85,'#7fb8bd'],[1,'#afd0c0']]))gradient.addColorStop(at,color);
  c.fillStyle=gradient;c.fillRect(r.x,r.y,r.w,r.h);
  const top=Math.max(r.y,view.y-180),bottom=Math.min(r.y+r.h,view.y+view.h+180);
  // Broad reflections, deliberately low contrast and without photographic noise.
  for(let y=Math.floor(top/230)*230;y<bottom;y+=230){
    const phase=y*.019+time*.14,sway=Math.sin(phase)*9;
    c.fillStyle=night?'#77989e18':'#e1ebd630';
    c.beginPath();c.moveTo(r.x+20,y+25);c.bezierCurveTo(r.x+r.w*.45,y-10+sway,r.x+r.w*.52,y+88,r.x+r.w-22,y+44);c.lineTo(r.x+r.w-30,y+77);c.bezierCurveTo(r.x+r.w*.55,y+119,r.x+r.w*.44,y+38+sway,r.x+24,y+57);c.closePath();c.fill();
  }
  for(const b of bridges){
    if(b.x+b.w<r.x||b.x>r.x+r.w)continue;
    c.fillStyle=night?'#142e4255':'#31586230';c.fillRect(r.x,b.y+20,r.w,b.h+35);
  }
  // Bank reflection and thin highlights follow the water, not the viewport edge.
  c.lineCap='round';
  for(const side of [0,1]){
    const x=r.x+(side?r.w-7:7);
    c.strokeStyle=night?'#152f4070':'#345f6750';c.lineWidth=9;
    c.beginPath();c.moveTo(x,top);c.lineTo(x,bottom);c.stroke();
    c.strokeStyle=night?'#93b4b260':'#e1e7cda0';c.lineWidth=2;
    for(let y=Math.floor(top/82)*82;y<bottom;y+=82){const drift=Math.sin(time*.45+y)*2;c.beginPath();c.moveTo(x+(side?-6:6)+drift,y+7);c.quadraticCurveTo(x+(side?-8:8)+drift,y+27,x+(side?-6:6)+drift,y+51);c.stroke();}
  }
  c.lineWidth=1.5;
  for(let y=Math.floor(top/105)*105;y<bottom;y+=105){
    for(let i=0;i<2;i++){
      const seed=Math.sin(y*.071+i*8),x=r.x+32+(i*.43+.1+seed*.065)*(r.w-65),yy=y+i*38+Math.sin(time*.3+y*.023)*7;
      c.strokeStyle=night?'#aec9c565':'#e1eee1ad';
      c.beginPath();c.moveTo(x,yy);c.quadraticCurveTo(x+13,yy-4,x+29,yy-1);c.stroke();
      if(seed>.2){c.strokeStyle=night?'#8cb3b333':'#d0e7dc70';c.beginPath();c.moveTo(x+9,yy+10);c.lineTo(x+22,yy+10);c.stroke();}
    }
  }
  c.restore();
  c.save();c.lineJoin='round';polygon(c,q,null,night?'#82918a':'#d8d5b7',3);c.restore();
}
