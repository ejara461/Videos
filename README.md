# Videos — Bartolo Pet Shop Delivery (Bello, Antioquia)

Videos animados para el canal de YouTube Shorts de la tienda: tips de cuidado y alimentación de mascotas.

## Videos terminados

| Archivo | Descripción |
|---|---|
| `bartolo/piloto_max_final.mp4` | **Piloto "Lo que comía Max"** (48 s, 9:16). Estilo minimalista con corazones en pixel art y tipografía animada. Guion validado por el veterinario Jovany. |
| `bartolo/gatos_arena_lila_final.mp4` | **"La arena de Lila"** (58 s, 9:16). Cuidado de la caja de arena y tipos de arena. Guion validado por el veterinario Jovany. |
| `bartolo/bano_bartolo_final.mp4` | **"El baño de Bartolo"** (54,5 s, 9:16, de día). Frecuencia del baño y seis cuidados al bañar. Guion validado por el veterinario Jovany. |
| `bartolo/polvora_max_final.mp4` | **"La alborada de Max"** (54,5 s, 9:16, noche con alumbrados). Cómo proteger a la mascota de la pólvora. Guion validado por el veterinario Jovany. |
| `bartolo/bartolo_convivencia.mp4` | "Domicilios de buena convivencia" (40 s, 9:16). Primer video, estilo 2D plano: traílla y recolección de excrementos en zonas comunes. |

## Material reutilizable

| Carpeta / archivo | Contenido |
|---|---|
| `calendario_contenidos.md` | Calendario de Shorts (17 nov 2026 a 12 ene 2027) y flujo de producción. |
| `bartolo/musica/` | Pistas generadas en Gemini por emoción: `alegre_golden_hour_fiesta.mp3`, `triste_the_fading_afternoon.mp3`, `esperanza_first_light_on_the_porch.mp3` (unos 65 s cada una) y `dia_coffee_and_clear_skies.mp3` (70 s, tono de día). |
| `bartolo/voz/` | Locuciones generadas en ElevenLabs (voz Brayan Jackson, Cheerful): piloto y Short de gatos. |
| `bartolo/estilo/lib_gatos.js` | Lila (sentada, caminando, dormida), su dueña, caja de arena y atomizador. |
| `bartolo/estilo/lib_bano.js` | Recursos de día: calle y patio, tina, espuma, vapor, champú, jarra, toalla, gotas y destellos. Bartolo admite `noCap` y `noBag`. |
| `bartolo/estilo/lib_polvora.js` | Edificios con alumbrados decembrinos, guirnaldas, estrella, fuegos artificiales, aviso "¡BUM!", balcón y Max asustado. |
| `bartolo/estilo/ficha_lila_duena.png` | Ficha de Lila y su dueña con expresiones. |
| `bartolo/bartolo_scooter.png` | Imagen original de Bartolo en moto, recortada con fondo transparente. |
| `bartolo/estilo/lib.js` | Biblioteca de dibujo del estilo minimalista: Bartolo, Max, el dueño, corazones en pixel art, iconos de alimentos y fondos. |
| `bartolo/estilo/cuadro_sheet.png` | Ficha de Bartolo en estilo minimalista, con expresiones. |
| `bartolo/guion_piloto.md` | Guion del piloto con el estilo aprobado, la paleta y los pendientes. |
| `bartolo/guion_locucion.md` | Guion e instrucciones de grabación de voz del primer video. |

## Estilo aprobado para el canal

- Base minimalista (personajes en forma de frijol, trazo fino, atmósfera nocturna con viñeta y resplandor).
- Paleta de marca: verde azulado `#2F8F8D`, azul oscuro `#182939`, crema `#F4DBB9`, terracota `#C2624F`.
- Recurso simbólico: barra de 5 corazones en pixel art sobre la mascota (se pierden con malos hábitos y se recuperan con buen cuidado).
- Tipografía animada solo para el tip. Subtítulos en Comic Neue Bold.

## Cómo regenerar un video

Requiere Node.js con Playwright, Python 3 con NumPy y ffmpeg.

1. Escenas: `bartolo/estilo/pilot.html` (función `render(t)`).
2. Cuadros: desde `bartolo/`, `FRAMES=<carpeta> node estilo/render_pilot.js`.
3. Audio: `python3 estilo/mezcla_final.py` y normalización con `ffmpeg -af loudnorm=I=-14:TP=-1.5`.
4. Unión: `ffmpeg -framerate 30 -i <carpeta>/f_%05d.jpg -i estilo/audio_piloto_final.wav -c:v libx264 -pix_fmt yuv420p -c:a aac salida.mp4`.

## Derechos de uso

Antes de publicar, confirmar el uso comercial de la voz (según el plan de ElevenLabs) y de la música (según las condiciones de Google para Gemini).
