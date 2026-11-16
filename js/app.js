// Block Hero Phonics — app shell, screens & mission runner
import { UNITS, WORLDS, CONFUSIONS, KO, LETTERS } from './data.js';
import * as A from './audio.js';
import * as store from './store.js';
import { block, hero, icon, cloud, BLOCKS, SUIT_ORDER, SUIT_NAMES, HERO_COLORS } from './sprites.js';
import { buildMission, buildTrainer, buildTalk, MISSION_NAMES, MISSION_DESC, unitIndex, unitItems } from './missions.js';
import { RENDER, PROMPT_KEY, h, praise } from './activities.js';
import { emojiSrc } from './emoji.js';
import * as REW from './rewards.js';
import { ITEMS, CATS, itemArt, itemName, chestArt, TOTAL, ownedCount, GEMS } from './items.js';
import { initFit } from './fit.js';
import { STORIES, storyById } from './stories.js';
import { TALK, talkById, GRADES, gradeLessons } from './talk.js';
import { READERS, readerById, gradeReaders } from './readers.js';
import { storyTokens } from './phonics.js';

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const S = () => store.state();
const shuffle = a => { a=[...a]; for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const unitOf = id => UNITS.find(u=>u.id===id);
const worldOf = uid => WORLDS.find(w=>w.units.includes(uid));
const BIOME_BLOCK = {grass:'grass', stone:'cobble', mine:'coal', jungle:'mossy', ocean:'prism', ancient:'deep', nether:'hellrock', end:'endstone'};
const unitLabel = u => u.type==='sight' ? `${u.book}권 ${u.unit}단원` : `${u.book}권 ${u.unit}단원`;

// ---------------- boot ----------------
async function boot(){
  initFit();
  migrateRewards(); applySettings(); scenery();
  await A.initAudio();
  A.initGestures();
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(()=>{});
}
function applySettings(){
  const st = S().settings; document.body.classList.toggle('calm', !!st.calm);
  A.configure({sfx: st.sfx, ko: st.ko});
  const hc = HERO_COLORS[S().color] || HERO_COLORS.red; document.documentElement.style.setProperty('--hero', hc);
  document.documentElement.style.setProperty('--hero-d', shadeHex(hc, 0.72));
}
function shadeHex(hex, f){ const n = parseInt(hex.slice(1),16); const c = [16,8,0].map(b=>Math.round(((n>>b)&255)*f)); return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join(''); }
function scenery(){
  const sc = document.getElementById('scenery');
  sc.innerHTML = [0,1,2,3].map(i=>`<div class="cloud" style="top:${2+i*4}%;animation-duration:${70+i*25}s;animation-delay:-${i*21}s">${cloud(90+i*30)}</div>`).join('') +
    `<svg class="hills" viewBox="0 0 400 60" preserveAspectRatio="none" shape-rendering="crispEdges"><path fill="#7fcf6a" d="M0 60V40h20v-8h30v-10h40v10h20v8h40v-16h30v-8h30v12h30v12h40v-6h30v-14h40v10h30v30z"/></svg><div class="ground"></div>`;
}
function route(){
  A.stop(); const r = location.hash.replace('#/','') || '';
  if (!S().name && r!=='parent') return onboarding();
  if (r==='map') return worldMap();
  if (r==='trainer') return trainer();
  if (r==='inv') return inventory();
  if (r==='library') return library();
  if (r==='talk') return talkCorner();
  if (r==='dex') return wordDex();
  if (r.startsWith('story/')) return storyReader(r.slice(6));
  if (r==='parent') return parentGate();
  return home();
}
const go = (r) => { if (location.hash === '#/'+r) route(); else location.hash = '#/'+r; };
function screen(cls, html){ $app.innerHTML = ''; const el = h(`<section class="screen ${cls}">${html}</section>`); $app.append(el); return el; }
const backBtn = (label='홈') => `<button class="iconbtn back" aria-label="${label}">⬅</button>`;
function wireBack(el, to=''){ el.querySelectorAll('.back').forEach(b=>b.onclick=()=>{ A.sfx('tap'); go(to); }); }

// ---------------- progress logic ----------------
export function isUnlocked(uid){
  const st = S().settings; if (st.unlockAll) return true;
  const i = unitIndex(uid); if (i <= unitIndex(st.start || 'b1u1')) return true;
  return store.unitDone(UNITS[i-1].id);
}
function nextMission(){
  const startI = unitIndex(S().settings.start || 'b1u1');
  for (let i=startI;i<UNITS.length;i++){
    const u = UNITS[i]; if (!isUnlocked(u.id)) break;
    const us = store.unitState(u.id); const idx = us.m.findIndex(x=>!x);
    if (idx >= 0) return {unit:u, idx};
  }
  for (let i=0;i<startI;i++){ const u = UNITS[i]; const us = store.unitState(u.id); const idx = us.m.findIndex(x=>!x); if (idx>=0) return {unit:u, idx}; }
  return {unit: UNITS[UNITS.length-1], idx:2};
}

// ---- story scrolls: unlocked by clearing the boss mission of their unit (or when the parent start/unlock setting covers it)
export function storyUnlocked(st){
  const s = S().settings; if (s.unlockAll) return true;
  return store.unitDone(st.unlock) || unitIndex(st.unlock) < unitIndex(s.start || 'b1u1');
}
const unlockedStories = () => STORIES.filter(storyUnlocked).map(s=>s.id);
// ---- 학교 영어 (3–6학년): a grade opens when the parent opens it (default: 3학년) or when every lesson of the grade
// before it is done. Inside a grade the next lesson opens after the previous one; in 3학년 the next NEW lesson also
// waits for a phonics mission or a new day (the two tracks alternate).
export function gradeOpen(g){
  const st = S(); if (st.settings.unlockAll || g <= (st.settings.grade || 3)) return true;
  return gradeLessons(g-1).every(t=>st.talk[t.id]?.n);
}
export function talkState(g=3){
  const st = S(); const L = gradeLessons(g); const done = L.filter(t=>st.talk[t.id]?.n).length; const total = L.length;
  if (!gradeOpen(g)) return {g, done, open:0, total, waiting:false, locked:true};
  if (st.settings.unlockAll) return {g, done, open:total, total, waiting:false};
  if (g === 3){ const gate = st.talkGate; const fresh = !gate || st.missionCount > gate.mc || store.dateKey() !== gate.day;
    const open = Math.min(total, done + (fresh ? 1 : 0)); return {g, done, open: Math.max(open, done), total, waiting: !fresh && done < total}; }
  return {g, done, open: Math.min(total, done + 1), total, waiting:false};
}
const talkOpen = (g, i) => i < talkState(g).open || !!S().talk[gradeLessons(g)[i].id]?.n;
// the grade shown by default: the chosen tab, else the lowest open grade that still has lessons left (his own grade first)
function currentGrade(){
  const t = S().talkTab; if (t && gradeOpen(t)) return t;
  return GRADES.find(g=>gradeOpen(g) && talkState(g).done < gradeLessons(g).length) || [...GRADES].reverse().find(gradeOpen) || 3;
}
// 단어 도감: every word of every finished lesson
export function dexWords(){
  const m = new Map(); for (const t of TALK) for (const [en,pic,ko] of t.words){ const k = en.toLowerCase(); if (!m.has(k)) m.set(k, {en, pic, ko, g:t.g, topic:t.topic, lesson:t.id}); }
  return m;
}
const DEX = dexWords();
export const dexOwned = () => { const st = S(); const s = new Set(); for (const t of TALK) if (st.talk[t.id]?.n) t.words.forEach(w=>s.add(w[0].toLowerCase())); return s; };
export const readerUnlocked = r => S().settings.unlockAll || !!S().talk[r.after]?.n;

// world the child has actually reached (start setting, next mission, any finished mission) - drives reward tiers
function progressWorld(){
  let wi = REW.worldIndex(S().settings.start || 'b1u1');
  if (S().name) wi = Math.max(wi, REW.worldIndex(nextMission().unit.id));
  for (const [uid, u] of Object.entries(S().units)) if (u.m && u.m.some(Boolean)) wi = Math.max(wi, REW.worldIndex(uid));
  return wi;
}
// rewards v2: one-time inventory fix for saves made with the old (random-rarity) rewards. Same key & schema (v:1).
export function migrateRewards(){
  const st = S(); if (st.rv === 2) return;
  const moved = Object.keys(st.inv||{}).length ? REW.migrateInventory(st, progressWorld(), k=>ITEMS[k]?.rarity||1) : {};
  // worlds already cleared before pets existed: hand over that world's pet companion
  WORLDS.forEach((w,i)=>{ const pet = REW.TIERS[i]?.pet; if (pet && st.suit.includes(w.suit) && !st.inv[pet]) { st.inv[pet] = 1; moved['+'+pet] = 1; } });
  st.rv = 2; if (Object.keys(moved).length) st.invMigration = {at:Date.now(), moved};
  store.save();
}

// ---------------- onboarding ----------------
function onboarding(){
  let color = S().color || 'red';
  const el = screen('', `<div class="scroll" style="display:flex;padding-bottom:120px"><div class="onb">
    <div class="logo"><div style="display:flex;gap:6px">${block('grass',{size:56})}${block('power',{size:56,face:true})}${block('wood',{size:56})}</div>
      <h1>블록 히어로<br>파닉스</h1><div class="sub">BLOCK HERO PHONICS</div></div>
    <div class="card" style="width:100%;display:flex;flex-direction:column;gap:14px;align-items:center">
      <div class="hero-stage prev">${hero([], color, 130)}</div>
      <label style="font-size:22px">히어로 이름을 알려줘!</label>
      <input class="input" maxlength="10" placeholder="예: 시온" value="${esc(S().name)}" aria-label="이름">
      <div style="font-size:18px" class="muted">히어로 색깔을 골라 봐</div>
      <div class="colors">${Object.entries(HERO_COLORS).map(([k,v])=>`<button data-c="${k}" class="${k===color?'sel':''}" style="background:${v}" aria-label="${k}"></button>`).join('')}</div>
      <details style="width:100%;text-align:left;font-size:17px"><summary class="muted" style="cursor:pointer">👨‍👩‍👦 보호자: 지금 어디를 공부하고 있나요? (선택)</summary>
        <div style="margin-top:10px"><select class="sel start" style="max-width:100%;width:100%">${startOptions(S().settings.start)}</select>
        <p class="muted" style="font-size:14px">고른 단원까지는 바로 열려요. 나중에 보호자 화면에서 바꿀 수 있어요.</p></div></details>
      <button class="btn hero wide big-go go">출동! 🚀</button>
    </div></div></div>`);
  const inp = el.querySelector('.input');
  el.querySelectorAll('.colors button').forEach(b=>b.onclick=()=>{ color=b.dataset.c; el.querySelectorAll('.colors button').forEach(x=>x.classList.toggle('sel',x===b)); el.querySelector('.prev').innerHTML = hero(['helmet','cape'], color, 130); A.sfx('tap'); });
  el.querySelector('.go').onclick = ()=>{
    const name = inp.value.trim() || '히어로'; A.unlock();
    store.set('name', name); store.set('color', color); store.setSetting('start', el.querySelector('.start').value);
    applySettings(); A.sfx('level'); go('');
    setTimeout(()=>A.play('ko','welcome'), 300);
  };
}
function startOptions(sel){
  return UNITS.map(u=>`<option value="${u.id}" ${u.id===sel?'selected':''}>${u.book}권 ${u.unit}단원 · ${esc(u.title)}</option>`).join('');
}

// ---------------- home ----------------
function home(){
  const st = S(); const lv = store.levelInfo(); const nm = nextMission(); const w = worldOf(nm.unit.id);
  const el = screen('', `
    <div class="topbar"><div class="chip">${icon('flame',22)} <span class="px">${st.streak.count}</span>일</div>
      <div class="chip">${icon('xp',22)} <span class="px">${st.xp}</span> XP</div><div class="spacer"></div>
      <button class="iconbtn" data-go="parent" aria-label="보호자 화면">🔒</button></div>
    <div class="scroll" style="display:flex"><div class="home">
      <div class="card hero-card"><button class="hero-stage edit-hero" aria-label="히어로 꾸미기">${hero(st.suit, st.color, 140)}<span class="pencil">✏️</span></button>
        <div class="hero-info" style="flex:1"><div class="muted" style="font-size:16px">오늘도 출동!</div><h2><button class="name-btn edit-hero" aria-label="이름 바꾸기">${esc(st.name)} 히어로 <span class="pencil-s">✏️</span></button></h2>
          <div style="display:flex;justify-content:space-between;font-size:16px"><span class="px">LV ${lv.lv}</span><span class="muted px">${lv.cur}/${lv.need}</span></div>
          <div class="lvbar"><i style="width:${Math.round(lv.cur/lv.need*100)}%"></i></div>
          <div class="muted" style="font-size:16px">📖 도감 ${ownedCount(st.inv)}/${TOTAL} · 🦸 수트 ${st.suit.length}/8</div>
          <div class="goal"><span>오늘의 목표</span>${[0,1].map(k=>`<i class="${k<todayMissions()?'on':''}"></i>`).join('')}<span class="muted">${todayMissions()>=2?'달성! 🎉':'미션 2개'}</span></div></div></div>
      <div class="mission-cta">
        <div class="today">${block(BIOME_BLOCK[w.biome], {size:78, face:true})}<div style="flex:1;min-width:0"><p style="margin:0">${esc(w.name)} · ${unitLabel(nm.unit)}</p>
          <h3><span class="en">${esc(nm.unit.title)}</span> ${MISSION_NAMES[nm.idx]}</h3><p>${MISSION_DESC[nm.idx]} · 약 3분</p></div></div>
        <button class="btn hero big-go start">▶ 미션 시작!</button>
        <div class="quick">
          <button class="qbtn" data-go="map">${block('grass',{size:54})}월드 지도</button>
          <button class="qbtn" data-go="trainer"><span class="ic">🕵️</span>글자 훈련소</button>
          <button class="qbtn" data-go="library"><span class="ic">📚</span>이야기 책<span class="qbadge">${STORIES.filter(x=>S().stories[x.id]?.n).length}/${STORIES.length}</span></button>
          <button class="qbtn" data-go="inv">${icon('chest',54)}인벤토리</button>
        </div></div>
      ${talkCard()}
    </div></div>`);
  el.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ A.sfx('tap'); go(b.dataset.go); });
  el.querySelector('.start').onclick = ()=>{ A.unlock(); startMission(nm.unit.id, nm.idx); };
  el.querySelectorAll('.edit-hero').forEach(b=>b.onclick=()=>{ A.sfx('tap'); editHero(home); });
  const tb = el.querySelector('.talk-go'); if (tb) tb.onclick = ()=>{ A.unlock(); A.sfx('tap'); const id = tb.dataset.id; if (id) startTalk(id); else go('talk'); };
  el.querySelectorAll('.trk').forEach(b=>b.onclick = ()=>{ A.sfx('tap'); if (b.dataset.tab) store.set('libTab', b.dataset.tab); go(b.dataset.to); });
  const unread = STORIES.filter(s=>storyUnlocked(s) && !S().stories[s.id]?.n).length + READERS.filter(r=>readerUnlocked(r) && !S().stories[r.id]?.n).length;
  if (unread) el.querySelector('[data-go="library"]').classList.add('has-new');
}
function talkCard(){
  const g = currentGrade(); const ts = talkState(g); const L = gradeLessons(g); const k = ts.done < ts.total && ts.done < ts.open ? L.findIndex((t,i)=>!S().talk[t.id]?.n && talkOpen(g,i)) : -1; const nx = k>=0 ? L[k] : null;
  const rd = gradeReaders(g); const rdRead = rd.filter(r=>S().stories[r.id]?.n).length; const rdNew = rd.some(r=>readerUnlocked(r) && !S().stories[r.id]?.n);
  const dex = dexOwned().size;
  return `<div class="talk-cta card"><div class="tc-top"><div class="tc-ic">🗣️</div><div style="flex:1;min-width:0"><div class="muted" style="font-size:15px">학교 영어 · <b class="gchip g${g}">${g}학년</b> <span class="px" style="font-size:13px">${ts.done}/${ts.total}</span></div>
    <h3>${nx ? `Lesson ${k+1} · ${esc(nx.ko)}` : ts.done>=ts.total ? `${g}학년 대화 완료! 🎉` : '다음 대화는 파닉스 미션 1개를 하거나 내일 열려요'}</h3>
    <div class="lvbar thin"><i style="width:${Math.round(ts.done/ts.total*100)}%"></i></div></div>
    <button class="btn blue small talk-go" data-id="${nx ? nx.id : ''}">${nx ? '▶ 대화하기' : '목록'}</button></div>
    <div class="tracks"><button class="trk ${rdNew?'has-new':''}" data-to="library" data-tab="${g}">📗 ${g}학년 읽기 책 <b class="px">${rdRead}/${rd.length}</b></button>
      <button class="trk" data-to="dex">🔤 단어 도감 <b class="px">${dex}/${DEX.size}</b></button></div></div>`;
}
// change hero name / colour any time (progress is untouched: only name & color fields change)
function editHero(after){
  let color = S().color;
  const bg = h(`<div class="sheet-bg"><div class="sheet edit-sheet" style="text-align:center">
    <div class="hero-stage prev" style="margin:0 auto">${hero(S().suit.length?S().suit:['helmet','cape'], color, 120)}</div>
    <h3 style="margin:6px 0">히어로 꾸미기</h3>
    <input class="input" maxlength="10" value="${esc(S().name)}" aria-label="히어로 이름" style="text-align:center">
    <div class="colors" style="justify-content:center;margin:12px 0">${Object.entries(HERO_COLORS).map(([k,v])=>`<button data-c="${k}" class="${k===color?'sel':''}" style="background:${v}" aria-label="${k}"></button>`).join('')}</div>
    <div style="display:flex;gap:12px;justify-content:center"><button class="btn ghost small no">취소</button><button class="btn hero small yes">저장 ✔</button></div></div></div>`);
  document.body.append(bg);
  bg.querySelectorAll('.colors button').forEach(b=>b.onclick=()=>{ color=b.dataset.c; bg.querySelectorAll('.colors button').forEach(x=>x.classList.toggle('sel',x===b)); bg.querySelector('.prev').innerHTML = hero(S().suit.length?S().suit:['helmet','cape'], color, 120); A.sfx('tap'); });
  bg.querySelector('.no').onclick = ()=>bg.remove();
  bg.onclick = e=>{ if (e.target===bg) bg.remove(); };
  bg.querySelector('.yes').onclick = ()=>{ const nm = bg.querySelector('.input').value.trim(); if (nm) store.set('name', nm); store.set('color', color);
    applySettings(); A.sfx('ok'); bg.remove(); toast('멋져요! 히어로가 바뀌었어요'); after && after(); };
}

