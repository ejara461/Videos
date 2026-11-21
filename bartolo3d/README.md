# Bartolo 3D (skill "shorts-animados-3d", estilo caricatura)

Proyecto Remotion + three.js basado en el skill de Crea con LuisPa / Mr omi (licencia MIT):
https://github.com/luispablovillasenor-afk/shorts-animados-claude

- `src/videos/prueba/`: prueba de 5 s, Bartolo en moto por una calle de Bello.
  - Copiados sin cambios del motor del skill (plantilla del puente): `shade.ts`, `lights.ts`, `ink.ts`, `lensblur.ts`, `grade.ts`, `paint.ts`, `cardshade.ts`.
  - Propios: `world.ts` (calle, edificios, cámara, sol) y `Prueba.tsx` (composición y cadena de post).
- Cambio respecto al skill: la cadena de post se arma directamente con `postprocessing` (mismo orden: tinta → desenfoque pre + principal → brillo + tono NEUTRAL + color), porque el componente `<EffectComposer>` de `@react-three/postprocessing` no dibuja con WebGL por software en este servidor sin GPU.

## Renderizar en tu PC (doble clic)

1. Instala **Node.js LTS** desde https://nodejs.org (una sola vez).
2. Descarga el repositorio (botón verde **Code → Download ZIP** en la rama `claude/animation-studio-prompt-91oymm`) y descomprímelo.
3. Entra a la carpeta `bartolo3d`:
   - **Windows:** doble clic en `RENDERIZAR.bat`.
   - **Mac:** doble clic en `RENDERIZAR.command` (la primera vez: clic derecho → Abrir, para autorizarlo).
4. La primera vez instala las librerías y Remotion descarga su navegador (necesita internet).
5. El video queda en `bartolo3d/out/`, con la canción incluida.

Usa la tarjeta gráfica con `--gl=angle`. Para otra composición: `RENDERIZAR.bat NombreComposicion`.

## Renderizar (servidor sin GPU)

```
npm install
npx remotion render src/index.ts Prueba out/prueba_video.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
  --gl=swangle --concurrency=4 --timeout=240000 --codec=h264 --crf=16
```

Fotos sueltas: `node fotos.mjs out/f_ 0,75,149 0.5 Prueba`. Medición: `python3 herramientas/medir_30fps.py video.mp4 salida` (del skill).
Tiempo medido: 5 s de video ≈ 9 min de render (WebGL por software, 4 procesos).
