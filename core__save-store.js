import {cleanBallSave} from './core__basketball.js?v=200bdb7a657c';
export const SAVE_KEY='zackminimonster.save';
export const SAVE_VERSION=3;
export function freshSave(){
  return {save_version:SAVE_VERSION,player:{skin:'zack',ink:'purple'},rep:0,
    campaign:{tutorialComplete:false,tutorialCheckpoint:'home',companionUnlocked:false,tutorialFacadePainted:false,homeIntroStep:0,tutorialAtHome:false,sneakComplete:false,sneakCheckpoint:'gift',giftUnlocked:false},
    money:0,recognition:{works:[],photos:[],encounters:0},streetLife:{period:'day',day:1,elapsed:0,donations:[],audienceTier:null},phone:{unlocked:false,read:false,photos:[]},
    district_progress:{district_01:{visits:0}},painted_walls:[],graffiti_by_wall:{},basketball:{completed:false,pixels:[],stickers:[]},
    wall_styles:{},wall_damage:{},wall_drying:{},active_run:null,resume:null,graffiti_unlocks:['zack_tag','monster','crown','panda_king'],hideout:{upgrades:[],collectibles:[],display:'mini'},settings:{sound:true,radioVolume:.22}};
}
export function migrateSave(raw){
  const base=freshSave();
  if(!raw||typeof raw!=='object')return base;
  if(![1,2,3].includes(raw.save_version))throw new Error('Unsupported save version '+raw.save_version);
  const strings=value=>Array.isArray(value)?[...new Set(value.filter(v=>typeof v==='string'))]:[];
  return {...base,save_version:3,player:{
    skin:['zack','night','metro'].includes(raw.player?.skin)?raw.player.skin:'zack',
    ink:['purple','cyan','gold'].includes(raw.player?.ink)?raw.player.ink:'purple'},
    rep:Number.isFinite(raw.rep)?Math.max(0,Math.floor(raw.rep)):0,
    money:Number.isFinite(raw.money)?Math.max(0,Math.floor(raw.money)):0,
    recognition:{works:strings(raw.recognition?.works).slice(0,200),photos:strings(raw.recognition?.photos).slice(0,200),encounters:Number.isFinite(raw.recognition?.encounters)?Math.max(0,Math.min(60,Math.floor(raw.recognition.encounters))):0},
    streetLife:{period:raw.streetLife?.period==='day'?'day':raw.streetLife?.period==='night'?'night':raw.campaign?.tutorialCheckpoint&&raw.campaign.tutorialCheckpoint!=='home'?'night':'day',day:Number.isInteger(raw.streetLife?.day)?Math.max(1,raw.streetLife.day):1,elapsed:Number.isFinite(raw.streetLife?.elapsed)?Math.max(0,Math.min(300,raw.streetLife.elapsed)):0,donations:strings(raw.streetLife?.donations).slice(0,20),audienceTier:Number.isInteger(raw.streetLife?.audienceTier)?Math.max(0,Math.min(3,raw.streetLife.audienceTier)):strings(raw.streetLife?.donations).length?0:null},
    phone:{unlocked:raw.phone?.unlocked===true,read:raw.phone?.read===true,photos:Array.isArray(raw.phone?.photos)?raw.phone.photos.filter(p=>p&&typeof p.wall==='string'&&Number.isFinite(p.day)).slice(-12).map(p=>({wall:p.wall,day:p.day,art:['zack_tag','monster'].includes(p.art)?p.art:'zack_tag',quality:Math.max(0,Math.min(100,Number(p.quality)||0)),x:Math.max(-1,Math.min(1,Number(p.x)||0)),y:Math.max(-1,Math.min(1,Number(p.y)||0)),period:p.period==='day'?'day':'night',...(typeof p.image==='string'&&p.image.length<=350000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p.image)?{image:p.image}:{})})):[]},
    campaign:{tutorialComplete:raw.campaign?raw.campaign.tutorialComplete===true:(Number(raw.rep)>0||strings(raw.painted_walls).length>0),
      tutorialFacadePainted:raw.campaign?.tutorialFacadePainted===true,
      homeIntroStep:Number.isInteger(raw.campaign?.homeIntroStep)?Math.max(0,Math.min(7,raw.campaign.homeIntroStep)):0,
      tutorialAtHome:raw.campaign?.tutorialAtHome===true,
      activeLevel:['sandbox','sneak','tutorial'].includes(raw.campaign?.activeLevel)?raw.campaign.activeLevel:'tutorial',
      started:raw.campaign?.started===true,
      sandboxStarted:raw.campaign?.sandboxStarted===true,sandboxAtHome:raw.campaign?.sandboxAtHome===true,sandboxComplete:raw.campaign?.sandboxComplete===true,
      sneakComplete:raw.campaign?.sneakComplete===true,giftUnlocked:raw.campaign?.giftUnlocked===true,
      sneakCheckpoint:['gift','paint','hide','photo','complete'].includes(raw.campaign?.sneakCheckpoint)?raw.campaign.sneakCheckpoint:'gift',
      tutorialCheckpoint:['home','walk','first_done','rival_done','recovery','return_wall','repaint','escape','complete'].includes(raw.campaign?.tutorialCheckpoint)?raw.campaign.tutorialCheckpoint:'home',
      companionUnlocked:raw.campaign?raw.campaign.companionUnlocked===true:(Number(raw.rep)>0||strings(raw.painted_walls).length>0)},
    basketball:cleanBallSave(raw.basketball),
    district_progress:{...base.district_progress,...raw.district_progress},
    painted_walls:strings(raw.painted_walls),graffiti_by_wall:raw.graffiti_by_wall??{},
    wall_styles:raw.wall_styles&&typeof raw.wall_styles==='object'?raw.wall_styles:{},
    wall_damage:Object.fromEntries(Object.entries(raw.wall_damage??{}).filter(([key,value])=>key.startsWith('SANDBOX_')&&['rival','cleaner','clean'].includes(value)).slice(0,200)),
    wall_drying:Object.fromEntries(Object.entries(raw.wall_drying??{}).filter(([key,value])=>key.startsWith('SANDBOX_')&&raw.wall_damage?.[key]==='cleaner'&&Number.isFinite(value)).slice(0,200).map(([key,value])=>[key,Math.max(0,Math.min(60,value))])),
    resume:raw.resume?.level==='sandbox'&&['district','hideout'].includes(raw.resume.mode)&&Number.isFinite(raw.resume.x)&&Number.isFinite(raw.resume.y)?{level:'sandbox',mode:raw.resume.mode,x:raw.resume.x,y:raw.resume.y,facing:['up','down','left','right'].includes(raw.resume.facing)?raw.resume.facing:'down',heat:Math.max(0,Math.min(5,Number(raw.resume.heat)||0))}:null,
    active_run:raw.active_run?.district==='district_01'?{
      district:'district_01',walls:strings(raw.active_run.walls),
      styles:raw.active_run.styles&&typeof raw.active_run.styles==='object'?raw.active_run.styles:{},
      heat:Number.isFinite(raw.active_run.heat)?Math.max(0,Math.min(5,Math.floor(raw.active_run.heat))):0,
      position:Number.isFinite(raw.active_run.position?.x)&&Number.isFinite(raw.active_run.position?.y)?{x:raw.active_run.position.x,y:raw.active_run.position.y}:null
    }:null,
    graffiti_unlocks:[...new Set([...base.graffiti_unlocks,...strings(raw.graffiti_unlocks)])],
    hideout:{upgrades:strings(raw.hideout?.upgrades),collectibles:strings(raw.hideout?.collectibles),display:['mini','tag','metro','king'].includes(raw.hideout?.display)?raw.hideout.display:'mini'},
    settings:{sound:raw.settings?.sound!==false,radioVolume:Number.isFinite(raw.settings?.radioVolume)?Math.max(0,Math.min(1,raw.settings.radioVolume)):.22}};
}
export class SaveStore{
  constructor(storage=globalThis.localStorage){this.storage=storage;this.warning='';}
  hasSave(){try{const raw=JSON.parse(this.storage.getItem(SAVE_KEY));return !!raw&&[1,2,3].includes(raw.save_version);}catch{return false;}}
  load(){
    try{return migrateSave(JSON.parse(this.storage.getItem(SAVE_KEY)));}
    catch(error){this.warning='Не удалось прочитать сохранение: '+error.message;return freshSave();}
  }
  write(data){const clean=migrateSave(data);this.storage.setItem(SAVE_KEY,JSON.stringify(clean));return clean;}
}
