// Prueba de 5 s: Bartolo en moto por una calle de Bello, de día, en el estilo del skill
// "personajes 2D en un mundo 3D" (sombreado en dos tonos, tinta, cielo por elevación, niebla del color del horizonte).
// Reutiliza sin cambios los módulos del motor: shade.ts, lights.ts, ink.ts, paint.ts, cardshade.ts.
import * as THREE from "three";
import { staticFile } from "remotion";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { LIGHTS, LOOK } from "./lights";
import { NOINK } from "./ink";
import { facadeHD, ctex, rep, rng } from "./paint";
import { cardShade } from "./cardshade";

export const FPS = 30;
export const TOTAL = 150;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (u * 6 - 15) + 10); };
const lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));

// ---------------- texturas pintadas propias (mismo método ctex del motor) ----------------
const asfalto = () => ctex("asfalto", 1024, 1024, (g, r) => {
  g.fillStyle = "#6f7378"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) { const v = 90 + Math.floor(r() * 40); g.fillStyle = `rgba(${v},${v + 3},${v + 8},.35)`; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 4, 2 + r() * 4); }
  for (let i = 0; i < 18; i++) { g.strokeStyle = "rgba(40,40,45,.25)"; g.lineWidth = 2; g.beginPath(); let x = r() * 1024, y = r() * 1024; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 80; y += (r() - 0.5) * 80; g.lineTo(x, y); } g.stroke(); }
});
const anden = () => ctex("anden", 512, 512, (g, r) => {
  g.fillStyle = "#cbbfae"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 128) for (let x = 0; x < 512; x += 128) { g.fillStyle = `hsl(35,${12 + r() * 8}%,${70 + r() * 8}%)`; g.fillRect(x + 3, y + 3, 122, 122); }
  g.strokeStyle = "rgba(60,50,40,.45)"; g.lineWidth = 3; for (let i = 0; i <= 512; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
});
const linea = () => ctex("linea", 64, 512, (g) => { g.clearRect(0, 0, 64, 512); g.fillStyle = "#f4ecd2"; g.fillRect(16, 0, 32, 300); });

export class World {
  root = new THREE.Group();
  private sun = new THREE.DirectionalLight("#fff3e0", 2.8);
  private hemi = new THREE.HemisphereLight("#dcecff", "#b49a78", 0.55);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#b8d0ec", 25, 300);
  private card: THREE.Mesh; private blob: THREE.Mesh;
  private clouds: THREE.Sprite[] = [];

