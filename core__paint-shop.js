export const PAINT_STOCK=[{id:'pink',name:'BUBBLE PINK',color:'#ec64aa',price:90},{id:'lime',name:'ACID MINT',color:'#87dc9a',price:90},{id:'blue',name:'MIDNIGHT BLUE',color:'#568cda',price:120},{id:'wide_cap',name:'Широкий кэп',color:'#e4bf72',price:250}];
export function buyPaint(s,id){
  const item=PAINT_STOCK.find(p=>p.id===id);if(!item||s.mode!=='paint-shop')return false;
  const owned=s.save.paintShop??={owned:[]};
  if(owned.owned.includes(id)||id==='wide_cap'&&s.save.hideout.upgrades.includes('spray_rack'))return false;
  if(s.save.money<item.price)return false;
  s.save.money-=item.price;owned.owned.push(id);
  if(id==='wide_cap')s.save.hideout.upgrades.push('spray_rack');else s.save.player.ink=id;
  s.persist();s.notice(id==='wide_cap'?'С широким кэпом рисую быстрее.':'Новый цвет — '+item.name+'!');return true;
}
