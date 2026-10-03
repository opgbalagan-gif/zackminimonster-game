import {routeFade} from './core__route-fade.js?v=200bdb7a657c';
// Each whole car dissolves before leaving the line; no clipped wagon silhouettes.
export function surfaceTrain(m,time){
  const speed=140,start=m.start-600,stop=m.station.x+110,end=m.end+620;
  const arrival=(stop-start)/speed,hold=5,cycle=(end-start)/speed+hold,t=(time+9)%cycle;
  const lead=t<arrival?start+t*speed:t<arrival+hold?stop:stop+(t-arrival-hold)*speed;
  return Array.from({length:4},(_,i)=>{const x=lead-i*145;return {x,y:m.y,dx:1,dy:0,front:i===0,opacity:routeFade(x,m.start+65,m.end-65,230)};}).filter(c=>c.opacity>0);
}
