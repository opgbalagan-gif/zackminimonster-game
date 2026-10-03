import {distance,moveAlongPath} from './core__geometry.js?v=0b8195c8da56';

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
  const speaking=['smirk','smile','serious','laugh'],listening=['smile','smirk','laugh','smile'];
  s.streetDialogue={npc,lines:lines.flatMap(([line,reply],i)=>[
    {who:'РОББИ',side:'left',sprite:'roby_portrait_'+speaking[i],robyExpression:speaking[i],text:line},
    {who:'ЗАК',side:'right',sprite:'zack',robyExpression:listening[i],text:reply}
  ])};
  npc.line='';npc.speakingFor=0;s.courtLine=0;s.mode='court-dialogue';
  s.player.state='IDLE';s.player.moving=false;s.player.path=[];s.emit('mode');return true;
}
export function updateStreetNpcs(s,dt){
  for(const npc of s.world.streetNpcs??[]){
    npc.moving=false;
    const playerDistance=distance(s.player,npc);
    if(playerDistance<95)npc.waitForPlayer=true;else if(playerDistance>145)npc.waitForPlayer=false;
    if(npc.roaming&&s.mode==='district'&&!npc.waitForPlayer){
      npc.pauseFor=Math.max(0,(npc.pauseFor??0)-dt);
      if(!npc.pauseFor){
        npc.path??=[];
        if(!npc.path.length){
          const stops=[{x:650,y:365},{x:900,y:565},{x:1390,y:570},{x:1770,y:870},{x:1380,y:1080},{x:570,y:1060},{x:220,y:565},{x:440,y:362}];
          const point=stops[(npc.stopIndex??0)%stops.length];npc.stopIndex=(npc.stopIndex??0)+1;
          npc.path=s.nav.path(npc,point);if(!npc.path.length)npc.pauseFor=2;
        }
        const old={x:npc.x,y:npc.y};moveAlongPath(npc,npc.path,52,dt);
        if(npc.moving){
          const dx=npc.x-old.x,dy=npc.y-old.y;npc.walkDistance=(npc.walkDistance??0)+Math.hypot(dx,dy);
          const look=npc.path.find(p=>Math.hypot(p.x-npc.x,p.y-npc.y)>32)??npc.path[0];
          const vx=look?look.x-npc.x:dx,vy=look?look.y-npc.y:dy;
          const direction=Math.abs(vx)>Math.abs(vy)?(vx>0?'se':'nw'):(vy>0?'sw':'ne');
          if(direction===npc.turnCandidate)npc.turnFor=(npc.turnFor??0)+dt;else{npc.turnCandidate=direction;npc.turnFor=0;}
          if(npc.turnFor>=.16)npc.direction=direction;
        }
        if(!npc.path.length)npc.pauseFor=3;
      }
    }
    if(npc.roaming)Object.assign(npc.approach,{x:npc.x,y:npc.y});
    npc.speakingFor=Math.max(0,(npc.speakingFor??0)-dt);
    if(s.mode!=='district'||distance(s.player,npc)>135){npc.speakingFor=0;npc.exchange=0;}
    if(!npc.speakingFor)npc.line='';
  }
}
