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
    // An actual turning bulb and pavement close a terminal street before the shore.
    if(vertical)c.fillRect(e.x-e.width/2-26,Math.min(p.y,e.y+e.sign*110),e.width+52,195);
    else c.fillRect(Math.min(p.x,e.x+e.sign*110),e.y-e.width/2-26,195,e.width+52);
    c.beginPath();c.arc(p.x,p.y,e.width*.7+10,0,Math.PI*2);c.fill();
    c.fillStyle=textures.asphalt;c.strokeStyle='#c7c0ad';c.lineWidth=5;c.beginPath();c.arc(p.x,p.y,e.width*.7,0,Math.PI*2);c.fill();c.stroke();
    c.fillStyle=textures.asphalt;if(vertical)c.fillRect(e.x-e.width/2,p.y+(e.sign>0?-80:0),e.width,80);else c.fillRect(p.x+(e.sign>0?-80:0),e.y-e.width/2,80,e.width);
  }
}
