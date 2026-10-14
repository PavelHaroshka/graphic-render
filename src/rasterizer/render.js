import { Matrix4, Vector3 } from "threejs-math";
import { Canvas } from "../ray-tracer/canvas";
import { Camera } from "./camera";
import { Scene } from "./scene";

export const RENDER_MODE = {
  wireframe: "wireframe",
  filled: "filled",
};

export const SHADING_MODE = {
  flat: "flat",
  gouraud: "gouraud",
  phong: "phong",
};

export class Render {
  depthBuffer;
  renderMode;

  constructor(config) {
    this.config = config;
    this.canvas = new Canvas(config);
    this.canvas.clear();
    this.camera = new Camera(config);
    this.scene = new Scene(config);

    this.width = config.screenWidth;
    this.height = config.screenHeight;

    this.renderMode = config.renderMode ?? RENDER_MODE.filled;
    this.shadingMode = config.shadingMode ?? SHADING_MODE.flat;

    this.ambientLight = config.ambientLight ?? 0.2;
    this.lightDirection = config.lightDirection ?? new Vector3(-1, 1, -1);

    this.depthBuffer = new Float32Array(this.width * this.height);
    this.clearDepthBuffer();
  }

  setRenderMode(mode) {
    if (!Object.values(RENDER_MODE).includes(mode)) {
      throw new Error(`Unknown render mode: ${mode}`);
    }

    this.renderMode = mode;
    this.renderScene();
  }

  setShadingMode(mode) {
    if (!Object.values(SHADING_MODE).includes(mode)) {
      throw new Error(`Unknown shading mode: ${mode}`);
    }

    this.shadingMode = mode;
    this.renderScene();
  }

  clearDepthBuffer() {
    this.depthBuffer.fill(0);
  }

