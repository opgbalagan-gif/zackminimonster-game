import {appIcon} from './core__phone-icons.js?v=8a0ece6e2747';
export function instagramScreen(){
  const profile=document.createElement('section');profile.className='phone-instagram';profile.hidden=true;profile.setAttribute('aria-label','Instagram Зака');
  profile.innerHTML='<div class="ig-launch-icon" aria-hidden="true">'+appIcon('instagram')+'</div><h2>@zakminimonster</h2><p>Фото, видео и новые работы Зака в Instagram.</p><a class="ig-profile-link" href="https://www.instagram.com/zakminimonster/" target="_blank" rel="noopener noreferrer">Открыть настоящий профиль ↗</a><p class="ig-network-note">Instagram откроется в новой вкладке. Игра останется здесь.</p>';
  return profile;
}
