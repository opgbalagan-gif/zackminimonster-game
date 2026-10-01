import {createDistrict as createBlock} from './content__district_01__district.js';
import {onLand} from './core__land.js';
import {expandCoast} from './content__district_01__coastal-expansion.js';
import {metroRoute,loopPosition} from './content__district_01__metro.js';
import {planRoadEnds} from './content__district_01__road-ends.js';
export function createDistrict(){
  const base=createBlock(),world={...base,width:6400,height:5632,name:'MINI MONSTER CITY',version:15};
  world.regions=[
    {id:'east',name:'EAST BLOCK',subtitle:'Кварталы, FLOW MALL и стритрейсеры',x:0,y:0,w:3200,h:2816,color:'#edca69',required:0},
    {id:'harbour',name:'HARBOUR CITY',subtitle:'Порт, небоскрёбы и набережная',x:3200,y:0,w:3200,h:2816,color:'#72c8d5',required:800},
    {id:'arts',name:'COLOUR QUARTER',subtitle:'Арт-переулки и ночные гаражи',x:3200,y:2816,w:3200,h:2816,color:'#ef8f91',required:1200},
    {id:'downtown',name:'OLD DOWNTOWN',subtitle:'Высотный центр и морской бульвар',x:0,y:2816,w:3200,h:2816,color:'#a7ce83',required:1600}
  ];
  world.landPolygons=[[{x:48,y:48},{x:3008,y:48},{x:3008,y:5552},{x:500,y:5552},{x:48,y:5100}],
    [{x:3200,y:48},{x:5900,y:48},{x:6352,y:500},{x:6352,y:5100},{x:5900,y:5552},{x:3200,y:5552}]];
  world.bridges=[
    {id:'bridge_harbour',kind:'bridge',name:'Речной мост → HARBOUR CITY',from:'east',to:'harbour',x:2960,y:1184,w:288,h:112,approach:{x:2916,y:1240}},
    {id:'bridge_arts',kind:'street',name:'Бульвар → COLOUR QUARTER',from:'harbour',to:'arts',x:3488,y:2752,w:112,h:128,approach:{x:3544,y:2710}},
    {id:'bridge_downtown',kind:'bridge',name:'Южный мост → OLD DOWNTOWN',from:'arts',to:'downtown',x:2960,y:4000,w:288,h:112,approach:{x:3290,y:4056}},
    {id:'avenue_downtown',kind:'street',name:'Проспект → OLD DOWNTOWN',from:'east',to:'downtown',x:832,y:2752,w:128,h:128,approach:{x:896,y:2710}}
  ];
  for(const key of ['buildings','targets','props','obstacles','police','safeSpots','roads','hoops','zones','boundaries','backdrop'])world[key]=[];
  world.hideouts=[];world.parkingLots=[];
  const variants=[null,['warehouse','workshop','warehouse','warehouse','laundry','workshop'],['records','diner','laundry','records','records','workshop'],['brownstone','brownstone','brownstone','laundry','diner','brownstone']];
  for(const [i,region] of world.regions.entries()){
    const id=value=>i?value?.replace(/^D01_/,'D0'+(i+1)+'_'):value;
    const shift=p=>({...p,x:p.x+region.x,y:p.y+region.y});
    for(const key of ['buildings','targets','props','obstacles','police','safeSpots','hoops'])for(const source of base[key]){
      if(source.boundary||source.pillar)continue;
      const item=shift(structuredClone(source));item.regionId=region.id;
      if(item.id)item.id=id(item.id);
      if(item.wall_id){item.wall_id=id(item.wall_id);item.name=region.name+' / '+item.name;}
      if(item.buildingId)item.buildingId=id(item.buildingId);
      if(item.approach)item.approach=shift(item.approach);
      if(item.route)item.route=item.route.map(shift);
      if(key==='buildings'&&i)item.type=variants[i][world.buildings.length%6];
      world[key].push(item);
    }
    world.hideouts.push({...shift(base.hideout),id:id(base.hideout.id),regionId:region.id,name:'Убежище / '+region.name});
    world.parkingLots.push({...shift(base.parking),id:'parking_'+region.id});
    const extraLots=[[2600,120],[2600,480],[2600,940],[2600,1456],[2600,1900],[110,2380],[490,2380],[1070,2380],[1680,2380],[2090,2380],[2620,2380]];
    for(const [n,[x,y]] of extraLots.entries()){
      const b={id:'CITY_'+region.id+'_'+n,type:variants[i]?.[n%6]??['brownstone','records','workshop','diner','laundry','warehouse'][n%6],x:x+region.x,y:y+region.y,w:164,h:150,regionId:region.id};world.buildings.push(b);
      if(n%2===0)world.targets.push({wall_id:'CITY_WALL_'+region.id+'_'+n,buildingId:b.id,regionId:region.id,x:b.x+b.w,y:b.y+b.h*.58,axis:'y',approach:{x:b.x+b.w+34,y:b.y+b.h*.58},name:region.name+' / Арт-переулок '+(n+1),wall_type:'brick_wall',graffiti_id:['panda_king','monster','zack_tag','crown'][n%4],rep_reward:350,heat_reward:1,difficulty:1,graffiti_size:'L',state:'CLEAN'});
      world.props.push({type:'dumpster',x:b.x-20,y:b.y+b.h-12,width:45},{type:n%2?'tree':'palm',x:b.x+b.w+56,y:b.y+b.h+34,width:65});
    }
  }
  for(let ox=0;ox<6400;ox+=1600)for(const [x,w] of [[288,112],[832,128],[1312,112]])world.roads.push({x:x+ox,y:60,w,h:5480});
  for(let oy=0;oy<5632;oy+=1408)for(const [y,h] of [[320,128],[768,112],[1184,112]])for(const bank of [{x:60,w:2948},{x:3200,w:3140}])world.roads.push({...bank,y:y+oy,h});
  const landmark=(id,type,x,y,w,h)=>{
    const overlaps=b=>b.x<x+w+15&&b.x+b.w>x-15&&b.y<y+h+15&&b.y+b.h>y-15;
    const removed=new Set(world.buildings.filter(b=>b.id.startsWith('CITY_')&&overlaps(b)).map(b=>b.id));
    world.buildings=world.buildings.filter(b=>!removed.has(b.id));world.targets=world.targets.filter(t=>!removed.has(t.buildingId));world.props=world.props.filter(p=>!overlaps({x:p.x,y:p.y,w:1,h:1}));
    world.buildings.push({id,type,x,y,w,h,landmark:true});
  };
  landmark('LANDMARK_HARBOUR','skyline_glass',5800,1460,260,220);
  landmark('LANDMARK_DOWNTOWN','skyline_deco',2600,4260,240,220);
  landmark('LANDMARK_MALL','flow_mall',2600,2340,240,180);
  landmark('LANDMARK_ARTS_MALL','flow_mall',5800,3760,245,180);
  landmark('LANDMARK_CUSTOMS','customs',2600,464,235,150);
  landmark('LANDMARK_NIGHT_CUSTOMS','customs',5800,5120,235,130);
  world.pointsOfInterest=[
    {id:'poi_mall',name:'FLOW MALL',kind:'mall',sprite:'flow_mall',x:2874,y:2470,regionId:'east',description:'Магазины кроссовок, винила и маркеров. За торговым центром — тихий переулок для новых работ.',line:'Продавец: «Йоу, твои рисунки уже обсуждают в квартале!»',wall:'CITY_WALL_east_8'},
    {id:'poi_racers',name:'PARKING MEET',kind:'meet',sprite:'customs',x:744,y:1090,regionId:'east',description:'Сходка стритрейсеров. Тюнинг, музыка, яркие машины и разговоры на парковке.',line:'Рейсер: «Зак! Паркуй свой стиль рядом. Стене у въезда нужен рисунок».',wall:'D01_WALL_007'},
    {id:'poi_skyline',name:'HARBOUR SKYLINE',kind:'skyline',sprite:'skyline_glass',x:6100,y:1590,regionId:'harbour',description:'Деловой центр на берегу. Стеклянные башни, служебные переулки и длинная набережная.',line:'Курьер: «За башнями целая галерея. Главное — успеть до патруля».',wall:'D02_WALL_018'},
    {id:'poi_artsmall',name:'COLOUR MARKET',kind:'mall',sprite:'flow_mall',x:6090,y:3890,regionId:'arts',description:'Торговый центр арт-квартала. Локальные марки, принты и расписанные дворы.',line:'Художница: «В переулке за маркетом есть свободный торец».',wall:'D03_WALL_016'},
    {id:'poi_nightmeet',name:'NIGHT CUSTOMS',kind:'meet',sprite:'customs',x:6010,y:5370,regionId:'arts',description:'Вечерняя сходка у тюнинг-гаража: неон и заниженные машины.',line:'Механик: «Ночью здесь собирается весь город. Оставь свой тег у боксов».',wall:'D03_WALL_024'},
    {id:'poi_deco',name:'OCEAN TOWERS',kind:'skyline',sprite:'skyline_deco',x:2880,y:4390,regionId:'downtown',description:'Второй высотный центр города: башни ар-деко, пальмы и морской бульвар.',line:'Местный: «Море рядом, стены огромные. Теперь этот район знает и тебя».',wall:'D04_WALL_018'}
  ];
  world.parkingLots.push({id:'customs_parking',x:2600,y:710,w:260,h:55},{id:'night_parking',x:5820,y:5280,w:270,h:100});
  world.meetCars=[{x:488,y:990,type:'blue_car',color:'#6dd8ec'},{x:590,y:990,type:'taxi',color:'#f59cab'},{x:690,y:990,type:'blue_car',color:'#a3df76'},{x:5860,y:5330,type:'blue_car',color:'#6dd8ec'},{x:5960,y:5330,type:'taxi',color:'#f5bd5c'},{x:6060,y:5330,type:'blue_car',color:'#f594c7'}];
  for(const car of world.meetCars)world.props.push({...car,width:88,meet:true,collision:{x:-48,y:-32,w:58,h:28}});
  world.meetPeople=[{x:708,y:1048,look:2},{x:684,y:1080,look:1},{x:5800,y:5360,look:0},{x:5900,y:5270,look:3}];
  world.metro={...base.metro,x:60,end:2950,loop:[{x:884,y:674},{x:5696,y:674},{x:5696,y:4600},{x:884,y:4600}]};
  world.metro.cornerRadius=360;
  world.metro.underground={entry:1740,start:2380,end:3410,exit:4100};
  world.metroStations=metroRoute(world.metro).stops.map((s,i)=>({...loopPosition(world.metro,s),name:['EAST BLOCK','HARBOUR','COLOUR','DOWNTOWN'][i]}));
  world.metroPortals=[{x:5696,y:2380},{x:5696,y:3410}];
  expandCoast(world);
  for(const [y,h] of [[1740,640],[3410,690]])world.obstacles.push({x:5660,y,w:72,h,tunnelCollider:true});
  for(const b of world.buildings)if(b.type==='skyline_glass'||b.type==='skyline_deco')b.heightScale=Math.max(2.1,(b.heightScale??1.35)*1.55);
  for(let i=0;i<4;i++){
    const a=world.metro.loop[i],b=world.metro.loop[(i+1)%4],vertical=a.x===b.x,len=Math.hypot(b.x-a.x,b.y-a.y);
    for(let n=140;n<len;n+=320){const x=vertical?a.x+24:Math.min(a.x,b.x)+n,y=vertical?Math.min(a.y,b.y)+n:a.y+24;
      if(vertical&&a.x===5696&&y>1650&&y<4200)continue;
      if(onLand(world,x,y,16)&&!world.buildings.some(b=>x>b.x-20&&x<b.x+b.w+20&&y>b.y-20&&y<b.y+b.h+20))world.obstacles.push({x,y,w:12,h:16,pillar:true});}
  }
  // Keep traffic on real land, and outside the crew-controlled service barriers.
  world.roads=world.roads.flatMap(r=>{
    const vertical=r.h>r.w,axis=vertical?'y':'x',size=vertical?'h':'w',out=[];let start=null;
    for(let n=0;n<=r[size]+16;n+=16){const x=vertical?r.x+r.w/2:r.x+n,y=vertical?r.y+n:r.y+r.h/2;
      const valid=n<r[size]&&onLand(world,x,y,44);
      if(valid&&start===null)start=n;
      if(!valid&&start!==null){const end=Math.min(n,r[size]);if(end-start>180)out.push({...r,[axis]:r[axis]+start,[size]:end-start});start=null;}
    }return out;
  });
  // Cars use neighbouring streets beside the reserved metro descent.
  world.roads=world.roads.filter(r=>!(r.h>r.w&&Math.abs(r.x+r.w/2-5696)<8));
  world.roadEnds=planRoadEnds(world);
  world.river={name:'РЕКА FLOW',x:3110,y:740};return world;
}
