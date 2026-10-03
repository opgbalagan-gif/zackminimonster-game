// Reference calibration: warm paper / cool ink, with paint reserved for accents.
// Shared by the canvas renderer and DOM components; all sizes are CSS/world units.
export const ART=Object.freeze({
  ink:'#172f3c',navy:'#0e1c29',paper:'#f4eedb',stone:'#dcd3bc',asphalt:'#485966',
  teal:'#388a91',sage:'#869b68',coral:'#cf7e67',gold:'#e4bf72',paint:'#dc60bd',
  muted:'#b0c4ca',line:1.25,paving:80,button:48,gap:8,panel:24,
});
export function installArtTokens(){
  for(const [name,value] of Object.entries(ART))document.documentElement.style.setProperty('--art-'+name,typeof value==='number'?value+'px':value);
}
