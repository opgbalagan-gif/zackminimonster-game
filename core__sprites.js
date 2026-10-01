export class SpriteAtlas{
  constructor(metadata,images){this.metadata=metadata;this.images=images;this.drawCalls=0;}
  rect(id){return this.metadata.sprites[id]?.rect;}
  draw(c,id,x,y,width=null,height=null,flip=false,alpha=1){
    const sprite=this.metadata.sprites[id];if(!sprite)return;
    const [sx,sy,sw,sh]=sprite.rect;
    if(height===null)height=width*sh/sw;if(width===null)width=height*sw/sh;
    c.save();c.globalAlpha*=alpha;c.translate(Math.round(x),Math.round(y));if(flip)c.scale(-1,1);
    const anchor=sprite.groundAnchor??[.5,1];
    c.drawImage(this.images[sprite.sheet],sx,sy,sw,sh,Math.round(-width*anchor[0]),Math.round(-height*anchor[1]),Math.ceil(width),Math.ceil(height));c.restore();
    this.drawCalls++;
  }
}
