import {BALL_GRID,MARKERS} from './core__basketball.js';
export function drawBall(c,pixels,size,{guide=false}={}){
  c.save();c.scale(size,size);c.lineWidth=.009;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.arc(.5,.5,.47,0,Math.PI*2);c.clip();
  const g=c.createRadialGradient(.33,.27,.02,.58,.58,.65);g.addColorStop(0,'#f7b453');g.addColorStop(.6,'#e47d31');g.addColorStop(1,'#9e411f');c.fillStyle=g;c.fillRect(0,0,1,1);
  c.fillStyle='#49251a25';for(let y=0;y<52;y++)for(let x=0;x<52;x++){c.beginPath();c.arc((x+(y%2)*.5)/52,y/52,.0014,0,7);c.fill();}
  c.strokeStyle='#64351f';c.lineWidth=.01;c.beginPath();c.moveTo(.5,.02);c.bezierCurveTo(.41,.27,.65,.72,.5,.98);c.moveTo(.03,.44);c.bezierCurveTo(.34,.32,.67,.34,.97,.54);c.moveTo(.11,.16);c.bezierCurveTo(.61,.22,.81,.66,.75,.91);c.moveTo(.08,.75);c.bezierCurveTo(.2,.45,.41,.21,.72,.08);c.stroke();
  if(guide){c.fillStyle='#fff8dc26';for(const [x,y,rx,ry] of [[.43,.42,.28,.23],[.6,.64,.23,.21],[.22,.66,.13,.14]]){c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();}}
  if(pixels?.length===BALL_GRID**2)for(let i=0;i<pixels.length;i++)if(pixels[i]>=0&&MARKERS[pixels[i]]){
    c.fillStyle=MARKERS[pixels[i]].color;c.fillRect((i%BALL_GRID)/BALL_GRID,Math.floor(i/BALL_GRID)/BALL_GRID,1/BALL_GRID+.001,1/BALL_GRID+.001);
  }
  // The black face outlines remain crisp above the player's multicolour marker fill.
  if(guide||pixels?.some(p=>p>=0)){
    c.strokeStyle='#17202c';c.fillStyle='#17202c';c.lineWidth=.009;
    for(const [x,y,rx,ry] of [[.43,.42,.28,.23],[.6,.64,.23,.21],[.22,.66,.13,.14]]){c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.stroke();}
    const eyes=(x,y,w)=>{c.fillStyle='#17202c';c.beginPath();c.ellipse(x,y,w,w*.37,0,0,Math.PI);c.fill();
      c.fillStyle='#fff3d5';for(const side of [-1,1]){c.beginPath();c.ellipse(x+side*w*.4,y+.006,w*.24,w*.13,0,0,Math.PI);c.fill();}};
    eyes(.43,.40,.19);eyes(.6,.63,.15);eyes(.22,.65,.077);
    c.strokeStyle='#17202c';c.beginPath();c.moveTo(.39,.51);c.quadraticCurveTo(.44,.55,.49,.51);c.moveTo(.57,.73);c.lineTo(.63,.73);c.stroke();
  }
  c.restore();c.save();c.strokeStyle='#111a24';c.lineWidth=Math.max(2,size*.012);c.beginPath();c.arc(size*.5,size*.5,size*.47,0,Math.PI*2);c.stroke();c.restore();
}
