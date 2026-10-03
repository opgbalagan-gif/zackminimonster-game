import {project} from './core__geometry.js?v=09df463d6cde';
import {polygon} from './content__district_01__terrain.js?v=09df463d6cde';
const corners=r=>[project(r.x,r.y),project(r.x+r.w,r.y),project(r.x+r.w,r.y+r.h),project(r.x,r.y+r.h)];

export function districtSurroundings(c,bounds,night){
  // Feathered land continues beyond the playable boundary into the painted horizon.
  c.save();c.transform(1,.5,-1,.5,0,0);
  const color=night?'#566b70':'#aeba91';
  c.fillStyle=color;
  for(let i=20;i>=0;i--){const d=80+i*22;c.globalAlpha=.055;c.beginPath();c.roundRect(bounds.x-d,bounds.y-d,bounds.w+d*2,bounds.h+d*2,100+i*8);c.fill();}
  c.restore();
}
export function softenGroundEdge(c,r,night){
  c.save();c.transform(1,.5,-1,.5,0,0);
  const color=night?'86,107,112':'174,186,145',width=95;
  for(const [x,y,w,h,dx,dy] of [[r.x,r.y,r.w,width,0,width],[r.x,r.y+r.h-width,r.w,width,0,-width],[r.x,r.y,width,r.h,width,0],[r.x+r.w-width,r.y,width,r.h,-width,0]]){
    const sx=dx<0?x+w:x,sy=dy<0?y+h:y,g=c.createLinearGradient(sx,sy,sx+dx,sy+dy);g.addColorStop(0,`rgba(${color},.9)`);g.addColorStop(1,`rgba(${color},0)`);c.fillStyle=g;c.fillRect(x,y,w,h);
  }c.restore();
}
export function cloudShadows(c,s,w,h){
  if(s.life.night)return;
  c.save();polygon(c,corners(s.world.mapBounds),'#0000');c.clip();
  const time=s.time,cam=s.camera;
  for(let i=0;i<7;i++){
    const x=((time*10+i*823)%5600)-2200,y=((i*677+time*3)%4800)-500;
    if(Math.abs(x-cam.x)>w/cam.zoom/2+550||Math.abs(y-cam.y)>h/cam.zoom/2+250)continue;
    c.save();c.translate(x,y);c.scale(1,.42);
    for(const [dx,dy,r] of [[-180,0,260],[40,-60,310],[230,50,240]]){const g=c.createRadialGradient(dx,dy,30,dx,dy,r);g.addColorStop(0,'#314b6430');g.addColorStop(1,'#314b6400');c.fillStyle=g;c.fillRect(dx-r,dy-r,r*2,r*2);}
    c.restore();
  }c.restore();
}
