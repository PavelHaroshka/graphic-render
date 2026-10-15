import { Vector3 } from "threejs-math";

import { Render } from "./render";
import { ShapeInstance, shapes } from "./shapes";
import { createCube, createCylinder, createSphere } from "./meshes";

import { blueFlatMaterial, crateMaterial, metalMaterial } from "./material";

export const initRasterizer = async () => {
  const meshShapes = [
    await createCube(crateMaterial),
    await createSphere(blueFlatMaterial),
    await createCylinder(metalMaterial),
  ];

  const instances = [
    {
      label: "cube",
      identifier: shapes.cube,
      translation: new Vector3(-3, 0, 8),
      rotation: new Vector3(0.3, 0.5, 0),
      scale: 1,
    },
    {
      label: "sphere",
      identifier: shapes.sphere,
      translation: new Vector3(0, 0, 8),
      rotation: new Vector3(0, 0, 0),
      scale: 1.2,
    },
    {
      label: "cylinder",
      identifier: shapes.cylinder,
      translation: new Vector3(3, 0, 8),
      rotation: new Vector3(0.3, 0.4, 0),
      scale: 1,
    },
  ];

  const objects = instances.map(
    ({ identifier, translation, rotation, scale }) => {
      const instance = new ShapeInstance({
        identifier,
        translation,
        scale,
        rotation,
      });

      return instance;
    },
  );

  const renderScene = () => {
    const render = new Render({
      elementId: "rasterizer-demo",
      screenWidth: 640,
      screenHeight: 640,
      shapes: meshShapes,
      objects,
    });

    render.renderScene();
  };

  renderScene();
};
