import {clamp} from './core__geometry.js?v=715810e652df';
export class AimController{
  constructor(){this.x=.38;this.y=-.24;this.base=null;}
  centre(){this.x=0;this.y=0;this.base=null;}
  drag(dx,dy){this.x=clamp(this.x+dx,-1,1);this.y=clamp(this.y+dy,-1,1);}
  sample(beta,gamma,angle=0){
    if(!Number.isFinite(beta)||!Number.isFinite(gamma))return false;
    if(!this.base){this.base={beta,gamma,x:this.x,y:this.y};return true;}
    const wrap=v=>((v+540)%360)-180,r=angle*Math.PI/180;
    const dx=wrap(gamma-this.base.gamma)/24,dy=wrap(beta-this.base.beta)/24;
    this.x=clamp(this.base.x+dx*Math.cos(r)+dy*Math.sin(r),-1,1);this.y=clamp(this.base.y+dy*Math.cos(r)-dx*Math.sin(r),-1,1);return true;
  }
  get quality(){return Math.round(Math.max(0,100-Math.hypot(this.x,this.y)*180));}
}
export class MotionAim{
  constructor(aim,host=window,doc=document){this.aim=aim;this.host=host;this.doc=doc;this.active=false;this.status='Наводи пальцем или мышью';this.listener=e=>{if(!this.active||this.doc.hidden)return;if(aim.sample(e.beta,e.gamma,host.screen?.orientation?.angle??0)){this.received=true;this.status='Гироскоп включён · наклоняй телефон';}};this.visibility=()=>{this.aim.base=null;};doc.addEventListener('visibilitychange',this.visibility);}
  async enable(){
    const Event=this.host.DeviceOrientationEvent;if(!Event||this.host.isSecureContext===false){this.status='Гироскоп недоступен · веди пальцем';return;}
    try{if(typeof Event.requestPermission==='function'&&await Event.requestPermission()!=='granted'){this.status='Доступ не разрешён · веди пальцем';return;}
      this.stop();this.active=true;this.received=false;this.aim.base=null;this.host.addEventListener('deviceorientation',this.listener);this.status='Ожидаем гироскоп…';
      this.timer=this.host.setTimeout(()=>{if(this.active&&!this.received){this.stop();this.status='Нет данных датчика · веди пальцем';}},4000);
    }catch{this.status='Датчик недоступен · веди пальцем';}
  }
  stop(){this.active=false;this.host.removeEventListener('deviceorientation',this.listener);this.host.clearTimeout(this.timer);this.aim.base=null;}
  destroy(){this.stop();this.doc.removeEventListener('visibilitychange',this.visibility);}
}
