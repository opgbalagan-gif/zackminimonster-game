import {project} from './core__geometry.js';
import {box,polygon} from './content__district_01__terrain.js';

export function drawTrafficCar(c,car){
  const palette={taxi:['#e9bf4c','#967527','#c99e39'],blue_car:['#5f91b0','#304f6a','#44758f'],van:['#b9bcb4','#676e73','#8d9597']}[car.type];
  const rect=(u,v,w,h,z,top,left=top,right=left,base=0)=>{
    const a=car.direction*u,b=car.direction*(u+w),min=Math.min(a,b);
    if(car.axis==='x')box(c,car.x+min,car.y+v,w,h,z,top,left,right,base);
    else box(c,car.x+v,car.y+min,h,w,z,top,left,right,base);
  };
  const corners=[[-31,-16],[31,-16],[31,16],[-31,16]].map(([u,v])=>project(car.x+(car.axis==='x'?u:v),car.y+(car.axis==='y'?u:v)));
  polygon(c,corners,'#10182265');
  for(const u of [-22,16])for(const v of [-15,10])rect(u,v,9,5,9,'#222931','#10151c','#353b42');
  rect(-29,-13,58,26,15,palette[0],palette[1],palette[2],6);
  rect(-18,-11,31,22,26,'#273e4e','#263946','#385568',15);
  rect(-13,-10,20,20,28,palette[0],palette[1],palette[2],24);
  // Glass highlights and roof details remain aligned with each road axis.
  rect(8,-9,4,18,26,'#a4ccd1','#5f8795','#81aab3',24);
  rect(-17,-9,3,18,26,'#7593a0','#4d6778','#5c7c8c',24);
  rect(27,-10,2,6,15,'#fae9a8','#e6d393','#fff0ae',11);
  rect(27,4,2,6,15,'#fae9a8','#e6d393','#fff0ae',11);
  for(const v of [-10,5])rect(-30,v,2,5,14,car.hold>0?'#ff7b65':'#b44344','#923437','#e7554f',10);
  if(car.type==='taxi')rect(-5,-5,9,10,33,'#eee2ad','#86763f','#c4b06b',28);
  if(car.type==='van')rect(-15,-9,17,18,32,'#bfc3bb','#7c8587','#989f9b',27);
}

export function drawTrafficSignals(c,traffic){
  for(const cross of traffic.crossings){
    for(const axis of ['x','y']){
      const x=cross.x+(axis==='x'?-9:cross.w+9),y=cross.y-9,p=project(x,y);
      c.fillStyle='#242c34';c.fillRect(p.x-2,p.y-35,4,35);c.fillRect(p.x-6,p.y-43,12,22);
      c.fillStyle=traffic.green(axis)?'#485647':'#ef7869';c.fillRect(p.x-3,p.y-40,6,6);
      c.fillStyle=traffic.green(axis)?'#a4d67c':'#354638';c.fillRect(p.x-3,p.y-29,6,6);
    }
  }
}
