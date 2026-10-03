import {project} from './core__geometry.js?v=09df463d6cde';
import {polygon} from './content__district_01__terrain.js?v=09df463d6cde';
import {createMetroArt} from './content__district_01__metro-art.js?v=09df463d6cde';
import {drawLoopRail,drawLoopStation,drawTrain} from './content__district_01__metro.js?v=09df463d6cde';
import {drawHoop} from './content__district_01__court-props.js?v=09df463d6cde';
export function neighbourhoodArt(images,atlas){
  const track=createMetroArt(images.comic_park_materials,{ballast:[629,2,623,623],concrete:[629,629,623,623],steel:[2,629,623,623]});
  const board=createMetroArt(images.court_board,{board:[0,0,1536,1024]});
  function court(c,r){
    const points=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(p=>project(...p));
    polygon(c,points,'#81523d','#675e4e',3);c.save();c.transform(1,.5,-1,.5,0,0);
    c.imageSmoothingEnabled=true;c.drawImage(images.comic_court,r.x,r.y,r.w,r.h);
    c.restore();
  }
  function rails(c,m){for(let x=m.start;x<m.end;x+=80){const end=Math.min(m.end,x+80);drawLoopRail(c,{a:{x,y:m.y,s:x},b:{x:end,y:m.y,s:end},nx:0,ny:1,za:m.height,zb:m.height},m,track);}}
  return {court,rails,hoop:(c,h)=>drawHoop(c,h,board),station:(c,m)=>{
    c.save();c.imageSmoothingEnabled=true;drawLoopStation(c,m.station,m,track);
    const p=project(m.station.x,m.station.y-63,m.height+42);c.fillStyle='#f6e9c8';c.strokeStyle='#294e52';c.lineWidth=2;c.fillRect(p.x-38,p.y-15,76,22);c.strokeRect(p.x-38,p.y-15,76,22);c.fillStyle='#294e52';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText('МЕТРО',p.x,p.y);c.restore();
  },train:(c,car,m)=>drawTrain(c,car,m,atlas,null)};
}
