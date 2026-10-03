import {UIPanel,UISecondaryButton,UITitleLarge} from './core__ui-kit.js';
export function showChapters(save,onPick){
  document.getElementById('chapter-select')?.remove();
  const panel=document.createElement('section');panel.id='chapter-select';panel.setAttribute('aria-label','Выбор уровня');
  UIPanel(panel);const heading=UITitleLarge(null,{label:'ТВОЙ ПУТЬ'});
  const copy=document.createElement('p');copy.textContent='История Зака — от первой стены до ночных вылазок. Уровни открываются постепенно.';panel.append(heading,copy);
  const levels=[{id:'tutorial',name:'ПЕРВЫЙ СЛЕД',open:true,detail:save.campaign.tutorialComplete?'Обучение пройдено · пройти ещё раз':'Дом, первая стена и три незваных зрителя · обучение'},
    {id:'sneak',name:'ТИШЕ УЛИЦЫ',open:save.campaign.tutorialComplete,detail:save.campaign.sneakComplete?'Пройдено · прятки, подарок и фото':save.campaign.tutorialComplete?'Прятки в баках · новый рисунок · раскладушка и камера':'Пройди «Первый след», чтобы открыть'}];
  levels.forEach((l,i)=>{const button=document.createElement('button');button.className='chapter-card';button.disabled=!l.open;
    const number=document.createElement('b'),title=document.createElement('strong'),detail=document.createElement('small');number.textContent=String(i+1).padStart(2,'0');title.textContent=l.name;detail.textContent=l.detail;
    button.append(number,title,detail);button.onclick=()=>{panel.remove();onPick(l.id);};panel.append(button);});
  const back=UISecondaryButton(null,{label:'НАЗАД'});back.onclick=()=>panel.remove();panel.append(back);document.getElementById('app').append(panel);
}
