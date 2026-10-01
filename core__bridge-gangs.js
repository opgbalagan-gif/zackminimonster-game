import {distance} from './core__geometry.js';

export class BridgeGangs{
  constructor(world){
    this.groups=(world.bridges??[]).map((bridge,i)=>{
      const vertical=Math.abs(bridge.y+bridge.h/2-bridge.approach.y)>Math.abs(bridge.x+bridge.w/2-bridge.approach.x);
      const sign=Math.sign((vertical?bridge.y+bridge.h/2-bridge.approach.y:bridge.x+bridge.w/2-bridge.approach.x));
      return {bridge,name:['RIVER CREW','COLOUR CREW','OLD BLOCK CREW','BOULEVARD CREW'][i],dx:vertical?0:sign,dy:vertical?sign:0,cooldown:0,greeted:false};
    });
    this.push=null;this.speech=null;
  }
  members(city){
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
  update(dt,session){
    for(const g of this.groups)g.cooldown=Math.max(0,g.cooldown-dt);
    if(this.speech){this.speech.remaining-=dt;if(this.speech.remaining<=0)this.speech=null;}
    if(this.push){
      const p=this.push;p.age+=dt;
      let travel=Math.min(p.remaining,210*dt);
      while(travel>0){
        const step=Math.min(2,travel),x=session.player.x+p.dx*step,y=session.player.y+p.dy*step;
        if(!session.nav.canWalk(x,y)){p.remaining=0;break;}
        session.player.x=x;session.player.y=y;p.remaining-=step;travel-=step;
      }
      if(p.remaining<=.001){this.push=null;session.player.state='IDLE';}
      return;
    }
    if(session.knockedFor>0||session.hiddenFor>0)return;
    for(const g of this.groups){
      if(g.greeted&&session.city.find(r=>r.id===g.bridge.to)?.open)continue;
      if(this.confront(session,g.bridge))break;
    }
  }
  reset(){this.push=null;this.speech=null;for(const g of this.groups){g.cooldown=0;g.greeted=false;}}
}
