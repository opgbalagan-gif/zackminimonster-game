export const GRAFFITI_CATALOG=[
  {id:'panda_king',walls:0},{id:'zack_tag',walls:0},{id:'monster',walls:0},{id:'crown',walls:0},
  {id:'monster_crew',walls:0},{id:'stereo_friends',walls:5},{id:'night_friends',walls:12},{id:'toy_kings',walls:25}
];
export function graffitiUnlocked(save,id){const art=GRAFFITI_CATALOG.find(a=>a.id===id);return !!art&&((save.painted_walls?.length??0)>=art.walls||save.graffiti_unlocks?.includes(id));}
export function unlockGraffiti(save){save.graffiti_unlocks=[...new Set([...(save.graffiti_unlocks??[]),...GRAFFITI_CATALOG.filter(a=>(save.painted_walls?.length??0)>=a.walls).map(a=>a.id)])];}
