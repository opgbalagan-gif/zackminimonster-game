// The same ink gestures explain touch controls without covering the scene.
export function gestureHint(kind){
  const pinch=kind==='pinch';
  return `<svg class="gesture-demo gesture-${kind}" viewBox="0 0 160 72" aria-hidden="true"><path class="gesture-track" d="M24 25H136 M32 17l-8 8 8 8 M128 17l8 8-8 8"/><g class="gesture-finger gesture-first"><circle cx="${pinch?57:80}" cy="25" r="15"/><path d="M${pinch?57:80} 43V27c0-7 9-7 9 0v15l6-3 12 7-3 20h-22l-8-15c-3-6 3-9 6-5"/></g>${pinch?'<g class="gesture-finger gesture-second"><circle cx="103" cy="25" r="15"/><path d="M103 43V27c0-7 9-7 9 0v15l6-3 12 7-3 20h-22l-8-15c-3-6 3-9 6-5"/></g>':''}</svg>`;
}
