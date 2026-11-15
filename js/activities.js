// Activity renderers. Each gets (step, ctx) and calls ctx.done({correct, attempts, chosen}).
import * as A from './audio.js';
import { segment, tokenize, showWord, baseWord } from './phonics.js';
import { picOf, hasPic } from './missions.js';
import { emojiSrc } from './emoji.js';
import { CONFUSIONS, PRAISE, ENCOURAGE, LETTERS } from './data.js';
import * as store from './store.js';

export const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const img = (w, cls='') => hasPic(w) ? `<img class="${cls}" src="${emojiSrc(picOf(w))}" alt="${esc(showWord(w))}" draggable="false">` : '';
const VOW = new Set(['a','e','i','o','u']);
const gHTML = g => { // grapheme with vowel coloring; a_e style
  if (g.includes('_')) { const [v,c] = g.split('_'); return `<span class="ink-v">${v}</span><span style="color:#b9c1cf">_</span><span style="color:#8b5cf6">e</span>`; }
  return [...g].map(ch=>VOW.has(ch.toLowerCase()) ? `<span class="ink-v">${ch}</span>` : ch).join('');
};
let praiseIdx = Math.floor(Math.random()*PRAISE.length);
export async function praise(){ praiseIdx = (praiseIdx+1)%PRAISE.length; await A.play('x', PRAISE[praiseIdx]); }

// generic multiple choice with errorless hints
function choice(ctx, container, tiles, isRight, {onRight, replay, key, record=true}={}){
  let attempts = 0, finished = false;
  tiles.forEach(t=>t.addEventListener('click', async ()=>{
    if (finished || t.classList.contains('no')) return;
    const val = t.dataset.v;
    if (isRight(val)){
      finished = true; t.classList.add('ok'); tiles.forEach(x=>x!==t && x.classList.add('dim'));
      A.sfx('ok'); ctx.fx.burst(t); ctx.fx.xp(t, attempts===0 ? 10 : 5); ctx.mascotHop();
      if (onRight) await onRight(val); else await praise();
      ctx.done({correct: attempts===0, attempts});
    } else {
      attempts++; t.classList.add('no'); A.sfx('soft'); ctx.miss(val);
      if (attempts===1){ ctx.setText('괜찮아! 다시 들어 볼까? 👂'); await A.play('x', ENCOURAGE[1]); replay && replay(); }
      else { tiles.forEach(x=>{ if (isRight(x.dataset.v)) x.classList.add('hint'); else x.classList.add('dim'); }); ctx.say('hint'); replay && setTimeout(replay, 900); }
    }
  }));
}

const R = {};

