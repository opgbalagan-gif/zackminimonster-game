import {drawTeamMark} from './core__team-marks.js?v=8a0ece6e2747';
import {drawMapAtlas} from './core__map-atlas.js?v=8a0ece6e2747';
import {districtTerritories,TERRITORY_COLORS} from './core__territory.js?v=8a0ece6e2747';
export function mapTransform(world,width,height,player=null,view=null){
  const b=player?{x:player.x-550,y:player.y-550,w:1100,h:1100}:world.mapBounds;
  const scale=Math.min((width-(view?40:18))/b.w,(height-(view?210:18))/b.h)*(view?.zoom??1),center=view?.center??{x:b.x+b.w/2,y:b.y+b.h/2},ox=width/2-center.x*scale,oy=height/2+ (view?14:0)-center.y*scale;
  return {scale,point:p=>({x:ox+p.x*scale,y:oy+p.y*scale}),world:(x,y)=>({x:(x-ox)/scale,y:(y-oy)/scale})};
}
export function mapMarkers(s){
  const markers=s.world.targets.map(t=>({kind:'paint',...t.approach,id:t.wall_id,label:t.name,done:s.painted.has(t.wall_id)&&!s.save.wall_damage[t.wall_id],rival:s.save.wall_damage[t.wall_id]==='rival'}));
  markers.push({kind:'home',...s.world.hideout,label:'Квартира'}, {kind:'metro',...s.world.surfaceMetro.approach,label:'Метро'},{kind:'ball',...s.court,label:'Баскетбол'},{kind:'shop',...s.world.paintShop,label:'COLOR LAB · краски'});
  for(const npc of s.world.streetNpcs)markers.push({kind:'npc',x:npc.x,y:npc.y,label:npc.name,route:npc.approach});
  for(const bin of s.world.bins)markers.push({kind:'hide',...bin.approach,label:'Укрытие'});
  for(const cop of [...s.police.units.filter(p=>p.active),s.tutorial.actor].filter(Boolean))markers.push({kind:'police',x:cop.x,y:cop.y,label:'Полиция'});
  for(const a of s.tutorial.rivals?.actors??[])markers.push({kind:a.kind,x:a.x,y:a.y,label:a.kind==='rival'?'Соперник':'Дворник'});
  return markers;
}
const colors={paint:'#e868be',home:'#e4bf72',metro:'#70d5dc',ball:'#e6a66a',shop:'#70dab9',npc:'#f4eedb',hide:'#a7b5b9',police:'#6c9dff',rival:'#ef6c69',cleaner:'#e4bf72'};
export function drawDistrictMap(c,s,width,height,mini=false,destination=null,view=null){
  const t=mapTransform(s.world,width,height,mini?s.player:null,mini?null:view),point=t.point;
  c.clearRect(0,0,width,height);c.save();c.beginPath();c.rect(0,0,width,height);c.clip();c.fillStyle=mini?'#10233388':'#112632';c.fillRect(0,0,width,height);
  function rect(r,color){const p=point(r);c.fillStyle=color;c.fillRect(p.x,p.y,r.w*t.scale,r.h*t.scale);}
  if(!mini)drawMapAtlas(c,s,t,width,height);
  if(mini){
  rect(s.world.mapBounds,mini?'#a7b6aa12':'#263e46');
  for(const p of s.world.parks)rect(p,'#456351');for(const p of s.world.water)rect(p,'#39788d');
  for(const p of s.world.paths)rect(p,'#6b796b');for(const p of s.world.bridges)rect(p,'#abb79e');for(const p of s.world.roads)rect(p,'#748386');
  }
  const territories=districtTerritories(s);
  for(const z of territories){
    const p=point(z),color=TERRITORY_COLORS[z.owner];c.save();c.globalAlpha=z.owner==='neutral'?0:mini?.25:.23;rect(z,color);c.restore();
    c.strokeStyle=color+(mini?'bb':'bb');c.lineWidth=mini?1:1.5;c.setLineDash(z.owner==='contested'?[5,4]:z.owner==='neutral'?[2,6]:[]);
    c.strokeRect(p.x+1,p.y+1,z.w*t.scale-2,z.h*t.scale-2);c.setLineDash([]);
  }
  if(mini){for(const p of s.world.buildings)rect(p,mini?'#f4eedb66':'#b9b9a0');rect(s.world.court,'#b27363');
  const rail=s.world.surfaceMetro,a=point({x:rail.activeStart,y:rail.y}),b=point({x:rail.activeEnd,y:rail.y});c.strokeStyle='#e4bf72';c.lineWidth=2;c.setLineDash([5,3]);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.setLineDash([]);}
  const route=!mini&&view?.route?view.route:s.player.path;
  if(route.length){c.strokeStyle='#fff387';c.lineWidth=mini?2:3;c.beginPath();const a=point(s.player);c.moveTo(a.x,a.y);for(const p of route){const q=point(p);c.lineTo(q.x,q.y);}c.stroke();}
  const markers=mapMarkers(s),hits=[];
  if(!mini)for(const z of territories){
    const p=point({x:z.x+z.w/2,y:z.y+z.h*.57});
    if(p.x<10||p.x>width-10||p.y<110||p.y>height-110)continue;
    c.save();c.textAlign='center';c.textBaseline='middle';c.font='800 '+Math.min(20,Math.max(11,z.w*t.scale/9))+'px "Street Condensed",sans-serif';const half=c.measureText(z.name.toUpperCase()).width/2+8;p.x=Math.max(half,Math.min(width-half,p.x));if(z.owner==='zak'||z.owner==='rival')drawTeamMark(c,view?.atlas,z.owner,p.x,p.y-34,Math.min(96,Math.max(62,z.w*t.scale*.55)));
    else if(z.owner==='contested'){drawTeamMark(c,view?.atlas,'zak',p.x-24,p.y-30,40);drawTeamMark(c,view?.atlas,'rival',p.x+24,p.y-30,48);}
    c.strokeStyle='#203a42';c.lineWidth=3;c.lineJoin='round';c.strokeText(z.name.toUpperCase(),p.x,p.y);c.fillStyle='#e0e9df';c.fillText(z.name.toUpperCase(),p.x,p.y);
    c.font='bold 10px sans-serif';c.fillStyle=TERRITORY_COLORS[z.owner];const label={zak:'ЗАК',rival:'ОППЫ',contested:'СПОР',neutral:'СВОБОДНО'}[z.owner];c.strokeText(label,p.x,p.y+17);c.fillText(label,p.x,p.y+17);c.restore();
  }
  for(const m of markers){
    if(!mini&&view?.filter==='paint'&&!['paint','shop'].includes(m.kind))continue;
    if(!mini&&view?.filter==='people'&&!['npc','police','rival','cleaner'].includes(m.kind))continue;
    const p=point(m);if(p.x<0||p.x>width||p.y<0||p.y>height)continue;
    const color=m.rival?colors.rival:m.done?'#72ce9e':colors[m.kind],detail=!mini&&(m.kind==='paint'?view?.filter==='paint'&&view.zoom>2.2:m.kind==='hide'?view?.zoom>2:m.kind==='npc'?view?.filter==='people':true);
    if(detail)mapBadge(c,p,m.kind,color,m.kind==='paint'?9:['rival','cleaner','police'].includes(m.kind)?10:12);
    else{c.fillStyle=color;c.strokeStyle='#183745';c.lineWidth=1;c.beginPath();c.arc(p.x,p.y,mini?(m.kind==='paint'?2:4):view?.filter==='paint'?4:2.5,0,Math.PI*2);c.fill();c.stroke();}
    hits.push({...m,...p,worldPoint:m.route??{x:m.x,y:m.y}});
  }
  if(destination){const p=point(destination);c.strokeStyle='#f4eedb';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,10,0,Math.PI*2);c.moveTo(p.x-14,p.y);c.lineTo(p.x+14,p.y);c.moveTo(p.x,p.y-14);c.lineTo(p.x,p.y+14);c.stroke();}
  const p=point(s.player);c.save();c.translate(p.x,p.y);c.fillStyle='#dc60bd33';c.beginPath();c.arc(0,0,mini?8:20,0,Math.PI*2);c.fill();c.fillStyle='#fffcf2';c.strokeStyle='#dc60bd';c.lineWidth=2;c.beginPath();c.moveTo(0,mini?-6:-10);c.lineTo(mini?4:7,mini?5:9);c.lineTo(0,mini?3:5);c.lineTo(mini?-4:-7,mini?5:9);c.closePath();c.fill();c.stroke();c.restore();c.restore();return {transform:t,hits,territories};
}

