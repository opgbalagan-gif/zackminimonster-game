// One physical tap per press; holding a key does not add points.
export class TapDuel{
  constructor(){this.phase='ready';this.elapsed=0;this.player=0;this.rival=0;this.duration=1.5;this.lastTap=-1;this.resultAge=0;}
  tap(){
    if(this.phase==='ready')this.phase='playing';
    if(this.phase!=='playing'||this.elapsed-this.lastTap<.045)return false;
    this.lastTap=this.elapsed;this.player++;return true;
  }
  update(dt){
    if(this.phase==='result'){this.resultAge+=dt;return;}
    if(this.phase!=='playing')return;
    this.elapsed=Math.min(this.duration,this.elapsed+dt);
    this.rival=Math.floor(this.elapsed*4);
    if(this.elapsed>=this.duration){this.phase='result';this.won=this.player>this.rival;}
  }
}
