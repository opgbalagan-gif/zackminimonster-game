// Coastal plan: marina on the west, canal-side courtyard blocks in the centre,
// wooded park on the east and workshops / tanks at the southern end.
import {calibrateBuildings,clearBuildingBins} from './core__building-scale.js?v=8a0ece6e2747';
import {dressDistrict} from './core__street-dressing.js?v=8a0ece6e2747';
import {addPaintFacades} from './core__paint-facades.js?v=8a0ece6e2747';
export function densifyWaterfront(w){
  w.obstacles=w.obstacles.filter(o=>!o.water&&!o.railway&&!(o.w===16&&o.h===16)&&!(o.w===160&&o.h===145));
  for(const h of w.hoops)w.obstacles.push({x:h.x-8,y:h.y-8,w:16,h:16});
  w.water=[{x:72,y:1500,w:258,h:1230},{x:850,y:1500,w:150,h:2602}];
  w.bridges=[1930,2520,3140,3780].map((y,i)=>({id:'canal_bridge_'+i,name:['Мост у причала','Мост жилых дворов','Парковый мост','Мост мастерских'][i],kind:'bridge',x:828,y,w:194,h:120,approach:{x:1050,y:y+60}}));
  w.obstacles.push({...w.water[0],water:true});
  let at=1500;for(const b of w.bridges){w.obstacles.push({x:850,y:at,w:150,h:b.y-at,water:true});at=b.y+b.h;}w.obstacles.push({x:850,y:at,w:150,h:4102-at,water:true});
  w.parks=[{x:100,y:2780,w:685,h:1280},{x:2570,y:1500,w:1050,h:1420}];
  w.paths=[{x:350,y:1510,w:72,h:1190},{x:772,y:1490,w:66,h:2610},{x:1020,y:1480,w:76,h:2590},{x:2450,y:1490,w:80,h:2610},{x:1280,y:1520,w:70,h:2420},{x:1870,y:1510,w:70,h:2420},{x:2600,y:2130,w:980,h:76},{x:2950,y:1480,w:78,h:2460},{x:125,y:3440,w:700,h:72},{x:425,y:2800,w:70,h:1230}];
  for(const b of w.bridges)w.paths.push({x:350,y:b.y+20,w:2180,h:80});
  w.roads[0].w=w.roads[1].w=3520;
  w.roads[2].h=1220;
  w.roads.push({x:w.mapBounds.x,y:1270,w:w.mapBounds.w,h:160},{x:2220,y:1460,w:120,h:2550},{x:1060,y:3030,w:2550,h:110});
  Object.assign(w.surfaceMetro,{start:w.mapBounds.x-1000,end:w.mapBounds.x+w.mapBounds.w+1000,activeStart:w.mapBounds.x,activeEnd:w.mapBounds.x+w.mapBounds.w});
  // Columns are outside the two traffic lanes. The street below the viaduct is walkable.
  w.metroPiers=[];
  for(let x=-1020;x<w.surfaceMetro.end;x+=240)for(const y of [1246,1454]){if(w.targets.some(t=>Math.hypot(x-t.approach.x,y-t.approach.y)<50))continue;w.metroPiers.push({x,y});if(x>w.mapBounds.x&&x<w.mapBounds.x+w.mapBounds.w)w.obstacles.push({x:x-8,y:y-8,w:16,h:16,metroPier:true});}
  const original=new Set(['first_house','north_house','corner_house','brick_house','music_house','end_house','record_house','east_house','yard_house','studio_house']);
  const moved=w.buildings.filter(b=>!original.has(b.id));w.buildings=w.buildings.filter(b=>original.has(b.id));
  const slots=[];
  // Closely spaced housing frames small shared courtyards and narrow alleys.
  for(const y of [1550,1750,2110,2310,2670,2870])for(const x of [440,640,1110,1350,1560,1760,1980,2370])slots.push([x,y,120,120]);
  for(const y of [170,650,1090])for(const x of [2390,2610,2830,3050,3270,3490])slots.push([x,y,140,140]);
  for(const y of [3250,3510,3900])for(const x of [1120,1390,1660,1960])slots.push([x,y,155,155]);
  for(let i=0;i<slots.length;i++){
    const [x,y,bw,bh]=slots[i],old=moved[i],variant=i%6;
    const b={...(old??{}),id:old?.id??'dense_block_'+i,type:'apartment',artType:'apartment',nanoVariant:variant<3?variant:variant===4?4:1,x,y,w:bw,h:bh};
    delete b.longHouse;w.buildings.push(b);
    const target=w.targets.find(t=>t.buildingId===b.id);if(target){b.nanoVariant=i%2?2:0;Object.assign(target,{x:x+b.w,y:y+b.h,approach:{x:x+b.w+27,y:y+b.h+20}});}
  }
  for(const [i,[x,y]] of [[1350,150],[1770,150],[550,650],[1330,650],[2200,150],[1100,1090],[1350,1090]].entries())w.buildings.push({id:'north_infill_'+i,type:'apartment',nanoVariant:[1,2,0,4][i%4],x,y,w:120,h:120});
  for(const y of [1685,2245,2805])w.parks.push({x:1340,y,w:520,h:42});
  // Purpose-built long buildings and industrial yards, not stretched house sprites.
  for(const [i,x,y,v,bw,bh] of [[0,2590,3180,3,135,240],[1,3100,3180,3,135,240],[2,2620,3590,5,130,380],[3,3230,3620,5,130,380]])w.buildings.push({id:'industrial_bar_'+i,type:'apartment',nanoVariant:v,x,y,w:bw,h:bh});
  // Open the southeast sightline to the second basket; no transparent house over the court.
  w.buildings=w.buildings.filter(b=>b.id!=='dense_block_60');
  calibrateBuildings(w);clearBuildingBins(w);
  w.nature=[];
  const clear=(x,y,pad=30)=>!w.buildings.some(b=>x>b.x-pad&&x<b.x+b.w+pad&&y>b.y-pad&&y<b.y+b.h+pad)&&!w.targets.some(t=>Math.hypot(x-t.approach.x,y-t.approach.y)<48)&&!w.paths.some(p=>x>p.x-28&&x<p.x+p.w+28&&y>p.y-28&&y<p.y+p.h+28)&&!w.roads.some(p=>x>p.x-20&&x<p.x+p.w+20&&y>p.y-20&&y<p.y+p.h+20);
  for(const r of w.parks)for(let x=r.x+38;x<r.x+r.w-30;x+=90)for(let y=r.y+38;y<r.y+r.h-25;y+=98){const xx=x+Math.sin(x*.1+y)*17,yy=y+Math.cos(y*.07+x)*17;if(clear(xx,yy,65))w.nature.push({id:'comic_tree',x:xx,y:yy,w:132+Math.abs(Math.sin(x+y))*28});}
  for(const y of [1705,2265,2825])for(const x of [1415,1625,1810])if(clear(x,y,15))w.nature.push({id:'comic_tree',x,y,w:92});
  for(let y=1610;y<4020;y+=170)for(const x of [812,1050,2500])if(clear(x,y,22))w.nature.push({id:'comic_tree',x,y,w:98});
  for(const [x,y] of [[2860,3300],[3430,3300],[2860,3740],[3480,3840]]){w.nature.push({id:'comic_tank',x,y,w:210});w.obstacles.push({x:x-54,y:y-54,w:108,h:108});}
  for(const y of [1750,2130,2500])w.nature.push({id:'comic_pier',x:333,y,w:120});
  for(const p of w.nature.filter(p=>p.id==='comic_tree'))w.obstacles.push({x:p.x-7,y:p.y-7,w:14,h:14});
  for(const [x,y] of [[1080,1900],[1850,2090],[2500,2520],[3000,2160],[430,3020],[1930,3570]])w.blockProps.push({id:'bench',x,y,w:82},{id:'lamp',x:x+65,y,w:44},{id:'litter',x:x-35,y,w:27});
  w.mapRoutes=[{id:'walk_park',name:'Восточный лесопарк',x:2990,y:2160},{id:'walk_marina',name:'Причал и набережная',x:370,y:1990},{id:'walk_garden',name:'Дворы у канала',x:1310,y:2440},{id:'walk_factory',name:'Старые резервуары',x:3000,y:3500},{id:'walk_south',name:'Южный мост',x:1050,y:3840},{id:'walk_metro',name:'Станция метро',...w.surfaceMetro.approach}];
  return addPaintFacades(dressDistrict(w));
}