// ---------- learn a letter / grapheme ----------
R.intro = (s, ctx) => {
  const key = s.key; const segs = segment(key);
  let wordHTML;
  if (s.kind==='letter') wordHTML = `<b>${esc(showWord(key)[0])}</b>${esc(showWord(key).slice(1))}`;
  else {
    const g = s.g.replace('_e',''); 
    wordHTML = segs.map(x=>{ const hit = x.g.toLowerCase()===s.g || (s.g.includes('_') && (x.magic || (x.silent && s.g.endsWith('e')))) || (s.kind==='blend' && s.g.includes(x.g)) || (s.label && x.p==='aw');
      return hit ? `<b>${esc(x.g)}</b>` : esc(x.g); }).join('');
    if (s.kind==='blend'){ // highlight the blend letters at the start
      const w = showWord(key); wordHTML = `<b>${esc(w.slice(0,s.g.length))}</b>${esc(w.slice(s.g.length))}`; }
  }
  const glyphInner = s.kind==='letter' ? `${gHTML(s.g)}<span class="up">${s.g.toUpperCase()}</span>` : gHTML(s.label || s.g);
  const node = h(`<div class="stage-inner" style="display:flex;flex-direction:column;align-items:center;gap:22px">
    <div class="learn">
      <button class="glyph tapme" aria-label="소리 듣기">${glyphInner}</button>
      <button class="piccard" aria-label="단어 듣기">${img(key)}<div class="w">${wordHTML}</div></button>
    </div>
    ${s.note ? `<div class="chip">💡 ${esc(s.note)}</div>` : ''}
    ${s.families ? `<div class="tiles">${s.families.map(f=>`<button class="tile word fam" data-f="${f}">-${gHTML(f)}</button>`).join('')}</div>` : ''}
    <button class="btn next" disabled>다음 ▶</button></div>`);
  ctx.stage.append(node);
  const glyph = node.querySelector('.glyph'), pic = node.querySelector('.piccard'), next = node.querySelector('.next');
  const playSound = async () => {
    if (s.kind==='letter') return A.seq([['l', s.g], 250, ['p', s.sound], 300, ['p', s.sound]]);
    if (s.kind==='blend') return A.seq([...[...s.g].map(c=>['p', c]), 200, ['w', key]], 60);
    return A.seq([['p', s.sound], 350, ['p', s.sound]]);
  };
  let tapped = false;
  glyph.onclick = async () => { glyph.classList.remove('tapme'); tapped = true; A.sfx('tap'); await playSound(); next.disabled = false; pic.classList.add('tapme'); };
  pic.onclick = async () => { pic.classList.remove('tapme'); A.sfx('tap'); await A.seq([['p', s.kind==='blend' ? s.g[0] : s.sound], 200, ['w', key]]); if (tapped) next.disabled = false; };
  node.querySelectorAll('.fam').forEach(b=>b.onclick=()=>{ const f=b.dataset.f; A.seq([['p',f[0]],['p',f[1]], 100]); });
  next.onclick = () => { A.stop(); ctx.done({correct:true, attempts:0, learn:true}); };
  ctx.replay = playSound;
  ctx.say('intro').then(playSound);
};

// ---------- hear a sound, pick the grapheme ----------
R.pick_sound = (s, ctx) => {
  const node = h(`<div class="tiles">${s.options.map(o=>`<button class="tile" data-v="${o}">${gHTML(o.includes('_')?o:o)}</button>`).join('')}</div>`);
  ctx.stage.append(node);
  const replay = () => A.play('p', s.sound);
  ctx.replay = replay; ctx.say('pick_sound').then(replay);
  choice(ctx, node, [...node.children], v=>v===s.target, {replay, onRight: async()=>{ await A.play('p', s.sound); await praise(); }});
};
R.which_letter = (s, ctx) => {
  const node = h(`<div class="tiles">${s.options.map(o=>`<button class="tile" data-v="${o}">${o}</button>`).join('')}</div>`);
  ctx.stage.append(node);
  const replay = () => A.seq([['l', s.target], 200, ['p', s.target]]);
  ctx.replay = replay; ctx.setText(`<b class="en">${s.target}</b> 글자는 어디 있을까? 🔍`); ctx.say('which_letter').then(replay);
  choice(ctx, node, [...node.children], v=>v===s.target, {replay});
};

// ---------- picture → first sound ----------
R.first_sound = (s, ctx) => {
  const w = showWord(s.word);
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:22px">
    <button class="piccard">${img(s.word)}<div class="w"><span style="display:inline-block;min-width:.7em;border-bottom:6px solid #e23d5a;color:transparent">${w[0]}</span>${esc(w.slice(1))}</div></button>
    <div class="tiles">${s.options.map(o=>`<button class="tile" data-v="${o}">${o}</button>`).join('')}</div></div>`);
  ctx.stage.append(node);
  const replay = () => A.play('w', s.word);
  node.querySelector('.piccard').onclick = replay;
  ctx.replay = replay; ctx.say('first_sound').then(replay);
  const tiles = [...node.querySelectorAll('.tile')];
  choice(ctx, node, tiles, v=>v===s.target, {replay, onRight: async()=>{ const sp = node.querySelector('.w span'); sp.style.color='#e23d5a'; await A.seq([['p', s.target], 150, ['w', s.word]]); await praise(); }});
};

// ---------- uppercase → lowercase ----------
R.case_match = (s, ctx) => {
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:26px">
    <button class="glyph">${s.target.toUpperCase()}</button>
    <div class="tiles">${s.options.map(o=>`<button class="tile" data-v="${o}">${o}</button>`).join('')}</div></div>`);
  ctx.stage.append(node);
  const replay = () => A.play('l', s.target);
  node.querySelector('.glyph').onclick = replay;
  ctx.replay = replay; ctx.say('case_match').then(replay);
  choice(ctx, node, [...node.querySelectorAll('.tile')], v=>v===s.target, {replay});
};

