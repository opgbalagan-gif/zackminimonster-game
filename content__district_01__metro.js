import {project} from './core__geometry.js';
import {box,polygon} from './content__district_01__terrain.js';
const routes=new WeakMap();
export function metroRoute(m){
  if(routes.has(m))return routes.get(m);
  const points=[],stops=[],radius=m.cornerRadius??300;
  const toward=(a,b,n)=>{const l=Math.hypot(b.x-a.x,b.y-a.y);return{x:a.x+(b.x-a.x)*n/l,y:a.y+(b.y-a.y)*n/l};};
  const add=p=>{const last=points.at(-1);points.push({...p,s:last?last.s+Math.hypot(p.x-last.x,p.y-last.y):0});};
  for(let i=0;i<m.loop.length;i++){
    const a=m.loop[i],b=m.loop[(i+1)%4],next=m.loop[(i+2)%4],start=toward(a,b,radius),end=toward(b,a,radius),exit=toward(b,next,radius);
    if(!i)add(start);stops.push(points.at(-1).s);
    const steps=Math.ceil(Math.hypot(end.x-start.x,end.y-start.y)/60);
    for(let n=1;n<=steps;n++)add({x:start.x+(end.x-start.x)*n/steps,y:start.y+(end.y-start.y)*n/steps});
    for(let n=1;n<=24;n++){const t=n/24,u=1-t;add({x:u*u*end.x+2*u*t*b.x+t*t*exit.x,y:u*u*end.y+2*u*t*b.y+t*t*exit.y});}
  }
  const route={points,stops,length:points.at(-1).s};routes.set(m,route);return route;
}
export function trackHeight(m,p){
  if(!m.underground||Math.abs(p.x-m.loop[1].x)>8)return m.height;
  const {entry,start,end,exit}=m.underground,low=-90;
  if(p.y<entry||p.y>exit)return m.height;
  const smooth=t=>t*t*(3-2*t);
  if(p.y<start)return m.height+(low-m.height)*smooth((p.y-entry)/(start-entry));
  if(p.y<=end)return low;
  return low+(m.height-low)*smooth((p.y-end)/(exit-end));
}
export function loopPosition(m,travel){
  const route=metroRoute(m);travel=((travel%route.length)+route.length)%route.length;
  let low=1,high=route.points.length-1;while(low<high){const mid=(low+high)>>1;if(route.points[mid].s<travel)low=mid+1;else high=mid;}
  const a=route.points[low-1],b=route.points[low],length=b.s-a.s,t=(travel-a.s)/length,dx=(b.x-a.x)/length,dy=(b.y-a.y)/length;
  const p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,dx,dy,axis:Math.abs(dx)>Math.abs(dy)?'x':'y',direction:Math.sign(Math.abs(dx)>Math.abs(dy)?dx:dy)};
  p.z=trackHeight(m,p);p.underground=!!m.underground&&Math.abs(p.x-m.loop[1].x)<8&&p.y>m.underground.start&&p.y<m.underground.end;return p;
}
export function loopRails(m){
  const {points}=metroRoute(m);return points.slice(1).map((b,i)=>{const a=points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);return{x:(a.x+b.x)/2,y:(a.y+b.y)/2,w:0,h:0,a,b,nx:-dy/len,ny:dx/len,axis:Math.abs(dx)>Math.abs(dy)?'x':'y',za:trackHeight(m,a),zb:trackHeight(m,b)};});
}
export function drawLoopRail(c,r,m){
  const u=m.underground;if(u&&Math.abs(r.x-m.loop[1].x)<8&&r.y>u.start&&r.y<u.end)return;
  const point=(p,n,z)=>project(p.x+r.nx*n,p.y+r.ny*n,z);
  const top=[point(r.a,-32,r.za),point(r.b,-32,r.zb),point(r.b,32,r.zb),point(r.a,32,r.za)];
  if(Math.min(r.za,r.zb)<0){
    polygon(c,[point(r.a,-39,0),point(r.b,-39,0),point(r.b,39,0),point(r.a,39,0)],'#131c23');
    for(const n of [-36,36])polygon(c,[point(r.a,n,0),point(r.b,n,0),point(r.b,n,r.zb-8),point(r.a,n,r.za-8)],'#56636a','#26373e',2);
  }
  polygon(c,[top[2],top[3],point(r.a,32,r.za-14),point(r.b,32,r.zb-14)],'#37434a','#27333d',1);
  polygon(c,top,'#697271','#293a42',1);
  const len=r.b.s-r.a.s;
  for(let n=0;n<len;n+=13){const t=n/len,p={x:r.a.x+(r.b.x-r.a.x)*t,y:r.a.y+(r.b.y-r.a.y)*t},z=r.za+(r.zb-r.za)*t;c.strokeStyle='#a49a82';c.lineWidth=3;const a=point(p,-26,z+2),b=point(p,26,z+2);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  for(const n of [-19,19]){const a=point(r.a,n,r.za+4),b=point(r.b,n,r.zb+4);c.strokeStyle='#dad6c4';c.lineWidth=3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
}
export function trainCars(m,time){
  if(m.loop){
    const route=metroRoute(m),ends=[...route.stops.slice(1),route.length],period=route.length/110+route.stops.length*4;let clock=time%period,travel=0;
    for(let i=0;i<ends.length;i++){travel=route.stops[i];if(clock<4)break;clock-=4;const length=ends[i]-travel;if(clock<length/110){travel+=clock*110;break;}clock-=length/110;travel=ends[i];}
    return Array.from({length:4},(_,i)=>({...loopPosition(m,travel-i*145),front:i===0}));
  }
  const start=m.x-650,end=m.end+180,lead=start+(time*86)%(end-start);
  return Array.from({length:4},(_,i)=>({x:lead+i*145,y:m.y+m.width/2,front:i===3})).filter(car=>car.x>m.x-160&&car.x<m.end+160);
}
export function drawTrain(c,car,m,atlas){
  if(!m.loop){const id=car.front?'train_front':'train_car',rect=atlas.rect(id),width=180,height=width*rect[3]/rect[2],p=project(car.x,car.y,m.height+4);c.save();c.translate(p.x,p.y);atlas.draw(c,id,width*.015,height*.28,width);c.restore();return;}
  if(car.underground)return;
  const z=car.z+5,point=(u,v,h)=>project(car.x+car.dx*u-car.dy*v,car.y+car.dy*u+car.dx*v,z+h);
  c.save();
  // Keep a descending car inside its open trench; the tunnel roof then hides it.
  if(z<0){const a=project(car.x-car.dx*95-car.dy*36,car.y-car.dy*95+car.dx*36),b=project(car.x+car.dx*95-car.dy*36,car.y+car.dy*95+car.dx*36),d=project(car.x+car.dx*95+car.dy*36,car.y+car.dy*95-car.dx*36),e=project(car.x-car.dx*95+car.dy*36,car.y-car.dy*95-car.dx*36);c.beginPath();[a,b,d,e].forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.clip();}
  const corners=[[-65,-23],[65,-23],[65,23],[-65,23]];
  const faces=corners.map((a,i)=>{const b=corners[(i+1)%4];return{a,b,depth:(car.dx+car.dy)*(a[0]+b[0])+(-car.dy+car.dx)*(a[1]+b[1])};}).sort((a,b)=>a.depth-b.depth);
  for(const {a,b} of faces){
    const quad=(t0,t1,h0,h1)=>{const p=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];const q=p(t0),r=p(t1);return[point(...q,h0),point(...r,h0),point(...r,h1),point(...q,h1)];};
    polygon(c,quad(0,1,0,45),'#264c70','#14232e',2);polygon(c,quad(0,1,8,12),'#d7b750');polygon(c,quad(0,1,38,44),'#b9c2bd');
    const long=a[1]===b[1],count=long?5:2;
    for(let i=0;i<count;i++){const t=(i+.14)/count;polygon(c,quad(t,t+.7/count,18,35),'#142c41','#78979e',1);polygon(c,quad(t+.05/count,t+.13/count,19,33),'#487990');}
    if(long){polygon(c,quad(.43,.58,2,37),null,'#c0bcb2',1);polygon(c,quad(.50,.51,2,35),'#14232e');}
    if(!long&&car.front)for(const t of [.10,.82])polygon(c,quad(t,t+.08,8,13),'#ffe3a1');
  }
  polygon(c,corners.map(([u,v])=>point(u,v,45)),'#b7b9af','#2c3b43',2);
  for(const u of [-40,20])polygon(c,[point(u,-13,46),point(u+22,-13,46),point(u+22,13,46),point(u,13,46)],'#6d7e82','#3c4d55');
  for(let u=-36;u<48;u+=6){const a=point(u,-8,47),b=point(u,8,47);c.strokeStyle='#89979a';c.lineWidth=1;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}c.restore();
}
export function drawTunnelPortal(c,p,m){
  const x=p.x,y=p.y;
  // Low concrete hood spanning a recessed track, with a black portal and safety chevrons.
  box(c,x-47,y-24,94,48,13,'#a2a99f','#485960','#657478',-18);
  const a=project(x-33,y+25,0),b=project(x+33,y+25,0),d=project(x+33,y+25,-62),e=project(x-33,y+25,-62);
  polygon(c,[a,b,d,e],'#0a131c','#283940',3);
  for(let n=-36;n<37;n+=12){const q=project(x+n,y+27,8);c.fillStyle=n%24?'#d4ae4f':'#293638';c.fillRect(q.x-4,q.y-4,8,8);}
}
export function drawLoopStation(c,p,m){
  const point=(u,v,z)=>project(p.x+p.dx*u-p.dy*v,p.y+p.dy*u+p.dx*v,z);
  const corners=[[-100,39],[100,39],[100,88],[-100,88]];
  polygon(c,[point(-100,88,m.height),point(100,88,m.height),point(100,88,m.height-12),point(-100,88,m.height-12)],'#6f7979','#26353c',2);
  polygon(c,corners.map(([u,v])=>point(u,v,m.height+2)),'#b6b09d','#314047',2);
  const a=point(-98,43,m.height+3),b=point(98,43,m.height+3);c.strokeStyle='#e5c364';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  for(const u of [-80,80])for(const v of [50,82]){const a=point(u,v,m.height),b=point(u,v,m.height+48);c.strokeStyle='#334953';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  polygon(c,corners.map(([u,v])=>point(u,v,m.height+50)),'#586e78','#243741',2);
}
