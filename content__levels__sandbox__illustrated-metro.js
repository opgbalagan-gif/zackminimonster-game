import {project} from './core__geometry.js?v=8b3759ea8c13';

// Shared wheel registration; retain fractional placement during movement.
export function illustratedTrain(c,car,m,night,images){
  const image=images[car.front?'metro_cab_comic':'metro_coach_comic'];
  if(!image)return;
  const p=project(car.x,car.y,m.height+5),scale=.153;
  c.save();c.imageSmoothingEnabled=true;
  if(night)c.filter='brightness(.72) saturate(.8)';
  c.drawImage(image,p.x-755*scale,p.y-699*scale,image.width*scale,image.height*scale);
  c.filter='none';
  if(night&&car.front){
    for(const [x,y] of [[1023,849],[1226,770]]){
      const a=p.x+(x-755)*scale,b=p.y+(y-699)*scale;
      const glow=c.createRadialGradient(a,b,0,a,b,7);
      glow.addColorStop(0,'#fff4bfdd');glow.addColorStop(1,'#ffd77e00');
      c.fillStyle=glow;c.fillRect(a-7,b-7,14,14);
      c.fillStyle='#fff0bd';c.beginPath();c.arc(a,b,1.6,0,Math.PI*2);c.fill();
    }
  }
  c.restore();
}
