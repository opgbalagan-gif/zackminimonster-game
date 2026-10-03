import {project} from './core__geometry.js?v=0eb11640c641';
import {polygon,box} from './content__district_01__terrain.js?v=0eb11640c641';
import {createMetroArt} from './content__district_01__metro-art.js?v=0eb11640c641';

// Art dimensions are in world units. Anchors sit on the ground, never on a walk lane.
export const STREET_PROPS=[
  {id:'lamp',x:98,y:374,w:44},{id:'lamp',x:607,y:379,w:44},
  {id:'bench',x:154,y:362,w:91},{id:'hydrant',x:346,y:397,w:29},
  {id:'dumpster',x:356,y:223,w:96},{id:'crates',x:384,y:245,w:46},
  {id:'planter',x:585,y:282,w:62},{id:'planter',x:100,y:285,w:55},
];
const quad=(x,y,w,h,z=0)=>[project(x,y,z),project(x+w,y,z),project(x+w,y+h,z),project(x,y+h,z)];
export function createStreetKit(images){
  const material=createMetroArt(images.materials,{asphalt:[8,8,610,610],paving:[636,8,610,610],wall:[8,636,610,610],metal:[636,636,610,610]});
  function floor(c,{night=true}={}){
    box(c,72,92,560,460,0,'#504d43','#1c2a32','#29323a',-22);
    // One continuous sidewalk material, clipped to the level platform.
    c.save();polygon(c,quad(72,92,560,460),'#625d51');c.clip();
    for(let x=72;x<632;x+=180)for(let y=92;y<552;y+=180)material.quad(c,'paving',quad(x,y,180,180),.24);
    c.restore();
    material.quad(c,'asphalt',quad(76,412,552,112),.28);
    c.save();c.transform(1,.5,-1,.5,0,0);
    c.fillStyle='#0a151944';c.fillRect(76,412,552,112);
    c.strokeStyle='#aaa38b';c.lineWidth=5;c.strokeRect(76,410,552,116);
    c.strokeStyle='#d0b875';c.lineWidth=2;c.setLineDash([22,21]);c.beginPath();c.moveTo(105,468);c.lineTo(601,468);c.stroke();c.setLineDash([]);
    // Curb seams, low-key puddles, drains and painted crosswalk ends.
    c.strokeStyle='#444848';c.lineWidth=1;
    for(let x=80;x<626;x+=28){c.beginPath();c.moveTo(x,405);c.lineTo(x,414);c.moveTo(x,522);c.lineTo(x,530);c.stroke();}
    for(const [x,y,ww,hh] of [[191,436,74,12],[444,493,93,11],[560,443,48,9]]){
      c.fillStyle='#0b1921';c.fillRect(x,y,ww,hh);c.fillStyle=night?'#a9803a55':'#88a6b655';c.fillRect(x+8,y+2,ww*.6,2);c.fillStyle=night?'#dfb76788':'#aec9d588';c.fillRect(x+19,y+5,ww*.3,1);
    }
    for(const x of [82,609]){c.fillStyle='#c2b99e';for(let y=423;y<516;y+=15)c.fillRect(x,y,12,7);}
    for(const x of [243,549]){c.fillStyle='#192730';c.fillRect(x,414,22,8);c.fillStyle='#566063';for(let i=2;i<21;i+=4)c.fillRect(x+i,415,1,6);}
    c.fillStyle='#2c3639';c.strokeStyle='#727970';c.beginPath();c.ellipse(377,495,15,13,0,0,Math.PI*2);c.fill();c.stroke();
    for(let i=-8;i<10;i+=5){c.beginPath();c.moveTo(367,495+i);c.lineTo(387,495+i);c.stroke();}
    c.restore();
    for(const p of STREET_PROPS.filter(p=>night&&p.id==='lamp')){
      const q=project(p.x,p.y);c.save();c.translate(q.x,q.y);c.scale(1,.5);
      const glow=c.createRadialGradient(0,0,2,0,0,85);glow.addColorStop(0,'#e2a94344');glow.addColorStop(1,'#d49a3800');c.fillStyle=glow;c.fillRect(-85,-85,170,170);c.restore();
    }
  }
  function fence(c,x,y,length){
    const a=project(x,y),b=project(x+length,y),ta=project(x,y,58),tb=project(x+length,y,58);
    polygon(c,[a,b,tb,ta],'#233b3b22','#59685d',2);
    c.save();c.beginPath();[a,b,tb,ta].forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.clip();
    c.strokeStyle='#53605788';c.lineWidth=1;
    for(let i=-80;i<length+80;i+=12){c.beginPath();c.moveTo(a.x+i,a.y+i*.5);c.lineTo(a.x+i+48,a.y+i*.5-60);c.moveTo(a.x+i,a.y+i*.5);c.lineTo(a.x+i-48,a.y+i*.5-60);c.stroke();}c.restore();
    for(let dx=0;dx<=length;dx+=length/3){const p=project(x+dx,y);c.fillStyle='#273b40';c.fillRect(p.x-2,p.y-64,4,64);c.fillStyle='#9a9574';c.fillRect(p.x-2,p.y-65,4,3);}
  }
  function bollard(c,x,y){const p=project(x,y);c.fillStyle='#15222a';c.fillRect(p.x-4,p.y-30,8,30);c.fillStyle='#878877';c.fillRect(p.x-5,p.y-30,10,4);c.fillStyle='#40515a';c.fillRect(p.x-3,p.y-24,2,22);}
  return {material,floor,fence,bollard};
}
