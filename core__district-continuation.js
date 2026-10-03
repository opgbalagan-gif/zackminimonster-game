export function roadToBoundary(r,b){
  const axis=r.w>r.h?'x':'y',size=axis==='x'?'w':'h',far=b[axis]+b[size],start=r[axis]-b[axis]<180?b[axis]:r[axis],end=far-r[axis]-r[size]<180?far:r[axis]+r[size];
  return {...r,[axis]:start,[size]:end-start};
}
// Scenic neighbourhoods share the world's projection but never enter navigation or saves.
export function districtContinuation(world){
  const b=world.mapBounds,pad=2040,right=b.x+b.w,bottom=b.y+b.h;
  const bounds={x:b.x-pad,y:b.y-pad,w:b.w+pad*2,h:b.h+pad*2};
  const roads=world.roads.map(r=>r.w>r.h
    ?{x:bounds.x,y:r.y,w:bounds.w,h:r.h}
    :{x:r.x,y:bounds.y,w:r.w,h:bounds.h});
  const water=world.water.map(r=>({...r,h:bottom+pad-r.y}));
  const parks=[{x:bounds.x,y:2780,w:b.x-bounds.x,h:bottom+pad-2780},
    {x:right,y:1500,w:pad,h:1420}];
  const paths=world.paths.filter(r=>r.w>r.h).map(r=>({x:bounds.x,y:r.y,w:bounds.w,h:r.h}));
  const overlaps=(a,r,margin=0)=>a.x<r.x+r.w+margin&&a.x+a.w>r.x-margin&&a.y<r.y+r.h+margin&&a.y+a.h>r.y-margin;
  const buildings=[],nature=[];
  for(let x=bounds.x+100;x<right+pad-200;x+=300)for(let y=bounds.y+100;y<bottom+pad-200;y+=300){
    const cell={x,y,w:140,h:140};
    if(overlaps(cell,b,100)||[...roads,...water,...paths].some(r=>overlaps(cell,r,35)))continue;
    const n=Math.abs(Math.round(x/300)*17+Math.round(y/300)*31);
    if(parks.some(r=>overlaps(cell,r))||n%5===0){
      for(const [dx,dy] of [[20,25],[100,90],[10,160]])nature.push({id:'comic_tree',x:x+dx,y:y+dy,w:130+n%25});
    }else buildings.push({id:'scenery_'+x+'_'+y,x,y,w:140,h:140,nanoVariant:n%3});
  }
  // A planted belt hides the playable perimeter while distant blocks still continue.
  const belt=420;
  const nearBoundary=r=>overlaps(r,{x:b.x-belt,y:b.y-belt,w:b.w+2*belt,h:b.h+2*belt})&&!overlaps(r,b);
  for(let i=buildings.length-1;i>=0;i--)if(nearBoundary(buildings[i]))buildings.splice(i,1);
  for(let x=b.x-belt;x<right+belt;x+=90)for(let y=b.y-belt;y<bottom+belt;y+=98){
    const tree={x:x+Math.sin(x+y)*15,y:y+Math.cos(y-x)*15,w:20,h:20};
    if(overlaps(tree,b,30)||[...roads,...water,...paths].some(r=>overlaps(tree,r,34)))continue;
    nature.push({id:'comic_tree',x:tree.x,y:tree.y,w:125+Math.abs(Math.sin(x))*30});
  }
  // Road exits stay open; navigation still stops before the scenic ring.
  const barriers=[];
  const rail=r=>{if(!roads.some(road=>overlaps({x:r.x,y:r.y,w:r.dx||1,h:r.dy||1},road,12)))barriers.push(r);};
  for(let x=b.x;x<right;x+=24)for(const y of [b.y,bottom])rail({x,y,dx:Math.min(24,right-x),dy:0});
  for(let y=b.y;y<bottom;y+=24)for(const x of [b.x,right])rail({x,y,dx:0,dy:Math.min(24,bottom-y)});
  return {bounds,roads,water,parks,paths,buildings,nature,barriers};
}