  putPixel(x, y, color, depth) {
    const { screenHeight: Ch, screenWidth: Cw } = this.config;

    const screenX = Math.floor(Cw / 2 + x);
    const screenY = Math.floor(Ch / 2 - y);

    if (
      screenX < 0 ||
      screenX >= this.width ||
      screenY < 0 ||
      screenY >= this.height
    ) {
      return;
    }

    const index = screenY * this.width + screenX;

    const hasDepth = Number.isFinite(depth) && depth > 0;

    if (!hasDepth || depth > this.depthBuffer[index]) {
      if (hasDepth) {
        this.depthBuffer[index] = depth;
      }

      const { x: r, y: g, z: b } = color;

      this.canvas.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.canvas.ctx.fillRect(screenX, screenY, 1, 1);
    }
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
          invZ: a.invZ + t * (b.invZ - a.invZ),
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

        const invZ = left.invZ + t * (right.invZ - left.invZ);

        const shadedColor = new Vector3(
          color.x * intensity,
          color.y * intensity,
          color.z * intensity,
        );

        this.putPixel(x, y, shadedColor, invZ);
      }
    }
  }

  renderShape({ shape, instance }) {
    const transformed = shape.verticies.map((vertex) => ({
      ...this.transformShape(vertex, instance),
      h: vertex.h ?? 1,
    }));

    for (const triangle of shape.triangles) {
      const vertices = [triangle.p0, triangle.p1, triangle.p2].map((point) => {
        const index = shape.verticies.findIndex(
          (vertex) =>
            vertex.x === point.x &&
            vertex.y === point.y &&
            vertex.z === point.z,
        );

        if (index === -1) {
          throw new Error("Triangle vertex not found in shape.verticies");
        }

        return transformed[index];
      });

      const clipped = this.clipTriangle(vertices);

      if (clipped.length < 3) continue;

      if (this.isTriangleBackFace(clipped[0], clipped[1], clipped[2])) {
        continue;
      }

      const flatIntensity = this.calculateFlatIntensity(
        vertices[0],
        vertices[1],
        vertices[2],
      );

      for (let i = 1; i < clipped.length - 1; i++) {
        this.renderTriangel({
          p0: clipped[0],
          p1: clipped[i],
          p2: clipped[i + 1],
          color: triangle.color,
          flatIntensity,
        });
      }
    }
  }

  transformShape(vertex, { scale, rotation, translation }) {
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

  getShapeBoundingSphere(shape, instance) {
    const { center, radius } = shape.boundingSphere;
    const { scale, rotation, translation } = instance;

    const scaledCenter = this.scaleShape(center, scale);
    const rotatedCenter = this.rotateShape(scaledCenter, rotation);
    const worldCenter = this.translateShape(rotatedCenter, translation);

    const worldRadius = radius * Math.abs(scale);

    return {
      center: worldCenter,
      radius: worldRadius,
    };
  }

  clipPolygonAgainstPlane(vertices, plane) {
    if (vertices.length === 0) return [];

    const result = [];

    const intersect = (a, b, da, db) => {
      const t = da / (da - db);

      return {
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y),
        z: a.z + t * (b.z - a.z),
        h: (a.h ?? 1) + t * ((b.h ?? 1) - (a.h ?? 1)),
      };
    };

    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const previous = vertices[(i + vertices.length - 1) % vertices.length];

      const dc = plane(current);
      const dp = plane(previous);

      const currentInside = dc >= 0;
      const previousInside = dp >= 0;

      if (currentInside && previousInside) {
        result.push(current);
      } else if (previousInside && !currentInside) {
        result.push(intersect(previous, current, dp, dc));
      } else if (!previousInside && currentInside) {
        result.push(intersect(previous, current, dp, dc));
        result.push(current);
      }
    }

    return result;
  }

  clipTriangle(vertices) {
    const { Vw, Vh, d, near } = this.camera;
    const planes = {
      near: (v) => v.z - near,
      left: (v) => v.x + (v.z * Vw) / (2 * d),
      right: (v) => (v.z * Vw) / (2 * d) - v.x,
      bottom: (v) => v.y + (v.z * Vh) / (2 * d),
      top: (v) => (v.z * Vh) / (2 * d) - v.y,
    };

    return Object.values(planes).reduce(
      (polygon, plane) => this.clipPolygonAgainstPlane(polygon, plane),
      vertices,
    );
  }

  getTriangleNormal(p0, p1, p2) {
    const ax = p1.x - p0.x;
    const ay = p1.y - p0.y;
    const az = p1.z - p0.z;

    const bx = p2.x - p0.x;
    const by = p2.y - p0.y;
    const bz = p2.z - p0.z;

    return new Vector3(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
  }

  isTriangleBackFace(p0, p1, p2) {
    const normal = this.getTriangleNormal(p0, p1, p2);

    const centroid = new Vector3(
      (p0.x + p1.x + p2.x) / 3,
      (p0.y + p1.y + p2.y) / 3,
      (p0.z + p1.z + p2.z) / 3,
    );

    const dot =
      normal.x * centroid.x + normal.y * centroid.y + normal.z * centroid.z;

    return dot > 0;
  }

  renderTriangel(triangle) {
    const { p0, p1, p2 } = triangle;
    const color = triangle.color ?? new Vector3(255, 255, 255);

    const project = (point) => {
      const projected = this.camera.projectVertex(point);

      return {
        x: projected.x,
        y: projected.y,
        h: point.h ?? 1,
        invZ: 1 / point.z,
      };
    };

    const projectedTriangle = {
      p0: project(p0),
      p1: project(p1),
      p2: project(p2),
      color,
    };

    if (this.renderMode === RENDER_MODE.wireframe) {
      this.drawFrameTri(projectedTriangle);
      return;
    }

    if (this.shadingMode === SHADING_MODE.flat) {
      const intensity = triangle.flatIntensity ?? 1;

      const flatColor = new Vector3(
        color.x * intensity,
        color.y * intensity,
        color.z * intensity,
      );

      this.drawShadedTri(projectedTriangle, flatColor);
      return;
    }

    this.drawShadedTri(projectedTriangle, color);
  }

  renderScene() {
    this.canvas.clear();
    this.clearDepthBuffer();

    for (const shapeInstance of this.scene.objects) {
      this.renderInstance(shapeInstance);
    }
  }

  renderInstance(instance) {
    const shape = this.scene.shapes[instance.identifier];

    if (!shape) return;

    const sphere = this.getShapeBoundingSphere(shape, instance);

    const outside = this.camera.isSphereOutsideFrustum(
      sphere.center,
      sphere.radius,
    );

    if (outside) return;

    this.renderShape({ shape, instance });
  }

  normalize(vector) {
    const length = Math.sqrt(
      vector.x * vector.x + vector.y * vector.y + vector.z * vector.z,
    );

    if (length === 0) {
      return new Vector3(0, 0, 0);
    }

    return new Vector3(vector.x / length, vector.y / length, vector.z / length);
  }

  calculateFlatIntensity(p0, p1, p2) {
    const normal = this.normalize(this.getTriangleNormal(p0, p1, p2));

    const light = this.normalize(this.lightDirection);

    const diffuse = Math.max(
      0,
      normal.x * light.x + normal.y * light.y + normal.z * light.z,
    );

    return this.ambientLight + (1 - this.ambientLight) * diffuse;
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
