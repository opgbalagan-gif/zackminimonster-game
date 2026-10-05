import {dialogFocus} from './core__dialog-focus.js?v=f08d1772f1b8';
export class RoomMusicScene{
  constructor(session,audio){
    this.audio=audio;
    this.s=session;this.active=false;this.el=document.createElement('section');this.el.id='room-music-scene';this.el.hidden=true;this.el.setAttribute('role','dialog');this.el.setAttribute('aria-modal','true');this.el.setAttribute('aria-label','Зак включает музыку');
    this.el.innerHTML='<video playsinline preload="none"></video><div class="room-film-controls"><span>НАША ВОЛНА</span><button class="room-film-play" hidden>Смотреть</button><button class="room-film-close">В квартиру ↗</button></div>';
    document.getElementById('app').append(this.el);this.video=this.el.querySelector('video');this.video.poster='./content__levels__first-mark__art__room-music-keyframe-v19.png';this.video.src='./content__levels__first-mark__art__room-music-sound-v20.mp4';this.video.volume=.7;
    this.playButton=this.el.querySelector('.room-film-play');this.playButton.onclick=()=>this.startVideo();this.el.querySelector('.room-film-close').onclick=()=>this.finish();this.focus=dialogFocus(this.el,()=>this.finish());
    this.video.onended=()=>this.finish();this.video.onerror=()=>this.finish();this.video.onplaying=()=>{clearTimeout(this.timer);this.timer=setTimeout(()=>this.finish(),14000);};
  }
  play(){
    if(this.active||this.s.cinematic||this.s.mode!=='hideout')return;this.active=true;this.s.cinematic=true;this.el.hidden=false;this.video.currentTime=0;this.focus.open();
    this.audio.radio.media.muted=true;this.video.muted=!this.audio.enabled;
    this.startVideo();
  }
  startVideo(){this.playButton.hidden=true;clearTimeout(this.timer);this.timer=setTimeout(()=>this.finish(),12000);this.video.play().catch(()=>{clearTimeout(this.timer);this.playButton.hidden=false;this.playButton.focus();});}
  finish(){if(!this.active)return;clearTimeout(this.timer);this.active=false;this.video.pause();this.audio.radio.media.muted=!this.audio.enabled;this.el.hidden=true;this.focus.close();this.s.cinematic=false;}
}
