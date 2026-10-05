// The facade is an affine plane recorded by the world renderer, in canvas pixels.
export function wallUV(matrix,x,y){
  if(!matrix)return null;const {a,b,c,d,e,f}=matrix,det=a*d-b*c;if(Math.abs(det)<1e-8)return null;
  x-=e;y-=f;return {x:(d*x-c*y)/det,y:(a*y-b*x)/det};
}
export function wallPoint(m,x,y){return {x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f};}
export class VerticalShake{
  reset(){this.last=null;this.travel=0;this.direction=0;this.awarded=false;}
  sample(x,y,time){
    const last=this.last;this.last={x,y,time};if(!last)return 0;
    const dx=x-last.x,dy=y-last.y,dt=Math.max(1,time-last.time);
    if(dt>220||Math.abs(dy)<Math.abs(dx)*1.4||Math.abs(dy)/dt<.25){this.travel=0;return 0;}
    const direction=Math.sign(dy);if(direction!==this.direction){this.travel=0;this.awarded=false;this.direction=direction;}
    if(this.awarded)return 0;this.travel=(this.travel??0)+Math.abs(dy);if(this.travel<36)return 0;
    this.awarded=true;this.travel=0;return .18;
  }
}
