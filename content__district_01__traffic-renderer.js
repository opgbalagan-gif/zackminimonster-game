import {project} from './core__geometry.js?v=083bd6171324';
import {box,polygon} from './content__district_01__terrain.js?v=083bd6171324';

export function drawTrafficCar(c,car,art){
  const palette={taxi:['#e9bf4c','#967527','#c99e39'],blue_car:['#5f91b0','#304f6a','#44758f'],van:['#b9bcb4','#676e73','#8d9597'],jdm_coupe:[car.color??'#68c6bc','#276d72','#48938f'],lowrider:['#9654a4','#492752','#70356e'],executive:['#48545c','#202931','#343d45']}[car.type];
  const custom=['jdm_coupe','lowrider','executive'].includes(car.type),sport=car.type==='jdm_coupe',low=car.type==='lowrider',roof=sport?23:low?24:28;
  const angle=car.heading??(car.axis==='x'?(car.direction>0?0:Math.PI):(car.direction>0?Math.PI/2:-Math.PI/2)),dx=Math.cos(angle),dy=Math.sin(angle);
  const point=(u,v,z)=>project(car.x+dx*u-dy*v,car.y+dy*u+dx*v,z);
  const rect=(u,v,w,h,z,top,left=top,right=left,base=0)=>{
    const corners=[[u,v],[u+w,v],[u+w,v+h],[u,v+h]],faces=corners.map((a,i)=>({a,b:corners[(i+1)%4]}));
    faces.sort((a,b)=>(dx+dy)*(a.a[0]+a.b[0]-b.a[0]-b.b[0])+(dx-dy)*(a.a[1]+a.b[1]-b.a[1]-b.b[1]));
    const body=w===58||car.type==='van'&&z===32,glass=z===roof-2&&w===31;
    for(const {a,b}of faces){const face=[point(...a,z),point(...b,z),point(...b,base),point(...a,base)];polygon(c,face,a[1]===b[1]?left:right,'#172731',.7);if(body||glass){art?.quad(c,glass?'glass':custom?'blue_car':car.type,face,.18);if(body&&custom){c.save();c.globalAlpha=.8;polygon(c,face,a[1]===b[1]?left:right);c.restore();}}}
    const topFace=corners.map(([a,b])=>point(a,b,z));polygon(c,topFace,top,'#243039',.6);
  };
  polygon(c,[[-33,-17],[33,-17],[33,17],[-33,17]].map(([u,v])=>point(u,v,0)),'#10182265');
  for(const u of [-22,16])for(const v of [-15,10])rect(u,v,9,5,9,'#222931','#10151c','#353b42');
  rect(-29,-13,58,26,15,palette[0],palette[1],palette[2],6);
  rect(-18,-11,31,22,roof-2,'#273e4e','#263946','#385568',15);
  rect(-13,-10,sport?15:20,20,roof,low?'#dfd7c1':palette[0],palette[1],palette[2],roof-4);
  rect(-31,-13,3,26,10,'#aeb4ae','#56666a','#7c8a8a',7);
  rect(29,-13,3,26,10,'#c3c7ba','#6f7a7b','#939e99',7);
  for(const v of [-17,13])rect(5,v,5,4,20,palette[0],palette[1],palette[2],17);
  // Glass highlights and roof details remain aligned with each road axis.
  rect(8,-9,4,18,roof-2,'#a4ccd1','#5f8795','#81aab3',roof-4);
  rect(-17,-9,3,18,roof-2,'#7593a0','#4d6778','#5c7c8c',roof-4);
  rect(27,-10,2,6,15,'#fae9a8','#e6d393','#fff0ae',11);
  rect(27,4,2,6,15,'#fae9a8','#e6d393','#fff0ae',11);
  for(const v of [-10,5])rect(-30,v,2,5,14,car.hold>0?'#ff7b65':'#b44344','#923437','#e7554f',10);
  if(car.type==='taxi')rect(-5,-5,9,10,33,'#eee2ad','#86763f','#c4b06b',28);
  if(car.type==='van')rect(-15,-9,17,18,32,'#bfc3bb','#7c8587','#989f9b',27);
  if(custom){
    for(const v of [-13.5,13.5]){const a=point(-23,v,12),b=point(25,v,12);c.strokeStyle=low?'#e5e0ca':'#93adb1';c.lineWidth=low?2:1;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
    for(const u of [-18,20])for(const v of [-15,15]){const p=point(u,v,7);c.fillStyle='#b7beb6';c.fillRect(Math.round(p.x)-2,Math.round(p.y)-2,4,4);}
  }
  if(sport){
    for(const v of [-10,8])rect(-25,v,3,3,23,'#25343a','#17252b','#3c5358',15);
    rect(-27,-15,7,30,25,'#33444b','#15252d','#526e75',23);
    rect(15,-3,12,6,15.8,'#1c2c32');
    for(const v of [-13,13])rect(-16,v,33,2,6,'#35414a','#17212a','#46575b',4);
  }
  if(low){rect(-28,-10,8,20,16,'#ad77b6');for(const v of [-10,7])rect(25,v,4,3,17,'#f2e4a2');}
  if(car.type==='executive'){
    rect(-5,-7,11,14,roof+.4,'#18272e');
    for(const v of [-11.5,11.5])for(const u of [-10,3])rect(u,v,4,1,18,'#bec8c9');
    rect(29,-6,1,12,14,'#c3c8c0','#627780','#e2e6dd',9);
  }
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
