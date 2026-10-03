import {project} from './core__geometry.js?v=4c32f2c839ac';
import {polygon,box} from './content__district_01__terrain.js?v=4c32f2c839ac';
import {createMetroArt} from './content__district_01__metro-art.js?v=4c32f2c839ac';
import {drawLoopRail,drawLoopStation,drawTrain} from './content__district_01__metro.js?v=4c32f2c839ac';
import {drawHoop} from './content__district_01__court-props.js?v=4c32f2c839ac';
export function neighbourhoodArt(images,atlas){
  const track=createMetroArt(images.comic_park_materials,{ballast:[629,2,623,623],concrete:[629,629,623,623],steel:[2,629,623,623]});
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
  return {court,rails,pier,hoop:(c,h)=>drawHoop(c,h,board),station:(c,m)=>{
    // Open steel stairs connect the elevated platform to the northern sidewalk.
    for(let i=0;i<15;i++)box(c,m.station.x+100+i*9,m.y-132,9,46,(15-i)*10,'#b5baaa','#45595b','#607371',Math.max(0,(15-i)*10-7));
    for(const y of [m.y-132,m.y-86]){const a=project(m.station.x+100,y,172),b=project(m.station.x+235,y,22);c.strokeStyle='#314e56';c.lineWidth=3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
    c.save();c.imageSmoothingEnabled=true;drawLoopStation(c,m.station,m,track);
    const p=project(m.station.x,m.station.y-63,m.height+42);c.fillStyle='#f6e9c8';c.strokeStyle='#294e52';c.lineWidth=2;c.fillRect(p.x-38,p.y-15,76,22);c.strokeRect(p.x-38,p.y-15,76,22);c.fillStyle='#294e52';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText('МЕТРО',p.x,p.y);c.restore();
  },train:(c,car,m)=>drawTrain(c,car,m,atlas,null)};
}
