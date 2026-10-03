import {inside} from './core__geometry.js?v=af18bdaf4c2b';
export function inPolygon(x,y,polygon){let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)hit=!hit;}return hit;}
export function onLand(world,x,y,radius=0){
  if(!world.landPolygons)return !world.walkableAreas||world.walkableAreas.some(r=>inside(x,y,r,-radius));
  return [[x-radius,y-radius],[x+radius,y-radius],[x-radius,y+radius],[x+radius,y+radius]].every(([px,py])=>world.landPolygons.some(p=>inPolygon(px,py,p))||world.bridges.some(b=>b.kind==='bridge'&&inside(px,py,b)));
}
