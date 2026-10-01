import {project} from './core__geometry.js';
import {polygon} from './content__district_01__terrain.js';
export function drawBench(c,o,art){
  const dx=o.benchDx??(o.flip?1:0),dy=o.benchDy??(o.flip?0:1);
  const scale=.75;
  const point=(u,v,z)=>project(o.x+(dx*u-dy*v)*scale,o.y+(dy*u+dx*v)*scale,z*scale);
  const solid=(u,v,w,h,low,high,wood=false)=>{
    const corners=[[u,v],[u+w,v],[u+w,v+h],[u,v+h]],faces=corners.map((a,i)=>({a,b:corners[(i+1)%4]}));
    faces.sort((a,b)=>(dx+dy)*(a.a[0]+a.b[0]-b.a[0]-b.b[0])+(dx-dy)*(a.a[1]+a.b[1]-b.a[1]-b.b[1]));
    for(const {a,b}of faces){const q=[point(...a,high),point(...b,high),point(...b,low),point(...a,low)];polygon(c,q,wood?'#715039':'#273b3a','#172b2b',.7);if(wood)art?.quad(c,'wood',q,.2);}
    const q=corners.map(([a,b])=>point(a,b,high));polygon(c,q,wood?'#a87c4d':'#687a6b','#203332',.7);if(wood)art?.quad(c,'wood',q);
  };
  polygon(c,[[-33,-12],[33,-12],[33,14],[-33,14]].map(([u,v])=>point(u,v,0)),'#29372d30');
  for(const u of [-24,21]){
    for(const v of [-8,8])solid(u,v,3,4,0,17);
    solid(u,-10,3,3,0,39);solid(u,-10,3,24,13,16);
    solid(u,-7,3,20,22,25);solid(u,10,3,3,16,25);
  }
  for(let v=-7;v<11;v+=6)solid(-30,v,60,5,16,19,true);
  for(let z=23;z<39;z+=6)solid(-30,-10,60,3,z,z+5,true);
}