// ---------- find every target letter ----------
R.tap_all = (s, ctx) => {
  const n = 12, k = 5; const arr = [];
  for (let i=0;i<k;i++) arr.push(s.target);
  for (let i=k;i<n;i++) arr.push(s.distract[i % s.distract.length]);
  arr.sort(()=>Math.random()-.5);
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:16px">
    <div class="target-pill">찾을 글자 <span class="en" style="font-size:40px">${s.target}</span> <span class="cnt px">0/${k}</span></div>
    <div class="lettergrid">${arr.map((l,i)=>`<button class="tile" data-v="${l}" data-i="${i}">${l}</button>`).join('')}</div></div>`);
  ctx.stage.append(node);
  const replay = () => A.seq([['l', s.target], 150, ['p', s.target]]);
  ctx.replay = replay; ctx.setText(`<b class="en">${s.target}</b> 를 모두 찾아 눌러 봐! (${k}개)`); ctx.say('tap_all').then(replay);
  let found = 0, wrong = 0;
  node.querySelectorAll('.lettergrid .tile').forEach(t=>t.onclick = async ()=>{
    if (t.classList.contains('ok')) return;
    if (t.dataset.v===s.target){
      t.classList.add('ok'); found++; A.sfx('coin'); ctx.fx.burst(t, 8); node.querySelector('.cnt').textContent = `${found}/${k}`;
      if (found===k){ ctx.fx.xp(t, wrong===0?15:8); ctx.mascotHop(); A.sfx('ok'); await praise(); ctx.done({correct: wrong===0, attempts: wrong}); }
    } else {
      wrong++; t.classList.add('no'); A.sfx('soft'); ctx.miss(t.dataset.v);
      setTimeout(()=>t.classList.remove('no'), 600);
      t.style.opacity = '.35';
      if (wrong===2) node.querySelectorAll('.lettergrid .tile').forEach(x=>{ if (x.dataset.v===s.target && !x.classList.contains('ok')) x.classList.add('hint'); });
    }
  });
};

// ---------- sound-by-sound blending ----------
R.blend = (s, ctx) => {
  const segs = segment(s.word);
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:22px;width:100%">
    <div class="blend">${segs.map((x,i)=>`<button class="bblock ${VOW.has(x.g.toLowerCase()[0]) && !x.silent && x.g.length<=2 && 'aeiou'.includes(x.g.toLowerCase()[0]) ? 'v':''} ${x.silent?'silent':''} ${x.magic?'magic':''}" data-i="${i}">${esc(x.g)}</button>`).join('')}</div>
    <div class="slider"><i></i></div>
    <div class="reveal" style="min-height:140px;display:flex;align-items:center;gap:18px"></div>
    <button class="btn next hidden">다음 ▶</button></div>`);
  ctx.stage.append(node);
  const blocks = [...node.querySelectorAll('.bblock')]; let nextI = 0; const bar = node.querySelector('.slider i');
  const reveal = node.querySelector('.reveal'), next = node.querySelector('.next');
  blocks[0].classList.add('next');
  const playSeg = async (i) => { const x = segs[i]; const b = blocks[i]; b.classList.add('lit'); setTimeout(()=>b.classList.remove('lit'), 450);
    if (x.silent){ A.sfx('magic'); return A.wait(250); } return A.play('p', x.p); };
  const finish = async () => {
    reveal.innerHTML = `<button class="blend-word">${esc(showWord(s.word))}</button>${img(s.word,'')}`;
    const im = reveal.querySelector('img'); if (im){ im.style.width='110px'; im.style.height='110px'; }
    bar.style.width = '100%';
    const wb = reveal.querySelector('.blend-word'); wb.onclick = () => A.play('w', s.word);
    ctx.setText('스르륵~ 이어서 읽으면? 🚀');
    // model: sounds quickly, then the word
    await A.seq([...segs.filter(x=>!x.silent).map(x=>['p', x.p]), 250, ['w', s.word]], 40);
    A.sfx('ok'); ctx.fx.burst(wb, 14); ctx.mascotHop();
    next.classList.remove('hidden');
  };
  blocks.forEach((b,i)=>b.onclick = async ()=>{
    if (i === nextI){
      b.classList.remove('next'); nextI++; bar.style.width = (nextI/segs.length*90)+'%';
      if (nextI < segs.length) blocks[nextI].classList.add('next');
      await playSeg(i);
      if (nextI === segs.length) finish();
    } else if (i < nextI) playSeg(i);
    else { blocks[nextI].classList.add('next'); A.sfx('tap'); }
  });
  next.onclick = () => { A.stop(); ctx.done({correct:true, attempts:0, learn:true}); };
  ctx.replay = () => A.seq(segs.filter(x=>!x.silent).map(x=>['p',x.p]), 200);
  ctx.say('blend');
};

