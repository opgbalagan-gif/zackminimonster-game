import {project} from './core__geometry.js';

export function trainCars(m,time){
  const start=m.x-650,end=m.end+180,lead=start+(time*86)%(end-start);
  return Array.from({length:4},(_,i)=>({x:lead+i*145,y:m.y+m.width/2,front:i===3}))
    .filter(car=>car.x>m.x-160&&car.x<m.end+160);
}
export function drawTrain(c,car,m,atlas){
  const id=car.front?'train_front':'train_car',rect=atlas.rect(id);
  const width=180,height=width*rect[3]/rect[2];
  const contact=project(car.x,car.y,m.height+4);
  // The PNG includes a tall body and sloping chassis. Anchor the footprint centre,
  // not its lowest corner, to the centreline halfway between the two rails.
  atlas.draw(c,id,contact.x+width*.015,contact.y+height*.28,width);
}
