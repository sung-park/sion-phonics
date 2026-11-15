// Checks that every word of every story is decodable at the story's unlock point
// (only graphemes/patterns taught up to that unit), or a taught picture/unit word, or an allowed sight word / name.
// Usage: node tools/validate_stories.mjs   (exit code 1 on failure)
import { UNITS, LETTERS } from '../js/data.js';
import { segment, unitWords } from '../js/phonics.js';
import { STORIES, STORY_SIGHT, STORY_NAMES } from '../js/stories.js';

const idx = id => UNITS.findIndex(u=>u.id===id);
const LETTER_UNIT = {}; for (const u of UNITS) if (u.type==='letters') u.focus.forEach(l=>LETTER_UNIT[l]=u.id);
const SHORT = {a:'b1u9', o:'b1u10', e:'b1u11', i:'b1u12', u:'b1u13'};
const MAGIC = {a:'b2u1', i:'b2u2', o:'b2u3', u:'b2u4'};
const TEAM = {ai:'b2u8', ay:'b2u8', ea:'b2u9', ee:'b2u9', ie:'b2u10', igh:'b2u10', oa:'b2u12', ue:'b2u13', ew:'b2u13',
  ch:'b3u1', sh:'b3u1', tch:'b3u1', ph:'b3u2', wh:'b3u2', qu:'b3u3', ck:'b3u3', th:'b3u4', ng:'b3u5', nk:'b3u5',
  oi:'b3u6', oy:'b3u6', ou:'b3u7', oo:'b3u8', au:'b3u9', aw:'b3u9', ar:'b3u10', or:'b3u10', er:'b3u11', ir:'b3u11', ur:'b3u11', wr:'b3u12', kn:'b3u12'};
const BLEND_UNIT = 'b2u5';
const CONS = new Set('bcdfghjklmnpqrstvwxyz'.split(''));

/** unit id at which this grapheme segment becomes decodable, or null if never taught */
function segUnit(s, w, k, segs){
  const g = s.g.toLowerCase();
  if (s.silent) { const m = segs.find(x=>x.magic); return m ? (MAGIC[m.g.toLowerCase()] || null) : null; }
  if (s.magic) return MAGIC[g] || null;
  if (g==='y') return s.p==='y' ? LETTER_UNIT.y : 'b2u11';
  if (g==='ow') return s.p==='ow' ? 'b3u7' : 'b2u12';
  if (g==='a' && s.p==='aw') return 'b3u9';
  if (TEAM[g]) return TEAM[g];
  if (g.length===1 && 'aeiou'.includes(g)) return SHORT[g];
  if (g.length===1 && CONS.has(g)) { if (g==='c' && s.p==='s') return null; if (g==='g' && s.p==='j') return null; return LETTER_UNIT[g]; }
  if (/^([a-z])\1$/.test(g)) return LETTER_UNIT[g[0]];
  return null; // le, mb, ce, ge, dge ... not taught as patterns
}
function decodableAt(word, ui){
  const segs = segment(word); let need = 0;
  for (let k=0;k<segs.length;k++){
    const u = segUnit(segs[k], word, k, segs); if (!u) return {ok:false, why:`'${segs[k].g}' not a taught pattern`};
    need = Math.max(need, idx(u));
    const a = segs[k].g.toLowerCase(), b = segs[k+1]?.g.toLowerCase();
    if (b && a.length===1 && b.length===1 && CONS.has(a) && CONS.has(b) && a!=='x') need = Math.max(need, idx(BLEND_UNIT));
  }
  return need <= ui ? {ok:true} : {ok:false, why:`needs ${UNITS[need].id} (${UNITS[need].title})`};
}
function taughtWords(ui){
  const s = new Set();
  for (const u of UNITS.slice(0, ui+1)){
    unitWords(u).forEach(w=>s.add(w.toLowerCase().replace(/[0-9]+$/,'').replace(/-/g,'')));
    (u.pairs||[]).flat().forEach(w=>s.add(w));
    if (u.type==='sight') u.sight.forEach(w=>s.add(w.toLowerCase()));
  }
  Object.values(LETTERS).forEach(l=>l.words.forEach(w=>s.add(w.replace(/-/g,''))));
  return s;
}
export const norm = tok => tok.toLowerCase().replace(/[\u2019']/g,'').replace(/[^a-z]/g,'');
export function checkStory(st){
  const ui = idx(st.unlock); if (ui<0) return [{word:'-', why:'bad unlock '+st.unlock}];
  const taught = taughtWords(ui); const bad = [];
  const sight = new Set(STORY_SIGHT); const names = new Set(STORY_NAMES);
  const sightOk = idx('b1u9') <= ui || st.world==='w1';
  for (const p of st.pages) for (const tok of p.t.split(/\s+/)){
    const w = norm(tok); if (!w) continue;
    if (names.has(w) || taught.has(w) || (sightOk && sight.has(w))) continue;
    let r = decodableAt(w, ui);
    if (!r.ok && /s$/.test(w) && w.length>2){ const stem = w.slice(0,-1); if (taught.has(stem) || decodableAt(stem, ui).ok) r = {ok:true}; } // plural / 3rd-person -s
    if (!r.ok) bad.push({word:w, why:r.why});
  }
  return bad;
}
if (import.meta.url === `file://${process.argv[1]}`){
  let fail = 0;
  for (const st of STORIES){
    const bad = checkStory(st); const n = st.pages.reduce((a,p)=>a+p.t.split(/\s+/).length,0);
    console.log(`${bad.length?'✗':'✓'} ${st.id.padEnd(11)} unlock ${st.unlock.padEnd(6)} ${st.pages.length} pages ${String(n).padStart(3)} words  ${st.title}`);
    bad.forEach(b=>console.log(`     - ${b.word}: ${b.why}`)); if (bad.length) fail++;
  }
  console.log(fail ? `\n${fail} stories have non-decodable words` : `\nAll ${STORIES.length} stories decodable ✔`);
  process.exit(fail?1:0);
}
