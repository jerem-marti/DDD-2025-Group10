// tests/state.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { state, goToScene, nextScene, prevScene } from "../state.js";

describe("state / scene navigation", () => {
  beforeEach(() => {
    state.currentSceneIndex = 0;
  });

  it("starts at scene index 0", () => {
    expect(state.currentSceneIndex).toBe(0);
  });

  it("goToScene clamps to valid range", () => {
    const lastIndex = state.scenes.length - 1;

    goToScene(-10);
    expect(state.currentSceneIndex).toBe(0);

    goToScene(999);
    expect(state.currentSceneIndex).toBe(lastIndex);
  });

  it("nextScene increases index within bounds", () => {
    const lastIndex = state.scenes.length - 1;
    goToScene(lastIndex - 1);
    nextScene();
    expect(state.currentSceneIndex).toBe(lastIndex);
    // one more should stay at last
    nextScene();
    expect(state.currentSceneIndex).toBe(lastIndex);
  });

  it("prevScene decreases index within bounds", () => {
    goToScene(1);
    prevScene();
    expect(state.currentSceneIndex).toBe(0);
    // further prev remains 0
    prevScene();
    expect(state.currentSceneIndex).toBe(0);
  });

  it("notifies listeners on scene change", () => {
    let calledScene = null;
    const unsubscribe = state.listeners.splice(0); // clear previous listeners if any
    const listener = (scene) => {
      calledScene = scene;
    };
    state.listeners.length = 0;
    state.listeners.push(listener);

    goToScene(1);
    expect(calledScene).toBe(state.scenes[1]);
  });
});
