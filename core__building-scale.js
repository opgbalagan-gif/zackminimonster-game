const overlaps=(a,b,pad=0)=>a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;

export function calibrateBuildings(world){
  for(const b of world.buildings){
    // A whole courtyard cannot be shrunk onto the footprint of one narrow house.
    if(b.nanoVariant===4&&Math.min(b.w,b.h)<260)b.nanoVariant=0;
    if(![1,2].includes(b.nanoVariant))continue;
    const size=b.nanoVariant===1?152:156;
    if(Math.min(b.w,b.h)>=size)continue;
    const cx=b.x+b.w/2,cy=b.y+b.h/2;
    const candidates=[0,-18,18,-36,36].flatMap(dx=>[0,-18,18,-36,36].map(dy=>({x:cx-size/2+dx,y:cy-size/2+dy,w:size,h:size})));
    const plot=candidates.find(r=>!world.buildings.some(other=>other!==b&&overlaps(r,other,20))&&!([...world.roads,...world.water,...world.paths]).some(other=>overlaps(r,other,8))&&!world.targets.some(t=>t.buildingId!==b.id&&overlaps(r,{...t.approach,w:1,h:1},18)));
    if(plot)Object.assign(b,plot);
    else b.nanoVariant=0;
    const target=world.targets.find(t=>t.buildingId===b.id);
    if(target)Object.assign(target,{x:b.x+b.w,y:b.y+b.h,approach:{x:b.x+b.w+27,y:b.y+b.h+20}});
  }
}

export function clearBuildingBins(world){
  // Keep saved interaction IDs while moving the physical prop and its collider together.
  for(const bin of world.bins){
    const old={x:bin.x-24,y:bin.y-18,w:48,h:27};
    world.obstacles=world.obstacles.filter(o=>!(o.x===old.x&&o.y===old.y&&o.w===48&&o.h===27));
    if(bin.id==='block_bin_3'){
      // The shop forecourt is visible between the tall foreground houses.
      const shop=world.buildings.find(b=>b.id==='north_infill_4');
      bin.x=shop.x+30;bin.y=shop.y+shop.h+52;bin.approach={x:bin.x,y:bin.y+38};
    }
    const clear=(x,y)=>{
      const area={x:x-34,y:y-25,w:68,h:76};
      return ![...world.buildings,...world.roads,...world.water,...world.obstacles].some(b=>overlaps(area,b,8));
    };
    if(!clear(bin.x,bin.y)){
      const choices=[];
      for(let dx=-216;dx<=216;dx+=24)for(let dy=-216;dy<=216;dy+=24)if(clear(bin.x+dx,bin.y+dy))choices.push({x:bin.x+dx,y:bin.y+dy,d:dx*dx+dy*dy});
      const spot=choices.sort((a,b)=>a.d-b.d)[0];
      if(!spot)throw new Error('No clear sidewalk for '+bin.id);
      bin.x=spot.x;bin.y=spot.y;bin.approach={x:bin.x,y:bin.y+38};
    }
    world.obstacles.push({x:bin.x-24,y:bin.y-18,w:48,h:27});
  }
}

// A point outside a front facade must be drawn after that facade, even when its
// x+y is smaller than the building's far corner used by the sprite renderer.
export function buildingFrontDepth(point,buildings,edgeMargin=0){
  let depth=point.x+point.y;
  for(const b of buildings){
    const right=point.x>=b.x+b.w&&point.x<=b.x+b.w+80&&point.y>=b.y-edgeMargin&&point.y<=b.y+b.h+edgeMargin;
    const front=point.y>=b.y+b.h&&point.y<=b.y+b.h+80&&point.x>=b.x-edgeMargin&&point.x<=b.x+b.w+edgeMargin;
    if(right||front)depth=Math.max(depth,b.x+b.w+b.y+b.h+.1+(point.x+point.y)*.000001);
  }
  return depth;
}

// Crowns extend beyond their trunks at facade corners. Only expand along the
// wall: a tree behind a house must retain its normal rear occlusion.
export function natureDepth(tree,buildings){
  return buildingFrontDepth(tree,buildings,Math.min(60,(tree.w??80)*.35));
}
