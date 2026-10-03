import {project} from './core__geometry.js?v=4c2aa9d50742';
import {polygon} from './content__district_01__terrain.js?v=4c2aa9d50742';
import {createMetroArt} from './content__district_01__metro-art.js?v=4c2aa9d50742';
import {drawLoopRail,drawLoopStation,drawTrain} from './content__district_01__metro.js?v=4c2aa9d50742';
import {drawHoop} from './content__district_01__court-props.js?v=4c2aa9d50742';
export function neighbourhoodArt(images,atlas){
  const track=createMetroArt(images.metro_materials),train=createMetroArt(images.metro_original,{side:[16,135,880,306],front:[920,109,318,334],rear:[920,646,320,470],roof:[18,585,876,650]});
  const board=createMetroArt(images.court_board,{board:[0,0,1536,1024]});
  function court(c,r){
    const points=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(p=>project(...p));
    polygon(c,points,'#81523d','#c0b398',4);c.save();c.transform(1,.5,-1,.5,0,0);
    c.fillStyle='#476458';c.fillRect(r.x+12,r.y+12,r.w-24,r.h-24);c.fillStyle='#8c5a43';
    for(const x of [r.x+12,r.x+r.w-91])c.fillRect(x,r.y+r.h/2-54,79,108);
    c.save();c.beginPath();c.rect(r.x+12,r.y+12,r.w-24,r.h-24);c.clip();c.globalAlpha=.16;
    for(let x=r.x;x<r.x+r.w;x+=160)for(let y=r.y;y<r.y+r.h;y+=160)c.drawImage(images.asphalt_dry,x,y,160,160);c.restore();
    c.strokeStyle='#e6d8b5';c.lineWidth=2;c.strokeRect(r.x+12,r.y+12,r.w-24,r.h-24);
    c.beginPath();c.moveTo(r.x+r.w/2,r.y+12);c.lineTo(r.x+r.w/2,r.y+r.h-12);c.stroke();
    c.beginPath();c.arc(r.x+r.w/2,r.y+r.h/2,38,0,Math.PI*2);c.stroke();
    for(const side of [0,1]){const x=side?r.x+r.w-91:r.x+12;c.strokeRect(x,r.y+r.h/2-54,79,108);c.beginPath();c.arc(side?x:x+79,r.y+r.h/2,38,side?Math.PI/2:-Math.PI/2,side?Math.PI*1.5:Math.PI/2);c.stroke();}
    c.restore();
  }
  function rails(c,m){for(let x=m.start;x<m.end;x+=80){const end=Math.min(m.end,x+80);drawLoopRail(c,{a:{x,y:m.y,s:x},b:{x:end,y:m.y,s:end},nx:0,ny:1,za:m.height,zb:m.height},m,track);}}
  return {court,rails,hoop:(c,h)=>drawHoop(c,h,board),station:(c,m)=>drawLoopStation(c,m.station,m,track),train:(c,car,m)=>drawTrain(c,car,m,atlas,train)};
}
