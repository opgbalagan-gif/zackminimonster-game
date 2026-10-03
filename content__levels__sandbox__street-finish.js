import {project} from './core__geometry.js?v=3550d357cf95';
import {ART} from './core__art-direction.js?v=3550d357cf95';
import {polygon} from './content__district_01__terrain.js?v=3550d357cf95';

const hash=text=>[...text].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
const quad=(x,y,w,h)=>[project(x,y),project(x+w,y),project(x+w,y+h),project(x,y+h)];
export function streetFinish(c,s,view){
  const night=s.life.night,visible=(x,y)=>x>view.x-100&&x<view.x+view.w+100&&y>view.y-100&&y<view.y+view.h+100;
  c.save();
  // Contact strips make the buildings sit on the paving without adding obstacles.
  for(const b of s.world.buildings){if(!visible(b.x,b.y))continue;
    polygon(c,quad(b.x+b.w-3,b.y,8,b.h+5),night?'#07131c55':'#38454d22');
    polygon(c,quad(b.x,b.y+b.h-3,b.w+5,8),night?'#07131c55':'#38454d22');
  }
  c.transform(1,.5,-1,.5,0,0);
  for(const r of s.world.roads){
    const horizontal=r.w>r.h,length=horizontal?r.w:r.h;
    for(let t=92;t<length-60;t+=230){
      const x=horizontal?r.x+t:r.x+12,y=horizontal?r.y+12:r.y+t;
      if(!visible(x,y)||s.world.roads.some(other=>other!==r&&x>other.x-25&&x<other.x+other.w+25&&y>other.y-25&&y<other.y+other.h+25))continue;
      c.save();c.translate(x,y);if(!horizontal)c.rotate(Math.PI/2);
      c.fillStyle=night?'#152a36':'#34454f';c.fillRect(0,-6,24,9);
      c.strokeStyle=night?'#526373':'#869392';c.lineWidth=1;
      for(let i=3;i<23;i+=4){c.beginPath();c.moveTo(i,-4);c.lineTo(i,1);c.stroke();}
      // Sparse repaired pavement, never fine-grained noise.
      if(t%3){c.fillStyle=night?'#9baeb208':'#d3dedb0c';c.fillRect(36,28,52,34);}
      c.restore();
    }
  }
  c.restore();
}

export function facadeFinish(pack){
  const windows=new Map();
  function windowMask(id){
    if(windows.has(id))return windows.get(id);
    const sprite=pack.atlas.sprites[id],[sx,sy,sw,sh]=sprite.rect;
    const canvas=document.createElement('canvas');canvas.width=sw;canvas.height=sh;
    const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(pack.images[sprite.sheet],sx,sy,sw,sh,0,0,sw,sh);
    const pixels=c.getImageData(0,0,sw,sh),d=pixels.data;
    // Runtime emissive material: only upper-floor teal window panes emit light.
    // Garages, graffiti, posters and the original source artwork stay untouched.
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
      const i=(y*sw+x)*4,r=d[i],g=d[i+1],b=d[i+2];
      const lit=y>sh*.23&&y<sh*.65&&g>r*1.24&&b>r*1.16&&g>65&&g<205&&Math.abs(g-b)<65;
      d[i]=255;d[i+1]=192;d[i+2]=107;d[i+3]=lit?Math.round(d[i+3]*.68):0;
    }
    c.putImageData(pixels,0,0);windows.set(id,canvas);return canvas;
  }
  return function(c,s,b,art,p){
    const rect=pack.atlas.sprites[art.id].rect,scale=art.width/rect[2],seed=hash(b.id),night=s.life.night;
    c.save();c.translate(Math.round(p.x)-art.width*art.anchor[0],Math.round(p.y)-rect[3]*scale*art.anchor[1]);c.scale(scale,scale);
    if(night){const glow=windowMask(art.id);c.save();c.globalCompositeOperation='screen';c.shadowColor='#ffbd72';c.shadowBlur=7;c.drawImage(glow,0,0);c.restore();}
    if(seed%3===0||b.nanoVariant>=3||b.poster){c.restore();return;}
    const [x,y,width]=art.mural,w=Math.min(116,width*.83),h=21;
    c.translate(x+5,y-55);c.transform(1,art.slope,0,1,0,0);
    const names=['Пластинки','Кофе / 24','Мастерская','Mini Mart','Ателье'];
    const colors=[ART.teal,ART.coral,ART.ink];
    c.fillStyle='#07121d38';c.fillRect(3,4,w,h);c.fillStyle=colors[seed%3];c.strokeStyle=ART.ink;c.lineWidth=1.4;c.fillRect(0,0,w,h);c.strokeRect(0,0,w,h);
    c.fillStyle=ART.paper;c.font='700 10px "Street Condensed",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(names[seed%5],w/2,h/2,w-9);
    c.fillStyle=night?'#ffdc9b':'#f6eac0';c.fillRect(5,-3,w-10,2);
    if(night){c.globalCompositeOperation='screen';c.globalAlpha*=.15;c.fillStyle='#ffbf70';c.fillRect(-3,-5,w+6,h+9);}
    c.restore();
  };
}

export function sceneGrade(c,w,h,night){
  c.save();
  c.fillStyle=night?'#10213c30':'#ffe6b306';c.fillRect(0,0,w,h);
  const vignette=c.createRadialGradient(w*.5,h*.48,Math.min(w,h)*.26,w*.5,h*.48,Math.max(w,h)*.77);
  vignette.addColorStop(0,'#14293900');vignette.addColorStop(1,night?'#0717254a':'#19303c14');
  c.fillStyle=vignette;c.fillRect(0,0,w,h);c.restore();
}
