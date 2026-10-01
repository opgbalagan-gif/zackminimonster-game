import {COURT_LINES,MARKERS,COURT} from './core__basketball.js';
import {drawBall} from './core__ball-art.js';
import {heroSprite} from './core__hideout.js';
const $=id=>document.getElementById(id);
export class CourtView{
  constructor(session,renderer){
    this.session=session;this.renderer=renderer;this.pointer=null;this.revision=-1;this.game=null;this.line=-1;
    $('court-next').onclick=()=>{session.advanceCourt();this.sync();};
    $('court-close').onclick=$('ball-cancel').onclick=()=>{session.cancelCourt();this.release();this.sync();};
    $('ball-finish').onclick=()=>{session.finishBall();this.release();this.sync();};
    $('ball-clear').onclick=()=>{session.ballGame?.clear();this.draw();this.sync();};
    for(const [i,marker] of MARKERS.entries()){
      const button=document.createElement('button');button.style.setProperty('--marker',marker.color);button.setAttribute('aria-label',marker.name);button.title=marker.name;
      button.onclick=()=>{if(session.ballGame)session.ballGame.color=i;this.sync();};$('marker-colors').append(button);
    }
    const canvas=$('ball-canvas');
    const paint=e=>{const r=canvas.getBoundingClientRect();session.ballGame?.move((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);this.draw();this.sync();};
    canvas.addEventListener('pointerdown',e=>{if(session.mode!=='ball-art'||this.pointer!==null||e.button!==0)return;e.preventDefault();this.pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);paint(e);});
    canvas.addEventListener('pointermove',e=>{if(e.pointerId===this.pointer&&session.mode==='ball-art')paint(e);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===this.pointer)this.release();});
    window.addEventListener('blur',()=>this.release());
  }
  release(){this.pointer=null;this.session.ballGame?.end();}
  portrait(canvas,sprite){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;
    this.renderer.atlas.draw(c,sprite==='zack'?heroSprite(this.session.save.player.skin):sprite,canvas.width/2,canvas.height-8,null,canvas.height-22);}
  sync(){
    const s=this.session,dialogue=s.mode==='court-dialogue',painting=s.mode==='ball-art',result=s.mode==='ball-result';
    $('court-screen').hidden=!dialogue;$('ball-screen').hidden=!painting&&!result;
    if(dialogue){
      const line=COURT_LINES[s.courtLine];$('court-screen').dataset.speaker=line.side;
      $('court-who').textContent=line.who;$('court-text').textContent=line.text;$('court-count').textContent=String(s.courtLine+1).padStart(2,'0')+' / 05';
      $('court-next').textContent=s.courtLine===COURT_LINES.length-1?'РАЗРИСОВАТЬ МЯЧ →':'ДАЛЬШЕ →';
      if(this.line!==s.courtLine){this.portrait($('court-left'),s.courtLine>=3?'zack':'court_dan');this.portrait($('court-right'),'court_ti');this.line=s.courtLine;}
    }else this.line=-1;
    if(painting||result){
      $('ball-screen').dataset.phase=result?'result':'paint';
      $('ball-title').textContent=result?'ТЕПЕРЬ У НЕГО ЕСТЬ ХАРАКТЕР':'НЕ ПРОСТО МЯЧ';
      $('ball-help').textContent=result?'ТИ: «Вот это наш мяч! На всём районе второго такого нет».':'Выбери маркер и закрась светлые силуэты. Цвета можно смешивать — нужно 72%.';
      $('ball-finish').textContent=result?'ВЕРНУТЬСЯ НА КОРТ →':'ПОДАРИТЬ МЯЧ →';
      $('ball-finish').disabled=painting&&!s.ballGame?.ready;
      $('ball-cancel').hidden=result;$('ball-clear').hidden=result;$('marker-colors').hidden=result;
      $('ball-progress').hidden=result;$('ball-coverage').textContent=result?(s.ballReward?'+'+COURT.reward+' REP · МЯЧ В КОЛЛЕКЦИИ':'РИСУНОК ОБНОВЛЁН'):Math.floor((s.ballGame?.coverage??0)*100)+'%';
      $('ball-progress').value=s.ballGame?.coverage??0;
      [...$('marker-colors').children].forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===s.ballGame?.color));});
      this.draw();
    }else this.release();
  }
  draw(){
    const s=this.session;if(!['ball-art','ball-result'].includes(s.mode)||!s.ballGame)return;
    if(this.game===s.ballGame&&this.revision===s.ballGame.revision)return;this.game=s.ballGame;this.revision=s.ballGame.revision;
    const c=$('ball-canvas').getContext('2d');c.clearRect(0,0,600,600);drawBall(c,s.ballGame.pixels,600,{guide:true});
  }
}
