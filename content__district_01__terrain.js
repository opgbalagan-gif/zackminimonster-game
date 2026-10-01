
import {project} from './core__geometry.js';
import {drawRoadEnds} from './content__district_01__road-ends.js';
export function polygon(c,points,fill,stroke=null,width=1){
  c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();
  if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
export function box(c,x,y,w,h,z,top='#88877e',left='#5e6365',right='#74797a',base=0){
  const a=project(x,y,z),b=project(x+w,y,z),d=project(x,y+h,z),e=project(x+w,y+h,z);
  polygon(c,[d,e,project(x+w,y+h,base),project(x,y+h,base)],left,'#262a30',1);
  polygon(c,[b,e,project(x+w,y+h,base),project(x+w,y,base)],right,'#262a30',1);
  polygon(c,[a,b,e,d],top,'#252a2e',1);
}
export function ground(c,w,plate,cam,width,height,textures){
  c.save();c.transform(1,.5,-1,.5,0,0);
  if(w.landPolygons){c.beginPath();for(const p of w.urbanPolygons??w.landPolygons){p.forEach((a,i)=>i?c.lineTo(a.x,a.y):c.moveTo(a.x,a.y));c.closePath();}c.clip();}
  else if(w.regions){c.beginPath();for(const r of w.regions)c.rect(r.x,r.y,r.w,r.h);c.clip();}
  const cx=cam.y+cam.x*.5,cy=cam.y-cam.x*.5,extent=(height*.5+width*.25)/cam.zoom+360;
  for(let y=Math.floor((cy-extent)/1408)*1408;y<cy+extent;y+=1408)
    for(let x=Math.floor((cx-extent)/1600)*1600;x<cx+extent;x+=1600)c.drawImage(plate,x,y);
  c.fillStyle='#171d2844';c.fillRect(0,w.metro.y+23,w.width,w.metro.width+28);
  if(textures){
    drawRoadEnds(c,w,textures);
    // The narrow strip beside the river is a quay, not half of a cut road.
    if(w.regions){c.fillStyle=textures.paving;c.fillRect(2912,48,96,5500);}
  }
  for(const r of w.parkingLots??[]){
    c.fillStyle='#525653';c.fillRect(r.x,r.y,r.w,r.h);c.strokeStyle='#d1cbb2';c.lineWidth=2;
    for(let x=r.x+12;x<r.x+r.w-20;x+=44){c.strokeRect(x,r.y+9,39,55);}
    c.fillStyle='#e5dcc2';c.font='bold 28px monospace';c.fillText('P',r.x+r.w/2,r.y+r.h-12);
  }
  c.restore();
}
