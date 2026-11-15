// Block Hero Phonics — app shell, screens & mission runner
import { UNITS, WORLDS, CONFUSIONS, KO, LETTERS } from './data.js';
import * as A from './audio.js';
import * as store from './store.js';
import { block, hero, icon, cloud, BLOCKS, SUIT_ORDER, SUIT_NAMES, HERO_COLORS } from './sprites.js';
import { buildMission, buildTrainer, MISSION_NAMES, MISSION_DESC, unitIndex, unitItems } from './missions.js';
import { RENDER, PROMPT_KEY, h, praise } from './activities.js';
import { emojiSrc } from './emoji.js';
import * as REW from './rewards.js';
import { ITEMS, CATS, itemArt, itemName, chestArt, TOTAL, ownedCount } from './items.js';
import { initFit } from './fit.js';

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const S = () => store.state();
const unitOf = id => UNITS.find(u=>u.id===id);
const worldOf = uid => WORLDS.find(w=>w.units.includes(uid));
const BIOME_BLOCK = {grass:'grass', stone:'cobble', mine:'coal', jungle:'mossy', ocean:'prism', ancient:'deep', nether:'hellrock', end:'endstone'};
const unitLabel = u => u.type==='sight' ? `${u.book}권 ${u.unit}단원` : `${u.book}권 ${u.unit}단원`;

