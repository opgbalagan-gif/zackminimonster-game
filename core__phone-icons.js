const shapes={
  camera:'<path d="M8 14h8l4-5h10l4 5h6a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z"/><circle cx="24" cy="27" r="9"/><circle cx="37" cy="20" r="1"/>',
  album:'<rect x="6" y="7" width="36" height="34" rx="8"/><circle cx="16" cy="17" r="3"/><path d="m8 35 12-12 8 7 6-6 8 11"/>',
  sms:'<path d="M12 8h24a7 7 0 0 1 7 7v15a7 7 0 0 1-7 7H22l-10 7v-7a7 7 0 0 1-7-7V15a7 7 0 0 1 7-7Z"/><path d="M14 19h20M14 26h13"/>',
  radio:'<path d="M12 34V12l25-5v24M12 18l25-5"/><ellipse cx="7" cy="35" rx="6" ry="4"/><ellipse cx="32" cy="32" rx="6" ry="4"/>',
  levels:'<path d="M8 39V28h10V19h10V9h12v30Z"/><path d="m31 7 5-4 5 4"/>',
  training:'<path d="m4 18 20-10 20 10-20 10Z"/><path d="M12 23v12c8 6 16 6 24 0V23M43 19v16"/>',
  map:'<path d="m5 10 13-5 12 5 13-5v33l-13 5-12-5-13 5ZM18 5v33m12-28v33"/><path d="m12 27 6-7 10 3 9-9"/>'
};
export function appIcon(name){return '<span class="duo-app-icon duo-'+name+'"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+shapes[name]+'</svg></span>';}
export function foldPhoneIcon(){return '<svg class="duo-device-icon" viewBox="0 0 48 64" aria-hidden="true"><defs><linearGradient id="duo-shell" x2="1" y2="1"><stop stop-color="#e1e7ef"/><stop offset=".5" stop-color="#718092"/><stop offset="1" stop-color="#d9e2ec"/></linearGradient><linearGradient id="duo-display" x2="1" y2="1"><stop stop-color="#514be2"/><stop offset=".55" stop-color="#ad65e7"/><stop offset="1" stop-color="#55d4ed"/></linearGradient></defs><rect x="8" y="2" width="32" height="60" rx="9" fill="url(#duo-shell)" stroke="#263445" stroke-width="2"/><rect x="11" y="5" width="26" height="54" rx="6" fill="url(#duo-display)"/><path d="M11 32h26" stroke="#202d43" stroke-width="2"/><rect x="20" y="7" width="8" height="3" rx="1.5" fill="#152335"/><path d="M18 55h12" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="m12 43 24-27v15L13 52Z" fill="#d8f7ff" opacity=".2"/></svg>';}
