// Reuse original game artwork so team identity matches the paintings on walls.
export function drawTeamMark(c,atlas,owner,x,y,width=76){
  if(!atlas||!['zak','rival'].includes(owner))return;
  const id=owner==='zak'?'mural_color_crew':'gang_colour',r=atlas.rect(id);if(!r)return;
  const h=width*r[3]/r[2];c.save();c.imageSmoothingEnabled=true;c.shadowColor='#102637bb';c.shadowBlur=5;c.shadowOffsetY=2;
  atlas.draw(c,id,x,y+h/2,width,h);c.restore();
}