// ---------- build a word from blocks ----------
R.build = (s, ctx) => {
  const segs = s.segs;
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:20px;width:100%">
    <button class="piccard" style="padding:10px 18px">${img(s.word) || '<div style="font-size:64px">🔊</div>'}</button>
    <div class="slots">${segs.map((g,i)=>`<div class="slot ${i===0?'active':''}" data-i="${i}"></div>`).join('')}</div>
    <div class="tiles">${s.tiles.map((g,i)=>`<button class="tile" data-v="${esc(g)}" data-i="${i}">${gHTML(g)}</button>`).join('')}</div></div>`);
  ctx.stage.append(node);
  const replay = () => A.play('w', s.word);
  node.querySelector('.piccard').onclick = replay;
  ctx.replay = replay; ctx.say('build').then(replay);
  const slots = [...node.querySelectorAll('.slot')]; const tiles = [...node.querySelectorAll('.tile')];
  const wsegs = segment(s.word);
  let k = 0, errs = 0, slotErr = 0;
  tiles.forEach(t=>t.onclick = async ()=>{
    if (t.classList.contains('used') || k>=segs.length) return;
    if (t.dataset.v === segs[k]){
      t.classList.add('used'); tiles.forEach(x=>x.classList.remove('hint','dim'));
      slots[k].innerHTML = gHTML(segs[k]); slots[k].classList.add('filled'); slots[k].classList.remove('active');
      const sg = wsegs[k]; A.sfx('place');
      if (sg && sg.p) A.play('p', sg.p); 
      k++; slotErr = 0;
      if (k < segs.length) slots[k].classList.add('active');
      else {
        await A.wait(450); A.sfx('ok'); ctx.fx.burst(node.querySelector('.slots'), 16); ctx.fx.xp(slots[slots.length-1], errs===0?15:8); ctx.mascotHop();
        await A.play('w', s.word); await praise();
        ctx.done({correct: errs===0, attempts: errs});
      }
    } else {
      errs++; slotErr++; t.classList.add('no'); A.sfx('soft'); ctx.miss(t.dataset.v, segs[k]);
      setTimeout(()=>{ t.classList.remove('no'); t.style.opacity=''; }, 500);
      const sg = wsegs[k];
      if (slotErr===1 && sg && sg.p) { ctx.setText('이 자리의 소리를 들어 봐 👂'); A.play('p', sg.p); }
      if (slotErr>=2) tiles.forEach(x=>{ if (!x.classList.contains('used') && x.dataset.v===segs[k]) x.classList.add('hint'); });
    }
  });
};

// ---------- hear word → choose written word ----------
R.pick_word = (s, ctx) => {
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:24px">
    <button class="replay big" style="width:120px;height:120px;font-size:56px;border-radius:32px">🔊</button>
    <div class="tiles">${s.options.map(o=>`<button class="tile word" data-v="${esc(o)}">${esc(showWord(o))}</button>`).join('')}</div></div>`);
  ctx.stage.append(node);
  const replay = () => A.play('w', s.word);
  node.querySelector('.replay').onclick = replay;
  ctx.replay = replay; ctx.say('pick_word').then(replay);
  choice(ctx, node, [...node.querySelectorAll('.tile')], v=>baseWord(v)===baseWord(s.word), {replay});
};

