import {NavigationGrid} from './core__navigation.js?v=5e1de61c4ab4';
export function addPaintFacades(w){
  const nav=new NavigationGrid(w),template=w.targets[0];
  for(const b of w.buildings){
    // Shop glazing is not a blank plaster wall.
    if(b.nanoVariant===1||b.nanoVariant===4)continue;
    for(const face of ['front','side']){
      if(face==='side'&&w.targets.some(t=>t.buildingId===b.id&&!t.face))continue;
      const candidates=[.5,.3,.7].map(t=>face==='front'?{x:b.x+b.w*t,y:b.y+b.h+32}:{x:b.x+b.w+32,y:b.y+b.h*t});
      const approach=candidates.find(p=>nav.canWalk(p.x,p.y)&&!w.roads.some(r=>p.x>r.x&&p.x<r.x+r.w&&p.y>r.y&&p.y<r.y+r.h));
      if(!approach)continue;
      w.targets.push({...template,wall_id:'SANDBOX_FACE_'+b.id.toUpperCase()+'_'+face.toUpperCase(),buildingId:b.id,face,name:(face==='front'?'Передний фасад':'Боковая стена')+' · дом '+(w.buildings.indexOf(b)+1),x:approach.x,y:approach.y,approach,graffiti_id:'zack_tag',rep_reward:60,heat_reward:1});
    }
  }
  const shop=w.buildings.find(b=>b.id==='north_infill_4');
  shop.shop=true;w.paintShop={id:'paint_shop',name:'COLOR LAB · магазин красок',x:shop.x+shop.w+38,y:shop.y+shop.h+25};
  if(!nav.canWalk(w.paintShop.x,w.paintShop.y)){const cell=nav.closest(w.paintShop);if(cell>=0)Object.assign(w.paintShop,nav.point(cell));}
  w.mapRoutes.push({...w.paintShop});return w;
}

export function facadePaintArea(art,b,face){
  if(face!=='front')return {rect:art.mural,slope:art.slope};
  if(b.nanoVariant!==undefined){
    const v=b.nanoVariant;
    return {rect:v===0?[139,365,103,62]:v===2?[123,397,121,43]:v===3?[32,392,135,48]:[44,391,64,55],slope:.5};
  }
  const variant=Number(art.id.at(-1));
  // Keep small residential marks on the plaster plinth; garage marks fit
  // entirely on the shutter and stop before the pedestrian doorway.
  const fronts=[[125,514,80,32],[107,426,86,64],[125,503,80,34],[112,369,92,80]];
  return {rect:fronts[variant]??[40,476,110,45],slope:.5};
}
