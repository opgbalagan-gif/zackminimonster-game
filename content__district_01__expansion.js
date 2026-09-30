const b=(id,type,x,y,w,h)=>({id:'D01_B'+String(id).padStart(2,'0'),type,x,y,w,h});
export function expandDistrict(world){
  world.width=2400;world.height=2112;world.version=7;
  world.metro.end=world.width+180;
  for(const r of world.roads)if(r.h>r.w)r.h=world.height-48;else r.w=world.width-48;
  world.roads.push({x:1888,y:24,w:112,h:world.height-48},{x:24,y:1728,w:world.width-48,h:128});
  const replacements={D01_B01:'workshop',D01_B02:'brownstone',D01_B03:'brownstone',D01_B04:'records',
    D01_B05:'laundry',D01_B06:'diner',D01_B07:'workshop',D01_B08:'warehouse',D01_B09:'brownstone',
    D01_B10:'records',D01_B11:'brownstone',D01_B12:'laundry',D01_B14:'warehouse'};
  for(const building of world.buildings)if(replacements[building.id])building.type=replacements[building.id];
  world.buildings.push(
    b(15,'warehouse',1650,104,166,158),b(16,'diner',2090,136,172,122),
    b(17,'laundry',1654,488,154,122),b(18,'brownstone',2072,472,174,160),
    b(19,'records',1660,946,142,156),b(20,'workshop',2090,948,174,144),
    b(21,'warehouse',1652,1380,158,198),b(22,'records',2080,1388,154,180),
    b(23,'brownstone',92,1456,152,160),b(24,'laundry',484,1456,152,152),
    b(25,'diner',1080,1460,156,140),b(26,'workshop',106,1900,136,148),
    b(27,'records',476,1904,160,152),b(28,'warehouse',1056,1900,174,156),
    b(29,'brownstone',1480,1900,148,160),b(30,'laundry',1720,1908,120,144),
    b(31,'diner',2090,1904,174,150));
  // Keep existing wall IDs: painted work and its saved colour move with the surface.
  const attach=(wall,building,name)=>{
    wall.buildingId=building.id;wall.axis='y';wall.name=name;
    wall.x=building.x+building.w;wall.y=building.y+building.h*.58;
    wall.approach={x:wall.x+34,y:wall.y};
    wall.wall_type=building.type==='workshop'?'shutter':building.type==='warehouse'?'brick_wall':'concrete_wall';
  };
  for(const [index,id,name] of [[0,1,'Фасад убежища / PANDA KING'],[2,4,'Торец RECORDS'],
    [4,10,'Фасад в переулке'],[7,6,'Стена закусочной'],[8,3,'Торец жилого дома'],[9,8,'Склад / PANDA KING']]){
    attach(world.targets[index],world.buildings.find(building=>building.id==='D01_B'+String(id).padStart(2,'0')),name);
  }
  const places=[[15,'Красный склад'],[16,'Восточный DINER'],[17,'Прачечная на востоке'],[18,'Восточный жилой дом'],
    [19,'Магазин пластинок'],[20,'Автомастерская'],[21,'Промышленный двор'],[22,'Музыкальный переулок'],
    [23,'Южный жилой дом'],[24,'Южная прачечная'],[25,'Закусочная у моста'],[27,'Южный RECORDS'],
    [28,'Склад у границы'],[31,'Дальний DINER']];
  for(const [id,name] of places){
    const n=world.targets.length+1,wall={wall_id:'D01_WALL_'+String(n).padStart(3,'0'),graffiti_id:['panda_king','crown','monster','zack_tag'][n%4],
      rep_reward:300+(n%4)*50,heat_reward:n%3===0?2:1,graffiti_size:'L',difficulty:1,state:'CLEAN'};
    attach(wall,world.buildings.find(building=>building.id==='D01_B'+String(id).padStart(2,'0')),name);world.targets.push(wall);
  }
  world.zones.push({id:'industrial',name:'WAREHOUSE YARD',x:1740,y:1560},{id:'east',name:'EAST AVENUE',x:2160,y:840},
    {id:'south',name:'SOUTH BLOCK',x:710,y:1940});
  world.safeSpots.push({id:'D01_SAFE_005',x:1848,y:1652,name:'За восточным складом',cooldown:0},
    {id:'D01_SAFE_006',x:1280,y:2020,name:'Южный служебный проход',cooldown:0});
  for(const [x,y] of [[1634,282],[2038,286],[2320,618],[1846,730],[2038,1140],[2320,1620],[1828,1690],
    [76,1670],[436,1656],[1268,1670],[1460,1660],[780,2030],[2040,2040]])world.props.push({type:'palm',x,y,width:66});
  for(const [x,y] of [[1865,446],[2026,882],[1865,1296],[2028,1856],[812,1856],[1290,1856]])world.props.push({type:'lamp',x,y,width:25});
  world.police.push({id:'D01_OFFICER_06',kind:'officer',x:1850,y:930,level:1,
    route:[{x:1850,y:930},{x:1840,y:1600},{x:2028,y:1680},{x:2028,y:930}]});
  // A continuous, collidable perimeter. Roads and buildings remain visible beyond it.
  world.boundaries=[{x:16,y:16,w:world.width-32,h:10},{x:16,y:world.height-26,w:world.width-32,h:10},
    {x:16,y:26,w:10,h:world.height-52},{x:world.width-26,y:26,w:10,h:world.height-52}];
  world.obstacles.push(...world.boundaries.map(r=>({...r,boundary:true})));
  world.backdrop=[];
  // Reuse complete neighbouring block layouts so their buildings remain on paved lots.
  const template=world.buildings.slice(0,14);
  for(let oy=-2816;oy<world.height+1600;oy+=1408)for(let ox=-3200;ox<world.width+1600;ox+=1600){
    for(const [i,source] of template.entries()){
      const x=source.x+ox,y=source.y+oy;
      if(x>-1600&&y>-1600&&x<world.width+1600&&y<world.height+1600&&
        (x+source.w<-36||y+source.h<-36||x>world.width+36||y>world.height+36)){
        world.backdrop.push({...source,id:'BG_'+ox+'_'+oy+'_'+i,x,y,backdrop:true});
      }
    }
  }
}
