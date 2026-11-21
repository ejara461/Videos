// Fotos sueltas para revisar el look (basado en plantillas/scripts/fotos.mjs del skill), con navegador sin pantalla y WebGL por software.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [prefix, frames, scale = "0.5", id = "Prueba", props = "{}"] = process.argv.slice(2);
const inputProps = JSON.parse(props);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, chromiumOptions, browserExecutable, inputProps });
const onBrowserLog = (l) => { if (l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 400)); };
for (const f of frames.split(",").map(Number)) {
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale), chromiumOptions, browserExecutable, inputProps, timeoutInMilliseconds: 240000, onBrowserLog });
  console.log("foto", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}
