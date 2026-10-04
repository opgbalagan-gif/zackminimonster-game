export const OUTFITS=[
  {id:'zack',name:'ORIGINAL',detail:'Песочный streetwear',prefix:'hero',walls:0},
  {id:'night',name:'NIGHT CREW',detail:'Чёрный худи · жёлтые кеды',prefix:'night',walls:0},
  {id:'metro',name:'METRO RIDER',detail:'Серебро · городской шлем',prefix:'metro',walls:3}
];
export const INKS=[
  {id:'purple',name:'MONSTER PURPLE',color:'#cb73e5'},
  {id:'cyan',name:'SUBWAY CYAN',color:'#70d5dc'},
  {id:'gold',name:'SUNNY YELLOW',color:'#edc853'},
  {id:'pink',name:'BUBBLE PINK',color:'#ec64aa'},{id:'lime',name:'ACID MINT',color:'#87dc9a'},{id:'blue',name:'MIDNIGHT BLUE',color:'#568cda'}
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
  const width=Math.max(w,h/1.5)*1.12,height=width*1.5;
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  return {x:clamp((w-width)/2+(camera.x??0),w-width,0),y:clamp((h-height)/2+(camera.y??0),h-height,0),w:width,h:height,clipBottom:h};
}
export const roomPoint=(x,y)=>({x:.08+.86*x,y:.075+.86*y});
export const ROOM_POINTS=Object.fromEntries(Object.entries({
  wardrobe:{x:.86,y:.39},sprays:{x:.27,y:.32},collection:{x:.62,y:.16},
  rest:{x:.57,y:.30},save:{x:.17,y:.43},music:{x:.78,y:.57},pet:{x:.54,y:.60},exit:{x:.695,y:.79}
}).map(([key,p])=>[key,roomPoint(p.x,p.y)]));
// Coordinates follow the actual illustrated furniture in room-comic-v8.
export const ROOM_REGIONS={
 wardrobe:[[745,553],[903,600],[903,715],[746,671]],
 sprays:[[310,489],[398,475],[398,592],[310,624]],
 collection:[[533,280],[692,343],[692,427],[533,363]],
 rest:[[469,471],[571,432],[696,520],[696,585],[586,629],[469,558]],
 save:[[114,595],[270,555],[333,599],[181,676]],
 music:[[652,799],[790,753],[864,811],[729,868]],
 exit:[[575,1088],[686,1033],[686,1175],[575,1236]]
};
