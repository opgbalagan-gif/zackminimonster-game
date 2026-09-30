// One generated square ground image, fitted once to the existing world coordinates.
// Matching the measured asphalt boundaries keeps traffic, kerbs and physics aligned.
export function createGroundPlate(image,world){
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1408;
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const sx=[0,230,310,640,715,990,1068,1254].map(x=>x*image.width/1254);
  const sy=[0,309,400,699,790,1097,1187,1254].map(y=>y*image.height/1254);
  const dx=[0,288,400,832,960,1312,1424,1600];
  const dy=[0,320,448,768,880,1184,1296,1408];
  for(let y=0;y<7;y++)for(let x=0;x<7;x++)c.drawImage(image,sx[x],sy[y],sx[x+1]-sx[x],sy[y+1]-sy[y],dx[x],dy[y],dx[x+1]-dx[x],dy[y+1]-dy[y]);
  return canvas;
}

