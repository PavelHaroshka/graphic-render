import { Vector3 } from "threejs-math";
import { Shape, shapes } from "./shapes";

const color = (r, g, b) => new Vector3(r, g, b);

const white = color(220, 220, 220);
const blue = color(70, 140, 240);
const orange = color(240, 150, 60);

const triangle = (p0, p1, p2, color) => ({
  p0,
  p1,
  p2,
  color,
});

const createCube = () =>
  new Shape(
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
      triangle(0, 1, 2, white),
      triangle(0, 2, 3, white),

      triangle(4, 0, 3, color(255, 255, 0)),
      triangle(4, 3, 7, color(255, 255, 0)),

      triangle(5, 4, 7, color(255, 0, 0)),
      triangle(5, 7, 6, color(255, 0, 0)),

      triangle(1, 5, 6, color(0, 255, 0)),
      triangle(1, 6, 2, color(0, 255, 0)),

      triangle(4, 5, 1, color(0, 0, 255)),
      triangle(4, 1, 0, color(0, 0, 255)),

      triangle(2, 6, 7, color(42, 42, 42)),
      triangle(2, 7, 3, color(42, 42, 42)),
    ],
  );

const createSphere = (segments = 20, rings = 12) => {
  const vertices = [];
  const triangles = [];

  for (let ring = 0; ring <= rings; ring++) {
    const theta = (Math.PI * ring) / rings;

    for (let segment = 0; segment <= segments; segment++) {
      const phi = (2 * Math.PI * segment) / segments;

      vertices.push(
        new Vector3(
          Math.sin(theta) * Math.cos(phi),
          Math.cos(theta),
          Math.sin(theta) * Math.sin(phi),
        ),
      );
    }
  }

  const stride = segments + 1;

  for (let ring = 0; ring < rings; ring++) {
    for (let segment = 0; segment < segments; segment++) {
      const a = ring * stride + segment;
      const b = a + stride;
      const c = a + 1;
      const d = b + 1;

      if (ring > 0) {
        triangles.push(triangle(a, c, b, blue));
      }

      if (ring < rings - 1) {
        triangles.push(triangle(c, d, b, blue));
      }
    }
  }

  return new Shape(shapes.sphere, vertices, triangles);
};

const createCylinder = (segments = 20) => {
  const vertices = [];
  const triangles = [];

  for (const y of [-1, 1]) {
    for (let segment = 0; segment < segments; segment++) {
      const angle = (2 * Math.PI * segment) / segments;

      vertices.push(new Vector3(Math.cos(angle), y, Math.sin(angle)));
    }
  }

  const bottomCenter = vertices.length;
  vertices.push(new Vector3(0, -1, 0));

  const topCenter = vertices.length;
  vertices.push(new Vector3(0, 1, 0));

  const topOffset = segments;

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;

    const bottomCurrent = i;
    const bottomNext = next;
    const topCurrent = topOffset + i;
    const topNext = topOffset + next;

    triangles.push(
      triangle(bottomCurrent, topCurrent, bottomNext, orange),
      triangle(bottomNext, topCurrent, topNext, orange),
    );

    triangles.push(
      triangle(bottomCenter, bottomNext, bottomCurrent, blue),
      triangle(topCenter, topCurrent, topNext, blue),
    );
  }

  return new Shape(shapes.cylinder, vertices, triangles);
};

export const createMeshes = () => [
  createCube(),
  createSphere(),
  createCylinder(),
];
