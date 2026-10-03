export const OUTFITS=[
  {id:'zack',name:'ORIGINAL',detail:'Песочный streetwear',prefix:'hero',walls:0},
  {id:'night',name:'NIGHT CREW',detail:'Чёрный худи · жёлтые кеды',prefix:'night',walls:0},
  {id:'metro',name:'METRO RIDER',detail:'Серебро · городской шлем',prefix:'metro',walls:3}
];
export const INKS=[
  {id:'purple',name:'MONSTER PURPLE',color:'#cb73e5'},
  {id:'cyan',name:'SUBWAY CYAN',color:'#70d5dc'},
  {id:'gold',name:'SUNNY YELLOW',color:'#edc853'}
];
export const TROPHIES=[
  {id:'mini',name:'MINI MONSTER',detail:'Твой первый напарник',walls:0},
  {id:'tag',name:'FIRST MARK',detail:'Сохрани первую стену',walls:1},
  {id:'metro',name:'EAST EXPRESS',detail:'Сохрани 4 стены',walls:4},
  {id:'king',name:'BLOCK KING',detail:'Весь район — твоя галерея',walls:10}
];
export const outfit=id=>OUTFITS.find(o=>o.id===id)??OUTFITS[0];
export const ink=id=>INKS.find(o=>o.id===id)??INKS[0];
export const wallCount=n=>n+' '+(n%100>=11&&n%100<=14?'стен':n%10===1?'стена':[2,3,4].includes(n%10)?'стены':'стен');
export function heroSprite(skin,state='IDLE',facing='down',step=false){
  const prefix=outfit(skin).prefix;
  const actions={SHAKE_CAN:'shake',SPRAY:'spray',HIDE:'hide',CAUGHT:prefix==='hero'?'caught':'hide',VICTORY:'victory'};
  return prefix+'_'+(actions[state]??((prefix==='hero'&&step?'walk_':'')+facing));
}
export function roomLayout(w,h,tutorial=false,camera={}){
  if(camera.overview){const width=Math.min(w-16,Math.max(80,h-130)/1.5);return {x:(w-width)/2,y:80,w:width,h:width*1.5,clipBottom:h};}
  const width=Math.max(w,h/1.5)*1.12,height=width*1.5;
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  return {x:clamp((w-width)/2+(camera.x??0),w-width,0),y:clamp((h-height)/2+(camera.y??0),h-height,0),w:width,h:height,clipBottom:h};
}
export const roomPoint=(x,y)=>({x:.08+.86*x,y:.075+.86*y});
export const ROOM_POINTS=Object.fromEntries(Object.entries({
  wardrobe:{x:.86,y:.39},sprays:{x:.27,y:.32},collection:{x:.62,y:.16},
  rest:{x:.57,y:.30},save:{x:.17,y:.43},music:{x:.78,y:.57},pet:{x:.54,y:.60},exit:{x:.695,y:.79}
}).map(([key,p])=>[key,roomPoint(p.x,p.y)]));
