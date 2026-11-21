// Video musical "¡Bartolo ya llegó!" en el estilo del skill (personajes 2D en un mundo 3D).
// Un solo mundo three.js con cinco escenarios separados en el espacio; cada toma pone la cámara en uno de ellos.
// Motor reutilizado sin cambios desde ../prueba: shade.ts, lights.ts, ink.ts, paint.ts, cardshade.ts.
import * as THREE from "three";
import { staticFile } from "remotion";
import { TONE, CHAR, twoTone, untone } from "../prueba/shade";
import { LIGHTS, LOOK } from "../prueba/lights";
import { NOINK } from "../prueba/ink";
import { facadeHD, ctex, rep, rng, cobbleHD, planksHD } from "../prueba/paint";
import { cardShade } from "../prueba/cardshade";
import SPR from "../../sprites.json";

export const FPS = 30;
export const DUR = 71.6;
export const TOTAL = Math.round(DUR * FPS);
export const BEAT = 60 / 149.7, PH = 0.35;
export const beat = (t: number) => Math.abs(Math.sin((Math.PI * (t - PH)) / BEAT)); // 1 en cada pulso
export const land = (t: number) => Math.pow(1 - beat(t), 3);                         // 1 justo en el pulso
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (u * 6 - 15) + 10); };
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));

// ---------------- tomas (cortes en el tiempo fuerte de la canción) ----------------
export type Shot = { id: string; a: number; b: number; set: "calle" | "plaza" | "porton" | "sala" };
export const SHOTS: Shot[] = [
  { id: "tienda", a: 0, b: 6.8, set: "calle" },
  { id: "moto1", a: 6.8, b: 13.4, set: "calle" },
  { id: "moto2", a: 13.4, b: 20.0, set: "calle" },
  { id: "coro1", a: 20.0, b: 26.4, set: "plaza" },
  { id: "lila", a: 26.4, b: 32.8, set: "porton" },
  { id: "max", a: 32.8, b: 39.2, set: "sala" },
  { id: "canela", a: 39.2, b: 45.6, set: "sala" },
  { id: "coro2a", a: 45.6, b: 52.0, set: "plaza" },
  { id: "moto3", a: 52.0, b: 58.4, set: "calle" },
  { id: "coro2b", a: 58.4, b: 64.8, set: "plaza" },
  { id: "final", a: 64.8, b: 67.4, set: "plaza" },
  { id: "cierre", a: 67.4, b: DUR, set: "plaza" },
];
export const shotAt = (t: number) => SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];

// escenarios
const PLAZA = V(300, 0, 0), PORTON = V(-300, 0, 0), SALA = V(0, 0, 300);
const SHOP_Z = 34;

