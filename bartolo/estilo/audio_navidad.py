# Audio "La Navidad de Canela": música (Gemini) + voz (ElevenLabs) + efectos.
import subprocess, numpy as np, wave
SR=44100; DUR=68.0; N=int(DUR*SR); rng=np.random.default_rng(17)
def load(p,ch=2):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-f','s16le','-ac',str(ch),'-ar',str(SR),'-'],capture_output=True).stdout
    x=np.frombuffer(raw,np.int16).astype(float)/32768; return x.reshape(-1,ch) if ch>1 else x
def T(d): return np.arange(int(SR*d))/SR
def env(n,a=0.003,r=0.03):
    e=np.ones(n); ai=max(1,int(a*SR)); ri=max(1,int(r*SR)); e[:ai]=np.linspace(0,1,ai); e[-ri:]*=np.linspace(1,0,ri); return e
def lp(x,k):
    y=np.zeros_like(x); a=0.0
    for i in range(len(x)): a+=k*(x[i]-a); y[i]=a
    return y
M='../musica/'
PARTES=[(M+'alegre_golden_hour_fiesta.mp3',0.0,16.2,0.0),(M+'triste_the_fading_afternoon.mp3',0.0,5.4,15.3),
        (M+'esperanza_first_light_on_the_porch.mp3',0.0,31.8,19.8),(M+'esperanza_first_light_on_the_porch.mp3',48.6,66.2,51.0)]
mus=np.zeros((N,2))
for k,(f,a,b,at) in enumerate(PARTES):
    x=load(f)[int(a*SR):int(b*SR)].copy(); n=int(0.6*SR)
    if k>0: x[:n]*=np.linspace(0,1,n)[:,None]
    if k<len(PARTES)-1: x[-n:]*=np.linspace(1,0,n)[:,None]
    i=int(at*SR); j=min(N,i+len(x)); mus[i:j]+=x[:j-i]
fo=int(1.0*SR); mus[-fo:]*=np.linspace(1,0,fo)[:,None]
voz=load('../voz/voz_navidad_elevenlabs.mp3',1)
SEG=[(0.04,1.04,0.2),(1.32,3.18,1.4),(3.84,6.54,3.8),(6.96,8.28,7.2),(8.58,9.24,8.8),(9.64,11.72,10.4),(12.06,12.76,13.0),
     (12.98,13.90,13.9),(14.36,15.78,15.8),(16.14,17.84,17.5),(18.34,21.64,20.2),(22.08,24.62,23.9),(25.06,26.66,26.8),
     (27.06,28.94,28.8),(29.38,33.06,31.1),(33.54,35.00,35.2),(35.36,37.02,37.6),(37.34,41.38,39.6),(41.76,45.80,44.0),
     (46.30,48.68,48.4),(49.20,49.80,51.4),(50.10,51.14,52.2),(51.40,51.96,55.2),(52.46,53.94,56.0),(54.16,55.28,57.6),
     (55.40,63.01,59.3)]
vt=np.zeros(N); pres=np.zeros(N)
for n_,(a,b,at) in enumerate(SEG):
    nxt=SEG[n_+1][0]-0.05 if n_+1<len(SEG) else len(voz)/SR
    s=voz[max(0,int((a-0.04)*SR)):int(min(b+0.22,nxt)*SR)].copy(); f=int(0.01*SR); s[:f]*=np.linspace(0,1,f); s[-f:]*=np.linspace(1,0,f)
    i=int(at*SR); j=min(N,i+len(s)); vt[i:j]+=s[:j-i]; pres[i:j]=1
k=int(0.3*SR); pres=np.clip(np.convolve(pres,np.ones(k)/k,'same')*1.5,0,1)
fx=np.zeros(N)
def add(sig,at,g): i=int(at*SR); j=min(N,i+len(sig)); fx[i:j]+=sig[:j-i]*g
sq=lambda f,d: np.sign(np.sin(2*np.pi*f*T(d)))*0.5
def lose(at):
    for q,f in enumerate([660,494,330]): add(sq(f,0.09)*env(int(SR*0.09)),at+q*0.08,0.5)
def gain(at):
    for q,f in enumerate([523,659,784,1046]): add(sq(f,0.07)*env(int(SR*0.07)),at+q*0.06,0.4)
def pop(at): add(np.sin(2*np.pi*np.cumsum(np.linspace(300,700,int(SR*0.07)))/SR)*env(int(SR*0.07)),at,0.6)
def bell(at,g):
    t=T(1.2); add((np.sin(2*np.pi*1318*t)+0.5*np.sin(2*np.pi*2637*t))*np.exp(-t*4),at,g)
for at in [9.4,12.0,15.0]: lose(at)
for at in [52.4,53.1,53.8]: gain(at)
for at in [23.9,26.8,28.8,31.1,35.2,37.6,39.6,44.0]: pop(at)
for at in [3.7,4.3,59.1]: bell(at,0.25)
t=T(3.6); m=np.sign(np.sin(2*np.pi*np.cumsum(70+4*np.sin(2*np.pi*0.5*t))/SR))*0.3; y=lp(m,0.05)
add(y*env(len(y),0.3,0.5),0.0,1.2)
mix=mus*(0.32-0.20*pres)[:,None]+vt[:,None]+fx[:,None]*0.35
mix=mix/np.max(np.abs(mix))*0.9
with wave.open('mezcla_navidad_tmp.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
