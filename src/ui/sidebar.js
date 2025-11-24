// src/ui/sidebar.js
import { renderDiagram } from './diagram.js';

/**
 * Initialize the sidebar UI.
 */
export function initSidebar({ headingEl, chatEl, notesEl, diagramEl, legendEl }) {
  if (!headingEl || !chatEl || !notesEl || !diagramEl || !legendEl) {
    throw new Error("Sidebar: missing required elements");
  }

  function renderLegend(legend) {
    legendEl.innerHTML = "";

    if (!legend) {
      legendEl.style.display = "none";
      return;
    }

    // Support both old format (items array) and new format (sections array)
    const sections = legend.sections || [{ title: legend.title || "Legend", items: legend.items || [] }];
    
    if (sections.length === 0 || sections.every(s => !s.items || s.items.length === 0)) {
      legendEl.style.display = "none";
      return;
    }

    legendEl.style.display = "block";

    sections.forEach((section) => {
      if (!section.items || section.items.length === 0) return;

      const sectionTitle = document.createElement("div");
      sectionTitle.className = "sidebar-legend-section-title";
      sectionTitle.textContent = section.title || "";

      const itemsContainer = document.createElement("div");
      itemsContainer.className = "sidebar-legend-items";

      section.items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "legend-item";

        const swatch = document.createElement("span");
        swatch.className = "legend-swatch";

        if (item.type === "color") {
          swatch.classList.add("legend-swatch-color");
          if (item.color) {
            swatch.style.backgroundColor = item.color;
          }
        } else if (item.type === "area") {
          swatch.classList.add("legend-swatch-area");
          if (item.color) {
            swatch.style.backgroundColor = item.color;
            swatch.style.opacity = "0.3";
          }
        } else if (item.type === "texture") {
          // item.className like "legend-swatch-hatch-sparse"
          if (item.className) {
            swatch.classList.add(item.className);
          }
        }

        const label = document.createElement("span");
        label.textContent = item.label || "";

        row.appendChild(swatch);
        row.appendChild(label);
        itemsContainer.appendChild(row);
      });

      legendEl.appendChild(sectionTitle);
      legendEl.appendChild(itemsContainer);
    });
  }

  function update(sidebarContent, sceneId = null) {
    const { heading, chat, notes, diagramHint, legend } = sidebarContent;

    headingEl.textContent = heading || "";

    // Chat messages
    chatEl.innerHTML = "";
    (chat || []).forEach((msg) => {
      const div = document.createElement("div");
      div.className = `msg msg-${msg.from}`;
      div.textContent = msg.text;
      chatEl.appendChild(div);
    });

    // Notes
    notesEl.innerHTML = "";
    (notes || []).forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n;
      notesEl.appendChild(li);
    });

    // Render diagram if scene ID is provided, otherwise show diagram hint
    if (sceneId) {
      renderDiagram(diagramEl, sceneId);
    } else {
      diagramEl.textContent = diagramHint || "";
      diagramEl.classList.remove('diagram-container');
    }

    // Legend
    renderLegend(legend);
  }

  return { update };
}