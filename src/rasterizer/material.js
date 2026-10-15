import { Vector3 } from "threejs-math";
import { SHADING_MODE } from "./render";
import { loadTexture } from "./texture";

import crateTexture from "../assets/crate-texture.jpg";

import metalTexture from "../assets/metal-texture.jpg";
import metalNormalMap from "../assets/normal-map.png";

export class Material {
  shading = SHADING_MODE.flat;

  constructor({
    color = null,
    texture = null,
    normalMap = null,
    shading,
  } = {}) {
    this.color = color;
    this.texture = texture;
    this.shading = shading;
    this.normalMap = normalMap;
  }
}

export const createMaterial = async ({
  textureSrc,
  normalMapSrc,
  color,
  shading,
}) => {
  const texture = textureSrc ? await loadTexture(textureSrc) : null;
  const normalMap = normalMapSrc ? await loadTexture(normalMapSrc) : null;

  return new Material({
    texture,
    normalMap,
    color,
    shading,
  });
};
export const redFlatMaterial = await createMaterial({
  color: new Vector3(255, 0, 0),
  shading: SHADING_MODE.flat,
});

export const blueFlatMaterial = await createMaterial({
  color: new Vector3(70, 140, 240),
  shading: SHADING_MODE.gouraud,
});

export const orangeFlatMaterial = await createMaterial({
  color: new Vector3(240, 150, 60),
  shading: SHADING_MODE.flat,
});

export const crateMaterial = await createMaterial({
  textureSrc: crateTexture,
  shading: SHADING_MODE.flat,
});

export const metalMaterial = await createMaterial({
  textureSrc: metalTexture,
  normalMapSrc: metalNormalMap,
  shading: SHADING_MODE.phong,
});
