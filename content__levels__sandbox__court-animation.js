import {project} from './core__geometry.js?v=8a0ece6e2747';
// One shared clock keeps the hands, ball bounces, pass and basket in sync.
export function courtPlay(s){
  const r=s.world.court,t=s.time%14,active=s.mode==='district',a={x:r.x+r.w*.38,y:r.y+r.h*.55},b={x:r.x+r.w*.65,y:r.y+r.h*.58};
  const hoop=s.world.hoops[1];
  const phase=!active?'idle':t<4?'dribble-a':t<5?'pass':t<8?'dribble-b':t<10?'shot':t<11?'drop':'return';
  const jump=phase==='shot'?Math.max(0,Math.sin(Math.min(1,(t-8)*2)*Math.PI))*13:0;
  const friends=s.court.friends.map((actor,i)=>({...actor,...(i?b:a),courtIndex:i,courtPhase:phase,courtJump:i?jump:0,courtTime:t,motionTime:active?s.time:0}));
  let ball={...a,z:25};
  const lerp=(from,to,u,height=0)=>({x:from.x+(to.x-from.x)*u,y:from.y+(to.y-from.y)*u,z:(from.z??35)+((to.z??35)-(from.z??35))*u+Math.sin(Math.PI*u)*height});
  if(phase==='dribble-a')ball={x:a.x+25,y:a.y,z:6+Math.abs(Math.cos(t*Math.PI*2))*26};
  if(phase==='pass')ball=lerp({...a,x:a.x+25},{...b,x:b.x-23},t-4,14);
  if(phase==='dribble-b')ball={x:b.x-23,y:b.y,z:6+Math.abs(Math.cos((t-5)*Math.PI*2))*26};
  if(phase==='shot')ball=lerp({...b,z:65},{...hoop,z:82},(t-8)/2,74);
  if(phase==='drop')ball={...hoop,z:82-76*(t-10)};
  if(phase==='return')ball=lerp({...hoop,z:6},{...a,x:a.x+25,z:32},(t-11)/3,24);
  return {friends,ball,phase};
}
export function drawCourtPlayer(c,actor,atlas){
  if(atlas.rect('court_motion_0_0')){
    const p=project(actor.x,actor.y),frame=Math.floor((actor.motionTime??0)*12)%72;
    c.save();c.fillStyle='#15202045';c.beginPath();c.ellipse(p.x,p.y,17,6,0,0,Math.PI*2);c.fill();c.imageSmoothingEnabled=true;atlas.draw(c,'court_motion_'+actor.courtIndex+'_'+frame,p.x,p.y,null,86);c.restore();return;
  }
  const p=project(actor.x,actor.y),t=actor.courtTime,phase=actor.courtPhase,i=actor.courtIndex;
  const dribble=phase===(i?'dribble-b':'dribble-a'),moving=phase==='return',stride=moving?Math.sin(t*8)*5:Math.sin(t*2)*1.1;
  const jump=actor.courtJump??0; c.save();c.translate(p.x,p.y-jump);c.lineCap='round';c.lineJoin='round';
  const sprite=atlas.metadata.sprites[actor.sprite],[sx,sy,sw,sh]=sprite.rect,source=atlas.images[sprite.sheet];c.imageSmoothingEnabled=true;
  const limb=(points,color,width)=>{for(const [paint,size] of [['#182e39',width+3],[color,width]]){c.strokeStyle=paint;c.lineWidth=size;c.beginPath();points.forEach(([x,y],n)=>n?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}};
  c.save();c.translate(stride*.3,-1);c.rotate(stride*.008);c.drawImage(source,sx,sy+sh*.65,sw,sh*.35,-24,-28,48,29);c.restore();
  const shoot=i&&phase==='shot',handY=shoot?-67:dribble?-33+Math.cos(t*Math.PI*2)*7:-33;
  limb([[-12,-46],[-19,-36],[-23,shoot?-59:handY]],'#c9956c',6);limb([[12,-46],[19,shoot?-55:-36],[23,handY]],'#c9956c',6);
  c.drawImage(source,sx+sw*.24,sy+sh*.33,sw*.48,sh*.34,-15,-51,30,29);
  c.drawImage(source,sx,sy,sw,sh*.34,-27,-83,54,34);
  c.restore();
}
export function drawCourtBall(c,ball){const p=project(ball.x,ball.y,ball.z);c.save();c.fillStyle='#f5a052';c.strokeStyle='#253b46';c.lineWidth=1.4;c.beginPath();c.arc(p.x,p.y,7,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.moveTo(p.x-6,p.y);c.lineTo(p.x+6,p.y);c.moveTo(p.x,p.y-6);c.lineTo(p.x,p.y+6);c.stroke();c.restore();}
