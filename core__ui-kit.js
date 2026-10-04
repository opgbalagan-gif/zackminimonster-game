import {installArtTokens} from './core__art-direction.js?v=5e1de61c4ab4';
const paths={
  talk:'<path d="M3 4h20v14H12l-6 5v-5H3Z"/><path d="M7 9h12M7 13h8"/>',
  ball:'<circle cx="13" cy="13" r="10"/><path d="M3 13h20M13 3v20M6 6c9 2 9 12 0 14M20 6c-9 2-9 12 0 14"/>',
  metro:'<rect x="5" y="3" width="16" height="17" rx="3"/><path d="M8 7h10v6H8zM8 20l-3 4m13-4 3 4M8 17h2m6 0h2"/>',
  camera:'<path d="M3 8h5l2-4h6l2 4h5v14H3z"/><circle cx="13" cy="15" r="5"/>',
  bin:'<path d="M5 7h16l-2 16H7ZM3 6h20M9 3h8M10 10v9m6-9v9"/>',
  spray:'<path d="M8 8h10v14H8zM10 5h6v3h-6zM12 2h5v3h-5z"/><path d="M10 11v7M19 3h3"/>',
  home:'<path d="m3 11 10-8 10 8M6 10v12h5v-7h5v7h5V10"/>',
  music:'<path d="M11 19V5l10-2v14M11 8l10-2"/><ellipse cx="7" cy="20" rx="4" ry="3"/><ellipse cx="17" cy="18" rx="4" ry="3"/>',
  sound:'<path d="M3 10h4l5-5v16l-5-5H3zM16 9c3 2 3 6 0 8M19 5c6 4 6 12 0 16"/>',
  mute:'<path d="M3 10h4l5-5v16l-5-5H3zM17 10l6 7m0-7-6 7"/>',
  arrow:'<path d="m10 5 8 8-8 8"/>',
  close:'<path d="m6 6 14 14M20 6 6 20"/>',
  star:'<path d="m13 2 3.2 7.2 7.8.8-5.8 5.3 1.7 7.7L13 19l-6.9 4 1.7-7.7L2 10l7.8-.8Z"/><path class="star-facet" d="m13 2 0 11 10.9-3-5.7 5.3 1.7 7.7-6.9-10-6.9 10 1.7-7.7Z"/>',
  lock:'<rect x="5" y="11" width="16" height="12"/><path d="M8 11V7a5 5 0 0 1 10 0v4M13 15v4"/>',
  rep:'<path d="m13 2 9 11-9 11L4 13Z"/><path d="m9 13 3 3 5-6"/>'
};
const painted={spray:0,home:1,music:2,camera:3,rest:4,wardrobe:5,sprays:6,collection:7,save:8,bin:9,arrow:10,close:11,sound:12,mute:13,phone:14,star:15};
export function uiIcon(name){
  if(name==='star')return '<span class="ui-icon graffiti-star" aria-hidden="true"></span>';
  const cell=painted[name];
  if(cell!==undefined)return '<span class="ui-icon painted-icon" aria-hidden="true" style="background-position:'+(cell%4*100/3)+'% '+(Math.floor(cell/4)*100/3)+'%"></span>';
  return '<svg class="ui-icon" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="miter" aria-hidden="true">'+(paths[name]??paths.arrow)+'</svg>';
}
export function setUIButton(button,label,icon=''){
  const key=label+'|'+icon;if(button.dataset.uiContent===key)return;
  button.dataset.uiContent=key;button.replaceChildren();
  if(icon){const span=document.createElement('span');span.className='button-icon';span.innerHTML=uiIcon(icon);button.append(span);}
  const text=document.createElement('span');text.className='button-label';text.textContent=label;button.append(text);
  if(button.classList.contains('primary')){const arrow=document.createElement('span');arrow.className='button-arrow';arrow.innerHTML=uiIcon('arrow');button.append(arrow);}
}
// Components can decorate an existing element (preserving its event listeners)
// or create a new one. The same tokens/classes serve both paths.
function component(name,tag,classes){return (element=null,options={})=>{
  const el=element??document.createElement(tag);el.dataset.uiComponent=name;
  el.classList.add(...classes.split(' '));
  if(options.label!==undefined){if(tag==='button')setUIButton(el,options.label,options.icon??'');else el.textContent=options.label;}
  if(options.value!==undefined)el.value=options.value;if(options.max!==undefined)el.max=options.max;
  return el;
};}
export const UIPanel=component('UIPanel','section','ui-panel');
export const UIPrimaryButton=component('UIPrimaryButton','button','primary ui-primary');
export const UISecondaryButton=component('UISecondaryButton','button','secondary ui-secondary');
export const UISegmentedStep=component('UISegmentedStep','span','ui-segment');
export const UIHeaderStat=component('UIHeaderStat','div','ui-header-stat');
export const UIProgressBar=component('UIProgressBar','progress','ui-progress');
export const UIRewardBadge=component('UIRewardBadge','div','ui-reward');
export const UILabelSmall=component('UILabelSmall','span','eyebrow ui-label');
export const UITitleLarge=component('UITitleLarge','h2','ui-title');
export const UIActionBar=component('UIActionBar','div','ui-action-bar');
export const UIHUDTopBar=component('UIHUDTopBar','header','ui-hud-top');
export function applyUIComponents(root=document){
  const bindings=[
    [UIPanel,'.panel,.player-card,.heat-card,.court-card,.ball-card,.poi-card,.poster-card,.radio-panel,.hideout-panel,#tutorial-panel'],
    [UIPrimaryButton,'.primary'],[UISecondaryButton,'.secondary'],[UISegmentedStep,'.phase-track span,.lesson-progress i'],
    [UIHeaderStat,'.player-card,.heat-card'],[UIProgressBar,'progress'],[UIRewardBadge,'.graffiti-reward'],
    [UILabelSmall,'.eyebrow,.lesson-kicker'],[UITitleLarge,'h2,.district-title strong'],
    [UIActionBar,'.interaction,.radio-controls,.home-dock'],[UIHUDTopBar,'#hud']
  ];
  for(const [decorate,selector] of bindings)for(const el of root.querySelectorAll(selector))decorate(el);
}
export function initUITheme(){
  installArtTokens();
  document.documentElement.dataset.theme='street-gold';
  applyUIComponents();
  for(const button of document.querySelectorAll('.primary'))setUIButton(button,button.textContent.replace(/[↗→]/g,'').trim());
  for(const id of ['radio-stop','home-panel-close']){const b=document.getElementById(id);b.innerHTML=uiIcon('close');}
  document.getElementById('radio-toggle').innerHTML=uiIcon('music');
  document.getElementById('home-route').innerHTML=uiIcon('home')+'<span>ДОМОЙ</span>';
  const meter=UIProgressBar(null,{max:6,value:1});meter.id='lesson-meter';meter.setAttribute('aria-label','Прогресс уровня');document.getElementById('run-rep').after(meter);
  for(const id of ['new-game-dialog','graffiti-screen','ball-screen','court-screen','poster-screen','poi-screen','map-screen']){
    const panel=document.getElementById(id);if(panel.dataset.keyboardScope)continue;panel.dataset.keyboardScope='true';
    panel.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&id==='new-game-dialog'){e.preventDefault();e.stopPropagation();document.getElementById('new-game-cancel').click();return;}
      if(e.key!=='Tab')return;
      const controls=[...panel.querySelectorAll('button:not(:disabled),a[href],select,input')].filter(el=>el.getClientRects().length&&!el.closest('[hidden]'));
      const i=controls.indexOf(document.activeElement);if(!controls.length)return;
      if(i<0||e.shiftKey&&i===0||!e.shiftKey&&i===controls.length-1){e.preventDefault();controls[e.shiftKey?controls.length-1:0].focus();}
    });
  }
}
export function syncUIStats(session,radio){
  const heat=document.getElementById('heat-stars');
  if(heat.dataset.value!==String(session.heat)){
    heat.dataset.value=session.heat;heat.innerHTML=Array.from({length:5},(_,i)=>'<span class="heat-star '+(i<session.heat?'active':'')+'">'+uiIcon('star')+'</span>').join('');
  }
  const toggle=document.getElementById('radio-toggle');toggle.setAttribute('aria-pressed',String(radio.wanted));toggle.setAttribute('aria-label',radio.wanted?'Выключить радио':'Включить радио');
  const sound=document.getElementById('sound-button'),key=String(session.save.settings.sound);
  if(sound.dataset.value!==key){sound.dataset.value=key;sound.innerHTML=uiIcon(session.save.settings.sound?'sound':'mute');}
  sound.setAttribute('aria-label',session.save.settings.sound?'Выключить звук игры':'Включить звук игры');
}
