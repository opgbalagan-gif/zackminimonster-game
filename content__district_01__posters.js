import {facadeGeometry} from './content__district_01__facades.js?v=0b8195c8da56';
export const ARTIST_URL='https://www.instagram.com/zakminimonster?stkn=NnA2cG13MXFsemU0';
export const POSTERS=[
  {id:'reebok',brand:'Reebok',buildingId:'D01_B02'},
  {id:'wilson',brand:'Wilson',buildingId:'D01_B14'},
  {id:'posca',brand:'POSCA',buildingId:'D01_B05'},
  {id:'converse',brand:'Converse',buildingId:'D01_B12'}
];
export function posterApproach(world,poster){const b=world.buildings.find(b=>world.sandbox?b.poster===poster.id:b.id===poster.buildingId);return b?{x:b.x+b.w+34,y:b.y+b.h*.58}:world.spawn;}
export function posterGeometry(building,atlas){
  const facade=facadeGeometry(building,atlas);if(!facade)return null;
  const [a,b,d]=facade.points;
  const at=(u,v)=>({x:a.x+(b.x-a.x)*u+(d.x-a.x)*v,y:a.y+(b.y-a.y)*u+(d.y-a.y)*v});
  return [at(.12,.02),at(.88,.02),at(.12,.98),at(.88,.98)];
}
export function drawPoster(c,building,poster,atlas,alpha){
  const points=posterGeometry(building,atlas);if(!points)return null;
  const [a,b,d]=points;c.save();c.globalAlpha*=alpha;
  c.transform((b.x-a.x)/1024,(b.y-a.y)/1024,(d.x-a.x)/1536,(d.y-a.y)/1536,a.x,a.y);
  c.fillStyle='#0c1625';c.fillRect(-15,-15,1054,1566);
  atlas.draw(c,'poster_'+poster.id,512,1536,1024,1536);
  c.strokeStyle='#fff0ce80';c.lineWidth=5;c.strokeRect(3,3,1018,1530);c.restore();return points;
}
