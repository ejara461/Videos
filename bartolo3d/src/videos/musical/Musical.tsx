// Video musical "¡Bartolo ya llegó!" (71,6 s). Lienzo three.js + capas HTML encima (letra, título, reloj, corazones,
// franja de contacto, cierre). Cadena de post del skill armada con postprocessing: tinta -> desenfoque -> brillo + tono + color.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Img, continueRender, delayRender, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree, useFrame } from "@react-three/fiber";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode, EffectComposer, RenderPass, EffectPass } from "postprocessing";
import { World, loadTextures, TOTAL, FPS, SHOTS, beat, land } from "./world";
import { InkPass, noInkFallback } from "../prueba/ink";
import { LensBlur } from "../prueba/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../prueba/grade";

export const MUSICAL_FRAMES = TOTAL;
const FONT = "ComicNeueBartolo";
const NAVY = "#182939", CREAM = "#F4DBB9", TERRA = "#C2624F", TERRAL = "#D58877", TEAL = "#2F8F8D", GOLD = "#FFD25A";
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const back = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2));

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass; const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3();

const Inner: React.FC<{ tex: Record<string, THREE.Texture> }> = ({ tex }) => {
  const f = useCurrentFrame();
  const { camera, scene, gl, size } = useThree();
  const world = useMemo(() => new World(tex), [tex]);
  const p = getInputProps() as { msaa?: number; nopost?: boolean };
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera), lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }), bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  const comp = useMemo(() => {
    const c = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: p.msaa ?? 4 });
    c.addPass(new RenderPass(scene, camera)); c.addPass(fx.ink);
    c.addPass(new EffectPass(camera, fx.lens.pre)); c.addPass(new EffectPass(camera, fx.lens.main));
    c.addPass(new EffectPass(camera, fx.bloom, fx.tone, fx.grade));
    return c;
  }, [gl, scene, camera, fx]);
  useEffect(() => { comp.setSize(size.width, size.height); }, [comp, size]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  useFrame(() => { if (p.nopost) gl.render(scene, camera); else comp.render(); }, 1);
  const cam = camera as THREE.PerspectiveCamera;
  const c = world.update(f / FPS, cam, scene);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, c.focus.clone().sub(cam.position).dot(fwd));
  fx.lens.cInf = c.cInf;
  gradeFor(fx.grade, "day");
  return <primitive object={world.root} dispose={null} />;
};

