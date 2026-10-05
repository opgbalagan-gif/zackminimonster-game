import {wallOwner} from './core__territory.js?v=252855055fad';
export function needsPaint(s,target){
  if(!target)return false;
  if(!s.world.sandbox&&target===s.world.targets[0])return s.tutorial.wall!=='own'||s.tutorial.tag>0||s.tutorial.coating>0;
  return wallOwner(s,target.wall_id)!=='zak';
}
export function paintMarkerVisible(s,target){
  return s.mode==='district'&&needsPaint(s,target)&&Math.hypot(target.approach.x-s.player.x,target.approach.y-s.player.y)<=110;
}
