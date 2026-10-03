import {project} from './core__geometry.js?v=083bd6171324';
import {box,polygon} from './content__district_01__terrain.js?v=083bd6171324';

export function courtHoops(court){
  // Match the two painted keys in the ground plate, facing into the court.
  return [{x:court.x+14,y:court.y+86,facing:1},{x:court.x+court.w+8,y:court.y+86,facing:-1}];
}
export function drawHoop(c,h,art){
  c.save();
  const x=h.x+h.facing*18,y=h.y,rimX=x+h.facing*22;
  box(c,h.x-6,y-6,12,12,5,'#b3b3a4','#555f65','#778188');
  const base=project(h.x,y,5),top=project(h.x,y,107),arm=project(x,y,107);
  c.lineJoin='round';c.lineCap='square';
  for(const [color,width] of [['#18252e',8],['#8a9ba2',4]]){
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(base.x,base.y);c.lineTo(top.x,top.y);c.lineTo(arm.x,arm.y);c.stroke();
  }
  const board=(half,low,high)=>[project(x,y-half,high),project(x,y+half,high),project(x,y+half,low),project(x,y-half,low)];
  const paintBoard=()=>{
    polygon(c,board(27,88,125),'#deddd0','#233641',3);
    if(art)art.quad(c,'board',board(27,88,125));
    else polygon(c,board(11,92,107),null,'#b94b36',2);
    const a=project(x,y,92),b=project(x+h.facing*10,y,92);
    c.strokeStyle='#a75030';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  };
  if(h.facing>0)paintBoard();
  // Ring lies horizontally in world space; the net hangs vertically below it.
  const ring=project(rimX,y,91),net=project(rimX,y,76);
  c.strokeStyle='#f3ead2';c.lineWidth=1.5;
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,dx=Math.cos(a)*12,dy=Math.sin(a)*6;
    c.beginPath();c.moveTo(ring.x+dx,ring.y+dy);c.lineTo(net.x+dx*.6,net.y+dy*.6);c.stroke();
  }
  c.beginPath();c.ellipse(net.x,net.y,7,3.5,0,0,Math.PI*2);c.stroke();
  c.strokeStyle='#502b23';c.lineWidth=5;c.beginPath();c.ellipse(ring.x,ring.y,12,6,0,0,Math.PI*2);c.stroke();
  c.strokeStyle='#f07738';c.lineWidth=2.5;c.stroke();
  if(h.facing<0)paintBoard();
  c.restore();
}
