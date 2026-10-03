import {project} from './core__geometry.js?v=014abf6eb9c6';
import {polygon,box} from './content__district_01__terrain.js?v=014abf6eb9c6';
import {createMetroArt} from './content__district_01__metro-art.js?v=014abf6eb9c6';
import {drawLoopRail,drawLoopStation} from './content__district_01__metro.js?v=014abf6eb9c6';
import {comicTrain} from './content__levels__sandbox__comic-metro.js?v=014abf6eb9c6';
import {drawHoop} from './content__district_01__court-props.js?v=014abf6eb9c6';
export function neighbourhoodArt(images,atlas){
  const track={comic:true,quad(c,name,points){polygon(c,points,{ballast:'#667777',concrete:'#d4d6c4',steel:'#52787b'}[name]);}};
  const board=createMetroArt(images.court_board,{board:[0,0,1536,1024]});
  function court(c,r){
    const points=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(p=>project(...p));
    polygon(c,points,'#81523d','#675e4e',3);c.save();c.transform(1,.5,-1,.5,0,0);
    c.imageSmoothingEnabled=true;c.drawImage(images.comic_court,r.x,r.y,r.w,r.h);
    c.restore();
  }
  function rails(c,m,x){const end=Math.min(m.end,x+80);drawLoopRail(c,{a:{x,y:m.y,s:x},b:{x:end,y:m.y,s:end},nx:0,ny:1,za:m.height,zb:m.height},m,track);
    for(const side of [-32,32]){const p=(u,z)=>project(u,m.y+side,z);polygon(c,[p(x,m.height-24),p(end,m.height-24),p(end,m.height-38),p(x,m.height-38)],'#355358','#182f38',1);c.strokeStyle='#6d8a84';c.lineWidth=2;c.beginPath();c.moveTo(p(x,m.height-36).x,p(x,m.height-36).y);c.lineTo(p(end,m.height-26).x,p(end,m.height-26).y);c.stroke();}}
  function pier(c,p,m){box(c,p.x-7,p.y-7,14,14,m.height-32,'#65817b','#29494e','#3b5d60');const y=p.y<m.y?p.y:m.y+32;box(c,p.x-7,y,14,72,m.height-32,'#547373','#263f46','#34565c',m.height-44);}
  return {court,rails,pier,hoop:(c,h)=>drawHoop(c,h,board),station:(c,m,night=false)=>{
    // Open steel stairs connect the elevated platform to the northern sidewalk.
    for(let i=0;i<15;i++)box(c,m.station.x+100+i*9,m.y-132,9,46,(15-i)*10,'#b5baaa','#45595b','#607371',Math.max(0,(15-i)*10-7));
    for(const y of [m.y-132,m.y-86]){const a=project(m.station.x+100,y,172),b=project(m.station.x+235,y,22);c.strokeStyle='#314e56';c.lineWidth=3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
    c.save();c.imageSmoothingEnabled=true;drawLoopStation(c,m.station,m,track);
    const p=project(m.station.x,m.station.y-63,m.height+42);c.fillStyle='#f6e9c8';c.strokeStyle='#294e52';c.lineWidth=2;c.fillRect(p.x-38,p.y-15,76,22);c.strokeRect(p.x-38,p.y-15,76,22);c.fillStyle='#294e52';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText('Метро',p.x,p.y);
    for(const u of [-67,67]){const lamp=project(m.station.x+u,m.y-65,m.height+44);c.strokeStyle=night?'#f2d89a':'#d3d6c7';c.lineWidth=4;c.beginPath();c.moveTo(lamp.x-7,lamp.y);c.lineTo(lamp.x+7,lamp.y);c.stroke();}
    c.restore();
  },train:(c,car,m,night)=>comicTrain(c,car,m,night)};
}
