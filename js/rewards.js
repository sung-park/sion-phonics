// Reward progression that a block-game fan finds believable:
// surface (dirt/grass/logs/sand) -> stone & coal -> iron & copper -> gold, blue & red ores
// -> diamond / emerald / obsidian -> crafted treasure blocks. Higher tiers unlock with curriculum progress
// (the world of the unit), the best item of a tier only drops at boss missions or world clears.
import { WORLDS } from './data.js';

// per world (index = WORLDS order): common pool, boss pool, world-clear reward
export const TIERS = [
  {pool:['dirt','grass','wood','leaf','sand'],               boss:['pick_wood','sword_wood','plank','cobble','stone','cloud'],  clear:'coal',     pet:'pet_pup'},
  {pool:['cobble','stone','dirt','wood','plank','torch'],    boss:['pick_stone','sword_stone','coal','stone'],                  clear:'copper',   pet:'pet_bat'},
  {pool:['stone','cobble','coal','sand','ice','torch'],      boss:['coal','copper','bucket'],                                   clear:'iron',     pet:'pet_slime'},
  {pool:['coal','stone','copper','iron','mossy','torch'],            boss:['iron','pick_iron','sword_iron','compass'],                  clear:'gold',     pet:'pet_parrot'},
  {pool:['coal','iron','copper','prism','bucket'],           boss:['gold','sapphire','map','pick_gold'],                        clear:'sapphire', pet:'pet_otter'},
  {pool:['iron','copper','gold','sapphire','deep'],                 boss:['ruby','sword_gold','lantern','gold'],                       clear:'diamond',  pet:'pet_golem'},
  {pool:['iron','gold','ruby','hellrock','lava','glow'],     boss:['obsidian','diamond','pick_diamond','spyglass'],             clear:'emerald',  pet:'pet_fox'},
  {pool:['gold','ruby','sapphire','obsidian','endstone'],        boss:['diamond','emerald','goldblock','diamondblock','sword_diamond'], clear:'power', pet:'pet_dragon'},
];
// 학교 영어 discs, in the order they are earned (lesson 2, 4, ... 18)
export const DISC_ORDER = ['disc_meadow','disc_cave','disc_mine','disc_jungle','disc_ocean','disc_ancient','disc_lava','disc_end','disc_gold'];
export const worldIndex = uid => Math.max(0, WORLDS.findIndex(w=>w.units.includes(uid)));
const pickOne = (arr, rnd=Math.random) => arr[Math.floor(rnd()*arr.length)];

/** Returns {main, bonus}. meta: {kind:'unit'|'trainer', idx}; acc 0..1; worldClear: bool; wi: world index; inv: current inventory.
 *  Pacing: something every mission; half the time it prefers an item he does not have yet (collecting motivation);
 *  tools/gear/rare ores come from boss missions, pets only from world clears. */
export function pickReward({kind, idx}, acc, worldClear, wi, inv={}, rnd=Math.random){
  const t = TIERS[Math.min(TIERS.length-1, Math.max(0, wi))];
  const choose = list => { const fresh = list.filter(x=>!inv[x]); return pickOne(fresh.length && rnd() < 0.5 ? fresh : list, rnd); };
  if (worldClear) return {main:t.clear, bonus:t.pet};
  if (kind === 'trainer') return {main: acc >= 0.85 && rnd() < 0.3 ? choose(t.boss.slice(0,2)) : choose(t.pool)};
  if (idx === 2) return {main: acc >= 0.8 ? choose(t.boss) : choose(t.pool.slice(-3))};
  const pool = t.pool; const bias = acc >= 0.85 ? 0.2 : 0;
  if (rnd() < 0.4) return {main: choose(pool)};
  return {main: pool[Math.min(pool.length-1, Math.floor((rnd()*(1-bias) + bias) * pool.length))]};
}

/** Every item obtainable up to (and including) world wi. */
export function allowedUpTo(wi){
  const s = new Set();
  TIERS.slice(0, wi+1).forEach(t=>{ t.pool.forEach(x=>s.add(x)); t.boss.forEach(x=>s.add(x)); });
  TIERS.slice(0, wi).forEach(t=>{ s.add(t.clear); s.add(t.pet); });   // rewards of finished worlds
  DISC_ORDER.forEach(d=>s.add(d));                                  // 학교 영어 discs are never migrated away
  GRADE_ITEMS.forEach(d=>s.add(d));                                 // nor are 학년 트랙 items (they have their own progression)
  return s;
}

