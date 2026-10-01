const shapes={
  home:'<path d="M3 11 12 3l9 8v10h-6v-7H9v7H3Z"/>',
  wardrobe:'<path d="m8 3-5 3-2 6 5 2v8h12v-8l5-2-2-6-5-3c0 5-8 5-8 0Z"/>',
  sprays:'<path d="M6 8h12v14H6zM8 5h8v3H8zM11 1h5v4h-5z"/><path d="M9 12v7"/>',
  collection:'<rect x="3" y="3" width="20" height="20" rx="2"/><circle cx="13" cy="13" r="6"/><path d="M10 11h1m4 0h1m-5 5h4"/>',
  rest:'<path d="M3 20V8m0 9h18v4M5 10h5v6H5zM10 12h11v5"/>',
  save:'<path d="M3 3h16l3 3v16H3Z"/><path d="M7 3v7h10V3M7 22v-8h11v8"/>',
  music:'<path d="M3 8h20v14H3zM5 8l13-5M6 12h6M6 17h3"/><circle cx="18" cy="16" r="3"/>',
  exit:'<path d="M13 4H4v17h9M10 12h13m-5-5 5 5-5 5"/>'
};
export function homeIcon(name){return '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="miter" aria-hidden="true">'+(shapes[name]??shapes.home)+'</svg>';}
