import {RadioPlayer} from './core__radio.js?v=c531a45172ca';
export class AudioManager{
  constructor(){this.context=null;this.radio=new RadioPlayer(document.getElementById('radio-audio'));this.enabled=true;}
  get enabled(){return this._enabled;}
  set enabled(value){this._enabled=!!value;this.radio.media.muted=!this._enabled;}
  tick(){
    if(!this.enabled)return;
    try{
      this.context??=new (window.AudioContext||window.webkitAudioContext)();
      const now=this.context.currentTime,osc=this.context.createOscillator(),gain=this.context.createGain();
      osc.type='triangle';osc.frequency.setValueAtTime(680,now);osc.frequency.exponentialRampToValueAtTime(290,now+.055);
      gain.gain.setValueAtTime(.045,now);gain.gain.exponentialRampToValueAtTime(.001,now+.065);
      osc.connect(gain).connect(this.context.destination);osc.start(now);osc.stop(now+.07);
    }catch{/* Audio is optional when browser policy blocks playback. */}
  }
}
