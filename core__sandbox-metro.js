// Straight surface line. Four cars stop together at the neighbourhood platform.
export function surfaceTrain(m,time){
  const speed=140,start=m.start-600,stop=m.station.x+110,end=m.end+620;
  const arrival=(stop-start)/speed,hold=5,cycle=(end-start)/speed+hold,t=(time+9)%cycle;
  const lead=t<arrival?start+t*speed:t<arrival+hold?stop:stop+(t-arrival-hold)*speed;
  return Array.from({length:4},(_,i)=>({x:lead-i*145,y:m.y,dx:1,dy:0,front:i===0})).filter(c=>c.x>=m.start+65&&c.x<=m.end-65);
}
