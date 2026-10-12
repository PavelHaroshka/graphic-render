import { Vector3 } from "threejs-math";

export class Camera {
  O = new Vector3(0, 0, 0);

  Vw = 3;
  Vh = 2.25;
  d = 2;
  near = 0.1;

  constructor(config) {
    this.config = config;
  }

  castOnViewport(x, y) {
    const { screenHeight: Ch, screenWidth: Cw } = this.config;

    return {
      x: (x * Cw) / this.Vw,
      y: (y * Ch) / this.Vh,
    };
  }

  projectVertex(v) {
    if (v.z < this.near) {
      return null;
    }

    return this.castOnViewport((v.x * this.d) / v.z, (v.y * this.d) / v.z);
  }
}
