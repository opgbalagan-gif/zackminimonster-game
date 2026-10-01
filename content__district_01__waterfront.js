import {project} from './core__geometry.js';
import {box,polygon} from './content__district_01__terrain.js';

export function drawWater(c,cam,width,height,time,textures){
  const left=cam.x-width/2/cam.zoom-180,top=cam.y-height/2/cam.zoom-180;
  const right=cam.x+width/2/cam.zoom+180,bottom=cam.y+height/2/cam.zoom+180;
  c.fillStyle='#18576b';c.fillRect(left,top,right-left,bottom-top);
  if(textures?.water){
    c.save();textures.water.setTransform(new DOMMatrix().translate(time*2.4,Math.sin(time*.15)*8+time*.65));c.globalAlpha=1;c.fillStyle=textures.water;c.fillRect(left,top,right-left,bottom-top);
    c.globalAlpha=.11;const x=Math.sin(time*.32)*14,y=Math.cos(time*.24)*9;c.translate(x,y);c.fillRect(left-x,top-y,right-left,bottom-top);c.restore();
    return;
  }
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
        if(poly[i].x===3200&&poly[(i+1)%poly.length].x===3200)continue;
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
export function drawBridges(c,session,plate,art){
  for(const b of session.world.bridges??[]){
    if(b.kind!=='bridge')continue;
    // Solid bank abutments close the shore/deck join above the lowered waterline.
    for(const x of [2990,3186]){
      box(c,x,b.y-14,32,b.h+28,0,'#a6a18d','#656e65','#858c7c',-64);
      art?.quad(c,'concrete',[project(x,b.y+b.h+14),project(x+32,b.y+b.h+14),project(x+32,b.y+b.h+14,-64),project(x,b.y+b.h+14,-64)],.22);
    }
    // River piers, bearing pads and steel beams make the road a supported structure.
    for(const x of [b.x+54,b.x+b.w-70])for(const y of [b.y+12,b.y+b.h-28]){
      box(c,x,y,16,16,-9,'#9e9b88','#626d68','#7e8780',-72);
      art?.quad(c,'concrete',[project(x,y+16,-9),project(x+16,y+16,-9),project(x+16,y+16,-72),project(x,y+16,-72)],.2);
    }
    box(c,b.x,b.y-14,b.w,b.h+28,0,'#8f9284','#414b43','#667064',-42);
    for(const y of [b.y-14,b.y+b.h+14]){
      const face=[project(b.x,y,-4),project(b.x+b.w,y,-4),project(b.x+b.w,y,-42),project(b.x,y,-42)];art?.quad(c,'steel',face,.18);
    }
    if(plate){c.save();c.transform(1,.5,-1,.5,0,0);c.drawImage(plate,420,1172,360,136,b.x,b.y-12,b.w,b.h+24);c.restore();}
    for(const y of [b.y-10,b.y+b.h+10]){
      const walk=[project(b.x,y-4),project(b.x+b.w,y-4),project(b.x+b.w,y+4),project(b.x,y+4)];polygon(c,walk,'#b4ae96');art?.quad(c,'concrete',walk);
    }
    for(const x of [b.x,b.x+b.w-6]){const a=project(x,b.y),d=project(x,b.y+b.h);c.strokeStyle='#394447';c.lineWidth=3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(d.x,d.y);c.stroke();}
  }
}
export function bridgeRailPieces(world){
  return (world.bridges??[]).filter(b=>b.kind==='bridge').flatMap(b=>[b.y-12,b.y+b.h+12].flatMap(y=>Array.from({length:Math.ceil(b.w/32)},(_,i)=>({kind:'bridgeRail',item:{x:b.x+i*32,y,w:Math.min(32,b.w-i*32),end:i===0||i===Math.ceil(b.w/32)-1},depth:b.x+i*32+y+16}))));
}
export function drawBridgeRail(c,o,art){
  const {x,y,w}=o;box(c,x,y-3,w,6,7,'#b8af96','#626961','#828677');
  const line=(a,b,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();};
  for(const z of [14,30])line(project(x,y,z),project(x+w,y,z),'#394541',3);
  for(let n=0;n<=w;n+=8)line(project(x+n,y,8),project(x+n,y,30),'#4d5850',2);
  box(c,x-3,y-3,6,6,33,'#ddd1ac','#6e776c','#8e9783',7);
  if(o.end){box(c,x-5,y-5,10,10,39,'#b8b59d','#676f65','#898f7d');line(project(x,y,39),project(x,y,72),'#2d3937',3);box(c,x-5,y-5,10,10,80,'#3b4440','#e7c977','#c6ad67',68);}
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
export function drawSandyCoast(c,world,textures,time,foamArt){
  if(!world.beaches)return;
  const screenTransform=c.getTransform();
  c.save();c.transform(1,.5,-1,.5,0,0);
  for(const e of sandyShoreSegments(world)){
    const {a,b,nx,ny,length}=e,count=Math.ceil(length/18);
    const sample=(i,offset)=>{const t=i/count,d=t*length,start=Math.max(0,1-d/80),end=Math.max(0,1-(length-d)/80),normalX=nx+(e.startNormal.x-nx)*start+(e.endNormal.x-nx)*end,normalY=ny+(e.startNormal.y-ny)*start+(e.endNormal.y-ny)*end;return{x:Math.round(a.x+(b.x-a.x)*t+normalX*offset),y:Math.round(a.y+(b.y-a.y)*t+normalY*offset)};};
    const ribbon=(front,back,fill)=>{const points=[];for(let i=0;i<=count;i++)points.push(sample(i,typeof front==='function'?front(i):front));for(let i=count;i>=0;i--)points.push(sample(i,typeof back==='function'?back(i):back));polygon(c,points,fill);};
    const inner=Math.min(a.y,b.y)>5400?170:100;
    const dune=i=>Math.sin((e.distance+i*length/count)*.035)*9+Math.sin((e.distance+i*length/count)*.081)*4;
    c.save();c.globalAlpha=.18;
    for(let band=12;band>=1;band--)ribbon(i=>inner+band*6+dune(i),i=>inner-12+dune(i),textures.sand);
    c.restore();
    ribbon(i=>inner+dune(i),-100,textures.sand);
    ribbon(47,-80,'#b6a87899');
    ribbon(i=>tideOffset(time,e.distance+i*length/count),-145,'#2c8c967a');
    ribbon(i=>tideOffset(time,e.distance+i*length/count)-25,-160,'#227789cc');
    if(textures.water)for(let strip=0;strip<17;strip++){
      c.save();const front=i=>tideOffset(time,e.distance+i*length/count)-strip*13,back=i=>front(i)-14;
      ribbon(front,back,null);c.clip();c.setTransform(screenTransform);c.globalAlpha=Math.min(1,(strip+1)/10);c.fillStyle=textures.water;c.fillRect(-12000,-2000,24000,14000);c.restore();
    }
    if(foamArt){
      const pieces=Math.ceil(length/180);
      for(let j=0;j<pieces;j++){
        const lo=j/pieces*count,hi=(j+1)/pieces*count,t0=tideOffset(time,e.distance+lo*length/count),t1=tideOffset(time,e.distance+hi*length/count);
        c.save();c.globalAlpha=.58+.16*Math.sin(time*.32+e.distance*.006+j);
        foamArt.quad(c,'foam'+(Math.floor(e.distance/180)+j)%3,[sample(lo,t0+7),sample(hi,t1+7),sample(hi,t1-22),sample(lo,t0-22)]);c.restore();
      }
    }
    for(let i=0;i<=count;i++){
      const d=e.distance+i*length/count,front=tideOffset(time,d),p=sample(i,front);
      if(!foamArt){c.fillStyle=i%4===0?'#f7ecd3b5':'#c0e4d4b0';c.fillRect(p.x,p.y,8+(i%3)*3,3);}
      const dry=sample(i,inner-15-(i%5)*6);c.fillStyle=i%2?'#a28a613b':'#f2dba544';c.fillRect(dry.x,dry.y,5,3);
    }
  }
  c.restore();
}
