import {distance,moveAlongPath} from './core__geometry.js?v=09df463d6cde';

// Keep earned reputation and work history; damage is a separate, repairable layer.
export class WallRivals{
  constructor(s){this.s=s;this.actor=null;this.period='';this.wait=45;this.count=0;}
  update(dt){
    const s=this.s,key=s.life.state.day+':'+s.life.state.period;
    if(key!==this.period){this.period=key;this.actor=null;this.wait=45;this.count=0;}
    if(s.mode!=='district')return;
    if(!this.actor){
      this.wait-=dt;if(this.wait>0||this.count>=(s.life.night?2:1))return;
      const targets=s.world.targets.filter(t=>s.painted.has(t.wall_id)&&!s.save.wall_damage[t.wall_id]).sort((a,b)=>distance(a.approach,s.player)-distance(b.approach,s.player));
      const target=targets[0];if(!target){this.wait=10;return;}
      const start=s.world.tutorialEntry,path=s.nav.path(start,target.approach);
      if(!path.length){this.wait=10;return;}
      this.actor={...start,path,target,kind:s.life.night?'rival':'cleaner',sprite:s.life.night?'citizen_3_0':'citizen_2_0',phase:'walk',age:0,progress:0,moving:false};
      this.count++;
    }
    const a=this.actor;
    if(a.phase==='walk'||a.phase==='leave'){
      moveAlongPath(a,a.path,95,dt);
      if(!a.path.length){if(a.phase==='leave'){this.actor=null;this.wait=55;}else{a.phase='paint';a.age=0;a.line=a.kind==='cleaner'?'Порядок будет. Сейчас валик возьму.':'Нормальная стена. Мой тег ей подойдёт.';}}
      return;
    }
    a.age+=dt;a.progress=Math.min(1,a.age/6);
    if(a.progress===1){
      s.save.wall_damage[a.target.wall_id]=a.kind;s.persist();
      s.notice(a.kind==='cleaner'?'Мою работу закатали валиком. Ночью верну цвет.':'Оппы перекрыли мой рисунок. Придётся обновить.');
      a.phase='leave';a.line='';a.path=s.nav.path(a,s.world.tutorialEntry);
    }
  }
  repaired(id){if(this.actor?.target.wall_id===id)this.actor=null;delete this.s.save.wall_damage[id];this.wait=55;}
}
