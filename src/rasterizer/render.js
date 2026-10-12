import { Matrix4, Vector3 } from "threejs-math";
import { Canvas } from "../ray-tracer/canvas";
import { clamp } from "../ray-tracer/math";
import { Camera } from "./camera";
import { Triangle } from "./shapes";
import { Scene } from "./scene";

export class Render {
  constructor(config) {
    this.config = config;
    this.canvas = new Canvas(config);
    this.canvas.clear();
    this.camera = new Camera(config);
    this.scene = new Scene(config);
  }

  putPixel(x, y, color) {
    const { screenHeight: Ch, screenWidth: Cw } = this.config;

    const Cx = clamp(x, [-Cw / 2, Cw / 2]);
    const Cy = clamp(y, [-Ch / 2, Ch / 2]);

    const Sx = Cw / 2 + Cx;
    const Sy = Ch / 2 - Cy;

    const { x: r, y: g, z: b } = color;

    this.canvas.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    this.canvas.ctx.fillRect(Sx, Sy, 1, 1);
  }

  drawLine(P0, P1, color) {
    let p0 = P0;
    let p1 = P1;

    if (Math.abs(p1.x - p0.x) > Math.abs(p1.y - p0.y)) {
      if (p0.x > p1.x) {
        [p0, p1] = [p1, p0];
      }

      const ys = this.interpolate({ x: p0.x, y: p0.y }, { x: p1.x, y: p1.y });

      for (let x = p0.x; x < p1.x; x++) {
        this.putPixel(x, ys[x - p0.x], color);
      }
    } else {
      if (p0.y > p1.y) {
        [p0, p1] = [p1, p0];
      }

      const xs = this.interpolate({ x: p0.y, y: p0.x }, { x: p1.y, y: p1.x });

      for (let y = p0.y; y < p1.y; y++) {
        this.putPixel(xs[y - p0.y], y, color);
      }
    }
  }

  drawFrameTri({ p0, p1, p2, color }) {
    this.drawLine(p0, p1, color);
    this.drawLine(p1, p2, color);
    this.drawLine(p2, p0, color);
  }

  drawShadedTri({ p0, p1, p2 }, color) {
    const vertices = [p0, p1, p2].sort((a, b) => a.y - b.y);

    const [v0, v1, v2] = vertices;
    if (v0.y === v2.y) return;

    const minY = Math.ceil(v0.y);
    const maxY = Math.ceil(v2.y);

    for (let y = minY; y < maxY; y++) {
      const intersections = [];

      const edges = [
        [v0, v1],
        [v1, v2],
        [v2, v0],
      ];

      for (const [a, b] of edges) {
        if (a.y === b.y) continue;

        const low = Math.min(a.y, b.y);
        const high = Math.max(a.y, b.y);

        if (y < low || y >= high) continue;

        const t = (y - a.y) / (b.y - a.y);

        intersections.push({
          x: a.x + t * (b.x - a.x),
          h: a.h + t * (b.h - a.h),
        });
      }

      if (intersections.length < 2) continue;

      intersections.sort((a, b) => a.x - b.x);

      const left = intersections[0];
      const right = intersections[intersections.length - 1];

      const startX = Math.ceil(left.x);
      const endX = Math.floor(right.x);

      for (let x = startX; x <= endX; x++) {
        const t = right.x === left.x ? 0 : (x - left.x) / (right.x - left.x);

        const intensity = left.h + t * (right.h - left.h);

        const shadedColor = new Vector3(
          color.x * intensity,
          color.y * intensity,
          color.z * intensity,
        );

        this.putPixel(x, y, shadedColor);
      }
    }
  }

  renderShape({ shape, instance }) {
    const projected = {};

    for (const vertex of shape.verticies) {
      const { x, y, z } = vertex;

      const transformed = this.transformSape(vertex, instance);
      const projectedVertex = this.camera.projectVertex(transformed);

      console.log({
        original: { x: vertex.x, y: vertex.y, z: vertex.z },
        transformed,
        projected: projectedVertex,
      });

      projected[`${x}${y}${z}`] = {
        ...projectedVertex,
        h: vertex.h ?? 1,
      };
    }

    for (const triangle of shape.triangles) {
      this.renderTriangel(triangle, projected);
    }
  }

  transformSape(vertex, { scale, rotation, translation }) {
    const scaled = this.scaleShape(vertex, scale);
    const rotated = this.rotateShape(scaled, rotation);

    return this.translateShape(rotated, translation);
  }

  scaleShape(vertex, scale) {
    // prettier-ignore
    const scaleMatrix = new Matrix4().set(
    scale, 0,     0,     0,
    0,     scale, 0,     0,
    0,     0,     scale, 0,
    0,     0,     0,     1
  );

    return new Vector3(vertex.x, vertex.y, vertex.z).applyMatrix4(scaleMatrix);
  }

  rotateShape(vertex, rotation) {
    const { x: alpha, y: beta, z: gamma } = rotation;
    const { cos, sin } = Math;

    // prettier-ignore
    const Rx = new Matrix4().set(
    1, 0,        0,       0,
    0, cos(alpha), -sin(alpha), 0,
    0, sin(alpha), cos(alpha),  0,
    0, 0,        0,       1
  );

    // prettier-ignore
    const Ry = new Matrix4().set(
    cos(beta),  0, sin(beta), 0,
    0,          1, 0,         0,
    -sin(beta), 0, cos(beta), 0,
    0,          0, 0,         1
  );

    // prettier-ignore
    const Rz = new Matrix4().set(
    cos(gamma), -sin(gamma), 0, 0,
    sin(gamma), cos(gamma),  0, 0,
    0,          0,           1, 0,
    0,          0,           0, 1
  );

    const rotationMatrix = Rz.multiply(Ry).multiply(Rx);

    return new Vector3(vertex.x, vertex.y, vertex.z).applyMatrix4(
      rotationMatrix,
    );
  }

  translateShape(vertex, translation) {
    // prettier-ignore
    const translationMatrix = new Matrix4().set(
    1, 0, 0, translation.x,
    0, 1, 0, translation.y,
    0, 0, 1, translation.z,
    0, 0, 0, 1
  );

    return new Vector3(vertex.x, vertex.y, vertex.z).applyMatrix4(
      translationMatrix,
    );
  }

  renderTriangel(triangle, projected) {
    const { p0, p1, p2 } = triangle;
    const color = triangle.color ?? new Vector3(255, 255, 255);

    const projectedTriangle = new Triangle(
      projected[`${p0.x}${p0.y}${p0.z}`],
      projected[`${p1.x}${p1.y}${p1.z}`],
      projected[`${p2.x}${p2.y}${p2.z}`],
      color,
    );

    this.drawShadedTri(projectedTriangle, color);
  }

  renderScene() {
    for (const shapeInstance of this.scene.objects) {
      this.renderInstance(shapeInstance);
    }
  }

  renderInstance(instance) {
    this.renderShape({
      instance,
      shape: this.scene.shapes[instance.identifier],
    });
  }

  interpolate({ x: i0, y: d0 }, { x: i1, y: d1 }) {
    if (i0 === i1) {
      return [d0];
    }

    const values = [];
    const a = (d1 - d0) / (i1 - i0);
    let d = d0;

    for (let i = i0; i < i1; i++) {
      values.push(d);
      d += a;
    }

    return values;
  }
}
