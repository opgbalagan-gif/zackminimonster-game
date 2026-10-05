import {distance,moveAlongPath} from './core__geometry.js?v=252855055fad';
export class PoliceSystem{
  constructor(data,nav){
    this.nav=nav;this.caught=false;
    this.units=data.map(u=>({...u,home:{x:u.x,y:u.y},state:'PATROL',path:[],patrolIndex:0,
      decisionIn:0,repathIn:0,suspicion:0,lost:0,searchTime:0,active:false,facing:'down',moving:false}));
  }
  update(dt,player,heat,world,hidden=false,grace=0){
    this.caught=false;let active=0;
    for(const unit of this.units){
      unit.active=unit.level<=heat;unit.moving=false;
      if(!unit.active)continue;
      const d=distance(unit,player),car=unit.kind==='car';
      if(d>950){unit.decisionIn=0;continue;}
      active++;unit.decisionIn-=dt;unit.repathIn-=dt;
      const sees=!hidden&&heat>0&&d<140+heat*42&&this.nav.lineOfSight(unit,player);
      if(heat===0&&unit.state!=='PATROL'&&unit.state!=='RETURN'){unit.state='RETURN';unit.path=[];}
      if(sees){
        unit.lastKnown={x:player.x,y:player.y};unit.lost=0;
        if(unit.state==='PATROL'||unit.state==='RETURN'){unit.state='SUSPICIOUS';unit.suspicion=0;unit.path=[];}
        if(unit.state==='SUSPICIOUS'){unit.suspicion+=dt*(1+heat*.35);if(unit.suspicion>.65){unit.state='CHASE';unit.repathIn=0;}}
        if(unit.state==='SEARCH'){unit.state='CHASE';unit.repathIn=0;}
      }else if(unit.state==='CHASE'){
        unit.lost+=dt;if(unit.lost>1.8){unit.state='SEARCH';unit.searchTime=5;unit.repathIn=0;}
      }else if(unit.state==='SUSPICIOUS'){
        unit.suspicion-=dt;if(unit.suspicion<=0){unit.state='SEARCH';unit.searchTime=3;unit.repathIn=0;}
      }
      if(unit.state==='SEARCH'){unit.searchTime-=dt;if(unit.searchTime<=0){unit.state='RETURN';unit.path=[];unit.repathIn=0;}}
      if(unit.decisionIn<=0){
        unit.decisionIn=d>480?.5:.15;
        let destination;
        if(unit.state==='CHASE')destination=unit.lastKnown;
        else if(unit.state==='SEARCH')destination=unit.lastKnown;
        else if(unit.state==='RETURN')destination=unit.home;
        else if(unit.state==='PATROL')destination=unit.route[unit.patrolIndex];
        if(destination&&(unit.repathIn<=0||!unit.path.length)){
          unit.path=this.nav.path(unit,destination,car);unit.repathIn=unit.state==='CHASE'?.7:2;
        }
        if(unit.state==='RETURN'&&distance(unit,unit.home)<36){unit.state='PATROL';unit.path=[];}
        if(unit.state==='PATROL'&&distance(unit,unit.route[unit.patrolIndex])<38){
          unit.patrolIndex=(unit.patrolIndex+1)%unit.route.length;unit.path=[];unit.repathIn=0;
        }
      }
      const speed=unit.state==='CHASE'?(car?165:112)+heat*9:(car?76:40);
      if(unit.state!=='SUSPICIOUS')moveAlongPath(unit,unit.path,speed,dt);
      if(!hidden&&grace<=0&&heat>0&&distance(unit,player)<(car?24:18)&&this.nav.lineOfSight(unit,player))this.caught=true;
    }
    return active;
  }
}
