export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const project=(x,y,z=0)=>({x:x-y,y:(x+y)*.5-z});
export const unproject=(x,y)=>({x:y+x*.5,y:y-x*.5});
export const inside=(x,y,r,m=0)=>x>=r.x-m&&x<=r.x+r.w+m&&y>=r.y-m&&y<=r.y+r.h+m;
export function moveAlongPath(actor,path,speed,dt){
  let remaining=speed*dt;const old={x:actor.x,y:actor.y};
  while(path.length&&remaining>0){
    const next=path[0],length=distance(actor,next);
    if(length<=remaining){actor.x=next.x;actor.y=next.y;path.shift();remaining-=length;}
    else{actor.x+=(next.x-actor.x)/length*remaining;actor.y+=(next.y-actor.y)/length*remaining;remaining=0;}
  }
  const dx=actor.x-old.x,dy=actor.y-old.y;actor.moving=Math.abs(dx)+Math.abs(dy)>.01;
  if(actor.moving){const screen=project(dx,dy);actor.facing=Math.abs(screen.x)>Math.abs(screen.y)*1.4?(screen.x>0?'right':'left'):(screen.y>0?'down':'up');}
}
export class Camera{
  constructor(){this.x=0;this.y=0;this.zoom=.8;this.ready=false;}
  follow(player,dt,width){
    const p=project(player.x,player.y);this.zoom=width<700?Math.max(.43,width/880):Math.min(.88,width/1250);
    const f=this.ready?1-Math.exp(-dt*7):1;this.x+=(p.x-this.x)*f;this.y+=(p.y-55-this.y)*f;this.ready=true;
  }
  screenToWorld(x,y,w,h){return unproject((x-w/2)/this.zoom+this.x,(y-h/2)/this.zoom+this.y);}
}
