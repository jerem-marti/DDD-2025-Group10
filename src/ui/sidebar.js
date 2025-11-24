// src/ui/sidebar.js
import { renderDiagram } from './diagram.js';
import { sources } from '../sources.js';

/**
 * Initialize the sidebar UI.
 */
export function initSidebar({ headingEl, chatEl, notesEl, diagramEl, legendEl }) {
  if (!headingEl || !chatEl || !notesEl || !diagramEl || !legendEl) {
    throw new Error("Sidebar: missing required elements");
  }

  /**
   * Render citation bubbles for a given scene
   */
  function renderCitations(sceneId) {
    const sceneSources = sources[sceneId];
    if (!sceneSources || sceneSources.length === 0) return '';

    const citationsHtml = sceneSources.map((source, index) => {
      return `
        <span class="citation-wrapper" data-citation-id="${source.id}">
          <a href="${source.url}" 
             target="_blank" 
             class="citation-bubble"
             title="${source.shortLabel}">
            ${source.shortLabel}
          </a>
          <div class="citation-tooltip">
            <div class="citation-tooltip-title">${source.shortLabel}</div>
            <div class="citation-tooltip-section">
              <strong>What it says:</strong>
              <p>${source.whatItSays}</p>
            </div>
            <div class="citation-tooltip-section">
              <strong>Why we use it:</strong>
              <p>${source.whyWeUseIt}</p>
            </div>
            <div class="citation-tooltip-footer">Click to open link</div>
          </div>
        </span>
      `;
    }).join('');

    return `<div class="citations-container">${citationsHtml}</div>`;
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

    // Add citations after chat
    const existingCitations = chatEl.nextElementSibling;
    if (existingCitations && existingCitations.classList.contains('citations-container')) {
      existingCitations.remove();
    }
    if (sceneId) {
      const citationsHtml = renderCitations(sceneId);
      if (citationsHtml) {
        chatEl.insertAdjacentHTML('afterend', citationsHtml);
        
        // Add hover listeners to position tooltips dynamically
        const citationWrappers = document.querySelectorAll('.citation-wrapper');
        citationWrappers.forEach(wrapper => {
          const bubble = wrapper.querySelector('.citation-bubble');
          const tooltip = wrapper.querySelector('.citation-tooltip');
          if (!bubble || !tooltip) return;
          
          const showTooltip = () => {
            const bubbleRect = bubble.getBoundingClientRect();
            const tooltipHeight = 350; // Approximate height
            const tooltipWidth = 280;
            
            const spaceAbove = bubbleRect.top;
            const spaceBelow = window.innerHeight - bubbleRect.bottom;
            
            // Position tooltip above or below based on available space
            tooltip.classList.remove('tooltip-top', 'tooltip-bottom');
            if (spaceAbove > tooltipHeight || spaceAbove > spaceBelow) {
              tooltip.classList.add('tooltip-top');
              tooltip.style.top = 'auto';
              tooltip.style.bottom = `${window.innerHeight - bubbleRect.top + 10}px`;
            } else {
              tooltip.classList.add('tooltip-bottom');
              tooltip.style.top = `${bubbleRect.bottom + 10}px`;
              tooltip.style.bottom = 'auto';
            }
            
            // Position horizontally to stay on screen
            const left = Math.max(10, Math.min(
              bubbleRect.left - 10,
              window.innerWidth - tooltipWidth - 10
            ));
            tooltip.style.left = `${left}px`;
            tooltip.style.transform = 'none';
            tooltip.classList.add('visible');
          };
          
          const hideTooltip = () => {
            tooltip.classList.remove('visible');
          };
          
          wrapper.addEventListener('mouseenter', showTooltip);
          wrapper.addEventListener('mouseleave', hideTooltip);
        });
      }
    }

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
    
    // Scroll sidebar to top when content changes
    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl) {
      sidebarEl.scrollTop = 0;
    }
  }

  return { update };
}