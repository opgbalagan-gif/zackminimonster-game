import {facadeGeometry,drawFacade} from './content__district_01__facades.js';
import {perimeterPieces,drawPerimeter} from './content__district_01__perimeter.js';
import {createGroundPlate} from './content__district_01__ground-plate.js';
import {trainCars,drawTrain,loopRails,drawLoopRail} from './content__district_01__metro.js';
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
import {drawHoop} from './content__district_01__court-props.js';
import {wallPieces,fencePieces,coversHero} from './content__district_01__depth-pieces.js';
import {drawWater,drawShore,drawBridges} from './content__district_01__waterfront.js';

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
  const entries=[],posterHits=[],wallTextures=new Map();
  for(const b of [...world.backdrop,...world.buildings])entries.push({kind:'building',item:b,depth:b.x+b.y+b.w+b.h});
  for(const p of world.props)entries.push({kind:'prop',item:p,depth:p.x+p.y});
  for(const t of world.targets)if(!t.buildingId)entries.push(...wallPieces(t));
  for(const o of world.obstacles)if(!o.wallCollider&&!o.boundary&&!o.hoopBase){
    if(o.pillar)entries.push({kind:'pillar',item:o,depth:o.x+o.y+o.w+o.h});
    else entries.push(...fencePieces(o));
  }
  for(const h of world.hoops)entries.push({kind:'hoop',item:h,depth:h.x+h.y+8});
  if(world.metro.loop)for(const r of loopRails(world.metro))entries.push({kind:'loopRail',item:r,depth:r.x+r.y+r.w+r.h});
  else for(let x=world.metro.x;x<world.metro.end;x+=world.metro.segment)entries.push({kind:'rail',item:{x},depth:x+world.metro.segment+world.metro.y+world.metro.width});
  for(const o of perimeterPieces(world))entries.push({kind:'perimeter',item:o,depth:o.x+o.y+o.w+o.h});
  entries.push({kind:'station',item:{x:world.metro.station.x},depth:world.metro.station.x+world.metro.station.w+world.metro.y+120});

  function sprite(c,id,x,y,width,height=null,flip=false,alpha=1){atlas.draw(c,id,x,y,width,height,flip,alpha);}
  function paintWall(c,t,session){
    const wallHeight=t.graffiti_id==='panda_king'?94:56;
    c.fillStyle='#202730';c.fillRect(-43,-wallHeight,86,wallHeight+2);
    wallSurface(c,t.wall_type,-40,-wallHeight+3,80,wallHeight-3);
    if(session.painted.has(t.wall_id)){
      const style=session.runStyles[t.wall_id]??session.save.wall_styles[t.wall_id];
      drawGraffiti(c,t.graffiti_id,-39,-wallHeight+5,78,wallHeight-9,atlas,style?ink(style).color:null);
    }
    else{c.strokeStyle='#d7c9dc';c.setLineDash([4,4]);c.strokeRect(-30,-45,60,36);}
  }
  function wall(c,t,session,clip,alpha=1){
    const style=session.runStyles[t.wall_id]??session.save.wall_styles[t.wall_id],key=t.wall_id+':'+session.painted.has(t.wall_id)+':'+style;
    let texture=wallTextures.get(key);
    if(!texture){texture=document.createElement('canvas');texture.width=86;texture.height=100;
      const ctx=texture.getContext('2d');ctx.translate(43,98);paintWall(ctx,t,session);wallTextures.set(key,texture);}
    const p=project(t.x,t.y);c.save();c.translate(p.x,p.y);c.transform(1,t.axis==='y'?-.5:.5,0,1,0,0);
    c.globalAlpha*=alpha;c.beginPath();c.rect(clip.from,-100,clip.to-clip.from,104);c.clip();
    c.drawImage(texture,-43,-98);c.restore();
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
      if(session.gangs?.push){
        c.translate(p.x,p.y);c.rotate(-.18*Math.sin(Math.min(1,session.gangs.push.age/.54)*Math.PI));sprite(c,id,0,0,null,66);c.restore();
      }else if(session.knockedFor>0){
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
    const region=map&&world.regions?.find(r=>r.id===session.mapRegion),bounds=region??{x:0,y:0,w:world.width,h:world.height};
    const cam=map?{x:bounds.x-bounds.y+(bounds.w-bounds.h)/2,y:(bounds.x+bounds.y)/2+(bounds.w+bounds.h)/4-70,zoom:Math.max(.001,Math.min((width-40)/(bounds.w+bounds.h+400),(height-80)/((bounds.w+bounds.h)/2+400)))}:session.camera;
    c.save();c.translate(width/2,height/2);c.scale(cam.zoom,cam.zoom);c.translate(-cam.x,-cam.y);
    if(world.regions){drawWater(c,cam,width,height,session.time);drawShore(c,world);}
    ground(c,world,plate,cam,width,height);
    drawBridges(c,session,plate);
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
    for(const n of session.gangs?.members(session.city)??[])queue.push({kind:'gang',item:n,depth:n.x+n.y});
    for(const n of world.meetPeople??[])queue.push({kind:'gang',item:{...n,sprite:'citizen_'+n.look+'_0'},depth:n.x+n.y});
    for(const n of session.court.friends)queue.push({kind:'courtNpc',item:n,depth:n.x+n.y});
    for(const car of session.traffic.cars)if(car.x>=0&&car.x<=world.width&&car.y>=0&&car.y<=world.height)queue.push({kind:'traffic',item:car,depth:car.x+car.y+22});
    for(const car of trainCars(world.metro,session.time))queue.push({kind:'train',item:car,depth:car.x+car.y+210});
    queue.sort((a,b)=>a.depth-b.depth);
    const minX=cam.x-width/2/cam.zoom-340,maxX=cam.x+width/2/cam.zoom+340,minY=cam.y-height/2/cam.zoom-50,maxY=cam.y+height/2/cam.zoom+500;
    const playerP=project(session.player.x,session.player.y);
    const visiblePeople=queue.filter(e=>['hero','npc','courtNpc','gang','companion','officer'].includes(e.kind)).map(e=>({...project(e.item.x,e.item.y),depth:e.depth})).filter(p=>p.x>minX&&p.x<maxX&&p.y>minY&&p.y<maxY);
    for(const entry of queue){
      const o=entry.item,p=project(o.x,o.y??world.metro.y);
      if(p.x<minX||p.x>maxX||p.y<minY||p.y>maxY)continue;
      if(entry.kind==='building'){
        const foot=project(o.x+o.w,o.y+o.h),buildingWidth=o.w+o.h+22,rect=atlas.rect(o.type),buildingHeight=buildingWidth*rect[3]/rect[2];
        const occluded=map?[]:visiblePeople.filter(p=>p.depth<entry.depth&&p.x+15>foot.x-buildingWidth/2&&p.x-15<foot.x+buildingWidth/2&&p.y-52<foot.y&&p.y>foot.y-buildingHeight);
        const target=world.targets.find(t=>t.buildingId===o.id);
        const poster=POSTERS.find(p=>p.buildingId===o.id);
        let points=null;
        const paint=alpha=>{sprite(c,o.type,foot.x,foot.y,buildingWidth,null,false,alpha);if(target)drawFacade(c,o,target,session,atlas,alpha);if(poster)points=drawPoster(c,o,poster,atlas,alpha);};
        if(!occluded.length)paint(o.backdrop?.78:1);
        else{
          // Reveal only the character silhouette area, keeping the rest of the facade solid.
          c.save();c.beginPath();c.rect(foot.x-buildingWidth/2-2,foot.y-buildingHeight-2,buildingWidth+4,buildingHeight+4);
          for(const p of occluded)c.rect(p.x-19,p.y-65,38,70);c.clip('evenodd');paint(1);c.restore();
          c.save();c.beginPath();for(const p of occluded)c.rect(p.x-19,p.y-65,38,70);c.clip();paint(.18);c.restore();
        }
        if(poster){
          if(!map&&points){
            const screen=points.map(p=>({x:(p.x-cam.x)*cam.zoom+width/2,y:(p.y-cam.y)*cam.zoom+height/2}));
            const x=Math.min(...screen.map(p=>p.x)),y=Math.min(...screen.map(p=>p.y));
            posterHits.push({id:poster.id,x,y,w:Math.max(...screen.map(p=>p.x))-x,h:Math.max(...screen.map(p=>p.y))-y});
          }
        }
      }else if(entry.kind==='perimeter')drawPerimeter(c,o);
      else if(entry.kind==='traffic')drawTrafficCar(c,o);
      else if(entry.kind==='prop'){
        if(o.meet){c.save();c.globalAlpha=.28+Math.sin(session.time*2)*.08;c.fillStyle=o.color;c.beginPath();c.ellipse(p.x,p.y,44,17,0,0,Math.PI*2);c.fill();c.restore();}
        sprite(c,o.type,p.x,p.y,o.width);
      }
      else if(entry.kind==='wall'){
        const slope=o.axis==='y'?-.5:.5,height=o.graffiti_id==='panda_king'?94:56;
        const points=[entry.clip.from,entry.clip.to].flatMap(u=>[{x:p.x+u,y:p.y+slope*u},{x:p.x+u,y:p.y+slope*u-height}]);
        wall(c,o,session,entry.clip,!map&&coversHero(points,session.player,entry.depth)?.28:1);
      }
      else if(entry.kind==='hoop')drawHoop(c,o);
      else if(entry.kind==='pillar')box(c,o.x,o.y,o.w,o.h,104,'#a5a799','#727b7e','#8c9492');
      else if(entry.kind==='fence'){
        c.save();
        const points=[project(o.x,o.y,30),project(o.x+o.w,o.y,30),project(o.x,o.y+o.h),project(o.x+o.w,o.y+o.h)];
        if(!map&&coversHero(points,session.player,entry.depth))c.globalAlpha*=.28;
        box(c,o.x,o.y,o.w,o.h,24,'#bbb09b','#596668','#758181');
        for(let n=0;n<Math.max(o.w,o.h);n+=14){const pp=project(o.x+(o.w>o.h?n:0),o.y+(o.h>o.w?n:0),30);c.strokeStyle='#28373c';c.lineWidth=2;c.beginPath();c.moveTo(pp.x,pp.y);c.lineTo(pp.x,pp.y+20);c.stroke();}
        c.restore();
      }else if(entry.kind==='loopRail'){
        c.save();if(!map&&distance(session.player,{x:o.x+o.w/2,y:o.y+o.h/2})<140)c.globalAlpha=.4;drawLoopRail(c,o,world.metro);c.restore();
      }
      else if(entry.kind==='rail')rail(c,o.x,session,map);
      else if(entry.kind==='station')station(c,session,map);
      else if(entry.kind==='train')drawTrain(c,o,world.metro,atlas);
      else if(entry.kind==='courtNpc'){
        c.fillStyle='#11172355';c.beginPath();c.ellipse(p.x,p.y,16,6,0,0,Math.PI*2);c.fill();
        sprite(c,o.sprite,p.x,p.y-Math.sin(session.time*2+o.x)*.7,null,70);
        if(session.save.basketball.completed&&o.sprite==='court_ti'){c.save();c.translate(p.x+5,p.y-33);drawBall(c,session.save.basketball,24,{atlas});c.restore();}
      }
      else if(entry.kind==='gang'){
        c.fillStyle='#11172355';c.beginPath();c.ellipse(p.x,p.y,14,6,0,0,Math.PI*2);c.fill();
        sprite(c,o.sprite,p.x,p.y,null,65);
        if(o.leader&&!map){c.save();c.translate(p.x,p.y-78);c.scale(1/cam.zoom,1/cam.zoom);label(c,o.name,0,0,o.open?'#b9d2a1':'#f2b76a');c.restore();}
      }
      else if(entry.kind==='npc'){
        c.fillStyle='#11172338';c.beginPath();c.ellipse(p.x,p.y,11,4,0,0,Math.PI*2);c.fill();
        const frame=(o.back?2:0)+(o.moving?Math.floor(o.walkTime*7)%2:0);
        sprite(c,'citizen_'+o.look+'_'+frame,p.x,p.y,null,55,o.flip);
      }
      else actor(c,o,entry.kind,session);
    }
    for(const t of world.targets)if(!session.painted.has(t.wall_id)&&(!map||!world.regions||(region&&t.regionId===region.id))){
      const building=t.buildingId&&world.buildings.find(b=>b.id===t.buildingId);
      const p=(building&&facadeGeometry(building,atlas)?.marker)||project(t.x,t.y,68);marker(c,p.x,p.y,'graffiti',(map?19:24)/cam.zoom,t.state==='AVAILABLE');
    }
    if(!map||!world.regions)for(const s of world.safeSpots){const p=project(s.x,s.y,16);c.globalAlpha=s.cooldown>0?.35:1;marker(c,p.x,p.y,'safe',(map?18:22)/cam.zoom);c.globalAlpha=1;}
    for(const h of world.hideouts??[world.hideout]){const home=project(h.x,h.y,34);marker(c,home.x,home.y,'home',(map?16:28)/cam.zoom,true);}
    const court=project(session.court.x,session.court.y-44,88);marker(c,court.x,court.y,'court',(map?23:26)/cam.zoom,session.near?.type==='court');
    for(const station of world.metroStations??[]){const p=project(station.x,station.y,world.metro.height+35);c.save();c.translate(p.x,p.y);c.scale(1/cam.zoom,1/cam.zoom);label(c,'M'+(map?'':' / '+station.name),0,0,'#a7d6eb');c.restore();}
    for(const poi of world.pointsOfInterest??[]){const p=project(poi.x,poi.y,70);c.save();c.translate(p.x,p.y);c.scale(1/cam.zoom,1/cam.zoom);label(c,map&&!region?(poi.kind==='meet'?'MEET':poi.kind==='mall'?'MALL':'CITY'):poi.name,0,0,poi.kind==='meet'?'#f59789':'#9ddbd4');c.restore();}
    if(map){
      if(!region)for(const r of session.city??[]){
        const p=project(r.x+r.w/2,r.y+r.h/2,100);
        c.save();c.translate(p.x,p.y);c.scale(1/cam.zoom,1/cam.zoom);label(c,r.name,0,0,r.color);
        label(c,r.open?'ОТКРЫТ':r.required+' REP',0,25,r.open?'#b9d2a1':'#bbc4ca');c.restore();
      }
      if(world.river){const p=project(world.river.x,world.river.y);c.save();c.translate(p.x,p.y);c.scale(1/cam.zoom,1/cam.zoom);label(c,world.river.name,0,0,'#97ccc9');c.restore();}
      for(const z of world.zones){
        if(width<560&&!['hideout','metro','construction'].includes(z.id))continue;
        const p=project(z.x,z.y,16);c.save();c.translate(p.x,p.y);c.scale(1/cam.zoom,1/cam.zoom);label(c,z.name,0,0);c.restore();
      }
      if(!world.regions)for(const u of session.police.units){const p=project(u.x,u.y);marker(c,p.x,p.y,'police',16/cam.zoom);}
      const p=project(session.player.x,session.player.y);c.fillStyle='#f5d775';c.beginPath();c.arc(p.x,p.y,6/cam.zoom,0,Math.PI*2);c.fill();
    }else for(const e of session.effects.items)if(e.life>0){c.globalAlpha=Math.min(1,e.life*2);c.fillStyle=e.color;c.fillRect(e.x,e.y,4,4);}c.globalAlpha=1;
    c.restore();session.metrics.drawCalls=atlas.drawCalls;
    return cam;
  }
  return {atlas,posterHits,world:renderWorld,hideout:(c,s,w,h)=>renderHideout(c,s,w,h,atlas),
    drawTrophy:(c,id,x,y,size)=>drawTrophy(c,id,atlas,x,y,size),
    drawGraffiti:(c,id,x,y,w,h,color)=>drawGraffiti(c,id,x,y,w,h,atlas,color)};
}




