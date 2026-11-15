// Collectible catalog: blocks & ores (voxel cubes), tools, gear and pet companions (original pixel art).
import { BLOCKS, block } from './sprites.js';

const P = { h:'#7a5531', H:'#5a3d22', k:'#1b1e2b', w:'#ffffff', o:'#ff7a1a', y:'#ffd84a', Y:'#fff3a8', r:'#e8384f', g:'#3c4250', G:'#6b7280',
  s:'#c9ced6', S:'#9aa3b2', b:'#2f7bff', B:'#1d4fb8', p:'#ff8fa3', l:'#8be36b', L:'#4caf50', c:'#9ff8ff', n:'#e8d6b0', N:'#c7ad7f' };
const MAT = { wood:['#b08550','#7d5a33'], stone:['#9a9ea4','#6c7076'], iron:['#e6e8ec','#b3b8c2'], gold:['#ffd84a','#d9a21c'], diamond:['#7ff3ee','#2fb7b8'] };

const PICK = ['..MMMMMM....','.MLLLLLLMM..','..MMMMMhLM..','......h.MLM.','.....h...MLM','....h.....ML','...h......ML','..h.......M.','.h..........','h...........'];
const SWORD = ['..........ML','.........MLM','........MLM.','.......MLM..','......MLM...','.gg..MLM....','..ggMLM.....','...ggM......','..hggg......','.hh..gg.....','hh..........'];
const ART = {
  torch:   ['....yy....','...yoy....','...yooy...','....oo....','....hh....','....hh....','....hh....','....hh....','....hh....','....HH....'],
  bucket:  ['..SSSSSS..','.S......S.','.SsssssSS.','.SccccccS.','.SccccccS.','..SccccS..','..SssssS..','...SSSS...'],
  compass: ['...SSSS...','..SwwwwS..','.SwwrwwwS.','.SwwrrwwS.','.SwwkwwwS.','.SwwbwwwS.','..SwwwwS..','...SSSS...'],
  map:     ['NNNNNNNNNN','NnnnnnnnnN','NnlllnbbnN','NnlLlnbbnN','NnllnnnbnN','NnnnrnnnnN','NnnnnnllnN','NNNNNNNNNN'],
  lantern: ['....GG....','...G..G...','..GGGGGG..','..GyYYyG..','..GyYYyG..','..GyyyyG..','..GGGGGG..'],
  spyglass:['........SS','.......SyS','......SyS.','.....hyS..','....hh....','...hh.....','..hh......','.HH.......'],
  pet_pup:   ['.HH....HH.','.HhhhhhhH.','..hhhhhh..','.hhwhhwhh.','.hhkhhkhh.','.hhhnnhhh.','..hhkkhh..','...hpph...','..hhhhhh..','..hh..hh..'],
  pet_bat:   ['k........k','kk..kk..kk','kkkkkkkkkk','.kkkwwkkk.','..kkkkkk..','..kpkkpk..','...kkkk...','....kk....'],
  pet_slime: ['.LLLLLLLL.','LllllllllL','LlkkllkklL','LlkwllkwlL','LllllllllL','LlllkkllLL','LllllllllL','.LLLLLLLL.'],
  pet_golem: ['..SSSSSS..','.SSSSSSSS.','.SkcSSckS.','.SSSGGSSS.','SSSSSSSSSS','SS.SSSS.SS','SS.SllS.SS','...SSSS...','...S..S...','..SS..SS..'],
  pet_otter: ['..........','.ss....ss.','.ssssssss.','sswsssswss','ssbkssbkss','sssspsssss','.ssskksss.','..ssssss..','..s.ss.s..'],
  pet_parrot:['...rrr....','..rrrrr...','..rwkry...','..rrrryy..','.rrrrr....','.rrbbr....','..rbbbr...','..rbbb....','...yy.....'],
  pet_fox:   ['o........o','oo......oo','oooooooooo','oowkoowkoo','oooooooooo','.owwkkwwo.','..wwwwww..','...wwww...'],
  pet_dragon:['.B......B.','.BB....BB.','.bbbbbbbb.','bbybbbbybb','bbkbbbbkbb','bbbbbbbbbb','.bbwwwwbb.','B.bbbbbb.B','BB.bbbb.BB','...b..b...'],
};
function pix(rows, pal, size){
  const h = rows.length, w = Math.max(...rows.map(r=>r.length)); let r = '';
  rows.forEach((row,y)=>[...row].forEach((ch,x)=>{ const c = pal[ch]; if (ch!=='.' && c) r += `<rect x="${x}" y="${y}" width="1.03" height="1.03" fill="${c}"/>`; }));
  const s = Math.max(w,h);
  return `<svg class="pix" viewBox="${(w-s)/2-1} ${(h-s)/2-1} ${s+2} ${s+2}" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}
const tool = (shape, mat) => ({...P, M:MAT[mat][1], L:MAT[mat][0], g:'#3c4250'});

export const CATS = [
  {id:'block', name:'블록 · 광석', emoji:'🧱'}, {id:'tool', name:'도구', emoji:'⛏️'}, {id:'gear', name:'모험 장비', emoji:'🎒'}, {id:'pet', name:'펫 친구', emoji:'🐾'},
];
export const ITEMS = {};
for (const [k,b] of Object.entries(BLOCKS)) ITEMS[k] = {name:b.name, cat:'block', rarity:b.rarity};
const MATN = {wood:'나무', stone:'돌', iron:'철', gold:'금', diamond:'다이아몬드'}; const MATR = {wood:1, stone:2, iron:3, gold:3, diamond:5};
for (const m of Object.keys(MAT)){
  ITEMS['pick_'+m] = {name:`${MATN[m]} 곡괭이`, cat:'tool', rarity:MATR[m], rows:PICK, pal:tool(PICK,m)};
  ITEMS['sword_'+m] = {name:`${MATN[m]} 검`, cat:'tool', rarity:MATR[m], rows:SWORD, pal:tool(SWORD,m)};
}
Object.assign(ITEMS, {
  torch:{name:'횃불', cat:'gear', rarity:1}, bucket:{name:'양동이', cat:'gear', rarity:2}, compass:{name:'나침반', cat:'gear', rarity:3},
  map:{name:'보물 지도', cat:'gear', rarity:3}, lantern:{name:'랜턴', cat:'gear', rarity:3}, spyglass:{name:'망원경', cat:'gear', rarity:4},
  pet_pup:{name:'블록 강아지', cat:'pet', rarity:5}, pet_bat:{name:'동굴 박쥐', cat:'pet', rarity:5}, pet_slime:{name:'말랑 슬라임', cat:'pet', rarity:5},
  pet_parrot:{name:'정글 앵무새', cat:'pet', rarity:5}, pet_otter:{name:'바다 수달', cat:'pet', rarity:5}, pet_golem:{name:'고대 골렘', cat:'pet', rarity:5},
  pet_fox:{name:'불꽃 여우', cat:'pet', rarity:5}, pet_dragon:{name:'차원 아기 드래곤', cat:'pet', rarity:5},
});
for (const [k,it] of Object.entries(ITEMS)) if (ART[k]) { it.rows = ART[k]; it.pal = P; }
ITEMS.pet_otter.pal = {...P, s:'#a8764a'};                       // brown sea otter
ITEMS.pet_dragon.pal = {...P, b:'#9b5cf6', B:'#5b2bb5', y:'#e9d5ff'}; // purple end-dragon
ITEMS.pet_golem.pal = {...P, S:'#4a4f5c', s:'#6b7280', c:'#5ef2ff', l:'#5ef2ff'}; // dark ancient guardian

export function itemArt(id, size=64){
  const it = ITEMS[id]; if (!it) return block('grass',{size});
  if (it.cat==='block') return block(id, {size});
  return `<span class="pixart" style="width:${size}px;height:${size}px">${pix(it.rows, it.pal, size)}</span>`;
}
export const itemName = id => ITEMS[id]?.name || id;
export const TOTAL = Object.keys(ITEMS).length;
export const ownedCount = inv => Object.keys(ITEMS).filter(k=>(inv[k]||0)>0).length;

// treasure chest with a separate lid (for the open animation)
export function chestArt(size=150){
  const lid = ['.BBBBBBBBBBBB.','BbbbbbbbbbbbbB','BbbbbbbbbbbbbB','BBBBBBBBBBBBBB'];
  const body= ['BbbbbbYYbbbbbB','BbbbbbYkbbbbbB','BbbbbbYYbbbbbB','BbbbbbbbbbbbbB','BbbbbbbbbbbbbB','BBBBBBBBBBBBBB'];
  const pal = {B:'#5a3a1d', b:'#a8743f', Y:'#ffd84a', k:'#3a2a12'};
  const g = (rows, oy) => rows.map((row,y)=>[...row].map((ch,x)=> ch==='.'?'':`<rect x="${x}" y="${y+oy}" width="1.03" height="1.03" fill="${pal[ch]}"/>`).join('')).join('');
  return `<svg class="chest-svg" viewBox="-1 -3 16 14" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">
    <g class="lid">${g(lid,0)}<rect x="1" y="1" width="12" height=".5" fill="#c99257"/></g><g class="body">${g(body,4)}</g></svg>`;
}
