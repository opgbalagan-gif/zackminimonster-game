import {project} from './core__geometry.js?v=97af9e9c19c3';
import {polygon,box} from './content__district_01__terrain.js?v=97af9e9c19c3';
import {createMetroArt} from './content__district_01__metro-art.js?v=97af9e9c19c3';
import {illustratedTrain} from './content__levels__sandbox__illustrated-metro.js?v=97af9e9c19c3';
import {comicStation} from './content__levels__sandbox__comic-station.js?v=97af9e9c19c3';
import {drawHoop} from './content__district_01__court-props.js?v=97af9e9c19c3';
export function neighbourhoodArt(images,atlas){
  const board=createMetroArt(images.court_board,{board:[0,0,1536,1024]});
  function court(c,r){
    const points=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(p=>project(...p));
    polygon(c,points,'#81523d','#675e4e',3);c.save();c.transform(1,.5,-1,.5,0,0);
    c.imageSmoothingEnabled=true;c.drawImage(images.comic_court,r.x,r.y,r.w,r.h);
    c.restore();
  }
  function stroke(c,a,b,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  function rails(c,m,x){
    const end=Math.min(m.end,x+80),h=m.height,p=(u,v,z=h)=>project(u,m.y+v,z);
    c.save();c.lineJoin='round';c.lineCap='round';
    // Warm timber and pale rail heads sit on a continuous illustrated steel deck.
    polygon(c,[p(x,-43,h-8),p(end,-43,h-8),p(end,43,h-8),p(x,43,h-8)],'#617778','#263e46',1.2);
    for(let u=Math.ceil(x/20)*20;u<end;u+=20){
      box(c,u,m.y-28,7,56,h-1,'#b28d65','#655c50','#86745f',h-6);
      for(const v of [-19,19]){
        polygon(c,[p(u-1,v-4,h),p(u+9,v-4,h),p(u+9,v+4,h),p(u-1,v+4,h)],'#44565c');
      }
    }
    for(const v of [-19,19]){
      stroke(c,p(x,v,h+2),p(end,v,h+2),'#263d46',5.5);
      stroke(c,p(x,v,h+4),p(end,v,h+4),'#ced5c4',2.3);
    }
    // Deep girders and diagonal braces are large enough to read on a phone.
    for(const v of [-39,39]){
      polygon(c,[p(x,v,h-7),p(end,v,h-7),p(end,v,h-36),p(x,v,h-36)],v<0?'#577779':'#3b5d64','#253e46',1.4);
      stroke(c,p(x+3,v,h-32),p(end-3,v,h-11),'#89a69d',2.5);
      stroke(c,p(x+3,v,h-11),p(end-3,v,h-32),'#76968f',2.5);
      stroke(c,p(x,v,h-8),p(end,v,h-8),'#c0c9b5',2.2);
      stroke(c,p(x,v,h-35),p(end,v,h-35),'#29464f',3);
      for(const u of [x+5,end-5])for(const z of [h-12,h-30]){
        const bolt=p(u,v,z);c.fillStyle='#c8cbb4';c.beginPath();c.arc(bolt.x,bolt.y,1.25,0,Math.PI*2);c.fill();
      }
      polygon(c,[p(x,v-3,h),p(end,v-3,h),p(end,v+3,h),p(x,v+3,h)],'#a1aaa0','#324f57',.8);
      for(let u=Math.ceil(x/40)*40;u<end;u+=40)stroke(c,p(u,v,h),p(u,v,h+21),'#41676b',2);
      stroke(c,p(x,v,h+21),p(end,v,h+21),'#86a49d',2.5);
    }
    c.restore();
  }
  function pier(c,p,m){
    const h=m.height,side=p.y<m.y?1:-1;
    box(c,p.x-13,p.y-13,26,26,7,'#d1cbb6','#84978e','#abb7a4');
    box(c,p.x-9,p.y-9,18,18,12,'#90aaa0','#34575f','#557b7c',7);
    box(c,p.x-6,p.y-6,12,12,h-34,'#96b2a6','#365a63','#63898a',12);
    stroke(c,project(p.x-4,p.y+6,16),project(p.x-4,p.y+6,h-40),'#a8beb0',1.8);
    // Each side supports half of the portal; columns stay outside the traffic lanes.
    const y=side>0?p.y-9:m.y;
    box(c,p.x-8,y,16,Math.abs(p.y-m.y)+9,h-34,'#91a89b','#31515b','#658687',h-47);
    const a=project(p.x,p.y,h-76),b=project(p.x,p.y+side*36,h-44);
    stroke(c,a,b,'#263f49',8);stroke(c,a,b,'#76978e',4);
    for(const z of [18,h-41]){
      const q=project(p.x,p.y+7,z);c.fillStyle='#c9cbb0';c.beginPath();c.arc(q.x,q.y,1.5,0,Math.PI*2);c.fill();
    }
  }
  return {court,rails,pier,hoop:(c,h)=>drawHoop(c,h,board),station:comicStation,
    train:(c,car,m,night)=>illustratedTrain(c,car,m,night,images)};
}
