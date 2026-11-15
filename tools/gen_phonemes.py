#!/usr/bin/env python3
"""Isolated phoneme clips, v3.
 * PRIMARY SOURCE: Open Letter Sounds (Purple Computer, CC0 1.0) for the 26 letter sounds
   a e i o u b c d f g h j k l m n p q(kw) r s t v w x(ks) y z  -> only re-padded / loudness-matched.
   https://github.com/purplecomputerorg/openlettersounds  (set OLS_DIR to its sounds/en-us/marin folder)
 * Everything below is only used for sounds that set lacks (ch sh th dh ng nk oo uu ow oi aw ar or er):
 * Continuous sounds that ElevenLabs can say on their own (mmm, nnn, sss, shh, fff, thhh, zzz, hhh)
   come from DEDICATED recordings (verified with a phoneme recognizer + spectral checks).
 * The rest are cut from carrier words (ElevenLabs + character timestamps):
   stops keep their burst + a tiny, fading unstressed tail (light breath, no full 'buh');
   voiced continuants and vowels take the steady part and are stretched (WSOLA) to ~0.5-0.8 s.
 * Every clip: cosine fade-in/out, 80 ms lead-in + 150 ms tail silence, RMS-normalized.
 * Long vowels A E I O U reuse the letter-name clips.
Usage: ELEVENLABS_API_KEY=... python3 tools/gen_phonemes.py   (cached in ../audio_raw)"""
import os, sys, json, subprocess, tempfile, shutil, numpy as np, wave
sys.path.insert(0, os.path.dirname(__file__))
from gen_audio import tts, OUT, stats
SR = 44100
# dedicated recordings: id -> (prompt, model, speed, stability)
DED = {'sh':('Shhhhh.','eleven_multilingual_v2',.85,.8), 'th':('thhhh','eleven_v3',1.0,.5)}
OLS = {'a':'a','e':'e','i':'i','o':'o','u':'u','b':'b','c':'c','d':'d','f':'f','g':'g','h':'h','j':'j','k':'k','l':'l','m':'m',
       'n':'n','p':'p','kw':'q','r':'r','s':'s','t':'t','v':'v','w':'w','ks':'x','y':'y','z':'z'}
OLS_DIR = os.environ.get('OLS_DIR', os.path.join(os.path.dirname(__file__),'..','..','third_party','openlettersounds-marin'))
# target length (s) for continuous sounds (stretched if shorter)
TARGET = {'m':.75,'n':.7,'s':.7,'sh':.7,'f':.65,'th':.6,'z':.6,'v':.6,'dh':.5,'l':.65,'ng':.6,'r':.5,'h':.3,
          'a':.45,'e':.42,'i':.4,'o':.5,'u':.45,'uu':.45,'ow':.6,'oo':.6,'oi':.6,'aw':.55,'ar':.6,'or':.6,'er':.6}
# carrier words: id -> (word, mode)
CAR = {   # vowel carriers are vowel-initial / open syllables (no consonant before the vowel), checked with tools/vowel_check.py
 'ch':('chug','stop'), 'dh':('this','fric_v'), 'ng':('sing','coda'), 'nk':('sink','coda_keep'),
 'oo':('Ooh!','vowel_open'), 'ow':('Ow!','vowel_open'), 'oi':('Oy!','vowel_open'), 'aw':('awe','vowel_open'),
 'ar':('are','vowel_open'), 'or':('ore','vowel_open'), 'er':('err','vowel_open'), 'uu':('wood','vowel_mid'),
}
LETTER_NAME = {'A':'a','E':'e','I':'i','O':'o','U':'u'}

def load(f):
    raw = subprocess.run(['ffmpeg','-v','error','-i',f,'-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.int16).astype(np.float32)/32768
def wav(x, fn):
    with wave.open(fn,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x,-1,1)*32767).astype(np.int16).tobytes())
def feats(x, hop=0.005, win=0.02):
    h=int(SR*hop); w=int(SR*win); out=[]
    for i in range(0, max(1,len(x)-w), h):
        s=x[i:i+w]; out.append((np.sqrt((s**2).mean()), ((s[:-1]*s[1:])<0).mean()))
    F=np.array(out); return F[:,0], F[:,1], hop
