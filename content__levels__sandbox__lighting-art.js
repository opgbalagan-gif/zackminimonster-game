import {project} from './core__geometry.js?v=3550d357cf95';
import {sceneLight,shadowFootprint} from './core__lighting.js?v=3550d357cf95';
import {polygon} from './content__district_01__terrain.js?v=3550d357cf95';
import {STREET_PROPS} from './content__levels__first-mark__street-kit.js?v=3550d357cf95';
export function groundLighting(c,s,w,h,continuation={}){
  const light=sceneLight(s.life.night),cam=s.camera;
  const visible=(x,y,margin=500)=>{const p=project(x,y);return Math.abs(p.x-cam.x)<w/cam.zoom/2+margin&&Math.abs(p.y-cam.y)<h/cam.zoom/2+margin;};
  c.save();c.fillStyle=light.color;c.globalAlpha=light.alpha;
  for(const b of [...s.world.buildings,...continuation.buildings??[]])if(visible(b.x,b.y))polygon(c,shadowFootprint(b,b.nanoVariant===1?140:b.nanoVariant===3?130:245,light).map(p=>project(...p)),light.color);
  for(const p of [...s.world.nature??[],...continuation.nature??[]])if(visible(p.x,p.y,200)){
    if(p.id==='comic_tank'){
      // The sprite is anchored at the centre of its base, including its rear half.
      const a=project(p.x,p.y),b=project(p.x+p.w*.43*light.dx,p.y+p.w*.43*light.dy);
      c.beginPath();c.ellipse((a.x+b.x)/2,(a.y+b.y)/2,p.w*.35+Math.abs(b.x-a.x)/2,p.w*.145+Math.abs(b.y-a.y)/2,0,0,Math.PI*2);c.fill();continue;
    }
    const ground=project(p.x,p.y),tip=project(p.x+80*light.dx,p.y+80*light.dy);
    c.beginPath();c.ellipse((ground.x+tip.x)/2,(ground.y+tip.y)/2,Math.max(17,p.w*.31),p.w*.13,.4,0,Math.PI*2);c.fill();
  }
  const props=[...STREET_PROPS,...s.world.blockProps,...s.world.bins.map(b=>({...b,id:'dumpster'}))];
  for(const p of props)if(visible(p.x,p.y,180)){
    const height=p.id==='lamp'?110:p.id==='bench'?35:50,a=project(p.x,p.y),b=project(p.x+height*light.dx,p.y+height*light.dy);
    c.strokeStyle=light.color;c.lineWidth=p.id==='lamp'?7:22;c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  }
  const m=s.world.surfaceMetro;
  polygon(c,shadowFootprint({x:m.start,y:m.y-36,w:m.end-m.start,h:72},m.height,light).map(p=>project(...p)),light.color);
  c.restore();
  if(light.night)for(const lamp of props.filter(p=>p.id==='lamp'))if(visible(lamp.x,lamp.y,220)){
    const p=project(lamp.x+20,lamp.y);c.save();c.translate(p.x,p.y);c.scale(1,.55);c.globalCompositeOperation='screen';
    const g=c.createRadialGradient(0,0,0,0,0,145);g.addColorStop(0,'#ffd58a80');g.addColorStop(.45,'#e0a45232');g.addColorStop(1,'#e0a45200');c.fillStyle=g;c.fillRect(-145,-145,290,290);c.restore();
  }
  if(light.night)for(const car of s.traffic.cars)if(visible(car.x,car.y,200)){
    const dx=Math.cos(car.heading),dy=Math.sin(car.heading),a=project(car.x+dx*48,car.y+dy*48),b=project(car.x+dx*175-dy*35,car.y+dy*175+dx*35),d=project(car.x+dx*175+dy*35,car.y+dy*175-dx*35);
    c.save();c.globalCompositeOperation='screen';polygon(c,[a,b,d]);c.clip();const g=c.createRadialGradient(a.x,a.y,0,a.x,a.y,170);g.addColorStop(0,'#fff1b95c');g.addColorStop(1,'#fff1b900');c.fillStyle=g;c.fillRect(a.x-170,a.y-170,340,340);c.restore();
  }
}
