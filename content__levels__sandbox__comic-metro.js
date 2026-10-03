import {project} from './core__geometry.js?v=715810e652df';
import {polygon} from './content__district_01__terrain.js?v=715810e652df';

const INK='#263f48';
// Drawn in the track coordinate system: no stretched bitmap or baked perspective.
export function comicTrain(c,car,m,night=false){
  const dx=car.dx??1,dy=car.dy??0;
  const p=(u,v,z)=>project(car.x+dx*u-dy*v,car.y+dy*u+dx*v,m.height+5+z);
  const solid=(u,v,w,d,base,top,colors)=>{
    const corners=[[u,v],[u+w,v],[u+w,v+d],[u,v+d]];
    const faces=corners.map((a,i)=>({a,b:corners[(i+1)%4]})).sort((a,b)=>(dx+dy)*(a.a[0]+a.b[0]-b.a[0]-b.b[0])+(dx-dy)*(a.a[1]+a.b[1]-b.a[1]-b.b[1]));
    for(const {a,b} of faces)polygon(c,[p(...a,base),p(...b,base),p(...b,top),p(...a,top)],a[1]===b[1]?colors[1]:colors[2],INK,1.2);
    polygon(c,corners.map(a=>p(...a,top)),colors[0],INK,1.2);
  };
  c.save();c.lineJoin='round';c.lineCap='round';
  solid(-67,-7,136,14,-1,5,['#657375','#243d45','#3f535a']);
  for(const u of [-44,35])solid(u,-21,17,42,0,9,['#45585e','#203540','#304750']);
  solid(-64,-23,128,46,8,43,['#dedccd','#68949c','#91afb0']);
  const corners=[[-64,-23],[64,-23],[64,23],[-64,23]];
  const faces=corners.map((a,i)=>({a,b:corners[(i+1)%4]})).sort((a,b)=>(dx+dy)*(a.a[0]+a.b[0]-b.a[0]-b.b[0])+(dx-dy)*(a.a[1]+a.b[1]-b.a[1]-b.b[1]));
  for(const {a,b} of faces){
    const q=(t0,t1,z0,z1)=>{const at=(t,z)=>p(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,z);return[at(t0,z0),at(t1,z0),at(t1,z1),at(t0,z1)];};
    const long=a[1]===b[1],near=(long?a[1]:a[0])>0;
    polygon(c,q(0,1,18,41),near?'#e5e0cc':'#bcc9c1');
    polygon(c,q(0,1,14,18),'#d8b974');
    if(long){
      for(const [a,b] of [[.06,.20],[.24,.38],[.63,.77],[.81,.95]]){
        polygon(c,q(a,b,24,37),night?'#ddc687':'#264b60',INK,1.2);
        polygon(c,q(a+.012,a+.036,26,35),night?'#f2dfa5':'#81adb7');
      }
      polygon(c,q(.425,.585,9,39),near?'#cad8cf':'#94b2b2',INK,1);
      for(const [a,b] of [[.44,.49],[.52,.57]])polygon(c,q(a,b,24,36),night?'#dfc990':'#315970',INK,.8);
      polygon(c,q(.503,.51,10,38),INK);
      polygon(c,q(.475,.49,19,21),INK);polygon(c,q(.52,.535,19,21),INK);
    }else{
      const front=car.front&&a[0]===64;
      polygon(c,q(.1,.9,25,38),night?'#c5bb8d':'#2b4b61',INK,1.4);
      polygon(c,q(.48,.51,25,38),INK);
      if(front){
        for(const t of [.13,.76])polygon(c,q(t,t+.11,11,15),'#f8e7b4',INK,.8);
        polygon(c,q(.3,.7,18,21),'#314f5a');
      }else for(const t of [.12,.81])polygon(c,q(t,t+.07,12,15),'#b96759',INK,.7);
    }
  }
  // A shallow bevel makes the roof read as metal with a few broad cel-shaded planes.
  polygon(c,[p(-64,-23,43),p(64,-23,43),p(61,-19,47),p(-61,-19,47)],'#ced5cb',INK,1);
  polygon(c,[p(64,-23,43),p(64,23,43),p(61,19,47),p(61,-19,47)],'#b6c4bf',INK,1);
  polygon(c,[p(64,23,43),p(-64,23,43),p(-61,19,47),p(61,19,47)],'#a8bbb8',INK,1);
  polygon(c,[p(-61,-19,47),p(61,-19,47),p(61,19,47),p(-61,19,47)],'#e9e5d5',INK,1.2);
  for(const u of [-40,20]){
    solid(u,-11,24,22,47,51,['#b9cac7','#6e9094','#88a5a6']);
    for(let x=u+5;x<u+22;x+=5){const a=p(x,-7,51.3),b=p(x,7,51.3);c.strokeStyle='#789599';c.lineWidth=.8;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  }
  c.restore();
}
