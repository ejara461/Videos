import React from "react";
import { Composition } from "remotion";
import { PruebaShort, PRUEBA_FRAMES } from "./videos/prueba/Prueba";
import { MusicalShort, MUSICAL_FRAMES } from "./videos/musical/Musical";
// Registra cada short nuevo aquí, con su propio id.
export const Root: React.FC = () => (
  <>
    <Composition id="Prueba" component={PruebaShort} durationInFrames={PRUEBA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Musical" component={MusicalShort} durationInFrames={MUSICAL_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
