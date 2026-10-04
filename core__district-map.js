export function mapTransform(world,width,height,player=null){
  const b=player?{x:player.x-550,y:player.y-550,w:1100,h:1100}:world.mapBounds;
  const scale=Math.min((width-18)/b.w,(height-18)/b.h),ox=(width-b.w*scale)/2-b.x*scale,oy=(height-b.h*scale)/2-b.y*scale;
  return {scale,point:p=>({x:ox+p.x*scale,y:oy+p.y*scale}),world:(x,y)=>({x:(x-ox)/scale,y:(y-oy)/scale})};
}
export function mapMarkers(s){
  const markers=s.world.targets.map(t=>({kind:'paint',...t.approach,id:t.wall_id,label:t.name,done:s.painted.has(t.wall_id)&&!s.save.wall_damage[t.wall_id],rival:s.save.wall_damage[t.wall_id]==='rival'}));
  markers.push({kind:'home',...s.world.hideout,label:'Квартира'}, {kind:'metro',...s.world.surfaceMetro.approach,label:'Метро'},{kind:'ball',...s.court,label:'Баскетбол'},{kind:'shop',...s.world.paintShop,label:'COLOR LAB · краски'});
  for(const npc of s.world.streetNpcs)markers.push({kind:'npc',x:npc.x,y:npc.y,label:npc.name,route:npc.approach});
  for(const bin of s.world.bins)markers.push({kind:'hide',...bin.approach,label:'Укрытие'});
  for(const cop of [...s.police.units.filter(p=>p.active),s.tutorial.actor].filter(Boolean))markers.push({kind:'police',x:cop.x,y:cop.y,label:'Полиция'});
  const rival=s.tutorial.rivals?.actor;if(rival?.kind==='rival')markers.push({kind:'rival',x:rival.x,y:rival.y,label:'Соперник'});
  return markers;
}
const colors={paint:'#e868be',home:'#e4bf72',metro:'#70d5dc',ball:'#e6a66a',shop:'#70dab9',npc:'#f4eedb',hide:'#a7b5b9',police:'#6c9dff',rival:'#ef6c69'};
const glyphs={paint:'✎',home:'⌂',metro:'M',ball:'●',shop:'S',npc:'R',hide:'H',police:'!',rival:'×'};
export function drawDistrictMap(c,s,width,height,mini=false,destination=null){
  const t=mapTransform(s.world,width,height,mini?s.player:null),point=t.point;
  c.clearRect(0,0,width,height);c.save();c.beginPath();c.rect(0,0,width,height);c.clip();c.fillStyle=mini?'#10233388':'#112632';c.fillRect(0,0,width,height);
  function rect(r,color){const p=point(r);c.fillStyle=color;c.fillRect(p.x,p.y,r.w*t.scale,r.h*t.scale);}
  rect(s.world.mapBounds,mini?'#a7b6aa12':'#263e46');
  for(const p of s.world.parks)rect(p,'#456351');for(const p of s.world.water)rect(p,'#39788d');
  for(const p of s.world.paths)rect(p,'#6b796b');for(const p of s.world.bridges)rect(p,'#abb79e');for(const p of s.world.roads)rect(p,'#748386');
  for(const p of s.world.buildings)rect(p,mini?'#f4eedb66':'#b9b9a0');rect(s.world.court,'#b27363');
  const rail=s.world.surfaceMetro,a=point({x:rail.activeStart,y:rail.y}),b=point({x:rail.activeEnd,y:rail.y});c.strokeStyle='#e4bf72';c.lineWidth=2;c.setLineDash([5,3]);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.setLineDash([]);
  if(s.player.path.length){c.strokeStyle='#70efce';c.lineWidth=mini?2:3;c.beginPath();const a=point(s.player);c.moveTo(a.x,a.y);for(const p of s.player.path){const q=point(p);c.lineTo(q.x,q.y);}c.stroke();}
  const markers=mapMarkers(s),hits=[];
  for(const m of markers){const p=point(m);if(p.x<0||p.x>width||p.y<0||p.y>height)continue;const radius=m.kind==='paint'?(mini?2.3:4.5):(mini?5:8);
    c.fillStyle=m.rival?colors.rival:m.done?'#72ce9e':colors[m.kind];c.strokeStyle='#091924';c.lineWidth=1.5;c.beginPath();c.arc(p.x,p.y,radius,0,Math.PI*2);c.fill();c.stroke();
    if(m.kind!=='paint'&&!mini){c.fillStyle='#102333';c.font='bold 11px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(glyphs[m.kind],p.x,p.y);}
    hits.push({...m,...p,worldPoint:m.route??{x:m.x,y:m.y}});
  }
  if(destination){const p=point(destination);c.strokeStyle='#f4eedb';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,10,0,Math.PI*2);c.moveTo(p.x-14,p.y);c.lineTo(p.x+14,p.y);c.moveTo(p.x,p.y-14);c.lineTo(p.x,p.y+14);c.stroke();}
  const p=point(s.player);c.fillStyle='#ff69bf';c.strokeStyle='#fff9e7';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,mini?4:6,0,Math.PI*2);c.fill();c.stroke();c.restore();return {transform:t,hits};
}
