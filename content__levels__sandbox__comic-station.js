import {project} from './core__geometry.js?v=5e1de61c4ab4';
import {polygon,box} from './content__district_01__terrain.js?v=5e1de61c4ab4';

const ink='#29424b';
function line(c,a,b,color=ink,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
export function comicStation(c,m,night=false){
  const x=m.station.x,y=m.y,h=m.height;
  const p=(u,v,z=0)=>project(x+u,y+v,h+z);
  const slab=(u,v,w,d,base,top,colors)=>box(c,x+u,y+v,w,d,h+top,...colors,h+base);
  c.save();c.lineJoin='round';c.lineCap='round';
  // Foundations and open steel stringers leave the street below visible.
  for(const u of [-88,88])for(const v of [-83,-45]){
    box(c,x+u-5,y+v-5,10,10,7,'#c6c7b7','#7d928b','#98aaa0');
    box(c,x+u-2,y+v-2,4,4,h-10,'#71918b','#304e57','#4d6c70',7);
  }
  slab(-104,-92,208,56,-12,-3,['#d3d5c5','#536f73','#78908b']);
  slab(-104,-92,208,56,-3,0,['#dedbcc','#698080','#91a49a']);
  for(let u=-100;u<100;u+=25)line(c,p(u,-90,.3),p(u,-38,.3),'#b1b7a9',.6);
  polygon(c,[p(-103,-42,1),p(103,-42,1),p(103,-37,1),p(-103,-37,1)],'#e7bc62');
  for(let u=-99;u<103;u+=9)line(c,p(u,-41,1.2),p(u,-38,1.2),'#bd984e',.7);
  // Street furniture, back railing and paired canopy supports.
  for(let u=-100;u<=100;u+=25)line(c,p(u,-91,0),p(u,-91,22),ink,1.5);
  for(const z of [11,22])line(c,p(-103,-91,z),p(103,-91,z),'#5e7c7d',1.5);
  for(const u of [-60,30]){
    slab(u,-82,30,10,7,10,['#b68b60','#765946','#947253']);
    for(const du of [3,26])line(c,p(u+du,-77,0),p(u+du,-77,8),ink,2);
    polygon(c,[p(u,-83,10),p(u+30,-83,10),p(u+30,-83,20),p(u,-83,20)],'#a47c55',ink,.8);
  }
  for(const u of [-88,88])for(const v of [-84,-46]){
    slab(u-2,v-2,4,4,0,55,['#92aca3','#35585d','#517779']);
    line(c,p(u,v,39),p(u+(u<0?12:-12),v,53),'#48696d',2);
  }
  // A shallow folded roof, thick fascia and sparse standing seams.
  const a=p(-112,-100,54),b=p(112,-100,54),d=p(-112,-66,62),e=p(112,-66,62),f=p(-112,-31,54),g=p(112,-31,54);
  polygon(c,[a,b,e,d],night?'#965f58':'#e3977c',ink,1.3);
  polygon(c,[d,e,g,f],night?'#794e4c':'#cb7967',ink,1.3);
  polygon(c,[f,g,p(112,-31,50),p(-112,-31,50)],'#435e61',ink,1);
  polygon(c,[b,g,p(112,-31,50),p(112,-100,50)],'#54787b',ink,1);
  for(let u=-94;u<110;u+=23){line(c,p(u,-99,54.4),p(u,-66,62.4),'#f1bba0',.7);line(c,p(u,-66,62.4),p(u,-32,54.4),'#dfa08a',.8);}
  line(c,d,e,'#f2c2a3',1.5);
  // Warm station lighting is limited to the sheltered platform at night.
  for(const u of [-64,64]){
    const q=p(u,-49,47);
    if(night){const glow=c.createRadialGradient(q.x,q.y,1,q.x,q.y,35);glow.addColorStop(0,'#ffda8b44');glow.addColorStop(1,'#ffda8b00');c.fillStyle=glow;c.fillRect(q.x-35,q.y-35,70,70);}
    line(c,p(u-7,-49,47),p(u+7,-49,47),night?'#ffe4a0':'#d4d5bd',2.5);
  }
  const sign=p(0,-32,40);
  c.fillStyle='#204b53';c.strokeStyle='#e6d6b3';c.lineWidth=1.5;
  c.beginPath();c.roundRect(sign.x-45,sign.y-11,90,22,4);c.fill();c.stroke();
  c.fillStyle='#e9bd6f';c.beginPath();c.arc(sign.x-33,sign.y,8,0,Math.PI*2);c.fill();
  c.fillStyle='#244c53';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText('М',sign.x-33,sign.y+4);
  c.fillStyle='#f2e6c8';c.font='bold 9px sans-serif';c.fillText('КВАРТАЛ',sign.x+10,sign.y+3);
  // Stairs follow the same footprint as before, now with connected stringers.
  const stair=(u,v,z)=>project(x+u,y+v,z);
  for(const v of [-132,-86]){
    polygon(c,[stair(100,v,150),stair(235,v,0),stair(235,v,8),stair(100,v,158)],'#46656b',ink,1.3);
  }
  for(let i=14;i>=0;i--){
    const z=(15-i)*10;
    box(c,x+100+i*9,y-132,9,46,z,'#d0d2c1','#48676c','#78938c',z-4);
    line(c,stair(100+i*9,-131,z+.4),stair(100+i*9,-87,z+.4),'#ede4c8',1);
  }
  // Landing joins the previously disconnected stair head to the platform.
  slab(90,-132,19,96,-5,0,['#cbd1bd','#48676d','#819b94']);
  for(const v of [-132,-86]){
    line(c,stair(100,v,174),stair(235,v,24),'#41636a',2.5);
    line(c,stair(100,v,161),stair(235,v,11),'#75908b',1.2);
    for(let i=0;i<=15;i+=3){const u=100+i*9,z=150-i*10;line(c,stair(u,v,z),stair(u,v,z+24),ink,1.8);}
  }
  c.restore();
}
