export const ROAD_CARS=['taxi','blue_car','van','jdm_coupe','lowrider','executive'];
export function districtCar(world,x,y,fallback='blue_car'){
  const region=world.regions?.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
  return {east:'jdm_coupe',downtown:'lowrider',harbour:'executive',arts:'jdm_coupe'}[region?.id]??fallback;
}
