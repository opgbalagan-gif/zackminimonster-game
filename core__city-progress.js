import {inside} from './core__geometry.js?v=cfa54f753bac';
export function cityProgress(world,save){
  const painted=new Set(save.painted_walls),regions=world.regions??[];
  const rep=regions.map(r=>world.targets.filter(t=>t.regionId===r.id&&painted.has(t.wall_id)).reduce((n,t)=>n+t.rep_reward,0)+(r.id==='east'&&save.basketball?.completed?300:0));
  let open=true;
  return regions.map((r,i)=>{
    open=open&&(i===0||rep[i-1]>=r.required);
    return {...r,open,rep:rep[i],previous:regions[i-1]?.name,earned:i?rep[i-1]:0};
  });
}
export function regionAt(world,point){return world.regions?.find(r=>inside(point.x,point.y,r));}
export function canEnter(world,progress,x,y){
  if(!world.regions)return true;
  const passage=world.bridges.find(b=>inside(x,y,b));
  if(passage)return !!progress.find(r=>r.id===passage.to)?.open;
  const region=regionAt(world,{x,y});
  if(region)return progress.find(r=>r.id===region.id)?.open??false;
  const bridge=world.bridges.find(b=>inside(x,y,b));
  return !!bridge&&!!progress.find(r=>r.id===bridge.to)?.open;
}
export function gateMessage(progress,id){
  const r=progress.find(r=>r.id===id);
  return r?.open?'Проход открыт · '+r.name:r?`${r.name}: нужно ${r.required} REP в ${r.previous}. Сохранено ${r.earned}/${r.required}. Сохрани работы в убежище.`:'Здесь море. Ищи мост.';
}
