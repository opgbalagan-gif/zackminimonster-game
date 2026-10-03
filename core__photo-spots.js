// Photo access uses the same walking distance as other street interactions.
export function nearbyPhotoSpot(session,mode=session.mode){
  if(mode!=='district'||!session.save.phone.unlocked)return null;
  return session.world.targets
    .filter(t=>session.painted.has(t.wall_id)&&(!t.buildingId||session.world.id!=='sneak'))
    .map(target=>({target,distance:Math.hypot(target.approach.x-session.player.x,target.approach.y-session.player.y)}))
    .filter(t=>t.distance<=90).sort((a,b)=>a.distance-b.distance)[0]?.target??null;
}
