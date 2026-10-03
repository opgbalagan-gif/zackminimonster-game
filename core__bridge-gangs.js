import {distance} from './core__geometry.js?v=0bee4946821b';
import {canEnter,regionAt} from './core__city-progress.js?v=0bee4946821b';

export class BridgeGangs{
  constructor(world){
    this.groups=(world.bridges??[]).map((bridge,i)=>{
      const vertical=Math.abs(bridge.y+bridge.h/2-bridge.approach.y)>Math.abs(bridge.x+bridge.w/2-bridge.approach.x);
      const sign=Math.sign((vertical?bridge.y+bridge.h/2-bridge.approach.y:bridge.x+bridge.w/2-bridge.approach.x));
      return {bridge,name:['RIVER CREW','COLOUR CREW','OLD BLOCK CREW','BOULEVARD CREW'][i],dx:vertical?0:sign,dy:vertical?sign:0,cooldown:0,greeted:false};
    });
    this.push=null;this.speech=null;this.encounter=null;this.lastSafe=null;
  }
  members(city){
    if(this.encounter)return this.encounter.people;
    return this.groups.flatMap((g,i)=>{
      const open=city.find(r=>r.id===g.bridge.to)?.open;
      return [-1,0,1].map((side,n)=>{
        const spread=open?(side===0?98:side*68):side*25;
        return {x:g.bridge.approach.x+g.dx*(open?34:38)-g.dy*spread,
          y:g.bridge.approach.y+g.dy*(open?34:38)+g.dx*spread,
          sprite:['citizen_1_0','citizen_3_0','citizen_0_0'][(n+i)%3],leader:side===0,name:g.name,open};
      });
    });
  }
  confront(session,bridge,interact=false){
    const g=this.groups.find(g=>g.bridge.id===bridge.id),region=session.city.find(r=>r.id===bridge.to);
    if(!g||!region||this.push||g.cooldown>0||distance(session.player,bridge.approach)>(interact?105:46))return false;
    g.cooldown=2.5;
    if(region.open){
      g.greeted=true;this.speech={name:g.name,line:'Йоу, твои работы знают. Проходи!',detail:region.name+' · проход открыт',remaining:3.5};return false;
    }
    this.speech={name:g.name,line:'Эй, назад! Сначала покажи себя в своём районе.',
      detail:`${region.earned} / ${region.required} REP в ${region.previous}. Рисуй и сохраняй работы дома.`,remaining:5};
    session.player.path=[];session.player.moving=false;session.player.state='HIT';session.waypoint=null;
    session.companion.path=[];session.companion.repathIn=0;
    session.grace=Math.max(session.grace,2);session.trafficGrace=Math.max(session.trafficGrace,2);
    this.push={dx:-g.dx,dy:-g.dy,remaining:112,age:0};
    session.emit('gang-reject',{bridge:bridge.id});return true;
  }
  update(dt,session,previous=null){
    for(const g of this.groups)g.cooldown=Math.max(0,g.cooldown-dt);
    if(this.speech){this.speech.remaining-=dt;if(this.speech.remaining<=0){this.speech=null;this.encounter=null;}}
    if(this.push){
      const p=this.push;p.age+=dt;
      let travel=Math.min(p.remaining,210*dt);
      while(travel>0){
        const step=Math.min(2,travel),x=session.player.x+p.dx*step,y=session.player.y+p.dy*step;
        if(!session.nav.canWalk(x,y)){if(p.safe)Object.assign(session.player,p.safe);p.remaining=0;break;}
        session.player.x=x;session.player.y=y;p.remaining-=step;travel-=step;
      }
      if(p.remaining<=.001){if(!canEnter(session.world,session.city,session.player.x,session.player.y)&&p.safe)Object.assign(session.player,p.safe);this.push=null;session.player.state='IDLE';}
      return;
    }
    if(session.knockedFor>0||session.hiddenFor>0)return;
    const allowed=p=>p&&canEnter(session.world,session.city,p.x,p.y);
    if(allowed(session.player)){this.lastSafe={x:session.player.x,y:session.player.y};return;}
    const passage=session.world.bridges.find(b=>session.player.x>=b.x&&session.player.x<=b.x+b.w&&session.player.y>=b.y&&session.player.y<=b.y+b.h);
    const region=session.city.find(r=>r.id===(passage?.to??regionAt(session.world,session.player)?.id));
    if(!region||region.open)return;
    let safe=allowed(previous)?previous:allowed(this.lastSafe)?this.lastSafe:null;
    // Restored runs or external teleports inside a closed region need a safe exit too.
    if(!safe){
      outer:for(let radius=24;radius<800;radius+=24)for(let i=0;i<32;i++){
        const p={x:session.player.x+Math.cos(i*Math.PI/16)*radius,y:session.player.y+Math.sin(i*Math.PI/16)*radius};
        if(allowed(p)&&session.nav.canWalk(p.x,p.y)){safe=p;break outer;}
      }
    }
    safe??={...session.world.spawn};
    let dx=safe.x-session.player.x,dy=safe.y-session.player.y,len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
    const g=this.groups.find(g=>g.bridge.to===region.id),name=g?.name??'LOCAL CREW';
    const people=[];
    for(let i=-1;i<=1;i++){
      let p={x:session.player.x-dx*52-dy*i*28,y:session.player.y-dy*52+dx*i*28};
      if(!session.nav.canWalk(p.x,p.y,2)){const id=session.nav.closest(p);if(id<0)continue;p=session.nav.point(id);}
      people.push({...p,sprite:['citizen_1_0','citizen_3_0','citizen_0_0'][i+1],leader:i===0,name,open:false});
    }
    this.encounter={people};this.speech={name,line:'Йоу! Сначала заработай имя в своём районе.',detail:region.earned+' / '+region.required+' REP в '+region.previous,remaining:5};
    session.player.path=[];session.player.moving=false;session.player.state='HIT';session.waypoint=null;session.companion.path=[];
    session.grace=Math.max(session.grace,2);session.trafficGrace=Math.max(session.trafficGrace,2);
    this.push={dx,dy,remaining:Math.max(112,len+28),age:0,safe:{x:safe.x,y:safe.y}};
    session.emit('gang-reject',{region:region.id});
  }
  reset(){this.push=null;this.speech=null;this.encounter=null;this.lastSafe=null;for(const g of this.groups){g.cooldown=0;g.greeted=false;}}
}
