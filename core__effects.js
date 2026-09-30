// Fixed-size pool for spray motes and world reward particles.
export class EffectPool{
  constructor(size=100){this.items=Array.from({length:size},()=>({life:0}));this.cursor=0;}
  emit(x,y,color,count=8){
    for(let i=0;i<count;i++){
      const p=this.items[this.cursor++%this.items.length],angle=Math.random()*Math.PI*2;
      Object.assign(p,{x,y,vx:Math.cos(angle)*25,vy:Math.sin(angle)*15-14,color,life:.4+Math.random()*.5});
    }
  }
  update(dt){for(const p of this.items)if(p.life>0){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}}
}
