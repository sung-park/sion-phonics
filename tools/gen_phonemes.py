#!/usr/bin/env python3
"""Build isolated phoneme clips by cutting them out of carefully chosen carrier words
(ElevenLabs TTS + character timestamps), so stops are clipped (no 'buh') and
continuous sounds can be stretched (mmm, sss). Long vowels reuse letter-name clips."""
import os, sys, json, subprocess, numpy as np, shutil
sys.path.insert(0, os.path.dirname(__file__))
from gen_audio import tts, OUT, stats
SR = 16000
# id: (carrier, mode, target chars)
PH = {
 'b':('bat','onset_voiced',None), 'd':('dog','onset_voiced',None), 'g':('got','onset_voiced',None), 'j':('jet','onset_voiced',None),
 'p':('pin','onset_voiceless',None), 't':('top','onset_voiceless',None), 'c':('cat','onset_voiceless',None), 'k':('kit','onset_voiceless',None),
 'ch':('chip','onset_voiceless',None), 'h':('hat','onset_voiceless',None), 'kw':('quick','onset_kw',None),
 's':('sun','onset_fric',None), 'z':('zoo','onset_fric',None), 'f':('fan','onset_fric',None), 'v':('van','onset_fric',None), 'sh':('ship','onset_fric',None),
 'th':('thin','onset_fric',None), 'dh':('this','onset_fric',None), 'ks':('box','coda','x'), 'm':('hum','coda','m'), 'n':('sun','coda','n'),
 'l':('bell','coda','ll'), 'ng':('sing','coda','ng'), 'nk':('sink','coda','nk'),
 'r':('red','onset_glide','e'), 'w':('wet','onset_glide','e'), 'y':('yes','onset_glide','e'),
 'a':('at','vowel','t'), 'e':('egg','vowel','gg'), 'i':('it','vowel','t'), 'o':('ox','vowel','x'), 'u':('up','vowel','p'),
 'ow':('out','vowel','t'), 'oo':('zoo','coda','oo'), 'uu':('book','mid','oo'), 'oi':('boy','coda','oy'), 'aw':('saw','coda','aw'),
 'ar':('are','whole',None), 'or':('or','whole',None), 'er':('her','coda','er'),
}
LETTER_NAME = {'A':'a','E':'e','I':'i','O':'o','U':'u'}
CONT = {'s','z','f','v','sh','th','dh','m','n','l','ng','r'}
VOW = {'a','e','i','o','u','ow','oo','uu','oi','aw','ar','or','er'}

