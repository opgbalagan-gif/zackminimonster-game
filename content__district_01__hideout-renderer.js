import {roomLayout,heroSprite,ink} from './core__hideout.js?v=3746185ef7c6';
export function drawTrophy(c,id,atlas,x,y,size){
  if(id==='mini')atlas.draw(c,'companion',x,y,null,size);
  else if(id==='metro'){
    if(atlas.rect('train_front'))atlas.draw(c,'train_front',x,y,size*1.8);
    else{
      c.save();c.translate(x,y);c.scale(size/50,size/50);
      c.fillStyle='#172630';c.fillRect(-38,-32,76,27);c.fillStyle='#aaac9b';c.fillRect(-38,-36,76,7);
      c.fillStyle='#d6b459';c.fillRect(-38,-12,76,3);c.fillStyle='#547a89';
      for(let k=-32;k<35;k+=17)c.fillRect(k,-28,11,12);
      c.fillStyle='#09131b';for(const k of [-25,25]){c.beginPath();c.arc(k,-4,6,0,Math.PI*2);c.fill();}c.restore();
    }
  }
  else{
    c.save();c.translate(x,y);c.scale(size/50,size/50);c.fillStyle=id==='king'?'#edc853':'#cb73e5';c.strokeStyle='#161722';c.lineWidth=4;
    c.beginPath();c.ellipse(0,-24,22,22,0,0,Math.PI*2);c.fill();c.stroke();
    c.fillStyle='#161722';c.fillRect(-13,-28,10,5);c.fillRect(4,-28,10,5);c.fillRect(-6,-15,12,3);
    if(id==='king'){c.fillStyle='#fff0a0';c.fillRect(-15,0,30,5);}c.restore();
  }
}
export function renderHideout(c,s,w,h,atlas){
  c.imageSmoothingEnabled=false;c.fillStyle='#111720';c.fillRect(0,0,w,h);
  const backdrop=s.life&&!s.life.night?atlas.images.reference_background_day:atlas.images.reference_background;
  if(backdrop)c.drawImage(backdrop,0,600,1024,936,0,0,w,h);
  const r=roomLayout(w,h,s.world.tutorial);c.save();c.beginPath();c.rect(0,0,w,r.clipBottom);c.clip();
  if(s.life&&!s.life.night)c.filter='brightness(1.16) saturate(.86)';
  c.drawImage(atlas.images.room,r.x,r.y,r.w,r.h);c.filter='none';
  const local=(x,y)=>({x:r.x+x*r.w,y:r.y+y*r.h});
  const t=s.time,rest=s.room.action==='rest'||s.life?.tour&&s.life.introStep<=1,celebrate=s.room.action==='victory';
  const walking=!rest&&s.room.action==='idle'&&Math.floor(t/5)%3===1;
  const hx=rest?.57:.43+(walking?Math.sin(t*.9)*.028:0),hy=rest?.347:.60;
  const hero=local(hx,hy),pet=local(.565+Math.sin(t*.65)*.017,.622);
  const state=rest?'HIDE':celebrate?'VICTORY':s.room.action==='spray'?'SHAKE_CAN':'IDLE';
  const step=walking&&Math.floor(t*7)%2;
  c.fillStyle='#070c164f';c.beginPath();c.ellipse(hero.x,hero.y+2,r.w*.044,r.w*.012,0,0,Math.PI*2);c.fill();
  atlas.draw(c,heroSprite(s.save.player.skin,state,walking?(Math.cos(t*.9)>0?'right':'left'):'down',step),hero.x,hero.y-(celebrate?Math.abs(Math.sin(t*5))*5:step?2:0),null,r.w*(rest?.13:.18));
  const bounce=s.room.beat||s.room.action==='pet'?Math.abs(Math.sin(t*7))*7:Math.sin(t*2)*1.3;
  const hasPet=!s.world.tutorial&&s.save.campaign?.companionUnlocked!==false;
  if(hasPet)atlas.draw(c,'companion',pet.x,pet.y-bounce,null,r.w*.108);
  if(rest||s.room.reactionFor>0||s.room.beat){
    const text=rest?'Z z z':s.room.reactionFor>0?s.room.reaction:'♪';
    c.font='bold '+Math.max(13,r.w*.033)+'px monospace';c.textAlign='center';
    const speaker=hasPet?pet:hero;c.lineWidth=4;c.strokeStyle='#111722';c.strokeText(text,speaker.x,speaker.y-r.w*.13);c.fillStyle='#efdc99';c.fillText(text,speaker.x,speaker.y-r.w*.13);
  }
  const trophy=local(.563,.439);if(s.save.hideout.display!=='mini'||hasPet)drawTrophy(c,s.save.hideout.display,atlas,trophy.x,trophy.y,r.w*.043);
  const can=local(.35,.482);c.fillStyle='#131824';c.fillRect(can.x-4,can.y-17,9,18);c.fillStyle=ink(s.save.player.ink).color;c.fillRect(can.x-3,can.y-14,7,14);c.fillStyle='#ded8ca';c.fillRect(can.x-2,can.y-20,5,4);
  // Small pulsing light in the music corner.
  if(s.room.beat){const p=local(.77,.574);c.fillStyle=Math.floor(t*4)%2?'#c982df':'#e8c663';c.fillRect(p.x,p.y,3,3);}
  c.restore();
  if(s.life?.sleeping){c.fillStyle='rgba(4,9,16,'+(Math.sin(s.life.sleeping/2.6*Math.PI)*.85)+')';c.fillRect(0,0,w,h);}
}
