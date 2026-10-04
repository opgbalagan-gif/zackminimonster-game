// Ownership is derived from standing artwork, never from lifetime REP.
export function wallOwner(s,id){
  const damage=s.save.wall_damage[id];
  if(damage==='rival')return 'rival';
  return !damage&&s.painted.has(id)?'zak':'neutral';
}
export const TERRITORY_COLORS={zak:'#51f4ac',rival:'#ff755f',contested:'#ffe27a',neutral:'#a7b5b9'};
export function districtTerritories(s){
  if(!s.world.sandbox)return [];
  const zones=[
    ['home','Старый квартал',72,92,1350,1338],
    ['station','У метро',1422,92,1150,1338],
    ['north','Северный',2572,92,1150,1338],
    ['marina','Причал',72,1430,778,2672],
    ['yards','Дворы',1000,1430,1500,1600],
    ['park','Лесопарк',2500,1430,1222,1600],
    ['workshops','Мастерские',1000,3030,2722,1072]
  ].map(([id,name,x,y,w,h])=>({id,name,x,y,w,h,zak:0,rival:0,neutral:0,total:0,wallIds:[]}));
  const buildings=new Map(s.world.buildings.map(b=>[b.id,b]));
  for(const t of s.world.targets){
    const b=buildings.get(t.buildingId),p=b?{x:b.x+b.w/2,y:b.y+b.h/2}:t.approach;
    const zone=zones.find(z=>p.x>=z.x&&p.x<z.x+z.w&&p.y>=z.y&&p.y<z.y+z.h);
    if(!zone)continue;
    zone[wallOwner(s,t.wall_id)]++;zone.total++;zone.wallIds.push(t.wall_id);
  }
  for(const z of zones)z.owner=z.zak===z.rival?(z.zak?'contested':'neutral'):z.zak>z.rival?'zak':'rival';
  return zones;
}
