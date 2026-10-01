import {project} from './core__geometry.js';
import {polygon,box} from './content__district_01__terrain.js';
export function quaySpans(world){
  const gaps=(world.bridges??[]).filter(b=>b.kind==='bridge').map(b=>[b.y-14,b.y+b.h+14]).sort((a,b)=>a[0]-b[0]);
  const out=[];
  for(const x of [3004,3204]){let y=48;for(const [a,b]of [...gaps,[5480,5480]]){if(a>y)out.push({x,y,h:a-y});y=b;}}
  return out;
}
export function quayPieces(world){return quaySpans(world).flatMap(s=>Array.from({length:Math.ceil(s.h/48)},(_,i)=>{const y=s.y+i*48,h=Math.min(48,s.h-i*48);return{kind:'quay',item:{x:s.x,y,h},depth:s.x+y+h/2+6};}));}
export function drawQuay(c,o,art,time){
  const {x,y,h}=o,edge=x<3100?3008:3200;
  c.save();
  // The near bank hides its retaining face behind the land surface.
  if(x>3100){polygon(c,[project(3008,y-100),project(3200,y-100),project(3200,y+h+100),project(3008,y+h+100)],null);c.clip();}
  const wall=[project(edge,y),project(edge,y+h),project(edge,y+h,-64),project(edge,y,-64)];
  polygon(c,wall,'#737b71');art?.quad(c,'stone',wall,x<3100?0:.22);
  for(let z=-32;z>-64;z-=8)polygon(c,[project(edge,y,z),project(edge,y+h,z),project(edge,y+h,z-8),project(edge,y,z-8)],`rgba(19,94,105,${.2+(-z-32)/65})`);
  const waterline=-42+Math.sin(time*.6+y*.025)*3,a=project(edge,y,waterline),b=project(edge,y+h,waterline);
  c.strokeStyle='#8cc1b278';c.lineWidth=1.3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  c.restore();
  const capX=x<3100?edge-24:edge;
  box(c,capX,y,24,h,5,'#c5bba0','#687369','#989a88');
  const line=(a,b,col,width)=>{c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();};
  for(const z of [13,29])line(project(x,y,z),project(x,y+h,z),'#33443e',2.5);
  for(let n=0;n<h;n+=8)line(project(x,y+n,5),project(x,y+n,29),'#44554b',2);
  box(c,x-3,y-3,6,6,33,'#d0c5a5','#566359','#858e78',5);
}
