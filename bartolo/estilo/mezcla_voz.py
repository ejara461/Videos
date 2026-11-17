# Corta la voz por frases, la ubica en cada escena y la mezcla con el fondo provisional.
import subprocess, numpy as np, wave
SR=44100
def load(p):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(raw,np.int16).astype(float)/32768
voz=load('voz/voz_elevenlabs.mp3'); bg=load('estilo/audio_pilot.wav')
DUR=48.0; N=int(DUR*SR)
# (inicio en la voz, fin en la voz, inicio en el video)
SEG=[(0.00,2.73,0.15),(3.19,5.32,2.95),(5.81,8.56,5.60),(8.94,10.14,10.20),(10.47,11.20,12.20),(11.52,12.72,14.20),
     (13.12,14.50,16.40),(14.82,16.87,18.20),(17.35,18.12,21.60),(18.40,20.18,23.20),(20.64,23.04,27.30),(23.42,25.64,30.00),
     (26.10,27.24,33.60),(27.67,29.08,35.90),(29.55,30.68,39.40),(31.15,31.74,41.10),(31.99,32.87,41.85),(33.36,34.86,44.30),(35.18,36.60,46.00)]
vt=np.zeros(N); pres=np.zeros(N)
for a,b,at in SEG:
    s=voz[max(0,int((a-0.04)*SR)):int((b+0.08)*SR)].copy()
    f=int(0.01*SR); s[:f]*=np.linspace(0,1,f); s[-f:]*=np.linspace(1,0,f)
    i=int(at*SR); j=min(N,i+len(s)); vt[i:j]+=s[:j-i]; pres[i:j]=1
# envolvente de atenuacion de la musica (suavizada)
k=int(0.25*SR); ker=np.ones(k)/k; pres=np.convolve(pres,ker,'same'); pres=np.clip(pres*1.5,0,1)
bg=np.pad(bg,(0,max(0,N-len(bg))))[:N]
mix=vt*1.0 + bg*(0.45-0.27*pres)
mix=mix/np.max(np.abs(mix))*0.9
with wave.open('estilo/mezcla_tmp.wav','wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
