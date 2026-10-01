import {cleanBallSave} from './core__basketball.js';
export const SAVE_KEY='zackminimonster.save';
export const SAVE_VERSION=3;
export function freshSave(){
  return {save_version:SAVE_VERSION,player:{skin:'zack',ink:'purple'},rep:0,
    district_progress:{district_01:{visits:0}},painted_walls:[],graffiti_by_wall:{},basketball:{completed:false,pixels:[],stickers:[]},
    wall_styles:{},active_run:null,graffiti_unlocks:['zack_tag','monster','crown','panda_king'],hideout:{upgrades:[],collectibles:[],display:'mini'},settings:{sound:true,radioVolume:.22}};
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
    basketball:cleanBallSave(raw.basketball),
    district_progress:{...base.district_progress,...raw.district_progress},
    painted_walls:strings(raw.painted_walls),graffiti_by_wall:raw.graffiti_by_wall??{},
    wall_styles:raw.wall_styles&&typeof raw.wall_styles==='object'?raw.wall_styles:{},
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
  load(){
    try{return migrateSave(JSON.parse(this.storage.getItem(SAVE_KEY)));}
    catch(error){this.warning='Не удалось прочитать сохранение: '+error.message;return freshSave();}
  }
  write(data){const clean=migrateSave(data);this.storage.setItem(SAVE_KEY,JSON.stringify(clean));return clean;}
}
