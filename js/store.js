// Progress & spaced-repetition store (localStorage)
const KEY = 'bhp.v1';
const today = () => { const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
export const dateKey = today;
const fresh = () => ({
  v:1, name:'', color:'red', created:Date.now(), xp:0, streak:{count:0,last:null},
  units:{}, items:{}, conf:{}, inv:{}, suit:[], trainer:{}, sessions:[], days:{}, missionCount:0,
  stories:{}, talk:{}, talkGate:null,   // added in v1.3 (story scrolls, 학교 영어); defaults keep old saves valid
  talkTab:null, libTab:null, dexTab:null, // added in v1.4 (학년별 학교 영어 · 읽기 책 · 단어 도감 tabs)
  // v1.4: grade = highest 학교 영어 grade the parent has opened (3–6). Older saves get 3 through the settings merge.
  settings:{calm:false, ko:true, sfx:true, len:'normal', unlockAll:false, start:'b1u1', grade:3},
});
let S = load();
function load(){ try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v===1) return {...fresh(), ...s, settings:{...fresh().settings, ...(s.settings||{})}}; } catch(e){} return fresh(); }
export function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
export const state = () => S;
export function reset(){ S = fresh(); save(); }
export function importData(obj){ if (obj && obj.v===1){ S = {...fresh(), ...obj, settings:{...fresh().settings, ...(obj.settings||{})}}; save(); return true; } return false; }

// ---- XP / level ----
export function levelInfo(xp=S.xp){ let lv=1, need=100, rest=xp; while (rest >= need){ rest-=need; lv++; need = 100 + (lv-1)*40; } return {lv, cur:rest, need}; }
export function addXP(n){ const before = levelInfo().lv; S.xp += n; save(); return levelInfo().lv > before; }

// ---- streak & time ----
export function touchDay(secs=0){
  const t = today(); S.days[t] = (S.days[t]||0) + secs;
  if (S.streak.last !== t){
    const y = new Date(); y.setDate(y.getDate()-1);
    const yk = y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
    S.streak.count = (S.streak.last === yk) ? S.streak.count+1 : 1; S.streak.last = t;
  }
  save();
}
export const todaySecs = () => S.days[today()] || 0;

// ---- units ----
export function unitState(id){ return S.units[id] || (S.units[id] = {m:[false,false,false], best:[0,0,0]}); }
export function completeMission(id, idx, acc){
  const u = unitState(id); const first = !u.m[idx]; u.m[idx] = true; u.best[idx] = Math.max(u.best[idx]||0, acc); S.missionCount++; save(); return first;
}
export const unitDone = id => !!(S.units[id] && S.units[id].m[2]);
export function stars(id){ const u = S.units[id]; if (!u) return 0; return u.m.filter(Boolean).length; }

// ---- items (Leitner boxes) ----
// key examples: g:a  w:cat  l:b  s:the
export function record(key, correct, unit){
  const it = S.items[key] || (S.items[key] = {box:0, right:0, wrong:0, unit, last:0, due:0});
  it.last = Date.now(); it.unit = it.unit || unit;
  if (correct){ it.right++; it.box = Math.min(5, it.box+1); }
  else { it.wrong++; it.box = Math.max(0, it.box-2); }
  const days = [0,1,2,4,7,14][it.box];
  it.due = Date.now() + days*864e5 - 3600e3;
  save();
}
export function recordConfusion(target, chosen){ if (!target || !chosen || target===chosen) return; const k = target+'>'+chosen; S.conf[k] = (S.conf[k]||0)+1; save(); }
export function dueItems(excludeUnit, limit=4){
  const now = Date.now();
  return Object.entries(S.items).filter(([k,it])=>it.unit!==excludeUnit && it.due<=now)
    .sort((a,b)=>(a[1].box-b[1].box)||(a[1].due-b[1].due)).slice(0,limit).map(([k,it])=>({key:k, ...it}));
}
export function mastery(keys){ if (!keys.length) return 0; return keys.reduce((s,k)=>s + Math.min(1,(S.items[k]?.box||0)/3),0)/keys.length; }

// ---- rewards ----
export function addBlock(type){ S.inv[type] = (S.inv[type]||0)+1; save(); }
export function addSuit(part){ if (!S.suit.includes(part)){ S.suit.push(part); save(); return true; } return false; }
export function logSession(entry){ S.sessions.unshift({d:Date.now(), ...entry}); S.sessions = S.sessions.slice(0,120); save(); }
export function set(k, v){ S[k] = v; save(); }
// ---- story scrolls & talk lessons ----
export function storyRead(id){ const r = S.stories[id] || (S.stories[id] = {n:0, at:0}); const first = !r.n; r.n++; r.at = Date.now(); save(); return first; }
// graded readers: best comprehension-quiz score (0..1), kept on the same story record (field added in v1.4)
export function storyQuiz(id, score){ const r = S.stories[id] || (S.stories[id] = {n:0, at:0}); r.q = Math.max(r.q||0, score); save(); }
export function talkDone(id, acc){ const t = S.talk[id] || (S.talk[id] = {n:0, best:0, at:0}); const first = !t.n; t.n++; t.best = Math.max(t.best, acc); t.at = Date.now();
  if (first) S.talkGate = {mc:S.missionCount, day:today()}; save(); return first; }
export function setSetting(k, v){ S.settings[k] = v; save(); }
