import {COURT_LINES,STICKERS,MAX_STICKERS,COURT} from './core__basketball.js?v=09df463d6cde';
import {drawBall,drawSticker} from './core__ball-art.js?v=09df463d6cde';
import {heroSprite} from './core__hideout.js?v=09df463d6cde';
const $=id=>document.getElementById(id);
export class CourtView{
  constructor(session,renderer){
    this.session=session;this.renderer=renderer;this.pointer=null;this.revision=-1;this.game=null;this.line=-1;
    $('court-next').onclick=()=>{session.advanceCourt();this.sync();};
    $('court-close').onclick=$('ball-cancel').onclick=()=>{session.cancelCourt();this.release();this.sync();};
    $('ball-finish').onclick=()=>{session.finishBall();this.release();this.sync();};
    $('ball-clear').onclick=()=>{session.ballGame?.clear();this.draw();this.sync();};
    for(const sticker of STICKERS){
      const button=document.createElement('button');button.setAttribute('aria-label','Наклейка '+sticker.name);button.title=sticker.name;
      const preview=document.createElement('canvas');preview.width=100;preview.height=80;preview.setAttribute('aria-hidden','true');
      drawSticker(preview.getContext('2d'),renderer.atlas,{id:sticker.id,x:.5,y:.4,size:.8,angle:0},100);
      const label=document.createElement('span');label.textContent=sticker.name;button.append(preview,label);
      button.onclick=()=>{session.ballGame?.choose(sticker.id);this.sync();};$('sticker-tray').append(button);
    }
    for(const [id,size,angle] of [['sticker-smaller',-.04,0],['sticker-larger',.04,0],['sticker-turn',0,15]])
      $(id).onclick=()=>{session.ballGame?.transform(size,angle);this.sync();};
    $('sticker-delete').onclick=()=>{session.ballGame?.remove();this.sync();};
    const canvas=$('ball-canvas');
    const paint=(e,begin=false)=>{const r=canvas.getBoundingClientRect(),g=session.ballGame;if(g)g[begin?'begin':'move']((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);this.sync();};
    canvas.addEventListener('pointerdown',e=>{if(session.mode!=='ball-art'||this.pointer!==null||e.button!==0)return;e.preventDefault();this.pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);paint(e,true);});
    canvas.addEventListener('pointermove',e=>{if(e.pointerId===this.pointer&&session.mode==='ball-art')paint(e);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===this.pointer)this.release();});
    window.addEventListener('blur',()=>this.release());
  }
  release(){this.pointer=null;this.session.ballGame?.end();}
  portrait(canvas,sprite){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;
    if(sprite==='zack'){
      const width=canvas.width-16,rect=this.renderer.atlas.rect('zack_bust'),height=width*rect[3]/rect[2];
      this.renderer.atlas.draw(c,'zack_bust',canvas.width/2,22+height,width,height,canvas.id==='court-left');return;
    }
    if(sprite.startsWith('roby_portrait')){
      const rect=this.renderer.atlas.rect(sprite),width=canvas.width-16,height=width*rect[3]/rect[2];
      c.imageSmoothingEnabled=true;this.renderer.atlas.draw(c,sprite,canvas.width/2,22+height,width,height);return;
    }
    this.renderer.atlas.draw(c,sprite==='zack'?heroSprite(this.session.save.player.skin):sprite,canvas.width/2,canvas.height-8,null,canvas.height-22,sprite==='zack');}
  sync(){
    const s=this.session,dialogue=s.mode==='court-dialogue',painting=s.mode==='ball-art',result=s.mode==='ball-result';
    $('court-screen').hidden=!dialogue;$('ball-screen').hidden=!painting&&!result;
    if(dialogue){
      const lines=s.streetDialogue?.lines??COURT_LINES,line=lines[s.courtLine];$('court-screen').dataset.speaker=line.side;
      $('court-screen').setAttribute('aria-label',s.streetDialogue?'Разговор с Робби':'Комикс: Не просто мяч');
      $('court-title').textContent=s.streetDialogue?'РОББИ · СВОЙ В РАЙОНЕ':'НЕ ПРОСТО МЯЧ.';
      $('court-who').textContent=line.who;$('court-text').textContent=line.text;$('court-count').textContent=String(s.courtLine+1).padStart(2,'0')+' / '+String(lines.length).padStart(2,'0');
      $('court-next').textContent=s.courtLine===lines.length-1?(s.streetDialogue?'ДО ВСТРЕЧИ →':'НАКЛЕИТЬ СТИКЕРЫ →'):'ДАЛЬШЕ →';
      if(this.line!==s.courtLine){
        this.portrait($('court-left'),s.streetDialogue?'roby_portrait_'+line.robyExpression:s.courtLine>=3?'zack':'court_dan');
        this.portrait($('court-right'),s.streetDialogue?'zack':'court_ti');
        const emotions={smirk:'ухмылка',smile:'улыбка',serious:'серьёзный',laugh:'смеётся'};
        $('court-left').setAttribute('aria-label',s.streetDialogue?'Робби — '+emotions[line.robyExpression]:s.courtLine>=3?'Зак':'Дэн');
        $('court-right').setAttribute('aria-label',s.streetDialogue?'Зак':'Ти с мячом');this.line=s.courtLine;
      }
    }else this.line=-1;
    if(painting||result){
      $('ball-screen').dataset.phase=result?'result':'paint';
      $('ball-title').textContent=result?'ТЕПЕРЬ У НЕГО ЕСТЬ ХАРАКТЕР':'НЕ ПРОСТО МЯЧ';
      const g=s.ballGame;
      $('ball-help').textContent=result?'ТИ: «Вот это наш мяч! На всём районе второго такого нет».':g.stickers.length>=MAX_STICKERS?'На мяче 8 наклеек. Двигай, поворачивай или убери лишнюю.':g.pending?'Выбери наклейку и коснись мяча. Приклей минимум 3 — получится твой стикер-болл.':'Двигай наклейку пальцем. Меняй размер, поворачивай или выбери следующую.';
      $('ball-finish').textContent=result?'ВЕРНУТЬСЯ НА КОРТ →':'ПОДАРИТЬ МЯЧ →';
      $('ball-finish').disabled=painting&&!s.ballGame?.ready;
      $('ball-cancel').hidden=result;$('ball-clear').hidden=result;$('sticker-tray').hidden=result;$('sticker-tools').hidden=result;
      $('ball-progress').hidden=result;$('ball-coverage').textContent=result?(s.ballReward?'+'+COURT.reward+' REP · МЯЧ В КОЛЛЕКЦИИ':'МЯЧ ОБНОВЛЁН'):g.stickers.length+' / 3 НАКЛЕЙКИ'+(g.ready?' · ГОТОВО':'');
      $('ball-progress').value=s.ballGame?.coverage??0;
      [...$('sticker-tray').children].forEach((button,i)=>{button.setAttribute('aria-pressed',String(STICKERS[i].id===g.pending));button.disabled=g.stickers.length>=MAX_STICKERS;});
      for(const id of ['sticker-smaller','sticker-larger','sticker-turn','sticker-delete'])$(id).disabled=!g.current;
      this.draw();
    }else this.release();
  }
  draw(){
    const s=this.session;if(!['ball-art','ball-result'].includes(s.mode)||!s.ballGame)return;
    const signature=s.ballGame.revision+':'+s.mode;
    if(this.game===s.ballGame&&this.revision===signature)return;this.game=s.ballGame;this.revision=signature;
    const c=$('ball-canvas').getContext('2d');c.clearRect(0,0,600,600);drawBall(c,s.ballGame,600,{atlas:this.renderer.atlas,selected:s.mode==='ball-art'?s.ballGame.selected:-1});
  }
}
