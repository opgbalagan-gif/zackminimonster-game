// One directional sun and warm local lamps share the same world coordinates.
export function sceneLight(amount){const n=Number(amount);return {night:n>0,amount:n,dx:.72-.4*n,dy:.32-.14*n,alpha:.18+.02*n,color:`rgb(${48-41*n},${76-53*n},${100-61*n})`,lamp:'#ffd992'};}
export function lampBrightness(x,y,lamps,base=.58){return Math.min(1,base+lamps.reduce((light,p)=>p.id==='lamp'?Math.max(light,.38*Math.exp(-((x-p.x)**2+(y-p.y)**2)/(170*170))):light,0));}
export function shadowFootprint(b,height,light){
  const dx=height*light.dx,dy=height*light.dy;
  return [[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w+dx,b.y+dy],[b.x+b.w+dx,b.y+b.h+dy],[b.x+dx,b.y+b.h+dy],[b.x,b.y+b.h]];
}
