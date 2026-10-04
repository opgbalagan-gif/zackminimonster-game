export function roadToBoundary(r,b){
  const axis=r.w>r.h?'x':'y',size=axis==='x'?'w':'h',far=b[axis]+b[size],start=r[axis]-b[axis]<180?b[axis]:r[axis],end=far-r[axis]-r[size]<180?far:r[axis]+r[size];
  return {...r,[axis]:start,[size]:end-start};
}
// Cosmetic woodland stays outside navigation; road and water corridors remain open.
export function perimeterWoodland(world,view=null){
  const b=world.mapBounds,belt=1400,right=b.x+b.w,bottom=b.y+b.h;
  const area=view??{x:b.x-belt,y:b.y-belt,w:b.w+belt*2,h:b.h+belt*2};
  const left=Math.min(area.x,b.x),top=Math.min(area.y,b.y),farX=Math.max(area.x+area.w,right),farY=Math.max(area.y+area.h,bottom);
  const roads=(world.roads?.length?world.roads:[{x:b.x,y:412,w:b.w,h:112}]).map(r=>r.w>r.h
    ?{x:left,y:r.y,w:farX-left,h:r.h}
    :{x:r.x,y:top,w:r.w,h:farY-top});
  const water=(world.water??[]).filter(r=>r.y<=b.y+1||r.y+r.h>=bottom-1).map(r=>({...r,y:top,h:farY-top}));
  const corridors=[...roads,...water];
  const nature=[];
  // World-aligned cells keep the same trees as the camera pans or zooms out.
  for(let row=Math.floor(area.y/88)-2;row*88<area.y+area.h+176;row++)for(let col=Math.floor(area.x/96)-2;col*96<area.x+area.w+192;col++){
    const y=row*88,x=col*96+((row%2+2)%2)*48;
    const tx=x+Math.sin(x*.037+y*.021)*12,ty=y+Math.cos(x*.029-y*.017)*12;
    if(tx>b.x-90&&tx<right+90&&ty>b.y-90&&ty<bottom+90)continue;
    if(corridors.some(r=>tx>r.x-84&&tx<r.x+r.w+84&&ty>r.y-84&&ty<r.y+r.h+84))continue;
    nature.push({id:'comic_tree',x:tx,y:ty,w:162+Math.abs(Math.sin(x*.019+y*.023))*44});
  }
  let parks=[{x:left,y:top,w:farX-left,h:b.y-top},{x:left,y:bottom,w:farX-left,h:farY-bottom},
    {x:left,y:b.y,w:b.x-left,h:b.h},{x:right,y:b.y,w:farX-right,h:b.h}];
  // The canal continues between wooded banks, never under a rectangle of grass.
  for(const channel of water)parks=parks.flatMap(r=>{
    if(channel.x>=r.x+r.w||channel.x+channel.w<=r.x)return [r];
    return [{...r,w:Math.max(0,channel.x-r.x)},{...r,x:channel.x+channel.w,w:Math.max(0,r.x+r.w-channel.x-channel.w)}].filter(p=>p.w>0);
  });
  parks=parks.map(r=>({x:Math.max(r.x,area.x),y:Math.max(r.y,area.y),w:Math.min(r.x+r.w,area.x+area.w)-Math.max(r.x,area.x),h:Math.min(r.y+r.h,area.y+area.h)-Math.max(r.y,area.y)})).filter(r=>r.w>0&&r.h>0);
  return {nature,parks,roads,water};
}
// Scenic neighbourhoods share the world's projection but never enter navigation or saves.
export function districtContinuation(world){
  const b=world.mapBounds,pad=2040,right=b.x+b.w,bottom=b.y+b.h;
  const bounds={x:b.x-pad,y:b.y-pad,w:b.w+pad*2,h:b.h+pad*2};
  const roads=world.roads.map(r=>r.w>r.h
    ?{x:bounds.x,y:r.y,w:bounds.w,h:r.h}
    :{x:r.x,y:bounds.y,w:r.w,h:bounds.h});
  const water=world.water.filter(r=>r.y<=b.y+1||r.y+r.h>=bottom-1).map(r=>({...r,y:bounds.y,h:bounds.h}));
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
  const belt=1400;
  const nearBoundary=r=>overlaps(r,{x:b.x-belt,y:b.y-belt,w:b.w+2*belt,h:b.h+2*belt})&&!overlaps(r,b);
  for(let i=buildings.length-1;i>=0;i--)if(nearBoundary(buildings[i]))buildings.splice(i,1);
  const woodland=perimeterWoodland(world);
  nature.push(...woodland.nature);parks.push(...woodland.parks);
  // Road exits stay open; navigation still stops before the scenic ring.
  const barriers=[];
  const rail=r=>{if(!roads.some(road=>overlaps({x:r.x,y:r.y,w:r.dx||1,h:r.dy||1},road,12)))barriers.push(r);};
  for(let x=b.x;x<right;x+=24)for(const y of [b.y,bottom])rail({x,y,dx:Math.min(24,right-x),dy:0});
  for(let y=b.y;y<bottom;y+=24)for(const x of [b.x,right])rail({x,y,dx:0,dy:Math.min(24,bottom-y)});
  return {bounds,roads,water,parks,paths,buildings,nature,barriers};
}
