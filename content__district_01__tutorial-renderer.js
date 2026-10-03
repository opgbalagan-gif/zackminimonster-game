import {drawTrafficSignals} from './content__district_01__traffic-renderer.js?v=14892ebffd3d';
import {vehicleProjection} from './core__vehicle-projection.js?v=14892ebffd3d';
import {neighbourhoodArt} from './content__levels__sandbox__neighbourhood-art.js?v=14892ebffd3d';
import {surfaceTrain} from './core__sandbox-metro.js?v=14892ebffd3d';
import {SpriteAtlas} from './core__sprites.js?v=14892ebffd3d';
import {project} from './core__geometry.js?v=14892ebffd3d';
import {heroSprite} from './core__hideout.js?v=14892ebffd3d';
import {polygon,box} from './content__district_01__terrain.js?v=14892ebffd3d';
import {drawGraffiti} from './content__district_01__graffiti-art.js?v=14892ebffd3d';
import {renderHideout,drawTrophy} from './content__district_01__hideout-renderer.js?v=14892ebffd3d';
import {createStreetKit,STREET_PROPS} from './content__levels__first-mark__street-kit.js?v=14892ebffd3d';
import {OccluderFade} from './core__occluder-fade.js?v=14892ebffd3d';
import {citizenSpeakers,drawCitizenSpeech} from './core__citizen-speech.js?v=14892ebffd3d';

function fightCloud(c,s){
  const t=s.tutorial.fightBurst,p=project(s.tutorial.actor.x-11,s.tutorial.actor.y+10),pulse=Math.sin(t*27);
  c.save();c.translate(p.x+Math.round(pulse*4),p.y-36);
  c.fillStyle='#101c2855';c.beginPath();c.ellipse(0,35,63,12,0,0,Math.PI*2);c.fill();
  // Chunky scallops and a dark outline keep this cartoon scuffle readable at game scale.
  c.lineWidth=3;c.strokeStyle='#33424b';c.fillStyle='#dce4db';c.beginPath();
  for(let i=0;i<12;i++){
    const angle=i*Math.PI/6,r=1+Math.sin(t*19+i*2)*.08,x=Math.cos(angle)*42*r,y=Math.sin(angle)*24*r;
    c.moveTo(x+22,y);c.arc(x,y,22+(i%3)*2,0,Math.PI*2);
  }c.fill();c.stroke();
  c.fillStyle='#eef0da';c.beginPath();c.ellipse(0,-3,46,29,0,0,Math.PI*2);c.fill();
  c.strokeStyle='#839a9e';c.lineWidth=3;
  for(let i=0;i<3;i++){c.beginPath();c.arc((i-1)*25,Math.sin(t*14+i)*7,11,0.2+t+i,Math.PI*1.35+t+i);c.stroke();}
  for(let i=0;i<5;i++){
    const angle=t*1.7+i*Math.PI*2/5,x=Math.cos(angle)*(72+Math.sin(t*12+i)*6),y=Math.sin(angle)*46-8;
    c.save();c.translate(Math.round(x),Math.round(y));c.rotate(-angle+t*3);c.beginPath();
    for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r=k%2?5:12;k?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
    c.closePath();c.fillStyle=i%2?'#ffe6a0':'#ffd25b';c.strokeStyle='#77572e';c.lineWidth=2;c.fill();c.stroke();c.restore();
  }
  c.restore();
}

