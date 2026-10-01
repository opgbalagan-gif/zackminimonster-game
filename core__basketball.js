export const COURT={id:'court',name:'Не просто мяч',x:1132,y:1092,reward:300,
  friends:[{x:1088,y:1046,sprite:'court_dan'},{x:1155,y:1046,sprite:'court_ti'}]};
export const COURT_LINES=[
  {who:'ДЭН',side:'left',sprite:'court_dan',text:'Этот мяч вообще не крутой. Просто оранжевый круг. Никакого характера!'},
  {who:'ТИ',side:'right',sprite:'court_ti',text:'Он хотя бы в кольцо попадает. Но выглядит… как все остальные.'},
  {who:'ДЭН',side:'left',sprite:'court_dan',text:'Вот именно! На нашем корте должен быть мяч, который сразу узнают.'},
  {who:'ЗАК',side:'left',sprite:'zack',text:'Йоу, да давайте украсим мяч! У меня как раз есть наклейки. Добавим ему характер.'},
  {who:'ТИ',side:'right',sprite:'court_ti',text:'Договорились! Клей своих монстров. Пусть это будет наш мяч.'}
];
export const MARKERS=[
  {name:'Бирюзовый',color:'#39cbd0'},{name:'Жёлтый',color:'#ffe258'},
  {name:'Розовый',color:'#f36dab'},{name:'Синий',color:'#477deb'},
  {name:'Зелёный',color:'#8bd26b'},{name:'Лиловый',color:'#ae8ae8'},
  {name:'Кремовый',color:'#fff0d0'},{name:'Чёрный',color:'#17202c'}
];
export const BALL_GRID=48;
const inBall=(x,y)=>Math.hypot(x-.5,y-.5)<.47;
// Three overlapping faces form the guide; paint is allowed everywhere on the ball.
export function inDesign(x,y){
  return inBall(x,y)&&(((x-.43)/.28)**2+((y-.42)/.23)**2<1||
    ((x-.60)/.23)**2+((y-.64)/.21)**2<1||((x-.22)/.13)**2+((y-.66)/.14)**2<1);
}
export function cleanBallSave(raw){
  const pixels=Array.isArray(raw?.pixels)&&raw.pixels.length===BALL_GRID**2?
    raw.pixels.map((v,i)=>Number.isInteger(v)&&v>=0&&v<MARKERS.length&&inBall((i%BALL_GRID+.5)/BALL_GRID,(Math.floor(i/BALL_GRID)+.5)/BALL_GRID)?v:-1):[];
  const stickers=(Array.isArray(raw?.stickers)?raw.stickers:[]).slice(0,MAX_STICKERS)
    .filter(v=>v&&STICKERS.some(s=>s.id===v.id)&&[v.x,v.y,v.size,v.angle].every(Number.isFinite))
    .map(v=>fitSticker({id:v.id,x:v.x,y:v.y,size:Math.max(.18,Math.min(.44,v.size)),angle:((v.angle%360)+360)%360}));
  return {completed:raw?.completed===true,pixels,stickers};
}

export const STICKERS=[
  {id:'flow',name:'STREET FLOW',sprite:'mural_street_flow'},
  {id:'crew',name:'COLOR CREW',sprite:'mural_color_crew'},
  {id:'ghost',name:'PAPER GHOST',sprite:'mural_paper_ghost'},
  {id:'sunset',name:'SUNSET BLOCK',sprite:'mural_sunset_block'}
];
export const MAX_STICKERS=8;
// A sticker fits inside this radius at every rotation, including its white edge.
export function fitSticker(s){
  const dx=s.x-.5,dy=s.y-.5,d=Math.hypot(dx,dy),limit=.45-s.size*.61;
  if(d>limit){s.x=.5+dx/d*limit;s.y=.5+dy/d*limit;}return s;
}
export class BallArtGame{
  constructor(){this.stickers=[];this.selected=-1;this.pending='flow';this.drag=null;this.revision=0;}
  get coverage(){return Math.min(1,this.stickers.length/3);}
  get ready(){return this.stickers.length>=3;}
  get current(){return this.stickers[this.selected];}
  choose(id){if(!STICKERS.some(s=>s.id===id))return;this.pending=id;this.selected=-1;this.end();this.revision++;}
  hit(x,y){
    for(let i=this.stickers.length-1;i>=0;i--){const s=this.stickers[i],a=-s.angle*Math.PI/180,dx=x-s.x,dy=y-s.y;
      if(Math.abs(dx*Math.cos(a)-dy*Math.sin(a))<=s.size/2&&Math.abs(dx*Math.sin(a)+dy*Math.cos(a))<=s.size*.35)return i;}
    return -1;
  }
  begin(x,y){
    if(!Number.isFinite(x)||!Number.isFinite(y)||!inBall(x,y))return;
    if(this.pending){
      if(this.stickers.length>=MAX_STICKERS)return;
      this.stickers.push(fitSticker({id:this.pending,x,y,size:.32,angle:0}));this.selected=this.stickers.length-1;this.pending=null;
    }else{this.selected=this.hit(x,y);}
    if(this.current)this.drag={x:x-this.current.x,y:y-this.current.y};this.revision++;
  }
  move(x,y){if(!this.drag||!this.current||![x,y].every(Number.isFinite))return;
    fitSticker(Object.assign(this.current,{x:x-this.drag.x,y:y-this.drag.y}));this.revision++;}
  transform(sizeDelta=0,angleDelta=0){if(!this.current)return;
    this.current.size=Math.max(.18,Math.min(.44,this.current.size+sizeDelta));
    this.current.angle=(this.current.angle+angleDelta+360)%360;fitSticker(this.current);this.revision++;}
  remove(){if(!this.current)return;this.stickers.splice(this.selected,1);this.selected=-1;this.end();this.revision++;}
  end(){this.drag=null;}
  clear(){this.stickers=[];this.selected=-1;this.pending='flow';this.end();this.revision++;}
  snapshot(){return this.stickers.map(s=>({...s}));}
}
