import {project} from './core__geometry.js';
import {box,polygon} from './content__district_01__terrain.js';

export function drawWater(c,cam,width,height,time){
  const left=cam.x-width/2/cam.zoom-180,top=cam.y-height/2/cam.zoom-180;
  const right=cam.x+width/2/cam.zoom+180,bottom=cam.y+height/2/cam.zoom+180;
  c.fillStyle='#18576b';c.fillRect(left,top,right-left,bottom-top);
  const step=cam.zoom<.2?220:75;
  c.lineWidth=1.4/Math.max(.45,cam.zoom);
  for(let y=Math.floor(top/step)*step;y<bottom;y+=step)for(let x=Math.floor(left/step)*step;x<right;x+=step){
    const seed=Math.abs(Math.sin(x*13+y*7)),shift=Math.sin(time*.65+seed*12)*12;
    c.fillStyle=seed>.5?'#216e7a35':'#103e5624';c.fillRect(x+shift,y+seed*step,step*.8,14+seed*16);
    c.strokeStyle=seed>.5?'#9bd9cd55':'#56a8b266';
    c.beginPath();c.moveTo(x+shift,y+seed*step);c.lineTo(x+shift+18+seed*30,y+seed*step);c.lineTo(x+shift+27+seed*30,y+seed*step-3);c.stroke();
  }
}
export function drawShore(c,world){
  if(world.landPolygons){
    for(const poly of world.landPolygons){
      if(!world.beaches)polygon(c,poly.map(p=>project(p.x,p.y,-12)),null,'#659a9966',16);
      for(let i=0;i<poly.length;i++){
        if(world.beaches&&!(poly[i].x===poly[(i+1)%poly.length].x&&[3008,3200].includes(poly[i].x)))continue;
        const a=poly[i],b=poly[(i+1)%poly.length],beach=world.beaches&&a.y>5700&&b.y>5700,z=beach?-5:-28;
        polygon(c,[project(a.x,a.y),project(b.x,b.y),project(b.x,b.y,z),project(a.x,a.y,z)],beach?'#ead7aa':'#52686b',beach?'#f2e4c7':'#273d46',beach?4:2);
        if(beach){
          const len=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/len,ny=(b.x-a.x)/len;
          for(let n=0;n<len;n+=16){const t=n/len,noise=Math.sin(n*.17)*6,p=project(a.x+(b.x-a.x)*t-nx*(8+noise),a.y+(b.y-a.y)*t-ny*(8+noise),-6);c.fillStyle=n%48?'#b7d9c7':'#f0e7cc';c.fillRect(Math.round(p.x),Math.round(p.y),10+n%7,3);}
        }
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
  }
}

const shores=new WeakMap();
export function sandyShoreSegments(world){
  if(shores.has(world))return shores.get(world);
  const edges=[];
  for(const poly of world.landPolygons??[])for(let i=0;i<poly.length;i++){
    let a={...poly[i]},b={...poly[(i+1)%poly.length]};
    // River quays and northern foothills keep their own treatment.
    if(a.x===b.x&&(a.x===3008||a.x===3200)||Math.max(a.y,b.y)<400)continue;
    if(a.x===48&&b.x===48){if(a.y<3900)a.y=3900;if(b.y<3900)b.y=3900;}
    const length=Math.hypot(b.x-a.x,b.y-a.y);if(length<1)continue;
    edges.push({a,b,length,nx:-(b.y-a.y)/length,ny:(b.x-a.x)/length});
  }
  let distance=0;
  const same=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<1;
  const join=(a,b)=>{const x=a.nx+b.nx,y=a.ny+b.ny,scale=Math.max(.6,x*b.nx+y*b.ny);return{x:x/scale,y:y/scale};};
  for(const e of edges){
    const previous=edges.find(o=>o!==e&&same(o.b,e.a)),next=edges.find(o=>o!==e&&same(e.b,o.a));
    e.startNormal=previous?join(previous,e):{x:e.nx,y:e.ny};e.endNormal=next?join(e,next):{x:e.nx,y:e.ny};
    e.distance=distance;distance+=e.length;
  }
  shores.set(world,edges);return edges;
}
export function tideOffset(time,distance){return 12+18*Math.sin(time*.32)+7*Math.sin(distance*.017-time*.8);}
export function drawSandyCoast(c,world,textures,time){
  if(!world.beaches)return;
  c.save();c.transform(1,.5,-1,.5,0,0);
  for(const e of sandyShoreSegments(world)){
    const {a,b,nx,ny,length}=e,count=Math.ceil(length/18);
    const sample=(i,offset)=>{const t=i/count,d=t*length,start=Math.max(0,1-d/80),end=Math.max(0,1-(length-d)/80),normalX=nx+(e.startNormal.x-nx)*start+(e.endNormal.x-nx)*end,normalY=ny+(e.startNormal.y-ny)*start+(e.endNormal.y-ny)*end;return{x:Math.round(a.x+(b.x-a.x)*t+normalX*offset),y:Math.round(a.y+(b.y-a.y)*t+normalY*offset)};};
    const ribbon=(front,back,fill)=>{const points=[];for(let i=0;i<=count;i++)points.push(sample(i,typeof front==='function'?front(i):front));for(let i=count;i>=0;i--)points.push(sample(i,typeof back==='function'?back(i):back));polygon(c,points,fill);};
    const inner=Math.min(a.y,b.y)>5400?170:100;
    ribbon(i=>inner+Math.sin((e.distance+i*length/count)*.035)*9,-100,textures.sand);
    ribbon(47,-80,'#b6a87899');
    ribbon(i=>tideOffset(time,e.distance+i*length/count),-145,'#2c8c967a');
    ribbon(i=>tideOffset(time,e.distance+i*length/count)-25,-160,'#227789cc');
    ribbon(i=>tideOffset(time,e.distance+i*length/count)-66,-185,'#18576b');
    for(let i=0;i<=count;i++){
      const d=e.distance+i*length/count,front=tideOffset(time,d),p=sample(i,front);
      c.fillStyle=i%4===0?'#f7ecd3b5':'#c0e4d4b0';c.fillRect(p.x,p.y,8+(i%3)*3,3);
      if(i%3===0){const q=sample(i,front-35);c.fillStyle='#9ed5cd66';c.fillRect(q.x,q.y,17,2);}
      const dry=sample(i,inner-15-(i%5)*6);c.fillStyle=i%2?'#a28a613b':'#f2dba544';c.fillRect(dry.x,dry.y,5,3);
    }
  }
  c.restore();
}
