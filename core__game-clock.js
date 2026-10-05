// Keep the existing save format: day starts at 06:00, night at 18:00.
export const PERIOD_SECONDS=240;
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function gameClock(state){
  const hour=((state.period==='night'?18:6)+Math.max(0,state.elapsed)/PERIOD_SECONDS*12)%24;
  const minutes=Math.floor(hour*60),darkness=1-smooth(5,8,hour)+smooth(17,20,hour);
  const warmth=Math.max(0,1-Math.abs(hour-6.5)/1.8,1-Math.abs(hour-18.5)/1.8);
  return {hour,darkness:Math.min(1,darkness),warmth,text:String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0'),label:hour<5||hour>=21?'Ночь':hour<9?'Утро':hour<17?'День':'Вечер'};
}
export function blendTime(c,amount,draw){
  draw(false);if(amount<=0)return;c.save();c.globalAlpha*=amount;draw(true);c.restore();
}
