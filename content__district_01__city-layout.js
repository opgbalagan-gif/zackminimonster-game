import {onLand} from './core__land.js';
import {metroRoute,loopPosition} from './content__district_01__metro.js';
export const overlaps=(a,b,p=0)=>a.x<b.x+b.w+p&&a.x+a.w>b.x-p&&a.y<b.y+b.h+p&&a.y+a.h>b.y-p;
// A skyline complex owns the entire street block, including its open forecourt.
export function streetLot(w,b){
  const vertical=w.roads.filter(r=>r.h>r.w),horizontal=w.roads.filter(r=>r.w>r.h);
  const x=Math.max(48,...vertical.filter(r=>r.x+r.w<=b.x).map(r=>r.x+r.w));
  const right=Math.min(6352,...vertical.filter(r=>r.x>=b.x+b.w).map(r=>r.x));
  const y=Math.max(48,...horizontal.filter(r=>r.y+r.h<=b.y).map(r=>r.y+r.h));
  const bottom=Math.min(5552,...horizontal.filter(r=>r.y>=b.y+b.h).map(r=>r.y));
  return{x:x+12,y:y+12,w:right-x-24,h:bottom-y-24};
}
export function planCityLots(w){
  // The ground plate repeats the court too: reserve every visible copy, not only the story court.
  w.courts=[];for(let y=0;y<5632;y+=1408)for(let x=0;x<6400;x+=1600)w.courts.push({...w.court,x:x+w.court.x,y:y+w.court.y});
  const parkingCopies=[];for(let y=0;y<5632;y+=1408)for(let x=0;x<6400;x+=1600)parkingCopies.push({...w.parking,id:`parking_${x}_${y}`,x:x+w.parking.x,y:y+w.parking.y});
  w.parkingLots=[...parkingCopies,...w.parkingLots.filter(p=>['customs_parking','night_parking'].includes(p.id))];
  const plannedParking=w.parkingLots.find(p=>p.id==='customs_parking');if(plannedParking)Object.assign(plannedParking,{x:2600,y:244,w:240,h:50});
  const nightParking=w.parkingLots.find(p=>p.id==='night_parking');if(nightParking)Object.assign(nightParking,{x:5254,y:5162,w:296,h:220,baked:true});
  const rail=metroRoute(w.metro).points.filter(p=>!loopPosition(w.metro,p.s).underground).map(p=>({x:p.x-44,y:p.y-44,w:88,h:88}));
  const forbidden=[...w.roads,...w.courts,...w.parkingLots,...rail,...w.obstacles];
  const protectedPoints=[w.spawn,...w.hideouts,...w.safeSpots,...w.pointsOfInterest,...w.targets.filter(t=>!t.buildingId).map(t=>t.approach)];
  const placed=[],pending=[];w.skylineLots=[];
  const wallBuildings=new Set(w.targets.map(t=>t.buildingId));
  const valid=b=>{
    const lot=b.type.startsWith('skyline_')?streetLot(w,b):b;
    if(w.skylineLots.some(o=>overlaps(b,o))||b.type.startsWith('skyline_')&&([...w.courts,...w.parkingLots].some(o=>overlaps(lot,o))||placed.some(o=>overlaps(lot,o))||w.skylineLots.some(o=>overlaps(lot,o))))return false;
    const approach={x:b.x+b.w+34,y:b.y+b.h*.58,w:1,h:1};
    return [[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]].every(([x,y])=>onLand(w,x,y,18))&&!forbidden.some(o=>overlaps(b,o,w.obstacles.includes(o)?32:8))&&!placed.some(o=>overlaps(b,o,16))&&!protectedPoints.some(p=>overlaps(b,{...p,w:1,h:1},24))&&(!wallBuildings.has(b.id)||onLand(w,approach.x,approach.y,12)&&![...placed,...w.obstacles].some(o=>overlaps(approach,o,14)));
  };
  for(const b of w.buildings){
    if(b.type==='flow_mall'){b.w=270;b.h=160;}
    if(b.type==='customs'){b.w=240;b.h=120;if(b.id==='LANDMARK_CUSTOMS'){b.x=2600;b.y=100;}}
    if(b.type.startsWith('skyline_')){b.w=b.id.startsWith('LANDMARK_')?300:220;b.h=b.id.startsWith('LANDMARK_')?220:170;b.heightScale=1;}
    if(b.id==='LANDMARK_HARBOUR'){b.x=5786;b.y=1402;}
    pending.push(b);
  }
  for(const b of pending.sort((a,b)=>Number(b.type.startsWith('skyline_'))-Number(a.type.startsWith('skyline_'))||b.w*b.h-a.w*a.h)){
    if(b.type.startsWith('skyline_')&&b.regionId==='harbour'&&placed.filter(o=>o.type.startsWith('skyline_')&&o.regionId==='harbour').length>=6&&!wallBuildings.has(b.id))continue;
    const original={x:b.x,y:b.y},region=w.regions.find(r=>r.id===b.regionId)??w.regions.find(r=>b.x>=r.x&&b.x<r.x+r.w&&b.y>=r.y&&b.y<r.y+r.h);
    let best=valid(b)?b:null,score=best?0:Infinity;
    for(let y=Math.max(70,region.y+65);y<Math.min(region.y+region.h-80,5500)-b.h;y+=24)for(let x=Math.max(70,region.x+65);x<Math.min(region.x+region.w-80,6300)-b.w;x+=24){
      const d=(x-original.x)**2+(y-original.y)**2;if(d>=score)continue;
      const candidate={...b,x,y};if(valid(candidate)){best=candidate;score=d;}
    }
    if(!best&&b.type.startsWith('skyline_')&&!wallBuildings.has(b.id))continue;
    if(!best)throw new Error('No legal city lot for '+b.id);
    Object.assign(b,best);placed.push(b);
    if(b.type.startsWith('skyline_'))w.skylineLots.push({...streetLot(w,b),buildingId:b.id});
    for(const t of w.targets.filter(t=>t.buildingId===b.id)){t.x=b.x+b.w;t.y=b.y+b.h*.58;t.approach={x:t.x+34,y:t.y};protectedPoints.push(t.approach);}
  }
  w.buildings=w.buildings.filter(b=>placed.includes(b));
  w.layoutRules={buildingsAvoid:['roads','courts','metro','other buildings','exclusive skyline blocks'],towerAspectRatio:'original',pillarsAvoid:['roads','courts','buildings']};
  const customs=w.buildings.find(b=>b.id==='LANDMARK_CUSTOMS'),parking=w.parkingLots.find(p=>p.id==='customs_parking');
  if(customs&&parking){parking.x=customs.x;parking.y=customs.y+customs.h+24;parking.w=240;parking.h=50;}
  // Street furniture from old building positions must not remain in the newly cleared courts.
  for(const prop of w.props){
    if(['van','taxi','blue_car'].includes(prop.type))continue;
    const onWalk=p=>{
      const clearance=prop.promenadeTree?110:prop.promenadeBench?88:78;
      if(w.skateApron&&overlaps({x:p.x-22,y:p.y-22,w:44,h:44},w.skateApron))return true;
      if([[896,5680],[2460,5680],[4096,5790],[5180,6100]].some(([x,y])=>p.x>x-62&&p.x<x+62&&p.y>5160&&p.y<y+40))return true;
      return(w.promenades??[]).some(path=>path.slice(1).some((b,i)=>{const a=path[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)<clearance;}));
    };
    const foot=p=>({x:p.x-12,y:p.y-12,w:24,h:24}),blocked=p=>[...w.courts,...w.roads,...w.buildings].some(o=>overlaps(foot(p),o,4))||(prop.promenadeLamp||prop.promenadeTree||prop.promenadeBench)&&onWalk(p);
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