export function createTutorialRenderer(pack){
  const markerHits=[];
  const atlas=new SpriteAtlas(pack.atlas,pack.images),kit=createStreetKit(pack.images);
  const neighbourhood=neighbourhoodArt(pack.images,atlas);
  const fades=new OccluderFade(),masks=new Map();let lastTime,followPoint;
  function spriteMask(id){
    if(!masks.has(id)){
      const sprite=pack.atlas.sprites[id],[sx,sy,sw,sh]=sprite.rect;
      const surface=document.createElement('canvas');surface.width=128;surface.height=Math.ceil(128*sh/sw);
      const ctx=surface.getContext('2d',{willReadFrequently:true});ctx.drawImage(pack.images[sprite.sheet],sx,sy,sw,sh,0,0,surface.width,surface.height);
      const pixels=ctx.getImageData(0,0,surface.width,surface.height).data;
      masks.set(id,(u,v)=>pixels[(Math.min(surface.height-1,Math.floor(v*surface.height))*128+Math.min(127,Math.floor(u*128)))*4+3]>100);
    }return masks.get(id);
  }
  function houseArt(building,day){
    const type=building.artType??'apartment';
    return type==='brick'?{id:'brick_house',width:320,mural:[540,930,360,270]}:type==='blue'?{id:'blue_house',width:320,mural:[510,930,370,270]}:{id:day?'apartment_day':'apartment',width:335,mural:[505,960,350,280]};
  }
  function house(c,s,building=s.world.buildings[0]){
    const day=s.life&&!s.life.night,art=houseArt(building,day),rect=atlas.rect(art.id),target=s.world.targets.find(t=>t.buildingId===building.id),p=project(building.x+building.w,building.y+building.h,-36);
    c.save();if(!day&&building.artType&&building.artType!=='apartment')c.filter='brightness(.78) saturate(.9)';atlas.draw(c,art.id,p.x,p.y,art.width);c.restore();
    if(building.poster){
      const scale=art.width/rect[2];c.save();c.translate(Math.round(p.x)-art.width/2,Math.round(p.y)-rect[3]*scale);c.scale(scale,scale);
      c.translate(art.mural[0]+275,art.mural[1]-45);c.transform(1,-.36,0,1,0,0);
      c.fillStyle='#d7cab0';c.fillRect(-2,-2,119,179);atlas.draw(c,'poster_'+building.poster,57.5,175,115,175);c.restore();
    }
    if(s.world.sandbox?!target||!s.painted.has(target.wall_id):!s.save.campaign.tutorialFacadePainted)return;
    // The drawn side facades are blank: no windows or pipes cut through the artwork.
    const scale=art.width/rect[2],[mx,my,fullWidth,mh]=art.mural,mw=building.poster?255:fullWidth;
    c.save();c.translate(Math.round(p.x)+Math.round(-art.width/2),Math.round(p.y)+Math.round(-rect[3]*scale));c.scale(scale,scale);
    c.translate(mx,my);c.transform(1,-.36,0,1,0,0);c.beginPath();c.rect(0,0,mw,mh);c.clip();
    drawGraffiti(c,target?.graffiti_id??'zack_tag',0,0,mw,mh,atlas);c.restore();
  }
  function wall(c,s,target=s.world.targets[0],placement){
    if(placement){c.save();const anchor=project(placement.x,placement.y+14),base=project(392,266);c.translate(anchor.x,anchor.y);c.scale(placement.w/202,placement.w/202);c.translate(-base.x,-base.y);}
    const a=project(392,266),b=project(594,266),top=[project(392,252,94),project(594,252,94),project(594,266,94),project(392,266,94)];
    polygon(c,top,'#9e957c','#27323a',2);
    const face=[project(392,266,90),project(594,266,90),b,a];polygon(c,face,'#727766');kit.material.quad(c,'wall',face,.2);
    c.save();c.transform(1,.5,0,1,a.x,a.y-90);c.beginPath();c.rect(0,0,202,90);c.clip();
    if(s.world.sandbox?s.painted.has(target.wall_id):s.tutorial.wall==='own'||s.tutorial.coating>0)drawGraffiti(c,target.graffiti_id,12,4,176,82,atlas);
    if(s.tutorial.tag>0){c.save();c.beginPath();c.rect(0,0,202*s.tutorial.tag,90);c.clip();atlas.draw(c,'gang_colour',106,72,186,56);c.restore();}
    if(s.tutorial.coating>0){
      c.save();c.beginPath();c.rect(14,0,174*s.tutorial.coating,90);c.clip();
      // A separate decal preserves bare wall and old artwork around the roller strokes.
      c.drawImage(pack.images.roller_patch,0,100,1536,824,14,7,174,78);c.restore();
    }
    c.restore();if(placement)c.restore();
  }
  function world(c,s,w,h){
    c.imageSmoothingEnabled=false;atlas.drawCalls=0;const day=s.life&&!s.life.night;c.fillStyle=day?'#708b98':'#071018';c.fillRect(0,0,w,h);
    const sky=day?pack.images.reference_background_day:pack.images.reference_background;
    c.drawImage(sky,0,0,w,h);
    c.filter='none';
    // Keep the complete first block visible; the street is deliberately small.
    const cam=s.camera,mobile=w<=700,sandbox=s.world.sandbox,originX=sandbox?w/2:mobile?w/2:(w-420)/2,originY=h*(sandbox?.50:mobile?.30:.46);
    cam.zoom=1.18*Math.max(.12,Math.min(.85,(mobile?w:w-450)/(s.world.id==='sneak'?1260:940),(mobile?h*.53:h-100)/730));cam.x=s.world.id==='sneak'?130:45;cam.y=230;cam.ready=true;
    const dt=lastTime===undefined?1/60:Math.max(1/60,s.time-lastTime);lastTime=s.time;
    if(sandbox){const p=project(s.player.x,s.player.y);followPoint??={x:p.x,y:p.y-70};const f=1-Math.exp(-dt*6);followPoint.x+=(p.x-followPoint.x)*f;followPoint.y+=(p.y-70-followPoint.y)*f;cam.x=followPoint.x;cam.y=followPoint.y;cam.zoom=Math.min(.95,Math.max(.52,w/720));}
    const heroPoint=project(s.player.x,s.player.y),hero=s.tutorial.bin?null:{x:heroPoint.x-13,y:heroPoint.y-61,w:26,h:57,depth:s.player.x+s.player.y};
    function faded(id,bounds,depth,draw,mask){c.save();c.globalAlpha*=fades.alpha(id,bounds,depth,hero,dt,mask);draw();c.restore();}
    function spriteObject(id,x,y,width,depth,draw){const p=project(x,y),rect=atlas.rect(id),height=width*rect[3]/rect[2];faded(id+':'+x+':'+y,{x:p.x-width/2,y:p.y-height,w:width,h:height},depth,draw??(()=>atlas.draw(c,id,p.x,p.y,width)),spriteMask(id));}
    c.save();c.translate(originX,originY);c.scale(cam.zoom,cam.zoom);c.translate(-cam.x,-cam.y);
    if(sandbox){
      const quad=(x,y,ww,hh)=>[project(x,y),project(x+ww,y),project(x+ww,y+hh),project(x,y+hh)];
      const bounds=s.world.mapBounds;
      box(c,bounds.x,bounds.y,bounds.w,bounds.h,0,'#504d43','#1c2a32','#29323a',-22);
      c.save();polygon(c,quad(bounds.x,bounds.y,bounds.w,bounds.h),'#625d51');c.clip();
      for(let x=bounds.x;x<bounds.x+bounds.w;x+=180)for(let y=bounds.y;y<bounds.y+bounds.h;y+=180)kit.material.quad(c,'paving',quad(x,y,180,180),.24);
      c.restore();
      for(const r of s.world.roads)kit.road(c,r.x,r.y,r.w,r.h);
      for(const r of s.world.roads){
        // Leave junctions open: neither curbs nor centre lines cross the other street.
        const horizontal=r.w>r.h,start=horizontal?r.x:r.y,end=start+(horizontal?r.w:r.h),cross=s.traffic.crossings.map(t=>[horizontal?t.x:t.y,(horizontal?t.x+t.w:t.y+t.h)]).sort((a,b)=>a[0]-b[0]);
        let at=start;const spans=[];for(const [a,b] of cross){if(a>at)spans.push([at,a]);at=Math.max(at,b);}if(at<end)spans.push([at,end]);
        c.save();c.transform(1,.5,-1,.5,0,0);
        for(const [a,b] of spans){
          c.strokeStyle='#b4aa8c';c.lineWidth=4;c.setLineDash([]);c.beginPath();
          for(const side of [0,1]){if(horizontal){c.moveTo(a,r.y+side*r.h);c.lineTo(b,r.y+side*r.h);}else{c.moveTo(r.x+side*r.w,a);c.lineTo(r.x+side*r.w,b);}}c.stroke();
          c.strokeStyle='#c3ab70';c.lineWidth=2;c.setLineDash([22,21]);c.beginPath();if(horizontal){c.moveTo(a+12,r.y+r.h/2);c.lineTo(b-12,r.y+r.h/2);}else{c.moveTo(r.x+r.w/2,a+12);c.lineTo(r.x+r.w/2,b-12);}c.stroke();
        }c.restore();
      }
      // Crossings connect both sides of the block without crossing building footprints.
      c.save();c.transform(1,.5,-1,.5,0,0);c.fillStyle='#c2b99e';for(const x of [100,900,1080,1450])for(const y of [424,928])for(let k=0;k<6;k++)c.fillRect(x,y+k*15,16,7);c.restore();
      neighbourhood.court(c,s.world.court);neighbourhood.rails(c,s.world.surfaceMetro);
    }else kit.floor(c,{night:!day});
    if(s.world.id==='sneak'){
      box(c,632,92,250,460,0,'#504d43','#1c2a32','#29323a',-22);
      const quad=(x,y,ww,hh)=>[project(x,y),project(x+ww,y),project(x+ww,y+hh),project(x,y+hh)];
      kit.material.quad(c,'paving',quad(632,92,250,460),.24);kit.road(c,632,412,250,112);
    }
    if(sandbox)drawTrafficSignals(c,s.traffic);
    const queue=[{kind:'house',depth:566},{kind:'wall',depth:760},{kind:'zack',depth:s.player.x+s.player.y}];
    if(sandbox){
      for(const car of surfaceTrain(s.world.surfaceMetro,s.time))queue.push({kind:'metro',car,depth:car.x+car.y});
      const station=s.world.surfaceMetro.station;queue.push({kind:'station',depth:station.x+station.y-50});
      for(const hoop of s.world.hoops)queue.push({kind:'hoop',hoop,depth:hoop.x+hoop.y});
      for(const actor of s.court.friends)queue.push({kind:'visitor',actor,depth:actor.x+actor.y});
      for(let x=80;x<2200;x+=160)queue.push({kind:'rail-fence',x,depth:x+80+1298});
    }
    for(const car of s.traffic.cars)queue.push({kind:'car',car,depth:car.x+car.y});
    for(const building of s.world.buildings.slice(1))queue.push({kind:'block-house',building,depth:building.x+building.w+building.y+building.h});
    for(const [i,placement] of (s.world.extraWalls??[]).entries())queue.push({kind:'extra-wall',placement,target:s.world.targets[i+2],depth:placement.x+placement.w/2+placement.y+14});
    const fighting=s.tutorial.stage==='fight'&&s.tutorial.fightBurst>0;
    if(fighting)queue.push({kind:'fight',depth:s.tutorial.actor.x+s.tutorial.actor.y+25});
    for(const p of STREET_PROPS)queue.push({kind:'prop',...p,depth:p.x+p.y});
    for(const p of s.world.blockProps??[])queue.push({kind:'prop',...p,depth:p.x+p.y});
    queue.push({kind:'fence',depth:500});
    if(s.world.id==='sneak')queue.push({kind:'fence',x:655,depth:810});
    for(const x of [242,469])queue.push({kind:'bollard',x,y:397,depth:x+397});
    if(s.tutorial.actor)queue.push({kind:'guest',depth:s.tutorial.actor.x+s.tutorial.actor.y});
    for(const b of s.world.bins??[])queue.push({kind:'bin',...b,depth:b.x+b.y});
    for(const v of s.life?.visitors??[])queue.push({kind:'visitor',actor:v,depth:v.x+v.y});
    for(const npc of s.world.streetNpcs??[])queue.push({kind:'npc',actor:npc,depth:npc.x+npc.y});
    if(s.player.path.length){c.strokeStyle='#f1ce7888';c.lineWidth=3;c.setLineDash([6,7]);c.beginPath();const start=project(s.player.x,s.player.y);c.moveTo(start.x,start.y);for(const n of s.player.path){const p=project(n.x,n.y);c.lineTo(p.x,p.y);}c.stroke();c.setLineDash([]);}
    for(const o of queue.sort((a,b)=>a.depth-b.depth)){
      if(o.kind==='metro'){neighbourhood.train(c,o.car,s.world.surfaceMetro);continue;}
      if(o.kind==='station'){neighbourhood.station(c,s.world.surfaceMetro);continue;}
      if(o.kind==='hoop'){neighbourhood.hoop(c,o.hoop);continue;}
      if(o.kind==='rail-fence'){if(o.x<1600||o.x>1840)kit.fence(c,o.x,1298,Math.min(160,2210-o.x));continue;}
      if(o.kind==='car'){
        const car=o.car,p=project(car.x,car.y),direction=car.axis==='x'?(car.direction>0?'se':'nw'):(car.direction>0?'sw':'ne');
        c.fillStyle='#09121955';c.beginPath();c.ellipse(p.x,p.y,37,15,0,0,Math.PI*2);c.fill();
        const projection=vehicleProjection(car.type,direction);
        c.save();c.translate(p.x,p.y);c.transform(1,projection.shear,0,projection.scaleY,0,0);
        if(!day)c.filter='brightness(.85)';atlas.draw(c,car.type+'_'+direction,0,0,car.type==='traffic_minivan'?114:car.type==='traffic_lowrider'?118:car.type==='traffic_executive'?110:104);c.restore();continue;
      }
      if(o.kind==='prop'){spriteObject(day?o.id+'_day':o.id,o.x,o.y,o.w,o.depth);continue;}
      if(o.kind==='fence'){const x=o.x??380,length=o.x?210:226,p=project(x,155);faded('fence:'+x,{x:p.x,y:p.y-65,w:length,h:length*.5+65},o.depth,()=>kit.fence(c,x,155,length),(u,v)=>{const localY=v*(length*.5+65)-65;return localY<u*length*.5&&localY>u*length*.5-65;});continue;}
      if(o.kind==='bollard'){kit.bollard(c,o.x,o.y);continue;}
      if(o.kind==='house'||o.kind==='block-house'){const b=o.building??s.world.buildings[0],art=houseArt(b,day),r=atlas.rect(art.id),p=project(b.x+b.w,b.y+b.h,-36),hh=art.width*r[3]/r[2];faded(b.id,{x:p.x-art.width/2,y:p.y-hh,w:art.width,h:hh},o.depth,()=>house(c,s,b),spriteMask(art.id));continue;}
      if(o.kind==='bin'){const p=project(o.x,o.y);spriteObject(day?'dumpster_day':'dumpster',o.x,o.y,90,o.depth);if(s.tutorial.bin?.id===o.id){c.fillStyle='#f3d283';c.font='bold 13px monospace';c.textAlign='center';c.fillText('ТИШЕ…',p.x,p.y-58);}continue;}
      if(o.kind==='wall'){const p=project(392,266);faded('wall',{x:p.x,y:p.y-94,w:202,h:195},o.depth,()=>wall(c,s),(u,v)=>{const yy=v*195-94;return yy<=u*101&&yy>=u*101-94;});continue;}
      if(o.kind==='extra-wall'){const p=project(o.placement.x,o.placement.y+14),width=o.placement.w;faded(o.target.wall_id,{x:p.x,y:p.y-94,w:width,h:94+width/2},o.depth,()=>wall(c,s,o.target,o.placement));continue;}
      if(o.kind==='fight'){fightCloud(c,s);continue;}
      if(fighting&&(o.kind==='zack'||o.kind==='guest'))continue;
      if(o.kind==='zack'&&s.tutorial.bin)continue;
      const actor=o.kind==='visitor'||o.kind==='npc'?o.actor:o.kind==='zack'?s.player:s.tutorial.actor,p=project(actor.x,actor.y);
      c.fillStyle='#15202055';c.beginPath();c.ellipse(p.x,p.y,15,6,0,0,Math.PI*2);c.fill();
      const frame=actor.moving&&Math.floor(s.time*7)%2;
      if(o.kind==='npc'){atlas.draw(c,actor.speakingFor>0?'roby_talk':s.player.x<actor.x?'roby_left':'roby_front',p.x,p.y,null,84);continue;}
      const sprite=o.kind==='zack'?heroSprite(s.save.player.skin,s.player.state,s.player.facing,frame):actor.sprite==='officer'&&frame?'officer_walk':actor.sprite;
      atlas.draw(c,sprite,p.x,p.y,null,66);
      if(o.kind==='visitor'&&['photo','tip'].includes(actor.phase)){
        if(actor.phase==='photo'){c.fillStyle='#151e2b';c.fillRect(p.x-15,p.y-43,17,11);c.fillStyle='#c6e1e8';c.fillRect(p.x-11,p.y-40,6,5);if(actor.age>1.1&&actor.age<1.35){c.fillStyle='#fff8c0';c.beginPath();c.arc(p.x-7,p.y-40,11,0,Math.PI*2);c.fill();}}
        else{c.fillStyle='#ffe39b';c.font='bold 15px monospace';c.textAlign='center';c.fillText('+'+(actor.tip??10)+' ₽',p.x,p.y-74);}
      }
      if(o.kind==='guest'&&['rival','cleaner'].includes(s.tutorial.stage)&&!actor.path.length){
        const dy=Math.sin(s.time*8)*15;c.strokeStyle='#d5c3a0';c.lineWidth=3;c.beginPath();c.moveTo(p.x-7,p.y-34);c.lineTo(p.x-20,p.y-61+dy);c.stroke();
        c.fillStyle=s.tutorial.stage==='cleaner'?'#fffef5':'#df6ab2';c.fillRect(p.x-29,p.y-67+dy,s.tutorial.stage==='cleaner'?20:9,9);
      }
      if(o.kind==='guest'&&['return_wall','cleaner','cleaner_done'].includes(s.tutorial.stage)){
        c.fillStyle='#a0aeb2';c.fillRect(p.x+13,p.y-13,15,14);c.fillStyle='#fffef5';c.fillRect(p.x+14,p.y-13,13,4);
        c.strokeStyle='#344b53';c.lineWidth=2;c.beginPath();c.arc(p.x+20,p.y-12,7,Math.PI,Math.PI*2);c.stroke();
      }
    }
    const target=['escape','complete'].includes(s.tutorial.stage)?s.world.hideout:s.world.targets[0].approach,q=project(target.x,target.y);
    if(['walk','paint','return_wall','repaint','escape'].includes(s.tutorial.stage)){c.strokeStyle='#efcc79';c.lineWidth=3;c.beginPath();c.ellipse(q.x,q.y+3,24+Math.sin(s.time*3)*2,10,0,0,Math.PI*2);c.stroke();}
    c.restore();s.metrics.drawCalls=atlas.drawCalls;
    drawCitizenSpeech(c,citizenSpeakers(s),actor=>{const p=project(actor.x,actor.y,70);return {x:originX+(p.x-cam.x)*cam.zoom,y:originY+(p.y-cam.y)*cam.zoom};},w,h);
    markerHits.length=0;
    for(const [id,x,y,z] of [['home',278,288,425],['wall',494,266,106]]){const p=project(x,y,z);markerHits.push({id,x:originX+(p.x-cam.x)*cam.zoom,y:originY+(p.y-cam.y)*cam.zoom});}
    if(s.tutorial.allowedTarget(s.world.targets[1]))markerHits.push({id:'facade',x:originX+(24-cam.x)*cam.zoom,y:originY+(173-cam.y)*cam.zoom});
    for(const bin of s.world.bins??[]){const p=project(bin.x,bin.y,62);markerHits.push({id:bin.id,x:originX+(p.x-cam.x)*cam.zoom,y:originY+(p.y-cam.y)*cam.zoom});}
    for(const npc of s.world.streetNpcs??[]){if(npc.speakingFor>0)continue;const p=project(npc.x,npc.y,94);markerHits.push({id:npc.id,x:originX+(p.x-cam.x)*cam.zoom,y:originY+(p.y-cam.y)*cam.zoom});}
    if(sandbox)for(const [id,point,z] of [['court',s.court,98],['station',s.world.surfaceMetro.approach,35]]){const p=project(point.x,point.y,z);markerHits.push({id,x:originX+(p.x-cam.x)*cam.zoom,y:originY+(p.y-cam.y)*cam.zoom});}
    for(const target of s.world.targets.slice(2)){const p=target.buildingId?project(target.x+20,target.y-20,14):project(target.x,target.y,106);markerHits.push({id:target.wall_id,x:originX+(p.x-cam.x)*cam.zoom,y:originY+(p.y-cam.y)*cam.zoom});}
    if(fighting&&s.tutorial.fightBurst>3.1){c.fillStyle='rgba(12,19,26,'+Math.min(1,(s.tutorial.fightBurst-3.1)/.5)+')';c.fillRect(0,0,w,h);}
    // Camera input uses a screen-centred origin; compensate for the raised composition.
    cam.x+=(w/2-originX)/cam.zoom;cam.y+=(h/2-originY)/cam.zoom;
    return cam;
  }
  return {atlas,posterHits:[],markerHits,world,hideout:(c,s,w,h)=>renderHideout(c,s,w,h,atlas),drawTrophy:(c,id,x,y,size)=>drawTrophy(c,id,atlas,x,y,size),drawGraffiti:(c,id,x,y,w,h,color)=>drawGraffiti(c,id,x,y,w,h,atlas,color)};
}
