# Mezcla final del piloto: musica (3 pistas de Gemini) + voz (ElevenLabs) + efectos de 8 bits.
import subprocess, numpy as np, wave
SR=44100; DUR=48.0; N=int(DUR*SR)
def load(p,ch=2):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-f','s16le','-ac',str(ch),'-ar',str(SR),'-'],capture_output=True).stdout
    x=np.frombuffer(raw,np.int16).astype(float)/32768
    return x.reshape(-1,ch) if ch>1 else x
M='../musica/'
# (archivo, desde, hasta, posicion en el video)
PARTES=[(M+'alegre_golden_hour_fiesta.mp3',0.0,21.5,0.0),
        (M+'triste_the_fading_afternoon.mp3',0.0,12.6,20.5),
        (M+'esperanza_first_light_on_the_porch.mp3',50.0,65.5,32.5)]
mus=np.zeros((N,2)); XF=1.0
for k,(f,a,b,at) in enumerate(PARTES):
    x=load(f)[int(a*SR):int(b*SR)].copy()
    n=int(XF*SR)
    if k>0: x[:n]*=np.linspace(0,1,n)[:,None]
    if k<len(PARTES)-1: x[-n:]*=np.linspace(1,0,n)[:,None]
    i=int(at*SR); j=min(N,i+len(x)); mus[i:j]+=x[:j-i]
fo=int(1.2*SR); mus[-fo:]*=np.linspace(1,0,fo)[:,None]
# voz por frases
voz=load('../voz/voz_elevenlabs.mp3',1)
SEG=[(0.00,2.73,0.15),(3.19,5.32,2.95),(5.81,8.56,5.60),(8.94,10.14,10.20),(10.47,11.20,12.20),(11.52,12.72,14.20),
     (13.12,14.50,16.40),(14.82,16.87,18.20),(17.35,18.12,21.60),(18.40,20.18,23.20),(20.64,23.04,27.30),(23.42,25.64,30.00),
     (26.10,27.24,33.60),(27.67,29.08,35.90),(29.55,30.68,39.40),(31.15,31.74,41.10),(31.99,32.87,41.85),(33.36,34.86,44.30),(35.18,36.60,46.00)]
vt=np.zeros(N); pres=np.zeros(N)
for a,b,at in SEG:
    s=voz[max(0,int((a-0.04)*SR)):int((b+0.08)*SR)].copy(); f=int(0.01*SR); s[:f]*=np.linspace(0,1,f); s[-f:]*=np.linspace(1,0,f)
    i=int(at*SR); j=min(N,i+len(s)); vt[i:j]+=s[:j-i]; pres[i:j]=1
k=int(0.3*SR); pres=np.clip(np.convolve(pres,np.ones(k)/k,'same')*1.5,0,1)
fx=load('efectos_pilot.wav',1); fx=np.pad(fx,(0,max(0,N-len(fx))))[:N]
duck=(0.32-0.20*pres)[:,None]          # la musica baja cuando habla el narrador
mix=mus*duck + vt[:,None]*1.0 + fx[:,None]*0.35
mix=mix/np.max(np.abs(mix))*0.9
with wave.open('mezcla_tmp.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
