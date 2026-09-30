
import {project} from './core__geometry.js';
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
export function ground(c,w,plate,cam,width,height){
  c.save();c.transform(1,.5,-1,.5,0,0);
  const cx=cam.y+cam.x*.5,cy=cam.y-cam.x*.5,extent=(height*.5+width*.25)/cam.zoom+360;
  for(let y=Math.floor((cy-extent)/1408)*1408;y<cy+extent;y+=1408)
    for(let x=Math.floor((cx-extent)/1600)*1600;x<cx+extent;x+=1600)c.drawImage(plate,x,y);
  c.fillStyle='#171d2844';c.fillRect(0,w.metro.y+23,w.width,w.metro.width+28);
  c.restore();
}
