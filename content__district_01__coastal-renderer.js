import {project} from './core__geometry.js';
import {polygon} from './content__district_01__terrain.js';

export function drawCoastalGround(c,w){
  if(!w.beaches)return;
  // Continuous foothills along the two northern edges, rather than water on all sides.
  polygon(c,[[-800,-950],[7000,-950],[7100,-200],[6350,220],[5900,48],[48,48],[48,2200],[-650,2400]].map(([x,y])=>project(x,y)),'#384339');
  c.save();c.transform(1,.5,-1,.5,0,0);
  c.beginPath();for(const poly of w.landPolygons){poly.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();}c.clip();
  c.fillStyle='#879078';c.fillRect(0,0,w.width,w.height);
  c.fillStyle='#d8bf8a';c.fillRect(0,5830,w.width,w.height-5830);
  for(const poly of w.beaches){polygon(c,poly,'#d8bf8a','#e9d4a4',14);}
  for(let y=5250;y<7000;y+=39)for(let x=100;x<6800;x+=47){const n=Math.sin(x*31+y*7);c.fillStyle=n>.25?'#f3dfaa55':'#525c4b22';c.fillRect(x+n*11,y+n*18,5,2);}
  // Street-to-promenade entrances and a broad paved walk along both beaches.
  const stroke=(path,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.beginPath();path.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();};
  for(const [x,y] of [[896,5680],[2460,5680],[4096,5790],[5180,6100]]){
    const path=[{x,y:5200},{x,y}];stroke(path,'#555a57',92);stroke(path,'#aaa899',68);
  }
  for(const path of w.promenades){
    stroke(path,'#686b63',132);stroke(path,'#c0b6a0',116);
    c.lineCap='butt';c.lineWidth=1.5;c.strokeStyle='#918d7c';
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],len=Math.hypot(b.x-a.x,b.y-a.y),dx=(b.x-a.x)/len,dy=(b.y-a.y)/len;
      for(let n=0;n<len;n+=28){const x=a.x+dx*n,y=a.y+dy*n;c.beginPath();c.moveTo(x-dy*56,y+dx*56);c.lineTo(x+dy*56,y-dx*56);c.stroke();}
    }
    stroke(path,'#ded2b6',2);
  }
  c.restore();
}

export function drawMountains(c,w,atlas){
  for(const m of w.mountains??[]){const p=project(m.x,m.y);atlas.draw(c,'mountain_ridge',p.x,p.y,m.width,null,m.flip);}
}

export function drawBeachUmbrella(c,o){
  const p=project(o.x,o.y);c.fillStyle='#343d3a44';c.beginPath();c.ellipse(p.x+14,p.y+5,30,12,0,0,Math.PI*2);c.fill();
  c.fillStyle='#eee0b7';c.fillRect(p.x+20,p.y-2,26,9);c.strokeStyle='#725c40';c.lineWidth=3;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x,p.y-42);c.stroke();
  const points=Array.from({length:8},(_,i)=>({x:p.x+Math.cos(i*Math.PI/4)*30,y:p.y-43+Math.sin(i*Math.PI/4)*15}));
  for(let i=0;i<8;i++)polygon(c,[{x:p.x,y:p.y-51},points[i],points[(i+1)%8]],i%2?'#eee0bc':o.color,'#3e4c4c',1);
}
