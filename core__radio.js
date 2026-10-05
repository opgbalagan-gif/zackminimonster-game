export const RADIO_STATION={name:'181.FM · THE BEAT',url:'https://listen.181fm.com/181-beat_128k.mp3'};

export class RadioPlayer{
  constructor(media){
    this.media=media;this.state='off';this.message='';this.wanted=false;this.generation=0;this.timer=null;
    media.preload='none';this.setVolume(.22);
    media.addEventListener('playing',()=>{if(this.wanted){this.clearTimer();this.state='playing';this.message='';}});
    media.addEventListener('pause',()=>{if(this.wanted&&media.paused&&!media.ended){this.clearTimer();this.state='paused';this.message='Нажми на стереосистему, чтобы продолжить эфир.';}});
    for(const event of ['waiting','stalled'])media.addEventListener(event,()=>{
      if(this.wanted){this.state='loading';this.armTimeout();}
    });
    media.addEventListener('error',()=>{if(this.wanted)this.fail('Станция недоступна. Попробуй ещё раз.');});
    media.addEventListener('ended',()=>{if(this.wanted)this.fail('Эфир прервался. Подключись снова.');});
  }
  setVolume(value){this.media.volume=Number.isFinite(value)?Math.max(0,Math.min(1,value)):.22;}
  clearTimer(){clearTimeout(this.timer);this.timer=null;}
  armTimeout(){if(!this.timer)this.timer=setTimeout(()=>this.fail('Нет связи с радио. Попробуй ещё раз.'),20000);}
  release(){this.clearTimer();this.media.pause();this.media.removeAttribute('src');this.media.load();}
  stop(){this.wanted=false;this.generation++;this.state='off';this.message='';this.release();}
  fail(message){this.stop();this.state='error';this.message=message;}
  toggle(){if(this.state==='paused')return this.resume();if(this.wanted)this.stop();else return this.start();}
  async start(){
    if(this.wanted)return this.resume();
    this.wanted=true;this.media.src=RADIO_STATION.url;return this.playStream();
  }
  resume(){
    if(!this.wanted)return this.state==='error'?this.start():Promise.resolve();
    if(!this.media.paused&&this.state==='playing')return Promise.resolve();
    return this.playStream();
  }
  async playStream(){
    const generation=++this.generation;this.state='loading';this.message='';this.armTimeout();
    try{await this.media.play();}
    catch(error){if(this.wanted&&generation===this.generation)this.fail(error.name==='NotAllowedError'?'Нажми «Повторить», чтобы включить звук.':'Не удалось включить эфир. Попробуй ещё раз.');}
  }
  get audible(){return this.state==='playing'&&!this.media.paused&&!this.media.muted&&this.media.volume>0;}
}
