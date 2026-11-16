// Mission builder: turns a unit + mission index into a short list of activity steps.
import { UNITS, LETTERS, PIC, CONFUSIONS, GRAPHEME_SOUND } from './data.js';
import { segment, tokenize, unitWords, baseWord } from './phonics.js';
import * as store from './store.js';

export const MISSION_NAMES = ['배우기','연습하기','보스 도전'];
export const MISSION_DESC = ['새 소리를 만나요','블록으로 단어를 만들어요','문장 읽기 + 복습 보스'];
const shuffle = a => { a=[...a]; for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const pick = (a,n) => shuffle(a).slice(0,n);
const uniq = a => [...new Set(a)];
export const hasPic = w => !!PIC[w] || !!PIC[baseWord(w)];
export const picOf = w => PIC[w] || PIC[baseWord(w)];

export const CONFUSABLE = { b:['d','p','q'], d:['b','q','p'], p:['q','b','d'], q:['p','g','d'], m:['n','w'], n:['m','u','h'], u:['n','v'],
  w:['m','v'], i:['l','j'], l:['i','t'], j:['i','g'], h:['n','b'], f:['t'], t:['f','l'], g:['q','j'], a:['o','e','u'], e:['a','i'],
  o:['a','u'], c:['e','o'], s:['z','c'], z:['s'], v:['w','u'], x:['k'], k:['x','h'], y:['v','j'], r:['n'] };

// ordered list of [grapheme, sound] taught up to each unit
const ORDER = []; const UNIT_INDEX = {};
UNITS.forEach((u,i)=>{ UNIT_INDEX[u.id]=i; });
export const unitIndex = id => UNIT_INDEX[id];
function taughtBefore(uid, inclusive=true){
  const idx = UNIT_INDEX[uid]; const out = [];
  for (let i=0;i<=idx;i++){ const u = UNITS[i]; if (!inclusive && i===idx) break;
    if (u.type==='sight') continue; for (const g of u.focus) out.push(g); }
  return uniq(out);
}
const soundOf = g => ({y:'y', all:'aw'}[g] ?? GRAPHEME_SOUND[g] ?? g);
export function focusKeyword(u, g){
  if (u.type==='letters') return LETTERS[g].key;
  const ws = u.words.filter(w=>{ const s = segment(w); return s.some(x=>x.g.toLowerCase()===g || (g.includes('_') && x.magic && x.g===g[0]) || (g==='all' && x.p==='aw')); });
  return ws.find(hasPic) || ws[0] || u.words[0];
}
function intros(u){
  if (u.type==='letters') return u.focus.map(l=>({type:'intro', kind:'letter', g:l, sound:l, key:LETTERS[l].key, item:'g:'+l}));
  if (u.ySounds) return [{type:'intro', kind:'grapheme', g:'y', sound:'I', key:'fly', item:'g:y', note:'짧은 단어 끝 y는 /aɪ/'},
                         {type:'intro', kind:'grapheme', g:'y', sound:'E', key:'baby', item:'g:y2', note:'긴 단어 끝 y는 /iː/'}];
  if (u.thSounds) return [{type:'intro', kind:'grapheme', g:'th', sound:'th', key:'thumb', item:'g:th', note:'바람 소리 th'},
                          {type:'intro', kind:'grapheme', g:'th', sound:'dh', key:'this', item:'g:th2', note:'떨리는 소리 th'}];
  if (u.ooSounds) return [{type:'intro', kind:'grapheme', g:'oo', sound:'oo', key:'moon', item:'g:oo', note:'긴 oo'},
                          {type:'intro', kind:'grapheme', g:'oo', sound:'uu', key:'book', item:'g:oo2', note:'짧은 oo'}];
  if (u.type==='short') return [{type:'intro', kind:'letter', g:u.focus[0], sound:u.focus[0], key:LETTERS[u.focus[0]].key, item:'g:'+u.focus[0], families:u.families}];
  return u.focus.map(g=>({type:'intro', kind: u.type==='blend' ? 'blend' : 'grapheme', g: g==='all'?'a':g, label: g==='all'?'a(ll)':null,
    sound: u.type==='blend' ? null : (u.owSound && g==='ow' ? 'ow' : soundOf(g)), key:focusKeyword(u,g), item:'g:'+g}));
}
function soundPick(u, g, n=3){
  const tgt = soundOf(g);
  let pool = (u.type==='letters' ? [...u.focus, ...(CONFUSABLE[g]||[]), ...taughtBefore(u.id)] : taughtBefore(u.id).filter(x=>!x.includes('_') || true))
    .filter(x=>x!==g && soundOf(x)!==tgt && !['all'].includes(x));
  if (u.type!=='letters') pool = pool.filter(x=>x.length>1 || 'aeiou'.includes(x));
  const conf = (CONFUSABLE[g]||[]).filter(x=>pool.includes(x));
  const opts = uniq([g, ...pick(conf,1), ...pick(pool, n)]).slice(0,n);
  return {type:'pick_sound', target:g, sound:tgt, options:shuffle(opts), item:'g:'+g};
}
function wordPick(u, w, n=3){
  const pool = uniq([...unitWords(u), ...prevWords(u)]).filter(x=>baseWord(x)!==baseWord(w));
  const score = x => { const a=baseWord(w), b=baseWord(x); let s = Math.abs(a.length-b.length)*2; for (let i=0;i<Math.max(a.length,b.length);i++) if (a[i]!==b[i]) s++; return s; };
  const close = pool.sort((a,b)=>score(a)-score(b)).slice(0,6);
  return {type:'pick_word', word:w, options:shuffle([w, ...pick(close,n-1)]), item:(u.type==='sight'?'s:':'w:')+baseWord(w)};
}
function prevWords(u){ const i = UNIT_INDEX[u.id]; const p = UNITS[i-1]; return p ? unitWords(p) : []; }
function picMatch(u, w, n=3){
  const pool = uniq([...unitWords(u), ...prevWords(u), ...Object.keys(PIC)]).filter(x=>hasPic(x) && baseWord(x)!==baseWord(w) && picOf(x)!==picOf(w));
  const near = unitWords(u).filter(x=>hasPic(x) && baseWord(x)!==baseWord(w) && picOf(x)!==picOf(w));
  const opts = uniq([w, ...pick(near, n-2), ...pick(pool, n)]).filter((x,i,a)=>a.findIndex(y=>picOf(y)===picOf(x))===i).slice(0,n);
  return {type:'pic_match', word:w, options:shuffle(opts), item:'w:'+baseWord(w)};
}
function build(u, w, extra=1){
  const segs = u.type==='sight' ? [...baseWord(w)].map(c=>({g:c})) : segment(w);
  const tiles = segs.map(s=>s.g);
  const distract = [];
  const cands = tiles.flatMap(t=>CONFUSABLE[t.toLowerCase()]||[]).filter(x=>!tiles.includes(x));
  const vowels = ['a','e','i','o','u'].filter(x=>!tiles.includes(x));
  for (let k=0;k<extra;k++){ const c = cands.length ? cands.splice(Math.floor(Math.random()*cands.length),1)[0] : vowels[k%vowels.length]; distract.push(c); }
  return {type:'build', word:w, segs:tiles, tiles:shuffle([...tiles, ...distract]), item:(u.type==='sight'?'s:':'w:')+baseWord(w)};
}
function sentenceStep(u, s){
  const toks = tokenize(s).filter(t=>t.word && t.word.length>1);
  const focusWords = toks.filter(t=>unitWords(u).map(x=>baseWord(x).toLowerCase()).includes(t.word));
  const find = (focusWords.length ? pick(focusWords,1)[0] : pick(toks,1)[0])?.word;
  return {type:'sentence', text:s, find, item:'t:'+s};
}

function review(u, n){
  const due = store.dueItems(u.id, n+2); const out = [];
  for (const it of due){
    if (out.length>=n) break;
    const [kind, val] = [it.key.slice(0,1), it.key.slice(2)];
    const ru = UNITS.find(x=>x.id===it.unit) || u;
    try {
      if (kind==='g' && !val.endsWith('2')) out.push({...soundPick(ru, val), review:true});
      else if (kind==='w') out.push({...(hasPic(val) ? picMatch(ru,val) : wordPick(ru,val)), review:true});
      else if (kind==='s') out.push({...wordPick(ru,val), review:true});
      else if (kind==='l') out.push({...caseMatch(val), review:true});
    } catch(e){}
  }
  return out;
}
function caseMatch(l){ const opts = uniq([l, ...(CONFUSABLE[l]||[]).slice(0,2), ...pick('abcdefghijklmnopqrstuvwxyz'.split('').filter(x=>x!==l),2)]).slice(0,3);
  return {type:'case_match', target:l, options:shuffle(opts), item:'l:'+l}; }

export function buildMission(unitId, idx){
  const u = UNITS.find(x=>x.id===unitId); const short = store.state().settings.len==='short';
  let steps = [];
  const W = unitWords(u); const picW = W.filter(hasPic);
  const rev = idx===0 ? 0 : (idx===1 ? 1 : 2);
  if (u.type==='letters'){
    if (idx===0) u.focus.forEach(l=>{ steps.push(intros(u).find(s=>s.g===l)); steps.push(soundPick(u,l,2)); });
    if (idx===1){
      const fw = shuffle(u.focus.flatMap(l=>LETTERS[l].words.slice(1).map(w=>[l,w]))).slice(0,3);
      fw.forEach(([l,w])=>steps.push({type:'first_sound', word:w, target:l, options:shuffle(uniq([l, ...pick(u.focus.filter(x=>x!==l),1), ...pick(CONFUSABLE[l]||['a','o'],1)])).slice(0,3), item:'g:'+l}));
      pick(u.focus,2).forEach(l=>steps.push(caseMatch(l)));
      pick(u.focus,2).forEach(l=>steps.push(soundPick(u,l,3)));
    }
    if (idx===2){
      const conf = u.focus.find(l=>CONFUSABLE[l]) || u.focus[0];
      steps.push({type:'tap_all', target:conf, distract:(CONFUSABLE[conf]||['o']).slice(0,2), item:'l:'+conf});
      pick(u.focus,2).forEach(l=>steps.push({type:'first_sound', word:LETTERS[l].key, target:l, options:shuffle(uniq([l, ...(CONFUSABLE[l]||[]).slice(0,1), ...pick(u.focus.filter(x=>x!==l),1)])).slice(0,3), item:'g:'+l}));
      pick(u.focus,2).forEach(l=>steps.push(caseMatch(l)));
      pick(u.focus,2).forEach(l=>steps.push(soundPick(u,l,3)));
    }
  } else if (u.type==='sight'){
    const sw = u.sight;
    if (idx===0){ sw.forEach(w=>steps.push({type:'sight_intro', word:w, item:'s:'+w.toLowerCase()})); pick(sw,3).forEach(w=>steps.push(wordPick(u,w,3))); }
    if (idx===1){ pick(sw,4).forEach(w=>steps.push(wordPick(u,w,3))); pick(sw.filter(w=>w.length<=5 && w.length>1),2).forEach(w=>steps.push(build(u,w,1))); }
    if (idx===2){ u.sentences.forEach(s=>steps.push(sentenceStep(u,s))); pick(sw,3).forEach(w=>steps.push(wordPick(u,w,3))); }
  } else {
    if (idx===0){
      steps.push(...intros(u));
      if (u.type==='magic') pick(u.pairs,3).forEach(p=>steps.push({type:'magic', pair:p, item:'w:'+p[1]}));
      else if (u.type!=='blend') u.focus.slice(0,2).forEach(g=>{ if (g!=='all' && !u.ySounds && !u.thSounds && !u.ooSounds) steps.push(soundPick(u,g,3)); });
      const bw = u.families ? u.families.map(f=>pick(W.filter(w=>w.endsWith(f)),1)[0]).filter(Boolean) : pick(W, u.type==='magic'?2:3);
      bw.forEach(w=>steps.push({type:'blend', word:w, item:'w:'+baseWord(w)}));
      if (u.type==='magic') pick(u.pairs,2).forEach(p=>steps.push({type:'pick_word', word:p[Math.round(Math.random())], options:shuffle([...p]), item:'g:'+u.focus[0]}));
      else pick(W,2).forEach(w=>steps.push(wordPick(u,w,3)));
    }
    if (idx===1){
      pick(W.filter(w=>segment(w).length<=5),3).forEach(w=>steps.push(build(u,w, short?1:2)));
      pick(picW,3).forEach(w=>steps.push(picMatch(u,w,3)));
      steps.push({type:'blend', word:pick(W,1)[0], item:null});
    }
    if (idx===2){
      pick(u.sentences, 2).forEach(s=>steps.push(sentenceStep(u,s)));
      pick(W.filter(w=>segment(w).length<=5),2).forEach(w=>steps.push(build(u,w,2)));
      pick(picW,2).forEach(w=>steps.push(picMatch(u,w,3)));
    }
  }
  steps = steps.filter(Boolean);
  const max = short ? 6 : 9;
  if (steps.length > max){
    const learnFirst = steps.filter(s=>['intro','sight_intro','mnemonic'].includes(s.type));
    const rest = steps.filter(s=>!learnFirst.includes(s));
    steps = [...learnFirst, ...rest.slice(0, Math.max(2, max-learnFirst.length))];
  }
  steps.push(...review(u, short ? Math.min(1,rev) : rev));
  return steps;
}

// ---- letter-confusion trainer ----
export function buildTrainer(confId){
  const c = CONFUSIONS.find(x=>x.id===confId); const L = c.letters; const steps = [{type:'mnemonic', conf:c.id}];
  for (let i=0;i<4;i++){ const l = L[i % L.length]; steps.push({type:'which_letter', target:l, options:shuffle([...L]), item:'l:'+l, conf:c.id}); }
  steps.push({type:'tap_all', target:L[0], distract:L.slice(1), item:'l:'+L[0], conf:c.id});
  if (L[1]) steps.push({type:'tap_all', target:L[1], distract:[L[0], ...L.slice(2)], item:'l:'+L[1], conf:c.id});
  c.words.filter(p=>p[0]!==p[1]).slice(0,2).forEach(p=>{ const w = p[Math.round(Math.random())]; steps.push({type:'pick_word', word:w, options:shuffle([...p]), item:'w:'+w, conf:c.id}); });
  return shuffle(steps.slice(1)).reduce((a,s)=>(a.push(s),a),[steps[0]]);
}
export function unitItems(u){
  if (u.type==='letters') return u.focus.flatMap(l=>['g:'+l,'l:'+l]);
  if (u.type==='sight') return u.sight.map(w=>'s:'+w.toLowerCase());
  return [...u.focus.map(g=>'g:'+g), ...u.words.map(w=>'w:'+baseWord(w))];
}

// ---------- 학교 영어 lesson: listen → vocab → listen&choose → picture quizzes → reply ----------
import { TALK, talkById } from './talk.js';
export function buildTalk(id){
  const L = talkById(id); const others = TALK.filter(t=>t.id!==id && t.g===L.g); const pool = others.length >= 2 ? others : TALK.filter(t=>t.id!==id);
  const short = store.state().settings.len === 'short';
  const picStep = v => ({type:'talk_pic', lesson:L, target:v[0], options:shuffle([v, ...pick(L.vocab.filter(x=>x!==v), 2)])});
  // a question/answer pair: Cubi asks, the hero answers (later grades have two pairs)
  const pairs = []; for (let k=0;k+1<L.lines.length;k+=2) if (L.lines[k][0]==='C' && L.lines[k+1][0]==='H') pairs.push([L.lines[k][1], L.lines[k+1][1]]);
  const [q, a] = pick(pairs, 1)[0] || [L.lines[0][1], L.lines[1][1]];
  const answers = pool.flatMap(t=>t.lines.filter(l=>l[0]==='H').map(l=>l[1])).filter(x=>x!==a);
  const reply = {type:'talk_reply', lesson:L, question:q, target:a, options:shuffle([a, ...pick(answers, 2)])};
  const echo = {type:'talk_echo', lesson:L, who:'C', target:L.lines[0][1], options:shuffle([L.lines[0][1], ...pick(pool.map(t=>t.lines[0][1]), 2)])};
  if (L.g <= 4){
    const pics = pick(L.vocab, short ? 2 : 3);
    const steps = [{type:'talk_listen', lesson:L}, {type:'talk_vocab', lesson:L}, echo, picStep(pics[0]), picStep(pics[1]), reply];
    if (pics[2]) steps.push(picStep(pics[2]));
    return steps;
  }
  // 5–6학년: listen → expressions → (echo) → reply → reading passage → sentence building → spelling
  const buildable = L.vocab.filter(v=>{ const n = v[0].split(/\s+/).length; return n >= 3 && n <= 7; });
  const bv = pick(buildable.length ? buildable : L.vocab, 1)[0];
  const spellable = L.words.filter(w=>/^[a-z]{3,8}$/.test(w[0]) && !w[1].startsWith('#'));
  const sw = pick(spellable.length ? spellable : L.words.filter(w=>/^[a-z]{3,9}$/.test(w[0])), 1)[0];
  const extra = pick('abcdefghijklmnoprstuwy'.split('').filter(c=>!sw[0].includes(c)), 2);
  const steps = [{type:'talk_listen', lesson:L}, {type:'talk_vocab', lesson:L}];
  if (!short) steps.push(echo);
  steps.push(reply, {type:'talk_read', lesson:L}, {type:'talk_build', lesson:L, text:bv[0], ko:bv[2]}, {type:'talk_spell', lesson:L, word:sw[0], pic:sw[1], ko:sw[2], extra});
  return steps;
}
