// src/state.js
import { scenes } from "./scenes-config.js";

export const state = {
  scenes,
  currentSceneIndex: 0,
  datasets: {
    planets: [],
    systems: []
  },
  listeners: []
};

export function setDatasets({ planets, systems }) {
  state.datasets.planets = planets;
  state.datasets.systems = systems;
}

export function getCurrentScene() {
  return state.scenes[state.currentSceneIndex];
}

export function subscribe(listener) {
  state.listeners.push(listener);
  // return unsubscribe
  return () => {
    state.listeners = state.listeners.filter((l) => l !== listener);
  };
}

function notify(scene) {
  state.listeners.forEach((fn) => fn(scene));
}

/**
 * Jump to a scene by index, clamped within bounds.
 */
export function goToScene(index) {
  const maxIndex = state.scenes.length - 1;
  const clamped = Math.max(0, Math.min(index, maxIndex));

  state.currentSceneIndex = clamped;
  const scene = state.scenes[clamped];
  notify(scene);
}

/**
 * Move to the next scene.
 */
export function nextScene() {
  goToScene(state.currentSceneIndex + 1);
}

/**
 * Move to the previous scene.
 */
export function prevScene() {
  goToScene(state.currentSceneIndex - 1);
}
