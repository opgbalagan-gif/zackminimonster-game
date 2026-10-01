export const COURT={id:'court',name:'Не просто мяч',x:1132,y:1092,reward:300,
  friends:[{x:1088,y:1046,sprite:'court_dan'},{x:1155,y:1046,sprite:'court_ti'}]};
export const COURT_LINES=[
  {who:'ДЭН',side:'left',sprite:'court_dan',text:'Этот мяч вообще не крутой. Просто оранжевый круг. Никакого характера!'},
  {who:'ТИ',side:'right',sprite:'court_ti',text:'Он хотя бы в кольцо попадает. Но выглядит… как все остальные.'},
  {who:'ДЭН',side:'left',sprite:'court_dan',text:'Вот именно! На нашем корте должен быть мяч, который сразу узнают.'},
  {who:'ЗАК',side:'left',sprite:'zack',text:'Йоу, да давайте украсим мяч! Маркеры с собой. Добавим ему характер.'},
  {who:'ТИ',side:'right',sprite:'court_ti',text:'Договорились! Выбирай цвета и рисуй. Пусть это будет наш мяч.'}
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
  return {completed:raw?.completed===true,pixels};
}
export class BallArtGame{
  constructor(){this.pixels=Array(BALL_GRID**2).fill(-1);this.color=0;this.last=null;this.required=.72;this.revision=0;
    this.mask=this.pixels.map((_,i)=>inDesign((i%BALL_GRID+.5)/BALL_GRID,(Math.floor(i/BALL_GRID)+.5)/BALL_GRID));
    this.total=this.mask.filter(Boolean).length;this.painted=0;}
  get coverage(){return this.painted/this.total;}
  get ready(){return this.coverage>=this.required;}
  move(x,y){
    if(!Number.isFinite(x)||!Number.isFinite(y))return;
    if(!inBall(x,y)){this.end();return;}
    const previous=this.last??{x,y},steps=Math.max(1,Math.ceil(Math.hypot(x-previous.x,y-previous.y)*BALL_GRID*2));
    for(let i=0;i<=steps;i++)this.dab(previous.x+(x-previous.x)*i/steps,previous.y+(y-previous.y)*i/steps);
    this.last={x,y};this.revision++;
  }
  dab(x,y){
    const radius=2.1,cx=x*BALL_GRID,cy=y*BALL_GRID;
    for(let row=Math.max(0,Math.floor(cy-radius));row<=Math.min(BALL_GRID-1,Math.ceil(cy+radius));row++)
      for(let col=Math.max(0,Math.floor(cx-radius));col<=Math.min(BALL_GRID-1,Math.ceil(cx+radius));col++){
        if(Math.hypot(col+.5-cx,row+.5-cy)>radius||!inBall((col+.5)/BALL_GRID,(row+.5)/BALL_GRID))continue;
        const i=row*BALL_GRID+col;if(this.pixels[i]<0&&this.mask[i])this.painted++;this.pixels[i]=this.color;
      }
  }
  end(){this.last=null;}
  clear(){this.pixels.fill(-1);this.painted=0;this.end();this.revision++;}
}
