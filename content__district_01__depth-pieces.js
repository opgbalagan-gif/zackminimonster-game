import {project} from './core__geometry.js';

// Long thin objects need local depth: the far endpoint cannot sort the whole wall.
export function wallPieces(t){
  const pieces=[];
  for(let u=-43;u<43;u+=8){
    const end=Math.min(43,u+8),middle=(u+end)/2;
    const x=t.x+(t.axis==='x'?middle:0),y=t.y+(t.axis==='y'?-middle:0);
    pieces.push({kind:'wall',item:t,clip:{from:u,to:end},depth:x+y+2.5});
  }return pieces;
}
export function fencePieces(o){
  const alongX=o.w>=o.h,length=alongX?o.w:o.h,pieces=[];
  for(let u=0;u<length;u+=14){
    const part=Math.min(14,length-u),item={...o,x:o.x+(alongX?u:0),y:o.y+(alongX?0:u),w:alongX?part:o.w,h:alongX?o.h:part};
    pieces.push({kind:'fence',item,depth:item.x+item.y+(item.w+item.h)/2});
  }return pieces;
}
export function coversHero(points,player,depth){
  if(player.x+player.y>=depth)return false;
  const p=project(player.x,player.y),xs=points.map(v=>v.x),ys=points.map(v=>v.y);
  return Math.max(...xs)>p.x-20&&Math.min(...xs)<p.x+20&&Math.max(...ys)>p.y-66&&Math.min(...ys)<p.y+2;
}
