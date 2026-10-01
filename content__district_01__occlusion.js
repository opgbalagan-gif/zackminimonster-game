// A building fades only when its opaque sprite pixels cover Zack in depth order.
export function buildingOccludesZack(bounds,depth,zack,opaqueAt){
  if(zack.depth>=depth)return false;
  const left=Math.max(bounds.x,zack.x),right=Math.min(bounds.x+bounds.w,zack.x+zack.w);
  const top=Math.max(bounds.y,zack.y),bottom=Math.min(bounds.y+bounds.h,zack.y+zack.h);
  if(left>=right||top>=bottom)return false;
  const columns=Math.max(1,Math.ceil((right-left)/5)),rows=Math.max(1,Math.ceil((bottom-top)/5));
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
    const x=left+(col+.5)*(right-left)/columns,y=top+(row+.5)*(bottom-top)/rows;
    if(opaqueAt((x-bounds.x)/bounds.w,(y-bounds.y)/bounds.h))return true;
  }
  return false;
}
