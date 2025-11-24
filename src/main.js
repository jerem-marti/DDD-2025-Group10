// src/main.js
import { loadData } from "./data-loader.js";
import { state, setDatasets, subscribe, goToScene } from "./state.js";
import { initGalaxyView } from "./views/galaxyView.js";
import { initScatterView } from "./views/scatterView.js";
import { initSmallMultiplesView } from "./views/smallMultiplesView.js";
import { initSidebar } from "./ui/sidebar.js";
import { initControls } from "./ui/controls.js";
import { initTooltip } from "./ui/tooltip.js";

async function init() {
  // Load datasets
  const { planets, systems } = await loadData();
  setDatasets({ planets, systems });

  // Grab DOM elements
  const galaxyCanvas = document.getElementById("galaxy-canvas");
  const scatterSvg = document.getElementById("scatter-svg");
  const smallMultiplesEl = document.getElementById("small-multiples");
  const tooltipEl = document.getElementById("tooltip");

  const sidebarHeading = document.getElementById("sidebar-heading");
  const sidebarChat = document.getElementById("sidebar-chat");
  const sidebarNotes = document.getElementById("sidebar-notes");
  const sidebarDiagram = document.getElementById("sidebar-diagram-hint");
  const sidebarLegend = document.getElementById("sidebar-legend");

  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");

  // Init components
  const tooltip = initTooltip(tooltipEl);
  const galaxyView = initGalaxyView(galaxyCanvas, tooltip);
  const scatterView = initScatterView(scatterSvg, tooltip);
  const smallMultiplesView = initSmallMultiplesView(smallMultiplesEl);
  const sidebar = initSidebar({
    headingEl: sidebarHeading,
    chatEl: sidebarChat,
    notesEl: sidebarNotes,
    diagramEl: sidebarDiagram,
    legendEl: sidebarLegend
  });

  initControls({
    prevButton: prevBtn,
    nextButton: nextBtn,
    onPrev: () => goToScene(state.currentSceneIndex - 1),
    onNext: () => goToScene(state.currentSceneIndex + 1)
  });

  // React to scene changes
  const updateScene = (scene) => {
    const datasetName = scene.dataset; // "planets" | "systems"
    const full = state.datasets[datasetName] || [];
    const data = scene.filterFn ? full.filter(scene.filterFn) : full;

    // Remove small-multiples class by default
    document.body.classList.remove("show-small-multiples");

    if (scene.view.type === "galaxy") {
      scatterView.hide();
      smallMultiplesView.hide();
      galaxyView.show();
      galaxyView.update(data, scene.view);
    } else if (scene.view.type === "scatter") {
      galaxyView.hide();
      smallMultiplesView.hide();
      scatterView.show();
      scatterView.update(data, scene.view);
    } else if (scene.view.type === "transition") {
      galaxyView.hide();
      scatterView.hide();
      smallMultiplesView.show();
      smallMultiplesView.update(data, scene.view);
      document.body.classList.add("show-small-multiples");
    }

    sidebar.update(scene.sidebarContent, scene.id);
  };

  subscribe(updateScene);

  // Handle window resize - redraw current scene
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentScene = state.scenes[state.currentSceneIndex];
      if (currentScene) {
        updateScene(currentScene);
      }
    }, 200);
  });

  // Start at first scene
  goToScene(0);
}

init().catch((err) => {
  console.error("Init failed", err);
});
