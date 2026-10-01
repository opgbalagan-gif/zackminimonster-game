import {facadeGeometry,drawFacade} from './content__district_01__facades.js';
import {perimeterPieces,drawPerimeter} from './content__district_01__perimeter.js';
import {createGroundPlate} from './content__district_01__ground-plate.js';
import {trainCars,drawTrain} from './content__district_01__metro.js';
import {project,distance} from './core__geometry.js';
import {SpriteAtlas} from './core__sprites.js';
import {polygon,box,ground} from './content__district_01__terrain.js';
import {drawGraffiti} from './content__district_01__graffiti-art.js';
import {wallSurface} from './core__surfaces.js';
import {heroSprite,ink} from './core__hideout.js';
import {renderHideout,drawTrophy} from './content__district_01__hideout-renderer.js';
import {drawTrafficCar,drawTrafficSignals} from './content__district_01__traffic-renderer.js';
import {drawBall} from './core__ball-art.js';
import {POSTERS,drawPoster} from './content__district_01__posters.js';

const INK='#111722';
export function marker(c,x,y,type,size=28,active=false){
  c.save();c.translate(x,y);c.scale(size/28,size/28);
  c.fillStyle=INK;c.strokeStyle=active?'#f6d16b':'#e2e1d8';c.lineWidth=2;
  c.beginPath();c.moveTo(-12,-28);c.lineTo(12,-28);c.lineTo(14,-5);c.lineTo(0,2);c.lineTo(-14,-5);c.closePath();c.fill();c.stroke();
  if(type==='graffiti'){c.fillStyle='#d08bea';c.fillRect(-5,-20,10,16);c.fillStyle='#f1d9ff';c.fillRect(-3,-25,6,4);c.fillRect(-3,-17,2,8);}
  else if(type==='home'){c.fillStyle='#f5cd59';c.beginPath();c.moveTo(-9,-16);c.lineTo(0,-25);c.lineTo(9,-16);c.closePath();c.fill();c.fillRect(-7,-16,14,12);c.fillStyle=INK;c.fillRect(-2,-12,4,8);}
  else if(type==='police'){c.fillStyle='#82b9db';c.beginPath();c.moveTo(-8,-23);c.lineTo(8,-23);c.lineTo(7,-10);c.lineTo(0,-4);c.lineTo(-7,-10);c.closePath();c.fill();}
  else if(type==='court'){c.fillStyle='#f29c49';c.beginPath();c.arc(0,-15,9,0,Math.PI*2);c.fill();c.strokeStyle=INK;c.lineWidth=1.5;c.beginPath();c.moveTo(-9,-15);c.lineTo(9,-15);c.moveTo(0,-24);c.lineTo(0,-6);c.stroke();}
  else{c.fillStyle='#eee9d8';c.font='bold 22px monospace';c.textAlign='center';c.fillText('?',0,-6);}
  c.restore();
}
function label(c,text,x,y,color='#eee8d8'){
  c.font='bold 12px monospace';c.textAlign='center';const width=c.measureText(text).width+18;
  c.fillStyle='#111821eb';c.fillRect(x-width/2,y-17,width,24);c.strokeStyle='#d8d6be';c.lineWidth=1;c.strokeRect(x-width/2,y-17,width,24);
  c.fillStyle=color;c.fillText(text,x,y);
}
export function createRenderer(pack){
  const atlas=new SpriteAtlas(pack.atlas,pack.images),world=pack.world;
  const plate=createGroundPlate(pack.images.city_ground,world);
  const entries=[],posterHits=[];
  for(const b of [...world.backdrop,...world.buildings])entries.push({kind:'building',item:b,depth:b.x+b.y+b.w+b.h});
  for(const p of world.props)entries.push({kind:'prop',item:p,depth:p.x+p.y});
  for(const t of world.targets)if(!t.buildingId)entries.push({kind:'wall',item:t,depth:t.x+t.y+5});
  for(const o of world.obstacles)if(!o.wallCollider&&!o.boundary)entries.push({kind:o.pillar?'pillar':'fence',item:o,depth:o.x+o.y+o.w+o.h});
  for(let x=world.metro.x;x<world.metro.end;x+=world.metro.segment)entries.push({kind:'rail',item:{x},depth:x+world.metro.segment+world.metro.y+world.metro.width});
  for(const o of perimeterPieces(world))entries.push({kind:'perimeter',item:o,depth:o.x+o.y+o.w+o.h});
  entries.push({kind:'station',item:{x:world.metro.station.x},depth:world.metro.station.x+world.metro.station.w+world.metro.y+120});

  function sprite(c,id,x,y,width,height=null,flip=false,alpha=1){atlas.draw(c,id,x,y,width,height,flip,alpha);}
  function wall(c,t,session){
    const p=project(t.x,t.y);c.save();c.translate(p.x,p.y);c.transform(1,t.axis==='y'?-.5:.5,0,1,0,0);
    const wallHeight=t.graffiti_id==='panda_king'?94:56;
    c.fillStyle='#202730';c.fillRect(-43,-wallHeight,86,wallHeight+2);
    wallSurface(c,t.wall_type,-40,-wallHeight+3,80,wallHeight-3);
    if(session.painted.has(t.wall_id)){
      const style=session.runStyles[t.wall_id]??session.save.wall_styles[t.wall_id];
      drawGraffiti(c,t.graffiti_id,-39,-wallHeight+5,78,wallHeight-9,atlas,style?ink(style).color:null);
    }
    else{c.strokeStyle='#d7c9dc';c.setLineDash([4,4]);c.strokeRect(-30,-45,60,36);}
    c.restore();
  }
  function rail(c,x,session,map){
    const m=world.metro;const fade=!map&&Math.abs(session.player.x-x)<180&&Math.abs(session.player.y-m.y)<120;
    c.save();c.globalAlpha=fade?.52:1;
    box(c,x,m.y,m.segment,m.width,m.height,'#4d565b','#343d45','#343d45',m.height-13);
    for(let i=2;i<m.segment;i+=12){
      polygon(c,[project(x+i,m.y+8,m.height+2),project(x+i+5,m.y+8,m.height+2),project(x+i+5,m.y+m.width-8,m.height+2),project(x+i,m.y+m.width-8,m.height+2)],'#8a8070');
    }
    for(const yy of [m.y+14,m.y+m.width-14]){
      const a=project(x,yy,m.height+4),b=project(x+m.segment,yy,m.height+4);
      c.strokeStyle='#c1bdad';c.lineWidth=3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
    }
    for(const yy of [m.y,m.y+m.width]){
      const a=project(x,yy,m.height+14),b=project(x+m.segment,yy,m.height+14);
      c.strokeStyle='#303942';c.lineWidth=2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      for(let i=0;i<m.segment;i+=32){const p=project(x+i,yy,m.height);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x,p.y-14);c.stroke();}
    }c.restore();
  }
  function station(c,session,map){
    const m=world.metro,s=m.station;
    c.save();if(!map&&distance(session.player,{x:790,y:734})<200)c.globalAlpha=.6;
    box(c,s.x,m.y+66,s.w,40,m.height,'#a9aa9d','#707a7d','#697377',m.height-12);
    for(let i=0;i<11;i++)box(c,952,803-i*8,48,10,i*10+6,'#9b9f98','#4d5860','#6f7b7c',Math.max(0,i*10-3));
    const a=project(740,m.y+91,m.height+23);label(c,'EAST BLOCK  /  M',a.x,a.y,'#eccd65');
    c.restore();
  }
  function actor(c,actor,kind,session){
    const p=project(actor.x,actor.y),step=actor.moving&&Math.floor(session.time*8)%2;
    c.fillStyle='#11172344';c.beginPath();c.ellipse(p.x,p.y+2,kind==='companion'?12:16,6,0,0,Math.PI*2);c.fill();
    if(kind==='hero'){
      const id=heroSprite(session.save.player.skin,actor.state,actor.facing,step);
      c.save();
      if(session.knockedFor>0){
        c.translate(p.x-20,p.y-9);c.rotate(-Math.PI*.43);sprite(c,id,0,0,null,62);c.restore();
        c.fillStyle='#f6d56f';c.font='bold 18px monospace';c.textAlign='center';
        c.fillText('★  ★',p.x+Math.sin(session.time*8)*6,p.y-32);
      }else{c.globalAlpha=session.trafficGrace>0&&Math.floor(session.time*9)%2?.48:1;sprite(c,id,p.x,p.y-(step?1:0),null,66);c.restore();}
    }else if(kind==='companion'){
      sprite(c,'companion',p.x,p.y-(step?3:0),null,38);
      if(actor.alert){c.fillStyle='#f6ca62';c.font='bold 20px monospace';c.textAlign='center';c.fillText('!',p.x,p.y-46-Math.sin(session.time*8)*3);}
    }else if(kind==='car'){
      sprite(c,'police_car',p.x,p.y,102,null,actor.facing==='left');
      if(actor.state==='CHASE'){c.fillStyle=Math.floor(session.time*8)%2?'#ec4e58':'#71bbed';c.fillRect(p.x-4,p.y-45,9,5);}
    }else{
      sprite(c,step?'officer_walk':'officer',p.x,p.y,null,60,actor.facing==='left');
      if(actor.state==='SUSPICIOUS'||actor.state==='CHASE')label(c,actor.state==='CHASE'?'!':'?',p.x,p.y-69,actor.state==='CHASE'?'#ef6970':'#f3d778');
    }
  }
  function renderWorld(c,session,width,height,map=false){
    c.imageSmoothingEnabled=false;atlas.drawCalls=0;c.clearRect(0,0,width,height);
    if(!map)posterHits.length=0;
    c.fillStyle='#1b2531';c.fillRect(0,0,width,height);
    const cam=map?{x:(world.width-world.height)/2,y:(world.width+world.height)/4-70,zoom:Math.min((width-40)/(world.width+world.height+160),(height-80)/((world.width+world.height)/2+260))}:session.camera;
    c.save();c.translate(width/2,height/2);c.scale(cam.zoom,cam.zoom);c.translate(-cam.x,-cam.y);
    ground(c,world,plate,cam,width,height);
    drawTrafficSignals(c,session.traffic);
    if(!map&&session.player.path.length){
      c.strokeStyle='#e9ce7f90';c.lineWidth=3/cam.zoom;c.setLineDash([4/cam.zoom,8/cam.zoom]);c.beginPath();
      const p=project(session.player.x,session.player.y);c.moveTo(p.x,p.y);
      for(const n of session.player.path){const v=project(n.x,n.y);c.lineTo(v.x,v.y);}c.stroke();c.setLineDash([]);
    }
    const queue=entries.slice();
    queue.push({kind:'hero',item:session.player,depth:session.player.x+session.player.y},
      {kind:'companion',item:session.companion,depth:session.companion.x+session.companion.y});
    for(const u of session.police.units)queue.push({kind:u.kind==='car'?'car':'officer',item:u,depth:u.x+u.y});
    for(const n of session.citizens.people)queue.push({kind:'npc',item:n,depth:n.x+n.y});
    for(const n of session.court.friends)queue.push({kind:'courtNpc',item:n,depth:n.x+n.y});
    for(const car of session.traffic.cars)if(car.x>=0&&car.x<=world.width&&car.y>=0&&car.y<=world.height)queue.push({kind:'traffic',item:car,depth:car.x+car.y+22});
    for(const car of trainCars(world.metro,session.time))queue.push({kind:'train',item:car,depth:car.x+car.y+210});
    queue.sort((a,b)=>a.depth-b.depth);
    const minX=cam.x-width/2/cam.zoom-340,maxX=cam.x+width/2/cam.zoom+340,minY=cam.y-height/2/cam.zoom-50,maxY=cam.y+height/2/cam.zoom+500;
    const playerP=project(session.player.x,session.player.y);
    for(const entry of queue){
      const o=entry.item,p=project(o.x,o.y??world.metro.y);
      if(!map&&(p.x<minX||p.x>maxX||p.y<minY||p.y>maxY))continue;
      if(entry.kind==='building'){
        const foot=project(o.x+o.w,o.y+o.h),width=o.w+o.h+22,rect=atlas.rect(o.type),height=width*rect[3]/rect[2];
        const occludes=!map&&session.player.x+session.player.y<entry.depth&&playerP.x>foot.x-width/2&&playerP.x<foot.x+width/2&&playerP.y<foot.y&&playerP.y>foot.y-height;
        const alpha=o.backdrop?.78:occludes?.4:1;
        sprite(c,o.type,foot.x,foot.y,width,null,false,alpha);
        const target=world.targets.find(t=>t.buildingId===o.id);
        if(target)drawFacade(c,o,target,session,atlas,alpha);
        const poster=POSTERS.find(p=>p.buildingId===o.id);
        if(poster){
          const points=drawPoster(c,o,poster,atlas,alpha);
          if(!map&&points&&alpha>.9){
            const screen=points.map(p=>({x:(p.x-cam.x)*cam.zoom+width/2,y:(p.y-cam.y)*cam.zoom+height/2}));
            const x=Math.min(...screen.map(p=>p.x)),y=Math.min(...screen.map(p=>p.y));
            posterHits.push({id:poster.id,x,y,w:Math.max(...screen.map(p=>p.x))-x,h:Math.max(...screen.map(p=>p.y))-y});
          }
        }
      }else if(entry.kind==='perimeter')drawPerimeter(c,o);
      else if(entry.kind==='traffic')drawTrafficCar(c,o);
      else if(entry.kind==='prop')sprite(c,o.type,p.x,p.y,o.width);
      else if(entry.kind==='wall')wall(c,o,session);
      else if(entry.kind==='pillar')box(c,o.x,o.y,o.w,o.h,104,'#a5a799','#727b7e','#8c9492');
      else if(entry.kind==='fence'){
        box(c,o.x,o.y,o.w,o.h,24,'#bbb09b','#596668','#758181');
        for(let n=0;n<Math.max(o.w,o.h);n+=14){const pp=project(o.x+(o.w>o.h?n:0),o.y+(o.h>o.w?n:0),30);c.strokeStyle='#28373c';c.lineWidth=2;c.beginPath();c.moveTo(pp.x,pp.y);c.lineTo(pp.x,pp.y+20);c.stroke();}
      }else if(entry.kind==='rail')rail(c,o.x,session,map);
      else if(entry.kind==='station')station(c,session,map);
      else if(entry.kind==='train')drawTrain(c,o,world.metro,atlas);
      else if(entry.kind==='courtNpc'){
        c.fillStyle='#11172355';c.beginPath();c.ellipse(p.x,p.y,16,6,0,0,Math.PI*2);c.fill();
        sprite(c,o.sprite,p.x,p.y-Math.sin(session.time*2+o.x)*.7,null,70);
        if(session.save.basketball.completed&&o.sprite==='court_ti'){c.save();c.translate(p.x+5,p.y-33);drawBall(c,session.save.basketball.pixels,24);c.restore();}
      }
      else if(entry.kind==='npc'){
        c.fillStyle='#11172338';c.beginPath();c.ellipse(p.x,p.y,11,4,0,0,Math.PI*2);c.fill();
        const frame=(o.back?2:0)+(o.moving?Math.floor(o.walkTime*7)%2:0);
        sprite(c,'citizen_'+o.look+'_'+frame,p.x,p.y,null,55,o.flip);
      }
      else actor(c,o,entry.kind,session);
    }
    for(const t of world.targets)if(!session.painted.has(t.wall_id)){
      const building=t.buildingId&&world.buildings.find(b=>b.id===t.buildingId);
      const p=building?facadeGeometry(building,atlas).marker:project(t.x,t.y,68);marker(c,p.x,p.y,'graffiti',(map?19:24)/cam.zoom,t.state==='AVAILABLE');
    }
    for(const s of world.safeSpots){const p=project(s.x,s.y,16);c.globalAlpha=s.cooldown>0?.35:1;marker(c,p.x,p.y,'safe',(map?18:22)/cam.zoom);c.globalAlpha=1;}
    const home=project(world.hideout.x,world.hideout.y,34);marker(c,home.x,home.y,'home',(map?23:28)/cam.zoom,true);
    const court=project(session.court.x,session.court.y-44,88);marker(c,court.x,court.y,'court',(map?23:26)/cam.zoom,session.near?.type==='court');
    if(map){
      for(const z of world.zones){
        if(width<560&&!['hideout','metro','construction'].includes(z.id))continue;
        const p=project(z.x,z.y,16);c.save();c.translate(p.x,p.y);c.scale(1/cam.zoom,1/cam.zoom);label(c,z.name,0,0);c.restore();
      }
      for(const u of session.police.units){const p=project(u.x,u.y);marker(c,p.x,p.y,'police',16/cam.zoom);}
      const p=project(session.player.x,session.player.y);c.fillStyle='#f5d775';c.beginPath();c.arc(p.x,p.y,6/cam.zoom,0,Math.PI*2);c.fill();
    }else for(const e of session.effects.items)if(e.life>0){c.globalAlpha=Math.min(1,e.life*2);c.fillStyle=e.color;c.fillRect(e.x,e.y,4,4);}c.globalAlpha=1;
    c.restore();session.metrics.drawCalls=atlas.drawCalls;
    return cam;
  }
  return {atlas,posterHits,world:renderWorld,hideout:(c,s,w,h)=>renderHideout(c,s,w,h,atlas),
    drawTrophy:(c,id,x,y,size)=>drawTrophy(c,id,atlas,x,y,size),
    drawGraffiti:(c,id,x,y,w,h,color)=>drawGraffiti(c,id,x,y,w,h,atlas,color)};
}




