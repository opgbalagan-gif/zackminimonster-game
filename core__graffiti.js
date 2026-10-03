import {clamp} from './core__geometry.js?v=4c2aa9d50742';
import {GRAFFITI_CONFIG as CONFIG} from './content__graffiti__config.js?v=4c2aa9d50742';
export class GraffitiGame{
  constructor(target,definition,sprayRack=false){
    this.target=target;this.definition=definition;this.phase='shake';this.shakeProgress=0;
    this.lastPoint=null;this.shakeTravel=0;this.canOffset=0;this.cols=CONFIG.coverage.cols;this.rows=CONFIG.coverage.rows;
    this.valid=new Uint8Array(this.cols*this.rows).fill(1);this.covered=new Uint8Array(this.valid.length);
    this.required=definition.required_progress??CONFIG.coverage.required;this.sprayRack=sprayRack;this.resultTime=0;
    this.stencilOffset={x:0,y:0};this.strokeCount=0;
  }
  setMask(alpha,width,height){
    this.valid.fill(0);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      if(alpha[(y*width+x)*4+3]>80){
        const col=Math.min(this.cols-1,Math.floor(x/width*this.cols));
        const row=Math.min(this.rows-1,Math.floor(y/height*this.rows));
        this.valid[row*this.cols+col]=1;
      }
    }
    if(!this.valid.some(Boolean))this.valid.fill(1);
  }
  move(x,y,down=true){
    if(!down||this.phase==='result'||!Number.isFinite(x)||!Number.isFinite(y))return;
    const point={x,y};
    if(this.phase==='shake'){
      if(this.lastPoint){
        const travel=Math.hypot(x-this.lastPoint.x,y-this.lastPoint.y);
        this.shakeTravel+=Math.min(travel,.5);this.canOffset=clamp((x-this.lastPoint.x)*90,-22,22);
        this.shakeProgress=clamp(this.shakeTravel/CONFIG.shakeTravel,0,1);
        if(this.shakeProgress>=1){this.phase='stencil';this.lastPoint=null;return;}
      }
    }else if(this.phase==='stencil'){
      this.stencilOffset={x:clamp((x-.5)*22,-12,12),y:clamp((y-.5)*16,-8,8)};
    }else if(this.phase==='spray'){
      const start=this.lastPoint??point;
      const steps=Math.min(256,Math.max(1,Math.ceil(Math.hypot(x-start.x,y-start.y)*128)));
      for(let i=0;i<=steps;i++)this.spray(start.x+(x-start.x)*i/steps,start.y+(y-start.y)*i/steps);
      this.strokeCount++;
      if(this.coverage>=this.required)this.phase='result';
    }
    this.lastPoint=point;
  }
  spray(x,y){
    const radius=this.sprayRack?CONFIG.coverage.upgradedRadius:CONFIG.coverage.radius,cx=x*this.cols,cy=y*this.rows;
    for(let row=Math.floor(cy-radius);row<=Math.ceil(cy+radius);row++){
      for(let col=Math.floor(cx-radius);col<=Math.ceil(cx+radius);col++){
        if(col<0||row<0||col>=this.cols||row>=this.rows||Math.hypot(col+.5-cx,row+.5-cy)>radius)continue;
        const id=row*this.cols+col;if(this.valid[id])this.covered[id]=1;
      }
    }
  }
  end(){this.lastPoint=null;this.canOffset=0;}
  shakeDevice(amount){
    if(this.phase!=='shake'||!Number.isFinite(amount)||amount<=0)return;
    this.shakeProgress=clamp(this.shakeProgress+Math.min(.18,amount),0,1);
    this.shakeTravel=this.shakeProgress*CONFIG.shakeTravel;
    this.canOffset=this.canOffset>0?-20:20;
    if(this.shakeProgress>=1){this.phase='stencil';this.lastPoint=null;this.canOffset=0;}
  }
  confirm(){if(this.phase==='stencil'){this.phase='spray';this.lastPoint=null;}}
  get coverage(){let total=0,filled=0;for(let i=0;i<this.valid.length;i++)if(this.valid[i]){total++;filled+=this.covered[i];}return total?filled/total:0;}
  get done(){return this.phase==='result';}
}
