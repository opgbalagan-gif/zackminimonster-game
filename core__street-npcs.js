import {distance} from './core__geometry.js?v=083bd6171324';

// Both speakers use the comic conversation view, never the HUD notice channel.
export function talkToStreetNpc(s,npc){
  if(s.mode!=='district'||distance(s.player,npc.approach)>62)return false;
  const painted=s.world.targets.some(t=>s.painted.has(t.wall_id));
  const lines=[
    ['Йо, я Робби. Ты тот самый Зак с баллоном?','Зависит от того, кто спрашивает.'],
    painted?['Видел твой рисунок. У этой стены теперь есть характер.','И теперь хотя бы один ценитель.']:['Стена у дома ещё пустая. У неё явно скучный день.','Сейчас добавлю ей характер.'],
    s.life.night?['Рисуй ночью. А если мигалки — бак рядом, не геройствуй.','Романтика района: краска и аромат мусора.']:['Днём люди фоткаются у работ. Подойди — может, оставят на краску.','Наконец-то нормальный способ покупать баллоны.'],
    ['Заглядывай. Я тут слежу за стилем и хорошими тачками.','Ладно, эксперт по пятнам. Ещё увидимся.']
  ];
  s.streetDialogue={npc,lines:lines.flatMap(([line,reply])=>[
    {who:'РОББИ',side:'left',sprite:'roby_portrait',text:line},
    {who:'ЗАК',side:'right',sprite:'zack',text:reply}
  ])};
  npc.line='';npc.speakingFor=0;s.courtLine=0;s.mode='court-dialogue';
  s.player.state='IDLE';s.player.moving=false;s.player.path=[];s.emit('mode');return true;
}
export function updateStreetNpcs(s,dt){
  for(const npc of s.world.streetNpcs??[]){
    npc.speakingFor=Math.max(0,(npc.speakingFor??0)-dt);
    if(s.mode!=='district'||distance(s.player,npc)>135){npc.speakingFor=0;npc.exchange=0;}
    if(!npc.speakingFor)npc.line='';
  }
}
