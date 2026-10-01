import {onLand} from './core__land.js';
import {metroRoute,loopPosition} from './content__district_01__metro.js';
export const overlaps=(a,b,p=0)=>a.x<b.x+b.w+p&&a.x+a.w>b.x-p&&a.y<b.y+b.h+p&&a.y+a.h>b.y-p;
export function planCityLots(w){
  // The ground plate repeats the court too: reserve every visible copy, not only the story court.
  w.courts=[];for(let y=0;y<5632;y+=1408)for(let x=0;x<6400;x+=1600)w.courts.push({...w.court,x:x+w.court.x,y:y+w.court.y});
  const rail=metroRoute(w.metro).points.filter(p=>!loopPosition(w.metro,p.s).underground).map(p=>({x:p.x-44,y:p.y-44,w:88,h:88}));
  const forbidden=[...w.roads,...w.courts,...rail,...w.obstacles];
  const protectedPoints=[w.spawn,...w.hideouts,...w.safeSpots,...w.pointsOfInterest,...w.targets.filter(t=>!t.buildingId).map(t=>t.approach)];
  const placed=[],pending=[];
  const wallBuildings=new Set(w.targets.map(t=>t.buildingId));
  const valid=b=>{
    const approach={x:b.x+b.w+34,y:b.y+b.h*.58,w:1,h:1};
    return [[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]].every(([x,y])=>onLand(w,x,y,18))&&!forbidden.some(o=>overlaps(b,o,8))&&!placed.some(o=>overlaps(b,o,16))&&!protectedPoints.some(p=>overlaps(b,{...p,w:1,h:1},24))&&(!wallBuildings.has(b.id)||onLand(w,approach.x,approach.y,12)&&![...placed,...w.obstacles].some(o=>overlaps(approach,o,14)));
  };
  for(const b of w.buildings){
    if(b.type.startsWith('skyline_')){b.w=b.id.startsWith('LANDMARK_')?300:220;b.h=b.id.startsWith('LANDMARK_')?220:170;b.heightScale=1;}
    pending.push(b);
  }
  for(const b of pending.sort((a,b)=>b.w*b.h-a.w*a.h)){
    const original={x:b.x,y:b.y},region=w.regions.find(r=>r.id===b.regionId)??w.regions.find(r=>b.x>=r.x&&b.x<r.x+r.w&&b.y>=r.y&&b.y<r.y+r.h);
    let best=valid(b)?b:null,score=best?0:Infinity;
    for(let y=Math.max(70,region.y+65);y<Math.min(region.y+region.h-80,5500)-b.h;y+=24)for(let x=Math.max(70,region.x+65);x<Math.min(region.x+region.w-80,6300)-b.w;x+=24){
      const d=(x-original.x)**2+(y-original.y)**2;if(d>=score)continue;
      const candidate={...b,x,y};if(valid(candidate)){best=candidate;score=d;}
    }
    if(!best)throw new Error('No legal city lot for '+b.id);
    Object.assign(b,best);placed.push(b);
    for(const t of w.targets.filter(t=>t.buildingId===b.id)){t.x=b.x+b.w;t.y=b.y+b.h*.58;t.approach={x:t.x+34,y:t.y};protectedPoints.push(t.approach);}
  }
  w.layoutRules={buildingsAvoid:['roads','courts','metro','other buildings'],towerAspectRatio:'original',pillarsAvoid:['roads','courts','buildings']};
  // Street furniture from old building positions must not remain in the newly cleared courts.
  for(const prop of w.props){
    if(['van','taxi','blue_car'].includes(prop.type))continue;
    const foot=p=>({x:p.x-12,y:p.y-12,w:24,h:24}),blocked=p=>[...w.courts,...w.roads,...w.buildings].some(o=>overlaps(foot(p),o,4));
    if(!blocked(prop))continue;
    let best=null,score=Infinity;
    for(let dy=-240;dy<=240;dy+=24)for(let dx=-240;dx<=240;dx+=24){const d=dx*dx+dy*dy;if(d>=score)continue;const p={x:prop.x+dx,y:prop.y+dy};if(onLand(w,p.x,p.y,18)&&!blocked(p)){best=p;score=d;}}
    if(best)Object.assign(prop,best);
  }
}
export function placeMetroSupports(w){
  const route=metroRoute(w.metro);
  const clear=b=>onLand(w,b.x+b.w/2,b.y+b.h/2,20)&&![...w.roads,...w.courts,...w.buildings,...w.obstacles].some(o=>overlaps(b,o,14))&&!w.targets.some(t=>overlaps(b,{...t.approach,w:1,h:1},24));
  for(let s=120;s<route.length;s+=280){
    const p=loopPosition(w.metro,s);if(p.underground||p.z<80)continue;
    const support=n=>({x:p.x-p.dy*n-6,y:p.y+p.dx*n-8,w:12,h:16,pillar:true,height:p.z,beamTo:{x:p.x,y:p.y}});
    const center=support(0);
    if(clear(center)){w.obstacles.push(center);continue;}
    for(const side of [-1,1])for(const n of [90,112,136]){const b=support(n*side);if(clear(b)){w.obstacles.push(b);break;}}
  }
}





