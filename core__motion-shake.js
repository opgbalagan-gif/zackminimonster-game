// Sensor-only detector, independent of rendering; values are metres/second².
export class ShakeDetector{
  constructor(){this.reset();}
  reset(){this.gravity=null;this.previousPulse=null;this.lastPulse=-Infinity;this.armed=true;}
  sample(event,now){
    let a=event.acceleration;
    const valid=v=>v&&['x','y','z'].every(k=>Number.isFinite(v[k]));
    if(!valid(a)){
      a=event.accelerationIncludingGravity;if(!valid(a))return 0;
      if(!this.gravity){this.gravity={...a};return 0;}
      const linear={};for(const k of ['x','y','z']){this.gravity[k]+=(a[k]-this.gravity[k])*.12;linear[k]=a[k]-this.gravity[k];}a=linear;
    }
    const strength=Math.hypot(a.x,a.y,a.z);
    if(strength<3){this.armed=true;return 0;}
    const direction={x:a.x/strength,y:a.y/strength,z:a.z/strength};
    const reversed=this.previousPulse&&Object.keys(direction).reduce((sum,k)=>sum+direction[k]*this.previousPulse[k],0)<-.25;
    if(strength<7||now-this.lastPulse<130||(!this.armed&&!reversed))return 0;
    this.armed=false;this.previousPulse=direction;this.lastPulse=now;
    return Math.min(.18,.10+(strength-7)*.006);
  }
}
export class MotionShake{
  constructor(onPulse,host=globalThis.window,doc=globalThis.document){
    this.host=host;this.doc=doc;this.onPulse=onPulse;this.detector=new ShakeDetector();
    this.mobile=!!(host.navigator?.maxTouchPoints||host.matchMedia?.('(pointer: coarse)').matches);
    this.supported=!!host.DeviceMotionEvent&&host.isSecureContext!==false;
    this.needsPermission=typeof host.DeviceMotionEvent?.requestPermission==='function';
    this.allowed=this.supported&&!this.needsPermission;this.active=false;this.manual=false;this.listening=false;
    this.status=this.supported?'off':'unavailable';this.received=false;
    this.handle=event=>{
      if(!this.active||this.doc.hidden)return;
      if([event.acceleration,event.accelerationIncludingGravity].some(a=>a&&['x','y','z'].every(k=>Number.isFinite(a[k])))){this.received=true;this.status='listening';}
      const pulse=this.detector.sample(event,this.host.performance.now());if(pulse)this.onPulse(pulse);
    };
    this.visibility=()=>{this.detector.reset();this.syncListener();};doc.addEventListener('visibilitychange',this.visibility);
  }
  setActive(active){if(active===this.active)return;this.active=active;this.detector.reset();this.syncListener();}
  syncListener(){
    const should=this.active&&this.allowed&&!this.manual&&!this.doc.hidden;
    if(should&&!this.listening){
      this.host.addEventListener('devicemotion',this.handle);this.listening=true;this.status='listening';this.received=false;
      this.timeout=this.host.setTimeout(()=>{if(this.listening&&!this.received)this.status='no-data';},5000);
    }else if(!should&&this.listening){this.host.removeEventListener('devicemotion',this.handle);this.listening=false;this.host.clearTimeout(this.timeout);}
  }
  async enable(){
    if(!this.supported){this.status='unavailable';return;}
    this.status='requesting';
    try{
      if(!this.allowed&&this.needsPermission)this.allowed=await this.host.DeviceMotionEvent.requestPermission()==='granted';
      else this.allowed=true;
      if(!this.allowed){this.status='denied';return;}
      this.manual=false;this.detector.reset();this.syncListener();
    }catch{this.status='denied';}
  }
  useTouch(){this.manual=true;this.status='off';this.syncListener();}
  destroy(){this.setActive(false);this.doc.removeEventListener('visibilitychange',this.visibility);}
}
