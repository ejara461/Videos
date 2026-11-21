// Prueba de 5 s del estilo del skill: mundo three.js posado por cuadro + cadena de post del motor:
// tinta -> desenfoque de lente (pre + principal) -> brillo (solo emisivos) -> mapeo de tono NEUTRAL -> corrección de color, MSAA 4.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, continueRender, delayRender, getInputProps, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree, useFrame } from "@react-three/fiber";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode, EffectComposer, RenderPass, EffectPass } from "postprocessing";
import { World, loadSprite, TOTAL } from "./world";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";

export const PRUEBA_FRAMES = TOTAL;

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass; const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3();

const Inner: React.FC<{ tex: THREE.Texture }> = ({ tex }) => {
  const f = useCurrentFrame();
  const { camera, scene, gl, size } = useThree();
  const world = useMemo(() => new World(tex), [tex]);
  const p = getInputProps() as any;
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  // Misma cadena del skill (tinta -> desenfoque pre + principal -> brillo + tono + color), armada directamente con
  // postprocessing: el componente <EffectComposer> de @react-three/postprocessing no dibuja con WebGL por software.
  const comp = useMemo(() => {
    const c = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: p.msaa ?? 4 });
    c.addPass(new RenderPass(scene, camera));
    if (!p.noink) c.addPass(fx.ink);
    c.addPass(new EffectPass(camera, fx.lens.pre));
    c.addPass(new EffectPass(camera, fx.lens.main));
    c.addPass(new EffectPass(camera, fx.bloom, fx.tone, fx.grade));
    return c;
  }, [gl, scene, camera, fx]);
  useEffect(() => { comp.setSize(size.width, size.height); }, [comp, size]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  useFrame(() => { if (!p.nopost) comp.render(); else gl.render(scene, camera); }, 1);
  const cam = camera as THREE.PerspectiveCamera;
  world.update(f, cam, scene);
  const look = world.focusPoint();
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, look.clone().sub(cam.position).dot(fwd));
  fx.lens.cInf = 11; // plano medio: 10-12 px (valores finales del skill)
  gradeFor(fx.grade, "day");
  return <primitive object={world.root} dispose={null} />;
};

export const PruebaShort: React.FC = () => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender("sprite"));
  useEffect(() => { loadSprite().then((t) => { setTex(t); continueRender(handle); }); }, [handle]);
  if (!tex) return null;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      {/* canción de la marca: los primeros 5 s (introducción), con salida suave */}
      <Audio src={staticFile("cancion.mp3")} volume={(f) => interpolate(f, [0, 132, 150], [1, 1, 0], { extrapolateRight: "clamp" })} />
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.2, far: 1500 }}>
        <Inner tex={tex} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
