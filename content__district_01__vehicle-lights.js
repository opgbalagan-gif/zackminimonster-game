// Lens locations in the cropped illustrated atlas, before its projection shear.
const LENSES={
  traffic_coupe:[[.65,.70],[.91,.62]],
  traffic_hatch:[[.63,.71],[.90,.64]],
  traffic_minivan:[[.59,.68],[.88,.60]],
  traffic_police:[[.62,.65],[.91,.57]],
  traffic_lowrider:[[.71,.81],[.95,.73]],
  traffic_executive:[[.67,.70],[.95,.61]]
};
export function vehicleLenses(c,atlas,type,direction,width){
  if(direction==='nw'||direction==='ne')return;
  const sprite=atlas.metadata.sprites[type+'_'+direction],r=sprite.rect,height=width*r[3]/r[2],anchor=sprite.groundAnchor??[.5,1];
  c.save();c.filter='none';if(sprite.flip)c.scale(-1,1);c.globalCompositeOperation='screen';
  for(const [u,v] of LENSES[type]??LENSES.traffic_coupe){
    const x=(u-anchor[0])*width,y=(v-anchor[1])*height;
    const g=c.createRadialGradient(x,y,0,x,y,8);g.addColorStop(0,'#fffbd8db');g.addColorStop(.28,'#ffe8a98c');g.addColorStop(1,'#ffe8a900');
    c.fillStyle=g;c.fillRect(x-8,y-8,16,16);c.fillStyle='#fffbd9';c.beginPath();c.ellipse(x,y,2.9,1.7,-.2,0,Math.PI*2);c.fill();
  }
  c.restore();
}
