import {project,unproject} from './core__geometry.js?v=8b3759ea8c13';
import {polygon} from './content__district_01__terrain.js?v=8b3759ea8c13';
const corners=r=>[project(r.x,r.y),project(r.x+r.w,r.y),project(r.x+r.w,r.y+r.h),project(r.x,r.y+r.h)];

export function districtSurroundings(c,cam,w,h,kit,night,bounds){
  const points=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>unproject(cam.x+x*(w/2/cam.zoom+300),cam.y+y*(h/2/cam.zoom+300)));
  const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x));
  const minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
  c.save();c.imageSmoothingEnabled=true;
  // Tile only the visible ground, continuously across the playable boundary.
  for(let x=bounds.x+Math.floor((minX-bounds.x)/240)*240;x<maxX;x+=240)
    for(let y=bounds.y+Math.floor((minY-bounds.y)/240)*240;y<maxY;y+=240)
      kit.material.quad(c,'paving',corners({x,y,w:240,h:240}),night?.2:.02);
  c.restore();
  return {x:minX,y:minY,w:maxX-minX,h:maxY-minY};
}
export function boundaryRailing(c,r,night){
  c.save();c.strokeStyle=night?'#526d71':'#42686a';c.lineWidth=3;
  for(const z of [15,38]){const a=project(r.x,r.y,z),b=project(r.x+r.dx,r.y+r.dy,z);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  for(const i of [0,1]){const x=r.x+r.dx*i,y=r.y+r.dy*i,a=project(x,y),b=project(x,y,42);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  c.restore();
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
