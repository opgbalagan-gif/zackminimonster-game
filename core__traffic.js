// Relative swept bounds catch crossings even when both car and player move in one frame.
export function trafficContact(car,from,to){
  const halfX=(car.axis==='x'?29:13)+8,halfY=(car.axis==='y'?29:13)+8;
  let enter=0,exit=1;
  for(const [axis,half] of [['x',halfX],['y',halfY]]){
    const a=from[axis]-car.previous[axis],b=to[axis]-car[axis],delta=b-a;
    if(Math.abs(delta)<1e-8){if(Math.abs(a)>half)return false;continue;}
    const t1=(-half-a)/delta,t2=(half-a)/delta;
    enter=Math.max(enter,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));
    if(enter>exit)return false;
  }
  return true;
}

export class TrafficSystem{
  constructor(world){
    this.time=0;this.cars=[];this.crossings=[];
    const vertical=world.roads.filter(r=>r.h>r.w),horizontal=world.roads.filter(r=>r.w>r.h);
    for(const v of vertical)for(const h of horizontal)if(v.x<h.x+h.w&&v.x+v.w>h.x&&h.y<v.y+v.h&&h.y+h.h>v.y)this.crossings.push({x:v.x,y:h.y,w:v.w,h:h.h});
    world.roads.forEach((road,index)=>{
      const axis=road.w>road.h?'x':'y',other=axis==='x'?'y':'x',length=axis==='x'?road.w:road.h;
      for(const direction of [-1,1])for(let n=0;n<2;n++){
        const start=road[axis]+70,end=road[axis]+length-70,span=end-start;
        const breadth=axis==='x'?road.h:road.w,center=road[other]+breadth/2,side=direction*(axis==='x'?1:-1);
        let lane=center+side*(axis==='x'?24:16);
        // Some graffiti supports sit inside the asphalt: choose a clear lane within its half-road.
        for(let offset=axis==='x'?24:16;offset<=breadth/2-15;offset+=4){
          const candidate=center+side*offset;
          if(![...world.buildings,...world.obstacles].some(b=>candidate+13>b[other]&&candidate-13<b[other]+(axis==='x'?b.h:b.w)&&b[axis]<end&&b[axis]+(axis==='x'?b.w:b.h)>start)){lane=candidate;break;}
        }
        let position=start+((n*.5+.14+index*.057+(direction===1?.25:0))%1)*span;
        for(const crossing of this.crossings){
          const low=crossing[axis]-39,high=crossing[axis]+(axis==='x'?crossing.w:crossing.h)+39;
          if(position>low&&position<high)position=direction===1?low:high;
        }
        const car={id:'traffic_'+index+'_'+direction+'_'+n,axis,direction,start,end,lane,
          speed:88+index%3*7,hold:0,travel:0,type:['taxi','blue_car','van'][(index+n+(direction===1?1:0))%3],
          x:axis==='x'?position:lane,y:axis==='y'?position:lane};
        car.previous={x:car.x,y:car.y};this.cars.push(car);
      }
    });
  }
  green(axis){const phase=this.time%21;return axis==='x'?phase<7:phase>=10.5&&phase<17.5;}
  update(dt){
    // Bounded substeps make traffic lights and following distances independent of frame rate.
    let remaining=Math.max(0,dt);
    for(const car of this.cars){car.previous={x:car.x,y:car.y};car.travel=0;}
    while(remaining>1e-7){
      const step=Math.min(.05,remaining);remaining-=step;this.time+=step;
      const positions=new Map(this.cars.map(c=>[c.id,c[c.axis]]));
      for(const car of this.cars){
        car.hold=Math.max(0,car.hold-step);
        let move=car.hold>0?0:car.speed*step;
        const pos=car[car.axis],dir=car.direction;
        if(!this.green(car.axis))for(const cross of this.crossings){
          const other=car.axis==='x'?'y':'x';
          if(car.lane<cross[other]||car.lane>cross[other]+(car.axis==='x'?cross.h:cross.w))continue;
          const low=cross[car.axis],high=low+(car.axis==='x'?cross.w:cross.h);
          const stop=dir===1?low-39:high+39,gap=(stop-pos)*dir;
          if(gap>=-.01)move=Math.min(move,Math.max(0,gap));
        }
        for(const ahead of this.cars){
          if(ahead===car||ahead.axis!==car.axis||ahead.lane!==car.lane||ahead.direction!==dir)continue;
          const gap=(positions.get(ahead.id)-pos)*dir;
          if(gap>0)move=Math.min(move,Math.max(0,gap-76));
        }
        car[car.axis]+=dir*move;car.travel+=move;
        if(car[car.axis]>car.end||car[car.axis]<car.start){
          const entry=dir===1?car.start:car.end;
          if(!this.cars.some(other=>other!==car&&other.axis===car.axis&&other.lane===car.lane&&Math.abs(other[car.axis]-entry)<90)){
            car[car.axis]=entry;car.previous={x:car.x,y:car.y};car.travel=0;
          }
        }
      }
    }
  }
  collision(from,to){return this.cars.find(car=>car.travel>.01&&trafficContact(car,from,to));}
}

