// Original tag compositions. The monster uses the generated character atlas.
export function drawGraffiti(c,id,x,y,w,h,atlas,color=null){
  if(id==='panda_king'){
    const rect=atlas.rect('graffiti_panda'),height=Math.min(h,w*rect[3]/rect[2]);
    if(color&&color!=='#cb73e5'&&color!=='#c879df'){
      atlas.graffitiTints??=new Map();
      if(!atlas.graffitiTints.has(color)){
        const sprite=atlas.metadata.sprites.graffiti_panda,layer=document.createElement('canvas');
        layer.width=512;layer.height=Math.round(512*rect[3]/rect[2]);
        const ctx=layer.getContext('2d',{willReadFrequently:true});ctx.drawImage(atlas.images[sprite.sheet],...rect,0,0,layer.width,layer.height);
        const pixels=ctx.getImageData(0,0,layer.width,layer.height),rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
        for(let i=0;i<pixels.data.length;i+=4){
          const [r,g,b]=pixels.data.slice(i,i+3);
          if(r>g*1.3&&b>g*1.3&&r>55&&b>65){const shade=Math.max(r,b)/235;for(let j=0;j<3;j++)pixels.data[i+j]=Math.min(255,rgb[j]*shade);}
        }
        ctx.putImageData(pixels,0,0);atlas.graffitiTints.set(color,layer);
      }
      const width=height*rect[2]/rect[3];c.drawImage(atlas.graffitiTints.get(color),x+(w-width)/2,y+(h-height)/2,width,height);
    }else atlas.draw(c,'graffiti_panda',x+w/2,y+(h+height)/2,null,height);
    return;
  }
  c.save();c.translate(x,y);c.scale(w/480,h/260);
  const purple=color??'#cb73e5',gold=color??'#edc853',ink='#15131e',cream='#f1e4bb';
  c.lineJoin='miter';c.textAlign='center';c.textBaseline='middle';
  if(id==='monster'){
    c.fillStyle=ink;c.beginPath();c.ellipse(244,134,206,108,-.1,0,Math.PI*2);c.fill();
    c.strokeStyle=cream;c.lineWidth=7;c.stroke();
    atlas.draw(c,'companion',148,244,null,226);
    c.save();c.translate(320,118);c.rotate(-.1);c.font='900 italic 77px Impact, sans-serif';c.lineWidth=10;c.strokeStyle=ink;c.strokeText('MINI',0,0);c.fillStyle=purple;c.fillText('MINI',0,0);
    c.font='900 italic 42px Impact, sans-serif';c.fillStyle=cream;c.fillText('MONSTER',0,62);c.restore();
  }else{
    c.fillStyle=ink;c.beginPath();c.moveTo(22,84);c.lineTo(435,50);c.lineTo(461,196);c.lineTo(28,225);c.closePath();c.fill();
    c.strokeStyle=id==='crown'?gold:cream;c.lineWidth=6;c.stroke();
    c.save();c.translate(235,146);c.rotate(-.09);c.font='900 italic 138px Impact, sans-serif';
    c.lineWidth=14;c.strokeStyle=ink;c.strokeText('ZACK',0,0);c.fillStyle=id==='crown'?gold:purple;c.fillText('ZACK',0,0);
    c.font='bold 23px monospace';c.fillStyle=cream;c.fillText('E A S T  B L O C K',3,62);c.restore();
    c.fillStyle=id==='crown'?gold:purple;c.strokeStyle=ink;c.lineWidth=6;
    c.beginPath();c.moveTo(191,65);c.lineTo(180,20);c.lineTo(215,38);c.lineTo(240,4);c.lineTo(263,33);c.lineTo(301,12);c.lineTo(288,62);c.closePath();c.fill();c.stroke();
  }
  c.restore();
}
