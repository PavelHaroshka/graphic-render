import { Vector3 } from "threejs-math";
import { clamp } from "../ray-tracer/math";

export class Point {
  constructor(x, y, intencity) {
    this.x = x;
    this.y = y;
    this.h = clamp(intencity, [0, 1]);
  }
}

export class Triangle {
  color = new Vector3(255, 255, 255);

  constructor(p0, p1, p2, color) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.color = color ?? new Vector3(255, 255, 255);
  }
}

export class Shape {
  identifier = "";
  verticies = [];
  triangles = [];
  boundingSphere = {
    center: new Vector3(0, 0, 0),
    radius: 0,
  };

  constructor(identifier, verticies, edges) {
    this.identifier = identifier;
    this.verticies = verticies;

    this.triangles = edges.map(
      ({ p0, p1, p2, color }) =>
        new Triangle(
          this.verticies[p0],
          this.verticies[p1],
          this.verticies[p2],
          color,
        ),
    );

    this.boundingSphere = this.getBoundinSphere(verticies);
  }

  getBoundinSphere(verticies) {
    let radius = 0;

    if (!verticies.length) return { center: new Vector3(0, 0, 0), radius };

    const centroid = new Vector3(0, 0, 0);

    verticies.forEach((vertex) => centroid.add(vertex));

    const center = centroid.divideScalar(verticies.length);

    verticies.forEach((vertex) => {
      const x = vertex.x - center.x;
      const y = vertex.y - center.y;
      const z = vertex.z - center.z;

      const distance = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      radius = Math.max(radius, distance);
    });

    return { center, radius };
  }
}

export class ShapeInstance {
  constructor({ identifier, translation, scale, rotation }) {
    this.identifier = identifier || shapes.unknown;
    this.translation = translation || new Vector3(0, 0, 0);
    this.scale = scale ?? 1;
    this.rotation = rotation || new Vector3(0, 0, 0);
  }
}

export const shapes = {
  cube: "cube",
  unknown: "",
};
