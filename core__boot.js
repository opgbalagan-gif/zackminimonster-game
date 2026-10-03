try{
  await import('./core__main.js?v=a7cd92ef07f6');
}catch(error){
  console.error('Boot failure',error);
  const status=document.getElementById('load-status');
  status.textContent='Не удалось запустить игру: '+error.message;
  document.getElementById('start-button').onclick=()=>location.reload();
}
