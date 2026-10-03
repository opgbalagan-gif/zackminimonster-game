import {project} from './core__geometry.js?v=200bdb7a657c';
import {drawGraffiti} from './content__district_01__graffiti-art.js?v=200bdb7a657c';
import {ink} from './core__hideout.js?v=200bdb7a657c';

export function facadeGeometry(building,atlas){
  const sprite=atlas.metadata.sprites[building.type];if(!sprite?.facade)return null;
  const foot=project(building.x+building.w,building.y+building.h),width=building.w+building.h+22;
  const height=width*sprite.rect[3]/sprite.rect[2];
  const points=sprite.facade.map(([u,v])=>({x:foot.x-width/2+u*width,y:foot.y-height+v*height}));
  return {points,marker:{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2-16}};
}
export function drawFacade(c,building,target,session,atlas,alpha=1){
  const geometry=facadeGeometry(building,atlas);if(!geometry)return;
  const [a,b,d]=geometry.points;
  c.save();c.globalAlpha*=alpha;
  c.transform((b.x-a.x)/200,(b.y-a.y)/200,(d.x-a.x)/140,(d.y-a.y)/140,a.x,a.y);
  c.beginPath();c.rect(0,0,200,140);c.clip();
  if(session.painted.has(target.wall_id)){
    const style=session.runStyles[target.wall_id]??session.save.wall_styles[target.wall_id];
    drawGraffiti(c,target.graffiti_id,4,4,192,132,atlas,style?ink(style).color:null);
  }else{
    // Leave the actual PNG's blank brick/plaster visible. Small corner ticks indicate paintable area.
    c.strokeStyle=target.state==='AVAILABLE'?'#e9bdff':'#a49baca0';c.lineWidth=2;
    for(const [x,y,sx,sy] of [[6,6,1,1],[194,6,-1,1],[6,134,1,-1],[194,134,-1,-1]]){
      c.beginPath();c.moveTo(x+sx*15,y);c.lineTo(x,y);c.lineTo(x,y+sy*15);c.stroke();
    }
  }
  c.restore();
}