// ---------- read word → choose picture ----------
R.pic_match = (s, ctx) => {
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:24px">
    <div class="blend-word" style="font-size:clamp(48px,9vmin,84px);background:#fff;color:var(--ink);box-shadow:0 8px 0 #c3ccda">${esc(showWord(s.word))}</div>
    <div class="tiles">${s.options.map(o=>`<button class="tile pic" data-v="${esc(o)}" aria-label="그림">${img(o)}</button>`).join('')}</div></div>`);
  ctx.stage.append(node);
  const replay = () => A.play('w', s.word);
  ctx.replay = replay; ctx.say('pic_match');
  choice(ctx, node, [...node.querySelectorAll('.tile')], v=>picOf(v)===picOf(s.word), {replay, onRight: async()=>{ await A.play('w', s.word); await praise(); }});
};

// ---------- decodable sentence ----------
R.sentence = (s, ctx) => {
  const toks = tokenize(s.text);
  const scene = [...new Set(toks.map(t=>t.word).filter(w=>w && w.length>2 && hasPic(w)).map(w=>picOf(w)))].slice(0,3);
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:22px;width:100%">
    <div class="scene">${scene.map(e=>`<img src="${emojiSrc(e)}" alt="">`).join('')}</div>
    <div class="sentence">${toks.map((t,i)=>`<button class="sw" data-w="${esc(t.word||'')}" data-i="${i}">${esc(t.text)}</button>`).join('')}</div>
    <div class="phase" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
      <button class="btn blue small listen">🔊 문장 듣기</button><button class="btn small readdone">다 읽었어요 ✔</button></div></div>`);
  ctx.stage.append(node);
  const words = [...node.querySelectorAll('.sw')];
  const playSentence = async () => { // highlight words roughly in time
    const p = A.play('s', s.text); let i=0; const iv = setInterval(()=>{ words.forEach(w=>w.classList.remove('lit')); if (i<words.length) words[i++].classList.add('lit'); else clearInterval(iv); }, 330);
    await p; clearInterval(iv); words.forEach(w=>w.classList.remove('lit')); };
  let phase = 'read';
  words.forEach(b=>b.onclick = async ()=>{
    const w = b.dataset.w; if (!w) return;
    if (phase==='read'){ b.classList.add('lit'); await A.play('w', w); b.classList.remove('lit'); return; }
    if (phase==='find'){
      if (w===s.find){ phase='done'; b.classList.add('ok'); A.sfx('ok'); ctx.fx.burst(b); ctx.fx.xp(b, findErr===0?10:5); ctx.mascotHop();
        await A.play('w', w); await playSentence(); await praise(); ctx.done({correct: findErr===0, attempts: findErr}); }
      else { findErr++; b.classList.add('no'); setTimeout(()=>b.classList.remove('no'),500); A.sfx('soft'); ctx.miss(w, s.find);
        if (findErr===1) A.play('w', s.find); else words.forEach(x=>x.dataset.w===s.find && x.classList.add('hint')); }
    }
  });
  let findErr = 0;
  const startFind = async () => {
    if (phase!=='read') return; phase='find';
    node.querySelector('.phase').innerHTML = `<div class="target-pill">🔍 이 단어를 찾아 봐! <button class="btn blue small again" style="min-height:44px">🔊</button></div>`;
    node.querySelector('.again').onclick = () => A.play('w', s.find);
    ctx.setText('🔊 소리를 듣고, 그 단어를 문장에서 찾아 눌러 봐!');
    ctx.replay = () => A.play('w', s.find);
    await ctx.say('find_word'); A.play('w', s.find);
  };
  node.querySelector('.listen').onclick = async ()=>{ await playSentence(); };
  node.querySelector('.readdone').onclick = startFind;
  ctx.replay = playSentence;
  ctx.say('sentence');
};

