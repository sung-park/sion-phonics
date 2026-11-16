#!/usr/bin/env python3
"""Generate all app audio with ElevenLabs (cached; never regenerates existing files).
Usage: ELEVENLABS_API_KEY=... python3 tools/gen_audio.py [categories...]
Key is read from env only and never written anywhere."""
import os, sys, json, hashlib, subprocess, re, time, requests, concurrent.futures as cf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.environ.get('RAW_DIR', os.path.join(ROOT, '..', 'audio_raw'))
OUT = os.path.join(ROOT, 'assets', 'audio')
KEY = os.environ['ELEVENLABS_API_KEY']
EN_VOICE = 'cgSgspJ2msm6clMCkdW9'   # Jessica – playful, bright, warm (premade)
KO_VOICE = 'Lb7qkOn5hF8p7qfCDH8q'   # Annie KR – cute, young, Seoul
MODEL = 'eleven_multilingual_v2'
os.makedirs(RAW, exist_ok=True)
# words whose first take was checked (phoneme recognizer) and sounded wrong; alternate prompt text
WORD_FIX = {'sea':'Sea.', 'cane':'Cane.', 'boot':'boot', 'hog':'Hog.', 'hop':'Hop.', 'i':'eye.', 'giraffe':'Giraffe.', 'hangeul':'Hangul.'}
stats = {'requests':0, 'chars':0}

def tts(text, voice=EN_VOICE, model=MODEL, speed=0.9, stability=0.6, timestamps=False):
    settings = {'stability':stability, 'similarity_boost':0.8, 'style':0.0, 'use_speaker_boost':True, 'speed':speed}
    h = hashlib.sha1(json.dumps([text, voice, model, settings, timestamps]).encode()).hexdigest()[:16]
    path = os.path.join(RAW, h + '.mp3')
    if os.path.exists(path): return path
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice}' + ('/with-timestamps' if timestamps else '') + '?output_format=mp3_44100_128'
    for attempt in range(6):
        try: r = requests.post(url, headers={'xi-api-key':KEY}, json={'text':text, 'model_id':model, 'voice_settings':settings}, timeout=60)
        except requests.exceptions.RequestException:   # transient network/SSL errors: retry (raw cache prevents double billing)
            time.sleep(3*(attempt+1)); continue
        if r.status_code == 200: break
        if r.status_code == 429: time.sleep(3*(attempt+1)); continue
        raise RuntimeError(f'{r.status_code} {r.text[:200]} for {text!r}')
    stats['requests'] += 1; stats['chars'] += len(text)
    if timestamps:
        import base64; d = r.json()
        open(path,'wb').write(base64.b64decode(d['audio_base64']))
        json.dump(d.get('normalized_alignment') or d['alignment'], open(path+'.json','w'))
    else:
        open(path,'wb').write(r.content)
    return path

def slug(s, n=48):
    s = re.sub(r'[\u2019\']', '', s.lower()); s = re.sub(r'[^a-z0-9가-힣]+', '-', s).strip('-')
    return s[:n].strip('-') or 'x'

def peak_gain(src):
    out = subprocess.run(['ffmpeg','-i',src,'-af','volumedetect','-f','null','-'],capture_output=True,text=True).stderr
    m = re.search(r'max_volume: (-?[0-9.]+) dB', out); return (-2.0 - float(m.group(1))) if m else 0

def finish(src, dst, pad=0.06, norm='loud'):
    """trim silence, normalize, mono 64k mp3"""
    if os.path.exists(dst) and os.path.getmtime(dst) > os.path.getmtime(src): return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if norm == 'peak':
        af = (f'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.01,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,'
              f'adelay={int(pad*1000)}:all=1,apad=pad_dur={pad},volume={peak_gain(src)+0:.2f}dB')
        subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',af,'-ac','1','-ar','44100','-b:a','64k',dst], check=True); return
    af = (f'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,'
          f'areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,'
          f'adelay={int(pad*1000)}:all=1,apad=pad_dur={pad},loudnorm=I=-16:TP=-1.5:LRA=11')
    subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',af,'-ac','1','-ar','44100','-b:a','64k',dst], check=True)

