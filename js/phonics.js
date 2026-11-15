// Phonics engine: segments words into graphemes + phonemes for blending & building.
import { GRAPHEME_SOUND, UNITS, LETTERS, PRAISE, ENCOURAGE, EN_LINES, KO, SAY, SHOW, CONFUSIONS, PHONEMES } from './data.js';

const VOWELS = 'aeiou';
const MULTI = ['igh','tch','ch','sh','th','ph','wh','ck','ng','nk','qu','ai','ay','ea','ee','ie','oa','ow','ue','ew',
  'oi','oy','ou','oo','au','aw','ar','or','er','ir','ur','ll','ss','ff','zz','pp','nn','dd','tt','gg','bb','mm'];
const OW_AU = new Set(['cow','owl','town','crown','brown','down','wow','how','now','clown','gown','growl']);
const OO_SHORT = new Set(['book','look','cook','foot','hook','wood','good','took','hood','wool']);
const TH_VOICED = new Set(['this','that','then','them','the','they','there','these','those','than']);
const OVERRIDE = {
  baby:'b|a:A|b|y:E', pony:'p|o:O|n|y:E', photo:'ph|o:O|t|o:O', cheese:'ch|ee|s:z|e:_', few:'f|ew:U',
  strong:'s|t|r|o|ng', long:'l|o|ng', moth:'m|o|th', wolf:'w|o|l|f',
};

export const baseWord = w => w.replace(/[0-9]+$/,'');
export const showWord = w => SHOW[w] || baseWord(w);
export const sayWord = w => SAY[w] || baseWord(w);

export function segment(word){
  const raw = showWord(word);
  const w = raw.toLowerCase();
  if (OVERRIDE[w]) return OVERRIDE[w].split('|').map(s=>{ const [g,p]=s.split(':'); return {g, p: p==='_'?null:(p||GRAPHEME_SOUND[g]), silent:p==='_'}; });
  // magic-e detection: V C e at end, vowel not part of a team
  let magicV = -1;
  const m = w.match(/([aeiou])([bcdfgklmnprstvz])e$/);
  if (m) { const vi = w.length-3; if (vi===0 || !VOWELS.includes(w[vi-1]) || (w[vi-1]==='u' && w[vi-2]==='q')) magicV = vi; }
  const segs = []; let i = 0;
  while (i < w.length){
    let tok = null;
    if (i===magicV) tok = w[i];
    else {
      for (const g of MULTI){
        if (w.startsWith(g,i)){
          if ((g==='wr'||g==='kn') && i!==0) continue;
          // don't grab a team that would steal a magic-e vowel / final e
          if (magicV>=0 && i+g.length>magicV && i<=magicV) continue;
          if (magicV>=0 && i+g.length>w.length-1) continue;
          tok = g; break;
        }
      }
      if (!tok && i===0 && (w.startsWith('wr')||w.startsWith('kn'))) tok = w.slice(0,2);
      if (!tok && w.startsWith('le',i) && i===w.length-2 && i>0 && !VOWELS.includes(w[i-1])) tok='le';
      if (!tok && w.startsWith('mb',i) && i===w.length-2) tok='mb';
      if (!tok && w.startsWith('ce',i) && i===w.length-2) tok='ce';
      if (!tok && w.startsWith('ge',i) && i===w.length-2 && magicV<0) tok='ge';
      if (!tok) tok = w[i];
    }
    segs.push({g: raw.substr(i,tok.length), t: tok, i}); i += tok.length;
  }
  const hasMagic = magicV>=0;
  return segs.map((s,k)=>{
    const t = s.t; let p = GRAPHEME_SOUND[t] ?? null; let silent=false, magic=false;
    if (hasMagic && s.i===magicV){ magic=true; p = GRAPHEME_SOUND[t+'_e'];
      if (t==='u'){ const prev=w[magicV-1]; p = 'lrjdnt'.includes(prev) ? 'oo' : 'U'; } }
    else if (hasMagic && s.i===w.length-1 && t==='e'){ silent=true; p=null; }
    else if (t==='e' && s.i===w.length-1 && w.length>2){ silent=true; p=null; }
    if (t==='y'){ p = s.i===0 ? 'y' : ([...w.slice(0,s.i)].some(c=>VOWELS.includes(c)) ? 'E' : 'I'); }
    if (t==='ow') p = OW_AU.has(w) ? 'ow' : 'O';
    if (t==='oo') p = OO_SHORT.has(w) ? 'uu' : 'oo';
    if (t==='th') p = TH_VOICED.has(w) ? 'dh' : 'th';
    if (t==='a' && w.startsWith('ll',s.i+1)) p='aw';
    if (t==='c' && 'eiy'.includes(w[s.i+1]||'')) p='s';
    if (t==='ce') p='s';
    if (t==='ge'||t==='dge') p='j';
    if (t==='g' && hasMagic && s.i===w.length-2) p='j';
    if (t==='s' && hasMagic && s.i===w.length-2) p='z';
    if (t==='x') p='ks';
    if (/^([^aeiou])\1$/.test(t)) p = GRAPHEME_SOUND[t[0]];
    return {g:s.g, p, silent, magic};
  });
}

export function tokenize(sentence){
  // returns [{text, word|null}] keeping punctuation attached for display
  return sentence.split(/\s+/).map(tok=>{
    const word = tok.toLowerCase().replace(/[\u2019']/g,'').replace(/[^a-z-]/g,'');
    return {text:tok, word: word||null};
  });
}

export const unitById = id => UNITS.find(u=>u.id===id);

export function unitWords(u){
  if (u.type==='letters') return u.focus.flatMap(l=>LETTERS[l].words);
  if (u.type==='sight') return u.sight.map(s=>s.toLowerCase()==='i'?'I':s);
  return u.words;
}

// Everything that needs a pre-generated audio file
export function collectAudio(){
  const words = new Set(), sentences = new Set();
  for (const u of UNITS){
    unitWords(u).forEach(w=>words.add(w));
    (u.pairs||[]).flat().forEach(w=>words.add(w));
    (u.sentences||[]).forEach(s=>{ sentences.add(s); tokenize(s).forEach(t=>t.word&&words.add(t.word)); });
  }
  for (const c of CONFUSIONS) c.words.flat().forEach(w=>words.add(w));
  const NAMES = {sam:'Sam',phil:'Phil',fred:'Fred',ted:'Ted',bob:'Bob',i:'I',june:'June'};
  const ws = {}; for (const w0 of words){ const w = baseWord(w0).toLowerCase(); ws[w] = NAMES[w] || sayWord(w); }
  return {
    w: ws,
    s: Object.fromEntries([...sentences].map(s=>[s,s])),
    p: Object.fromEntries(Object.keys(PHONEMES).map(k=>[k,k])),
    l: Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(c=>[c,c.toUpperCase()])),
    x: Object.fromEntries([...PRAISE,...ENCOURAGE,...EN_LINES].map(s=>[s,s])),
    ko: {...KO},
  };
}
