// Audio: plays ONLY pre-generated ElevenLabs mp3s (no speechSynthesis). WebAudio for low latency.
import { baseWord } from './phonics.js';
let ctx = null, manifest = null, gen = 0, currentSrc = null, settings = {sfx:true, ko:true};
const buffers = new Map();
export const audioState = { playing:false, listeners:new Set() };
function emit(){ audioState.listeners.forEach(f=>f(audioState.playing)); }

export async function initAudio(){
  try { manifest = await fetch('assets/audio/manifest.json', {cache:'no-cache'}).then(r=>r.json()); } catch(e){ manifest = {}; }
}
export function configure(s){ settings = {...settings, ...s}; }
// ---- iOS silent switch ----
// Every sound in the app (missions, story reader, 학교 영어, effects) goes through ONE Web Audio context.
// On iOS, Web Audio is treated as "ambient" audio unless the page's audio session is "playback", and ambient
// audio is muted by the ring/silent switch. So: ask for a playback session (Safari 16.4+ audioSession API) and,
// on older iOS without that API, keep a silent looping <audio> element running after the first tap, which puts
// the page in the playback category. The context itself is created/resumed inside real user gestures.
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let primed = false, silentEl = null;
function playbackSession(){ try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch(e){} }
playbackSession();
export function unlock(){
  playbackSession();
  if (!ctx){ const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); }
  if (ctx && ctx.state !== 'running' && ctx.state !== 'closed') { const r = ctx.resume(); if (r && r.catch) r.catch(()=>{}); }   // 'suspended' or iOS 'interrupted'
}
function prime(){
  unlock(); if (!ctx || primed) return; primed = true;
  try { const b = ctx.createBuffer(1, 1, 22050); const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch(e){}
  if (IOS && !('audioSession' in navigator)){
    silentEl = new Audio('assets/audio/silence.mp3'); silentEl.loop = true; silentEl.setAttribute('playsinline', ''); silentEl.preload = 'auto';
    const p = silentEl.play(); if (p && p.catch) p.catch(()=>{ primed = false; });
  }
}
/** call once at boot: prime audio on the first real tap/click/key, and resume after the app returns from background */
export function initGestures(){
  ['pointerdown','touchend','click','keydown'].forEach(ev => document.addEventListener(ev, prime, {capture:true, passive:true}));
  document.addEventListener('visibilitychange', () => { if (document.hidden) return; if (ctx && primed) unlock(); if (silentEl && silentEl.paused && primed) silentEl.play().catch(()=>{}); });
}
export const audioDebug = () => ({ctx: ctx ? ctx.state : null, primed, session: navigator.audioSession ? navigator.audioSession.type : null, silentEl: !!silentEl});
export function rel(cat, key){
  if (!manifest) return null;
  if (cat==='w'){ const k = baseWord(String(key)).toLowerCase(); return manifest.w?.[k] || null; }
  return manifest[cat]?.[key] || null;
}
export const has = (cat,key)=>!!rel(cat,key);
// story page word timings (generated with ElevenLabs character alignment)
let timings = null;
export async function storyTimings(){ if (!timings) timings = fetch('assets/audio/st/timings.json?v=9').then(r=>r.json()).catch(()=>({})); return timings; }
export const now = () => ctx ? ctx.currentTime : performance.now()/1000;
function load(r){
  if (!buffers.has(r)){
    // phonemes/letter names get ?v=3 to bust old browser/service-worker caches
    buffers.set(r, fetch('assets/audio/'+r+(/^(p|l)\//.test(r) ? '?v=3' : '')).then(x=>{ if(!x.ok) throw new Error(r); return x.arrayBuffer(); })
      .then(b=>new Promise((res,rej)=>ctx.decodeAudioData(b,res,rej))).catch(e=>{ buffers.delete(r); throw e; }));
  }
  return buffers.get(r);
}
export function preload(list){ unlock(); if(!ctx) return; list.forEach(([c,k])=>{ const r=rel(c,k); if(r) load(r).catch(()=>{}); }); }
export function stop(){ gen++; if (currentSrc){ try{ currentSrc.stop(); }catch(e){} currentSrc=null; } audioState.playing=false; emit(); }

// play one clip; resolves when finished (or immediately if missing / interrupted)
export async function play(cat, key, {interrupt=true, rate=1, onstart=null}={}){
  unlock(); if (!ctx) return;
  if (cat==='ko' && !settings.ko) return;
  const r = rel(cat,key); if (!r) { console.debug('[audio] missing', cat, key); return; }
  if (interrupt) stop();
  const my = gen;
  let buf; try { buf = await load(r); } catch(e){ return; }
  if (my !== gen) return;
  return new Promise(res=>{
    const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
    const g = ctx.createGain(); g.gain.value = cat==='ko' ? 0.9 : 1; src.connect(g).connect(ctx.destination);
    src.onended = ()=>{ if (currentSrc===src){ currentSrc=null; audioState.playing=false; emit(); } res(); };
    currentSrc = src; audioState.playing = true; emit(); src.start(); if (onstart) onstart(ctx.currentTime, ctx);
  });
}
// play a sequence; aborts if something else interrupts
export async function seq(items, gap=120){
  stop(); const my = gen;
  for (const it of items){
    if (my !== gen) return false;
    if (typeof it === 'number'){ await wait(it); continue; }
    await play(it[0], it[1], {interrupt:false});
    if (my !== gen) return false;
    await wait(gap);
  }
  return my === gen;
}
export const wait = ms => new Promise(r=>setTimeout(r,ms));

// ---------- synthesized UI sound effects (WebAudio, gentle) ----------
function tone(freq, t0, dur, type='sine', vol=0.15, slide=0){
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime+t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq*slide, ctx.currentTime+t0+dur);
  g.gain.setValueAtTime(0.0001, ctx.currentTime+t0);
  g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime+t0+0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+t0+dur);
  o.connect(g).connect(ctx.destination); o.start(ctx.currentTime+t0); o.stop(ctx.currentTime+t0+dur+0.05);
}
export function sfx(name){
  unlock(); if (!ctx || !settings.sfx) return;
  switch(name){
    case 'tap': tone(660,0,.07,'triangle',.08); break;
    case 'ok': tone(784,0,.12,'square',.05); tone(1047,.09,.12,'square',.05); tone(1568,.18,.22,'triangle',.07); break;
    case 'soft': tone(330,0,.18,'sine',.09,.8); break;           // gentle "not quite"
    case 'place': tone(520,0,.06,'square',.05); tone(390,.04,.08,'triangle',.06); break;
    case 'coin': tone(988,0,.08,'square',.05); tone(1319,.07,.25,'square',.05); break;
    case 'chest': [523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.08,.3,'triangle',.07)); break;
    case 'magic': [880,1175,1397,1760,2093].forEach((f,i)=>tone(f,i*.05,.25,'sine',.06)); break;
    case 'level': [392,523,659,784,1047].forEach((f,i)=>tone(f,i*.1,.35,'square',.045)); break;
    case 'knock': tone(150,0,.07,'square',.05,.7); tone(120,.09,.07,'square',.04,.7); break;   // chest wobble
    case 'rare': [523,659,784,1047].forEach((f,i)=>tone(f,i*.09,.28,'square',.045)); [1568,2093,2637,3136].forEach((f,i)=>tone(f,.4+i*.06,.3,'sine',.05)); break;
    case 'whoosh': tone(200,0,.25,'sawtooth',.03,4); break;
  }
}
