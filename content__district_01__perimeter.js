import {project,inside} from './core__geometry.js';
import {box,polygon} from './content__district_01__terrain.js';
export function perimeterPieces(world){
  const pieces=[];
  for(const edge of world.boundaries){
    const axis=edge.w>edge.h?'x':'y',size=axis==='x'?edge.w:edge.h;
    for(let n=0;n<size;n+=64){const r={x:edge.x+(axis==='x'?n:0),y:edge.y+(axis==='y'?n:0),
      w:axis==='x'?Math.min(64,size-n):edge.w,h:axis==='y'?Math.min(64,size-n):edge.h};
      r.gate=world.roads.some(road=>inside(r.x+r.w/2,r.y+r.h/2,road,8));pieces.push(r);
    }
  }return pieces;
}
export function drawPerimeter(c,r){
  box(c,r.x,r.y,r.w,r.h,r.gate?28:12,r.gate?'#c6b78b':'#92978c','#666e69','#7d8277');
  const axis=r.w>r.h?'x':'y',length=axis==='x'?r.w:r.h;
  if(r.gate){
    for(let n=3;n<length-3;n+=14){
      const p=project(r.x+(axis==='x'?n:0),r.y+(axis==='y'?n:0),27);
      c.fillStyle='#c26644';c.fillRect(p.x,p.y,6,16);
    }
  }else{
    const a=project(r.x,r.y,54),b=project(r.x+r.w,r.y+r.h,54),d=project(r.x,r.y,12),e=project(r.x+r.w,r.y+r.h,12);
    polygon(c,[a,b,e,d],'#4b625526','#56615c',1);
    c.save();c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(d.x,d.y);c.closePath();c.clip();
    c.strokeStyle='#6e807566';c.lineWidth=1;
    const left=Math.min(a.x,b.x)-50,right=Math.max(a.x,b.x)+50,top=Math.min(a.y,b.y)-60,bottom=Math.max(d.y,e.y)+60;
    for(let x=left-150;x<right+150;x+=12){c.beginPath();c.moveTo(x,top);c.lineTo(x+150,bottom);c.moveTo(x+150,top);c.lineTo(x,bottom);c.stroke();}c.restore();
    for(const p of [a,b]){c.fillStyle='#283a39';c.fillRect(p.x-2,p.y-3,4,47);c.fillStyle='#90988b';c.fillRect(p.x-1,p.y,1,44);}
  }
}
