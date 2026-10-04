import {inside,distance} from './core__geometry.js?v=5e1de61c4ab4';
import {onLand} from './core__land.js?v=5e1de61c4ab4';
export class NavigationGrid{
  constructor(world,cell=24){
    this.world=world;this.cell=cell;this.cols=Math.ceil(world.width/cell);this.rows=Math.ceil(world.height/cell);
    this.blocked=new Uint8Array(this.cols*this.rows);this.road=new Uint8Array(this.cols*this.rows);
    this.propObstacles=(world.props??[]).filter(p=>p.collision).map(p=>({
      x:p.x+p.collision.x,y:p.y+p.collision.y,w:p.collision.w,h:p.collision.h
    }));
    this.obstacles=[...world.buildings,...world.obstacles,...this.propObstacles];
    for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
      const px=(x+.5)*cell,py=(y+.5)*cell,id=y*this.cols+x;
      this.blocked[id]=px<30||py<30||px>world.width-30||py>world.height-30||!onLand(world,px,py,10)||this.obstacles.some(r=>inside(px,py,r,10))?1:0;
      this.road[id]=world.roads.some(r=>inside(px,py,r,-12))?1:0;
    }
  }
  point(id){return{x:(id%this.cols+.5)*this.cell,y:(Math.floor(id/this.cols)+.5)*this.cell};}
  valid(id,car=false){return id>=0&&id<this.blocked.length&&!this.blocked[id]&&(!car||this.road[id])&&(!this.access||this.access(this.point(id).x,this.point(id).y));}
  canWalk(x,y,radius=9){return x>24&&y>24&&x<this.world.width-24&&y<this.world.height-24&&onLand(this.world,x,y,radius)&&(!this.access||this.access(x,y))&&!this.obstacles.some(r=>inside(x,y,r,radius));}
  propSegmentClear(a,b,radius=9){
    return !this.propObstacles.some(r=>{
      let enter=0,exit=1;
      for(const [axis,size] of [['x','w'],['y','h']]){
        const low=r[axis]-radius,high=r[axis]+r[size]+radius,delta=b[axis]-a[axis];
        if(Math.abs(delta)<1e-8){if(a[axis]<low||a[axis]>high)return false;continue;}
        const t1=(low-a[axis])/delta,t2=(high-a[axis])/delta;
        enter=Math.max(enter,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));
        if(enter>exit)return false;
      }
      return true;
    });
  }
  closest(point,car=false,connect=false){
    const cx=Math.floor(point.x/this.cell),cy=Math.floor(point.y/this.cell);
    for(let ring=0;ring<12;ring++){
      const choices=[];
      for(let dy=-ring;dy<=ring;dy++)for(let dx=-ring;dx<=ring;dx++){
        if(Math.abs(dx)!==ring&&Math.abs(dy)!==ring)continue;
        const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=this.cols||y>=this.rows)continue;
        const id=y*this.cols+x;if(this.valid(id,car)&&(!connect||this.propSegmentClear(point,this.point(id))))choices.push(id);
      }
      if(choices.length)return choices.sort((a,b)=>distance(this.point(a),point)-distance(this.point(b),point))[0];
    }return -1;
  }
  lineOfSight(a,b){
    const steps=Math.ceil(distance(a,b)/12);
    for(let i=1;i<steps;i++){const t=i/steps;if(this.obstacles.some(r=>inside(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,r)))return false;}
    return true;
  }
  path(from,to,car=false){
    const start=this.closest(from,car,true),end=this.closest(to,car);if(start<0||end<0)return[];
    if(start===end)return[this.point(end)];
    const open=[],closed=new Set(),parent=new Map(),score=new Map([[start,0]]);
    const h=id=>distance(this.point(id),this.point(end))/this.cell;
    const push=(id,f)=>{let i=open.length;open.push({id,f});while(i){const p=(i-1)>>1;if(open[p].f<=f)break;open[i]=open[p];i=p;}open[i]={id,f};};
    const pop=()=>{const head=open[0],last=open.pop();if(open.length){let i=0;while(i*2+1<open.length){let child=i*2+1;if(child+1<open.length&&open[child+1].f<open[child].f)child++;if(open[child].f>=last.f)break;open[i]=open[child];i=child;}open[i]=last;}return head.id;};
    push(start,h(start));
    for(let iteration=0;open.length&&iteration<this.blocked.length*2;iteration++){
      const current=pop();if(closed.has(current))continue;
      if(current===end){const result=[];let node=end;while(node!==start){result.push(this.point(node));node=parent.get(node);}result.push(this.point(start));return result.reverse();}
      closed.add(current);const x=current%this.cols,y=Math.floor(current/this.cols);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;
        const nx=x+dx,ny=y+dy,next=ny*this.cols+nx;
        if(nx<0||ny<0||nx>=this.cols||ny>=this.rows||!this.valid(next,car)||closed.has(next))continue;
        if(dx&&dy&&(!this.valid(y*this.cols+nx,car)||!this.valid(ny*this.cols+x,car)))continue;
        if(!this.propSegmentClear(this.point(current),this.point(next)))continue;
        const cost=score.get(current)+(dx&&dy?1.414:1);
        if(!score.has(next)||cost<score.get(next)){score.set(next,cost);parent.set(next,current);push(next,cost+h(next));}
      }
    }return[];
  }
}
