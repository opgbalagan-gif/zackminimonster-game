import {UIPanel,UISecondaryButton,UITitleLarge} from './core__ui-kit.js?v=0bee4946821b';
export function showChapters(save,onPick,initialTab='path'){
  document.getElementById('chapter-select')?.remove();
  const panel=document.createElement('section');panel.id='chapter-select';panel.setAttribute('aria-label','Путь и обучение');
  UIPanel(panel);panel.append(UITitleLarge(null,{label:'ТВОЙ ПУТЬ'}));
  const tabs=document.createElement('div');tabs.className='chapter-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Раздел пути');
  const body=document.createElement('div');body.className='chapter-body';body.id='chapter-body';body.setAttribute('role','tabpanel');
  const training=[{id:'tutorial',name:'ПЕРВЫЙ СЛЕД',open:true,done:save.campaign.tutorialComplete,detail:'Дом, краска и первый выход на улицу'},
    {id:'sneak',name:'ТИШЕ УЛИЦЫ',open:save.campaign.tutorialComplete,done:save.campaign.sneakComplete,detail:'Прятки, новый рисунок и камера'}];
  const select=tab=>{
    for(const button of tabs.children){const active=button.dataset.tab===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
    body.replaceChildren();body.setAttribute('aria-labelledby','chapter-tab-'+tab);
    const copy=document.createElement('p');copy.textContent=tab==='training'?'Уроки можно пройти по порядку и повторить позже.':'Первый район открыт. Рисуй, исследуй и живи в своём ритме. Следующие районы продолжат этот путь.';body.append(copy);
    if(tab==='training'){
      training.forEach((l,i)=>{const button=document.createElement('button');button.className='chapter-card';button.disabled=!l.open;
        const number=document.createElement('b'),title=document.createElement('strong'),detail=document.createElement('small');number.textContent=String(i+1).padStart(2,'0');title.textContent=l.name;detail.textContent=l.done?'Пройдено · повторить урок':l.open?l.detail:'Сначала пройди «Первый след»';
        button.append(number,title,detail);button.onclick=()=>{panel.remove();onPick(l.id);};body.append(button);});
    }else{
      const level=document.createElement('button');level.className='chapter-card';level.innerHTML='<b>01</b><strong>СВОЙ РАЙОН</strong><small>10 домов · трафик · баскетбол · наземное метро</small>';level.onclick=()=>{panel.remove();onPick('sandbox');};body.append(level);
      const learn=UISecondaryButton(null,{label:save.campaign.sneakComplete?'ПОВТОРИТЬ ОБУЧЕНИЕ':'ПЕРЕЙТИ К ОБУЧЕНИЮ'});learn.onclick=()=>select('training');body.append(learn);
    }
  };
  for(const [id,label] of [['path','ПУТЬ'],['training','ОБУЧЕНИЕ']]){const b=UISecondaryButton(null,{label});b.id='chapter-tab-'+id;b.dataset.tab=id;b.setAttribute('role','tab');b.setAttribute('aria-controls','chapter-body');b.onclick=()=>select(id);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'path':e.key==='End'?'training':id==='path'?'training':'path';select(next);document.getElementById('chapter-tab-'+next).focus();}};tabs.append(b);}
  panel.append(tabs,body);select(initialTab==='training'?'training':'path');
  const back=UISecondaryButton(null,{label:'НАЗАД'});back.onclick=()=>panel.remove();panel.append(back);document.getElementById('app').append(panel);
}
