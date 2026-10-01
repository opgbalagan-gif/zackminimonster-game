import {project} from './core__geometry.js';
import {polygon} from './content__district_01__terrain.js';
export function tunnelFencePieces(world){
  const pieces=[];
  for(const r of world.obstacles.filter(o=>o.tunnelCollider)){
    const corners=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]];
    for(let i=0;i<4;i++){
      const a=corners[i],b=corners[(i+1)%4],count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/38);
      for(let j=0;j<count;j++){
        const x=a[0]+(b[0]-a[0])*j/count,y=a[1]+(b[1]-a[1])*j/count,x2=a[0]+(b[0]-a[0])*(j+1)/count,y2=a[1]+(b[1]-a[1])*(j+1)/count;
        pieces.push({kind:'tunnelFence',item:{x,y,x2,y2},depth:(x+y+x2+y2)/2+3});
      }
    }
  }return pieces;
}
export function drawTunnelFence(c,o){
  const a=project(o.x,o.y,45),b=project(o.x2,o.y2,45),d=project(o.x,o.y),e=project(o.x2,o.y2);
  c.save();polygon(c,[a,b,e,d],'#263d3c20','#3b4947',1);c.clip();
  c.strokeStyle='#9baaa080';c.lineWidth=.8;
  const dx=b.x-a.x,dy=b.y-a.y;
  for(let n=-50;n<100;n+=9)for(const sign of [-1,1]){c.beginPath();c.moveTo(a.x,a.y+n);c.lineTo(b.x,b.y+n+sign*Math.abs(dx)*.65);c.stroke();}
  c.restore();
  c.strokeStyle='#293b3b';c.lineWidth=3;c.beginPath();c.moveTo(d.x,d.y);c.lineTo(a.x,a.y-3);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.moveTo(d.x,d.y-5);c.lineTo(e.x,e.y-5);c.stroke();
  c.strokeStyle='#9aaba2';c.lineWidth=1;c.beginPath();c.moveTo(d.x+1,d.y);c.lineTo(a.x+1,a.y-3);c.stroke();
}