// ---------- magic e ----------
R.magic = (s, ctx) => {
  const [a, b] = s.pair; const segA = segment(a);
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:22px;width:100%">
    <div class="magic-row"><div class="blend">${segA.map(x=>`<div class="bblock ${'aeiou'.includes(x.g)?'v':''}">${x.g}</div>`).join('')}<div class="bblock slotE" style="border:4px dashed rgba(0,0,0,.2);background:rgba(255,255,255,.4);box-shadow:none;color:transparent">e</div></div>
    <button class="magic-e" aria-label="매직 e">e</button></div>
    <div class="cmp hidden" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center">
      <button class="tile word wa">${a}</button><div style="font-size:40px">➜</div><button class="tile word wb" style="color:#7c3aed">${b}</button>${img(b)}</div>
    <button class="btn next hidden">다음 ▶</button></div>`);
  ctx.stage.append(node);
  const me = node.querySelector('.magic-e'), slotE = node.querySelector('.slotE'), next = node.querySelector('.next');
  const im = node.querySelector('.cmp img'); if (im){ im.style.width='96px'; im.style.height='96px'; }
  ctx.replay = () => A.play('w', a);
  ctx.say('magic').then(()=>A.play('w', a));
  let used = false;
  me.onclick = async () => {
    if (used) return; used = true; me.classList.add('used'); A.sfx('magic');
    slotE.style.cssText = ''; slotE.classList.add('magic','lit'); slotE.textContent = 'e'; slotE.style.color = '#8b5cf6';
    const v = node.querySelector('.bblock.v'); if (v){ v.style.color = '#7c3aed'; v.classList.add('lit'); }
    ctx.fx.burst(slotE, 16); ctx.mascotHop();
    await A.play('x', 'Magic e!'); await A.wait(150); await A.play('w', b);
    node.querySelector('.cmp').classList.remove('hidden'); next.classList.remove('hidden');
    ctx.setText(`<span class="en">${a}</span> ➜ <span class="en" style="color:#7c3aed">${b}</span> 모음이 자기 이름 소리를 내요!`);
  };
  node.querySelector('.wa').onclick = () => A.play('w', a);
  node.querySelector('.wb').onclick = () => A.play('w', b);
  next.onclick = () => { A.stop(); ctx.done({correct:true, attempts:0, learn:true}); };
};

// ---------- sight word intro ----------
R.sight_intro = (s, ctx) => {
  const w = s.word;
  const node = h(`<div style="display:flex;flex-direction:column;align-items:center;gap:22px">
    <button class="glyph tapme" style="font-size:clamp(80px,15vmin,150px)">${[...w].map(c=>`<span class="lt">${c}</span>`).join('')}</button>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><button class="btn blue small spell">🔤 철자 듣기</button></div>
    <div class="chip">👀 보고 → 🔊 듣고 → 🗣️ 따라 말하기</div>
    <button class="btn next" disabled>다음 ▶</button></div>`);
  ctx.stage.append(node);
  const glyph = node.querySelector('.glyph'), next = node.querySelector('.next'); const lts = [...node.querySelectorAll('.lt')];
  const say = () => A.play('w', w === 'I' ? 'i' : w);
  glyph.onclick = async () => { glyph.classList.remove('tapme'); await say(); next.disabled = false; };
  node.querySelector('.spell').onclick = async () => {
    A.stop();
    for (let i=0;i<lts.length;i++){ lts.forEach(x=>x.style.color=''); lts[i].style.color='#e23d5a'; await A.play('l', w[i].toLowerCase(), {interrupt:false}); await A.wait(60); }
    lts.forEach(x=>x.style.color=''); await A.wait(150); await say(); next.disabled = false;
  };
  next.onclick = () => { A.stop(); ctx.done({correct:true, attempts:0, learn:true}); };
  ctx.replay = say; ctx.say('sight').then(say);
};

// Original SVG thumbs-up fist. LEFT hand: thumb (stick) on the left, fist (bowl) to the right = b.
// RIGHT hand is the mirror: fist on the left, thumb on the right = d.  b + d side by side = "bed".
const fist = (letter, label) => {
  const flip = letter==='d' ? ' transform="translate(100 0) scale(-1 1)"' : '';
  return `<figure class="fist"><svg viewBox="0 0 100 124" width="100" height="124" aria-hidden="true"><g${flip}>
    <rect x="12" y="4" width="24" height="70" rx="12" fill="#f6c99b" stroke="#7a4a2a" stroke-width="4"/>
    <rect x="12" y="52" width="76" height="66" rx="28" fill="#f6c99b" stroke="#7a4a2a" stroke-width="4"/>
    <path d="M36 58 Q30 70 36 80" fill="none" stroke="#7a4a2a" stroke-width="3" stroke-linecap="round"/>
    <path d="M62 66 H86 M62 82 H88 M62 98 H86" stroke="#c9895c" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="17" y="10" width="8" height="18" rx="4" fill="#fff" opacity=".45"/></g></svg>
    <figcaption><b>${letter}</b><small>${label}</small></figcaption></figure>`;
};
// ---------- letter confusion mnemonic ----------
R.mnemonic = (s, ctx) => {
  const c = CONFUSIONS.find(x=>x.id===s.conf);
  let visual = '';
  if (c.id==='bd' || c.id==='bdpq') visual = `<div class="bed"><span class="b">b</span>e<span class="d">d</span></div>
    <div class="hands">${fist('b','왼손')}<span class="hand-e">e</span>${fist('d','오른손')}</div>`;
  const node = h(`<div class="mnemo">${visual}
    <div class="bubble" style="flex:none">${esc(c.tip)}</div>
    <div style="display:flex;flex-direction:column;gap:10px;width:100%">${c.letters.map(l=>`<button class="rule" data-l="${l}"><span class="en">${l}</span><span>${esc(c.rules[l])}</span><span style="margin-left:auto">🔊</span></button>`).join('')}</div>
    <button class="btn next">알겠어요! ▶</button></div>`);
  ctx.stage.append(node);
  node.querySelectorAll('.rule').forEach(b=>b.onclick=()=>A.seq([['l', b.dataset.l], 200, ['p', b.dataset.l]]));
  node.querySelector('.next').onclick = () => { A.stop(); ctx.done({correct:true, attempts:0, learn:true}); };
  ctx.replay = () => A.seq(c.letters.flatMap(l=>[['l',l],['p',l],300]));
  ctx.say('trainer');
  ctx.setText('헷갈리는 글자를 구별하는 비밀 작전! 🕵️');
};

export const RENDER = R;
export const PROMPT_KEY = { intro:'intro', pick_sound:'pick_sound', which_letter:'which_letter', first_sound:'first_sound', case_match:'case_match',
  tap_all:'tap_all', blend:'blend', build:'build', pick_word:'pick_word', pic_match:'pic_match', sentence:'sentence', magic:'magic', sight_intro:'sight', mnemonic:'trainer' };
