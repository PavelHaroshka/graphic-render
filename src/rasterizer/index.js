import { Vector3 } from "threejs-math";

import { Render, RENDER_MODE, SHADING_MODE } from "./render";
import { Shape, ShapeInstance, shapes } from "./shapes";

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
      { p0: 0, p1: 1, p2: 2, color: new Vector3(255, 255, 255) },
      { p0: 0, p1: 2, p2: 3, color: new Vector3(255, 255, 255) },

      { p0: 4, p1: 0, p2: 3, color: new Vector3(255, 255, 0) },
      { p0: 4, p1: 3, p2: 7, color: new Vector3(255, 255, 0) },

      { p0: 5, p1: 4, p2: 7, color: new Vector3(255, 0, 0) },
      { p0: 5, p1: 7, p2: 6, color: new Vector3(255, 0, 0) },

      { p0: 1, p1: 5, p2: 6, color: new Vector3(0, 255, 0) },
      { p0: 1, p1: 6, p2: 2, color: new Vector3(0, 255, 0) },

      { p0: 4, p1: 5, p2: 1, color: new Vector3(0, 0, 255) },
      { p0: 4, p1: 1, p2: 0, color: new Vector3(0, 0, 255) },

      { p0: 2, p1: 6, p2: 7, color: new Vector3(42, 42, 42) },
      { p0: 2, p1: 7, p2: 3, color: new Vector3(42, 42, 42) },
    ],
  );

  const instances = [
    {
      label: "center",
      translation: new Vector3(0, 0, 7),
      rotation: new Vector3(0, 0.5, 0),
    },
    {
      label: "left",
      translation: new Vector3(-4, 0, 7),
      rotation: new Vector3(0, 0.3, 0),
    },
    {
      label: "right-outside",
      translation: new Vector3(20, 0, 7),
      rotation: new Vector3(0, 0, 0),
    },
    {
      label: "behind-camera",
      translation: new Vector3(0, 0, -5),
      rotation: new Vector3(0, 0, 0),
    },
    {
      label: "near-plane",
      translation: new Vector3(0, 0, 0.5),
      rotation: new Vector3(0, 0.2, 0),
    },
  ];

  const objects = instances.map(
    ({ translation, rotation }) =>
      new ShapeInstance({
        identifier: shapes.cube,
        translation,
        scale: 1,
        rotation,
      }),
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
      shapes: [cube],
      objects,
    });

    render.renderScene();
  };

  renderMode?.addEventListener("change", renderScene);
  shadowMode?.addEventListener("change", renderScene);

  renderScene();
};
