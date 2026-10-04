import {project} from './core__geometry.js?v=97af9e9c19c3';
import {polygon} from './content__district_01__terrain.js?v=97af9e9c19c3';
import {drawCanal} from './content__levels__sandbox__canal-art.js?v=97af9e9c19c3';
const quad=r=>[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(p=>project(...p));
export function drawWaterfront(c,world,kit,night=false,time=0,view){
  c.save();c.imageSmoothingEnabled=true;
  for(const r of world.water??[]){
    drawCanal(c,r,{night,time,view,bridges:world.bridges});
  }
  for(const r of world.parks??[]){polygon(c,quad(r),'#9fad73','#747c5c',2);kit.material.quad(c,'grass',quad(r),night?.38:0);polygon(c,quad(r),night?'#18382b20':'#b5bc9433');}
  for(const r of world.paths??[]){
    polygon(c,quad(r),night?'#777969':'#ead9ae','#b6b28a',2);
    c.save();polygon(c,quad(r));c.clip();
    for(let x=r.x;x<r.x+r.w;x+=240)for(let y=r.y;y<r.y+r.h;y+=240)kit.parkMaterial.quad(c,'sand',quad({x,y,w:240,h:240}),night?.35:0);
    c.restore();
  }
  for(const r of world.bridges??[]){
    polygon(c,quad(r),night?'#737b78':'#d6d3bf','#646e6b',3);
    for(const side of [0,1]){
      const y=r.y+side*r.h,a=project(r.x,y,13),b=project(r.x+r.w,y,13);
      c.strokeStyle=night?'#a7b2aa':'#4c676b';c.lineWidth=2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      for(let x=r.x;x<=r.x+r.w;x+=36){const p=project(x,y),t=project(x,y,13);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(t.x,t.y);c.stroke();}
    }
  }
  c.restore();
}

export function drawNeighbourhoodMap(c,s,w,h,atlas,kit){
  // A steeper cartographic view fills a portrait phone and keeps the canal vertical.
  const project=(x,y,z=0)=>({x:x*.85+y*.15,y:y*.9-x*.25-z});
  const quad=(r,z=0)=>[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(p=>project(...p,z));
  const regions={all:s.world.mapBounds,home:{x:70,y:90,w:3550,h:1380},canal:{x:750,y:1480,w:1700,h:2620},park:{x:2490,y:1490,w:1190,h:1520},marina:{x:72,y:1480,w:1000,h:2620}};
  const r=regions[s.mapRegion??'all']??regions.all,points=quad(r),xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys)-250,maxY=Math.max(...ys),scale=Math.min((w-30)/(maxX-minX),(h-30)/(maxY-minY));
  c.fillStyle='#b6d2d6';c.fillRect(0,0,w,h);c.save();c.beginPath();c.rect(0,0,w,h);c.clip();c.translate(w/2-(minX+maxX)/2*scale,h/2-(minY+maxY)/2*scale);c.scale(scale,scale);
  c.imageSmoothingEnabled=true;polygon(c,quad(s.world.mapBounds),'#e8dfc2','#636f64',5);
  for(const r of s.world.water)polygon(c,quad(r),'#80b8d0','#d4d0b5',6);
  for(const r of s.world.parks){polygon(c,quad(r),'#b7c98c','#90a170',2);kit.material.quad(c,'grass',quad(r));}
  for(const r of s.world.paths)polygon(c,quad(r),'#eee1b9','#b3b49a',2);
  for(const r of s.world.bridges)polygon(c,quad(r),'#e6dfc9','#748987',3);
  for(const road of s.world.roads)polygon(c,quad(road),'#8a9190','#c8c7b6',7);
  polygon(c,quad(s.world.court),'#bb8768','#f7edce',3);
  const m=s.world.surfaceMetro;c.strokeStyle='#626d69';c.lineWidth=17;c.beginPath();const a=project(m.start,m.y),b=project(m.end,m.y);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  const props=[...s.world.buildings.map(b=>({kind:'house',b,x:b.x+b.w,y:b.y+b.h})),...(s.world.nature??[])].sort((a,b)=>a.x+a.y-b.x-b.y);
  for(const o of props){
    const p=project(o.x,o.y);
    if(o.kind==='house'){
      const b=o.b,variant=b.comicVariant??(b.artType==='brick'?3:b.artType==='blue'?1:0),height=variant%2?36:55,base=quad(b),roof=quad(b,height);
      const outline=Math.max(2,.65/scale);
      polygon(c,[base[1],base[2],roof[2],roof[1]],'#aeb7b0','#526566',outline);
      polygon(c,[base[2],base[3],roof[3],roof[2]],'#e9e8d3','#526566',outline);
      polygon(c,roof,'#f3eed7','#526566',outline);
      polygon(c,quad({x:b.x+10,y:b.y+10,w:b.w-20,h:b.h-20},height+1),variant===2?'#bac8bd':'#dfaa91','#928c77',Math.max(1,.35/scale));
      const vent=project(b.x+b.w*.6,b.y+b.h*.45,height+5);c.fillStyle='#ece8d5';c.strokeStyle='#778882';c.lineWidth=2;c.fillRect(vent.x-9,vent.y-6,18,12);c.strokeRect(vent.x-9,vent.y-6,18,12);
    }else atlas.draw(c,o.id,p.x,p.y,o.w);
  }
  function label(text,x,y,color){const p=project(x,y);c.save();c.translate(p.x,p.y);c.scale(1/scale,1/scale);c.font='bold 11px sans-serif';c.textAlign='center';const width=c.measureText(text).width+14;c.fillStyle='#fbf4dbed';c.fillRect(-width/2,-10,width,19);c.fillStyle=color;c.fillText(text,0,3);c.restore();}
  for(const [name,x,y] of [['КВАРТАЛ',1180,560],['ЛЕСОПАРК',3100,2130],['ПРИЧАЛ',400,2460],['КАНАЛ',920,2890],['ДВОРЫ',1630,2250],['МАСТЕРСКИЕ',2940,3700]])label(name,x,y,'#344d50');
  for(const t of s.world.targets){const p=project(t.approach.x,t.approach.y);c.fillStyle=s.painted.has(t.wall_id)?'#598657':'#9665ab';c.beginPath();c.arc(p.x,p.y,2.5/scale,0,Math.PI*2);c.fill();}
  const home=project(s.world.hideout.x,s.world.hideout.y);c.fillStyle='#d3a338';c.fillRect(home.x-4/scale,home.y-4/scale,8/scale,8/scale);
  const p=project(s.player.x,s.player.y);c.save();c.translate(p.x,p.y);c.scale(1/scale,1/scale);c.fillStyle='#cf40a1';c.strokeStyle='#fff9e6';c.lineWidth=2;c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.fill();c.stroke();c.restore();
  c.restore();
}