  constructor(spriteTex: THREE.Texture) {
    const R = this.root;
    // ---- cielo por elevación (mismo shader del motor) ----
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
    // nubes pintadas (sprites sin tinta)
    const nube = ctex("nube", 512, 256, (g) => { g.fillStyle = "#fbf8f1"; for (const [x, y, rr] of [[130, 160, 70], [220, 120, 90], [320, 150, 75], [400, 170, 55], [260, 175, 80]]) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } g.fillStyle = "rgba(195,203,233,.6)"; g.fillRect(60, 190, 400, 60); });
    for (let i = 0; i < 7; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: nube, fog: false, depthWrite: false, transparent: true })); s.scale.set(90, 45, 1); s.layers.set(NOINK); this.clouds.push(s); R.add(s); }

    // ---- luces ----
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.sun, this.sun.target, this.hemi);

    // ---- calle: asfalto, línea central, andenes, bordillos ----
    const L = 140;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(7, L), lam({ map: rep(asfalto(), 2, L / 3.5) }));
    road.rotation.x = -Math.PI / 2; road.receiveShadow = true; R.add(road);
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.16, L), new THREE.MeshLambertMaterial({ map: rep(linea(), 1, L / 6), transparent: true, alphaTest: 0.5 }));
    ln.rotation.x = -Math.PI / 2; ln.position.y = 0.01; ln.receiveShadow = true; ln.layers.set(NOINK); R.add(ln);
    for (const s of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, L), lam({ map: rep(anden(), 2.6 / 1.2, L / 1.2) }));
      sw.position.set(s * (3.5 + 1.3), 0.08, 0); sw.receiveShadow = true; sw.castShadow = true; R.add(sw);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, L), lam({ color: "#d9d2c4" }));
      curb.position.set(s * 3.55, 0.1, 0); curb.receiveShadow = true; R.add(curb);
    }

    // ---- edificios de Bello: ladrillo a la vista y fachadas pintadas, 2 a 5 pisos ----
    const r = rng(7);
    const walls = ["#f1e3c4", "#cfe3df", "#f2c9a8", "#e8d27a", "#d9b4c8", "#f4efe2"];
    const shutters = ["#2f8f8d", "#c2624f", "#3b5b9a", "#5d7a3a"];
    for (const s of [-1, 1]) {
      let z = -L / 2 + 10;
      let n = 0;
      while (z < L / 2 - 10) {
        const w = 6 + Math.floor(r() * 5), floors = 2 + Math.floor(r() * 4), h = floors * 2.9 + 0.6, d = 9;
        const brick = r() < 0.45;
        const tex = facadeHD(`b${s}_${n}`, w, h, { wall: walls[Math.floor(r() * walls.length)], shutter: shutters[Math.floor(r() * shutters.length)], door: true, brick });
        const front = lam({ map: tex });
        const side = lam({ color: brick ? "#c8693f" : "#e2d6c0" });
        const top = lam({ color: "#8f8a86" });
        // caras: +x, -x, +y, -y, +z, -z ; la fachada mira hacia la calle (-s*x)
        const mats = s > 0 ? [side, front, top, side, side, side] : [front, side, top, side, side, side];
        const b = new THREE.Mesh(new THREE.BoxGeometry(d, h, w), mats);
        // el mapa de la fachada va sobre la cara lateral: rotamos la caja 90° para que el ancho quede a lo largo de z
        b.position.set(s * (6.1 + d / 2), h / 2, z + w / 2);
        b.castShadow = true; b.receiveShadow = true; R.add(b);
        // alero / cornisa
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, w + 0.2), lam({ color: brick ? "#a24f33" : "#c2624f" }));
        c.position.set(s * 6.0, h - 0.15, z + w / 2); c.castShadow = true; R.add(c);
        z += w + (r() < 0.2 ? 1.5 : 0.05); n++;
      }
    }
    // ---- árboles y postes de luz en los andenes ----
    const trunkM = lam({ color: "#8a5a3c" }), leafM = [lam({ color: "#62ae4c" }), lam({ color: "#56a447" }), lam({ color: "#72b853" })];
    const poleM = lam({ color: "#5e6b73" }), lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.45, 1.1) });
    for (let i = 0; i < 9; i++) for (const s of [-1]) {
      const z = -L / 2 + 14 + i * 15 + (s > 0 ? 7 : 0);
      if (i % 2 === 0) {
        const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 8), trunkM); t.position.set(s * 4.9, 1.2, z); t.castShadow = true; R.add(t);
        for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95 - k * 0.12, 1), leafM[(i + k) % 3]); c.position.set(s * 4.9 + (k - 1) * 0.45, 2.9 + (k % 2) * 0.45, z + (k - 1) * 0.3); c.castShadow = true; c.receiveShadow = true; R.add(c); }
      } else {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.6, 8), poleM); p.position.set(s * 4.0, 2.3, z); p.castShadow = true; R.add(p);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.07, 0.07), poleM); arm.position.set(s * 3.6, 4.55, z); R.add(arm);
        const lmp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.22), lampM); lmp.position.set(s * 3.2, 4.48, z); lmp.layers.set(NOINK); R.add(lmp);
      }
    }
    // ---- Bartolo: tarjeta iluminada (cardShade del motor) + sombra de contacto ----
    const H = 1.45, W = H * (532 / 441);
    const geo = new THREE.PlaneGeometry(W, H); geo.translate(0, H / 2, 0);
    const mat = cardShade(new THREE.MeshLambertMaterial({ map: spriteTex, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.card = new THREE.Mesh(geo, mat);
    this.card.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: spriteTex, alphaTest: 0.5, side: THREE.DoubleSide });
    this.card.receiveShadow = true; this.card.castShadow = true; this.card.layers.set(NOINK); this.card.renderOrder = 1; R.add(this.card);
    const blobT = ctex("blob", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(0,0,0,.45)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.7), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false, fog: false }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.layers.set(NOINK); R.add(this.blob);
  }

  /** punto de enfoque: los ojos de Bartolo */
  focusPoint() { return this.card.position.clone().add(new THREE.Vector3(0, 1.15, 0)); }
  /** pone el mundo en el cuadro f; devuelve el punto de mirada */
  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, Lp = LIGHTS.day, K = LOOK.day;
    // Bartolo avanza hacia la cámara por el carril derecho (z disminuye), con el rebote suave de la moto
    const bz = 18 - 7.5 * t, bx = 1.6, bob = Math.abs(Math.sin(t * 9)) * 0.025;
    this.card.position.set(bx, 0.02 + bob, bz);
    // cámara: va por delante de Bartolo, baja, a un lado; se desliza y se acerca (nunca quieta)
    const u = smoother(t / 5);
    const camPos = new THREE.Vector3(bx + 3.6 - 0.5 * u, 1.3 + 0.25 * u, bz - 3.7 + 0.8 * u);
    const look = new THREE.Vector3(bx - 0.4, 1.3, bz + 0.25);
    cam.position.copy(camPos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(THREE.MathUtils.degToRad(-1.5 + 2.5 * u));
    cam.fov = 54 - 5 * u; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    // la tarjeta gira solo en el eje vertical hacia la cámara (billboard de yaw, como cast.ts)
    const dx = cam.position.x - this.card.position.x, dz = cam.position.z - this.card.position.z;
    this.card.rotation.set(0, Math.atan2(dx, dz), 0);
    this.blob.position.set(bx, 0.03, bz);
    // sol relativo a la cámara (az desde el eje frontal, el = elevación), como lights.ts
    const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
    const az = THREE.MathUtils.degToRad(Lp.az), el = THREE.MathUtils.degToRad(Lp.el);
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    const hor = fwd.clone().multiplyScalar(Math.cos(az)).addScaledVector(right, Math.sin(az)).normalize();
    const sunDir = hor.multiplyScalar(Math.cos(el)).add(new THREE.Vector3(0, Math.sin(el), 0)).normalize();
    this.sun.color.set(Lp.sunCol); this.sun.intensity = Lp.sunI;
    this.hemi.color.set(Lp.sky); this.hemi.groundColor.set(Lp.ground); this.hemi.intensity = Lp.hemiI;
    const Rr = 26;
    this.sun.position.copy(look).addScaledVector(sunDir, 220); this.sun.target.position.copy(look);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = Lp.bias; this.sun.shadow.normalBias = Lp.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...Lp.lit); TONE.uShadeCol.value.set(...Lp.shade); TONE.uShadeLift.value.set(...Lp.lift);
    TONE.uLambert.value = Lp.lambert; TONE.uSideK.value = Lp.sideK; TONE.uTerm.value = Lp.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...Lp.charTint); CHAR.uCharShade.value = Lp.charShade; CHAR.uGrad.value = Lp.charGrad;
    CHAR.uBodyGrad.value = Lp.bodyGrad; CHAR.uSideTint.value.set(...Lp.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(Lp.fog, this.fog.color); this.fog.near = Lp.fogNear; this.fog.far = Lp.fogFar; scene.fog = this.fog; scene.background = null;
    this.clouds.forEach((c, i) => c.position.set(-160 + i * 55 + t * 2, 70 + (i % 3) * 18, cam.position.z + 220 + (i % 2) * 60));
    return look;
  }
}

export const loadSprite = () => new Promise<THREE.Texture>((res) => {
  new THREE.TextureLoader().load(staticFile("bartolo_moto.png"), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); });
});
