#!/usr/bin/env python3
"""Letter-name clips sliced from natural alphabet recitations ("A. B. C. ...") using pause detection.
Single-letter TTS requests were unreliable (e.g. 'E.' read as 'ah')."""
import os, sys, json, subprocess, numpy as np, wave
sys.path.insert(0, os.path.dirname(__file__))
from gen_audio import tts, finish, OUT, stats
CHUNKS = ['A. B. C. D. E. F. G.', 'H. I. J. K. L. M. N.', 'O. P. Q. R. S. T. U.', 'V. W. X. Y. Z.']
SR = 44100
def load(f):
    raw = subprocess.run(['ffmpeg','-v','error','-i',f,'-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.int16).astype(np.float32)/32768
def segments(x, hop=0.01, min_gap=0.09):
    h = int(SR*hop); e = np.array([np.sqrt((x[i:i+h]**2).mean()) for i in range(0,len(x)-h,h)])
    on = e > max(e.max()*0.04, 0.004); segs=[]; i=0
    while i < len(on):
        if on[i]:
            j=i
            while j < len(on) and (on[j] or (j+int(min_gap/hop) < len(on) and on[j:j+int(min_gap/hop)].any())): j+=1
            segs.append((i*hop, j*hop)); i=j
        else: i+=1
    return [s for s in segs if s[1]-s[0] > 0.08]
os.makedirs(os.path.join(OUT,'l'), exist_ok=True); tmp='/tmp/letters'; os.makedirs(tmp, exist_ok=True)
report = {}
for ch in CHUNKS:
    letters = [c.lower() for c in ch if c.isalpha()]
    for attempt in range(3):
        src = tts(ch if attempt==0 else ch.replace('. ', '... '), speed=0.8, stability=0.75)
        x = load(src); segs = segments(x)
        if len(segs) == len(letters): break
        print('segment mismatch', ch, len(segs), [round(b-a,2) for a,b in segs])
    else: raise SystemExit('could not segment '+ch)
    for n,(l,(a,b)) in enumerate(zip(letters, segs)):
        # keep the natural decay: extend up to 150 ms (never into the next letter), then a soft fade-out
        nxt = segs[n+1][0]-0.03 if n+1 < len(segs) else len(x)/SR
        a = max(0,a-0.03); b = min(nxt, b+0.15)
        seg = x[int(a*SR):int(b*SR)].copy(); fo=int(0.08*SR); fi=int(0.01*SR)
        seg[:fi] *= np.linspace(0,1,fi); seg[-fo:] *= np.cos(np.linspace(0,np.pi/2,fo))**2
        seg = (seg*32767).astype(np.int16)
        fn = f'{tmp}/{l}.wav'
        with wave.open(fn,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(seg.tobytes())
        dst = os.path.join(OUT,'l',l+'.mp3')
        if os.path.exists(dst): os.remove(dst)
        finish(fn, dst, pad=0.1, norm='peak'); report[l] = round(b-a,2)
print(report); print(json.dumps(stats))
