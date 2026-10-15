import { Vector2, Vector3 } from "threejs-math";
import { Shape, shapes } from "./shapes";

const triangle = (p0, p1, p2, color) => ({
  p0,
  p1,
  p2,
  color,
});

export const createCube = (material = null) => {
  const vertices = [
    new Vector3(1, 1, 1),
    new Vector3(-1, 1, 1),
    new Vector3(-1, -1, 1),
    new Vector3(1, -1, 1),
    new Vector3(1, 1, -1),
    new Vector3(-1, 1, -1),
    new Vector3(-1, -1, -1),
    new Vector3(1, -1, -1),
  ];

  const uvs = [
    new Vector2(1, 0),
    new Vector2(0, 0),
    new Vector2(0, 1),
    new Vector2(1, 1),
    new Vector2(0, 0),
    new Vector2(1, 0),
    new Vector2(1, 1),
    new Vector2(0, 1),
  ];

  const triangles = [
    triangle(0, 1, 2),
    triangle(0, 2, 3),
    triangle(4, 0, 3),
    triangle(4, 3, 7),
    triangle(5, 4, 7),
    triangle(5, 7, 6),
    triangle(1, 5, 6),
    triangle(1, 6, 2),
    triangle(4, 5, 1),
    triangle(4, 1, 0),
    triangle(2, 6, 7),
    triangle(2, 7, 3),
  ];

  return new Shape(shapes.cube, vertices, triangles, uvs, material);
};

export const createSphere = (material = null, segments = 20, rings = 12) => {
  const vertices = [];
  const triangles = [];
  const uvs = [];

  for (let ring = 0; ring <= rings; ring++) {
    const theta = (Math.PI * ring) / rings;
    const v = ring / rings;

    for (let segment = 0; segment <= segments; segment++) {
      const phi = (2 * Math.PI * segment) / segments;
      const u = segment / segments;

      vertices.push(
        new Vector3(
          Math.sin(theta) * Math.cos(phi),
          Math.cos(theta),
          Math.sin(theta) * Math.sin(phi),
        ),
      );

      uvs.push(new Vector3(u, v, 0));
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
        triangles.push({
          p0: a,
          p1: c,
          p2: b,
        });
      }

      if (ring < rings - 1) {
        triangles.push({
          p0: c,
          p1: d,
          p2: b,
        });
      }
    }
  }

  return new Shape(shapes.sphere, vertices, triangles, uvs, material);
};

export const createCylinder = (material = null, segments = 20) => {
  const vertices = [];
  const triangles = [];
  const uvs = [];

  for (const y of [-1, 1]) {
    for (let segment = 0; segment <= segments; segment++) {
      const angle = (2 * Math.PI * segment) / segments;
      const u = segment / segments;
      const v = y === -1 ? 1 : 0;

      vertices.push(new Vector3(Math.cos(angle), y, Math.sin(angle)));
      uvs.push(new Vector3(u, v, 0));
    }
  }

  const stride = segments + 1;
  const topOffset = stride;

  for (let i = 0; i < segments; i++) {
    const bottomCurrent = i;
    const bottomNext = i + 1;
    const topCurrent = topOffset + i;
    const topNext = topOffset + i + 1;

    triangles.push(
      triangle(bottomCurrent, topCurrent, bottomNext),
      triangle(bottomNext, topCurrent, topNext),
    );
  }

  const bottomCenter = vertices.length;
  vertices.push(new Vector3(0, -1, 0));
  uvs.push(new Vector3(0.5, 0.5, 0));

  const bottomRimStart = vertices.length;

  for (let segment = 0; segment < segments; segment++) {
    const angle = (2 * Math.PI * segment) / segments;
    const x = Math.cos(angle);
    const z = Math.sin(angle);

    vertices.push(new Vector3(x, -1, z));
    uvs.push(new Vector3(0.5 + x * 0.5, 0.5 + z * 0.5, 0));
  }

  const topCenter = vertices.length;
  vertices.push(new Vector3(0, 1, 0));
  uvs.push(new Vector3(0.5, 0.5, 0));

  const topRimStart = vertices.length;

  for (let segment = 0; segment < segments; segment++) {
    const angle = (2 * Math.PI * segment) / segments;
    const x = Math.cos(angle);
    const z = Math.sin(angle);

    vertices.push(new Vector3(x, 1, z));
    uvs.push(new Vector3(0.5 + x * 0.5, 0.5 + z * 0.5, 0));
  }

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;

    triangles.push(
      triangle(bottomCenter, bottomRimStart + i, bottomRimStart + next),
      triangle(topCenter, topRimStart + next, topRimStart + i),
    );
  }

  return new Shape(shapes.cylinder, vertices, triangles, uvs, material);
};
