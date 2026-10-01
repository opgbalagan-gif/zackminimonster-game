import {createDistrict as createBlock} from './content__district_01__district.js';

// Tile-aligned neighbourhoods preserve the painted streets and all old East Block IDs.
export function createDistrict(){
  const base=createBlock(),world={...base,width:5600,height:4928,name:'MINI MONSTER CITY',version:13};
  world.regions=[
    {id:'east',name:'EAST BLOCK',subtitle:'Дома, магазины и первый тег',x:0,y:0,w:2400,h:2112,color:'#edca69',required:0},
    {id:'harbour',name:'HARBOUR YARD',subtitle:'Склады на берегу реки',x:3200,y:0,w:2400,h:2112,color:'#72c8d5',required:800},
    {id:'arts',name:'COLOUR QUARTER',subtitle:'Мастерские и уличное искусство',x:3200,y:2816,w:2400,h:2112,color:'#ef8f91',required:1200},
    {id:'downtown',name:'OLD DOWNTOWN',subtitle:'Кирпичные дома у моря',x:0,y:2816,w:2400,h:2112,color:'#a7ce83',required:1600}
  ];
  world.bridges=[
    {id:'bridge_harbour',name:'Речной мост → HARBOUR YARD',from:'east',to:'harbour',x:2352,y:1196,w:896,h:88,approach:{x:2310,y:1240}},
    {id:'bridge_arts',name:'Южный мост → COLOUR QUARTER',from:'harbour',to:'arts',x:3496,y:2064,w:96,h:800,approach:{x:3544,y:2016}},
    {id:'bridge_downtown',name:'Старый мост → OLD DOWNTOWN',from:'arts',to:'downtown',x:2352,y:4012,w:896,h:88,approach:{x:3290,y:4056}}
  ];
  for(const key of ['buildings','targets','props','obstacles','police','safeSpots','roads','hoops','zones','boundaries','backdrop'])world[key]=[];
  world.hideouts=[];
  const variants=[null,['warehouse','workshop','warehouse','warehouse','laundry','workshop'],['records','diner','laundry','records','records','workshop'],['brownstone','brownstone','brownstone','laundry','diner','brownstone']];
  for(const [i,region] of world.regions.entries()){
    const id=value=>i?value?.replace(/^D01_/,'D0'+(i+1)+'_'):value;
    const shift=p=>({...p,x:p.x+region.x,y:p.y+region.y});
    for(const key of ['buildings','targets','props','obstacles','police','safeSpots','roads','hoops']){
      for(const source of base[key]){
        if(source.boundary||(i&&source.pillar))continue;
        const item=shift(structuredClone(source));item.regionId=region.id;
        if(item.id)item.id=id(item.id);
        if(item.wall_id){item.wall_id=id(item.wall_id);item.name=region.name+' / '+item.name;}
        if(item.buildingId)item.buildingId=id(item.buildingId);
        if(item.approach)item.approach=shift(item.approach);
        if(item.route)item.route=item.route.map(shift);
        if(key==='buildings'&&i)item.type=variants[i][world.buildings.length%variants[i].length];
        world[key].push(item);
      }
    }
    world.hideouts.push({...shift(base.hideout),id:id(base.hideout.id),regionId:region.id,name:'Убежище / '+region.name});
    // Quays are solid except for the three bridge mouths.
    const sides=[{x:region.x+16,y:region.y+16,w:2368,h:10},
      {x:region.x+16,y:region.y+2086,w:2368,h:10},
      {x:region.x+16,y:region.y+26,w:10,h:2060},
      {x:region.x+2374,y:region.y+26,w:10,h:2060}];
    for(const edge of sides){
      let pieces=[edge];
      for(const bridge of world.bridges){
        pieces=pieces.flatMap(p=>{
          if(p.x>=bridge.x+bridge.w||p.x+p.w<=bridge.x||p.y>=bridge.y+bridge.h||p.y+p.h<=bridge.y)return[p];
          const axis=p.w>p.h?'x':'y',size=axis==='x'?'w':'h',a=bridge[axis]-8,b=bridge[axis]+bridge[size]+8;
          return [{...p,[size]:Math.max(0,a-p[axis])},{...p,[axis]:b,[size]:Math.max(0,p[axis]+p[size]-b)}].filter(q=>q[size]>0);
        });
      }
      world.boundaries.push(...pieces);
    }
    // A small promenade on each shore; different architecture gives each quarter a silhouette.
    for(let y=940;y<1960;y+=220)world.props.push({type:i===1?'lamp':'palm',x:region.x+2325,y:region.y+y,width:i===1?25:66});
  }
  world.obstacles.push(...world.boundaries.map(r=>({...r,boundary:true})));
  world.walkableAreas=[...world.regions,...world.bridges];
  world.metro={...base.metro,x:30,end:2370};
  world.river={name:'РЕКА FLOW',x:2800,y:720};
  return world;
}
