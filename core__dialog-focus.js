// Accessible focus scope for the existing phone overlay, including its camera.
export function dialogFocus(dialog,onEscape){
  let previous=null,background=[];
  const controls=()=>[...dialog.querySelectorAll('button,a[href],input,select,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length&&!el.closest('[hidden]'));
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onEscape();return;}
    if(event.key!=='Tab')return;
    const items=controls(),first=items[0],last=items.at(-1);if(!first)return;
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  return {
    open(origin=document.activeElement){previous=origin;background=[...dialog.parentElement.children].filter(el=>el!==dialog).map(el=>[el,el.inert]);for(const [el] of background)el.inert=true;controls()[0]?.focus();},
    close(){for(const [el,value] of background)el.inert=value;background=[];previous?.focus();previous=null;}
  };
}
