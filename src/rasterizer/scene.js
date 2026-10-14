export class Scene {
  constructor({ shapes = [], objects = [] }) {
    this.shapes = Object.fromEntries(
      shapes.map((shape) => [shape.identifier, shape]),
    );

    this.objects = objects;
  }
}
