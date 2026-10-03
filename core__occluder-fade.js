import {buildingOccludesZack} from './content__district_01__occlusion.js?v=391ab0f86039';

// One opacity per object; entering and leaving an obstruction both ease smoothly.
export class OccluderFade{
  constructor(){this.values=new Map();}
  alpha(id,bounds,depth,hero,dt,opaqueAt=()=>true){
    const target=(hero&&buildingOccludesZack(bounds,depth,hero,opaqueAt)) ? .28 : 1;
    const before=this.values.get(id)??1;
    const next=before+(target-before)*(1-Math.exp(-12*Math.min(.1,Math.max(0,dt))));
    const value=Math.abs(next-target)<.002?target:next;
    this.values.set(id,value);return value;
  }
}
