import { Vector3 } from "threejs-math";

import { Render } from "./render";

import { AmbientLight, DirectionalLight, PointLight } from "./light";

import { Sphere } from "./shapes";

export const initRaytracer = () => {
  const render = new Render(
    {
      elementId: "ray-tracer-demo",
      screenWidth: 320,
      screenHeight: 320,
    },
    {
      shapes: [
        new Sphere(new Vector3(0, -1, 3), 1, new Vector3(255, 0, 0), 500, 0.2),
        new Sphere(new Vector3(2, 0, 4), 1, new Vector3(0, 0, 255), 500, 0.3),
        new Sphere(new Vector3(-2, 0, 4), 1, new Vector3(0, 255, 0), 10, 0.4),
        new Sphere(
          new Vector3(0, -5001, 0),
          5000,
          new Vector3(255, 255, 0),
          1000,
          0.5,
        ),
      ],
      lights: [
        new AmbientLight(0.2),
        new PointLight(0.6, new Vector3(2, 1, 0)),
        new DirectionalLight(0.2, new Vector3(1, 4, 4)),
      ],
    },
  );

  render.draw();
};
