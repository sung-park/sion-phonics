#!/usr/bin/env python3
"""Check phoneme clips: wav2vec2 phoneme recognizer (espeak IPA) + LPC formants (F1/F2, middle of the voiced part).
Usage: python3 tools/vowel_check.py file1 [file2 ...]"""
import sys, subprocess, numpy as np, torch
from transformers import AutoProcessor, AutoModelForCTC
M = 'facebook/wav2vec2-lv-60-espeak-cv-ft'
proc = AutoProcessor.from_pretrained(M); model = AutoModelForCTC.from_pretrained(M).eval()
def load(f, sr=16000):
    raw = subprocess.run(['ffmpeg','-v','error','-i',f,'-f','s16le','-ac','1','-ar',str(sr),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.int16).astype(np.float32)/32768
def recog(x):
    x = np.concatenate([np.zeros(3200,np.float32), x, np.zeros(3200,np.float32)])
    iv = proc(x, sampling_rate=16000, return_tensors='pt').input_values
    with torch.no_grad(): ids = model(iv).logits.argmax(-1)
    return proc.batch_decode(ids)[0]
def lpc(frame, order):
    r = np.correlate(frame, frame, 'full')[len(frame)-1:len(frame)+order]
    a = np.zeros(order+1); a[0]=1; e=r[0]
    for i in range(1,order+1):
        k = -(r[i] + a[1:i] @ r[i-1:0:-1]) / e; a[1:i] = a[1:i] + k*a[i-1:0:-1]; a[i]=k; e *= (1-k*k)
    return a
def formants(x, sr=11025):
    h=int(.025*sr); st=int(.01*sr); F=[]
    rms = np.array([np.sqrt((x[i:i+h]**2).mean()) for i in range(0,len(x)-h,st)])
    if not len(rms): return None
    on = np.where(rms > rms.max()*0.3)[0]; mid = on[len(on)//4: max(len(on)//4+1, 3*len(on)//4)]
    for k in mid:
        fr = x[k*st:k*st+h]*np.hamming(h); fr = np.append(fr[0], fr[1:]-0.63*fr[:-1])
        roots = [z for z in np.roots(lpc(fr, 12)) if np.imag(z) > 0]
        fs = sorted(f for f,bw in ((np.angle(z)*sr/2/np.pi, -sr/np.pi*np.log(abs(z))) for z in roots) if 150 < f < 4000 and bw < 600)
        fs = [f for f in fs if f > 280]          # drop f0 / voice-bar poles
        if len(fs) >= 2: F.append(fs[:2])
    return np.median(np.array(F),axis=0).round() if F else None
if __name__ == '__main__':
    for f in sys.argv[1:]:
        print(f.split('/')[-1], '| rec:', recog(load(f)), '| F1,F2:', formants(load(f,11025)))
