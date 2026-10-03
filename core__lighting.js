// One directional sun and warm local lamps share the same world coordinates.
export function sceneLight(night){return night?{night:true,dx:.32,dy:.18,alpha:.20,color:'#071727',lamp:'#ffd992'}:{night:false,dx:.72,dy:.32,alpha:.18,color:'#304c64',lamp:null};}
export function lampBrightness(x,y,lamps,base=.58){return Math.min(1,base+lamps.reduce((light,p)=>p.id==='lamp'?Math.max(light,.38*Math.exp(-((x-p.x)**2+(y-p.y)**2)/(170*170))):light,0));}
export function shadowFootprint(b,height,light){
  const dx=height*light.dx,dy=height*light.dy;
  return [[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w+dx,b.y+dy],[b.x+b.w+dx,b.y+b.h+dy],[b.x+dx,b.y+b.h+dy],[b.x,b.y+b.h]];
}
