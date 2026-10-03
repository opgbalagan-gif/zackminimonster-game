import {AimController,MotionAim} from './core__motion-aim.js?v=014abf6eb9c6';
import {setUIButton,uiIcon} from './core__ui-kit.js?v=014abf6eb9c6';
import {cameraFrame,CAMERA_MURAL} from './core__camera-framing.js?v=014abf6eb9c6';
import {nearbyPhotoSpot} from './core__photo-spots.js?v=014abf6eb9c6';
import {bindCanvasGesture} from './core__canvas-gesture.js?v=014abf6eb9c6';
import {appIcon,foldPhoneIcon,phoneGlyph} from './core__phone-icons.js?v=014abf6eb9c6';
import {dialogFocus} from './core__dialog-focus.js?v=014abf6eb9c6';
export class PhoneUI{
  constructor(s,renderer,audio){
    this.s=s;this.renderer=renderer;this.audio=audio;this.aim=new AimController();this.motion=new MotionAim(this.aim);this.steady=0;this.screen='messages';this.previous={x:0,y:0};
    this.toggle=document.createElement('button');this.toggle.id='phone-toggle';this.toggle.className='secondary';this.toggle.setAttribute('aria-label','Открыть раскладушку');this.toggle.innerHTML='<span class="retro-phone-icon" aria-hidden="true"></span>';this.toggle.onclick=()=>this.open();document.getElementById('app').append(this.toggle);
    this.el=document.createElement('section');this.el.id='phone-ui';this.el.hidden=true;this.el.setAttribute('aria-label','Раскладушка Зака');
    this.el.innerHTML=`<div class="flip-phone"><header><span>ZAK MINI · ONLINE</span><button class="phone-close" aria-label="Закрыть телефон">×</button></header><div class="phone-lcd"><div class="phone-message"><small>Новое сообщение</small><h2>Твои работы заслуживают кадра</h2><p>Сними новый рисунок, пока стена ещё твоя. Больше работ художника в @zakminimonster.</p><a href="https://www.instagram.com/zakminimonster/" target="_blank" rel="noopener noreferrer">@zakminimonster ↗</a><p class="phone-notice">Сохрани момент в своём альбоме.</p></div><div class="phone-gallery" hidden></div></div><nav aria-label="Приложения телефона"><button class="phone-app phone-sms"><span class="phone-app-icon app-sms" aria-hidden="true"></span><span>Сообщения</span></button><button class="phone-app phone-camera"><span class="phone-app-icon app-camera" aria-hidden="true"></span><span>Камера</span></button><button class="phone-app phone-album"><span class="phone-app-icon app-album" aria-hidden="true"></span><span>Альбом</span></button></nav><div class="phone-model">MINI / STREET EDITION</div></div>
      <div class="phone-camera-view" hidden><canvas aria-label="Видоискатель граффити" tabindex="0"></canvas><button class="secondary camera-back">Назад</button><h2>Поймай свой рисунок в кадр</h2><div class="camera-brackets"><i></i><i></i><i></i><i></i></div><div class="camera-focus"></div><div class="camera-help"><strong class="camera-score"></strong><span class="camera-status"></span><button class="secondary camera-gyro">Включить гироскоп</button></div><div class="camera-actions"><button class="secondary camera-album" aria-label="Посмотреть фотографии">ФОТО</button><button class="camera-shutter" aria-label="Сделать снимок">${uiIcon('camera')}</button><button class="secondary camera-centre" aria-label="Центрировать камеру">↻</button></div></div>`;
    document.getElementById('app').append(this.el);this.canvas=this.el.querySelector('canvas');this.c=this.canvas.getContext('2d');
    this.el.setAttribute('role','dialog');this.el.setAttribute('aria-modal','true');
    this.focusScope=dialogFocus(this.el,()=>this.screen==='camera'?this.messages():this.close());
    this.el.querySelector('.phone-close').innerHTML=phoneGlyph('close');this.el.querySelector('.camera-centre').innerHTML=phoneGlyph('reset');
    this.toggle.innerHTML=foldPhoneIcon();this.el.querySelector('.flip-phone header>span').textContent='ZAK DUO';this.el.querySelector('.phone-model').textContent='Designed for your streets';
    this.el.querySelector('.phone-lcd').insertAdjacentHTML('beforeend','<div class="phone-radio" hidden><small>STREET RADIO</small><h2>181.FM<br>THE BEAT</h2><p class="phone-radio-status" role="status"></p><button class="phone-radio-play">ВКЛЮЧИТЬ</button><label class="phone-volume-label">Громкость <input class="phone-radio-volume" type="range" min="0" max="100" aria-label="Громкость радио в телефоне"></label></div>');
    this.el.querySelector('nav').insertAdjacentHTML('beforeend','<button class="phone-app phone-radio-app">'+uiIcon('music')+'<span>Радио</span></button><button class="phone-app phone-levels">'+uiIcon('rep')+'<span>Уровни</span></button>');
    const bind=(q,f)=>this.el.querySelector(q).onclick=f;
    bind('.phone-close',()=>this.close());bind('.phone-camera',()=>this.camera());bind('.phone-sms',()=>this.messages());bind('.phone-album',()=>this.gallery());bind('.camera-back',()=>this.messages());bind('.camera-album',()=>this.gallery());bind('.camera-centre',()=>{this.aim.centre();this.steady=0;});bind('.camera-shutter',()=>this.shoot());bind('.camera-gyro',()=>this.motion.enable());
    bind('.phone-radio-app',()=>this.radio());bind('.phone-radio-play',()=>this.audio.radio.toggle());
    this.el.querySelector('.phone-levels span:last-child').textContent='Путь';
    this.el.querySelector('nav').insertAdjacentHTML('beforeend','<button class="phone-app phone-training">'+uiIcon('spray')+'<span>Обучение</span></button>');
    bind('.phone-levels',()=>{this.close();document.getElementById('chapter-button').click();});
    bind('.phone-training',()=>{this.close();const b=document.getElementById('chapter-button');b.dataset.tab='training';b.click();});
    if(s.world.sandbox){this.el.querySelector('nav').insertAdjacentHTML('beforeend','<button class="phone-app phone-map"><span class="phone-app-icon app-map" aria-hidden="true">⌁</span><span>Карта</span></button>');bind('.phone-map',()=>{this.close();document.getElementById('map-button').click();});}
    for(const [selector,name,label] of [['sms','sms','Сообщения'],['camera','camera','Камера'],['album','album','Галерея'],['radio-app','radio','Музыка'],['levels','levels','Мой путь'],['training','training','Обучение'],['map','map','Карты']]){const button=this.el.querySelector('.phone-'+selector);if(button)button.innerHTML=appIcon(name)+'<span>'+label+'</span>';}
    this.el.querySelector('.camera-album').setAttribute('aria-label','Открыть галерею');this.el.querySelector('.camera-album').innerHTML=appIcon('album');
    this.el.querySelector('.camera-shutter').innerHTML='<span class="shutter-disc"></span>';
    const volume=this.el.querySelector('.phone-radio-volume');volume.value=Math.round(audio.radio.media.volume*100);
    volume.oninput=()=>audio.radio.setVolume(Number(volume.value)/100);volume.onchange=()=>{s.save.settings.radioVolume=audio.radio.media.volume;s.persist();};
    this.resetGesture=bindCanvasGesture(this.canvas,{start:()=>{this.motion.stop();this.motion.status='Веди пальцем · масштаб двумя пальцами';},pan:(dx,dy)=>{const r=this.canvas.getBoundingClientRect();this.aim.drag(-dx/r.width*3,-dy/r.height*3);},zoom:factor=>{this.photoZoom=Math.max(.65,Math.min(2,(this.photoZoom??1)*factor));this.steady=0;}});
    this.canvas.onkeydown=e=>{const dirs={ArrowLeft:[-.07,0],ArrowRight:[.07,0],ArrowUp:[0,-.07],ArrowDown:[0,.07]};if(dirs[e.key]){e.preventDefault();this.aim.drag(...dirs[e.key]);}if(e.key==='Enter'||e.key===' '){e.preventDefault();this.shoot();}};
  }
  open(){if(!['district','hideout'].includes(this.s.mode)||this.s.tutorial.scripted)return;this.returnMode=this.s.mode;this.s.mode='phone';this.s.player.path=[];this.el.hidden=false;if(this.s.save.phone.unlocked)this.messages();else this.radio();this.focusScope.open(this.toggle);}
  close(){this.resetGesture();this.motion.stop();this.el.hidden=true;document.getElementById('app').dataset.camera='false';this.s.mode=this.returnMode??'district';this.update(0);this.s.emit('mode');this.focusScope.close();}
  messages(){const fromCamera=this.screen==='camera';this.motion.stop();this.screen='messages';document.getElementById('app').dataset.camera='false';if(this.s.save.phone.unlocked){this.s.save.phone.read=true;this.s.persist();}this.el.querySelector('.flip-phone').hidden=false;this.el.querySelector('.phone-camera-view').hidden=true;this.el.querySelector('.phone-message').hidden=false;this.el.querySelector('.phone-gallery').hidden=true;this.el.querySelector('.phone-radio').hidden=true;if(fromCamera)this.el.querySelector('.phone-camera').focus();}
  radio(){this.messages();this.screen='radio';this.el.querySelector('.phone-message').hidden=true;this.el.querySelector('.phone-radio').hidden=false;}
  camera(){
    if(!this.s.save.phone.unlocked)return;
    const target=nearbyPhotoSpot(this.s,this.returnMode);
    if(!target){this.gallery();return;}
    this.target=target;this.screen='camera';this.photoZoom=1;this.aim=new AimController();this.motion.aim=this.aim;this.motion.destroy();this.motion=new MotionAim(this.aim);this.steady=0;
    this.el.querySelector('.flip-phone').hidden=true;this.el.querySelector('.phone-camera-view').hidden=false;this.canvas.focus();
    document.getElementById('app').dataset.camera='true';
    this.thumbnail();
  }
  gallery(){
    this.messages();this.screen='gallery';this.el.querySelector('.phone-message').hidden=true;const box=this.el.querySelector('.phone-gallery');box.hidden=false;box.replaceChildren();box.classList.remove('photo-expanded');
    if(!this.s.save.phone.photos.length){box.textContent='Пока пусто. Первый кадр ждёт в камере.';return;}
    for(const photo of [...this.s.save.phone.photos].reverse()){
      const card=document.createElement('figure'),label=document.createElement('figcaption'),button=document.createElement('button');button.className='gallery-photo';button.setAttribute('aria-label','Открыть фото · день '+photo.day);button.append(this.photoMedia(photo));button.onclick=()=>{box.replaceChildren();const back=document.createElement('button');back.className='gallery-return';back.textContent='← Все фото';back.onclick=()=>this.gallery();box.classList.add('photo-expanded');box.append(back,this.photoMedia(photo));};label.textContent='День '+photo.day+' · '+photo.quality+'%';card.append(button,label);box.append(card);
    }
  }
  photoMedia(photo){
    if(photo.image){const img=document.createElement('img');img.src=photo.image;img.alt='Граффити · день '+photo.day;return img;}
    const canvas=document.createElement('canvas');canvas.width=240;canvas.height=360;this.drawScene(canvas.getContext('2d'),240,360,photo.art,photo.x??0,photo.y??0,photo.period??'night');return canvas;
  }
  drawScene(c,w,h,art,x=0,y=0,period='night'){
    const img=this.renderer.atlas.images.camera;if(!img)return;
    const {x:ox,y:oy,w:iw,h:ih}=cameraFrame(w,h,img.width,img.height,x,y);
    c.save();c.beginPath();c.rect(0,0,w,h);c.clip();if(period==='day')c.filter='brightness(1.4) saturate(.8)';c.drawImage(img,ox,oy,iw,ih);
    const mural=CAMERA_MURAL;
    c.translate(ox,oy);c.scale(iw/1536,ih/1024);c.translate(mural.x,mural.y);
    c.transform(1,mural.rise/mural.width,0,1,0,0);
    c.beginPath();c.rect(0,0,mural.width,mural.height);c.clip();
    this.renderer.drawGraffiti(c,art,0,0,mural.width,mural.height);c.restore();
  }
  shoot(){
    if(this.screen!=='camera')return;
    if(this.aim.quality<75||this.steady<.55){this.motion.status='Совмести рисунок с рамкой и удержи телефон';return;}
    // Capture the rendered world pixels before the shutter flash, without any DOM HUD.
    const shot=document.createElement('canvas'),scale=Math.min(1,640/this.canvas.width,960/this.canvas.height);shot.width=Math.round(this.canvas.width*scale);shot.height=Math.round(this.canvas.height*scale);
    this.renderer.photograph(shot.getContext('2d'),this.s,shot.width,shot.height,this.target,this.aim,this.photoZoom);
    let quality=.7,image=shot.toDataURL('image/jpeg',quality);while(image.length>180000&&quality>.25){quality-=.1;image=shot.toDataURL('image/jpeg',quality);}
    const photo={wall:this.target.wall_id,art:this.target.graffiti_id,day:this.s.life.state.day,period:this.s.life.state.period,x:this.aim.x,y:this.aim.y,quality:this.aim.quality,image};
    this.s.save.phone.photos.push(photo);this.s.save.phone.photos=this.s.save.phone.photos.slice(-12);this.s.persist();this.s.tutorial.finishPhoto?.();
    this.flash=.18;this.motion.status='Снимок сохранён в альбом';this.steady=0;this.thumbnail();
  }
  thumbnail(){const photo=this.s.save.phone.photos.at(-1);if(!photo)return;const button=this.el.querySelector('.camera-album');button.replaceChildren(this.photoMedia(photo));}
  update(dt){
    this.toggle.hidden=!['district','hideout'].includes(this.s.mode);this.toggle.dataset.unread=String(this.s.save.phone.unlocked&&!this.s.save.phone.read);
    for(const selector of ['.phone-sms','.phone-camera','.phone-album'])this.el.querySelector(selector).disabled=!this.s.save.phone.unlocked;
    const photoSpot=nearbyPhotoSpot(this.s,this.s.mode==='phone'?this.returnMode:this.s.mode);
    const camera=this.el.querySelector('.phone-camera');camera.hidden=!photoSpot;
    camera.title=photoSpot?'Снять: '+photoSpot.name:'';
    if(this.s.mode==='phone'&&this.screen==='radio'){
      const radio=this.audio.radio;this.el.querySelector('.phone-radio-status').textContent=radio.state==='error'?radio.message:radio.state==='loading'?'Подключаемся…':radio.state==='playing'?'В ЭФИРЕ · HIP-HOP / R&B':'Твой саундтрек улиц';
      const button=this.el.querySelector('.phone-radio-play');button.textContent=radio.wanted?'Выключить':'Включить';button.setAttribute('aria-pressed',String(radio.wanted));
    }
    if(this.s.mode!=='phone'||this.screen!=='camera')return;
    const r=this.canvas.getBoundingClientRect();this.canvas.width=Math.round(r.width);this.canvas.height=Math.round(r.height);
    const delta=Math.hypot(this.aim.x-this.previous.x,this.aim.y-this.previous.y);this.steady=delta<.012?this.steady+dt:0;this.previous={x:this.aim.x,y:this.aim.y};
    this.renderer.photograph(this.c,this.s,this.canvas.width,this.canvas.height,this.target,this.aim,this.photoZoom);
    if(this.flash>0){this.flash-=dt;this.c.fillStyle='#ffffffaa';this.c.fillRect(0,0,this.canvas.width,this.canvas.height);}
    this.el.querySelector('.camera-score').textContent=this.aim.quality>=75&&this.steady>=.55?'В фокусе. Снимай':'Кадр '+this.aim.quality+'%. Удержи';
    this.el.querySelector('.camera-status').textContent=this.motion.status;this.el.querySelector('.camera-focus').dataset.ready=String(this.aim.quality>=75&&this.steady>=.55);
  }
}
