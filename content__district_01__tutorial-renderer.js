import {SpriteAtlas} from './core__sprites.js';
import {project} from './core__geometry.js';
import {heroSprite} from './core__hideout.js';
import {polygon,box} from './content__district_01__terrain.js';
import {drawGraffiti} from './content__district_01__graffiti-art.js';
import {renderHideout,drawTrophy} from './content__district_01__hideout-renderer.js';
import {createStreetKit,STREET_PROPS} from './content__levels__first-mark__street-kit.js';
import {OccluderFade} from './core__occluder-fade.js';

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
  const fades=new OccluderFade(),masks=new Map();let lastTime;
  function spriteMask(id){
    if(!masks.has(id)){
      const sprite=pack.atlas.sprites[id],[sx,sy,sw,sh]=sprite.rect;
      const surface=document.createElement('canvas');surface.width=128;surface.height=Math.ceil(128*sh/sw);
      const ctx=surface.getContext('2d',{willReadFrequently:true});ctx.drawImage(pack.images[sprite.sheet],sx,sy,sw,sh,0,0,surface.width,surface.height);
      const pixels=ctx.getImageData(0,0,surface.width,surface.height).data;
      masks.set(id,(u,v)=>pixels[(Math.min(surface.height-1,Math.floor(v*surface.height))*128+Math.min(127,Math.floor(u*128)))*4+3]>100);
    }return masks.get(id);
  }
  function house(c,s){
    const p=project(278,288,-36);atlas.draw(c,'apartment',p.x,p.y,335);
    if(!s.save.campaign.tutorialFacadePainted)return;
    // Coordinates on the source facade: between the pipes, clear of doors and plants.
    const scale=335/950;
    c.save();c.translate(Math.round(p.x)+Math.round(-335/2),Math.round(p.y)+Math.round(-335*1284/950));c.scale(scale,scale);
    c.translate(510,950);c.transform(1,-.36,0,1,0,0);c.beginPath();c.rect(0,0,108,145);c.clip();
    drawGraffiti(c,'zack_tag',0,0,108,145,atlas);c.restore();
  }
  function wall(c,s){
    const a=project(392,266),b=project(594,266),top=[project(392,252,94),project(594,252,94),project(594,266,94),project(392,266,94)];
    polygon(c,top,'#9e957c','#27323a',2);
    const face=[project(392,266,90),project(594,266,90),b,a];polygon(c,face,'#727766');kit.material.quad(c,'wall',face,.2);
    c.save();c.transform(1,.5,0,1,a.x,a.y-90);c.beginPath();c.rect(0,0,202,90);c.clip();
    if(s.tutorial.wall==='own'||s.tutorial.coating>0)drawGraffiti(c,s.world.targets[0].graffiti_id,12,4,176,82,atlas);
    if(s.tutorial.tag>0){c.save();c.beginPath();c.rect(0,0,202*s.tutorial.tag,90);c.clip();atlas.draw(c,'gang_colour',106,72,186,56);c.restore();}
    if(s.tutorial.coating>0){
      c.save();c.beginPath();c.rect(14,0,174*s.tutorial.coating,90);c.clip();
      // A separate decal preserves bare wall and old artwork around the roller strokes.
      c.drawImage(pack.images.roller_patch,0,100,1536,824,14,7,174,78);c.restore();
    }
    c.restore();
  }
  function world(c,s,w,h){
    c.imageSmoothingEnabled=false;atlas.drawCalls=0;const day=s.life&&!s.life.night;c.fillStyle=day?'#708b98':'#071018';c.fillRect(0,0,w,h);
    if(day)c.filter='brightness(1.65) saturate(.65)';
    const sky=pack.images.reference_background;
    c.drawImage(sky,0,0,w,h);
    c.filter='none';if(day){c.fillStyle='#bcd4de33';c.fillRect(0,0,w,h);}
    // Keep the complete first block visible; the street is deliberately small.
    const cam=s.camera,mobile=w<=700,originX=mobile?w/2:(w-420)/2,originY=h*(mobile?.30:.46);
    cam.zoom=Math.max(.12,Math.min(.85,(mobile?w:w-450)/(s.world.id==='sneak'?1260:940),(mobile?h*.53:h-100)/730));cam.x=s.world.id==='sneak'?130:45;cam.y=210;cam.ready=true;
    const dt=lastTime===undefined?1/60:Math.max(1/60,s.time-lastTime);lastTime=s.time;
    const heroPoint=project(s.player.x,s.player.y),hero=s.tutorial.bin?null:{x:heroPoint.x-13,y:heroPoint.y-61,w:26,h:57,depth:s.player.x+s.player.y};
    function faded(id,bounds,depth,draw,mask){c.save();c.globalAlpha*=fades.alpha(id,bounds,depth,hero,dt,mask);draw();c.restore();}
    function spriteObject(id,x,y,width,depth,draw){const p=project(x,y),rect=atlas.rect(id),height=width*rect[3]/rect[2];faded(id+':'+x+':'+y,{x:p.x-width/2,y:p.y-height,w:width,h:height},depth,draw??(()=>atlas.draw(c,id,p.x,p.y,width)),spriteMask(id));}
    c.save();c.translate(originX,originY);c.scale(cam.zoom,cam.zoom);c.translate(-cam.x,-cam.y);
    if(day)c.filter='brightness(1.35) saturate(.83)';
    kit.floor(c);
    if(s.world.id==='sneak'){
      box(c,632,92,250,460,0,'#504d43','#1c2a32','#29323a',-22);
      const quad=(x,y,ww,hh)=>[project(x,y),project(x+ww,y),project(x+ww,y+hh),project(x,y+hh)];
      kit.material.quad(c,'paving',quad(632,92,250,460),.24);kit.material.quad(c,'asphalt',quad(632,412,250,112),.28);
    }
    const queue=[{kind:'house',depth:566},{kind:'wall',depth:760},{kind:'zack',depth:s.player.x+s.player.y}];
    const fighting=s.tutorial.stage==='fight'&&s.tutorial.fightBurst>0;
    if(fighting)queue.push({kind:'fight',depth:s.tutorial.actor.x+s.tutorial.actor.y+25});
    for(const p of STREET_PROPS)queue.push({kind:'prop',...p,depth:p.x+p.y});
    queue.push({kind:'fence',depth:500});
    if(s.world.id==='sneak')queue.push({kind:'fence',x:655,depth:810});
    for(const x of [242,469])queue.push({kind:'bollard',x,y:397,depth:x+397});
    if(s.tutorial.actor)queue.push({kind:'guest',depth:s.tutorial.actor.x+s.tutorial.actor.y});
    for(const b of s.world.bins??[])queue.push({kind:'bin',...b,depth:b.x+b.y});
    for(const v of s.life?.visitors??[])queue.push({kind:'visitor',actor:v,depth:v.x+v.y});
    if(s.player.path.length){c.strokeStyle='#f1ce7888';c.lineWidth=3;c.setLineDash([6,7]);c.beginPath();const start=project(s.player.x,s.player.y);c.moveTo(start.x,start.y);for(const n of s.player.path){const p=project(n.x,n.y);c.lineTo(p.x,p.y);}c.stroke();c.setLineDash([]);}
    for(const o of queue.sort((a,b)=>a.depth-b.depth)){
      if(o.kind==='prop'){spriteObject(o.id,o.x,o.y,o.w,o.depth);continue;}
      if(o.kind==='fence'){const x=o.x??380,length=o.x?210:226,p=project(x,155);faded('fence:'+x,{x:p.x,y:p.y-65,w:length,h:length*.5+65},o.depth,()=>kit.fence(c,x,155,length),(u,v)=>{const localY=v*(length*.5+65)-65;return localY<u*length*.5&&localY>u*length*.5-65;});continue;}
      if(o.kind==='bollard'){kit.bollard(c,o.x,o.y);continue;}
      if(o.kind==='house'){const p=project(278,288,-36),hh=335*1284/950;faded('house',{x:p.x-167.5,y:p.y-hh,w:335,h:hh},o.depth,()=>house(c,s),spriteMask('apartment'));continue;}
      if(o.kind==='bin'){const p=project(o.x,o.y);spriteObject('dumpster',o.x,o.y,90,o.depth);if(s.tutorial.bin?.id===o.id){c.fillStyle='#f3d283';c.font='bold 13px monospace';c.textAlign='center';c.fillText('ТИШЕ…',p.x,p.y-58);}continue;}
      if(o.kind==='wall'){const p=project(392,266);faded('wall',{x:p.x,y:p.y-94,w:202,h:195},o.depth,()=>wall(c,s),(u,v)=>{const yy=v*195-94;return yy<=u*101&&yy>=u*101-94;});continue;}
      if(o.kind==='fight'){fightCloud(c,s);continue;}
      if(fighting&&(o.kind==='zack'||o.kind==='guest'))continue;
      if(o.kind==='zack'&&s.tutorial.bin)continue;
      const actor=o.kind==='visitor'?o.actor:o.kind==='zack'?s.player:s.tutorial.actor,p=project(actor.x,actor.y);
      c.fillStyle='#15202055';c.beginPath();c.ellipse(p.x,p.y,15,6,0,0,Math.PI*2);c.fill();
      const frame=actor.moving&&Math.floor(s.time*7)%2;
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
    const speaker=s.life?.visitors.find(v=>v.phase==='photo'&&v.line);
    if(speaker){
      const p=project(speaker.x,speaker.y,77);c.save();c.font='bold 12px "Roboto Condensed",sans-serif';
      const bw=Math.min(w-24,c.measureText(speaker.line).width+22),bx=Math.max(12,Math.min(w-bw-12,originX+(p.x-cam.x)*cam.zoom-bw/2)),by=Math.max(144,originY+(p.y-cam.y)*cam.zoom-26);
      c.fillStyle='#071018ed';c.strokeStyle='#e8c16a';c.lineWidth=1;c.fillRect(bx,by,bw,26);c.strokeRect(bx,by,bw,26);c.fillStyle='#ffe5a5';c.textAlign='center';c.fillText(speaker.line,bx+bw/2,by+17,bw-12);c.restore();
    }
    markerHits.length=0;
    for(const [id,x,y,z] of [['home',278,288,425],['wall',494,266,106]]){const p=project(x,y,z);markerHits.push({id,x:originX+(p.x-cam.x)*cam.zoom,y:originY+(p.y-cam.y)*cam.zoom});}
    if(s.tutorial.allowedTarget(s.world.targets[1]))markerHits.push({id:'facade',x:originX+(24-cam.x)*cam.zoom,y:originY+(173-cam.y)*cam.zoom});
    for(const bin of s.world.bins??[]){const p=project(bin.x,bin.y,62);markerHits.push({id:bin.id,x:originX+(p.x-cam.x)*cam.zoom,y:originY+(p.y-cam.y)*cam.zoom});}
    if(fighting&&s.tutorial.fightBurst>3.1){c.fillStyle='rgba(12,19,26,'+Math.min(1,(s.tutorial.fightBurst-3.1)/.5)+')';c.fillRect(0,0,w,h);}
    // Camera input uses a screen-centred origin; compensate for the raised composition.
    cam.x+=(w/2-originX)/cam.zoom;cam.y+=(h/2-originY)/cam.zoom;
    return cam;
  }
  return {atlas,posterHits:[],markerHits,world,hideout:(c,s,w,h)=>renderHideout(c,s,w,h,atlas),drawTrophy:(c,id,x,y,size)=>drawTrophy(c,id,atlas,x,y,size),drawGraffiti:(c,id,x,y,w,h,color)=>drawGraffiti(c,id,x,y,w,h,atlas,color)};
}
