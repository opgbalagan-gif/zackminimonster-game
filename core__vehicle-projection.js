// Measured longitudinal and transverse body-edge slopes in each source sheet.
// Map both to the world's 2:1 axes while keeping vertical edges vertical.
const SLOPES={
  traffic_coupe:[[.61,-.24],[.72,-.24]],
  traffic_hatch:[[.60,-.24],[.72,-.22]],
  traffic_minivan:[[.57,-.27],[.62,-.29]],
  traffic_police:[[.56,-.25],[.66,-.22]],
  traffic_lowrider:[[.58,-.23],[.70,-.23]],
  traffic_executive:[[.55,-.25],[.65,-.23]]
};
export function vehicleProjection(type,direction){
  const rear=direction==='nw'||direction==='ne',mirror=direction==='sw'||direction==='ne';
  const [long,cross]=(SLOPES[type]??SLOPES.traffic_coupe)[rear?1:0];
  const scaleY=1/(long-cross),shear=.5-scaleY*long;
  return {scaleY,shear:mirror?-shear:shear};
}
