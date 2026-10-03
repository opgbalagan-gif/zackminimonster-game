export class ContentLoader{
  constructor(){this.cache=new Map();this.packs=new Map();this.loaded=new Set();this.progress=0;}
  async json(url){
    if(this.cache.has(url))return this.cache.get(url);
    const response=await fetch(url);if(!response.ok)throw new Error(url+': HTTP '+response.status);
    const value=await response.json();this.cache.set(url,value);return value;
  }
  async loadDistrict(id,onProgress=()=>{}){
    return this.loadPack(id,'./data/districts.json',onProgress);
  }
  async loadLevel(id,onProgress=()=>{}){
    return this.loadPack(id,'./data__levels.json?v=af18bdaf4c2b',onProgress);
  }
  async loadPack(id,catalogPath,onProgress){
    if(this.packs.has(id))return this.packs.get(id);
    const catalog=await this.json(catalogPath),record=catalog.find(p=>p.id===id);
    if(!record)throw new Error('Unknown content pack: '+id);
    onProgress(.05);const manifest=await this.json(record.manifest);onProgress(.12);
    const [scene,renderer,graffiti,atlas]=await Promise.all([
      import(new URL(manifest.scene,document.baseURI).href),
      import(new URL(manifest.renderer,document.baseURI).href),
      this.json(manifest.graffiti_data),this.json(manifest.atlas_data)
    ]);
    onProgress(.25);let done=0;const images={};
    await Promise.all(atlas.sheets.map(async sheet=>{
      const img=new Image();img.src=manifest.art_base+sheet.file;
      try{await img.decode();}catch{throw new Error('Не загружен игровой атлас: '+sheet.file);}
      images[sheet.id]=img;done++;this.progress=.25+.75*done/atlas.sheets.length;onProgress(this.progress);
    }));
    const pack={manifest,world:scene.createDistrict(),graffiti,atlas,images,createRenderer:renderer.createRenderer};
    this.packs.set(id,pack);this.loaded.add(id);return pack;
  }
  unload(id){
    const pack=this.packs.get(id);if(pack)for(const image of Object.values(pack.images))image.src='';
    this.packs.delete(id);this.loaded.delete(id);
  }
  async prefetchCutscene(id){
    const catalog=await this.json('./cutscenes/manifest.json'),item=catalog.cutscenes.find(v=>v.id===id);
    if(!item)return null;
    const key='video:'+id;if(this.cache.has(key))return this.cache.get(key);
    const response=await fetch(item.url);if(!response.ok)throw new Error('Cutscene HTTP '+response.status);
    const blob=await response.blob();this.cache.set(key,blob);return blob;
  }
  releaseCutscene(id){this.cache.delete('video:'+id);}
}
