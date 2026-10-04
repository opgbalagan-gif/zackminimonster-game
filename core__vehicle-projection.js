// Measured longitudinal and transverse body-edge slopes in each source sheet.
// Preserve the original body height; align the driving axis by shear only.
const SLOPES={
  traffic_coupe:[[.45,-.27],[.45,-.27]],
  traffic_hatch:[[.47,-.26],[.47,-.26]],
  traffic_minivan:[[.49,-.26],[.49,-.26]],
  traffic_police:[[.44,-.27],[.44,-.27]],
  traffic_lowrider:[[.43,-.26],[.43,-.26]],
  traffic_executive:[[.46,-.26],[.46,-.26]],
  traffic_delivery:[[.45,-.27],[.45,-.27]],
  traffic_pickup:[[.43,-.27],[.43,-.27]],
  traffic_kei:[[.47,-.27],[.47,-.27]],
  traffic_taxi:[[.46,-.27],[.46,-.27]]
};
export function vehicleProjection(type,direction){
  const rear=direction==='nw'||direction==='ne',mirror=direction==='sw'||direction==='ne';
  const [long,cross]=(SLOPES[type]??SLOPES.traffic_coupe)[rear?1:0];
  const scaleY=1,shear=.5-long;
  return {scaleY,shear:mirror?-shear:shear};
}
