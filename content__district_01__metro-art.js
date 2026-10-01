// Bitmap materials mapped to the same isometric geometry as the live track.
export function createMetroArt(image,regions={ballast:[6,6,612,612],concrete:[636,6,612,612],steel:[6,636,612,612],portal:[636,636,612,612]}){
  const parts={};
  for(const [name,rect] of Object.entries(regions)){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(image,...rect,0,0,256,256);parts[name]=canvas;
  }
  return {quad(c,material,p,shade=0){
    c.save();c.beginPath();p.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.closePath();c.clip();
    c.transform((p[1].x-p[0].x)/256,(p[1].y-p[0].y)/256,(p[3].x-p[0].x)/256,(p[3].y-p[0].y)/256,p[0].x,p[0].y);
    c.drawImage(parts[material],0,0);if(shade){c.fillStyle=`rgba(12,21,27,${shade})`;c.fillRect(0,0,256,256);}c.restore();
  }};
}
