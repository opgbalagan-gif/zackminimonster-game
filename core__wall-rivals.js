import {distance,moveAlongPath} from './core__geometry.js?v=f08d1772f1b8';
import {wallOwner} from './core__territory.js?v=f08d1772f1b8';
export const PAINT_DRY_SECONDS=60;
export function dryingOpacity(save,id){return save.wall_damage[id]==='clean'?0:save.wall_damage[id]==='cleaner'?Math.max(0,Math.min(1,(save.wall_drying?.[id]??PAINT_DRY_SECONDS)/PAINT_DRY_SECONDS)):1;}
export function wallCrewSize(s){
  const progress=Math.floor(s.world.targets.filter(t=>s.painted.has(t.wall_id)).length/8)+Math.floor(Math.max(0,s.life.state.day-1)/3);
  return Math.min(s.life.night?8:6,(s.life.night?3:2)+progress);
}

// Independent crews reserve different walls. Earned reputation is never removed.
export class WallRivals{
  constructor(s){this.s=s;this.actors=[];this.period='';this.wait=8;this.count=0;this.noticeIn=0;this.protectedUntil=new Map();this.clock=0;}
  eligible(t){
    if((this.protectedUntil.get(t.wall_id)??0)>this.clock)return false;
    const owner=wallOwner(this.s,t.wall_id);
    return this.s.life.night?owner!=='rival':owner!=='neutral';
  }
  spawn(){
    const s=this.s,reserved=new Set(this.actors.map(a=>a.target.wall_id));
    const score=t=>distance(t.approach,s.player)+this.actors.reduce((n,a)=>n+Math.max(0,750-distance(t.approach,a.target.approach))*4,0)+(s.life.night&&wallOwner(s,t.wall_id)!=='zak'?650:0);
    const targets=s.world.targets.filter(t=>!reserved.has(t.wall_id)&&this.eligible(t)).sort((a,b)=>score(a)-score(b));
    for(const target of targets){
      const p=target.approach;
      const entries=[s.world.tutorialEntry,...s.world.mapRoutes,...s.world.targets.map(t=>t.approach)]
        .filter(e=>distance(e,p)>220&&distance(e,p)<900&&s.nav.canWalk(e.x,e.y))
        .sort((a,b)=>distance(a,p)-distance(b,p));
      for(const start of entries.slice(0,6)){
        const path=s.nav.path(start,p);if(!path.length)continue;
        this.actors.push({id:'wall-crew-'+(++this.count),x:start.x,y:start.y,entry:{x:start.x,y:start.y},path,target,
          kind:s.life.night?'rival':'cleaner',sprite:s.life.night?'citizen_0_0':'comic_cleaner_front_0',phase:'walk',age:0,progress:0,moving:false});
        return true;
      }
    }
    return false;
  }
  update(dt){
    const s=this.s,key=s.life.state.day+':'+s.life.state.period;
    this.clock+=dt;this.noticeIn=Math.max(0,this.noticeIn-dt);s.save.wall_drying??={};
    let dried=false;
    for(const [id,kind] of Object.entries(s.save.wall_damage))if(kind==='cleaner'){
      const left=Math.max(0,(s.save.wall_drying[id]??PAINT_DRY_SECONDS)-dt);s.save.wall_drying[id]=left;
      if(left===0){s.save.wall_damage[id]='clean';delete s.save.wall_drying[id];dried=true;}
    }
    if(dried)s.persist();
    if(key!==this.period){this.period=key;this.actors=[];this.wait=s.life.night?15:8;this.count=0;}
    if(s.mode!=='district')return;
    this.wait-=dt;
    if(this.wait<=0&&this.actors.length<wallCrewSize(s)){this.wait=this.spawn()?2:10;}
    for(const a of [...this.actors]){
      if(a.phase!=='leave'&&!this.eligible(a.target)){this.leave(a);}
      if(a.phase==='walk'||a.phase==='leave'){
        const old={x:a.x,y:a.y};moveAlongPath(a,a.path,95,dt);a.walkDistance=(a.walkDistance??0)+distance(old,a);
        if(!a.path.length){
          if(a.phase==='leave')this.actors=this.actors.filter(other=>other!==a);
          else{a.phase='paint';a.moving=false;a.age=0;a.line=a.kind==='cleaner'?'Два слоя — и чисто.':'Этот квартал будет нашим.';}
        }
        continue;
      }
      a.age+=dt;a.progress=Math.min(1,a.age/(a.kind==='cleaner'?10:12));
      if(a.progress<1)continue;
      s.save.wall_damage[a.target.wall_id]=a.kind;
      if(a.kind==='cleaner')s.save.wall_drying[a.target.wall_id]=PAINT_DRY_SECONDS;
      else delete s.save.wall_drying[a.target.wall_id];
      s.persist();
      if(this.noticeIn===0){s.notice(a.kind==='cleaner'?'Дворники закрашивают стены. Контроль кварталов — на карте.':'Соперники занимают стены. Смотри контроль кварталов на карте.');this.noticeIn=25;}
      this.leave(a);
    }
  }
  leave(a){a.phase='leave';a.line='';a.path=this.s.nav.path(a,a.entry);}
  repaired(id){
    delete this.s.save.wall_damage[id];delete this.s.save.wall_drying?.[id];
    // Give a newly finished painting a chance to be seen instead of instantly covering it.
    this.protectedUntil.set(id,this.clock+45);
    for(const a of this.actors)if(a.target.wall_id===id&&a.phase!=='leave')this.leave(a);
  }
}