def load(f):
    raw = subprocess.run(['ffmpeg','-v','error','-i',f,'-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.int16).astype(np.float32)/32768

def frames(x, hop=0.005, win=0.02):
    h=int(SR*hop); w=int(SR*win); out=[]; win_f=np.hanning(w)
    for i in range(0, max(1,len(x)-w), h):
        s=x[i:i+w]; S=np.abs(np.fft.rfft(s*win_f))**2; tot=S.sum()+1e-12
        hf=S[int(3000/SR*w):].sum()/tot
        out.append((np.sqrt((s**2).mean()), ((s[:-1]*s[1:])<0).mean(), hf))
    return np.array(out), hop

def cut(src, t0, t1, dst, stretch=1.0, fade=0.012):
    d = max(0.03, t1-t0)
    af = [f'atrim=start={t0:.3f}:end={t1:.3f}', 'asetpts=PTS-STARTPTS']
    s = stretch
    while s < 0.999:  # atempo<1 slows down (lengthens)
        f = max(0.5, s); af.append(f'atempo={f:.3f}'); s /= f
    D = d/stretch
    af += [f'afade=t=in:d={min(fade,D/4):.3f}', f'afade=t=out:st={max(0,D-0.03):.3f}:d={min(0.03,D/3):.3f}',
           'adelay=40:all=1', 'apad=pad_dur=0.06', 'loudnorm=I=-17:TP=-2']
    subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',','.join(af),'-ac','1','-ar','44100','-b:a','64k',dst],check=True)
    return D

def find_span(word, al, target):
    chars = ''.join(al['characters']); i = chars.lower().find(target)
    if i < 0: raise ValueError((word, chars, target))
    return al['character_start_times_seconds'][i], al['character_end_times_seconds'][i+len(target)-1]

def main():
    os.makedirs(os.path.join(OUT,'p'), exist_ok=True)
    report = {}
    mpath = os.path.join(OUT,'manifest.json'); manifest = json.load(open(mpath)); manifest.setdefault('p',{})
    for pid,(word,mode,tgt) in PH.items():
        src = tts(word + '.', speed=0.8, stability=0.7, timestamps=True)
        al = json.load(open(src+'.json')); x = load(src); F, hop = frames(x)
        rms = F[:,0]; zcr = F[:,1]; hf = F[:,2]; peak = rms.max(); act = np.where(rms > max(peak*0.02, 0.003))[0]
        a0, a1 = act[0]*hop, act[-1]*hop + 0.015
        voiced = (rms > peak*0.18) & (zcr < 0.18)
        dst = os.path.join(OUT,'p',pid+'.mp3'); note=''
        if mode in ('onset_voiceless','onset_voiced','onset_kw'):
            vi = np.where(voiced & (np.arange(len(rms))*hop > a0+0.01))[0]
            v0 = vi[0]*hop if len(vi) else a0+0.08
            extra = {'onset_voiceless':0.012, 'onset_voiced':0.035, 'onset_kw':0.09}[mode]
            t0 = max(0, a0-0.01); t1 = v0 + extra
            if mode=='onset_voiced':  # include pre-voicing murmur but keep vowel tail tiny
                t1 = min(t1, a0 + 0.16)
            D = cut(src, t0, t1, dst)
        elif mode == 'onset_fric':
            k = int(a0/hop)+6
            if pid in ('z','v','dh'):
                while k < len(rms) and rms[k] < peak*0.45: k += 1
            else:
                while k < len(rms) and not (hf[k] < 0.12 and rms[k] > peak*0.2): k += 1
            t0 = max(0,a0-0.005); t1 = k*hop - 0.01
            dur = t1-t0; stretch = max(0.35, dur/0.45) if dur < 0.45 else 1.0
            D = cut(src, t0, t1, dst, stretch=stretch)
        elif mode == 'onset_glide':
            s,_ = find_span(word, al, tgt); t0 = max(0,a0-0.01); t1 = s + 0.03
            D = cut(src, t0, t1, dst, stretch=0.8)
        elif mode == 'coda':
            s,e = find_span(word, al, tgt)
            t0 = s
            if pid in ('s','f','sh','th','ks','z','v','dh'):  # start where frication noise starts
                idx = [k for k in range(int((s-0.08)/hop), len(zcr)) if k>=0 and zcr[k]>0.25 and rms[k]>peak*0.02]
                if pid in ('z','v','dh'): idx = [k for k in range(int(s/hop), len(zcr)) if zcr[k]>0.12 and rms[k]>peak*0.02]
                if idx: t0 = idx[0]*hop
            else:  # nasal/liquid/vowel coda: start where loud vowel energy has dropped
                kv = int(np.argmax(rms)); k = kv
                if pid in ('m','n','l','ng','nk'):
                    while k < len(rms) and rms[k] > peak*0.45: k += 1
                    t0 = max(k*hop + 0.015, s)
                else:
                    t0 = s + 0.02
            t1 = a1
            if pid in ('m','n','l','ng'):  # stop before any release breath
                kk = int(t0/hop)+4
                while kk < len(rms) and hf[kk] < 0.15 and rms[kk] > peak*0.03: kk += 1
                t1 = min(a1, kk*hop)
            dur = t1 - t0; stretch = 1.0
            if pid in CONT and dur < 0.5: stretch = max(0.4, dur/0.5)
            if pid in VOW and dur < 0.32: stretch = max(0.6, dur/0.32)
            D = cut(src, t0, t1, dst, stretch=stretch)
        elif mode == 'vowel':
            s,_ = find_span(word, al, tgt)
            # end where energy falls (closure) after vowel start
            k0 = int(a0/hop)+4; k = k0
            while k < len(rms) and rms[k] > peak*0.12 and k*hop < s+0.04: k += 1
            t0 = max(0,a0-0.005); t1 = k*hop
            dur = t1-t0; stretch = max(0.6, dur/0.32) if dur < 0.32 else 1.0
            D = cut(src, t0, t1, dst, stretch=stretch)
        elif mode == 'mid':
            s,e = find_span(word, al, tgt)
            D = cut(src, s+0.01, e-0.01, dst, stretch=0.7)
        elif mode == 'whole':
            D = cut(src, max(0,a0-0.01), a1, dst)
        report[pid] = {'carrier':word, 'mode':mode, 'dur':round(D,3)}
        manifest['p'][pid] = f'p/{pid}.mp3'
    for pid, l in LETTER_NAME.items():
        shutil.copy(os.path.join(OUT,'l',l+'.mp3'), os.path.join(OUT,'p',pid+'.mp3'))
        manifest['p'][pid] = f'p/{pid}.mp3'; report[pid] = {'carrier':'letter name '+pid, 'mode':'letter','dur':None}
    json.dump(manifest, open(mpath,'w'), ensure_ascii=False, indent=0, sort_keys=True)
    json.dump(report, open(os.path.join(os.path.dirname(__file__),'phoneme_report.json'),'w'), indent=1)
    print(json.dumps(stats))
main()
