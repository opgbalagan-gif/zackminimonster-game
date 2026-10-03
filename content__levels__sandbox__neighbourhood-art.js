import {project} from './core__geometry.js?v=14cc148264ab';
import {polygon} from './content__district_01__terrain.js?v=14cc148264ab';
import {createMetroArt} from './content__district_01__metro-art.js?v=14cc148264ab';
import {drawLoopRail,drawLoopStation,drawTrain} from './content__district_01__metro.js?v=14cc148264ab';
import {drawHoop} from './content__district_01__court-props.js?v=14cc148264ab';
export function neighbourhoodArt(images,atlas){
  const track=createMetroArt(images.metro_materials),train=createMetroArt(images.metro_original,{side:[16,135,880,306],front:[920,109,318,334],rear:[920,646,320,470],roof:[18,585,876,650]});
  const board=createMetroArt(images.court_board,{board:[0,0,1536,1024]});
  function court(c,r){
    const points=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(p=>project(...p));
    polygon(c,points,'#81523d','#675e4e',3);c.save();c.transform(1,.5,-1,.5,0,0);
    c.imageSmoothingEnabled=true;c.drawImage(images.comic_court,r.x,r.y,r.w,r.h);
    c.restore();
  }
  function rails(c,m){for(let x=m.start;x<m.end;x+=80){const end=Math.min(m.end,x+80);drawLoopRail(c,{a:{x,y:m.y,s:x},b:{x:end,y:m.y,s:end},nx:0,ny:1,za:m.height,zb:m.height},m,track);}}
  return {court,rails,hoop:(c,h)=>drawHoop(c,h,board),station:(c,m)=>drawLoopStation(c,m.station,m,track),train:(c,car,m)=>drawTrain(c,car,m,atlas,train)};
}
