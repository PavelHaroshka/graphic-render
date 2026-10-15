import { Vector3 } from "threejs-math";

import { Render, RENDER_MODE, SHADING_MODE } from "./render";
import { ShapeInstance, shapes } from "./shapes";
import { createCube, createCylinder, createSphere } from "./meshes";

import {
  blueFlatMaterial,
  crateMaterial,
  metalMaterial,
  orangeFlatMaterial,
  redFlatMaterial,
} from "./material";

const shadowMode = document.getElementById("shadow-mode");
const renderMode = document.getElementById("render-mode");

const populateSelect = (select, modes, selectedMode) => {
  if (!select) return;

  select.replaceChildren();

  Object.entries(modes)
    .filter(([key]) => Number.isNaN(Number(key)))
    .forEach(([key, value]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      select.appendChild(option);

      if (value === selectedMode) {
        select.value = key;
      }
    });
};

const getSelectedMode = (select, modes, fallback) => {
  const selected = Object.entries(modes).find(([key]) => key === select?.value);

  return selected ? selected[1] : fallback;
};

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

  objects.forEach((instance, index) => {
    instance.debugLabel = instances[index].label;
  });

  populateSelect(renderMode, RENDER_MODE, RENDER_MODE.filled);
  populateSelect(shadowMode, SHADING_MODE, SHADING_MODE.flat);

  const renderScene = () => {
    const render = new Render({
      elementId: "rasterizer-demo",
      screenWidth: 640,
      screenHeight: 640,
      renderMode: getSelectedMode(renderMode, RENDER_MODE, RENDER_MODE.filled),
      shadingMode: getSelectedMode(shadowMode, SHADING_MODE, SHADING_MODE.flat),
      shapes: meshShapes,
      objects,
    });

    render.renderScene();
  };

  renderMode?.addEventListener("change", renderScene);
  shadowMode?.addEventListener("change", renderScene);

  renderScene();
};
