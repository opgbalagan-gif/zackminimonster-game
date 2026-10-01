// The old street blocks retain their wall IDs; natural land extends around them.
export function expandCoast(w){
  w.version=21;w.width=7200;w.height=7100;
  w.mapBounds={x:-500,y:-1000,w:8000,h:8300};
  w.urbanPolygons=structuredClone(w.landPolygons);
  const points=a=>a.map(([x,y])=>({x,y}));
  w.landPolygons=[points([[48,48],[3008,48],[3008,5480],[2950,5800],[2760,6090],[2400,6260],[2020,6180],[1650,6440],[1230,6490],[820,6240],[460,5910],[150,5470],[48,5100]]),
    points([[3200,48],[5900,48],[6380,410],[6640,980],[6520,1590],[6820,2040],[6740,2540],[6450,2870],[6630,3330],[6470,3820],[6700,4330],[6610,4800],[6300,5210],[6400,5710],[6090,6040],[5840,6080],[5640,6510],[5320,6810],[4880,6900],[4540,6710],[4310,6380],[3860,6340],[3550,6070],[3270,5720],[3200,5460]])];
  w.regions.find(r=>r.id==='harbour').w=4000;
  w.regions.find(r=>r.id==='harbour').subtitle='Плотный мегаполис: башни, офисы, городские каньоны';
  for(const r of w.regions.filter(r=>r.y>0)){r.h=4284;if(r.id==='arts')r.w=4000;}
  // A whole business district, with the graffiti podiums preserved between towers.
  let tower=0;
  for(const b of w.buildings.filter(b=>b.regionId==='harbour'&&!w.targets.some(t=>t.buildingId===b.id))){
    b.type=tower++%3===0?'skyline_deco':'skyline_glass';b.landmark=true;b.heightScale=1.25+(tower%3)*.16;
  }
  const intersects=(a,b,p=20)=>a.x<b.x+b.w+p&&a.x+a.w>b.x-p&&a.y<b.y+b.h+p&&a.y+a.h>b.y-p;
  let added=0;
  for(let y=130;y<2540&&added<20;y+=178)for(let x=3340;x<6040&&added<20;x+=193){
    const b={x,y,w:108,h:94};
    if(w.buildings.some(o=>intersects(b,o,32))||w.roads.some(o=>intersects(b,o,20))||w.obstacles.some(o=>intersects(b,o,18))||Math.abs(y-674)<140||Math.abs(x-5696)<120)continue;
    if([...w.targets.map(t=>t.approach),...w.safeSpots,...w.hideouts,...w.pointsOfInterest].some(p=>intersects(b,{...p,w:1,h:1},70)))continue;
    w.buildings.push({...b,id:'METRO_TOWER_'+added,regionId:'harbour',type:added%4?'skyline_glass':'skyline_deco',landmark:true,heightScale:1.65+(added%4)*.15});added++;
  }
  w.mountains=[];
  for(let i=0;i<9;i++)w.mountains.push({x:i*790-150,y:-80-(i%3)*115,width:1800+(i%2)*280,flip:false});
  for(let i=0;i<4;i++)w.mountains.push({x:-140,y:i*700+150,width:1720,flip:true});
  w.promenades=[points([[610,5590],[1100,5800],[1660,5890],[2150,5790],[2650,5600]]),
    points([[3490,5580],[3900,5740],[4340,5850],[4780,6040],[5250,6200],[5600,6040],[5960,5730]])];
  w.beaches=[points([[590,5700],[1030,5970],[1650,6120],[2130,6010],[2680,5750],[2540,6060],[2170,6090],[1640,6310],[1210,6380],[840,6150]]),
    points([[3590,5740],[4030,5980],[4490,6130],[4840,6330],[5300,6400],[5720,6170],[6130,5870],[5940,6090],[5540,6510],[5200,6680],[4860,6770],[4610,6620],[4370,6250],[3870,6190]])];
  w.skatepark={id:'SEAFRONT_SKATE',type:'skate_park',x:4740,y:5730,w:330,h:230,landmark:true};
  w.buildings.push(w.skatepark);
  w.pointsOfInterest.push({id:'poi_skate',name:'SEAFRONT SKATE PARK',kind:'skate',sprite:'skate_park',x:5180,y:5970,regionId:'arts',description:'Скейт-парк у моря: бетонный боул, квотерпайпы, перила и расписанные рампы. Отсюда набережная ведёт прямо к пляжу.',line:'Скейтер: «Зак, заезжай! Здесь катаются до заката. У рампы оставили стену под твой рисунок».',wall:'COAST_SKATE_WALL'},
    {id:'poi_beach',name:'SUNSET BEACH',kind:'beach',sprite:'palm',x:1620,y:6120,regionId:'downtown',description:'Широкий песчаный пляж у морского бульвара. Пальмы, зонтики и прибой за шумным городом.',line:'Местный: «Сначала весь город, потом море. Хороший план на вечер».',wall:'D04_WALL_024'});
  w.targets.push({wall_id:'COAST_SKATE_WALL',regionId:'arts',x:5220,y:5940,axis:'x',approach:{x:5220,y:5976},name:'Набережная / Скейт-парк',wall_type:'concrete_wall',graffiti_id:'monster',rep_reward:400,heat_reward:1,difficulty:1,graffiti_size:'L',state:'CLEAN'});
  w.obstacles.push({x:5180,y:5932,w:80,h:12,wallCollider:true});
  w.beachProps=[];
  for(const [j,path] of w.promenades.entries())for(let i=0;i<path.length;i++){
    const p=path[i];w.props.push({type:'palm',x:p.x-38,y:p.y-65,width:110},{type:'lamp',x:p.x+40,y:p.y-8,width:32});
    w.props.push({type:'bench',x:p.x+100,y:p.y-38,width:70});
    if(i%2===0)w.beachProps.push({x:p.x+40,y:p.y+180,color:(i+j)%2?'#e9b75e':'#66c6ce'});
  }
  w.meetPeople.push({x:5130,y:5990,look:1},{x:5210,y:6030,look:3},{x:1630,y:6090,look:2});
  w.naturalLabels=[{x:1700,y:-260,name:'MONSTER RIDGE'},{x:1510,y:6270,name:'SUNSET BEACH'},{x:4900,y:6890,name:'ЮЖНОЕ МОРЕ'}];
}
