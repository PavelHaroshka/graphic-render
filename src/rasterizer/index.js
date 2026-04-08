import { Vector3 } from "threejs-math";

import { Render } from "./render";
import { Shape, ShapeInstance, shapes } from "./shapes";

export const initRasterizer = () => {
  const cube = new Shape(
    shapes.cube,
    [
      new Vector3(1, 1, 1),
      new Vector3(-1, 1, 1),
      new Vector3(-1, -1, 1),
      new Vector3(1, -1, 1),
      new Vector3(1, 1, -1),
      new Vector3(-1, 1, -1),
      new Vector3(-1, -1, -1),
      new Vector3(1, -1, -1),
    ],
    [
      { p0: 0, p1: 1, p2: 2, color: new Vector3(320, 320, 320) },
      { p0: 0, p1: 2, p2: 3, color: new Vector3(320, 320, 320) },
      { p0: 4, p1: 0, p2: 3, color: new Vector3(320, 320, 0) },
      { p0: 4, p1: 3, p2: 7, color: new Vector3(320, 320, 0) },
      { p0: 5, p1: 4, p2: 7, color: new Vector3(320, 0, 0) },
      { p0: 5, p1: 7, p2: 6, color: new Vector3(320, 0, 0) },
      { p0: 1, p1: 5, p2: 6, color: new Vector3(0, 320, 0) },
      { p0: 1, p1: 6, p2: 2, color: new Vector3(0, 320, 0) },
      { p0: 4, p1: 5, p2: 1, color: new Vector3(0, 0, 320) },
      { p0: 4, p1: 1, p2: 0, color: new Vector3(0, 0, 320) },
      { p0: 2, p1: 6, p2: 7, color: new Vector3(42, 42, 42) },
      { p0: 2, p1: 7, p2: 3, color: new Vector3(42, 42, 42) },
    ],
  );

  const render = new Render({
    elementId: "rasterizer-demo",
    screenWidth: 320,
    screenHeight: 320,
    shapes: [cube],
    objects: [
      new ShapeInstance({
        identifier: shapes.cube,
        translation: new Vector3(0, 0, 7),
        scale: 1,
        rotation: new Vector3(0, 0, 0),
      }),
    ],
  });

  render.renderScene();
}
