import { Vector3 } from "threejs-math";

export class Camera {
  O = new Vector3(0, 0, 0);

  Vw = 3;
  Vh = 3;
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

  isSphereOutsideFrustum(center, radius) {
    const { Vw, Vh, d, near = 0.1 } = this;

    const planes = {
      near: [0, 0, 1, -near],
      left: [1, 0, Vw / (2 * d), 0],
      right: [-1, 0, Vw / (2 * d), 0],
      top: [0, 1, Vh / (2 * d), 0],
      bottom: [0, -1, Vh / (2 * d), 0],
    };

    for (const [a, b, c, k] of Object.values(planes)) {
      const length = Math.sqrt(a * a + b * b + c * c);

      const distance =
        (a * center.x + b * center.y + c * center.z + k) / length;

      if (distance < -radius) {
        return true;
      }
    }

    return false;
  }
}