// ---------------- boot ----------------
async function boot(){
  initFit();
  migrateRewards(); applySettings(); scenery();
  await A.initAudio();
  document.addEventListener('pointerdown', A.unlock, {once:false, passive:true});
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
          <button class="qbtn" data-go="inv">${icon('chest',54)}인벤토리</button>
        </div></div>
    </div></div>`);
  el.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ A.sfx('tap'); go(b.dataset.go); });
  el.querySelector('.start').onclick = ()=>{ A.unlock(); startMission(nm.unit.id, nm.idx); };
  el.querySelectorAll('.edit-hero').forEach(b=>b.onclick=()=>{ A.sfx('tap'); editHero(home); });
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
  el.querySelector('.quit').onclick = () => confirmQuit(()=>{ cleanup(); A.stop(); go(meta.kind==='trainer'?'trainer':''); });
  mascot.onclick = () => { mascot.classList.remove('hop'); void mascot.offsetWidth; mascot.classList.add('hop'); A.sfx('tap'); };
  // preload audio for the mission
  const pre = []; steps.forEach(s=>{ if (s.word) pre.push(['w', s.word]); if (s.key) pre.push(['w', s.key]); if (s.text) pre.push(['s', s.text]); if (s.sound) pre.push(['p', s.sound]); (s.options||[]).forEach(o=>pre.push(['w',o])); });
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
      miss: (chosen, target) => { const tg = target || s.target || s.word; store.recordConfusion(String(tg).toLowerCase(), String(chosen).toLowerCase()); },
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
    let first = false, suit = null;
    if (meta.kind==='unit'){
      first = store.completeMission(meta.uid, meta.idx, acc);
      const w = worldOf(meta.uid);
      if (meta.idx===2 && w.units.every(store.unitDone) && store.addSuit(w.suit)) suit = w.suit;
    } else { const t = S().trainer; t[meta.conf] = (t[meta.conf]||0)+1; store.save(); }
    const wi = meta.uid ? REW.worldIndex(meta.uid) : progressWorld();
    const got = REW.pickReward(meta, acc, !!suit, wi, S().inv);
    const isNew = id => !(S().inv[id] > 0);
    const reward = got.main, rewardNew = isNew(reward); store.addBlock(reward);
    const bonus = got.bonus || null, bonusNew = bonus ? isNew(bonus) : false; if (bonus) store.addBlock(bonus);
    store.logSession({kind:meta.kind, unit:meta.uid||meta.conf, idx:meta.idx ?? null, title: u ? `${u.title} · ${MISSION_NAMES[meta.idx]}` : `훈련소 ${meta.conf}`, correct, total:scored, secs, xp});
    complete({meta, acc, xp, secs, reward, rewardNew, bonus, bonusNew, lvUp, suit});
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
function complete({meta, acc, xp, secs, reward, rewardNew, bonus, bonusNew, lvUp, suit}){
  const stars = acc>=0.8 ? 3 : acc>=0.5 ? 2 : 1; const nm = nextMission();
  const rest = store.todaySecs() > 15*60;
  const el = screen('complete', `<div class="scroll" style="display:flex;flex-direction:column;align-items:center;gap:16px;padding-top:10px">
    <h2>미션 완료!</h2>
    <div style="display:flex;gap:6px">${[0,1,2].map(i=>`<span style="opacity:${i<stars?1:.25}">${icon('star',46)}</span>`).join('')}</div>
    <button class="chest r${ITEMS[reward].rarity}" aria-label="상자 열기"><div class="rays"></div><div class="flash"></div><div class="box">${chestArt(170)}</div>
      <div class="reward">${itemArt(reward,150)}${rewardNew?'<span class="newb">NEW!</span>':''}</div><div class="sparks">${Array.from({length:14},(_,i)=>`<i style="--a:${i*360/14}deg;--d:${70+(i%3)*28}px"></i>`).join('')}</div></button>
    <div class="tap-hint muted">상자를 눌러 열어 봐!</div>
    <div class="reward-name chip hidden" style="font-size:22px">🎁 ${esc(itemName(reward))} 획득! <span class="rar">${'<i></i>'.repeat(ITEMS[reward].rarity)}</span></div>
    ${bonus ? `<div class="bonus-card hidden">${itemArt(bonus,96)}<div><div style="color:var(--gold)">월드 클리어 보너스! 새 펫 친구</div><div style="font-size:26px">${esc(itemName(bonus))}${bonusNew?' <span class="newb inl">NEW!</span>':''}</div></div></div>`:''}
    <div class="dex-line chip hidden">📖 도감 <b class="px">${ownedCount(S().inv)}/${TOTAL}</b></div>
    ${suit ? `<div class="suit-unlock">${hero(S().suit, S().color, 90)}<div><div style="color:var(--gold)">월드 클리어! 새 수트 파츠</div><div style="font-size:26px">${SUIT_NAMES[suit]} 장착!</div></div></div>`:''}
    ${lvUp ? `<div class="chip" style="font-size:22px;background:var(--gold)">⬆ 레벨 업! LV ${store.levelInfo().lv}</div>`:''}
    <div class="stats"><div class="stat"><b>+${xp}</b><span>XP</span></div><div class="stat"><b>${Math.round(acc*100)}%</b><span>정답률</span></div><div class="stat"><b>${Math.max(1,Math.round(secs/60))}분</b><span>시간</span></div></div>
    ${rest ? `<div class="card" style="font-size:19px;text-align:center">🏕️ 오늘 정말 많이 했어! 물 한 잔 마시고 쉬었다 하자.</div>`:''}
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
      <button class="btn ghost gohome">🏠 홈으로</button>
      ${meta.kind==='unit' ? `<button class="btn hero nextm">다음 미션 ▶</button>` : `<button class="btn hero again">한 번 더 ▶</button>`}
    </div></div>`);
  const chest = el.querySelector('.chest');
  const rare = ITEMS[reward].rarity >= 3;
  const knock = setInterval(()=>{ if (!chest.classList.contains('open')) A.sfx('knock'); }, 1400);
  const open = () => { if (chest.classList.contains('open')) return; clearInterval(knock); A.sfx('whoosh');
    chest.classList.add('opening');
    setTimeout(()=>{ chest.classList.add('open'); A.sfx(rare ? 'rare' : 'chest'); el.querySelector('.tap-hint')?.remove();
      el.querySelector('.reward-name').classList.remove('hidden'); el.querySelector('.dex-line').classList.remove('hidden');
      setTimeout(()=>A.play('x', ITEMS[reward].cat==='block' ? 'New block!' : 'New treasure!'), 600);
      const bc = el.querySelector('.bonus-card'); if (bc) setTimeout(()=>{ bc.classList.remove('hidden'); A.sfx('rare'); }, 1500);
      if (lvUp) setTimeout(()=>A.sfx('level'), bc ? 2600 : 1500); }, 350); };
  chest.onclick = open; setTimeout(open, 2600);
  A.seq([['x','Mission complete!'], 200]);
  el.querySelector(".gohome").onclick = ()=>go("");
  const nb = el.querySelector('.nextm'); if (nb) nb.onclick = ()=>startMission(nm.unit.id, nm.idx);
  const ab = el.querySelector('.again'); if (ab) ab.onclick = ()=>runMission(buildTrainer(meta.conf), meta);
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
      <div class="card"><div class="dex-head"><h3 class="panel-title" style="margin:0">📖 보물 도감</h3><span class="chip px">${ownedCount(st.inv)}/${TOTAL}</span></div>
        <div class="lvbar" style="margin:10px 0 4px"><i style="width:${Math.round(ownedCount(st.inv)/TOTAL*100)}%"></i></div>
        <p class="muted" style="margin:4px 0 6px;font-size:15px">초원에서 출발해 동굴·광산·정글·바다 유적·고대 도시·지하세계를 지나 끝의 차원까지! 깊이 갈수록 귀한 보물이 나와요. 도구와 귀한 광석은 보스 미션에서, 펫 친구는 월드를 클리어하면 만나요!</p>
        ${CATS.map(c=>{ const ks = Object.keys(ITEMS).filter(k=>ITEMS[k].cat===c.id).sort((x,y)=>(REW.firstWorld(x)-REW.firstWorld(y)) || (ITEMS[x].rarity-ITEMS[y].rarity)); const have = ks.filter(k=>st.inv[k]>0).length;
          return `<div class="zone"><div class="zone-t">${c.emoji} ${c.name} <span class="muted px" style="font-size:13px">${have}/${ks.length}</span></div><div class="inv">${ks.map(k=>{ const it = ITEMS[k]; const n = st.inv[k]||0;
          return `<div class="slotinv ${n?'':'none'} ${it.cat==='pet'?'pet':''}"><span class="cnt">${n>1?'×'+n:''}</span><span class="${n?'':'sil'}">${itemArt(k,64)}</span><span class="nm">${n?esc(it.name):'???'}</span><span class="rar">${'<i></i>'.repeat(it.rarity)}</span></div>`; }).join('')}</div></div>`; }).join('')}</div>
    </div></div>`);
  wireBack(el);
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
        ${toggleRow('unlockAll','모든 단원 열기','순서와 상관없이 자유롭게 고를 수 있어요')}
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
  el.querySelector('.exp').onclick = ()=>{ const blob = new Blob([JSON.stringify(S(),null,1)],{type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `block-hero-phonics-${store.dateKey()}.json`; a.click(); };
  el.querySelector('.imp').onclick = ()=>{ const i = document.createElement('input'); i.type='file'; i.accept='application/json'; i.onchange = async ()=>{ try { const ok = store.importData(JSON.parse(await i.files[0].text())); if (ok) migrateRewards(); toast(ok?'가져왔어요!':'파일을 읽을 수 없어요'); applySettings(); parentDash(); } catch(e){ toast('파일을 읽을 수 없어요'); } }; i.click(); };
  el.querySelector('.rst').onclick = ()=>{ if (confirm('모든 진도와 블록이 지워져요. 정말 초기화할까요?')){ store.reset(); applySettings(); go(''); } };
}
function toggleRow(k, title, sub){ return `<div class="setrow"><div>${title}<small>${sub}</small></div><button class="toggle ${S().settings[k]?'on':''}" data-k="${k}" aria-label="${title}"></button></div>`; }

boot();