// ---------------- texturas pintadas ----------------
const asfalto = () => ctex("asfalto", 1024, 1024, (g, r) => {
  g.fillStyle = "#6f7378"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) { const v = 90 + Math.floor(r() * 40); g.fillStyle = `rgba(${v},${v + 3},${v + 8},.35)`; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 4, 2 + r() * 4); }
});
const anden = () => ctex("anden", 512, 512, (g, r) => {
  g.fillStyle = "#cbbfae"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 128) for (let x = 0; x < 512; x += 128) { g.fillStyle = `hsl(35,${12 + r() * 8}%,${70 + r() * 8}%)`; g.fillRect(x + 3, y + 3, 122, 122); }
});
const linea = () => ctex("linea", 64, 512, (g) => { g.fillStyle = "#f4ecd2"; g.fillRect(16, 0, 32, 300); });
const tiendaTex = () => ctex("tienda", 1024, 768, (g) => {
  g.fillStyle = "#f1e3c4"; g.fillRect(0, 0, 1024, 768);
  g.fillStyle = "#182939"; g.fillRect(0, 60, 1024, 120);
  g.fillStyle = "#F4DBB9"; g.font = "bold 62px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BARTOLO PET SHOP DELIVERY", 512, 122);
  g.fillStyle = "#A9D3D1"; g.fillRect(80, 300, 460, 360); g.strokeStyle = "#2b3640"; g.lineWidth = 10; g.strokeRect(80, 300, 460, 360);
  const cols = ["#E3A93B", "#2F8F8D", "#C2624F", "#8E6BB0"]; cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(120 + i * 105, 520, 70, 110); g.strokeRect(120 + i * 105, 520, 70, 110); });
  g.fillStyle = "#8A5A3B"; g.fillRect(640, 290, 260, 478); g.strokeRect(640, 290, 260, 478);
  g.fillStyle = "#E3A93B"; g.beginPath(); g.arc(860, 540, 12, 0, 7); g.fill();
});
const toldoTex = () => ctex("toldo", 512, 128, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#C2624F" : "#F4DBB9"; g.fillRect(i * 64, 0, 64, 128); } });
const banderinTex = () => ctex("banderines", 1024, 128, (g) => {
  const C = ["#C2624F", "#2F8F8D", "#E3A93B", "#D58877", "#8E6BB0"];
  for (let i = 0; i < 12; i++) { g.fillStyle = C[i % 5]; g.beginPath(); g.moveTo(i * 85 + 4, 4); g.lineTo(i * 85 + 80, 4); g.lineTo(i * 85 + 42, 120); g.fill(); g.strokeStyle = "#2b3640"; g.lineWidth = 4; g.stroke(); }
});
const portonTex = () => ctex("porton", 512, 512, (g) => {
  g.clearRect(0, 0, 512, 512); g.fillStyle = "#2E363C";
  g.fillRect(0, 0, 512, 24); g.fillRect(0, 488, 512, 24); g.fillRect(0, 0, 24, 512); g.fillRect(488, 0, 24, 512);
  for (let i = 1; i < 10; i++) g.fillRect(i * 51 - 6, 0, 12, 512);
});

type Card = { mesh: THREE.Mesh; blob: THREE.Mesh | null; tex: Record<string, THREE.Texture>; w: number; h: number };

export class World {
  root = new THREE.Group();
  private sun = new THREE.DirectionalLight("#fff3e0", 2.8);
  private hemi = new THREE.HemisphereLight("#dcecff", "#b49a78", 0.55);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#b8d0ec", 25, 300);
  private T: Record<string, THREE.Texture>;
  private cards: Record<string, Card> = {};
  private confeti: THREE.InstancedMesh;
  private clouds: THREE.Sprite[] = [];

  constructor(tex: Record<string, THREE.Texture>) {
    this.T = tex;
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    const nube = ctex("nube", 512, 256, (g) => { g.fillStyle = "#fbf8f1"; for (const [x, y, rr] of [[130, 160, 70], [220, 120, 90], [320, 150, 75], [400, 170, 55], [260, 175, 80]]) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } });
    for (let i = 0; i < 7; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: nube, fog: false, depthWrite: false, transparent: true })); s.scale.set(90, 45, 1); s.layers.set(NOINK); this.clouds.push(s); R.add(s); }
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.sun, this.sun.target, this.hemi);

    this.buildCalle(); this.buildPlaza(); this.buildPorton(); this.buildSala();

    // personajes y objetos (tarjetas iluminadas)
    const mk = (key: string, names: string[], blob = true) => this.cards[key] = this.card(names, blob);
    mk("moto", ["bartolo_moto"]);
    mk("bartolo", ["bartolo_feliz", "bartolo_neutral", "bartolo_caja"]);
    mk("bartoloP", ["bartolo_feliz", "bartolo_neutral"]);       // Bartolo en la plaza
    mk("max", ["max_a", "max_b"]); mk("lila", ["lila_feliz", "lila_neutral"]); mk("canela", ["canela"]);
    mk("maxP", ["max_a", "max_b"]); mk("lilaP", ["lila_feliz"]); mk("canelaP", ["canela"]);
    for (const n of ["bolsa", "raton", "hueso", "premio", "corona", "cobija"]) mk(n, [n], false);
    // confeti
    const cg = new THREE.PlaneGeometry(0.06, 0.1);
    this.confeti = new THREE.InstancedMesh(cg, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, fog: false }), 260);
    const C = ["#C2624F", "#2F8F8D", "#E3A93B", "#F4DBB9", "#8E6BB0"].map((c) => new THREE.Color(c).multiplyScalar(1.15));
    for (let i = 0; i < 260; i++) this.confeti.setColorAt(i, C[i % 5]);
    this.confeti.layers.set(NOINK); this.confeti.frustumCulled = false; R.add(this.confeti);
  }

  private card(names: string[], blob: boolean): Card {
    const s0 = (SPR as Record<string, { w: number; h: number }>)[names[0]];
    const geo = new THREE.PlaneGeometry(s0.w, s0.h); geo.translate(0, s0.h / 2, 0);
    const tex: Record<string, THREE.Texture> = {}; names.forEach((n) => (tex[n] = this.T[n]));
    const mat = cardShade(new THREE.MeshLambertMaterial({ map: tex[names[0]], alphaTest: 0.5, side: THREE.DoubleSide }));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex[names[0]], alphaTest: 0.5, side: THREE.DoubleSide });
    mesh.receiveShadow = true; mesh.castShadow = true; mesh.layers.set(NOINK); mesh.renderOrder = 1; mesh.visible = false; this.root.add(mesh);
    let b: THREE.Mesh | null = null;
    if (blob) {
      const bt = ctex("blob", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(0,0,0,.45)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
      b = new THREE.Mesh(new THREE.PlaneGeometry(s0.w * 1.05, s0.w * 0.4), new THREE.MeshBasicMaterial({ map: bt, transparent: true, depthWrite: false, fog: false }));
      b.rotation.x = -Math.PI / 2; b.layers.set(NOINK); b.visible = false; this.root.add(b);
    }
    return { mesh, blob: b, tex, w: s0.w, h: s0.h };
  }
  /** coloca una tarjeta: pos (pies), cara (textura), giro: "cam" = mira a la cámara, número = ángulo fijo */
  private put(key: string, p: THREE.Vector3, cam: THREE.Camera, o: { face?: string; yaw?: number | "cam"; tilt?: number; sq?: number; scale?: number; hop?: number } = {}) {
    const c = this.cards[key]; c.mesh.visible = true;
    if (o.face && c.tex[o.face]) { const m = c.mesh.material as THREE.MeshLambertMaterial; if (m.map !== c.tex[o.face]) { m.map = c.tex[o.face]; (c.mesh.customDepthMaterial as THREE.MeshDepthMaterial).map = c.tex[o.face]; } }
    c.mesh.position.set(p.x, p.y + (o.hop ?? 0), p.z);
    const yaw = o.yaw === undefined || o.yaw === "cam" ? Math.atan2(cam.position.x - p.x, cam.position.z - p.z) : o.yaw;
    c.mesh.rotation.set(0, yaw, o.tilt ?? 0);
    const k = o.scale ?? 1, sq = o.sq ?? 0; c.mesh.scale.set(k * (1 + sq * 0.5), k * (1 - sq), k);
    if (c.blob) { c.blob.visible = true; c.blob.position.set(p.x, p.y + 0.02, p.z); c.blob.scale.setScalar(k * (1 - (o.hop ?? 0) * 1.5)); }
  }

  // ---------------- escenarios ----------------
  private buildCalle() {
    const R = this.root, L = 160;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(7, L), lam({ map: rep(asfalto(), 2, L / 3.5) }));
    road.rotation.x = -Math.PI / 2; road.receiveShadow = true; R.add(road);
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.16, L), new THREE.MeshLambertMaterial({ map: rep(linea(), 1, L / 6), transparent: true, alphaTest: 0.5 }));
    ln.rotation.x = -Math.PI / 2; ln.position.y = 0.01; ln.layers.set(NOINK); R.add(ln);
    for (const s of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, L), lam({ map: rep(anden(), 2.6 / 1.2, L / 1.2) }));
      sw.position.set(s * 4.8, 0.08, 0); sw.receiveShadow = true; R.add(sw);
    }
    const r = rng(7);
    const walls = ["#f1e3c4", "#cfe3df", "#f2c9a8", "#e8d27a", "#d9b4c8", "#f4efe2"], shutters = ["#2f8f8d", "#c2624f", "#3b5b9a", "#5d7a3a"];
    for (const s of [-1, 1]) {
      let z = -L / 2 + 6, n = 0;
      while (z < L / 2 - 6) {
        const w = 6 + Math.floor(r() * 5), floors = 2 + Math.floor(r() * 4), h = floors * 2.9 + 0.6, d = 9;
        if (s < 0 && z + w > SHOP_Z - 6 && z < SHOP_Z + 6) { z = SHOP_Z + 6; continue; }   // hueco para la tienda
        const brick = r() < 0.45;
        const front = lam({ map: facadeHD(`c${s}_${n}`, w, h, { wall: walls[Math.floor(r() * 6)], shutter: shutters[Math.floor(r() * 4)], door: true, brick }) });
        const side = lam({ color: brick ? "#c8693f" : "#e2d6c0" }), top = lam({ color: "#8f8a86" });
        const b = new THREE.Mesh(new THREE.BoxGeometry(d, h, w), s > 0 ? [side, front, top, side, side, side] : [front, side, top, side, side, side]);
        b.position.set(s * (6.1 + d / 2), h / 2, z + w / 2); b.castShadow = true; b.receiveShadow = true; R.add(b);
        z += w + 0.05; n++;
      }
    }
    // tienda de Bartolo
    const tf = lam({ map: tiendaTex() }), ts = lam({ color: "#e2d6c0" }), tt = lam({ color: "#8f8a86" });
    const shop = new THREE.Mesh(new THREE.BoxGeometry(9, 7.5, 12), [tf, ts, tt, ts, ts, ts]);
    shop.position.set(-(6.1 + 4.5), 3.75, SHOP_Z); shop.castShadow = true; shop.receiveShadow = true; R.add(shop);
    const tm = lam({ map: rep(toldoTex(), 1, 1) }), tw = lam({ color: "#C2624F" });
    const toldo = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 10), [tw, tw, tm, tw, tw, tw]);
    toldo.rotation.z = -0.38; toldo.position.set(-5.55, 3.25, SHOP_Z); toldo.castShadow = true; R.add(toldo);
    // árboles en el andén de enfrente (lado -x), lejos de la tienda
    const trunkM = lam({ color: "#8a5a3c" }), leafM = [lam({ color: "#62ae4c" }), lam({ color: "#56a447" }), lam({ color: "#72b853" })];
    for (let i = 0; i < 10; i++) {
      const z = -L / 2 + 10 + i * 16; if (Math.abs(z - SHOP_Z) < 9) continue;
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 8), trunkM); t.position.set(-4.9, 1.2, z); t.castShadow = true; R.add(t);
      for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95 - k * 0.12, 1), leafM[(i + k) % 3]); c.position.set(-4.9 + (k - 1) * 0.45, 2.9 + (k % 2) * 0.45, z + (k - 1) * 0.3); c.castShadow = true; R.add(c); }
    }
  }
  private buildPlaza() {
    const R = this.root, P = PLAZA;
    const g = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), lam({ map: rep(cobbleHD(), 14, 14) }));
    g.rotation.x = -Math.PI / 2; g.position.copy(P); g.receiveShadow = true; R.add(g);
    const r = rng(11), walls = ["#f1e3c4", "#cfe3df", "#f2c9a8", "#e8d27a", "#d9b4c8"];
    // edificios alrededor (fondo y lados), fachadas hacia el centro
    for (let i = 0; i < 7; i++) {
      const w = 8, h = (2 + Math.floor(r() * 3)) * 2.9 + 0.6, brick = r() < 0.4;
      const front = lam({ map: facadeHD(`p${i}`, w, h, { wall: walls[i % 5], shutter: "#2f8f8d", door: true, brick }) }), side = lam({ color: brick ? "#c8693f" : "#e2d6c0" }), top = lam({ color: "#8f8a86" });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8), [side, side, top, side, front, side]);
      b.position.set(P.x - 28 + i * 8.05, h / 2, P.z - 22); b.castShadow = true; b.receiveShadow = true; R.add(b);
    }
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const w = 8, h = (2 + Math.floor(r() * 3)) * 2.9 + 0.6;
      const front = lam({ map: facadeHD(`pl${s}${i}`, w, h, { wall: walls[(i + 2) % 5], shutter: "#c2624f", door: true, brick: r() < 0.4 }) }), side = lam({ color: "#e2d6c0" }), top = lam({ color: "#8f8a86" });
      const mats = s < 0 ? [front, side, top, side, side, side] : [side, front, top, side, side, side];
      const b = new THREE.Mesh(new THREE.BoxGeometry(8, h, w), mats);
      b.position.set(P.x + s * 22, h / 2, P.z - 14 + i * 8.05); b.castShadow = true; b.receiveShadow = true; R.add(b);
    }
    // banderines: tiras inclinadas sobre la plaza
    const bm = new THREE.MeshLambertMaterial({ map: banderinTex(), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    for (let j = 0; j < 4; j++) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.55), bm);
      strip.position.set(P.x, 5.2 - (j % 2) * 0.6, P.z - 12 + j * 4); strip.rotation.x = -0.15; strip.layers.set(NOINK); R.add(strip);
    }
    // árboles y una fuente detrás del grupo
    const trunkM = lam({ color: "#8a5a3c" }), leafM = lam({ color: "#62ae4c" }), stoneM = lam({ color: "#d9d2c4" }), waterM = lam({ color: "#5fb3c8" });
    for (const [dx, dz] of [[-9, -8], [9, -8], [-14, 2], [14, 2]]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.6, 8), trunkM); t.position.set(P.x + dx, 1.3, P.z + dz); t.castShadow = true; R.add(t);
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), leafM); c.position.set(P.x + dx, 3.3, P.z + dz); c.castShadow = true; R.add(c);
    }
    const f1 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.6, 32), stoneM); f1.position.set(P.x, 0.3, P.z - 7); f1.castShadow = true; f1.receiveShadow = true; R.add(f1);
    const f2 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.62, 32), waterM); f2.position.set(P.x, 0.32, P.z - 7); R.add(f2);
    const f3 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.8, 16), stoneM); f3.position.set(P.x, 0.9, P.z - 7); f3.castShadow = true; R.add(f3);
  }
  private buildPorton() {
    const R = this.root, P = PORTON;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), lam({ map: rep(asfalto(), 8, 4) })); road.rotation.x = -Math.PI / 2; road.position.set(P.x, 0, P.z + 8); road.receiveShadow = true; R.add(road);
    const sw = new THREE.Mesh(new THREE.BoxGeometry(60, 0.16, 4), lam({ map: rep(anden(), 50, 3.3) })); sw.position.set(P.x, 0.08, P.z + 0.5); sw.receiveShadow = true; R.add(sw);
    const walls = [["#e6d5bd", false], ["#f2c9a8", true], ["#cfe3df", false]] as const;
    walls.forEach(([wc, brick], i) => {
      const w = 12, h = 9.3;
      const front = lam({ map: facadeHD(`po${i}`, w, h, { wall: wc, shutter: "#2f8f8d", door: i !== 1, brick }) }), side = lam({ color: "#e2d6c0" }), top = lam({ color: "#8f8a86" });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8), [side, side, top, side, front, side]);
      b.position.set(P.x - 12 + i * 12.02, h / 2, P.z - 5.5); b.castShadow = true; b.receiveShadow = true; R.add(b);
    });
    const gate = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.6), new THREE.MeshLambertMaterial({ map: portonTex(), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
    gate.position.set(P.x + 0.6, 1.46, P.z - 1.45); gate.castShadow = true; R.add(gate);
    const dark = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.6), lam({ color: "#3a4650" })); dark.position.set(P.x + 0.6, 1.46, P.z - 1.49); R.add(dark);
  }
  private buildSala() {
    const R = this.root, P = SALA;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), lam({ map: rep(planksHD(), 4, 3) })); floor.rotation.x = -Math.PI / 2; floor.position.copy(P); floor.receiveShadow = true; R.add(floor);
    const wallM = lam({ color: "#efe3cf" });
    const back = new THREE.Mesh(new THREE.BoxGeometry(18, 4.2, 0.3), wallM); back.position.set(P.x, 2.1, P.z - 5); back.receiveShadow = true; R.add(back);
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.2, 12), wallM); left.position.set(P.x - 9, 2.1, P.z + 1); left.receiveShadow = true; R.add(left);
    // ventana con cielo detrás
    const win = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color("#a9d3e6"), fog: false })); win.position.set(P.x + 3.5, 2.3, P.z - 4.84); win.layers.set(NOINK); R.add(win);
    const frameM = lam({ color: "#f4f0e8" });
    for (const [w, h, x, y] of [[3.3, 0.15, 0, 1], [3.3, 0.15, 0, -1], [0.15, 2.2, -1.55, 0], [0.15, 2.2, 1.55, 0], [0.1, 2, 0, 0]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), frameM); f.position.set(P.x + 3.5 + x, 2.3 + y, P.z - 4.8); R.add(f); }
    // sofá, alfombra, cojín de Canela, cuadro
    const sofaM = lam({ color: "#8E6BB0" }), sofaL = lam({ color: "#A383C2" });
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 1.2), sofaM); s1.position.set(P.x - 4.8, 0.45, P.z - 3.9); s1.castShadow = true; s1.receiveShadow = true; R.add(s1);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 0.35), sofaL); s2.position.set(P.x - 4.8, 1.2, P.z - 4.4); s2.castShadow = true; R.add(s2);
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.03, 40), lam({ color: "#C2624F" })); rug.position.set(P.x - 2, 0.015, P.z); rug.receiveShadow = true; R.add(rug);
    const cush = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.28, 32), lam({ color: "#C2624F" })); cush.position.set(P.x + 3.2, 0.14, P.z + 0.2); cush.castShadow = true; cush.receiveShadow = true; R.add(cush);
    const cushT = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.3, 32), lam({ color: "#F4DBB9" })); cushT.position.set(P.x + 3.2, 0.16, P.z + 0.2); cushT.receiveShadow = true; R.add(cushT);
    const pic = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.08), lam({ color: "#2F8F8D" })); pic.position.set(P.x - 4.8, 2.6, P.z - 4.8); R.add(pic);
  }

  /** cámara por toma: posiciones de inicio y fin, siempre en movimiento (smootherstep) */
  private camera(t: number): { pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll: number; focus: THREE.Vector3; cInf: number } {
    const s = shotAt(t), u = smoother((t - s.a) / (s.b - s.a));
    const L = (a: THREE.Vector3, b: THREE.Vector3) => a.clone().lerp(b, u);
    const mz = this.motoZ(t), P = PLAZA, Q = PORTON, S = SALA;
    switch (s.id) {
      case "tienda": return { pos: L(V(5.8, 1.9, 44), V(4.4, 1.55, 36)), look: L(V(-4.8, 1.4, 36.5), V(-3.6, 1.0, 30.5)), fov: 50, roll: 0, focus: this.bartoloWalk(t), cInf: 9 };
      case "moto1": return { pos: V(1.6 + 4.2 - 0.6 * u, 1.3 + 0.25 * u, mz - 2.6 + 0.7 * u), look: V(1.2, 1.3, mz + 0.25), fov: 54 - 5 * u, roll: THREE.MathUtils.degToRad(-1.5 + 2.5 * u), focus: V(1.6, 1.0, mz), cInf: 11 };
      case "moto2": return { pos: V(1.6 + 4.6 + 4 * u, 1.5 + 5 * u, mz - 3 - 2 * u), look: V(1.0, 1.0 + 0.4 * u, mz - 0.5), fov: 50, roll: 0, focus: V(1.6, 1.0, mz), cInf: 6 * (1 - u) };
      case "moto3": return { pos: V(1.6 + 3.8, 1.2 + 0.4 * u, mz - 2.2 - 0.6 * u), look: V(1.2, 1.25, mz + 0.2), fov: 52, roll: THREE.MathUtils.degToRad(1.5 - 3 * u), focus: V(1.6, 1.0, mz), cInf: 11 };
      case "coro1": { const a = lerp(-0.4, 0.18, u); return { pos: V(P.x + Math.sin(a) * 8.2, 1.6 + 0.3 * u, P.z + Math.cos(a) * 8.2), look: V(P.x, 0.75, P.z), fov: 46, roll: 0, focus: V(P.x, 0.6, P.z), cInf: 10 }; }
      case "coro2a": return { pos: L(V(P.x + 7, 4.6, P.z + 9.5), V(P.x + 4, 3.0, P.z + 7.5)), look: V(P.x, 0.6, P.z), fov: 44, roll: 0, focus: V(P.x, 0.6, P.z), cInf: 4 };
      case "coro2b": return { pos: L(V(P.x - 1.4, 1.2, P.z + 7.4), V(P.x + 1.2, 1.3, P.z + 6.6)), look: V(P.x, 0.75, P.z), fov: 50, roll: THREE.MathUtils.degToRad(-2 + 4 * u), focus: V(P.x, 0.6, P.z), cInf: 12 };
      case "final": return { pos: L(V(P.x, 1.4, P.z + 4.5), V(P.x, 3.2, P.z + 11)), look: L(V(P.x, 0.75, P.z), V(P.x, 1.2, P.z)), fov: 46, roll: 0, focus: V(P.x, 0.6, P.z), cInf: 6 };
      case "cierre": return { pos: L(V(P.x, 3.2, P.z + 11), V(P.x + 1.5, 3.6, P.z + 12)), look: V(P.x, 1.2, P.z), fov: 46, roll: 0, focus: V(P.x, 0.6, P.z), cInf: 14 };
      case "lila": return { pos: L(V(Q.x + 1.4, 1.5, Q.z + 8.6), V(Q.x + 0.5, 1.3, Q.z + 6.6)), look: L(V(Q.x + 0.2, 0.9, Q.z - 0.5), V(Q.x + 0.3, 0.75, Q.z - 0.5)), fov: 46, roll: 0, focus: V(Q.x + 1.0, 0.6, Q.z - 0.6), cInf: 11 };
      case "max": { const a = lerp(0.3, -0.12, u); return { pos: V(S.x - 2.7 + Math.sin(a) * 5.8, 1.5, S.z + Math.cos(a) * 5.8), look: V(S.x - 2.8, 0.7, S.z), fov: 44, roll: 0, focus: V(S.x - 2, 0.5, S.z), cInf: 11 }; }
      default: /* canela */ return { pos: L(V(S.x + 1.2, 1.6, S.z + 5.5), V(S.x + 2.6, 1.25, S.z + 3.6)), look: V(S.x + 2.6, 0.7, S.z + 0.2), fov: 44, roll: 0, focus: V(S.x + 3.2, 0.7, S.z + 0.2), cInf: 12 };
    }
  }
  private motoZ(t: number) { const s = shotAt(t); return s.id === "moto3" ? 30 - 6 * (t - 52) : 46 - 6.2 * (t - 6.8); }
  private bartoloWalk(t: number) { const p = smoother(seg(t, 0.8, 5.6)); return V(-4.8, 0.16, lerp(37.5, 30.0, p)); }

  /** pone el mundo en el tiempo t (segundos) */
  update(t: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = shotAt(t), Lp = LIGHTS.day, K = LOOK.day;
    Object.values(this.cards).forEach((c) => { c.mesh.visible = false; if (c.blob) c.blob.visible = false; });
    this.confeti.visible = false;
    const c = this.camera(t);
    cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); cam.layers.enable(NOINK);
    const step = (tt: number) => Math.abs(Math.sin(tt * 7)) * 0.05, swayW = (tt: number) => Math.sin(tt * 7) * 0.05;
    const P = PLAZA, Q = PORTON, S = SALA, b2 = Math.floor((t - PH) / BEAT) % 2 === 0;

    if (s.id === "tienda") {
      this.put("moto", V(-2.4, 0.02, 27.5), cam, { yaw: Math.PI / 2 });
      const w = seg(t, 0.8, 5.6) > 0 && seg(t, 0.8, 5.6) < 1;
      this.put("bartolo", this.bartoloWalk(t), cam, { face: "bartolo_caja", hop: w ? step(t) : 0, tilt: w ? swayW(t) : 0 });
    } else if (s.set === "calle") {
      const mz = this.motoZ(t); this.put("moto", V(1.6, 0.02 + Math.abs(Math.sin(t * 9)) * 0.025, mz), cam, { yaw: Math.PI / 2 });
    } else if (s.set === "plaza") {
      const xs = [-1.4, -0.47, 0.45, 1.38];
      const enter = s.id === "coro1" ? smoother(seg(t, 20.0, 21.2)) : 1;
      const dance = (i: number) => { const off = i % 2 ? BEAT / 2 : 0; return { hop: land(t + off) * 0.16, sq: (1 - land(t + off)) * 0.04 - 0.02, tilt: (Math.floor((t + off - PH) / BEAT) % 2 ? 1 : -1) * 0.06 }; };
      this.put("maxP", V(P.x + xs[0], 0, P.z), cam, { face: Math.floor((t - PH) / (BEAT / 2)) % 2 ? "max_a" : "max_b", ...dance(0) });
      this.put("lilaP", V(P.x + xs[1], 0, P.z - 0.1), cam, dance(1));
      this.put("canelaP", V(P.x + xs[2], 0, P.z), cam, dance(2));
      this.put("bartoloP", V(P.x + lerp(9, xs[3], enter), 0, P.z + 0.1), cam, { face: b2 ? "bartolo_feliz" : "bartolo_neutral", ...(enter < 1 ? { hop: step(t) * 2, tilt: swayW(t) } : dance(3)) });
      if (s.id === "coro2a" || s.id === "coro2b" || s.id === "final" || s.id === "cierre" || s.id === "coro1") this.confetti(t, s.id === "final" ? 1.0 : 0.6);
    } else if (s.set === "porton") {
      const u = t - s.a;
      this.put("lila", V(Q.x + 1.4, 0.16, Q.z - 0.6), cam, { face: u > 0.6 ? "lila_feliz" : "lila_neutral", hop: u > 3.4 ? land(t) * 0.1 : 0, yaw: Math.atan2(cam.position.x - Q.x, cam.position.z - Q.z) + Math.PI });
      this.put("bartolo", V(Q.x - 1.1, 0.16, Q.z - 0.4), cam, { face: "bartolo_caja", hop: land(t) * 0.04 });
      const p1 = smoother(seg(u, 0.6, 1.4)); if (u > 0.6) this.put("bolsa", V(lerp(Q.x - 0.5, Q.x + 0.75, p1), 0.16 + Math.sin(p1 * Math.PI) * 0.6, Q.z - 0.3), cam);
      if (u > 3.2) { const p2 = smoother(seg(u, 3.2, 3.9)); this.put("raton", V(lerp(Q.x - 0.5, Q.x + 1.0 + Math.sin(u * 5) * 0.3, p2), 0.16 + Math.sin(p2 * Math.PI) * 0.5, Q.z), cam); }
    } else if (s.id === "max") {
      const u = t - s.a;
      const spin = u < 3.2 ? u * Math.PI * 4 : 0;
      this.put("max", V(S.x - 2, 0.03, S.z), cam, { face: b2 ? "max_a" : "max_b", yaw: u < 3.2 ? spin : "cam", hop: land(t) * 0.1 });
      this.put("bartolo", V(S.x - 4.0, 0.03, S.z + 0.4), cam, { face: "bartolo_caja", hop: land(t) * 0.04 });
      if (u > 0.6 && u < 3.2) { const p = smoother(seg(u, 0.6, 1.3)); this.put("hueso", V(lerp(S.x - 3.5, S.x - 1.4, p), 0.03 + Math.sin(p * Math.PI) * 0.7, S.z + 0.3), cam); }
      if (u > 3.2) { const p = smoother(seg(u, 3.2, 3.8)); this.put("cobija", V(S.x - 2, 0.04, S.z + 0.12), cam, { scale: p }); this.put("hueso", V(S.x - 1.2, 0.03, S.z + 0.5), cam); }
    } else {
      const u = t - s.a;
      this.put("canela", V(S.x + 3.2, 0.3, S.z + 0.2), cam, { hop: land(t) * 0.05 });
      const ch = (SPR as Record<string, { h: number }>).canela.h;
      const cy = Math.atan2(cam.position.x - (S.x + 3.2), cam.position.z - (S.z + 0.2));
      this.put("corona", V(S.x + 3.2 + Math.cos(cy) * 0.16, 0.3 + ch - 0.07 + land(t) * 0.05, S.z + 0.2 - Math.sin(cy) * 0.16 + Math.sin(cy + Math.PI / 2) * 0.02), cam);
      this.put("bartolo", V(S.x + 0.6, 0.03, S.z + 0.5), cam, { face: "bartolo_caja", hop: land(t) * 0.04 });
      if (u > 0.6 && u < 3.2) { const p = smoother(seg(u, 0.6, 1.3)); this.put("premio", V(lerp(S.x + 1.2, S.x + 2.8, p), 0.2 + Math.sin(p * Math.PI) * 0.7 + 0.2 * p, S.z + 0.5), cam); }
    }

    // ---- luz: sol relativo a la cámara (como lights.ts), dos tonos, cielo y niebla ----
    const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
    const az = THREE.MathUtils.degToRad(Lp.az), el = THREE.MathUtils.degToRad(Lp.el);
    const right = new THREE.Vector3().crossVectors(fwd, V(0, 1, 0)).normalize();
    const sunDir = fwd.clone().multiplyScalar(Math.cos(az)).addScaledVector(right, Math.sin(az)).normalize().multiplyScalar(Math.cos(el)).add(V(0, Math.sin(el), 0)).normalize();
    this.sun.color.set(Lp.sunCol); this.sun.intensity = Lp.sunI; this.hemi.color.set(Lp.sky); this.hemi.groundColor.set(Lp.ground); this.hemi.intensity = Lp.hemiI;
    const Rr = s.id === "moto2" || s.id === "final" || s.id === "cierre" || s.id === "coro2a" ? 34 : 22;
    this.sun.position.copy(c.look).addScaledVector(sunDir, 220); this.sun.target.position.copy(c.look);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = Lp.bias; this.sun.shadow.normalBias = Lp.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...Lp.lit); TONE.uShadeCol.value.set(...Lp.shade); TONE.uShadeLift.value.set(...Lp.lift);
    TONE.uLambert.value = Lp.lambert; TONE.uSideK.value = Lp.sideK; TONE.uTerm.value = Lp.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...Lp.charTint); CHAR.uCharShade.value = Lp.charShade; CHAR.uGrad.value = Lp.charGrad; CHAR.uBodyGrad.value = Lp.bodyGrad; CHAR.uSideTint.value.set(...Lp.sideTint);
    const su = this.skyMat.uniforms; K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(Lp.fog, this.fog.color); this.fog.near = Lp.fogNear; this.fog.far = Lp.fogFar; scene.fog = this.fog; scene.background = null;
    this.clouds.forEach((cl, i) => cl.position.set(cam.position.x - 160 + i * 55 + t * 2, 70 + (i % 3) * 18, cam.position.z - 220 - (i % 2) * 60));
    return c;
  }
  private confetti(t: number, k: number) {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), P = PLAZA;
    this.confeti.visible = true;
    for (let i = 0; i < 260; i++) {
      const fall = ((t * 0.6 * (0.7 + (i % 7) * 0.08) + i * 0.137) % 1);
      const x = P.x + (((i * 97) % 140) / 10 - 7) + Math.sin(t * 2 + i) * 0.3, z = P.z + (((i * 53) % 80) / 10 - 5), y = 6 - fall * 6;
      e.set(t * 3 + i, t * 2 + i * 0.5, 0); q.setFromEuler(e);
      m.compose(V(x, y, z), q, V(k, k, k)); this.confeti.setMatrixAt(i, m);
    }
    this.confeti.instanceMatrix.needsUpdate = true;
  }
}

export const SPRITES = Object.keys(SPR);
export const loadTextures = () => Promise.all(SPRITES.map((n) => new Promise<[string, THREE.Texture]>((res) => {
  new THREE.TextureLoader().load(staticFile(n === "bartolo_moto" ? "bartolo_moto.png" : `sprites/${n}.png`), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res([n, t]); });
}))).then((l) => Object.fromEntries(l) as Record<string, THREE.Texture>);
