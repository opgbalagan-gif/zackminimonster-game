const intersects=(a,b,pad=0)=>a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;

// Deterministic dressing keeps every saved district and every visit consistent.
export function dressDistrict(w){
  const reserved=[w.spawn,w.hideout,w.surfaceMetro.approach,w.courtActivity,...w.targets.map(t=>t.approach),...w.bins.map(b=>b.approach),...w.streetNpcs.map(n=>n.approach),...w.mapRoutes];
  for(const p of w.blockProps){
    const radius=(p.w??40)*.48,clear=(x,y)=>{const r={x:x-radius,y:y-radius,w:radius*2,h:radius*2};return ![...w.roads,...w.paths,...w.buildings,...w.water,w.court].some(b=>intersects(r,b,12))&&!reserved.some(q=>Math.hypot(q.x-x,q.y-y)<70);};
    if(clear(p.x,p.y))continue;
    const choices=[];for(let dx=-480;dx<=480;dx+=24)for(let dy=-480;dy<=480;dy+=24)if(clear(p.x+dx,p.y+dy))choices.push({x:p.x+dx,y:p.y+dy,d:dx*dx+dy*dy});
    const q=choices.sort((a,b)=>a.d-b.d)[0];if(q){p.x=q.x;p.y=q.y;}
  }
  const occupied=[...w.nature.map(p=>({x:p.x,y:p.y,r:p.id==='comic_tree'?48:65})),...w.blockProps.map(p=>({x:p.x,y:p.y,r:p.id==='bench'?48:30}))];
  const bounds=w.mapBounds,counts={trees:0,benches:0,decor:0};
  function place(id,x,y,width,bodyW,bodyH,radius){
    const body={x:x-bodyW/2,y:y-bodyH/2,w:bodyW,h:bodyH};
    const roadFoot={x:x-width*.48,y:y-width*.48,w:width*.96,h:width*.96};
    if([...w.roads,...(id==='tree'?[]:w.paths)].some(r=>intersects(roadFoot,r,12)))return false;
    if(x<bounds.x+25||x>bounds.x+bounds.w-25||y<bounds.y+25||y>bounds.y+bounds.h-25)return false;
    if(x<650&&y<570)return false; // Keep the original tutorial/home block intact.
    if(reserved.some(p=>Math.hypot(x-p.x,y-p.y)<65+bodyW/2))return false;
    if(occupied.some(p=>Math.hypot(x-p.x,y-p.y)<p.r+radius))return false;
    if([...w.buildings,...w.obstacles,...w.water,...w.roads,...w.paths,w.court].some(b=>intersects(body,b,16)))return false;
    const uid='dressing_'+id+'_'+Math.round(x)+'_'+Math.round(y);
    if(id==='tree'){
      w.nature.push({id:'comic_tree',x,y,w:width,dressing:true,uid});counts.trees++;
    }else{
      w.blockProps.push({id,x,y,w:width,dressing:true,uid});counts[id==='bench'?'benches':'decor']++;
    }
    occupied.push({x,y,r:radius});w.obstacles.push({...body,dressing:true,uid});return true;
  }
  const plazas=[[2150,710],[1850,580],[2140,830],[2750,2080],[1100,1810],[1960,1950],[2510,2080],[3020,2280],[490,2940],[3020,3440]];
  for(const [i,[x,y]] of plazas.entries()){
    place(i%2?'notice':'cafe',x,y,i%2?62:110,i%2?38:70,i%2?14:62,i%2?33:55);
    place('lavender',x+90,y+35,52,26,26,24);
    place('bench',x-180,y,82,54,22,36);
  }
  // Avenue trees leave both carriageways, crossing mouths and pedestrian routes open.
  for(const [index,road] of w.roads.entries()){
    const horizontal=road.w>road.h,length=horizontal?road.w:road.h;
    for(let at=100;at<length-55;at+=168)for(const side of [-1,1]){
      const along=(horizontal?road.x:road.y)+at,across=horizontal?road.y+(side<0?-78:road.h+78):road.x+(side<0?-78:road.w+78);
      const x=horizontal?along:across,y=horizontal?across:along;
      place('tree',x,y,106+(Math.floor(at/168)+index)%3*10,14,14,43);
    }
    for(let at=188;at<length-65;at+=336)for(const side of [-1,1]){
      const along=(horizontal?road.x:road.y)+at,across=horizontal?road.y+(side<0?-67:road.h+67):road.x+(side<0?-67:road.w+67);
      const x=horizontal?along:across,y=horizontal?across:along;
      if(place('bench',x,y,82,54,22,36))place('flowers',x+(horizontal?65:0),y+(horizontal?0:65),49,26,26,22);
    }
  }
  // Low plantings and amenities make the residential alleys and canal walks distinct.
  for(const [i,b] of w.buildings.entries()){
    const x=b.x+b.w+46,y=b.y+b.h/2;
    if(i%3===0)place('tree',x,y,112,14,14,43);
    const kind=['flowers','lavender','bikes','hedge'][i%4];
    place(kind,b.x+b.w/2,b.y+b.h+47,kind==='bikes'?88:kind==='hedge'?76:50,kind==='bikes'?58:kind==='hedge'?60:26,26,kind==='bikes'?42:30);
  }
  for(const path of w.paths){
    if(path.h<=path.w)continue;
    for(let y=path.y+100;y<path.y+path.h-60;y+=300){
      place('bench',path.x+path.w+66,y,82,54,22,36);
      place('flowers',path.x-47,y+75,49,26,26,22);
      place('tree',path.x-63,y+180,118,14,14,43);
    }
  }
  for(const p of w.blockProps.filter(p=>p.id==='bench')){
    const near=[...w.paths,...w.roads].map(r=>({x:Math.max(r.x,Math.min(r.x+r.w,p.x)),y:Math.max(r.y,Math.min(r.y+r.h,p.y))})).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    p.flip=near?near.x-p.x>near.y-p.y:false;
  }
  w.dressingCounts=counts;
  return w;
}