// ---------------- capas HTML ----------------
const LYR: [number, number, string, number][] = [
  [20.0, 23.2, "Bartolo, Bartolo, Bartolo ya llegó,", 1], [23.2, 26.4, "con tu domicilio, ¡Bartolo ya llegó!", 1],
  [26.4, 29.6, "Para Lila, que lo espera junto al portón,", 0], [29.6, 32.8, "trae croquetas y un juguete de ratón.", 0],
  [32.8, 36.0, "Para Max, que da vueltas de emoción,", 0], [36.0, 39.2, "trae un hueso y su cobija de algodón.", 0],
  [39.2, 42.4, "Para Canela, la reina del salón,", 0], [42.4, 45.6, "trae su premio y cariño de montón.", 0],
  [45.6, 48.8, "Bartolo, Bartolo, Bartolo ya llegó,", 1], [48.8, 52.0, "rápido y puntual, ¡Bartolo ya llegó!", 1],
  [52.0, 55.2, "Bartolo, Bartolo, Bartolo ya llegó,", 1], [55.2, 58.4, "con tu domicilio, ¡Bartolo ya llegó!", 1],
  [58.4, 61.6, "Bartolo, Bartolo, Bartolo ya llegó,", 1], [61.6, 64.8, "rápido y puntual, ¡Bartolo ya llegó!", 1],
  [64.8, 67.4, "¡Bartolo ya llegó!", 2],
];
const outline = (w: number, c = NAVY) => [[-w, 0], [w, 0], [0, -w], [0, w], [-w, -w], [w, w], [-w, w], [w, -w]].map(([x, y]) => `${x}px ${y}px 0 ${c}`).join(",");
const Letra: React.FC<{ t: number }> = ({ t }) => {
  const l = LYR.find(([a, b]) => t >= a - 0.12 && t < b + 0.04);
  if (!l) return null;
  const [a, b, txt, kind] = l;
  const op = Math.min(seg(t, a - 0.12, a + 0.1), 1 - seg(t, b - 0.08, b + 0.04));
  const prog = seg(t, a, b - 0.3);
  const size = kind === 2 ? 110 : kind === 1 ? 70 : 60;
  const k = kind === 2 ? back(seg(t, a, a + 0.4)) : 1 + 0.035 * (1 - beat(t));
  const style: React.CSSProperties = { fontFamily: FONT, fontSize: size, lineHeight: 1.15, textAlign: "center", padding: "0 60px", whiteSpace: "normal" };
  return (
    <AbsoluteFill style={{ top: 150, height: 420, alignItems: "center", justifyContent: "center", opacity: op, transform: `scale(${k})` }}>
      <div style={{ position: "relative" }}>
        <div style={{ ...style, color: CREAM, textShadow: outline(5) }}>{txt}</div>
        <div style={{ ...style, position: "absolute", inset: 0, color: GOLD, textShadow: outline(5), clipPath: `inset(0 ${100 - prog * 100}% 0 0)` }}>{txt}</div>
      </div>
    </AbsoluteFill>
  );
};
const HEART = [".XX...XX.", "XWRX.XRRX", "XRRRXRRRX", "XRRRRRRRX", ".XRRRRRX.", "..XRRRX..", "...XRX...", "....X...."];
const Pix: React.FC<{ rows: string[]; k: number; pal: Record<string, string> }> = ({ rows, k, pal }) => (
  <svg width={rows[0].length * k} height={rows.length * k} shapeRendering="crispEdges">
    {rows.flatMap((r, j) => [...r].map((ch, i) => (pal[ch] ? <rect key={`${i}-${j}`} x={i * k} y={j * k} width={k} height={k} fill={pal[ch]} /> : null)))}
  </svg>
);
const HPAL = { X: NAVY, R: TERRA, W: CREAM };
const Corazones: React.FC<{ t: number }> = ({ t }) => {
  const on = (t >= 21.2 && t < 26.4) || (t >= 58.4 && t < 64.8);
  if (!on) return null;
  const k = 7 * (1 + 0.12 * (1 - beat(t)));
  return <AbsoluteFill style={{ top: 1500, height: 120, flexDirection: "row", gap: 18, justifyContent: "center", alignItems: "center" }}>{[0, 1, 2, 3, 4].map((i) => <Pix key={i} rows={HEART} k={k} pal={HPAL} />)}</AbsoluteFill>;
};
const LluviaCorazones: React.FC<{ t: number }> = ({ t }) => {
  if (t < 42.4 || t >= 45.6) return null;
  const u = t - 42.4;
  return <AbsoluteFill>{Array.from({ length: 16 }, (_, i) => { const p = (u * 0.7 + i / 16) % 1; return <div key={i} style={{ position: "absolute", left: 120 + ((i * 67) % 800), top: 380 + p * 1100, opacity: 1 - p * 0.6 }}><Pix rows={HEART} k={6} pal={HPAL} /></div>; })}</AbsoluteFill>;
};
const Titulo: React.FC<{ t: number }> = ({ t }) => {
  const p = seg(t, 16.0, 16.6); if (p <= 0 || t >= 20.0) return null;
  const k = back(p) * (1 + 0.05 * (1 - beat(t))), op = 1 - seg(t, 19.6, 20.0);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
      <div style={{ transform: `rotate(-4deg) scale(${k})`, textAlign: "center", fontFamily: FONT }}>
        <div style={{ background: NAVY, color: CREAM, fontSize: 118, padding: "10px 60px", borderRadius: 40, border: `6px solid ${CREAM}` }}>¡Bartolo</div>
        <div style={{ color: TERRA, fontSize: 118, marginTop: 10, textShadow: outline(6, CREAM) }}>ya llegó!</div>
      </div>
    </AbsoluteFill>
  );
};
const Reloj: React.FC<{ t: number }> = ({ t }) => {
  if (t < 52.6 || t >= 58.4) return null;
  const k = back(seg(t, 52.6, 53.1)) * (1 + 0.06 * (1 - beat(t))), a = (t - 52.6) * 360;
  return (
    <AbsoluteFill style={{ top: 620, left: 700, width: 300, height: 300 }}>
      <svg width={300} height={300} viewBox="-75 -75 150 150" style={{ transform: `scale(${k})` }}>
        <circle r={62} fill={CREAM} stroke={NAVY} strokeWidth={7} />
        <line x1={0} y1={0} x2={0} y2={-44} stroke={NAVY} strokeWidth={7} strokeLinecap="round" transform={`rotate(${a})`} />
        <line x1={0} y1={0} x2={30} y2={0} stroke={TERRA} strokeWidth={8} strokeLinecap="round" /><circle r={6} fill={NAVY} />
      </svg>
    </AbsoluteFill>
  );
};
const Franja: React.FC<{ t: number }> = ({ t }) => (t >= 67.4 ? null : (
  <AbsoluteFill style={{ height: 96, background: "rgba(10,18,26,.55)", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: FONT, fontSize: 36, color: CREAM, letterSpacing: 1 }}>patitas.win · WhatsApp 314 585 6688</div>
  </AbsoluteFill>
));
const Cierre: React.FC<{ t: number }> = ({ t }) => {
  const p = seg(t, 67.4, 68.0); if (p <= 0) return null;
  const hop = land(t) * 14;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(47,143,141,.55), rgba(15,27,38,.94) 60%)`, opacity: p, alignItems: "center", fontFamily: FONT }}>
      <div style={{ marginTop: 300, fontSize: 112, color: CREAM }}>Bartolo</div>
      <div style={{ fontSize: 54, color: TERRAL }}>Pet Shop Delivery</div>
      <Img src={staticFile("sprites/bartolo_feliz.png")} style={{ width: 520, marginTop: 60, transform: `translateY(${-hop}px)` }} />
      <div style={{ display: "flex", gap: 14, marginTop: 20 }}>{[0, 1, 2, 3, 4].map((i) => <Pix key={i} rows={HEART} k={6} pal={HPAL} />)}</div>
      <div style={{ fontSize: 54, color: CREAM, marginTop: 30 }}>Bello, Antioquia</div>
      <div style={{ marginTop: 60, background: "rgba(0,0,0,.35)", borderRadius: 34, padding: "26px 60px", textAlign: "center" }}>
        <div style={{ fontSize: 64, color: CREAM }}>patitas.win</div>
        <div style={{ fontSize: 40, color: "#D9BDA0", marginTop: 10 }}>WhatsApp <span style={{ fontSize: 64, color: TERRAL }}>314 585 6688</span></div>
      </div>
    </AbsoluteFill>
  );
};
const Destello: React.FC<{ f: number }> = ({ f }) => {
  for (const s of SHOTS.slice(1, -1)) { const c = Math.round(s.a * FPS); if (f >= c && f < c + 4) return <AbsoluteFill style={{ background: "#fff", opacity: [0.75, 0.5, 0.28, 0.1][f - c] }} />; }
  return null;
};

export const MusicalShort: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const [tex, setTex] = useState<Record<string, THREE.Texture> | null>(null);
  const [h1] = useState(() => delayRender("texturas"));
  const [h2] = useState(() => delayRender("fuente"));
  useEffect(() => { loadTextures().then((x) => { setTex(x); continueRender(h1); }); }, [h1]);
  useEffect(() => {
    const ff = new FontFace(FONT, `url(${staticFile("ComicNeue-Bold.otf")})`, { weight: "700" });
    ff.load().then((x) => { (document.fonts as unknown as { add: (f: FontFace) => void }).add(x); continueRender(h2); }).catch(() => continueRender(h2));
  }, [h2]);
  if (!tex) return null;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <Audio src={staticFile("cancion.mp3")} />
      <ThreeCanvas width={1080} height={1920} shadows="percentage" gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.2, far: 1500 }}>
        <Inner tex={tex} />
      </ThreeCanvas>
      <Titulo t={t} />
      <Reloj t={t} />
      <Corazones t={t} />
      <LluviaCorazones t={t} />
      <Letra t={t} />
      <Franja t={t} />
      <Cierre t={t} />
      <Destello f={f} />
    </AbsoluteFill>
  );
};
