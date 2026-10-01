import {expandDistrict} from './content__district_01__expansion.js';
const building=(id,type,x,y,w,h)=>({id,type,x,y,w,h});
const target=(n,type,x,y,name,art,rep,heat=1,axis='x')=>({
  wall_id:'D01_WALL_'+String(n).padStart(3,'0'),wall_type:type,x,y,name,graffiti_id:art,
  rep_reward:rep,heat_reward:heat,graffiti_size:rep>300?'L':'M',difficulty:heat,axis,state:'CLEAN',
  approach:{x:x+(axis==='y'?35:0),y:y+(axis==='x'?35:0)}
});
export function createDistrict(){
  const world={
    id:'district_01',name:'EAST BLOCK',width:1600,height:1408,version:2,
    spawn:{x:302,y:1112},hideout:{id:'D01_HIDEOUT',x:264,y:1112,name:'Убежище'},
    roads:[
      {x:288,y:24,w:112,h:1360},{x:832,y:24,w:128,h:1360},{x:1312,y:24,w:112,h:1360},
      {x:24,y:320,w:1552,h:128},{x:24,y:768,w:1552,h:112},{x:24,y:1184,w:1552,h:112}
    ],
    zones:[
      {id:'hideout',name:'HIDEOUT BLOCK',x:90,y:1070},{id:'metro',name:'METRO STATION',x:745,y:640},
      {id:'court',name:'COURT & PARKING',x:1140,y:1140},{id:'construction',name:'CONSTRUCTION',x:1135,y:290},
      {id:'commercial',name:'SHOPS',x:520,y:740},{id:'apartments',name:'APARTMENTS',x:580,y:280}
    ],
    buildings:[
      building('D01_B01','garage',124,984,120,108),building('D01_B02','apartment',92,120,152,156),
      building('D01_B03','apartment',460,104,156,152),building('D01_B04','shop',670,136,120,120),
      building('D01_B05','convenience',108,480,142,116),building('D01_B06','shop',464,480,136,126),
      building('D01_B07','garage',492,660,96,80),building('D01_B08','gym',1064,478,164,130),
      building('D01_B09','apartment',1450,464,110,152),building('D01_B10','shop',1446,928,114,160),
      building('D01_B11','apartment',100,1310,164,70),building('D01_B12','convenience',500,1314,144,66),
      building('D01_B13','construction',1038,112,172,148),building('D01_B14','garage',1060,1310,134,72)
    ],
    court:{x:1004,y:948,w:252,h:200},parking:{x:454,y:938,w:296,h:220},
    construction:{x:1000,y:80,w:264,h:214},plaza:{x:650,y:490,w:132,h:110},
    metro:{x:-180,end:1780,y:642,width:65,height:108,segment:96,station:{x:630,w:350}},
    obstacles:[
      {x:996,y:79,w:272,h:8},{x:1258,y:80,w:8,h:210},{x:1000,y:286,w:110,h:8},{x:1160,y:286,w:105,h:8},
      {x:995,y:947,w:8,h:180},{x:1255,y:947,w:8,h:180},{x:1004,y:940,w:252,h:8}
    ],
    targets:[
      target(1,'brick_wall',235,1144,'Первая стена / STREET FLOW','panda_king',250),
      target(2,'metro_pillar',366,692,'Западная опора','monster',280,1,'y'),
      target(3,'shutter',615,620,'Роллета ZACK STORE','crown',280),
      target(4,'construction_wall',1168,300,'Стройка','monster',450,2),
      target(5,'alley_wall',1462,1130,'Тихий переулок','zack_tag',320),
      target(6,'basketball_wall',1080,1158,'Стена корта','monster',400),
      target(7,'concrete_wall',730,900,'Парковка','crown',300),
      target(8,'station_wall',756,724,'Под станцией','zack_tag',420,2),
      target(9,'fence',704,282,'Северный двор','crown',360),
      target(10,'brick_wall',1010,616,'Стена у спортзала / STREET FLOW','panda_king',380,2,'y')
    ],
    safeSpots:[
      {id:'D01_SAFE_001',x:258,y:939,name:'Гаражный проход',cooldown:0},
      {id:'D01_SAFE_002',x:435,y:704,name:'Под эстакадой',cooldown:0},
      {id:'D01_SAFE_003',x:632,y:454,name:'Служебный вход',cooldown:0},
      {id:'D01_SAFE_004',x:1275,y:1138,name:'За контейнером',cooldown:0}
    ],
    police:[
      {id:'D01_OFFICER_01',kind:'officer',x:884,y:766,level:0,route:[{x:884,y:766},{x:900,y:1030},{x:762,y:890},{x:694,y:760}]},
      {id:'D01_OFFICER_02',kind:'officer',x:1172,y:364,level:1,route:[{x:1172,y:364},{x:896,y:376},{x:900,y:628},{x:1028,y:700}]},
      {id:'D01_OFFICER_03',kind:'officer',x:330,y:380,level:2,route:[{x:330,y:380},{x:334,y:714},{x:736,y:824},{x:704,y:436}]},
      {id:'D01_CAR_01',kind:'car',x:1366,y:824,level:2,route:[{x:1366,y:824},{x:1366,y:380},{x:892,y:380},{x:892,y:824}]},
      {id:'D01_OFFICER_04',kind:'officer',x:1370,y:1150,level:3,route:[{x:1370,y:1150},{x:888,y:1230},{x:890,y:926},{x:1280,y:892}]}
    ],
    props:[
      // Ground footprints relative to the sprite's bottom-centre anchor (not the roof).
      {type:'van',x:508,y:1024,width:100,collision:{x:-56,y:-40,w:64,h:32}},
      {type:'blue_car',x:622,y:1070,width:92,collision:{x:-49,y:-35,w:56,h:28}},
      {type:'dumpster',x:1265,y:1160,width:52},
      {type:'dumpster',x:252,y:908,width:48},{type:'dumpster',x:636,y:722,width:45},
      {type:'vending',x:628,y:603,width:27},{type:'vending',x:264,y:589,width:25},
      {type:'bench',x:718,y:552,width:66},{type:'bench',x:1080,y:920,width:58}
    ],decorations:[]
  };
  expandDistrict(world);
  for(let x=90;x<world.width;x+=190)world.obstacles.push({x,y:668,w:16,h:22,pillar:true});
  for(const t of world.targets)if(!t.buildingId)world.obstacles.push({...(t.axis==='x'?{x:t.x-42,y:t.y,w:84,h:5}:{x:t.x,y:t.y-42,w:5,h:84}),wallCollider:true});
  const trees=[[62,298],[436,287],[781,281],[996,294],[1286,302],[62,740],[438,590],[788,594],[1290,725],[1480,745],[74,1160],[434,1158],[779,1150],[1284,1174],[1490,1158],[744,1348],[1285,1342],[85,890]];
  trees.forEach(([x,y],i)=>world.props.push({type:i%4===0?'tree':'palm',x,y,width:i%4===0?80:66}));
  [[274,447],[814,447],[1293,447],[274,881],[814,881],[1293,881],[276,1296],[811,1296],[1294,1296],[430,746],[1290,612]].forEach(([x,y])=>world.props.push({type:'lamp',x,y,width:25}));
  for(let i=0;i<900;i++)world.decorations.push({x:(i*179+51)%world.width,y:(i*317+71)%world.height,color:i%3});
  return world;
}


