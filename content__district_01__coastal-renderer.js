import {project} from './core__geometry.js';
import {polygon} from './content__district_01__terrain.js';
export function createCoastalTextures(plate,sand,water,street,soft){
  const make=(image,x,y,w,h,size,tone)=>{const tile=document.createElement('canvas');tile.width=tile.height=size;const c=tile.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(image,x,y,w,h,0,0,size,size);if(tone){c.fillStyle=tone;c.fillRect(0,0,size,size);}return c.createPattern(tile,'repeat');};
  return {water:water?make(water,0,0,water.width,water.height,512):null,sand:soft?make(soft,636,8,610,610,320):sand?make(sand,0,0,sand.width,sand.height,440):'#d8bf8a',paving:make(plate,450,90,200,170,170),grass:soft?make(soft,8,8,610,610,250):make(plate,660,540,100,100,150),asphalt:street?make(street,8,8,610,610,180,'#343938b8'):'#343735',rock:street?make(street,636,636,610,610,300):'#555650'};
}

export function drawCoastalGround(c,w,textures){
  if(!w.beaches)return;
  c.save();c.transform(1,.5,-1,.5,0,0);
  c.beginPath();for(const poly of w.landPolygons){poly.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();}c.clip();
  c.fillStyle=textures.grass;c.fillRect(0,0,w.width,w.height);
  // A feathered, irregular dune edge blends the two actual materials.
  const sandPatch=poly=>{
    const edge=[];
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),steps=Math.ceil(len/24);
      for(let j=0;j<steps;j++){const t=j/steps,x=a.x+dx*t,y=a.y+dy*t,n=(Math.sin(x*.031+y*.019)*9+Math.sin(x*.083-y*.051)*4)*Math.sin(Math.PI*t);edge.push({x:x-dy/len*n,y:y+dx/len*n});}
    }
    c.save();c.lineJoin='round';
    for(let width=144;width>=12;width-=12){c.globalAlpha=.18;polygon(c,edge,null,textures.sand,width);}
    c.globalAlpha=1;polygon(c,edge,textures.sand);c.restore();
  };
  sandPatch([{x:-100,y:5830},{x:w.width+100,y:5830},{x:w.width+100,y:w.height+100},{x:-100,y:w.height+100}]);
  for(const poly of w.beaches)sandPatch(poly);
  if(w.skateApron){const a=w.skateApron;c.fillStyle=textures.paving;c.fillRect(a.x,a.y,a.w,a.h);c.strokeStyle='#aaa18b';c.lineWidth=3;c.strokeRect(a.x,a.y,a.w,a.h);}
  for(let y=5250;y<7000;y+=39)for(let x=100;x<6800;x+=47){const n=Math.sin(x*31+y*7);c.fillStyle=n>.25?'#f3dfaa55':'#525c4b22';c.fillRect(x+n*11,y+n*18,5,2);}
  // Street-to-promenade entrances and a broad paved walk along both beaches.
  const stroke=(path,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.beginPath();path.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();};
  for(const [x,y] of [[896,5680],[2460,5680],[4096,5790],[5180,6100]]){
    const path=[{x,y:5200},{x,y}];stroke(path,'#555a57',92);stroke(path,textures.paving,68);
  }
  for(const path of w.promenades){
    stroke(path,'#686b63',132);stroke(path,textures.paving,116);
    c.lineCap='butt';c.lineWidth=1.5;c.strokeStyle='#918d7c';
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],len=Math.hypot(b.x-a.x,b.y-a.y),dx=(b.x-a.x)/len,dy=(b.y-a.y)/len;
      for(let n=0;n<len;n+=28){const x=a.x+dx*n,y=a.y+dy*n;c.beginPath();c.moveTo(x-dy*56,y+dx*56);c.lineTo(x+dy*56,y-dx*56);c.stroke();}
    }
    stroke(path,'#ded2b6',2);
  }
  c.restore();
}

export function drawMountains(c,w,atlas,textures,cam,width,height){
  if(w.mountains?.length){
    // The northern mainland continues beyond the playable coast; no ocean behind the ridge.
    const mainland=[{x:-9000,y:-9000},{x:14000,y:-9000},{x:6800,y:-350},{x:6400,y:70},{x:48,y:70},{x:48,y:2400},{x:-9000,y:7000}];
    c.save();polygon(c,mainland.map(p=>project(p.x,p.y)),null);c.clip();
    c.save();c.transform(1,.5,-1,.5,0,0);
    polygon(c,mainland,textures.rock);
    c.restore();
    const visible=p=>!cam||(Math.abs(p.x-cam.x)<width/2/cam.zoom+1600&&p.y>cam.y-height/2/cam.zoom-200&&p.y<cam.y+height/2/cam.zoom+1100);
    for(let row=7;row>=0;row--)for(let col=-6;col<16;col++){
      const x=col*650+row%2*320,y=-50-row*300,p=project(x,y);
      if(visible(p))atlas.draw(c,'mountain_ridge',p.x,p.y,1750,null,(col+row)%2===0);
    }
    c.restore();
  }
  for(const m of w.mountains??[]){const p=project(m.x,m.y);atlas.draw(c,'mountain_ridge',p.x,p.y,m.width,null,m.flip);}
}

export function drawBeachUmbrella(c,o,atlas){
  if(atlas){const p=project(o.x,o.y);c.fillStyle='#3d4a4433';c.beginPath();c.ellipse(p.x+8,p.y+2,34,13,0,0,Math.PI*2);c.fill();atlas.draw(c,o.color==='#66c6ce'?'umbrella_teal':'umbrella_coral',p.x,p.y,94);return;}
  const p=project(o.x,o.y);c.fillStyle='#343d3a44';c.beginPath();c.ellipse(p.x+14,p.y+5,30,12,0,0,Math.PI*2);c.fill();
  c.fillStyle='#eee0b7';c.fillRect(p.x+20,p.y-2,26,9);c.strokeStyle='#725c40';c.lineWidth=3;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x,p.y-42);c.stroke();
  const points=Array.from({length:8},(_,i)=>({x:p.x+Math.cos(i*Math.PI/4)*30,y:p.y-43+Math.sin(i*Math.PI/4)*15}));
  for(let i=0;i<8;i++)polygon(c,[{x:p.x,y:p.y-51},points[i],points[(i+1)%8]],i%2?'#eee0bc':o.color,'#3e4c4c',1);
}
