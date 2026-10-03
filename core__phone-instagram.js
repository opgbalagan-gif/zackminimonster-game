export function instagramScreen(renderer){
  const profile=document.createElement('section');profile.className='phone-instagram';profile.hidden=true;profile.setAttribute('aria-label','Instagram Зака');
  profile.innerHTML='<header class="ig-top"><strong>Instagram</strong><span>♡</span></header><div class="ig-identity"><div class="ig-avatar"><canvas width="100" height="100" aria-label="Аватар Зака"></canvas></div><div><strong>zakminimonster</strong><p>ZAK MINI MONSTER<br>Граффити · персонажи · улицы</p></div></div><a class="ig-profile-link" href="https://www.instagram.com/zakminimonster/" target="_blank" rel="noopener noreferrer">Открыть Instagram ↗</a><div class="ig-grid-label">РАБОТЫ ИЗ ИГРЫ</div><div class="ig-grid"></div>';
  renderer.drawGraffiti(profile.querySelector('canvas').getContext('2d'),'monster',8,8,84,84);
  for(const [i,id] of ['panda_king','zack_tag','monster','zack_tag','monster','panda_king'].entries()){
    const tile=document.createElement('canvas');tile.width=160;tile.height=160;tile.setAttribute('aria-label','Граффити Зака');
    const c=tile.getContext('2d');c.fillStyle=['#e6d8bb','#263d51','#cab4d3','#a7c5b5','#e5c391','#647a8b'][i];c.fillRect(0,0,160,160);renderer.drawGraffiti(c,id,10,16,140,128);profile.querySelector('.ig-grid').append(tile);
  }
  return profile;
}
