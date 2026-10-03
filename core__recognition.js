export const RECOGNITION_TIERS=[
  {at:0,name:'Незнакомец',audience:2,interval:8,bonus:0,lines:['Кто это нарисовал?','Необычная работа. Сниму.']},
  {at:20,name:'Знакомый почерк',audience:3,interval:6,bonus:5,lines:['Этот почерк уже видел!','Говорят, это работы Зака.']},
  {at:45,name:'Свой в районе',audience:4,interval:5,bonus:10,lines:['Ещё одна работа Зака!','У Зака снова новый рисунок.']},
  {at:85,name:'Гордость района',audience:5,interval:4,bonus:20,lines:['Ради работ Зака сюда пришли!','Наш район узнают по Заку!']}
];
export function recognition(save){
  const r=save.recognition??{works:[],photos:[],encounters:0};
  const score=r.works.length*8+r.photos.length*5+Math.min(60,r.encounters)+(save.campaign.tutorialComplete?8:0)+(save.campaign.sneakComplete?8:0);
  const level=RECOGNITION_TIERS.findLastIndex(t=>score>=t.at);
  return {...RECOGNITION_TIERS[level],level,score,next:RECOGNITION_TIERS[level+1]?.at??null};
}
export function rememberWorks(s){
  const r=s.save.recognition;let changed=false;
  const add=(list,id)=>{if(!list.includes(id)){list.push(id);changed=true;}};
  for(const target of s.world.targets)if(s.painted.has(target.wall_id))add(r.works,target.wall_id);
  // Existing campaign milestones migrate without depending on the current map.
  if(s.save.campaign.tutorialFacadePainted)add(r.works,'TUTORIAL_HOME_FACADE');
  if(s.save.campaign.tutorialComplete||['first_done','rival_done','recovery','return_wall','repaint','escape','complete'].includes(s.save.campaign.tutorialCheckpoint))add(r.works,'TUTORIAL_FIRST_WALL');
  if(s.save.campaign.sneakComplete||['hide','photo','complete'].includes(s.save.campaign.sneakCheckpoint))add(r.works,'SNEAK_GIFT_WALL');
  for(const photo of s.save.phone.photos)add(r.photos,photo.wall);
  return changed;
}
