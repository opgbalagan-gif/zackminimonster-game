import {project} from './core__geometry.js?v=391ab0f86039';
import {box,polygon} from './content__district_01__terrain.js?v=391ab0f86039';
const routes=new WeakMap(),trenches=new WeakMap();
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
export function tunnelSpans(m){const u=m.underground;return u?[[u.entry,u.start-50],[u.end+50,u.exit]]:[];}
function trenchOpenings(m){
  if(trenches.has(m))return trenches.get(m);
  const result=tunnelSpans(m).map(([a,b],i)=>{
    let lo=a,hi=b;for(let n=0;n<24;n++){const mid=(lo+hi)/2;if((trackHeight(m,{x:m.loop[1].x,y:mid})>0)===(i===0))lo=mid;else hi=mid;}
    return i===0?[(lo+hi)/2,b]:[a,(lo+hi)/2];
  }).map(([a,b])=>[project(m.loop[1].x-38,a),project(m.loop[1].x+38,a),project(m.loop[1].x+38,b),project(m.loop[1].x-38,b)]);
  trenches.set(m,result);return result;
}
function clipTrench(c,m){c.beginPath();for(const poly of trenchOpenings(m)){poly.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();}c.clip();}
export function trainVisibleRanges(m,car){
  if(!m.underground||Math.abs(car.x-m.loop[1].x)>8||Math.abs(car.dy)<.99)return[[-65,65]];
  const a=(m.underground.start-50-car.y)/car.dy,b=(m.underground.end+50-car.y)/car.dy,lo=Math.min(a,b),hi=Math.max(a,b);
  return [[-65,Math.min(65,lo)],[Math.max(-65,hi),65]].filter(([a,b])=>b>a);
}
export function trainHeight(m,car,u){return trackHeight(m,{x:car.x+car.dx*u,y:car.y+car.dy*u})+5;}
export function drawTunnelGround(c,m){
  for(const poly of trenchOpenings(m))polygon(c,poly,'#172326');
}
export function drawLoopRail(c,r,m,art){
  const u=m.underground;if(u&&Math.abs(r.x-m.loop[1].x)<8&&r.y>u.start-50&&r.y<u.end+50)return;
  c.save();if(Math.max(r.za,r.zb)<0)clipTrench(c,m);
  const point=(p,n,z)=>project(p.x+r.nx*n,p.y+r.ny*n,z);
  const top=[point(r.a,-32,r.za),point(r.b,-32,r.zb),point(r.b,32,r.zb),point(r.a,32,r.za)];
  if(Math.min(r.za,r.zb)<0){
    for(const n of [-36,36]){const wall=[point(r.a,n,0),point(r.b,n,0),point(r.b,n,r.zb-12),point(r.a,n,r.za-12)];polygon(c,wall,'#56636a','#26373e',2);art?.quad(c,'concrete',wall,n<0?.35:.15);}
  }
  for(const n of [-32,32]){const side=[point(r.a,n,r.za),point(r.b,n,r.zb),point(r.b,n,r.zb-23),point(r.a,n,r.za-23)];polygon(c,side,'#37434a','#1d2930',2);art?.quad(c,'steel',side,n<0?.15:0);polygon(c,side,'#3c4b50bb');}
  polygon(c,top,'#404747','#293a42',1);art?.quad(c,'ballast',top);polygon(c,top,'#41473cce');
  const len=r.b.s-r.a.s;
  const dx=(r.b.x-r.a.x)/len,dy=(r.b.y-r.a.y)/len;
  for(let n=(10-r.a.s%10)%10;n<len;n+=10){
    const t=n/len,p={x:r.a.x+dx*n,y:r.a.y+dy*n},q={x:p.x+dx*3,y:p.y+dy*3},z=r.za+(r.zb-r.za)*t;
    polygon(c,[point(p,-26,z+1),point(q,-26,z+1),point(q,26,z+1),point(p,26,z+1)],Math.floor((r.a.s+n)/10)%3?'#756c58':'#91816b','#302d28',.7);
    for(const rail of [-19,19]){const bolt=point(p,rail,z+3);c.fillStyle='#c3ad78';c.fillRect(Math.round(bolt.x)-1,Math.round(bolt.y)-1,2,2);}
  }
  for(const n of [-19,19]){const a=point(r.a,n,r.za+4),b=point(r.b,n,r.zb+4);c.strokeStyle='#332c23';c.lineWidth=5;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle='#c5bba0';c.lineWidth=1.8;c.stroke();}
  for(const n of [-34,34]){
    const walk=[point(r.a,n-3,r.za+2),point(r.b,n-3,r.zb+2),point(r.b,n+3,r.zb+2),point(r.a,n+3,r.za+2)];polygon(c,walk,'#b1aa92');art?.quad(c,'concrete',walk);
    if(Math.min(r.za,r.zb)>25){
      const a=point(r.a,n,r.za+19),b=point(r.b,n,r.zb+19);c.strokeStyle='#283537';c.lineWidth=2.5;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      for(let d=(40-r.a.s%40)%40;d<len;d+=40){const t=d/len,p={x:r.a.x+dx*d,y:r.a.y+dy*d},z=r.za+(r.zb-r.za)*t,a=point(p,n,z),b=point(p,n,z+20);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.fillStyle='#bcb390';c.fillRect(Math.round(b.x)-1,Math.round(b.y)-1,2,2);}
    }
  }
  c.restore();
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
export function drawTrain(c,car,m,atlas,art){
  if(!m.loop){const id=car.front?'train_front':'train_car',rect=atlas.rect(id),width=180,height=width*rect[3]/rect[2],p=project(car.x,car.y,m.height+4);c.save();c.translate(p.x,p.y);atlas.draw(c,id,width*.015,height*.28,width);c.restore();return;}
  const ranges=trainVisibleRanges(m,car);if(!ranges.length)return;
  const point=(u,v,h)=>({...project(car.x+car.dx*u-car.dy*v,car.y+car.dy*u+car.dx*v,trainHeight(m,car,u)+h),u,z:trainHeight(m,car,u)+h});
  c.save();
  // Clip each surface at the actual covered-track boundary, so a car enters progressively.
  const paint=(ctx,vertices,fill,stroke=null,width=1,material=null)=>{
    for(const [lo,hi]of ranges){let out=vertices;
      for(const [edge,sign]of [[lo,1],[hi,-1]]){const input=out;out=[];
        for(let i=0;i<input.length;i++){const a=input[i],b=input[(i+1)%input.length],ia=(a.u-edge)*sign>=0,ib=(b.u-edge)*sign>=0;
          if(ia)out.push(a);if(ia!==ib){const t=(edge-a.u)/(b.u-a.u);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t,u:edge});}}
      }
      // Below-ground body pixels are visible only inside the open excavation.
      for(const sign of [1,-1]){const part=[];for(let i=0;i<out.length;i++){const a=out[i],b=out[(i+1)%out.length],ia=a.z*sign>=0,ib=b.z*sign>=0;if(ia)part.push(a);if(ia!==ib){const t=-a.z/(b.z-a.z);part.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:0});}}
        if(part.length>=3){ctx.save();if(sign<0)clipTrench(ctx,m);polygon(ctx,part,fill,stroke,width);if(material&&art){polygon(ctx,part,null);ctx.clip();art.quad(ctx,material,vertices);}ctx.restore();}}
    }
  };
  const corners=[[-65,-23],[65,-23],[65,23],[-65,23]];
  const faces=corners.map((a,i)=>{const b=corners[(i+1)%4];return{a,b,depth:(car.dx+car.dy)*(a[0]+b[0])+(-car.dy+car.dx)*(a[1]+b[1])};}).sort((a,b)=>a.depth-b.depth);
  for(const {a,b} of faces){
    const quad=(t0,t1,h0,h1)=>{const p=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];const q=p(t0),r=p(t1);return[point(...q,h0),point(...r,h0),point(...r,h1),point(...q,h1)];};
    paint(c,quad(0,1,0,45),'#264c70','#14232e',2);paint(c,quad(0,1,0,45),'#244d789e');paint(c,quad(0,1,8,12),'#d7b750');paint(c,quad(0,1,38,44),'#b9c2bd');
    const long=a[1]===b[1],count=long?5:2;
    if(art){paint(c,[...quad(0,1,0,45)].reverse(),null,null,1,long?'side':car.front&&a[0]===65?'front':'rear');continue;}
    for(let i=0;i<count;i++){const t=(i+.14)/count;paint(c,quad(t,t+.7/count,18,35),'#142c41','#78979e',1);paint(c,quad(t+.05/count,t+.13/count,19,33),'#487990');}
    if(long){paint(c,quad(.43,.58,2,37),null,'#c0bcb2',1);paint(c,quad(.50,.51,2,35),'#14232e');}
    if(!long&&car.front)for(const t of [.10,.82])paint(c,quad(t,t+.08,8,13),'#ffe3a1');
  }
  const roof=corners.map(([u,v])=>point(u,v,45));paint(c,roof,'#b7b9af','#2c3b43',2);paint(c,roof,'#b7b9afb8','#2c3b43',1);
  if(art){paint(c,roof,null,null,1,'roof');c.restore();return;}
  for(const u of [-40,20])paint(c,[point(u,-13,46),point(u+22,-13,46),point(u+22,13,46),point(u,13,46)],'#6d7e82','#3c4d55');
  for(let u=-36;u<48;u+=6){if(!ranges.some(([a,b])=>u>=a&&u+22<=b))continue;const a=point(u,-8,47),b=point(u,8,47);c.strokeStyle='#89979a';c.lineWidth=1;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}c.restore();
}
export function drawTunnelPortal(c,p,m,art){
  // The outside is a sealed retaining wall. The train enters from the recessed track side.
  const x=p.x,y=p.y;
  box(c,x-56,y-50,112,100,14,'#a8a38e','#686c62','#73776b',0);
  const roof=[project(x-56,y-50,14),project(x+56,y-50,14),project(x+56,y+50,14),project(x-56,y+50,14)];
  art?.quad(c,'concrete',roof);
  for(const [a,b]of [[[x-56,y+50],[x+56,y+50]],[[x+56,y-50],[x+56,y+50]]]){
    const face=[project(...a,14),project(...b,14),project(...b,0),project(...a,0)];art?.quad(c,'concrete',face,.25);
  }
  for(const xx of [-42,42])box(c,x+xx-3,y-38,6,76,22,'#aaa58d','#50574f','#73786c',14);
  const vent=[project(x-20,y-24,15),project(x+20,y-24,15),project(x+20,y+24,15),project(x-20,y+24,15)];polygon(c,vent,'#333f3c','#878c79',2);
  for(let yy=-20;yy<24;yy+=6){const a=project(x-17,y+yy,16),b=project(x+17,y+yy,16);c.strokeStyle='#7a8479';c.lineWidth=2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
}
export function drawLoopStation(c,p,m,art){
  const point=(u,v,z)=>project(p.x+p.dx*u-p.dy*v,p.y+p.dy*u+p.dx*v,z);
  const corners=[[-100,39],[100,39],[100,88],[-100,88]];
  polygon(c,[point(-100,88,m.height),point(100,88,m.height),point(100,88,m.height-12),point(-100,88,m.height-12)],'#6f7979','#26353c',2);
  polygon(c,corners.map(([u,v])=>point(u,v,m.height+2)),'#b6b09d','#314047',2);
  art?.quad(c,'concrete',corners.map(([u,v])=>point(u,v,m.height+2)));
  const a=point(-98,43,m.height+3),b=point(98,43,m.height+3);c.strokeStyle='#e5c364';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  for(const u of [-80,80])for(const v of [50,82]){const a=point(u,v,m.height),b=point(u,v,m.height+48);c.strokeStyle='#334953';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  polygon(c,corners.map(([u,v])=>point(u,v,m.height+50)),'#586e78','#243741',2);
  art?.quad(c,'steel',corners.map(([u,v])=>point(u,v,m.height+50)),.12);
}
