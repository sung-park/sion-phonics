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
  {id:'disc', name:'말하기 디스크', emoji:'💿'}, {id:'badge', name:'학년 배지', emoji:'🏅'}, {id:'gem', name:'단어 보석', emoji:'💎'},
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
// 학교 영어 track: one speaking disc for every 2nd lesson cleared (t02, t04, ... t18), rarer as lessons go on
const DISC = ['.....kkkk.....','...kkkkkkkk...','..kkkkkkkkkk..','.kkkkkkkkkkkk.','.kkkkLLLLkkkk.','kkkkLLLLLLkkkk','kkkkLLwwLLkkkk',
  'kkkkLLwwLLkkkk','kkkkLLLLLLkkkk','.kkkkLLLLkkkk.','.kkkkkkkkkkkk.','..kkkkkkkkkk..','...kkkkkkkk...','.....kkkk.....'];
export const DISCS = [['disc_meadow','초원 디스크','#5fd35f',2],['disc_cave','동굴 디스크','#9aa3b2',2],['disc_mine','광산 디스크','#c8803c',3],
  ['disc_jungle','정글 디스크','#2fbf71',3],['disc_ocean','바다 디스크','#2f9bff',3],['disc_ancient','고대 디스크','#1fc7c7',4],
  ['disc_lava','용암 디스크','#ff5a1f',4],['disc_end','차원 디스크','#a855f7',5],['disc_gold','황금 디스크','#ffd84a',5]];
DISCS.forEach(([id,name,col,rar])=>{ ITEMS[id] = {name, cat:'disc', rarity:rar, rows:DISC, pal:{...P, k:'#22252f', L:col}}; });
// ---- v1.4 학교 영어 학년 트랙: grade gear (milestones), grade badges, grade pets, word-dex gems ----
Object.assign(ART, {
  notebook: ['.bbbbbbbb.','.bwwwwwwb.','kbwkkkkwb.','.bwwwwwwb.','kbwkkkwwb.','.bwwwwwwb.','kbwkkkkwb.','.bwwwwwwb.','.bbbbbbbb.'],
  quill:    ['........pw','.......pwp','......pwp.','.....pwp..','....pwp...','...pwp....','..pw......','.k........','k.........'],
  hourglass:['NNNNNNNN','.n....n.','..nyyn..','...yy...','...yy...','..n..n..','.nyyyyn.','NNNNNNNN'],
  bell:     ['....yy....','...yYYy...','..yYYYYy..','..yYYYYy..','.yYYYYYYy.','yyyyyyyyyy','....kk....'],
  sled:     ['h.........','hh......h.','.hhhhhhhh.','.HhHhHhH..','..........','S........S','.SSSSSSSS.'],
  snowglobe:['...cccc...','..cwccwc..','.cccwcccc.','.ccwccwcc.','.cccccccc.','..cccccc..','..hhhhhh..','.HHHHHHHH.'],
  glider:   ['G........G','sG......Gs','ssG....Gss','sssGkkGsss','ssssGGssss','.sss..sss.','..s....s..'],
  starmap:  ['BBBBBBBBBB','BbbbbYbbbB','BbYbbbbbbB','BbbbbbbYbB','BbbYbbbbbB','BbbbbbYbbB','BYbbbbbbbB','BBBBBBBBBB'],
  pet_bee:  ['...ww.ww..','...wwwww..','.kkyykkyy.','kwkyykkyyk','kkkyykkyyk','.kkyykkyy.','...k..k...'],
  pet_camel:['......NN..','.....NkN..','.....NNN..','..NN.NN...','.NNNNNN...','NNNNNNN...','.NNNNNN...','.N.N.N.N..','.N.N.N.N..'],
  pet_penguin:['..kkkk..','.kkkkkk.','.kwkkwk.','.kkookk.','kkwwwwkk','kkwwwwkk','.kwwwwk.','..o..o..'],
  pet_skywhale:['..........','.bbbbbbb..','bbbbbbbbbb.','bwkbbbbbbbb','bbbbbbbbbbbb','.cccccccbbb.','..cccccc..b.','.........bb'],
});
Object.assign(ITEMS, {
  notebook:{name:'단어 노트', cat:'gear', rarity:2}, quill:{name:'깃털 펜', cat:'gear', rarity:3},
  hourglass:{name:'모래시계', cat:'gear', rarity:3}, bell:{name:'사막 종', cat:'gear', rarity:3},
  sled:{name:'눈썰매', cat:'gear', rarity:3}, snowglobe:{name:'스노볼', cat:'gear', rarity:4},
  glider:{name:'글라이더 날개', cat:'gear', rarity:4}, starmap:{name:'별자리 지도', cat:'gear', rarity:4},
  pet_bee:{name:'벚꽃 꿀벌', cat:'pet', rarity:5}, pet_camel:{name:'아기 낙타', cat:'pet', rarity:5},
  pet_penguin:{name:'눈꽃 펭귄', cat:'pet', rarity:5}, pet_skywhale:{name:'하늘 고래', cat:'pet', rarity:5},
});
const BADGE = ['.MMMMMMMM.','MLLLLLLLLM','MLLLwwLLLM','MLLwwwwLLM','MLwwwwwwLM','MLLwwwwLLM','MLLwLLwLLM','.MLLLLLLM.','..MLLLLM..','...MLLM...','....MM....'];
export const BADGES = [['badge_g3','3학년 배지 (동)','#e0965a','#9a5a2a',3],['badge_g4','4학년 배지 (은)','#dfe4ec','#8d96a6',4],
  ['badge_g5','5학년 배지 (금)','#ffd84a','#c99a12',4],['badge_g6','6학년 배지 (다이아)','#7ff3ee','#2fb7b8',5]];
BADGES.forEach(([id,name,L,M,rar])=>{ ITEMS[id] = {name, cat:'badge', rarity:rar, rows:BADGE, pal:{...P, L, M}}; });
const GEM = ['..MMMMMM..','.MLwLLLLM.','MLwLLLLLLM','MMMMMMMMMM','.MLLLLLLM.','..MLLLLM..','...MLLM...','....MM....'];
// word-dex milestones: [id, name, words needed, light, dark, rarity]
export const GEMS = [['gem_25','초록 단어석',25,'#5fe08a','#1f9a4f',2],['gem_75','파랑 단어석',75,'#6fb2ff','#2a62d9',3],['gem_150','보라 단어석',150,'#c49bff','#7a43cc',3],
  ['gem_250','빨강 단어석',250,'#ff7a8a','#d02a42',4],['gem_375','황금 단어석',375,'#ffe066','#d9a21c',4],['gem_500','무지개 단어석',500,'#ffffff','#ff5fd2',5]];
GEMS.forEach(([id,name,,L,M,rar])=>{ ITEMS[id] = {name, cat:'gem', rarity:rar, rows:GEM, pal:{...P, L, M}}; });
for (const [k,it] of Object.entries(ITEMS)) if (ART[k]) { it.rows = ART[k]; it.pal = P; }
ITEMS.pet_otter.pal = {...P, s:'#a8764a'};
ITEMS.pet_skywhale.pal = {...P, b:'#7fb8ff', c:'#e8f4ff'};
ITEMS.starmap.pal = {...P, B:'#1d2a52', b:'#2c3a70'};                       // brown sea otter
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