/** Rewards v2 migration: keep total block count, swap items that are beyond the child's progress
 *  for the best items of the tier he has actually reached (e.g. early gold ore -> stone-age finds).
 *  Never touches XP, units, mastery, sessions or settings. Returns a summary for logging. */
export function migrateInventory(st, wi, rarityOf){
  const allowed = allowedUpTo(wi); const out = {}; const moved = {};
  // replacement candidates: allowed items, best (rarest) first
  const t = TIERS[Math.min(TIERS.length-1, wi)];
  const repl = [...new Set([...t.boss, ...TIERS.slice(0, wi).map(x=>x.clear)])].sort((a,b)=>(rarityOf(b)-rarityOf(a))); let k = 0;
  for (const [item, n] of Object.entries(st.inv || {})){
    if (!n) continue;
    if (allowed.has(item)) { out[item] = (out[item]||0) + n; continue; }
    for (let j=0;j<n;j++){ const r = repl[(k++) % Math.min(3, repl.length)]; out[r] = (out[r]||0)+1; }
    moved[item] = n;
  }
  st.inv = out; return moved;
}

/** first world where an item can drop (for ordering the collection book along the journey) */
export function firstWorld(id){
  const gi = Object.values(GRADE_TIERS).findIndex(t=>[...t.pool, ...t.mile, t.clear, t.pet].includes(id)); if (gi >= 0) return 20 + gi;
  const gm = GEM_IDS.indexOf(id); if (gm >= 0) return 30 + gm;
  const i = TIERS.findIndex(t=>t.pool.includes(id) || t.boss.includes(id));
  const c = TIERS.findIndex(t=>t.clear===id || t.pet===id);
  const a = i<0 ? 99 : i, b = c<0 ? 99 : c + 0.5; return Math.min(a, b);
}

// ---------------- 학교 영어 학년 트랙 (v1.4) ----------------
// Each grade has its own biome. Lessons drop that biome's blocks; every 5th lesson (first clear) is a milestone with
// a gear item; finishing every lesson of the grade gives the grade badge + the grade's pet. Rarity climbs with the grade,
// so a 3rd-grade lesson never drops gold/diamond-tier items.
import { GEMS } from './items.js';
export const GRADE_TIERS = {
  3:{name:'벚꽃 숲', pool:['cherry_leaf','cherry_log','grass','leaf','wood'], mile:['notebook','cherry_plank','quill','cherry_plank'], clear:'badge_g3', pet:'pet_bee'},
  4:{name:'사막 마을', pool:['sandstone','cactus','sand','cherry_plank'], mile:['hourglass','terracotta','bell','terracotta'], clear:'badge_g4', pet:'pet_camel'},
  5:{name:'눈 덮인 산', pool:['packed_ice','spruce','cloud','ice'], mile:['sled','blue_ice','snowglobe','blue_ice'], clear:'badge_g5', pet:'pet_penguin'},
  6:{name:'하늘 섬', pool:['skystone','amethyst','packed_ice','blue_ice'], mile:['glider','starblock','starmap','starblock'], clear:'badge_g6', pet:'pet_skywhale'},
};
export const GRADE_ITEMS = [...new Set(Object.values(GRADE_TIERS).flatMap(t=>[...t.pool, ...t.mile, t.clear, t.pet]))];
export const GEM_IDS = GEMS.map(g=>g[0]);
/** reward for a 학교 영어 lesson. li = index of the lesson inside its grade; first = first clear; gradeDone = this clear finished the grade */
export function pickTalkReward(g, li, acc, first, gradeDone, inv={}, rnd=Math.random){
  const t = GRADE_TIERS[g] || GRADE_TIERS[3];
  const choose = list => { const fresh = list.filter(x=>!inv[x]); return pickOne(fresh.length && rnd() < 0.6 ? fresh : list, rnd); };
  if (gradeDone) return {main:t.clear, bonus:t.pet};
  if (first && li % 5 === 4) return {main: t.mile[Math.floor(li/5) % t.mile.length]};
  return {main: choose(acc >= 0.85 ? t.pool.slice(0, 3) : t.pool)};
}
/** a graded reader's first read: one block from that grade's biome */
export const readerReward = (g, inv={}, rnd=Math.random) => { const t = GRADE_TIERS[g] || GRADE_TIERS[3]; const fresh = t.pool.filter(x=>!inv[x]); return pickOne(fresh.length ? fresh : t.pool, rnd); };
/** word-dex gems newly earned at this dex size */
export const gemsFor = (n, inv={}) => GEMS.filter(([id,,need])=>n >= need && !inv[id]).map(g=>g[0]);
