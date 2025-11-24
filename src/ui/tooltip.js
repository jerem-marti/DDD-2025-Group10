// src/ui/tooltip.js

/**
 * Initialize and manage the tooltip system
 */
export function initTooltip(tooltipEl) {
  if (!tooltipEl) {
    throw new Error("Tooltip: element is required");
  }

  let hideTimeout = null;

  function show(content, mouseX, mouseY) {
    // Clear any pending hide
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    // Set content
    if (typeof content === 'string') {
      tooltipEl.innerHTML = content;
    } else {
      tooltipEl.innerHTML = '';
      tooltipEl.appendChild(content);
    }

    // Show tooltip temporarily to measure it
    tooltipEl.style.display = 'block';
    tooltipEl.style.visibility = 'hidden';
    
    // Get tooltip dimensions
    const rect = tooltipEl.getBoundingClientRect();
    const tooltipWidth = rect.width;
    const tooltipHeight = rect.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position with 10px offset from cursor
    let left = mouseX + 10;
    let top = mouseY + 10;

    // Check if tooltip would go off right edge
    if (left + tooltipWidth > viewportWidth - 20) {
      left = mouseX - tooltipWidth - 10;
    }
    
    // Check if tooltip would go off bottom edge
    if (top + tooltipHeight > viewportHeight - 20) {
      top = mouseY - tooltipHeight - 10;
    }
    
    // Ensure tooltip stays within left edge
    if (left < 20) {
      left = 20;
    }
    
    // Ensure tooltip stays within top edge
    if (top < 20) {
      top = 20;
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.visibility = 'visible';
  }

  function hide(immediate = false) {
    if (immediate) {
      tooltipEl.style.display = 'none';
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    } else {
      // Delay hide to allow moving between nearby elements
      hideTimeout = setTimeout(() => {
        tooltipEl.style.display = 'none';
        hideTimeout = null;
      }, 100);
    }
  }

  function update(content) {
    if (tooltipEl.style.display === 'block') {
      if (typeof content === 'string') {
        tooltipEl.innerHTML = content;
      } else {
        tooltipEl.innerHTML = '';
        tooltipEl.appendChild(content);
      }
    }
  }

  return {
    show,
    hide,
    update
  };
}

/**
 * Format planet data for tooltip display
 */
export function formatPlanetTooltip(planet) {
  const lines = [`<strong>${planet.pl_name || 'Unknown'}</strong>`];
  
  if (planet.hostname) {
    lines.push(`Host: ${planet.hostname}`);
  }
  
  if (planet.pl_rade != null) {
    lines.push(`Radius: ${planet.pl_rade.toFixed(2)} R⊕`);
  }
  
  if (planet.pl_bmasse != null) {
    lines.push(`Mass: ${planet.pl_bmasse.toFixed(2)} M⊕`);
  }
  
  if (planet.pl_g_rel != null) {
    lines.push(`Gravity: ${planet.pl_g_rel.toFixed(2)} g⊕`);
  }
  
  if (planet.pl_insol_merged != null) {
    lines.push(`Insolation: ${planet.pl_insol_merged.toFixed(2)} S⊕`);
  }
  
  if (planet.pl_eqt != null) {
    lines.push(`Eq. Temp: ${planet.pl_eqt.toFixed(0)} K`);
  }
  
  if (planet.sy_dist != null) {
    lines.push(`Distance: ${planet.sy_dist.toFixed(1)} pc`);
  }

  // Candidacy status
  if (planet.pl_is_conservative_candidate) {
    lines.push(`<span style="color: #4ade80">★ Conservative candidate</span>`);
  } else if (planet.pl_is_optimistic_candidate) {
    lines.push(`<span style="color: #ec4899">★ Optimistic candidate</span>`);
  }
  
  return lines.join('<br>');
}

/**
 * Format system data for tooltip display
 */
export function formatSystemTooltip(system, sceneId = null) {
  const lines = [`<strong>${system.hostname || 'Unknown System'}</strong>`];
  
  if (system.sy_pnum != null) {
    lines.push(`Planets: ${system.sy_pnum}`);
  }
  
  if (system.sy_dist != null) {
    lines.push(`Distance: ${system.sy_dist.toFixed(1)} pc`);
  }
  
  if (system.st_spectype) {
    lines.push(`Spectral Type: ${system.st_spectype}`);
  }
  
  if (system.st_teff != null) {
    lines.push(`Temp: ${system.st_teff.toFixed(0)} K`);
  }
  
  if (system.st_mass != null) {
    lines.push(`Mass: ${system.st_mass.toFixed(2)} M☉`);
  }
  
  if (system.st_rad != null) {
    lines.push(`Radius: ${system.st_rad.toFixed(2)} R☉`);
  }
  
  // Only show candidate info on step 6 (S3_GALAXY_CANDIDATES), not on step 1
  if (system.hasCandidate && sceneId === 'S3_GALAXY_CANDIDATES') {
    const conserv = system.candidateCountConservative || 0;
    const optim = system.candidateCountOptimistic || 0;
    // Optimistic count includes conservative, so show only non-conservative optimistic
    const optimOnly = optim - conserv;
    if (conserv > 0) {
      lines.push(`<span style="color: #4ade80">★ ${conserv} conservative</span>`);
    }
    if (optimOnly > 0) {
      lines.push(`<span style="color: #22d3ee">★ ${optimOnly} optimistic only</span>`);
    }
  }
  
  return lines.join('<br>');
}
