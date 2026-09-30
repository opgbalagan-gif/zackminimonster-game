import {NavigationGrid} from './core__navigation.js';
import {inside,moveAlongPath,project} from './core__geometry.js';

// Pedestrians use the same solid footprints as Zack, with the carriageway excluded.
export class CitizenSystem{
  constructor(world){
    this.nav=new NavigationGrid(world,16);this.people=[];
    for(let id=0;id<this.nav.blocked.length;id++){
      const p=this.nav.point(id);
      if(world.roads.some(r=>inside(p.x,p.y,r,7)))this.nav.blocked[id]=1;
    }
    const intervals=(roads,axis,size,limit)=>{
      let start=48;const result=[];
      for(const r of roads.sort((a,b)=>a[axis]-b[axis])){if(r[axis]-22>start)result.push([start,r[axis]-22]);start=r[axis]+r[size]+22;}
      if(start<limit-48)result.push([start,limit-48]);return result;
    };
    const columns=intervals(world.roads.filter(r=>r.h>r.w),'x','w',world.width);
    const rows=intervals(world.roads.filter(r=>r.w>r.h),'y','h',world.height);
    for(const [left,right] of columns)for(const [top,bottom] of rows){
      const points=[];
      for(let id=0;id<this.nav.blocked.length;id++){
        const p=this.nav.point(id);
        if(this.nav.valid(id)&&p.x>=left&&p.x<=right&&p.y>=top&&p.y<=bottom&&
          (p.x<left+32||p.x>right-32||p.y<top+32||p.y>bottom-32))points.push(p);
      }
      if(points.length<4)continue;
      for(let n=0;n<2;n++){
        const id=this.people.length,start=points[Math.floor(points.length*(n?.72:.22))];
        this.people.push({...start,id,look:id%4,points,path:[],pause:id*.09,walkTime:0,
          speed:29+id%5*4,moving:false,back:false,flip:!!n,next:id*13});
      }
    }
  }
  update(dt){
    for(const p of this.people){
      if(p.pause>0){p.pause-=dt;p.moving=false;continue;}
      if(!p.path.length){
        for(let attempt=0;attempt<5&&!p.path.length;attempt++){
          p.next=(p.next+37)%p.points.length;
          const goal=p.points[p.next];
          if(Math.hypot(p.x-goal.x,p.y-goal.y)>48)p.path=this.nav.path(p,goal);
        }
        if(!p.path.length){p.pause=1;continue;}
      }
      const old={x:p.x,y:p.y};moveAlongPath(p,p.path,p.speed,dt);
      if(p.moving){const d=project(p.x-old.x,p.y-old.y);p.back=d.y<0;p.flip=d.x<0;p.walkTime+=dt;}
      if(!p.path.length)p.pause=.6+(p.id%4)*.5;
    }
  }
}

