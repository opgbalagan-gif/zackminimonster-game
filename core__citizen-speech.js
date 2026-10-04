// Each line belongs to its world actor, never to Zack's HUD portrait.
export function citizenSpeakers(session){
  const visitors=(session.life?.visitors??[]).filter(v=>['photo','tip'].includes(v.phase)&&v.line).map(v=>({actor:v,line:v.line}));
  const tutorial=session.tutorial,lesson=tutorial?.lesson;
  for(const actor of tutorial?.rivals?.actors??[])if(actor.line)visitors.push({actor,line:actor.line});
  for(const npc of session.world.streetNpcs??[])if(npc.line&&npc.speakingFor>0)visitors.push({actor:npc,line:npc.line});
  if(tutorial?.actor&&lesson?.who&&!lesson.who.startsWith('ЗАК'))visitors.push({actor:tutorial.actor,line:lesson.line});
  return visitors;
}
export function drawCitizenSpeech(c,speakers,projectActor,w,h){
  const placed=[];c.save();c.font='700 12px "Roboto Condensed",sans-serif';c.textAlign='left';c.textBaseline='top';
  for(const {actor,line} of speakers){
    const head=projectActor(actor);if(head.x<0||head.x>w||head.y<0||head.y>h)continue;
    const maxWidth=Math.min(174,w-28),lines=[];let current='';
    for(const word of line.split(/\s+/)){const next=current?current+' '+word:word;if(current&&c.measureText(next).width>maxWidth-20){lines.push(current);current=word;}else current=next;}
    if(current)lines.push(current);
    const bw=Math.min(maxWidth,Math.max(60,...lines.map(x=>c.measureText(x).width+20))),bh=lines.length*15+16;
    let bx=Math.max(8,Math.min(w-bw-8,head.x-bw/2)),by=Math.max(8,head.y-bh-13);
    for(const other of placed)if(bx<other.x+other.w+5&&bx+bw+5>other.x&&by<other.y+other.h+5&&by+bh+5>other.y)by=Math.max(8,other.y-bh-8);
    placed.push({x:bx,y:by,w:bw,h:bh});
    const tail=Math.max(bx+12,Math.min(bx+bw-12,head.x));
    c.fillStyle='#f5eedb';c.strokeStyle='#17232b';c.lineWidth=1.5;c.beginPath();c.roundRect(bx,by,bw,bh,10);c.fill();c.stroke();
    c.beginPath();c.moveTo(tail-5,by+bh-1);c.lineTo(head.x,head.y-2);c.lineTo(tail+5,by+bh-1);c.fill();c.stroke();
    c.fillStyle='#17232b';lines.forEach((text,i)=>c.fillText(text,bx+10,by+8+i*15));
  }c.restore();
}
