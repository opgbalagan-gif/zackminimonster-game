import {project} from './core__geometry.js';
import {box} from './content__district_01__terrain.js';

export function loopPosition(m,travel){
  const lengths=m.loop.map((p,i)=>{const q=m.loop[(i+1)%m.loop.length];return Math.hypot(q.x-p.x,q.y-p.y);});
  const total=lengths.reduce((a,b)=>a+b,0);travel=((travel%total)+total)%total;
  for(let i=0;i<lengths.length;i++){if(travel>lengths[i]){travel-=lengths[i];continue;}
    const a=m.loop[i],b=m.loop[(i+1)%m.loop.length],t=travel/lengths[i];return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,axis:a.x===b.x?'y':'x',direction:Math.sign(b.x-a.x||b.y-a.y)};}
}
export function loopRails(m){
  const result=[];
  m.loop.forEach((a,i)=>{const b=m.loop[(i+1)%m.loop.length],vertical=a.x===b.x,len=Math.hypot(b.x-a.x,b.y-a.y);
    for(let n=0;n<len;n+=96){const size=Math.min(96,len-n),x=vertical?a.x-32:Math.min(a.x,b.x)+n,y=vertical?Math.min(a.y,b.y)+n:a.y-32;
      result.push({x,y,w:vertical?64:size,h:vertical?size:64,axis:vertical?'y':'x'});}
  });return result;
}
export function drawLoopRail(c,r,m){
  box(c,r.x,r.y,r.w,r.h,m.height,'#697271','#37434a','#46555a',m.height-13);
  const vertical=r.axis==='y',length=vertical?r.h:r.w;
  c.lineWidth=3;c.strokeStyle='#9c9484';
  for(let n=4;n<length;n+=14){const a=project(r.x+(vertical?7:n),r.y+(vertical?n:7),m.height+2),b=project(r.x+(vertical?57:n),r.y+(vertical?n:57),m.height+2);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  for(const side of [14,50]){const a=project(r.x+(vertical?side:0),r.y+(vertical?0:side),m.height+4),b=project(r.x+(vertical?side:r.w),r.y+(vertical?r.h:side),m.height+4);c.strokeStyle='#d0cec0';c.lineWidth=3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
}

export function trainCars(m,time){
  if(m.loop){
    const lengths=m.loop.map((p,i)=>{const q=m.loop[(i+1)%m.loop.length];return Math.hypot(q.x-p.x,q.y-p.y);});
    const period=lengths.reduce((s,n)=>s+n/110+4,0);let clock=time%period,travel=0;
    for(const length of lengths){if(clock<4)break;clock-=4;if(clock<length/110){travel+=clock*110;break;}clock-=length/110;travel+=length;}
    return Array.from({length:4},(_,i)=>({...loopPosition(m,travel-i*145),front:i===0}));
  }
  const start=m.x-650,end=m.end+180,lead=start+(time*86)%(end-start);
  return Array.from({length:4},(_,i)=>({x:lead+i*145,y:m.y+m.width/2,front:i===3}))
    .filter(car=>car.x>m.x-160&&car.x<m.end+160);
}
export function drawTrain(c,car,m,atlas){
  const id=car.front?'train_front':'train_car',rect=atlas.rect(id);
  const width=180,height=width*rect[3]/rect[2];
  const contact=project(car.x,car.y,m.height+4);
  // The PNG includes a tall body and sloping chassis. Anchor the footprint centre,
  // not its lowest corner, to the centreline halfway between the two rails.
  c.save();c.translate(contact.x,contact.y);if(car.axis==='y')c.scale(-1,1);
  atlas.draw(c,id,width*.015,height*.28,width);c.restore();
}
