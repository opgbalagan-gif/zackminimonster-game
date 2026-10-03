import {project} from './core__geometry.js?v=8b3759ea8c13';
import {polygon,box} from './content__district_01__terrain.js?v=8b3759ea8c13';
import {createMetroArt} from './content__district_01__metro-art.js?v=8b3759ea8c13';
import {drawLoopRail} from './content__district_01__metro.js?v=8b3759ea8c13';
import {illustratedTrain} from './content__levels__sandbox__illustrated-metro.js?v=8b3759ea8c13';
import {comicStation} from './content__levels__sandbox__comic-station.js?v=8b3759ea8c13';
import {drawHoop} from './content__district_01__court-props.js?v=8b3759ea8c13';
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
  function pier(c,p,m){
    box(c,p.x-11,p.y-11,22,22,5,'#bbc1b1','#758d87','#8fa199');
    box(c,p.x-7,p.y-7,14,14,m.height-32,'#819b90','#29494e','#4a6d71',5);
    box(c,p.x-5,p.y+7,3,1,m.height-38,'#96aaa0','#648a86','#71928e',10);
    const y=p.y<m.y?p.y:m.y+32;
    box(c,p.x-7,y,14,72,m.height-32,'#7b9890','#263f46','#4a7074',m.height-44);
    const a=project(p.x,p.y,m.height-60),b=project(p.x,p.y+(p.y<m.y?24:-24),m.height-43);
    c.strokeStyle='#27474f';c.lineWidth=5;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  }
  return {court,rails,pier,hoop:(c,h)=>drawHoop(c,h,board),station:comicStation,
    train:(c,car,m,night)=>illustratedTrain(c,car,m,night,images)};
}
