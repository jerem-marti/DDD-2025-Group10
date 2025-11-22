// src/views/galaxyView.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { initGalaxyView } from "../views/galaxyView.js";

describe("galaxyView", () => {
  let canvas;

  beforeEach(() => {
    document.body.innerHTML = `<canvas id="galaxy-canvas"></canvas>`;
    canvas = document.getElementById("galaxy-canvas");

    // fake dimensions
    Object.defineProperty(canvas, "clientWidth", { value: 400 });
    Object.defineProperty(canvas, "clientHeight", { value: 300 });

    // stub context so drawing calls don't crash
    canvas.getContext = () => ({
      setTransform: () => {},
      clearRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      globalAlpha: 1,
      fillStyle: "#000"
    });
  });

  it("initializes and toggles visibility", () => {
    const gv = initGalaxyView(canvas);
    expect(canvas.style.display).not.toBe("none");
    gv.hide();
    expect(canvas.style.display).toBe("none");
    gv.show();
    expect(canvas.style.display).toBe("block");
  });

  it("updates without throwing", () => {
    const gv = initGalaxyView(canvas);
    const data = [{ glon: 0, sy_dist: 10 }, { glon: 90, sy_dist: 20 }];

    const view = {
      x: (d) => d.glon || 0,
      y: (d) => d.sy_dist || 0,
      encodings: {
        baseColor: "#fff",
        baseOpacity: () => 0.5,
        baseSize: () => 3
      }
    };

    expect(() => gv.update(data, view)).not.toThrow();
  });
});
