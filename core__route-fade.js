export function routeFade(position,start,end,width=180){
  const t=Math.max(0,Math.min(1,(position-start)/width,(end-position)/width));
  return t*t*(3-2*t);
}
