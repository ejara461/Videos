# Audio del Short de lluvia: música (Gemini) + voz (ElevenLabs) + lluvia ambiente, truenos suaves y efectos.
import subprocess, numpy as np, wave
SR=44100; DUR=60.0; N=int(DUR*SR); rng=np.random.default_rng(13)
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
PARTES=[(M+'triste_the_fading_afternoon.mp3',0.0,25.0,0.0),(M+'esperanza_first_light_on_the_porch.mp3',0.0,14.6,24.4),
        (M+'esperanza_first_light_on_the_porch.mp3',44.6,66.2,38.4)]
mus=np.zeros((N,2))
for k,(f,a,b,at) in enumerate(PARTES):
    x=load(f)[int(a*SR):int(b*SR)].copy(); n=int(0.6*SR)
    if k>0: x[:n]*=np.linspace(0,1,n)[:,None]
    if k<len(PARTES)-1: x[-n:]*=np.linspace(1,0,n)[:,None]
    i=int(at*SR); j=min(N,i+len(x)); mus[i:j]+=x[:j-i]
fo=int(1.0*SR); mus[-fo:]*=np.linspace(1,0,fo)[:,None]
voz=load('../voz/voz_lluvia_elevenlabs.mp3',1)
SEG=[(0.06,1.62,0.2),(1.92,3.12,1.9),(3.64,5.20,3.3),(5.88,7.66,5.8),(8.10,9.00,7.9),(9.56,10.76,9.8),(11.18,12.40,11.3),
     (12.96,15.86,13.2),(16.12,17.06,16.3),(17.58,19.14,17.8),(19.40,20.16,19.6),(20.76,21.90,21.2),(22.14,23.56,22.6),
     (24.08,24.74,24.6),(25.00,25.96,25.5),(26.40,28.20,31.8),(28.76,30.38,38.6),(30.68,31.06,40.6),(31.42,32.32,41.3),
     (32.80,33.86,43.8),(34.40,40.50,45.3),(40.55,46.92,52.0)]
vt=np.zeros(N); pres=np.zeros(N)
for n_,(a,b,at) in enumerate(SEG):
    nxt=SEG[n_+1][0]-0.05 if n_+1<len(SEG) else len(voz)/SR
    s=voz[max(0,int((a-0.04)*SR)):int(min(b+0.22,nxt)*SR)].copy(); f=int(0.01*SR); s[:f]*=np.linspace(0,1,f); s[-f:]*=np.linspace(1,0,f)
    i=int(at*SR); j=min(N,i+len(s)); vt[i:j]+=s[:j-i]; pres[i:j]=1
k=int(0.3*SR); pres=np.clip(np.convolve(pres,np.ones(k)/k,'same')*1.5,0,1)
fx=np.zeros(N)
def add(sig,at,g): i=int(at*SR); j=min(N,i+len(sig)); fx[i:j]+=sig[:j-i]*g
# lluvia ambiente: ruido filtrado; fuerte afuera, apagada adentro, se va al escampar
rain=lp(rng.uniform(-1,1,N),0.35); rain=rain/np.max(np.abs(rain))
tt=np.arange(N)/SR
lvl=np.interp(tt,[0,1,24.4,24.6,31.6,38.4,38.6,43.6,46.5,48.6,60],[0,1,1,0.25,0.25,0.25,0.35,0.35,0.15,0,0])
fx+=rain*lvl*0.35
sq=lambda f,d: np.sign(np.sin(2*np.pi*f*T(d)))*0.5
def lose(at):
    for q,f in enumerate([660,494,330]): add(sq(f,0.09)*env(int(SR*0.09)),at+q*0.08,0.5)
def gain(at):
    for q,f in enumerate([523,659,784,1046]): add(sq(f,0.07)*env(int(SR*0.07)),at+q*0.06,0.4)
def pop(at): add(np.sin(2*np.pi*np.cumsum(np.linspace(300,700,int(SR*0.07)))/SR)*env(int(SR*0.07)),at,0.6)
def thunder(at,g):   # trueno suave: retumbo grave filtrado, sin golpe seco
    d=2.4; y=lp(rng.uniform(-1,1,int(SR*d)),0.012); y/=np.max(np.abs(y))
    e=np.exp(-T(d)*1.6)*(1-np.exp(-T(d)*12)); add(y*e,at,g)
for at in L if False else [10.6,15.0,18.6]: lose(at)
for at in [39.6,40.3,41.0]: gain(at)
for at in [25.8,27.1,28.4,29.7,32.8,34.1,35.4]: pop(at)
for at,g in [(3.1,0.6),(21.7,0.9),(23.3,0.7)]: thunder(at,g)
t=T(5.6); m=np.sign(np.sin(2*np.pi*np.cumsum(70+4*np.sin(2*np.pi*0.5*t))/SR))*0.3; y=lp(m,0.05)
add(y*env(len(y),0.3,0.6),0.0,1.2)
mix=mus*(0.32-0.20*pres)[:,None]+vt[:,None]+fx[:,None]*0.35
mix=mix/np.max(np.abs(mix))*0.9
with wave.open('mezcla_lluvia_tmp.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
