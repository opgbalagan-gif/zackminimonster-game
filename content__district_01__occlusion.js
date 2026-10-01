// Only Zack's immediate surroundings reveal people through a facade.
export function withinRevealRange(person,player){
  return Math.hypot(person.x-player.x,person.y-player.y)<=180;
}

// Disjoint rectangles describing a union. Overlapping even-odd holes cancel each
// other out, so a crowd must be merged before using it to cut a building mask.
export function revealRegions(bounds,people){
  const rects=people.map(p=>({x:Math.max(bounds.x,p.x),y:Math.max(bounds.y,p.y),right:Math.min(bounds.x+bounds.w,p.x+p.w),bottom:Math.min(bounds.y+bounds.h,p.y+p.h)})).filter(r=>r.right>r.x&&r.bottom>r.y);
  const edges=[...new Set(rects.flatMap(r=>[r.x,r.right]))].sort((a,b)=>a-b),result=[];
  for(let i=1;i<edges.length;i++){
    const x=edges[i-1],right=edges[i],spans=rects.filter(r=>r.x<right&&r.right>x).map(r=>[r.y,r.bottom]).sort((a,b)=>a[0]-b[0]);
    let merged=null;
    for(const [top,bottom] of spans){
      if(merged&&top<=merged[1])merged[1]=Math.max(merged[1],bottom);
      else{if(merged)result.push({x,y:merged[0],w:right-x,h:merged[1]-merged[0]});merged=[top,bottom];}
    }
    if(merged)result.push({x,y:merged[0],w:right-x,h:merged[1]-merged[0]});
  }return result;
}
