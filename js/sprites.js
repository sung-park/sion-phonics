// Original pixel-art / voxel graphics rendered as inline SVG (no external art assets).
const cache = new Map();
function rng(seed){ let s = seed>>>0 || 1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>17; s^=s<<5; s>>>=0; return (s%10000)/10000; }; }
function hashStr(str){ let h=2166136261; for (const c of str){ h^=c.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
function shade(hex, f){ const n=parseInt(hex.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=Math.min(255,Math.round(r*f)); g=Math.min(255,Math.round(g*f)); b=Math.min(255,Math.round(b*f));
  return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1); }

// ---- textures: (face:'top'|'side', x, y, rand) => color ----
const noise = cols => (f,x,y,r)=>cols[Math.floor(r()*cols.length)];
const ore = (base, spot, spots) => (f,x,y,r)=> spots.some(([a,b])=>a===x&&b===y) ? spot[(x+y)%spot.length] : base[Math.floor(r()*base.length)];
const STONE = ['#8d9197','#7f8389','#9a9ea4','#868a90'];
const DIRT = ['#8a5a32','#7a4e2a','#966540','#6f4626'];
const GRASS = ['#5fb846','#52a83d','#6cc451','#4b9a36'];
const ORE_SPOTS = [[1,1],[2,1],[5,2],[6,3],[2,5],[3,5],[5,6],[1,6]];
// Order = progression order (surface -> caves -> deep -> lava depths -> crafted treasure). See js/rewards.js.
export const BLOCKS = {
  dirt:    {name:'흙 블록', rarity:1, tex:noise(DIRT)},
  grass:   {name:'잔디 블록', rarity:1, tex:(f,x,y,r)=> f==='top' ? GRASS[Math.floor(r()*4)] : (y<2 || (y===2 && (x*7)%3===0)) ? GRASS[Math.floor(r()*4)] : DIRT[Math.floor(r()*4)]},
  wood:    {name:'통나무', rarity:1, tex:(f,x,y,r)=> f==='top' ? (Math.max(Math.abs(x-3.5),Math.abs(y-3.5))%2<1 ? '#b98a52':'#a0743f') : (x%3===0 ? '#5a3d22' : ['#6e4b2a','#7a5531','#664526'][Math.floor(r()*3)])},
  leaf:    {name:'나뭇잎 블록', rarity:1, tex:noise(['#3f8f2f','#347a27','#4ea33a','#2c6a21','#3f8f2f'])},
  sand:    {name:'모래 블록', rarity:1, tex:noise(['#e3d29a','#d9c68a','#ecdcab','#d2bd7e'])},
  plank:   {name:'판자 블록', rarity:1, tex:(f,x,y,r)=> y%4===3 ? '#7d5a33' : ((x+(y>3?4:0))%8===0 ? '#8a6539' : ['#b08550','#a57b47','#ba8f59'][Math.floor(r()*3)])},
  cobble:  {name:'조약돌 블록', rarity:1, tex:(f,x,y,r)=> ((x+ (y%3===0?1:0))%3===0 || y%3===0) ? '#6c7076' : ['#9a9ea4','#8d9197','#a7abb1'][Math.floor(r()*3)]},
  stone:   {name:'돌 블록', rarity:1, tex:noise(STONE)},
  mossy:   {name:'이끼 낀 돌', rarity:2, tex:(f,x,y,r)=> r()<0.45 ? ['#5d9a3c','#4b8a2f','#6fae49'][Math.floor(r()*3)] : ['#8d9197','#7f8389','#9a9ea4'][Math.floor(r()*3)]},
  prism:   {name:'바다 벽돌', rarity:3, tex:(f,x,y,r)=> (y%4===3||x%4===0) ? '#2f7f78' : ['#5fc4b4','#4fb3a6','#73d1c1'][Math.floor(r()*3)]},
  deep:    {name:'심층암', rarity:3, tex:(f,x,y,r)=> y%3===0 ? '#2b2e36' : ['#3d414b','#464a55','#353943'][Math.floor(r()*3)]},
  hellrock:{name:'지옥 바위', rarity:3, tex:noise(['#7a2a2a','#8f3434','#6a2222','#a03d3a','#5c1d1d'])},
  endstone:{name:'끝의 돌', rarity:4, tex:noise(['#e8e6b0','#dcd99c','#f1efc4','#cfcc8e'])},
  coal:    {name:'석탄 광석', rarity:2, tex:ore(STONE,['#2b2b2e','#3a3a3f'],ORE_SPOTS)},
  copper:  {name:'구리 광석', rarity:2, tex:ore(STONE,['#e0874f','#c46a36','#4fb39a'],ORE_SPOTS)},
  iron:    {name:'철 광석', rarity:2, tex:ore(STONE,['#d8b89a','#c9a383'],ORE_SPOTS)},
  ice:     {name:'얼음 블록', rarity:2, tex:(f,x,y,r)=> (x===y||x===y+4) ? '#e8f7ff' : ['#a9dcf5','#9bd2ee','#b6e3f8'][Math.floor(r()*3)]},
  cloud:   {name:'구름 블록', rarity:2, tex:noise(['#ffffff','#f1f6fb','#e6eef7'])},
  gold:    {name:'금 광석', rarity:3, tex:ore(STONE,['#ffd84a','#f2b92a'],ORE_SPOTS)},
  sapphire:{name:'청금석 광석', rarity:3, tex:ore(STONE,['#3f7bff','#2a55d9'],ORE_SPOTS)},
  ruby:    {name:'붉은돌 광석', rarity:3, tex:ore(STONE,['#ff4d5e','#d92b3e'],ORE_SPOTS)},
  lava:    {name:'용암 블록', rarity:3, tex:noise(['#ff7a1a','#ff5a0a','#ffb02e','#e8430a','#ff9a1f'])},
  glow:    {name:'빛나는 블록', rarity:3, tex:noise(['#ffd166','#ffb84d','#ffe08a','#f4a63a','#fff0b3'])},
  obsidian:{name:'흑요석', rarity:4, tex:noise(['#1d1430','#2a1d45','#160f26','#3a2766'])},
  diamond: {name:'다이아몬드 광석', rarity:4, tex:ore(STONE,['#6ff0ea','#3ccfd0'],ORE_SPOTS)},
  emerald: {name:'에메랄드 광석', rarity:4, tex:ore(STONE,['#3ee07a','#1fb85a'],ORE_SPOTS)},
  goldblock:{name:'금 블록', rarity:5, tex:(f,x,y,r)=> (x===0||y===0) ? '#fff2a8' : (x===7||y===7) ? '#d9a21c' : ['#ffd84a','#f9cc33'][Math.floor(r()*2)]},
  diamondblock:{name:'다이아 블록', rarity:5, tex:(f,x,y,r)=> (x===0||y===0) ? '#d9fffd' : (x===7||y===7) ? '#2fb7b8' : ['#7ff3ee','#65e6e2'][Math.floor(r()*2)]},
  power:   {name:'파워 큐브', rarity:5, tex:(f,x,y,r)=> (x>=2&&x<=5&&y>=2&&y<=5) ? ((x===3||x===4)&&(y===3||y===4) ? '#e8ffff' : '#4ef2ff') : (x===0||y===0||x===7||y===7) ? '#5c6577' : '#3a4150'},
};

const M = 8;
export function block(type='grass', {size=64, face=false, glow=false}={}){
  const key = type+size+face+glow; if (cache.has(key)) return cache.get(key);
  const t = BLOCKS[type] || BLOCKS.grass; const r = rng(hashStr(type));
  const faces = [
    ['top', [28/M,-14/M,28/M,14/M,4,18], 1.0],
    ['side',[28/M,14/M,0,30/M,4,18], 0.82],
    ['side',[28/M,-14/M,0,30/M,32,32], 0.64],
  ];
  let s = `<svg class="vox" viewBox="0 0 64 66" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">`;
  if (glow) s += `<ellipse cx="32" cy="60" rx="24" ry="5" fill="rgba(0,0,0,.18)"/>`;
  for (const [f, m, k] of faces){
    s += `<g transform="matrix(${m.join(' ')})">`;
    for (let y=0;y<M;y++) for (let x=0;x<M;x++){
      let c = shade(t.tex(f,x,y,r), k);
      s += `<rect x="${x}" y="${y}" width="1.04" height="1.04" fill="${c}"/>`;
    }
    if (face && m[4]===4 && m[5]===18 && f==='side'){ // cute face on the left side
      s += `<rect x="1.5" y="2.5" width="1.4" height="2" fill="#1b1e2b"/><rect x="5.1" y="2.5" width="1.4" height="2" fill="#1b1e2b"/>`+
           `<rect x="1.8" y="2.7" width=".5" height=".6" fill="#fff"/><rect x="5.4" y="2.7" width=".5" height=".6" fill="#fff"/>`+
           `<rect x="3" y="5.3" width="2" height=".8" fill="#1b1e2b"/><rect x=".6" y="4.6" width="1" height=".7" fill="#ff8fa3" opacity=".8"/><rect x="6.4" y="4.6" width="1" height=".7" fill="#ff8fa3" opacity=".8"/>`;
    }
    s += `</g>`;
  }
  s += `<path d="M32 4 L60 18 L60 48 L32 62 L4 48 L4 18 Z" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2" stroke-linejoin="round"/>`;
  s += `<path d="M4 18 L32 32 L60 18 M32 32 L32 62" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="0.8"/></svg>`;
  cache.set(key, s); return s;
}

// ---- Hero avatar (16 x 20 pixel grid, original design) ----
const HERO_BASE = [
  '....HHHHHHHH....','....HHHHHHHH....','....HSSSSSSH....','....SSSSSSSS....','....SWESSEWS....',
  '....SSSSSSSS....','....SSSMMSSS....','....SSSSSSSS....','..TTTTTTTTTTTT..','..TTTTTTTTTTTT..',
  '..TTTTTTTTTTTT..','..SSTTTTTTTTSS..','..SSTTTTTTTTSS..','..SSTTTTTTTTSS..','....PPPPPPPP....',
  '....PPPPPPPP....','....PPPppPPP....','....PPP..PPP....','....BBB..BBB....','....BBB..BBB....'];
const PARTS = {
  cape:   {behind:true, rows:['','','','','','','','','.CCCCCCCCCCCCCC.','.CCCCCCCCCCCCCC.','.CCCCCCCCCCCCCC.','.CCCCCCCCCCCCCC.','.CCCCCCCCCCCCCC.','.CCCCCCCCCCCCCC.','.CCCCCCCCCCCCCC.','..CCCCCCCCCCCC..','..CCCCCCCCCCCC..','..CCCCCCCCCCCC..','...C........C...','']},
  jetpack:{behind:false, rows:['','','','','','','','','','JJ............JJ','JJ............JJ','JJ............JJ','JJ............JJ','ff............ff','.f............f.','']},
  helmet: {rows:['....RRRRRRRR....','....RRRRRRRR....','....RRRRRRRR....','....RSSSSSSR....','....RYYRRYYR....','....RRRRRRRR....']},
  gloves: {rows:['','','','','','','','','','','','..GG........GG..','..GG........GG..','..GG........GG..']},
  boots:  {rows:['','','','','','','','','','','','','','','','','....KKKKKKKK....','....KKK..KKK....','....KKK..KKK....','....KKK..KKK....']},
  core:   {rows:['','','','','','','','','','......oOOo......','......oOOo......']},
  belt:   {rows:['','','','','','','','','','','','','','....YYYvvYYY....']},
  shield: {rows:['','','','','','','','','','','.AAA............','AAwAA...........','AwwwA...........','AAwAA...........','.AAA............']},
};
export const SUIT_ORDER = ['helmet','gloves','cape','boots','jetpack','shield','core','belt'];
export const SUIT_NAMES = {helmet:'히어로 헬멧', gloves:'파워 장갑', cape:'히어로 망토', boots:'점프 부츠', jetpack:'제트팩', shield:'블록 실드', core:'파워 코어', belt:'골드 벨트'};
export const HERO_COLORS = {red:'#e8384f', blue:'#2f7bff', green:'#22b05b', purple:'#8b5cf6', orange:'#ff8a1f', black:'#2a2f3d'};

export function hero(parts=[], color='red', size=120){
  const c = HERO_COLORS[color] || color;
  const pal = {H:'#3a2a1e', S:'#f3c9a0', W:'#ffffff', E:'#1b1e2b', M:'#c0605a', T:'#3d6fd8', P:'#2b3550', p:'#222a42', B:'#5a3d26',
    C:shade(c,0.75), R:c, Y:'#ffd84a', G:c, K:c, J:'#8d96a8', f:'#ffb02e', o:'#9ff8ff', O:'#ffffff', v:'#ff6b6b', A:'#2f7bff', w:'#ffffff'};
  if (parts.includes('core')) pal.T = shade(c, 0.55);
  let rects = '';
  const draw = rows => rows.forEach((row,y)=>[...row].forEach((ch,x)=>{ if (ch!=='.' && pal[ch]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${pal[ch]}"/>`; }));
  parts.filter(p=>PARTS[p]?.behind).forEach(p=>draw(PARTS[p].rows));
  draw(HERO_BASE);
  parts.filter(p=>PARTS[p] && !PARTS[p].behind).forEach(p=>draw(PARTS[p].rows));
  return `<svg class="hero-svg" viewBox="-1 -1 18 22" width="${size*0.8}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

// ---- small pixel icons (8x8) ----
const ICONS = {
  heart:['.RR.RR..','RRRRRRR.','RRRRRRR.','RRRRRRR.','.RRRRR..','..RRR...','...R....'],
  star: ['...Y....','...Y....','.YYYYY..','YYYYYYY.','..YYY...','.YY.YY..','.Y...Y..'],
  flame:['...O....','..OO....','..OYO...','.OYYO...','.OYYYO..','OYYWYO..','.OYYO...'],
  xp:   ['..GGG...','.GgggG..','GgWggG..','GggggG..','GggggG..','.GgggG..','..GGG...'],
  lock: ['..LLL...','.L...L..','.L...L..','LLLLLLL.','LLLkLLL.','LLLkLLL.','LLLLLLL.'],
  chest:['.BBBBBB.','BbbbbbbB','BbbYYbbB','BBBYYBBB','BbbbbbbB','BbbbbbbB','BBBBBBBB'],
};
const ICON_PAL = {R:'#ff4d6d',Y:'#ffd84a',O:'#ff7a1a',W:'#fff6d6',G:'#2fbf71',g:'#7ef0a9',L:'#9aa3b5',k:'#4a5263',B:'#6b4423',b:'#a8743f'};
export function icon(name, size=24){
  const rows = ICONS[name]; let r='';
  rows.forEach((row,y)=>[...row].forEach((ch,x)=>{ if (ch!=='.') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${ICON_PAL[ch]}"/>`; }));
  return `<svg viewBox="0 0 8 7" width="${size}" height="${size*7/8}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}

// ---- pixel clouds & ground for scenery ----
export function cloud(w=120){
  return `<svg viewBox="0 0 24 8" width="${w}" height="${w/3}" shape-rendering="crispEdges" aria-hidden="true"><path fill="#fff" d="M6 2h6v1h3v1h5v1h2v3H2V5h2V3h2z"/><path fill="#e3eefa" d="M2 7h20v1H2z"/></svg>`;
}
