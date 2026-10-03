// Extend the existing saved district without moving its original buildings or wall IDs.
import {densifyWaterfront} from './core__waterfront-blocks.js?v=200bdb7a657c';
export function addWaterfront(w){
  w.width=3800;w.height=4200;w.mapBounds={x:72,y:92,w:3650,h:4010};
  w.walkableAreas=[{...w.mapBounds}];
  w.water=[{x:2250,y:92,w:250,h:4010},{x:380,y:1710,w:210,h:1040}];
  w.bridges=[412,916,1930,3190].map((y,i)=>({id:'canal_bridge_'+i,name:['Северный мост','Мост у площадки','Парковый мост','Южный мост'][i],kind:'bridge',x:2230,y:y-16,w:290,h:144,approach:{x:2190,y:y+56}}));
  // Split collision volumes at each crossing so both walking and routing use real bridges.
  let y=92;for(const b of w.bridges){w.obstacles.push({x:2250,y,w:250,h:b.y-y,water:true});y=b.y+b.h;}w.obstacles.push({x:2250,y,w:250,h:4102-y,water:true});
  w.obstacles.push({...w.water[1],water:true});
  w.roads[0].w=w.roads[1].w=3520;
  // A pedestrian underpass keeps the southern neighbourhood connected across the metro.
  w.obstacles=w.obstacles.filter(o=>!o.railway);
  w.obstacles.push({x:72,y:1302,w:1330,h:100,railway:true},{x:1570,y:1302,w:650,h:100,railway:true});
  w.parks=[{x:2580,y:1100,w:1050,h:1930},{x:760,y:1540,w:570,h:1320},{x:112,y:2890,w:880,h:1040}];
  w.paths=[{x:1405,y:1260,w:160,h:2760},{x:620,y:1580,w:76,h:1280},{x:180,y:2870,w:1930,h:90},{x:1565,y:1950,w:2065,h:82},{x:190,y:3210,w:3440,h:82},{x:2950,y:1050,w:82,h:2800},{x:2550,y:3820,w:1080,h:80}];
  const homes=[
    ['harbor_a',105,1770,0],['harbor_b',105,2250,1],['harbor_c',650,2020,2],
    ['garden_a',1680,1620,0],['garden_b',1970,1620,2],['garden_c',1680,2090,1],['garden_d',1970,2090,3],
    ['south_a',1110,2650,2],['south_b',1670,2650,0],['south_c',1980,2650,1],
    ['park_house',3280,1440,2],['canal_studio',2590,3300,3],['park_gallery',3210,3300,1]
  ];
  for(const [id,x,y,comicVariant] of homes){
    const b={id,type:'apartment',artType:'apartment',comicVariant,x,y,w:166,h:156};w.buildings.push(b);
    const names={harbor_a:'Дом у причала',harbor_b:'Белая мастерская',harbor_c:'Дом моряка',garden_a:'Дом художников',garden_b:'Зелёный двор',garden_c:'Дворовая студия',garden_d:'Угловая мастерская',south_a:'Южный фасад',south_b:'Дом у променада',south_c:'Южная студия',park_house:'Дом в парке',park_gallery:'Галерея в парке',canal_studio:'Студия у канала'};
    w.targets.push({...w.targets[1],wall_id:'SANDBOX_'+id.toUpperCase(),buildingId:id,name:'Фасад · '+names[id],x:x+166,y:y+156,approach:{x:x+203,y:y+173},graffiti_id:'zack_tag'});
  }
  // Residential rows frame the courtyards; only selected facades are painting spots.
  const infill=[...([132,650].flatMap(y=>[2650,2880,3110,3340].map(x=>[x,y]))),...[1670,1880,2080].map(x=>[x,2370]),...[1100,1750,2010].map(x=>[x,3020]),...[110,330,550,770,1070].map(x=>[x,3880])];
  for(const [i,[x,y]] of infill.entries())w.buildings.push({id:'courtyard_'+i,type:'apartment',artType:'apartment',comicVariant:i%4,x,y,w:166,h:156});
  w.nature=[];
  for(const [x,y] of [[1500,865],[2100,1060],[2180,1880],[3000,2320]])w.blockProps.push({id:'litter',x,y,w:27});
  // Long residential blocks use their own footprint and artwork, not stretched square houses.
  for(const [i,x,y] of [[0,1100,1550],[1,3300,2280],[2,650,3290]]){
    const b={id:'long_house_'+i,type:'apartment',artType:'apartment',longHouse:true,x,y,w:170,h:480};w.buildings.push(b);
    w.targets.push({...w.targets[1],wall_id:'SANDBOX_LONG_HOUSE_'+i,buildingId:b.id,name:'Фасад · '+['Длинный дом у причала','Парковый корпус','Южный жилой корпус'][i],x:x+b.w,y:y+b.h,approach:{x:x+b.w+37,y:y+b.h+17},graffiti_id:'zack_tag'});
  }
  for(const r of w.parks)for(let x=r.x+45;x<r.x+r.w-30;x+=94)for(let y=r.y+45;y<r.y+r.h-30;y+=102){
    if(w.paths.some(p=>x>p.x-45&&x<p.x+p.w+45&&y>p.y-45&&y<p.y+p.h+45)||w.buildings.some(b=>x>b.x-70&&x<b.x+b.w+90&&y>b.y-70&&y<b.y+b.h+90)||w.targets.some(t=>Math.hypot(x-t.approach.x,y-t.approach.y)<80))continue;
    w.nature.push({id:'comic_tree',x:x+Math.sin(y)*12,y,w:130+Math.abs(Math.sin(x+y))*38});
  }
  for(const y of [270,690,1170,1570,2340,2760,3490,3850])w.nature.push({id:'comic_palm',x:2160,y,w:106});
  for(const [x,y] of [[1130,3440],[1510,3600],[1890,3440]]){
    w.nature.push({id:'comic_tank',x,y,w:225});w.obstacles.push({x:x-80,y:y-80,w:160,h:145});
  }
  for(const y of [1820,2130,2440])w.nature.push({id:'comic_pier',x:350,y,w:120});
  for(const p of w.nature.filter(p=>p.id==='comic_tree'||p.id==='comic_palm'))w.obstacles.push({x:p.x-8,y:p.y-8,w:16,h:16});
  w.mapRoutes=[{id:'walk_park',name:'Парк на восточном берегу',x:2990,y:2390},{id:'walk_marina',name:'Причал и набережная',x:650,y:1850},{id:'walk_garden',name:'Дворы у канала',x:1920,y:1990},{id:'walk_factory',name:'Старые резервуары',x:1520,y:3360},{id:'walk_south',name:'Южный мост',x:2200,y:3260},{id:'walk_metro',name:'Станция метро',...w.surfaceMetro.approach}];
  return densifyWaterfront(w);
}
