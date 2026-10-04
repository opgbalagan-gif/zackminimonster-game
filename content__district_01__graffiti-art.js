// Keep legacy save IDs while replacing all four designs with the new artist series.
export const GRAFFITI_ART={
  monster_crew:{sprite:'mural_monster_crew',name:'MONSTER CREW',palette:['#3cdbc1','#ef59ad','#f5e8cc']},
  stereo_friends:{sprite:'mural_stereo_friends',name:'STEREO FRIENDS',palette:['#8458dc','#288de6','#f5e8cc']},
  night_friends:{sprite:'mural_night_friends',name:'NIGHT FRIENDS',palette:['#3f51c9','#f357aa','#f5e8cc']},
  toy_kings:{sprite:'mural_toy_kings',name:'TOY KINGS',palette:['#f6c137','#35dcb4','#f5e8cc']},
  panda_king:{sprite:'mural_street_flow',name:'STREET FLOW',palette:['#31c9cd','#f9df48','#182e46']},
  zack_tag:{sprite:'mural_color_crew',name:'COLOR CREW',palette:['#ef69ac','#70dab9','#386bd8']},
  monster:{sprite:'mural_paper_ghost',name:'PAPER GHOST',palette:['#f3e7c8','#e04d3e','#9acbdf']},
  crown:{sprite:'mural_sunset_block',name:'SUNSET BLOCK',palette:['#f29943','#69c4e7','#b99ae2']}
};
export function drawGraffiti(c,id,x,y,w,h,atlas,color=null){
  const art=GRAFFITI_ART[id]??GRAFFITI_ART.panda_king,rect=atlas.rect(art.sprite);if(!rect)return;
  const scale=Math.min(w/rect[2],h/rect[3]),width=Math.min(w,rect[2]*scale),height=Math.min(h,rect[3]*scale);
  atlas.draw(c,art.sprite,x+w/2,y+(h+height)/2,width,height);
  // Equipment affects finishing dots; the original multicolour artwork stays intact.
  if(color){
    c.save();c.fillStyle=color;
    for(const [dx,dy,r] of [[.10,.82,.013],[.14,.89,.009],[.88,.23,.01]]){
      c.beginPath();c.arc(x+(w-width)/2+width*dx,y+(h-height)/2+height*dy,Math.max(.6,width*r),0,Math.PI*2);c.fill();
    }c.restore();
  }
}