function todayMissions(){ const t = store.dateKey(); return S().sessions.filter(x=>{ const d=new Date(x.d); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')===t; }).length; }
// ---------------- world map ----------------
function worldMap(){
  const nm = nextMission();
  const el = screen('', `<div class="topbar">${backBtn()}<h2 style="margin:0;font-size:26px">월드 지도</h2><div class="spacer"></div></div>
    <div class="scroll"><div class="worlds">${WORLDS.map(w=>{
      const open = isUnlocked(w.units[0]); const done = w.units.filter(store.unitDone).length;
      return `<div class="world biome-${w.biome} ${open?'':'locked'}"><header>${block(BIOME_BLOCK[w.biome],{size:52})}
        <div style="flex:1"><h3>${esc(w.name)}</h3><div class="en">${esc(w.en)} · <span class="topic">${esc(w.topic)}</span></div></div><span class="book">Phonics Works ${w.book} · ${done}/${w.units.length}</span></header>
        <div class="nodes">${w.units.map(uid=>{ const u = unitOf(uid); const lock = !isUnlocked(uid); const stc = store.stars(uid);
          return `<button class="node ${lock?'locked':''} ${uid===nm.unit.id?'current':''} ${store.unitDone(uid)?'done':''}" data-u="${uid}">
            ${lock?`<span class="badge">${icon('lock',22)}</span>`:''}<span class="t">${esc(u.type==='sight'? u.sight.slice(0,2).join(' ') : u.title)}</span><span class="u">${u.book}권 ${u.unit}단원</span>
            <span class="stars">${[0,1,2].map(i=>`<i class="${i<stc?'on':''}"></i>`).join('')}</span></button>`; }).join('')}</div></div>`; }).join('')}
    </div></div>`);
  wireBack(el);
  el.querySelectorAll('.node').forEach(n=>n.onclick=()=>{ A.sfx('tap'); const uid = n.dataset.u;
    if (!isUnlocked(uid)){ toast('앞 단원의 보스를 깨면 열려요! 🔒'); return; } unitSheet(uid); });
  const cur = el.querySelector('.node.current'); if (cur) setTimeout(()=>cur.scrollIntoView({block:'center', behavior:'smooth'}), 200);
}
function unitSheet(uid){
  const u = unitOf(uid); const us = store.unitState(uid);
  const bg = h(`<div class="sheet-bg"><div class="sheet"><div style="display:flex;align-items:center;gap:12px">${block(BIOME_BLOCK[worldOf(uid).biome],{size:56})}
    <div><div class="muted">${unitLabel(u)} · ${esc(worldOf(uid).name)}</div><h3 class="en">${esc(u.type==='sight' ? u.title : u.title)}</h3></div></div>
    ${u.type==='sight' ? `<p class="en" style="font-size:22px;margin:10px 0 0">${u.sight.join(' · ')}</p>` : ''}
    <div class="mlist">${[0,1,2].map(i=>{ const lock = i>0 && !us.m[i-1] && !S().settings.unlockAll;
      return `<button class="mitem ${us.m[i]?'done':''} ${lock?'locked':''}" data-i="${i}"><span class="n">${us.m[i]?'✓':i+1}</span><span><div>${MISSION_NAMES[i]}</div><div class="d">${MISSION_DESC[i]}</div></span><span class="go">${lock?'🔒':'▶'}</span></button>`; }).join('')}</div>
    <button class="btn ghost wide small close" style="margin-top:14px">닫기</button></div></div>`);
  document.body.append(bg);
  const close = ()=>bg.remove();
  bg.onclick = e=>{ if (e.target===bg) close(); };
  bg.querySelector('.close').onclick = close;
  bg.querySelectorAll('.mitem').forEach(b=>b.onclick=()=>{ if (b.classList.contains('locked')){ toast('앞 미션을 먼저 해 봐요!'); return; } close(); startMission(uid, +b.dataset.i); });
}
function toast(msg){ const t = h(`<div style="position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:90;background:#1b2233;color:#fff;padding:12px 20px;border-radius:14px;font-size:19px;box-shadow:var(--shadow)">${esc(msg)}</div>`); document.body.append(t); setTimeout(()=>t.remove(), 1800); }

// ---------------- mission runner ----------------
function startMission(uid, idx){ const steps = buildMission(uid, idx); runMission(steps, {kind:'unit', uid, idx}); }
function startTalk(id){ runMission(buildTalk(id), {kind:'talk', talk:id}); }
function runMission(steps, meta){
  const t0 = Date.now(); let i = 0, xp = 0, correct = 0, scored = 0; const spoken = new Set();
  const u = meta.uid ? unitOf(meta.uid) : null;
  const el = screen('mission', `<div class="mbar"><button class="iconbtn quit" aria-label="그만하기">✕</button>
      <div class="progress">${steps.map(()=>'<i></i>').join('')}</div><div class="chip">${icon('xp',20)}<span class="px xpv">0</span></div></div>
    <div class="stage"></div>
    <div class="coach"><button class="mascot" aria-label="큐비">${block('power',{size:76, face:true})}</button><div class="bubble"></div><button class="replay" aria-label="다시 듣기">🔊</button></div>
    <div class="fx"></div>`);
  const stage = el.querySelector('.stage'), bubble = el.querySelector('.bubble'), bars = [...el.querySelectorAll('.progress i')];
  const replayBtn = el.querySelector('.replay'), fxL = el.querySelector('.fx'), mascot = el.querySelector('.mascot');
  const onPlay = p => replayBtn.classList.toggle('playing', p); A.audioState.listeners.add(onPlay);
  const cleanup = () => A.audioState.listeners.delete(onPlay);
  el.querySelector('.quit').onclick = () => confirmQuit(()=>{ cleanup(); A.stop(); go(meta.kind==='trainer'?'trainer':meta.kind==='talk'?'talk':''); });
  mascot.onclick = () => { mascot.classList.remove('hop'); void mascot.offsetWidth; mascot.classList.add('hop'); A.sfx('tap'); };
  // preload audio for the mission
  const pre = []; steps.forEach(s=>{ if (s.word) pre.push(['w', s.word]); if (s.key) pre.push(['w', s.key]); if (s.text) pre.push(['s', s.text]); if (s.sound) pre.push(['p', s.sound]); (s.options||[]).forEach(o=>pre.push(['w',o]));
    if (s.lesson){ s.lesson.lines.forEach(([,t])=>pre.push(['tk',t])); s.lesson.vocab.forEach(([t])=>pre.push(['tk',t])); }
    if (s.type==='talk_read'){ pre.push(['st', s.lesson.read.t], ['tk', s.lesson.read.q]); } if (s.type==='talk_spell') pre.push(['w', s.word]); });
  A.preload(pre);
  const fx = {
    burst(target, n=12){ if (S().settings.calm) n = 4; const r = target.getBoundingClientRect(); const cx = r.left+r.width/2, cy = r.top+r.height/2;
      const cols = ['#ffd84a','#4ade80','#60a5fa','#f472b6','#a78bfa','#fb923c'];
      for (let k=0;k<n;k++){ const p = document.createElement('i'); const a = Math.random()*Math.PI*2, d = 60+Math.random()*90;
        p.style.cssText = `left:${cx}px;top:${cy}px;background:${cols[k%cols.length]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;--rot:${Math.random()*360}deg`;
        fxL.append(p); setTimeout(()=>p.remove(), 950); } },
    xp(target, n){ xp += n; el.querySelector('.xpv').textContent = xp; const r = target.getBoundingClientRect();
      const t = h(`<div class="toast-xp" style="left:${r.left+r.width/2-40}px;top:${r.top-10}px">+${n} XP</div>`); document.body.append(t); setTimeout(()=>t.remove(), 1000); },
  };
  const next = () => {
    if (i >= steps.length) return finish();
    const s = steps[i]; window.__step = s; bars.forEach((b,k)=>{ b.classList.toggle('done', k<i); b.classList.toggle('now', k===i); });
    stage.innerHTML = ''; stage.classList.remove('enter'); void stage.offsetWidth; stage.classList.add('enter');
    const pk = PROMPT_KEY[s.type]; bubble.innerHTML = esc(KO[pk] || '');
    if (s.review) bubble.innerHTML = '🔁 <b>복습!</b> ' + bubble.innerHTML;
    let finished = false;
    const ctx = {
      stage, fx, replay: null,
      say: async (key) => { bubble.innerHTML = (s.review?'🔁 <b>복습!</b> ':'') + esc(KO[key] || ''); if (spoken.has(key)) return; spoken.add(key); await A.play('ko', key); },
      setText: (html) => { bubble.innerHTML = html; },
      mascotHop: () => { mascot.classList.remove('hop'); void mascot.offsetWidth; mascot.classList.add('hop'); },
      miss: (chosen, target) => { if (meta.kind==='talk') return; const tg = target || s.target || s.word; store.recordConfusion(String(tg).toLowerCase(), String(chosen).toLowerCase()); },
      done: (res) => {
        if (finished) return; finished = true;
        if (!res.learn){ scored++; if (res.correct) correct++; if (s.item) store.record(s.item, res.correct, meta.uid || ('trainer:'+meta.conf)); }
        else if (s.item && !store.state().items[s.item]) store.record(s.item, true, meta.uid || ('trainer:'+meta.conf));
        if (res.learn) xp += 5;
        i++; setTimeout(next, res.learn ? 150 : 350);
      },
    };
    replayBtn.onclick = () => { A.unlock(); ctx.replay ? ctx.replay() : null; };
    try { RENDER[s.type](s, ctx); } catch(e){ console.error(e); i++; next(); }
  };
  const finish = () => {
    cleanup(); const secs = Math.round((Date.now()-t0)/1000); const acc = scored ? correct/scored : 1;
    xp += 20; const lvUp = store.addXP(xp); store.touchDay(secs);
    let first = false, suit = null, newStories = [], disc = null, talkRes = null;
    if (meta.kind==='unit'){
      const before = new Set(unlockedStories());
      first = store.completeMission(meta.uid, meta.idx, acc);
      const w = worldOf(meta.uid);
      if (meta.idx===2 && w.units.every(store.unitDone) && store.addSuit(w.suit)) suit = w.suit;
      newStories = unlockedStories().filter(id=>!before.has(id));
    } else if (meta.kind==='talk'){
      const L = talkById(meta.talk), gl = gradeLessons(L.g), li = gl.findIndex(t=>t.id===meta.talk);
      const wasDone = gl.every(t=>S().talk[t.id]?.n); const nextGradeWasOpen = L.g < 6 && gradeOpen(L.g+1); const dexBefore = dexOwned().size;
      first = store.talkDone(meta.talk, acc);
      const gradeDone = first && !wasDone && gl.every(t=>S().talk[t.id]?.n);
      if (L.g === 3 && first && li % 2 === 1 && li < 18) disc = REW.DISC_ORDER[(li-1)/2] || null;   // 3학년 lessons 2,4,…,18: speaking discs
      talkRes = {g:L.g, li, first, gradeDone, newWords: dexOwned().size - dexBefore, readers: first ? READERS.filter(r=>r.after===meta.talk).map(r=>r.id) : [],
        nextGrade: gradeDone && L.g < 6 && !nextGradeWasOpen ? L.g+1 : null};
    } else { const t = S().trainer; t[meta.conf] = (t[meta.conf]||0)+1; store.save(); }
    const wi = meta.uid ? REW.worldIndex(meta.uid) : progressWorld();
    const got = talkRes ? REW.pickTalkReward(talkRes.g, talkRes.li, acc, talkRes.first, talkRes.gradeDone, S().inv) : REW.pickReward(meta, acc, !!suit, wi, S().inv);
    if (disc && !got.bonus) got.bonus = disc;
    const isNew = id => !(S().inv[id] > 0);
    const reward = got.main, rewardNew = isNew(reward); store.addBlock(reward);
    const bonus = got.bonus || null, bonusNew = bonus ? isNew(bonus) : false; if (bonus) store.addBlock(bonus);
    const gems = talkRes ? REW.gemsFor(dexOwned().size, S().inv) : []; gems.forEach(id=>store.addBlock(id));
    store.logSession({kind:meta.kind, unit:meta.uid||meta.conf||meta.talk, idx:meta.idx ?? null, title: u ? `${u.title} · ${MISSION_NAMES[meta.idx]}` : meta.kind==='talk' ? `학교 영어 ${talkById(meta.talk).g}학년 · ${talkById(meta.talk).ko}` : `훈련소 ${meta.conf}`, correct, total:scored, secs, xp});
    complete({meta, acc, xp, secs, reward, rewardNew, bonus, bonusNew, lvUp, suit, newStories, talkRes, gems});
  };
  next();
}
function confirmQuit(onYes){
  const bg = h(`<div class="sheet-bg"><div class="sheet" style="text-align:center"><div style="font-size:54px">🏕️</div><h3>잠깐 쉬어 갈까?</h3>
    <p class="muted" style="font-size:19px">지금 미션은 처음부터 다시 하게 돼요.</p>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:10px"><button class="btn ghost small no">계속하기</button><button class="btn hero small yes">그만하기</button></div></div></div>`);
  document.body.append(bg); bg.querySelector('.no').onclick = ()=>bg.remove(); bg.querySelector('.yes').onclick = ()=>{ bg.remove(); onYes(); };
}
// ---------------- complete ----------------
function complete({meta, acc, xp, secs, reward, rewardNew, bonus, bonusNew, lvUp, suit, newStories=[], talkRes=null, gems=[]}){
  const stars = acc>=0.8 ? 3 : acc>=0.5 ? 2 : 1; const nm = nextMission();
  const rest = store.todaySecs() > 15*60;
  const el = screen('complete', `<div class="scroll" style="display:flex;flex-direction:column;align-items:center;gap:16px;padding-top:10px">
    <h2>미션 완료!</h2>
    <div style="display:flex;gap:6px">${[0,1,2].map(i=>`<span style="opacity:${i<stars?1:.25}">${icon('star',46)}</span>`).join('')}</div>
    <button class="chest r${ITEMS[reward].rarity}" aria-label="상자 열기"><div class="rays"></div><div class="flash"></div><div class="box">${chestArt(170)}</div>
      <div class="reward">${itemArt(reward,150)}${rewardNew?'<span class="newb">NEW!</span>':''}</div><div class="sparks">${Array.from({length:14},(_,i)=>`<i style="--a:${i*360/14}deg;--d:${70+(i%3)*28}px"></i>`).join('')}</div></button>
    <div class="tap-hint muted">상자를 눌러 열어 봐!</div>
    <div class="reward-name chip hidden" style="font-size:22px">🎁 ${esc(itemName(reward))} 획득! <span class="rar">${'<i></i>'.repeat(ITEMS[reward].rarity)}</span></div>
    ${bonus ? `<div class="bonus-card hidden">${itemArt(bonus,96)}<div><div style="color:var(--gold)">${ITEMS[bonus].cat==='disc' ? '학교 영어 보너스! 말하기 디스크' : talkRes?.gradeDone ? `${talkRes.g}학년 완료 보너스! 새 펫 친구` : '월드 클리어 보너스! 새 펫 친구'}</div><div style="font-size:26px">${esc(itemName(bonus))}${bonusNew?' <span class="newb inl">NEW!</span>':''}</div></div></div>`:''}
    <div class="dex-line chip hidden">📖 도감 <b class="px">${ownedCount(S().inv)}/${TOTAL}</b></div>
    ${suit ? `<div class="suit-unlock">${hero(S().suit, S().color, 90)}<div><div style="color:var(--gold)">월드 클리어! 새 수트 파츠</div><div style="font-size:26px">${SUIT_NAMES[suit]} 장착!</div></div></div>`:''}
    ${gems.map(id=>`<div class="bonus-card gem-card hidden">${itemArt(id,80)}<div><div style="color:var(--gold)">단어 도감 보너스! 단어 ${GEMS.find(g=>g[0]===id)[2]}개 모음</div><div style="font-size:24px">${esc(itemName(id))} <span class="newb inl">NEW!</span></div></div></div>`).join('')}
    ${talkRes && talkRes.newWords ? `<button class="dex-gain chip hidden">🔤 새 단어 ${talkRes.newWords}개를 단어 도감에 모았어! ▶</button>` : ''}
    ${talkRes && talkRes.gradeDone ? `<div class="grade-clear hidden">🏅 ${talkRes.g}학년 학교 영어를 모두 끝냈어!${talkRes.nextGrade ? ` <b>${talkRes.nextGrade}학년</b>이 열렸어요!` : ''}</div>` : ''}
    ${(talkRes?.readers||[]).map(id=>{ const r = readerById(id); return `<button class="story-unlock hidden" data-s="${id}"><span class="scroll-ic">📗</span><div style="text-align:left"><div style="color:var(--gold)">${r.g}학년 읽기 책이 열렸어!</div><div class="en" style="font-size:24px">${esc(r.title)}</div><div class="muted" style="font-size:15px">${esc(r.ko)} · 눌러서 읽기 ▶</div></div></button>`; }).join('')}
    ${newStories.map(id=>{ const st = storyById(id); return `<button class="story-unlock hidden" data-s="${id}"><span class="scroll-ic">📜</span><div style="text-align:left"><div style="color:var(--gold)">새 이야기 책 발견!</div><div class="en" style="font-size:24px">${esc(st.title)}</div><div class="muted" style="font-size:15px">${esc(st.ko)} · 눌러서 읽기 ▶</div></div></button>`; }).join('')}
    ${lvUp ? `<div class="chip" style="font-size:22px;background:var(--gold)">⬆ 레벨 업! LV ${store.levelInfo().lv}</div>`:''}
    <div class="stats"><div class="stat"><b>+${xp}</b><span>XP</span></div><div class="stat"><b>${Math.round(acc*100)}%</b><span>정답률</span></div><div class="stat"><b>${Math.max(1,Math.round(secs/60))}분</b><span>시간</span></div></div>
    ${rest ? `<div class="card" style="font-size:19px;text-align:center">🏕️ 오늘 정말 많이 했어! 물 한 잔 마시고 쉬었다 하자.</div>`:''}
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
      <button class="btn ghost gohome">🏠 홈으로</button>
      ${meta.kind==='unit' ? `<button class="btn hero nextm">다음 미션 ▶</button>` : meta.kind==='talk' ? `<button class="btn hero totalk">🗣️ 학교 영어</button>` : `<button class="btn hero again">한 번 더 ▶</button>`}
    </div></div>`);
  const chest = el.querySelector('.chest');
  const rare = ITEMS[reward].rarity >= 3;
  const knock = setInterval(()=>{ if (!chest.classList.contains('open')) A.sfx('knock'); }, 1400);
  const open = () => { if (chest.classList.contains('open')) return; clearInterval(knock); A.sfx('whoosh');
    chest.classList.add('opening');
    setTimeout(()=>{ chest.classList.add('open'); A.sfx(rare ? 'rare' : 'chest'); el.querySelector('.tap-hint')?.remove();
      el.querySelector('.reward-name').classList.remove('hidden'); el.querySelector('.dex-line').classList.remove('hidden');
      setTimeout(()=>A.play('x', ITEMS[reward].cat==='block' ? 'New block!' : 'New treasure!'), 600);
      const bc = el.querySelector('.bonus-card'); if (bc) setTimeout(()=>{ el.querySelectorAll('.bonus-card').forEach(x=>x.classList.remove('hidden')); A.sfx('rare'); }, 1500);
      el.querySelectorAll('.dex-gain,.grade-clear').forEach(x=>setTimeout(()=>x.classList.remove('hidden'), 1100));
      const su = el.querySelectorAll('.story-unlock'); if (su.length) setTimeout(()=>{ su.forEach(x=>x.classList.remove('hidden')); A.sfx('level'); A.play('ko','story_new'); }, bc ? 2600 : 1600);
      if (lvUp) setTimeout(()=>A.sfx('level'), bc ? 2600 : 1500); }, 350); };
  chest.onclick = open; setTimeout(open, 2600);
  A.seq([['x','Mission complete!'], 200]);
  el.querySelector(".gohome").onclick = ()=>go("");
  const nb = el.querySelector('.nextm'); if (nb) nb.onclick = ()=>startMission(nm.unit.id, nm.idx);
  const ab = el.querySelector('.again'); if (ab) ab.onclick = ()=>runMission(buildTrainer(meta.conf), meta);
  const tt = el.querySelector('.totalk'); if (tt) tt.onclick = ()=>go('talk');
  el.querySelectorAll('.story-unlock').forEach(b=>b.onclick = ()=>{ A.sfx('tap'); go('story/'+b.dataset.s); });
  const dg = el.querySelector('.dex-gain'); if (dg) dg.onclick = ()=>{ A.sfx('tap'); store.set('dexTab', talkRes.g); go('dex'); };
}

// ---------------- trainer ----------------
function trainer(){
  const el = screen('', `<div class="topbar">${backBtn()}<h2 style="margin:0;font-size:26px">🕵️ 헷갈리는 글자 훈련소</h2><div class="spacer"></div></div>
    <div class="scroll"><div style="max-width:900px;margin:0 auto">
      <div class="card" style="margin-bottom:16px;display:flex;gap:14px;align-items:center">${block('power',{size:64,face:true})}<div style="font-size:19px;line-height:1.5">
        모양이 비슷한 소문자를 구별하는 특훈! 하루에 한 번, 2분이면 충분해요.<br><span class="muted" style="font-size:16px">자주 틀리는 짝은 ⭐ 표시가 붙어요.</span></div></div>
      <div class="trainer-grid">${CONFUSIONS.map(c=>{ const m = store.mastery(c.letters.map(l=>'l:'+l)); const missN = c.letters.reduce((a,l)=>a+Object.entries(S().conf).filter(([k])=>k.split('>').every(x=>c.letters.includes(x)) && k.startsWith(l)).reduce((s,[,v])=>s+v,0),0);
        return `<button class="pairbtn" data-c="${c.id}"><span class="l ${c.letters.length>3?"four":""}">${c.letters.join(" ")}</span><span class="m">${missN>=2?'⭐ 집중 훈련 추천':'훈련 '+(S().trainer[c.id]||0)+'회'}</span><span class="mastery"><i style="width:${Math.round(m*100)}%"></i></span></button>`; }).join('')}</div>
    </div></div>`);
  wireBack(el);
  el.querySelectorAll('.pairbtn').forEach(b=>b.onclick=()=>{ A.unlock(); A.sfx('tap'); runMission(buildTrainer(b.dataset.c), {kind:'trainer', conf:b.dataset.c}); });
  A.play('ko','trainer');
}

// ---------------- inventory ----------------
function inventory(){
  const st = S();
  const el = screen('', `<div class="topbar">${backBtn()}<h2 style="margin:0;font-size:26px">🎒 인벤토리</h2><div class="spacer"></div></div>
    <div class="scroll"><div style="max-width:980px;margin:0 auto;display:flex;flex-direction:column;gap:16px">
      <div class="card"><h3 class="panel-title">🦸 ${esc(st.name)}의 히어로 수트</h3>
        <div class="suitgrid"><div class="hero-stage" style="width:170px;height:190px">${hero(st.suit, st.color, 180)}</div>
          <div class="suitparts">${SUIT_ORDER.map((p,i)=>`<div class="part ${st.suit.includes(p)?'on':''}"><span class="dot"></span><div><div>${SUIT_NAMES[p]}</div><div class="muted" style="font-size:13px">${esc(WORLDS[i].name)} 클리어</div></div></div>`).join('')}</div></div></div>
      <div class="card"><div class="dex-head"><h3 class="panel-title" style="margin:0">📚 이야기 책장</h3><span class="chip px">${STORIES.filter(s=>st.stories[s.id]?.n).length}/${STORIES.length}</span></div>
        <p class="muted" style="margin:6px 0 10px;font-size:15px">보스를 깨면 이야기 책이 하나씩 열려요. 다 읽은 책에는 ✔ 표시!</p>${shelfHTML()}
        <div class="tracks" style="margin-top:12px"><button class="trk" data-to="library">📗 학년별 읽기 책 <b class="px">${READERS.filter(r=>st.stories[r.id]?.n).length}/${READERS.length}</b></button><button class="trk" data-to="dex">🔤 단어 도감 <b class="px">${dexOwned().size}/${DEX.size}</b></button></div></div>
      <div class="card"><div class="dex-head"><h3 class="panel-title" style="margin:0">📖 보물 도감</h3><span class="chip px">${ownedCount(st.inv)}/${TOTAL}</span></div>
        <div class="lvbar" style="margin:10px 0 4px"><i style="width:${Math.round(ownedCount(st.inv)/TOTAL*100)}%"></i></div>
        <p class="muted" style="margin:4px 0 6px;font-size:15px">초원에서 출발해 동굴·광산·정글·바다 유적·고대 도시·지하세계를 지나 끝의 차원까지! 깊이 갈수록 귀한 보물이 나와요. 도구와 귀한 광석은 보스 미션에서, 펫 친구는 월드를 클리어하면 만나요! 💿 디스크·🏅 학년 배지·학년별 블록(벚꽃 숲·사막 마을·눈 덮인 산·하늘 섬)은 학교 영어에서, 💎 단어 보석은 단어 도감에서 모아요.</p>
        ${CATS.map(c=>{ const ks = Object.keys(ITEMS).filter(k=>ITEMS[k].cat===c.id).sort((x,y)=>(REW.firstWorld(x)-REW.firstWorld(y)) || (ITEMS[x].rarity-ITEMS[y].rarity)); const have = ks.filter(k=>st.inv[k]>0).length;
          return `<div class="zone"><div class="zone-t">${c.emoji} ${c.name} <span class="muted px" style="font-size:13px">${have}/${ks.length}</span></div><div class="inv">${ks.map(k=>{ const it = ITEMS[k]; const n = st.inv[k]||0;
          return `<div class="slotinv ${n?'':'none'} ${it.cat==='pet'?'pet':''}"><span class="cnt">${n>1?'×'+n:''}</span><span class="${n?'':'sil'}">${itemArt(k,64)}</span><span class="nm">${n?esc(it.name):'???'}</span><span class="rar">${'<i></i>'.repeat(it.rarity)}</span></div>`; }).join('')}</div></div>`; }).join('')}</div>
    </div></div>`);
  wireBack(el); wireShelf(el);
  el.querySelectorAll('.trk').forEach(b=>b.onclick=()=>{ A.sfx('tap'); if (b.dataset.to==='library') store.set('libTab', String(currentGrade())); go(b.dataset.to); });
}

// ---------------- story scrolls & 학년별 읽기 책: bookshelf & reader ----------------
const anyStory = id => storyById(id) || readerById(id);
const isReader = s => !!s.g;
const canRead = s => isReader(s) ? readerUnlocked(s) : storyUnlocked(s);
const GRADE_BIOME = {3:'cherry', 4:'desert', 5:'snow', 6:'sky'};
function shelfHTML(tab='phonics'){
  const st = S();
  if (tab !== 'phonics'){ const g = +tab;
    return `<div class="shelf">${gradeReaders(g).map(r=>{ const open = readerUnlocked(r); const read = st.stories[r.id]?.n || 0; const L = talkById(r.after); const li = gradeLessons(g).indexOf(L);
      return `<button class="bookc biome-${GRADE_BIOME[g]} ${open?'':'locked'} ${open&&!read?'new':''}" data-s="${r.id}">
        <span class="bcover">${open ? `<img src="${emojiSrc(r.cover)}" alt="">` : '🔒'}</span>
        <span class="btitle en">${open ? esc(r.title) : '???'}</span><span class="bko">${open ? esc(r.ko) : `${g}학년 Lesson ${li+1} 다음`}</span>
        ${read ? `<span class="bread">✔ ${read}번${st.stories[r.id]?.q ? ' · ⭐'+st.stories[r.id].q : ''}</span>` : open ? '<span class="bread nw">NEW</span>' : ''}</button>`; }).join('')}</div>`;
  }
  return `<div class="shelf">${STORIES.map(s=>{ const open = storyUnlocked(s); const read = st.stories[s.id]?.n || 0; const w = WORLDS.find(x=>x.id===s.world); const u = unitOf(s.unlock);
    return `<button class="bookc biome-${w.biome} ${open?'':'locked'} ${open&&!read?'new':''}" data-s="${s.id}">
      <span class="bcover">${open ? `<img src="${emojiSrc(s.cover)}" alt="">` : '🔒'}</span>
      <span class="btitle en">${open ? esc(s.title) : '???'}</span><span class="bko">${open ? esc(s.ko) : `${u.book}권 ${u.unit}단원 보스`}</span>
      ${read ? `<span class="bread">✔ ${read}번</span>` : open ? '<span class="bread nw">NEW</span>' : ''}</button>`; }).join('')}</div>`;
}
function wireShelf(el){
  el.querySelectorAll('.bookc').forEach(b=>b.onclick=()=>{ A.sfx('tap'); const s = anyStory(b.dataset.s);
    if (b.classList.contains('locked')){ if (isReader(s)){ const li = gradeLessons(s.g).findIndex(t=>t.id===s.after); toast(`학교 영어 ${s.g}학년 Lesson ${li+1}을 끝내면 열려요! 🔒`); } else { const u = unitOf(s.unlock); toast(`${u.book}권 ${u.unit}단원 보스를 깨면 열려요! 🔒`); } return; }
    go('story/'+b.dataset.s); });
}
const LIB_TABS = ['phonics', '3', '4', '5', '6'];
function libTabLabel(t){ return t==='phonics' ? '<span class="tic">📜 </span>파닉스' : `${t}학년`; }
function library(){
  const st = S(); let tab = LIB_TABS.includes(String(st.libTab)) ? String(st.libTab) : 'phonics';
  const list = tab==='phonics' ? STORIES : gradeReaders(+tab); const can = tab==='phonics' ? storyUnlocked : readerUnlocked;
  const nRead = list.filter(s=>st.stories[s.id]?.n).length; const nOpen = list.filter(can).length;
  const newIn = t => (t==='phonics' ? STORIES.filter(storyUnlocked) : gradeReaders(+t).filter(readerUnlocked)).some(s=>!st.stories[s.id]?.n);
  const el = screen('', `<div class="topbar">${backBtn()}<h2 style="margin:0;font-size:26px">📚 책장</h2><div class="spacer"></div><span class="chip px">${nRead}/${list.length}</span></div>
    <div class="scroll"><div style="max-width:980px;margin:0 auto;display:flex;flex-direction:column;gap:16px">
      <div class="gtabs">${LIB_TABS.map(t=>`<button class="gtab g${t} ${t===tab?'on':''} ${newIn(t)?'has-new':''}" data-t="${t}">${libTabLabel(t)}</button>`).join('')}</div>
      <div class="card" style="display:flex;gap:14px;align-items:center">${block('power',{size:60,face:true})}<div style="font-size:18px;line-height:1.5">
        ${tab==='phonics' ? '보스 미션을 깨면 <b>배운 소리로만</b> 읽을 수 있는 이야기 책이 열려요!' : `학교 영어 <b>${tab}학년</b> 대화를 끝내면 그 표현으로 쓴 책이 열려요. 다 읽으면 퀴즈도 있어요!`}<br><span class="muted" style="font-size:15px">열린 책 ${nOpen}권 · 다 읽은 책 ${nRead}권 · 모르는 단어는 눌러서 들어 봐요.</span></div></div>
      ${shelfHTML(tab)}</div></div>`);
  wireBack(el); wireShelf(el);
  el.querySelectorAll('.gtab').forEach(b=>b.onclick=()=>{ A.sfx('tap'); store.set('libTab', b.dataset.t); library(); });
}
const pagePic = p => p==='cubi' ? `<span class="ppic">${block('power',{size:120,face:true})}</span>` : p==='hero' ? `<span class="ppic">${hero(S().suit.length?S().suit:['helmet','cape'], S().color, 130)}</span>` : `<img class="ppic" src="${emojiSrc(p)}" alt="">`;
// glossed words (not taught yet) get a small Korean hint under them
function glossTokens(text, gloss){
  const toks = storyTokens(text); if (!gloss) return toks;
  const keys = Object.keys(gloss).map(k=>[k, k.toLowerCase().split(' ').map(w=>w.replace(/[^a-z]/g,''))]);
  for (let i=0; i<toks.length; i++) for (const [k, parts] of keys){
    if (parts.every((p,j)=>toks[i+j] && (toks[i+j].word===p || toks[i+j].word===p+'s' || toks[i+j].word===p+'es'))){ toks[i].ko = gloss[k]; for (let j=0;j<parts.length;j++) toks[i+j].gl = true; }
  }
  return toks;
}
const swHTML = toks => toks.map(t=>`<button class="sw ${t.gl?'gl':''}" data-w="${esc(t.word||'')}">${esc(t.text)}${t.ko?`<small class="glk">${esc(t.ko)}</small>`:''}</button>`).join('');
function storyReader(id){
  const st = anyStory(id); if (!st || !canRead(st)) return library();
  const rd = isReader(st);
  let pg = -1; let reading = 0;
  const el = screen('reader', `<div class="topbar"><button class="iconbtn back" aria-label="책장">⬅</button><div class="rtitle en">${esc(st.title)}</div><div class="spacer"></div>
      <div class="dots ${st.pages.length>8?'many':''}">${st.pages.map(()=>'<i></i>').join('')}</div></div>
    <div class="book-stage"><div class="page"></div></div>
    <div class="reader-bar"><button class="btn ghost small prev" aria-label="이전 쪽">◀</button><button class="btn blue small readme">🔊 읽어 줘</button><button class="btn hero small nextp">다음 ▶</button></div>`);
  const toShelf = () => { store.set('libTab', rd ? String(st.g) : 'phonics'); go('library'); };
  el.querySelector('.back').onclick = ()=>{ A.stop(); A.sfx('tap'); toShelf(); };
  const page = el.querySelector('.page'), dots = [...el.querySelectorAll('.dots i')];
  const prev = el.querySelector('.prev'), nextB = el.querySelector('.nextp'), readme = el.querySelector('.readme');
  const stopHi = () => { reading++; page.querySelectorAll('.sw').forEach(w=>w.classList.remove('lit')); };
  const text = () => pg < 0 ? st.title : st.pages[pg].t;
  const readAloud = async () => {
    stopHi(); const my = reading; const words = [...page.querySelectorAll('.sw')]; const tm = (await A.storyTimings())[text()];
    let t0 = null;
    const p = A.play('st', text(), {onstart:(t)=>{ t0 = t; }});
    if (tm && tm.length === words.length){
      const tick = () => { if (my !== reading) return; if (t0 !== null){ const t = A.now() - t0; words.forEach((w,i)=>w.classList.toggle('lit', t >= tm[i][0]-0.03 && t < (tm[i+1] ? tm[i+1][0]-0.03 : tm[i][1]+0.25))); }
        if (A.audioState.playing || t0 === null) requestAnimationFrame(tick); else words.forEach(w=>w.classList.remove('lit')); };
      requestAnimationFrame(tick);
    }
    await p; if (my === reading) words.forEach(w=>w.classList.remove('lit'));
  };
  const render = () => {
    stopHi(); A.stop();
    dots.forEach((d,i)=>{ d.classList.toggle('on', i<=pg); });
    if (pg < 0){
      page.innerHTML = `<div class="cover-page"><img class="ppic big" src="${emojiSrc(st.cover)}" alt=""><div class="sentence story-text title">${swHTML(storyTokens(st.title))}</div>
        <div class="muted" style="font-size:20px">${esc(st.ko)}${rd ? ` · ${st.g}학년` : ''}</div><div class="cast">${pagePic('hero')}${pagePic('cubi')}</div></div>`;
    } else {
      const p = st.pages[pg]; const long = p.t.length > 46;
      page.innerHTML = `<div class="pics">${p.pic.map(pagePic).join('')}</div><div class="sentence story-text ${long?'long':''}">${swHTML(rd ? glossTokens(p.t, st.gloss) : storyTokens(p.t))}</div><div class="pno px">${pg+1} / ${st.pages.length}</div>`;
    }
    page.classList.remove('turn'); void page.offsetWidth; page.classList.add('turn');
    page.querySelectorAll('.sw').forEach(b=>b.onclick = async ()=>{ const w = b.dataset.w; if (!w) return; stopHi(); b.classList.add('lit'); await A.play('w', w); b.classList.remove('lit'); });
    prev.disabled = pg < 0; prev.style.visibility = pg < 0 ? 'hidden' : '';
    nextB.textContent = pg < 0 ? '읽기 시작 ▶' : pg === st.pages.length-1 ? (rd && st.quiz ? '퀴즈 풀기 ▶' : '다 읽었어! ✔') : '다음 ▶';
    nextB.classList.toggle('done', pg === st.pages.length-1);
    if (pg >= 0) setTimeout(()=>{ if (A.audioState.playing) return; readAloud(); }, 450);
  };
  const finishBook = (score=null) => {
    const first = store.storyRead(st.id); let gift = null;
    if (score !== null) store.storyQuiz(st.id, score);
    if (first){ store.addXP(rd ? 20 : 15); A.sfx('level'); if (rd){ gift = REW.readerReward(st.g, S().inv); if (gift) store.addBlock(gift); } } else A.sfx('ok');
    const nq = st.quiz?.length || 0;
    const bg = h(`<div class="sheet-bg"><div class="sheet" style="text-align:center"><div style="font-size:70px">${rd ? '📗✨' : '📜✨'}</div><h3 class="en" style="margin:6px 0">${esc(st.title)}</h3>
      ${score !== null ? `<p style="font-size:22px;margin:4px 0">퀴즈 ${'⭐'.repeat(score)}${'☆'.repeat(nq-score)} <b>${score}/${nq}</b></p>` : ''}
      <p style="font-size:20px;margin:6px 0">${first ? `끝까지 다 읽었어! 책장에 꽂아 둘게. <b>+${rd?20:15} XP</b>` : '또 읽었구나! 읽을수록 술술 읽혀요.'}</p>
      ${gift ? `<div class="bonus-card" style="justify-content:center">${itemArt(gift,64)}<div><div style="color:var(--gold)">읽기 선물!</div><div style="font-size:22px">${esc(itemName(gift))}</div></div></div>` : ''}
      <div style="display:flex;gap:12px;justify-content:center;margin-top:10px"><button class="btn ghost small again">다시 읽기</button><button class="btn hero small shelfb">📚 책장으로</button></div></div></div>`);
    document.body.append(bg); A.play('ko','story_done');
    bg.querySelector('.again').onclick = ()=>{ bg.remove(); pg = -1; render(); };
    bg.querySelector('.shelfb').onclick = ()=>{ bg.remove(); toShelf(); };
  };
  // comprehension quiz after a graded reader: one question at a time, tap the answer (no penalty, 2nd try allowed)
  const quiz = () => {
    let qi = 0, score = 0;
    const bg = h(`<div class="sheet-bg"><div class="sheet quiz-sheet"></div></div>`); document.body.append(bg); const sh = bg.querySelector('.sheet');
    const show = () => {
      const q = st.quiz[qi]; const opts = shuffle(q.opts.map((o,i)=>({o, ok:i===q.a}))); let miss = 0;
      sh.innerHTML = `<div class="qhead"><span class="chip px">Q ${qi+1}/${st.quiz.length}</span>${block('power',{size:44,face:true})}</div>
        <button class="qq en">${esc(q.q)} <span class="spk">🔊</span></button><div class="optlist">${opts.map((x,i)=>`<button class="optline" data-i="${i}">${esc(x.o)}</button>`).join('')}</div>`;
      const say = () => A.play('tk', q.q); sh.querySelector('.qq').onclick = say; setTimeout(say, qi ? 250 : 600);
      sh.querySelectorAll('.optline').forEach(b=>b.onclick = async ()=>{ const x = opts[+b.dataset.i];
        if (x.ok){ if (!miss) score++; b.classList.add('ok'); A.sfx('ok'); sh.querySelectorAll('.optline').forEach(o=>o.style.pointerEvents='none'); await new Promise(r=>setTimeout(r, 900));
          qi++; if (qi < st.quiz.length) show(); else { bg.remove(); finishBook(score); } }
        else { miss++; b.classList.add('no'); A.sfx('no'); if (miss >= 2) sh.querySelectorAll('.optline').forEach((o,i)=>{ if (opts[i].ok) o.classList.add('hint'); }); } });
    };
    show(); if (!S().settings.calm) A.play('ko','quiz_start');
  };
  prev.onclick = ()=>{ if (pg > -1){ pg--; A.sfx('tap'); render(); } };
  readme.onclick = ()=>{ A.unlock(); readAloud(); };
  nextB.onclick = ()=>{ A.unlock(); A.sfx('tap');
    if (pg < st.pages.length-1){ pg++; render(); return; }
    stopHi(); A.stop(); if (rd && st.quiz?.length) quiz(); else finishBook();
  };
  render(); setTimeout(()=>A.play('ko','story_start'), 250);
}

// ---------------- 학교 영어 corner (3–6학년 tabs) ----------------
function gradeTabs(cur, cls='gtab'){ return `<div class="gtabs">${GRADES.map(g=>{ const o = gradeOpen(g); const ts = talkState(g);
  return `<button class="${cls} g${g} ${g===cur?'on':''} ${o?'':'locked'}" data-g="${g}">${o?'':'🔒 '}${g}학년 <small class="px">${ts.done}/${ts.total}</small></button>`; }).join('')}</div>`; }
function lockedGradeToast(g){ toast(`${g-1}학년 대화를 모두 끝내면 열려요! (보호자 화면에서도 열 수 있어요) 🔒`); }
function talkCorner(){
  const st = S(); const g = currentGrade(); const ts = talkState(g); const L = gradeLessons(g);
  const intro = {3:'인사, 기분, 숫자, 색깔, 좋아하는 것, 할 수 있는 것… 3학년 교실 표현', 4:'시간, 요일, 장소, 가격, 하고 있는 일… 4학년 교실 표현',
    5:'과거에 한 일, 계획, 길 찾기, 이유 말하기… 5학년 표현 + 짧은 글 읽기·문장 만들기', 6:'비교, 의견, 미래의 꿈, 제안하기… 6학년 표현 + 글 읽기·문장 만들기·철자'}[g];
  const el = screen('', `<div class="topbar">${backBtn()}<h2 style="margin:0;font-size:26px">🗣️ 학교 영어</h2><div class="spacer"></div><span class="chip px">${ts.done}/${ts.total}</span></div>
    <div class="scroll"><div style="max-width:980px;margin:0 auto;display:flex;flex-direction:column;gap:16px">
      ${gradeTabs(g)}
      <div class="card" style="display:flex;gap:14px;align-items:center">${block('power',{size:60,face:true})}<div style="font-size:18px;line-height:1.5">
        <b>${g}학년</b> · ${intro}<br><span class="muted" style="font-size:15px">${g===3 ? '새 대화는 하루에 하나, 또는 파닉스 미션을 1개 할 때마다 열려요. 짝수 레슨을 처음 깨면 💿 말하기 디스크!' : '한 대화를 끝내면 다음 대화가 열려요. 5개마다 특별한 보물, 학년을 다 끝내면 🏅 배지와 펫 친구!'}</span></div></div>
      ${ts.waiting ? `<div class="card wait-note">⏳ 다음 대화는 <b>파닉스 미션 1개</b>를 하거나 <b>내일</b> 열려요. 그동안 끝낸 대화를 복습해도 좋아요!</div>` : ''}
      <div class="lessons">${L.map((T,i)=>{ const done = st.talk[T.id]?.n; const open = talkOpen(g, i); const mark = g===3 ? (i%2===1 && i<18 ? '💿' : '') : (i%5===4 ? '🎁' : '');
        return `<button class="lesson ${done?'done':''} ${open?'':'locked'} ${open&&!done?'now':''}" data-i="${i}"><span class="ln px">${done?'✓':i+1}</span><span class="lsc">${open ? (T.scene.startsWith('#')?'🔢':`<img src="${emojiSrc(T.scene)}" alt="">`) : '🔒'}</span>
          <span class="ltx"><span class="lko">${esc(T.ko)}</span><span class="len en">${open ? esc(T.lines[0][1]) : esc(T.fn)}</span></span>${mark ? `<span class="ldisc">${mark}</span>`:''}</button>`; }).join('')}</div>
      <div class="tracks"><button class="trk" data-to="library" data-tab="${g}">📗 ${g}학년 읽기 책 <b class="px">${gradeReaders(g).filter(r=>st.stories[r.id]?.n).length}/${gradeReaders(g).length}</b></button>
        <button class="trk" data-to="dex" data-g="${g}">🔤 ${g}학년 단어 도감</button></div>
    </div></div>`);
  wireBack(el);
  el.querySelectorAll('.gtab').forEach(b=>b.onclick=()=>{ A.sfx('tap'); const gg = +b.dataset.g; if (!gradeOpen(gg)) return lockedGradeToast(gg); store.set('talkTab', gg); talkCorner(); });
  el.querySelectorAll('.trk').forEach(b=>b.onclick=()=>{ A.sfx('tap'); if (b.dataset.tab) store.set('libTab', b.dataset.tab); if (b.dataset.g) store.set('dexTab', +b.dataset.g); go(b.dataset.to); });
  el.querySelectorAll('.lesson').forEach(b=>b.onclick=()=>{ A.unlock(); A.sfx('tap'); if (b.classList.contains('locked')){ toast(ts.waiting ? '파닉스 미션 1개 하면 열려요! (또는 내일)' : '앞 대화를 먼저 해 봐요!'); return; } startTalk(L[+b.dataset.i].id); });
  const cur = el.querySelector('.lesson.now'); if (cur) setTimeout(()=>cur.scrollIntoView({block:'center', behavior:'smooth'}), 200);
  A.play('ko','talk_home');
}

// ---------------- 단어 도감: every word from finished 학교 영어 lessons, by grade and topic ----------------
function wordDex(){
  const st = S(); const own = dexOwned(); let g = GRADES.includes(st.dexTab) ? st.dexTab : currentGrade();
  const all = [...DEX.values()]; const words = all.filter(w=>w.g===g);
  const topics = [...new Set(words.map(w=>w.topic))];
  const next = GEMS.find(x=>!st.inv[x[0]]);
  const el = screen('', `<div class="topbar">${backBtn()}<h2 style="margin:0;font-size:26px">🔤 단어 도감</h2><div class="spacer"></div><span class="chip px">${own.size}/${DEX.size}</span></div>
    <div class="scroll"><div style="max-width:980px;margin:0 auto;display:flex;flex-direction:column;gap:16px">
      <div class="gtabs">${GRADES.map(x=>`<button class="gtab g${x} ${x===g?'on':''}" data-g="${x}">${x}학년 <small class="px">${all.filter(w=>w.g===x && own.has(w.en.toLowerCase())).length}/${all.filter(w=>w.g===x).length}</small></button>`).join('')}</div>
      <div class="card gemrow"><div style="font-size:17px;line-height:1.5">학교 영어 대화를 끝내면 그 단어가 도감에 모여요. 카드를 누르면 소리가 나요!<br>
        <span class="muted" style="font-size:15px">${next ? `💎 다음 단어 보석: 단어 <b>${next[2]}</b>개 모으면 <b>${esc(itemName(next[0]))}</b> (지금 ${own.size}개)` : '💎 단어 보석을 모두 모았어요!'}</span></div>
        <div class="gems">${GEMS.map(x=>`<span class="${st.inv[x[0]]?'':'sil'}" title="${x[2]}">${itemArt(x[0],40)}</span>`).join('')}</div></div>
      ${topics.map(tp=>{ const ws = words.filter(w=>w.topic===tp); const have = ws.filter(w=>own.has(w.en.toLowerCase())).length;
        return `<div class="card"><div class="zone-t">${esc(tp)} <span class="muted px" style="font-size:13px">${have}/${ws.length}</span></div><div class="dexgrid">${ws.map(w=>{ const o = own.has(w.en.toLowerCase());
          return `<button class="dcard ${o?'':'none'}" data-w="${esc(w.en.toLowerCase())}">${o ? (w.pic.startsWith('#') ? `<span class="dnum px">${esc(w.pic.slice(1))}</span>` : `<img src="${emojiSrc(w.pic)}" alt="">`) : '<span class="dq">?</span>'}<span class="den en">${o ? esc(w.en) : '???'}</span><span class="dko">${o ? esc(w.ko) : ''}</span></button>`; }).join('')}</div></div>`; }).join('')}
    </div></div>`);
  wireBack(el);
  el.querySelectorAll('.gtab').forEach(b=>b.onclick=()=>{ A.sfx('tap'); store.set('dexTab', +b.dataset.g); wordDex(); });
  el.querySelectorAll('.dcard').forEach(b=>b.onclick=async ()=>{ A.unlock(); if (b.classList.contains('none')){ A.sfx('tap'); const w = DEX.get(b.dataset.w); const L = talkById(w.lesson); toast(`${L.g}학년 「${L.ko}」 대화를 끝내면 모여요!`); return; }
    b.classList.add('lit'); await A.play('w', b.dataset.w); b.classList.remove('lit'); });
  if (!S().settings.calm) A.play('ko','dex_home');
}

// ---------------- parent gate & dashboard ----------------
function parentGate(){
  const a = 3+Math.floor(Math.random()*7), b = 3+Math.floor(Math.random()*7); let ans = '';
  const el = screen('', `<div class="topbar">${backBtn()}</div><div class="gate card">
    <div style="font-size:44px">🔒</div><h2 style="margin:0">보호자 확인</h2><div class="muted">어른만 풀 수 있는 문제예요</div>
    <div class="q">${a} × ${b} = ?</div><div class="ans px">&nbsp;</div>
    <div class="keypad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div></div>`);
  wireBack(el);
  const out = el.querySelector('.ans');
  el.querySelectorAll('.keypad button').forEach(btn=>btn.onclick=()=>{ const k = btn.dataset.k;
    if (k==='⌫') ans = ans.slice(0,-1); else if (k==='OK'){ if (+ans === a*b) return parentDash(); out.animate([{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'none'}],{duration:300}); ans=''; }
    else if (ans.length<3) ans += k; out.innerHTML = ans || '&nbsp;'; });
}
function parentDash(){
  const st = S(); const totalSecs = Object.values(st.days).reduce((a,b)=>a+b,0);
  const last7 = [...Array(7)].map((_,i)=>{ const d = new Date(); d.setDate(d.getDate()-6+i); const k = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); return {k, d, v: st.days[k]||0}; });
  const maxV = Math.max(300, ...last7.map(x=>x.v));
  const missItems = Object.entries(st.items).filter(([k,v])=>v.wrong>0).sort((a,b)=>(b[1].wrong-b[1].right*0.3)-(a[1].wrong-a[1].right*0.3)).slice(0,12);
  const confs = Object.entries(st.conf).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const label = k => { const [t,v] = [k.slice(0,1), k.slice(2)]; return t==='g' ? `소리 ${v}` : t==='l' ? `소문자 ${v}` : t==='s' ? `사이트워드` : t==='t' ? '문장' : '단어'; };
  const val = k => k.slice(2).replace(/2$/,'');
  const el = screen('', `<div class="topbar">${backBtn()}<h2 style="margin:0;font-size:26px">👨‍👩‍👦 보호자 화면</h2><div class="spacer"></div></div>
    <div class="scroll"><div class="parent" style="display:flex;flex-direction:column;gap:16px">
      <div class="pgrid">
        <div class="kpi"><b>${Math.round(totalSecs/60)}분</b><span>총 학습 시간</span></div>
        <div class="kpi"><b>${st.streak.count}일</b><span>연속 학습</span></div>
        <div class="kpi"><b>${st.missionCount}</b><span>완료한 미션</span></div>
        <div class="kpi"><b>LV ${store.levelInfo().lv}</b><span>${st.xp} XP</span></div></div>
      <div class="card"><h3 class="panel-title">최근 7일</h3><div style="display:flex;gap:10px;align-items:flex-end;height:120px">${last7.map(x=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
        <div style="width:100%;max-width:42px;height:${Math.max(4,Math.round(x.v/maxV*90))}px;background:${x.v?'var(--emerald)':'#e3e8f0'};border-radius:8px"></div><span class="muted" style="font-size:13px">${'일월화수목금토'[x.d.getDay()]}</span><span style="font-size:12px">${Math.round(x.v/60)}분</span></div>`).join('')}</div></div>
      <div class="card"><h3 class="panel-title">함께 하는 두 트랙 · 이야기 책 & 학교 영어</h3>
        <div class="pgrid" style="margin-bottom:10px"><div class="kpi"><b>${STORIES.filter(s=>st.stories[s.id]?.n).length}/${STORIES.length}</b><span>읽은 이야기 책 (열림 ${STORIES.filter(storyUnlocked).length})</span></div>
          <div class="kpi"><b>${TALK.filter(t=>st.talk[t.id]?.n).length}/${TALK.length}</b><span>끝낸 학교 영어 대화</span></div>
          <div class="kpi"><b>${READERS.filter(r=>st.stories[r.id]?.n).length}/${READERS.length}</b><span>읽은 학년별 읽기 책</span></div>
          <div class="kpi"><b>${dexOwned().size}/${DEX.size}</b><span>단어 도감</span></div></div>
        <table class="log gradetbl"><tr><th>학년</th><th>대화</th><th>읽기 책</th><th>퀴즈 ⭐</th><th>단어</th></tr>${GRADES.map(g=>{ const L = gradeLessons(g), R = gradeReaders(g), own = dexOwned(); const ws = [...DEX.values()].filter(w=>w.g===g);
          return `<tr><td>${g}학년 ${gradeOpen(g)?'':'🔒'}</td><td>${L.filter(t=>st.talk[t.id]?.n).length}/${L.length}</td><td>${R.filter(r=>st.stories[r.id]?.n).length}/${R.length}</td><td>${R.reduce((a,r)=>a+(st.stories[r.id]?.q||0),0)}/${R.reduce((a,r)=>a+r.quiz.length,0)}</td><td>${ws.filter(w=>own.has(w.en.toLowerCase())).length}/${ws.length}</td></tr>`; }).join('')}</table>
        <ul class="tips">
          <li><b>📚 이야기 책 (디코더블 북)</b>: 단원 보스를 깨면 열리는 4–6쪽 짜리 이야기예요. 그때까지 배운 파닉스 규칙 + 몇 개의 사이트워드(a, the, is, I, to, and …)로만 쓰여 있어서 아이가 <b>혼자 소리 내어 읽을 수 있어요</b>. 단어를 누르면 그 단어만, 🔊를 누르면 문장을 읽어 주며 읽는 단어에 불이 들어와요. 처음엔 아이가 먼저 읽고, 막히면 단어를 누르게 해 주세요.</li>
          <li><b>🗣️ 학교 영어 (2022 개정 교육과정 3–6학년)</b>: 3학년 22개, 4·5·6학년 각 20개 짧은 대화예요. 교과서의 의사소통 기능(인사·기분·시간·길 찾기·과거·계획·비교·의견 등)과 학년별 기본 어휘(교육부 기본 어휘 목록 기준 90% 이상)로 직접 쓴 대화예요. 듣기 → 표현 익히기 → 듣고 고르기 → 알맞은 대답 고르기 순서로 3–5분 걸리고, <b>5·6학년</b>은 짧은 글 읽기, 낱말 카드로 문장 만들기, 글자 카드로 철자 맞히기(키보드 없음)가 더해져요. <b>대화를 들은 뒤 큰 소리로 따라 말하게</b> 해 주세요.</li>
          <li><b>📗 학년별 읽기 책</b>: 학년마다 8권(3학년 6–8쪽, 5·6학년 10–12쪽). 해당 대화를 끝내면 열리고, 다 읽으면 내용 확인 퀴즈 2–3문제가 나와요. 아직 안 배운 단어는 글자 아래에 작은 한국어 뜻이 붙어 있어요.</li>
          <li><b>🔤 단어 도감</b>: 끝낸 대화의 단어가 학년·주제별로 모여요(전체 ${DEX.size}개). 25·75·150·250·375·500개마다 💎 단어 보석을 받아요.</li>
          <li>3학년은 파닉스 진도와 상관없이 열려 있고, <b>새 대화는 하루 1개 또는 파닉스 미션 1개를 할 때마다</b> 열려요(두 트랙 번갈아 하기). 4학년부터는 앞 대화를 끝내면 바로 다음 대화가 열려요. 다음 학년은 앞 학년을 다 끝내거나 아래 <b>학교 영어 학년</b> 설정으로 열 수 있어요.</li>
        </ul></div>
      <div class="card"><h3 class="panel-title">교재 진도 (Phonics Works 1–4)</h3>
        ${[1,2,3,4].map(bk=>`<div class="book"><h4>📘 ${bk}권 · ${['알파벳 & 단모음','장모음 & 이중자음','이중글자 & 여러 모음','사이트워드 100'][bk-1]}</h4><div class="ulist">${UNITS.filter(u=>u.book===bk).map(u=>{ const m = store.mastery(unitItems(u)); const sc = store.stars(u.id);
          return `<div class="urow"><div><span class="en">${esc(u.type==='sight'? u.sight.slice(0,3).join(' ') : u.title)}</span> <span class="muted" style="font-size:12px">${u.unit}단원</span></div><div class="muted" style="font-size:12px">미션 ${sc}/3 · 숙달 ${Math.round(m*100)}%</div><div class="bar"><i style="width:${Math.round(m*100)}%"></i></div></div>`; }).join('')}</div></div>`).join('')}</div>
      <div class="card"><h3 class="panel-title">자주 틀리는 소리 · 글자</h3>
        ${missItems.length ? `<div class="misslist">${missItems.map(([k,v])=>`<div class="miss"><span class="en">${esc(val(k))}</span> <span class="muted" style="font-size:13px">${label(k)} · 틀림 ${v.wrong} / 맞힘 ${v.right}</span></div>`).join('')}</div>` : '<p class="muted">아직 기록이 없어요. 미션을 하면 여기에 쌓여요.</p>'}
        ${confs.length ? `<h4 style="margin:16px 0 8px">헷갈린 짝 (정답 → 고른 답)</h4><div class="misslist">${confs.map(([k,v])=>`<div class="miss"><span class="en">${esc(k.replace('>',' → '))}</span> <span class="muted" style="font-size:13px">${v}회</span></div>`).join('')}</div>`:''}
        <p class="muted" style="font-size:15px">💡 b↔d, p↔q 같은 짝이 자주 보이면 <b>글자 훈련소</b>를 하루 1회 권해 주세요.</p></div>
      <div class="card"><h3 class="panel-title">최근 학습 기록</h3>${st.sessions.length ? `<table class="log"><tr><th>날짜</th><th>미션</th><th>정답</th><th>시간</th></tr>${st.sessions.slice(0,15).map(s=>{ const d = new Date(s.d);
        return `<tr><td>${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</td><td class="en" style="font-weight:400">${esc(s.title)}</td><td>${s.correct}/${s.total}</td><td>${Math.max(1,Math.round(s.secs/60))}분</td></tr>`; }).join('')}</table>` : '<p class="muted">아직 기록이 없어요.</p>'}</div>
      <div class="card"><h3 class="panel-title">설정</h3>
        <div class="setrow"><div>아이 이름</div><input class="input nm" maxlength="10" style="max-width:200px;font-size:20px;padding:8px" value="${esc(st.name)}"></div>
        <div class="setrow"><div>히어로 색깔</div><div class="colors small">${Object.entries(HERO_COLORS).map(([k,v])=>`<button data-c="${k}" class="${k===st.color?'sel':''}" style="background:${v}" aria-label="${k}"></button>`).join('')}</div></div>
        <div class="setrow"><div>시작 단원<small>지금 교재에서 공부 중인 단원을 고르면 그 단원까지 열려요</small></div><select class="sel start">${startOptions(st.settings.start)}</select></div>
        <div class="setrow"><div>학교 영어 학년<small>이 학년까지 바로 열려요. 순서대로 하는 걸 추천해요</small></div><select class="sel grade">${GRADES.map(g=>`<option value="${g}" ${(st.settings.grade||3)===g?'selected':''}>${g===3?'3학년 (기본)':`${g}학년까지 열기`}</option>`).join('')}</select></div>
        ${toggleRow('unlockAll','모든 단원 열기','파닉스 단원·학교 영어 대화·책을 순서와 상관없이 모두 열어요')}
        ${toggleRow('calm','차분 모드','움직임·반짝임을 줄여요 (집중이 흐트러질 때 추천)')}
        ${toggleRow('ko','한국어 음성 안내','활동 설명을 한국어 목소리로 들려줘요 (활동마다 처음 1번)')}
        ${toggleRow('sfx','효과음','정답·블록 효과음')}
        <div class="setrow"><div>미션 길이<small>집중 시간이 짧은 날엔 '짧게'</small></div><select class="sel len"><option value="short" ${st.settings.len==='short'?'selected':''}>짧게 (약 2분)</option><option value="normal" ${st.settings.len!=='short'?'selected':''}>보통 (약 3–4분)</option></select></div>
        <div class="setrow"><div>데이터<small>다른 기기로 옮기거나 백업할 때</small></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="btn ghost small exp">내보내기</button><button class="btn ghost small imp">가져오기</button><button class="btn hero small rst">초기화</button></div></div>
      </div>
      <div class="card"><h3 class="panel-title">이렇게 도와주세요 (ADHD·느린 학습자 맞춤)</h3><ul class="tips">
        <li><b>하루 1–2개 미션(3–5분)</b>이면 충분해요. 짧게 자주가 길게 한 번보다 효과적이에요.</li>
        <li>정답보다 <b>시도</b>를 칭찬해 주세요. 앱도 틀린 소리를 내지 않고, 두 번째엔 힌트를 줘요.</li>
        <li>블렌딩 활동에서는 아이가 <b>소리를 소리 내어 따라 말하게</b> 해 주세요 (c-a-t → cat).</li>
        <li>b/d가 헷갈리면 <b>bed 트릭</b>: 두 손 엄지척, 주먹끼리 마주 보게 → <b>왼손 = b, 오른손 = d</b>. 실제로 함께 해 보세요.</li>
        <li>교재 진도와 맞추려면 위 <b>시작 단원</b>을 지금 단원으로 설정하세요. 앱 순서는 Phonics Works 1–4와 같아요.</li></ul></div>
      <div class="foot">블록 히어로 파닉스 · 비영리 가족 학습용 · 음성: ElevenLabs로 미리 생성<br>그림: <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noopener">Twemoji</a> (CC-BY 4.0) · 블록·히어로 그래픽은 직접 그린 오리지널이에요.<br>
        이 앱은 특정 게임·영화·출판사와 관계가 없어요. 커리큘럼 순서만 Phonics Works 시리즈를 참고했어요.</div>
    </div></div>`);
  wireBack(el);
  el.querySelectorAll('.toggle').forEach(t=>t.onclick=()=>{ const k = t.dataset.k; const v = !S().settings[k]; store.setSetting(k, v); t.classList.toggle('on', v); applySettings(); });
  el.querySelector('.nm').onchange = e=>{ store.set('name', e.target.value.trim() || S().name); toast('이름을 바꿨어요'); };
  el.querySelectorAll('.colors.small button').forEach(b=>b.onclick=()=>{ store.set('color', b.dataset.c); applySettings(); el.querySelectorAll('.colors.small button').forEach(x=>x.classList.toggle('sel',x===b)); });
  el.querySelector('.start').onchange = e=>store.setSetting('start', e.target.value);
  el.querySelector('.len').onchange = e=>store.setSetting('len', e.target.value);
  el.querySelector('.grade').onchange = e=>{ store.setSetting('grade', +e.target.value); store.set('talkTab', null); toast(`학교 영어 ${e.target.value}학년까지 열었어요`); };
  el.querySelector('.exp').onclick = ()=>{ const blob = new Blob([JSON.stringify(S(),null,1)],{type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `block-hero-phonics-${store.dateKey()}.json`; a.click(); };
  el.querySelector('.imp').onclick = ()=>{ const i = document.createElement('input'); i.type='file'; i.accept='application/json'; i.onchange = async ()=>{ try { const ok = store.importData(JSON.parse(await i.files[0].text())); if (ok) migrateRewards(); toast(ok?'가져왔어요!':'파일을 읽을 수 없어요'); applySettings(); parentDash(); } catch(e){ toast('파일을 읽을 수 없어요'); } }; i.click(); };
  el.querySelector('.rst').onclick = ()=>{ if (confirm('모든 진도와 블록이 지워져요. 정말 초기화할까요?')){ store.reset(); applySettings(); go(''); } };
}
function toggleRow(k, title, sub){ return `<div class="setrow"><div>${title}<small>${sub}</small></div><button class="toggle ${S().settings[k]?'on':''}" data-k="${k}" aria-label="${title}"></button></div>`; }

boot();
