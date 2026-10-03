import {clamp} from './core__geometry.js?v=0bee4946821b';

// Measured on camera-alley-wide.png (1536 × 1024): bare plaster below
// the fire escape, clear of the pipe, dumpster, crates and foreground bollard.
export const CAMERA_MURAL={x:700,y:438,width:220,height:148,rise:-34};
const muralCentre={x:(CAMERA_MURAL.x+CAMERA_MURAL.width/2)/1536,y:(CAMERA_MURAL.y+(CAMERA_MURAL.height+CAMERA_MURAL.rise)/2)/1024};

// Cover the viewport at every tilt, keeping the mural centred at neutral aim.
// Clamp image coordinates, not just input: portrait and landscape have different margins.
export function cameraFrame(w,h,imageWidth,imageHeight,x=0,y=0){
  const scale=Math.max(w/imageWidth,h/imageHeight)*1.18;
  const iw=imageWidth*scale,ih=imageHeight*scale;
  const ox=clamp(w*.5-iw*muralCentre.x+x*w*.28,w-iw,0);
  const oy=clamp(h*.5-ih*muralCentre.y+y*h*.2,h-ih,0);
  return {x:ox,y:oy,w:iw,h:ih};
}