function mapBadge(c,p,kind,color,r){
 c.save();c.translate(p.x,p.y);c.shadowColor='#071b2aaa';c.shadowBlur=6;c.shadowOffsetY=2;c.fillStyle='#173747';c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.roundRect(-r,-r,r*2,r*2,4);c.fill();c.stroke();c.shadowBlur=0;c.shadowOffsetY=0;c.scale(r/13,r/13);c.strokeStyle='#eff4df';c.lineWidth=1.7;c.lineJoin='round';
 const paths={home:'M-8 0L0 -7L8 0M-5 -2V7H-1V2H3V7H6V-2',paint:'M-4 -5H4V8H-4ZM-2 -8H3V-5M3 -8H7',shop:'M-7 -3H7L6 8H-6ZM-3 -3V-6Q0 -11 3 -6V-3',police:'M0 -9L7 -5V1Q7 5 0 9Q-7 5 -7 1V-5ZM0 -4V2M0 4V5',rival:'M-5 -6L5 6M5 -6L-5 6',cleaner:'M-8 -7H5V-2H-8ZM5 -5H8V2H0V8',metro:'M-7 7V-7L0 2L7 -7V7',hide:'M-6 -4H6L5 8H-5ZM-8 -6H8M-3 -9H3',npc:'M-7 -6H7V4H1L-4 8V4H-7Z',ball:'M-8 0A8 8 0 1 0 8 0A8 8 0 1 0 -8 0M-8 0H8M0 -8V8'};
 c.stroke(new Path2D(paths[kind]??paths.paint));c.restore();
}
