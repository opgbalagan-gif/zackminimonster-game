// Shared, deterministic wall materials: identical treatment in world and close-up.
export function wallSurface(c,type,x,y,w,h){
  c.save();c.translate(x,y);c.scale(w/640,h/400);
  c.beginPath();c.rect(0,0,640,400);c.clip();
  const brick=['brick_wall','alley_wall','basketball_wall'].includes(type);
  c.fillStyle=brick?(type==='basketball_wall'?'#84766c':'#927b6d'):type==='construction_wall'?'#aa9366':type==='fence'?'#435c52':'#888e88';c.fillRect(0,0,640,400);
  c.strokeStyle='#535956';c.lineWidth=3;
  if(brick){
    for(let yy=0;yy<400;yy+=34){
      c.beginPath();c.moveTo(0,yy);c.lineTo(640,yy);c.stroke();
      for(let xx=(Math.floor(yy/34)%2)*50;xx<640;xx+=100){c.beginPath();c.moveTo(xx,yy);c.lineTo(xx,yy+34);c.stroke();}
    }
  }else if(type==='shutter'){
    for(let yy=0;yy<400;yy+=19){c.fillStyle='#59646a';c.fillRect(0,yy,640,4);c.fillStyle='#a8afa8';c.fillRect(0,yy+4,640,2);}
    c.fillStyle='#323c44';c.fillRect(286,348,68,13);
  }else if(type==='fence'){
    c.strokeStyle='#adb6a1';c.lineWidth=3;
    for(let xx=-400;xx<1040;xx+=27){
      c.beginPath();c.moveTo(xx,0);c.lineTo(xx+400,400);c.moveTo(xx,0);c.lineTo(xx-400,400);c.stroke();
    }
    c.fillStyle='#303b40';c.fillRect(0,0,13,400);c.fillRect(628,0,12,400);
  }else{
    const step=type==='metro_pillar'?160:213;
    for(let xx=0;xx<640;xx+=step){c.fillStyle='#586364';c.fillRect(xx,0,4,400);for(const yy of [22,377]){c.fillStyle='#414b50';c.fillRect(xx+17,yy,6,6);}}
    if(type==='construction_wall'){c.fillStyle='#d8b95a';c.fillRect(0,364,640,36);c.fillStyle='#343c43';for(let xx=0;xx<640;xx+=46)c.fillRect(xx,364,21,36);}
  }
  c.fillStyle='#26313b29';for(let i=0;i<60;i++)c.fillRect((i*97)%640,(i*61)%400,3+i%6,2);
  c.restore();
}
