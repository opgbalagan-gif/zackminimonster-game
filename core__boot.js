try{
  await import('./core__main.js?v=200bdb7a657c');
}catch(error){
  console.error('Boot failure',error);
  const status=document.getElementById('load-status');
  status.textContent='Не удалось запустить игру: '+error.message;
  document.getElementById('start-button').onclick=()=>location.reload();
}
