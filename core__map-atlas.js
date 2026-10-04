// Illustrated aerial atlas built from the same world geometry as navigation.
export function drawMapAtlas(c,s,t,width,height){
  const point=t.point,k=t.scale,b=s.world.mapBounds;
  const bg=c.createLinearGradient(0,0,width,height);bg.addColorStop(0,'#427f67');bg.addColorStop(1,'#275b58');c.fillStyle=bg;c.fillRect(0,0,width,height);
  const rect=(r,color,pad=0)=>{const p=point(r);c.fillStyle=color;c.fillRect(p.x-pad,p.y-pad,r.w*k+pad*2,r.h*k+pad*2);};
  const line=(x,y,xx,yy,color,w=1)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
  rect(b,'#a3b982');
  // Quiet block interiors, paved aprons and long shadows give streets physical scale.
  for(const r of s.world.parks)rect(r,'#6dae68');
  for(const r of s.world.paths){rect(r,'#507864',1);rect(r,'#e3d1a3');}
  for(const r of s.world.water){
    rect(r,'#e1d3ae',3);rect(r,'#284d62');const p=point(r),rw=r.w*k,rh=r.h*k;
    c.save();c.beginPath();c.rect(p.x,p.y,rw,rh);c.clip();
    const water=c.createLinearGradient(p.x,0,p.x+rw,0);water.addColorStop(0,'#187c9c');water.addColorStop(.5,'#27bdd0');water.addColorStop(1,'#168faf');c.fillStyle=water;c.fillRect(p.x,p.y,rw,rh);
    for(let y=p.y+10;y<p.y+rh;y+=15)for(let x=p.x+4;x<p.x+rw-4;x+=19)line(x,y+Math.sin(x)*3,x+7,y+Math.sin(x)*3,'#c4fbdf66');c.restore();
    line(p.x+2,p.y,p.x+2,p.y+rh,'#e7f5d9aa',1);
  }
  for(const r of s.world.roads){rect(r,'#314d55',3);rect(r,'#d9d6b2',1.4);rect(r,'#526b7c');}
  for(const r of s.world.roads){const p=point(r),horizontal=r.w>r.h;c.setLineDash([Math.max(3,36*k),Math.max(5,52*k)]);line(p.x+(horizontal?0:r.w*k/2),p.y+(horizontal?r.h*k/2:0),p.x+r.w*k-(horizontal?0:r.w*k/2),p.y+r.h*k-(horizontal?r.h*k/2:0),'#f6d781bb',1);c.setLineDash([]);}
  for(const r of s.world.bridges){rect(r,'#233d49',3);rect(r,'#ded0a0');const p=point(r);line(p.x,p.y+2,p.x+r.w*k,p.y+2,'#e2dac5');line(p.x,p.y+r.h*k-2,p.x+r.w*k,p.y+r.h*k-2,'#40575c');}
  // Every rooftop belongs to an actual building, with its real footprint.
  for(const [i,r] of [...s.world.buildings].sort((a,b)=>a.y-b.y).entries()){
    const p=point(r),w=r.w*k,h=r.h*k,lift=Math.max(2,Math.min(8,(r.nanoVariant===3?42:24)*k));
    if(p.x+w<0||p.x>width||p.y+h<0||p.y-lift>height)continue;
    rect({...r,x:r.x-18,y:r.y-18,w:r.w+36,h:r.h+36},'#bec6a0');
    c.fillStyle='#162e3d66';c.beginPath();c.moveTo(p.x,p.y+h);c.lineTo(p.x+w,p.y+h);c.lineTo(p.x+w+lift*2,p.y+h+lift*2);c.lineTo(p.x+lift,p.y+h+lift*2);c.fill();
    c.fillStyle='#536b70';c.fillRect(p.x,p.y-lift,w,h+lift);
    c.fillStyle=['#f0c17e','#76c9c2','#e8a28b','#b1ccdf'][i%4];c.fillRect(p.x,p.y-lift,w,h);
    c.strokeStyle='#fff0c8bb';c.lineWidth=1;c.strokeRect(p.x+.5,p.y-lift+.5,w-1,h-1);
    if(w>12&&h>12){
      c.strokeStyle='#536b7066';c.strokeRect(p.x+2,p.y-lift+2,w-4,h-4);
      if(i%5===1){c.fillStyle='#539561';c.fillRect(p.x+w*.27,p.y-lift+h*.22,w*.46,h*.56);c.fillStyle='#b2ca87';c.fillRect(p.x+w*.27,p.y-lift+h*.22,w*.46,2);}
      else if(i%3===0){line(p.x+w*.5,p.y-lift+2,p.x+w*.5,p.y-lift+h-2,'#758789',1);for(let yy=p.y-lift+5;yy<p.y+h-lift-3;yy+=5)line(p.x+3,yy,p.x+w-3,yy,'#82949044',1);}
      else{c.fillStyle='#66888b';c.fillRect(p.x+w*.2,p.y-lift+h*.24,w*.17,h*.16);c.fillRect(p.x+w*.6,p.y-lift+h*.24,w*.17,h*.16);c.fillStyle='#d7dec9';c.fillRect(p.x+w*.2,p.y-lift+h*.24,w*.17,1);}
    }
    if(w>27){for(let x=p.x+4;x<p.x+w-3;x+=6)c.fillRect(x,p.y+h-lift+1,2,1.5);}
  }
  const tree=(x,y,r)=>{
    c.fillStyle='#152f3c44';c.beginPath();c.ellipse(x+2,y+3,r*1.2,r*.85,0,0,Math.PI*2);c.fill();
    const tone=Math.sin(x*2+y)*.5+.5;
    for(let j=0;j<5;j++){const angle=j*2.4,xx=x+Math.cos(angle)*r*.38,yy=y+Math.sin(angle)*r*.32;c.fillStyle=j%2?'#529b63':tone>.5?'#87bb58':'#398466';c.beginPath();c.arc(xx,yy,r*(.58+j*.03),0,Math.PI*2);c.fill();}
  };
  for(const n of s.world.nature){const p=point(n);if(p.x<-10||p.y<-10||p.x>width+10||p.y>height+10)continue;if(n.id.includes('tree')||n.id.includes('palm'))tree(p.x,p.y,Math.max(1.8,26*k));else if(n.id.includes('tank')){c.fillStyle='#233d4966';c.beginPath();c.ellipse(p.x+3,p.y+5,48*k,48*k,0,0,Math.PI*2);c.fill();c.fillStyle='#d4e6d7';c.strokeStyle='#365561';c.beginPath();c.arc(p.x,p.y,48*k,0,Math.PI*2);c.fill();c.stroke();}}
  // Continue the woodland beyond the navigable boundary, avoiding a boxed map edge.
  const lo=t.world(-15,-15),hi=t.world(width+15,height+15);
  for(let y=Math.floor(lo.y/130)*130;y<hi.y;y+=130)for(let x=Math.floor(lo.x/130)*130;x<hi.x;x+=130){if(x>b.x-55&&x<b.x+b.w+55&&y>b.y-55&&y<b.y+b.h+55)continue;if(s.world.roads.some(r=>r.w>r.h?y>r.y-60&&y<r.y+r.h+60:x>r.x-60&&x<r.x+r.w+60))continue;const p=point({x:x+Math.sin(y*.27+x*.51)*70,y:y+Math.cos(x*.13+y*.31)*70});tree(p.x,p.y,Math.max(3,(82+Math.sin(x+y)*26)*k));}
  const court=s.world.court,p=point(court),cw=court.w*k,ch=court.h*k;rect(court,'#e79373',2);rect(court,'#38a492');c.strokeStyle='#ded8b4';c.lineWidth=1;c.strokeRect(p.x+2,p.y+2,cw-4,ch-4);line(p.x+cw/2,p.y+2,p.x+cw/2,p.y+ch-2,'#ded8b4');c.beginPath();c.arc(p.x+cw/2,p.y+ch/2,ch*.22,0,Math.PI*2);c.stroke();
  const rail=s.world.surfaceMetro,a=point({x:rail.activeStart-1000,y:rail.y}),z=point({x:rail.activeEnd+1000,y:rail.y});line(a.x,a.y+4,z.x,z.y+4,'#172f3c55',7);line(a.x,a.y,z.x,z.y,'#203e4a',5);line(a.x,a.y-1,z.x,z.y-1,'#c5c8ac',1);line(a.x,a.y+1,z.x,z.y+1,'#c5c8ac',1);
}