# spoken forms inside story / talk sentences (display text keeps the original spelling)
SPOKEN = {'Cubi':'Q-bee', 'Hangeul':'Hangul'}
SPOKEN_RE = re.compile(r'\b(' + '|'.join(SPOKEN) + r')\b')

def finish_timed(src, dst, spoken, lead=0.08, tail=0.25):
    """Cut from just before the first character to just after the last one (no silence-detector, so the
    alignment stays exact), loudness-normalize, and return per-word [start,end] seconds in the output file."""
    al = json.load(open(src + '.json'))
    chars, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    text = ''.join(chars)
    nz = [i for i,c in enumerate(chars) if not c.isspace()]
    t0 = max(0.0, st[nz[0]] - lead); t1 = en[nz[-1]] + tail
    words = []; i = 0
    for m in re.finditer(r'\S+', text):
        s0, e0 = m.start(), m.end() - 1
        words.append([round(st[s0] - t0, 3), round(en[e0] - t0, 3)])
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    af = f'atrim={t0:.3f}:{t1:.3f},asetpts=PTS-STARTPTS,afade=t=out:st={max(0,t1-t0-0.12):.3f}:d=0.12,loudnorm=I=-16:TP=-1.5:LRA=11'
    subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',af,'-ac','1','-ar','44100','-b:a','64k',dst], check=True)
    n_disp = len(spoken.split())
    assert len(words) == n_disp, (spoken, len(words), n_disp)
    return words

def main(cats):
    items = json.loads(subprocess.run(['node', os.path.join(ROOT,'tools','list-audio.mjs')], capture_output=True, text=True, check=True).stdout)
    mpath = os.path.join(OUT, 'manifest.json')
    manifest = json.load(open(mpath)) if os.path.exists(mpath) else {}
    jobs = []
    for cat, entries in items.items():
        if cat == 'p' or (cats and cat not in cats): continue
        manifest.setdefault(cat, {})
        for key, text in entries.items():
            if cat in ('s','st','tk'): fn = slug(key, 40) + '-' + hashlib.md5(key.encode()).hexdigest()[:5]
            elif cat == 'ko': fn = key
            else: fn = slug(key)
            rel = f'{cat}/{fn}.mp3'
            voice = KO_VOICE if cat == 'ko' else EN_VOICE
            if cat == 'w': spoken = WORD_FIX.get(key, text + '.')   # period gives a natural falling citation form
            elif cat == 'l': spoken = text + '.'
            elif cat in ('st','tk'): spoken = SPOKEN_RE.sub(lambda m: SPOKEN[m.group(0)], text)
            else: spoken = text
            speed = 1.0 if cat in ('x','ko') else (0.85 if cat in ('s','st') or (cat=='tk' and ' ' in text.strip()) else 0.9)
            jobs.append((cat, key, spoken, voice, speed, rel))
    def run(job):
        cat, key, spoken, voice, speed, rel = job
        stab = 0.75 if (cat=='w' and key in WORD_FIX) else 0.6
        if cat == 'st':   # story pages: keep word timings for highlight-as-read
            src = tts(spoken, voice=voice, speed=speed, stability=stab, timestamps=True)
            timings[key] = finish_timed(src, os.path.join(OUT, rel), spoken)
            return cat, key, rel
        src = tts(spoken, voice=voice, speed=speed, stability=stab)
        finish(src, os.path.join(OUT, rel))
        return cat, key, rel
    tpath = os.path.join(OUT, 'st', 'timings.json')
    timings = json.load(open(tpath)) if os.path.exists(tpath) else {}
    with cf.ThreadPoolExecutor(4) as ex:
        for cat, key, rel in ex.map(run, jobs):
            manifest[cat][key] = rel
    json.dump(manifest, open(mpath,'w'), ensure_ascii=False, indent=0, sort_keys=True)
    if timings:
        os.makedirs(os.path.dirname(tpath), exist_ok=True)
        json.dump(timings, open(tpath,'w'), ensure_ascii=False, separators=(',',':'), sort_keys=True)
    print(json.dumps(stats))

if __name__ == '__main__':
    main(sys.argv[1:])
