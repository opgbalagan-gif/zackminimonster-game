// Body dimensions are in world units; sprite width includes the transverse face.
export const TRAFFIC_FLEET={
  traffic_coupe:{width:122,length:90,breadth:30},
  traffic_hatch:{width:114,length:82,breadth:29},
  traffic_minivan:{width:132,length:94,breadth:32},
  traffic_police:{width:128,length:94,breadth:31},
  traffic_lowrider:{width:138,length:106,breadth:32},
  traffic_executive:{width:130,length:98,breadth:32},
  traffic_delivery:{width:136,length:100,breadth:33},
  traffic_pickup:{width:132,length:100,breadth:32},
  traffic_kei:{width:106,length:74,breadth:28},
  traffic_taxi:{width:130,length:98,breadth:32}
};
export const TRAFFIC_TYPES=Object.keys(TRAFFIC_FLEET);
export const vehicleBody=car=>TRAFFIC_FLEET[car.type]??{width:122,length:58,breadth:26};
export function followingDistance(car,leader){
  return (vehicleBody(car).length+vehicleBody(leader).length)/2+(TRAFFIC_FLEET[car.type]?24:18);
}
