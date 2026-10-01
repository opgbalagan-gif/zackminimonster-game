import {project} from './core__geometry.js';
import {box,polygon} from './content__district_01__terrain.js';

export function drawWater(c,cam,width,height,time){
  const left=cam.x-width/2/cam.zoom-180,top=cam.y-height/2/cam.zoom-180;
  const right=cam.x+width/2/cam.zoom+180,bottom=cam.y+height/2/cam.zoom+180;
  c.fillStyle='#183844';c.fillRect(left,top,right-left,bottom-top);
  const step=cam.zoom<.2?220:75;
  c.lineWidth=1.4/Math.max(.45,cam.zoom);
  for(let y=Math.floor(top/step)*step;y<bottom;y+=step)for(let x=Math.floor(left/step)*step;x<right;x+=step){
    const seed=Math.abs(Math.sin(x*13+y*7)),shift=Math.sin(time*.65+seed*12)*7;
    c.strokeStyle=seed>.5?'#51858455':'#32637066';
    c.beginPath();c.moveTo(x+shift,y+seed*step);c.lineTo(x+shift+18+seed*30,y+seed*step);c.stroke();
  }
}
export function drawShore(c,world){
  if(world.landPolygons){
    for(const poly of world.landPolygons){
      polygon(c,poly.map(p=>project(p.x,p.y,-12)),null,world.beaches?'#68b5aa77':'#659a9966',world.beaches?38:16);
      for(let i=0;i<poly.length;i++){
        const a=poly[i],b=poly[(i+1)%poly.length],beach=world.beaches&&a.y>5700&&b.y>5700,z=beach?-5:-28;
        polygon(c,[project(a.x,a.y),project(b.x,b.y),project(b.x,b.y,z),project(a.x,a.y,z)],beach?'#ead7aa':'#52686b',beach?'#f2e4c7':'#273d46',beach?4:2);
      }
    }return;
  }
  for(const r of world.regions){
    box(c,r.x-8,r.y-8,r.w+16,r.h+16,-1,'#c4b79a','#435964','#5c737a',-35);
    const points=[project(r.x-22,r.y-22,-35),project(r.x+r.w+22,r.y-22,-35),project(r.x+r.w+22,r.y+r.h+22,-35),project(r.x-22,r.y+r.h+22,-35)];
    polygon(c,points,null,'#7abdb377',5);
  }
}
export function drawBridges(c,session,plate){
  for(const b of session.world.bridges??[]){
    if(b.kind==='street')continue;
    box(c,b.x,b.y,b.w,b.h,0,'#777d79','#414d52','#4b5c61',-25);
    // Reuse the actual road/sidewalk pixels instead of a separate flat bridge surface.
    if(plate){c.save();c.transform(1,.5,-1,.5,0,0);c.drawImage(plate,420,1172,360,136,b.x,b.y-12,b.w,b.h+24);c.restore();}
    const vertical=b.h>b.w;
    const a=project(b.x+(vertical?b.w/2:0),b.y+(vertical?0:b.h/2)),z=project(b.x+(vertical?b.w/2:b.w),b.y+(vertical?b.h:b.h/2));
    c.strokeStyle='#d8c187';c.lineWidth=2;c.setLineDash([14,16]);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(z.x,z.y);c.stroke();c.setLineDash([]);
    for(const side of [0,1]){const p=project(b.x,b.y+b.h*side,20),q=project(b.x+b.w,b.y+b.h*side,20);c.strokeStyle='#252f32';c.lineWidth=4;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();}
    const size=vertical?b.h:b.w;
    for(let n=30;n<size-30;n+=100){
      const x=b.x+(vertical?0:n),y=b.y+(vertical?n:0);
      for(const side of [0,1]){
        const p=project(x+(vertical?b.w*side:0),y+(vertical?0:b.h*side));
        c.strokeStyle='#bbc0a4';c.lineWidth=3;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x,p.y-28);c.stroke();
        c.fillStyle='#ead8a0';c.fillRect(p.x-3,p.y-31,6,5);
      }
    }
    const open=session.city.find(r=>r.id===b.to)?.open;
    if(!open){
      const x=b.approach.x+(vertical?0:(b.from==='arts'?-44:44)),y=b.approach.y+(vertical?48:0);
      box(c,x-(vertical?44:4),y-(vertical?4:40),vertical?88:8,vertical?8:80,28,'#ecc66a','#9c653f','#d59d52');
    }
  }
}