def stretch(x, factor):
    """WSOLA time-stretch via ffmpeg atempo; factor<1 lengthens."""
    if factor >= 0.98: return x
    d = tempfile.mkdtemp(); a=f'{d}/a.wav'; b=f'{d}/b.wav'; wav(x,a); af=[]; s=factor
    while s < 0.999: f=max(0.5,s); af.append(f'atempo={f:.4f}'); s/=f
    subprocess.run(['ffmpeg','-v','error','-y','-i',a,'-af',','.join(af),b],check=True)
    y = load(b); shutil.rmtree(d); return y
def fade(x, fin, fout):
    n=len(x); i=min(int(fin*SR),n//3); o=min(int(fout*SR),n//2); x=x.copy()
    if i: x[:i]*= np.sin(np.linspace(0,np.pi/2,i))**2
    if o: x[-o:]*= np.cos(np.linspace(0,np.pi/2,o))**2
    return x
def finish(x, dst, fin=.025, fout=.08, target=None, rms_db=-21, minf=0.4):
    if target and len(x)/SR < target: x = stretch(x, max(minf, len(x)/SR/target))
    x = fade(x, fin, fout)
    r,_,_ = feats(x); act = r[r > r.max()*0.1]; g = 10**(rms_db/20)/max(1e-6, np.sqrt((act**2).mean()))
    g = min(g, 10**(-1.5/20)/max(1e-6,np.abs(x).max())); x = x*g
    x = np.concatenate([np.zeros(int(.08*SR)), x, np.zeros(int(.15*SR))])
    d=tempfile.mkdtemp(); a=f'{d}/a.wav'; wav(x,a)
    subprocess.run(['ffmpeg','-v','error','-y','-i',a,'-ac','1','-ar','44100','-b:a','64k',dst],check=True); shutil.rmtree(d)
    return round(len(x)/SR - .23, 3)
def active(r, thr):
    idx=np.where(r>thr)[0]; return idx[0], idx[-1]
def S(t): return int(t*SR)

def main():
    os.makedirs(os.path.join(OUT,'p'), exist_ok=True)
    mpath=os.path.join(OUT,'manifest.json'); manifest=json.load(open(mpath)); manifest.setdefault('p',{}); report={}
    for pid,(txt,model,spd,stab) in DED.items():
        x = load(tts(txt, model=model, speed=spd, stability=stab)); r,z,hop = feats(x)
        k0,k1 = active(r, r.max()*0.08)
        if pid=='h':  # keep only the breathy part before any vowel
            k=k0
            while k<k1 and not (z[k]<0.12 and r[k]>r.max()*0.3): k+=1
            k1=k
        seg = x[S(max(0,k0*hop-.01)):S(k1*hop+.03)]
        D = finish(seg, os.path.join(OUT,'p',pid+'.mp3'), fin=.04, fout=.12, target=TARGET.get(pid))
        report[pid]={'source':f'dedicated "{txt}" ({model})','dur':D}
    for pid,(word,mode) in CAR.items():
        x = load(tts(word if word[-1] in '!.' else word+'.', speed=0.8, stability=0.7, timestamps=True)); r,z,hop = feats(x); pk=r.max()
        k0,k1 = active(r, max(pk*0.02,.003)); t_a0=k0*hop; t_a1=k1*hop+.02
        vi=[k for k in range(k0+2,k1) if r[k]>pk*0.5]; v0 = vi[0]*hop if vi else t_a0+.08   # loud vowel onset
        dst=os.path.join(OUT,'p',pid+'.mp3'); fin,fout,tgt=.008,.05,None
        if mode in ('stop','stop_kw'):           # burst + aspiration + ~30 ms fading vowel onset
            t0=max(0,t_a0-.015); t1=v0+(.11 if mode=='stop_kw' else .05); fout=.045 if mode=='stop' else .06
        elif mode=='stop_v':                    # (pre-voicing) burst + ~70 ms of a fading light vowel
            t0=max(0,t_a0-.015); t1=min(v0+.08, t_a0+.24); fout=.065
        elif mode in ('glide','glide_long'):
            t0=max(0,t_a0-.01); t1=v0+(.07 if mode=='glide' else .05); fin=.02; fout=.06
            if mode=='glide_long':  # r: stretch only the r colouring before the vowel
                k=k0
                while k<k1 and r[k]<pk*0.5: k+=1
                t1=max(k*hop, t_a0+.08)+.03; fout=.08; tgt=TARGET['r']
        elif mode=='fric_v':                    # onset v/dh up to the loud vowel
            k=k0+4
            while k<k1 and r[k]<pk*0.45: k+=1
            t0=max(0,t_a0-.005); t1=k*hop-.005; fin=.03; fout=.07; tgt=TARGET[pid]
        elif mode in ('coda','coda_keep'):
            kv=int(np.argmax(r)); k=kv
            while k<k1 and r[k]>pk*0.45: k+=1
            t0=k*hop+.015; t1=t_a1
            if mode=='coda':
                kk=int(t0/hop)+4
                while kk<k1 and z[kk]<0.25 and r[kk]>pk*0.03: kk+=1
                t1=min(t_a1,kk*hop); tgt=TARGET[pid]
            fin=.03; fout=.09
        elif mode in ('vowel_open','vowel_closed'):   # loud voiced nucleus, open = keep natural decay
            idx=[k for k in range(k0,k1+1) if r[k]>pk*0.35 and z[k]<0.2]; s0=idx[0]
            if mode=='vowel_open':
                e0=idx[-1]
                while e0<k1 and r[e0]>pk*0.08 and z[e0]<0.2: e0+=1
            else:
                e0=int(np.argmax(r))
                while e0<k1 and r[e0]>pk*0.35 and z[e0]<0.2: e0+=1
            t0=s0*hop+.01; t1=e0*hop; fin=.04; fout=.1; tgt=TARGET[pid]
        elif mode=='vowel_mid':                    # consonant-bounded: middle of the nucleus only
            kp=int(np.argmax(r)); a_=kp; b_=kp
            while a_>0 and r[a_]>pk*0.5 and z[a_]<0.2: a_-=1
            while b_<len(r)-1 and r[b_]>pk*0.5 and z[b_]<0.2: b_+=1
            L=b_-a_; t0=(a_+int(L*.25))*hop; t1=(b_-int(L*.1))*hop; fin=.04; fout=.1; tgt=.4
        elif mode=='vowel':                     # longest voiced run, drop onset consonant transition
            runs=[]; s=None
            for k in range(k0,k1+1):
                v = r[k]>pk*0.06 and z[k]<0.2
                if v and s is None: s=k
                if (not v or k==k1) and s is not None: runs.append((s,k)); s=None
            s,e=max(runs,key=lambda q:q[1]-q[0])
            ks=s
            while ks<e and r[ks]<pk*0.35: ks+=1          # skip h/b/s onset murmur: start at the loud vowel
            if word in ('hiss','hood'):                 # closed syllable: stop before the final consonant
                kp=int(np.argmax(r)); ke=kp
                while ke<e and r[ke]>pk*(0.18 if word=='hiss' else 0.3): ke+=1
                e=ke
            t0=ks*hop-.01; t1=e*hop+.01; fin=.06; fout=.12; tgt=TARGET[pid]
        D = finish(x[S(t0):S(t1)], dst, fin=fin, fout=fout, target=tgt, minf=0.3 if mode in ('fric_v','vowel','coda','vowel_mid') else (0.35 if mode.startswith('vowel') else 0.4))
        report[pid]={'source':f'carrier "{word}" ({mode})','dur':D}
    for pid,l in OLS.items():
        x = load(os.path.join(OLS_DIR, l+'.wav'))
        D = finish(x, os.path.join(OUT,'p',pid+'.mp3'), fin=.004, fout=.012)   # already trimmed & faded by the authors
        report[pid]={'source':f'Open Letter Sounds {l}.wav (CC0 1.0, Purple Computer)','dur':D}
    for pid,l in LETTER_NAME.items():
        shutil.copy(os.path.join(OUT,'l',l+'.mp3'), os.path.join(OUT,'p',pid+'.mp3')); report[pid]={'source':'letter name','dur':None}
    for pid in list(DED)+list(CAR)+list(OLS)+list(LETTER_NAME): manifest['p'][pid]=f'p/{pid}.mp3'
    json.dump(manifest, open(mpath,'w'), ensure_ascii=False, indent=0, sort_keys=True)
    json.dump(report, open(os.path.join(os.path.dirname(__file__),'phoneme_report.json'),'w'), indent=1, ensure_ascii=False)
    print(json.dumps(stats))
if __name__=='__main__': main()
