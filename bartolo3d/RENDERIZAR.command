#!/bin/bash
# Bartolo 3D - Render del video (Mac). Doble clic en Finder.
cd "$(dirname "$0")" || exit 1
echo "=============================================="
echo "  Bartolo 3D - Render del video"
echo "=============================================="
fin() { echo; read -n 1 -s -r -p "Presiona una tecla para cerrar..."; echo; exit "$1"; }
if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] No encuentro Node.js. Instala la version LTS desde https://nodejs.org y vuelve a intentar."; fin 1
fi
echo "Node.js encontrado: $(node -v)"
[ -f public/bartolo_moto.png ] || { echo "[ERROR] Falta public/bartolo_moto.png. Descarga la carpeta completa."; fin 1; }
if [ ! -d node_modules ]; then
  echo; echo "Instalando librerias. Solo pasa la primera vez y puede tardar unos minutos..."
  npm install --no-audit --no-fund || { echo "[ERROR] Fallo la instalacion de librerias."; fin 1; }
fi
COMP="${1:-Prueba}"
mkdir -p out
SALIDA="out/${COMP}_$(date +%Y%m%d_%H%M).mp4"
echo; echo "Renderizando \"$COMP\" con la tarjeta grafica (ANGLE)..."
echo "La primera vez Remotion descarga su navegador; necesita internet."; echo
if ! npx remotion render src/index.ts "$COMP" "$SALIDA" --gl=angle --codec=h264 --crf=16 --timeout=240000; then
  echo; echo "[ERROR] El render fallo. Copia el mensaje de arriba y envialo a Claude."; fin 1
fi
echo; echo "=============================================="
echo "  LISTO. Video guardado en:"
echo "  $(pwd)/$SALIDA"
echo "=============================================="
fin 0
