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
  // Railings explain the walk limit; the pavement, roads and canal continue behind them.
  const barriers=[];
  for(let x=b.x;x<right;x+=96)for(const y of [b.y,bottom])barriers.push({x,y,dx:Math.min(96,right-x),dy:0});
  for(let y=b.y;y<bottom;y+=96)for(const x of [b.x,right])barriers.push({x,y,dx:0,dy:Math.min(96,bottom-y)});
  return {bounds,roads,water,parks,paths,buildings,nature,barriers};
}
