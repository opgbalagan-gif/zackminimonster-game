export function planRoadEnds(world){
  const result=[];
  for(const r of world.roads){
    const vertical=r.h>r.w,axis=vertical?'y':'x',span=vertical?r.h:r.w;
    for(const sign of [-1,1]){
      const p={x:r.x+r.w/2,y:r.y+r.h/2};p[axis]=r[axis]+(sign>0?span:0);
      if(world.bridges.some(b=>b.kind==='bridge'&&Math.abs(p.y-(b.y+b.h/2))<30&&Math.abs(p.x-(b.x+b.w/2))<240))continue;
      const junction=world.roads.find(o=>(o.h>o.w)!==vertical&&p.x>=o.x-100&&p.x<=o.x+o.w+100&&p.y>=o.y-100&&p.y<=o.y+o.h+100);
      const inward=sign*-1,point={...p};point[axis]+=inward*85;
      result.push({...p,axis,sign,width:vertical?r.w:r.h,kind:junction?'junction':'turn',point,junction});
    }
  }return result;
}
export function drawRoadEnds(c,world,textures){
  for(const e of world.roadEnds??[]){
    const vertical=e.axis==='y',p=e.point;
    c.fillStyle=textures.paving;
    if(e.kind==='junction'){
      const j=e.junction,boundary=e.axis==='y'?(e.sign>0?j.y+j.h:j.y):(e.sign>0?j.x+j.w:j.x),from=Math.min(boundary,e[e.axis]+e.sign*110),length=Math.abs(boundary-(e[e.axis]+e.sign*110));
      if(vertical)c.fillRect(e.x-e.width/2-13,from,e.width+26,length);else c.fillRect(from,e.y-e.width/2-13,length,e.width+26);
      const a=vertical?{x:e.x-e.width/2,y:boundary}:{x:boundary,y:e.y-e.width/2},b=vertical?{x:e.x+e.width/2,y:boundary}:{x:boundary,y:e.y+e.width/2};
      c.strokeStyle='#d5ccb4';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();continue;
    }
    c.save();
    // A terminal's pavement must never paint across an intersecting street.
    c.beginPath();c.rect(-10000,-10000,30000,30000);
    for(const r of world.roads)if((r.h>r.w)!==vertical&&r.x<p.x+240&&r.x+r.w>p.x-240&&r.y<p.y+240&&r.y+r.h>p.y-240)c.rect(r.x,r.y,r.w,r.h);
    c.clip('evenodd');
    c.translate(p.x,p.y);c.rotate((vertical?Math.PI/2:0)+(e.sign<0?Math.PI:0));
    // One continuous outline joins the bulb to the street, with no rectangular asphalt corners beyond its curb.
    const outer=e.width*.7,half=e.width/2,join=-Math.sqrt(outer*outer-half*half),angle=Math.atan2(half,join);
    c.fillStyle=textures.paving;c.fillRect(-120,-outer-12,325,outer*2+24);
    c.beginPath();c.moveTo(-120,-half);c.lineTo(join,-half);c.arc(0,0,outer,-angle,angle);c.lineTo(-120,half);c.closePath();
    c.fillStyle=textures.asphalt;c.fill();
    c.strokeStyle='#c7c0ad';c.lineWidth=5;c.beginPath();c.moveTo(-120,-half);c.lineTo(join,-half);c.arc(0,0,outer,-angle,angle);c.lineTo(-120,half);c.stroke();
    const radius=e.width*.7-9;
    c.strokeStyle='#d9d1b8';c.lineWidth=2;c.beginPath();c.arc(0,0,radius,-Math.PI*.7,Math.PI*.7);c.stroke();
    c.strokeStyle='#d6b361';c.lineWidth=2;c.setLineDash([8,10]);c.beginPath();c.arc(0,0,36,-Math.PI/2,Math.PI/2);c.stroke();c.setLineDash([]);
    // A short curved U-turn arrow follows the same semicircle as the cars.
    c.strokeStyle='#dfd9c6';c.lineWidth=3;c.beginPath();c.arc(0,0,23,-Math.PI*.42,Math.PI*.42);c.stroke();
    c.fillStyle='#dfd9c6';c.beginPath();c.moveTo(0,25);c.lineTo(13,15);c.lineTo(12,29);c.closePath();c.fill();
    c.restore();
  }
}
