// Gait follows travel. A separate idle clock keeps stopped actors alive without sliding.
export class NpcAnimation{
  constructor(){this.states=new WeakMap();}
  pose(actor,dt=1/60){
    let s=this.states.get(actor);
    if(!s){s={x:actor.x,y:actor.y,travel:0,idleTime:0,direction:actor.direction??'se',candidate:'',turn:0};this.states.set(actor,s);}
    const dx=actor.x-s.x,dy=actor.y-s.y,step=Math.hypot(dx,dy);s.x=actor.x;s.y=actor.y;
    if(actor.moving&&step>0&&step<40){
      s.travel+=step;const look=actor.path?.find(p=>Math.hypot(p.x-actor.x,p.y-actor.y)>30),vx=look?look.x-actor.x:dx,vy=look?look.y-actor.y:dy;
      const direction=actor.direction??(Math.abs(vx)>Math.abs(vy)?vx>0?'se':'nw':vy>0?'sw':'ne');
      if(s.candidate===direction)s.turn+=dt;else{s.candidate=direction;s.turn=0;}
      if(s.turn>=.12)s.direction=direction;
    }
    s.idleTime=actor.moving?0:s.idleTime+Math.max(0,Math.min(dt,.1));
    const back=s.direction==='ne'||s.direction==='nw';
    return {frame:Math.floor(s.travel/4)%16,idleTime:s.idleTime,view:back?'back':'front',flip:s.direction==='sw'||s.direction==='nw'};
  }
}
