// src/views/galaxyView.js

import { formatSystemTooltip, formatPlanetTooltip } from '../ui/tooltip.js';

export function initGalaxyView(canvas, tooltip = null) {
  if (!canvas) {
    throw new Error("GalaxyView: canvas element is required");
  }

  const ctx = canvas.getContext("2d");
  let resizeTimeout;
  let lastData = [];
  let lastView = null;
  let animationFrameId = null;
  let hoveredSystem = null;
  let hoveredPlanet = null;
  let lastPlanetPositions = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 400;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    // Redraw with current data after resize
    if (lastData && lastData.length > 0 && lastView) {
      draw(lastData, lastView);
    }
  }

  resize();
  
  // Debounced resize handler to avoid too many redraws
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  });

  // Mouse tracking for tooltips
  if (tooltip) {
    canvas.addEventListener("mousemove", (event) => {
      if (!lastData || !lastView || lastData.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // First check if hovering over a planet (Step 6 only)
      let nearestPlanet = null;
      let minPlanetDist = 10; // smaller threshold for planets

      if (lastView.sceneId === "S3_GALAXY_CANDIDATES") {
        lastPlanetPositions.forEach((planetPos) => {
          const dist = Math.sqrt((planetPos.x - mouseX) ** 2 + (planetPos.y - mouseY) ** 2);
          if (dist < minPlanetDist) {
            minPlanetDist = dist;
            nearestPlanet = planetPos;
          }
        });
      }

      // If hovering planet, show planet tooltip
      if (nearestPlanet) {
        if (hoveredPlanet !== nearestPlanet.planet) {
          hoveredPlanet = nearestPlanet.planet;
          hoveredSystem = null;
          const content = formatPlanetTooltip(nearestPlanet.planet);
          tooltip.show(content, event.clientX, event.clientY);
          canvas.style.cursor = "pointer";
        } else {
          tooltip.show(formatPlanetTooltip(nearestPlanet.planet), event.clientX, event.clientY);
        }
        return;
      }

      // Reset planet hover if not over planet
      if (hoveredPlanet !== null) {
        hoveredPlanet = null;
        // If we were showing a planet tooltip, hide it
        if (!hoveredSystem) {
          tooltip.hide();
          canvas.style.cursor = "default";
        }
      }

      // Then check for systems
      const threshold = 15; // pixels
      let nearest = null;
      let minDist = threshold;

      const { x, y, encodings = {} } = lastView;
      const width = rect.width || 600;
      const height = rect.height || 400;
      const cx = width / 2;
      const cy = height / 2;
      const scaleFactor = calculateScaleFactor(lastData, x, y, width, height);

      lastData.forEach((d) => {
        const px = x(d);
        const py = y(d);
        const screenX = cx + px * scaleFactor;
        const screenY = cy + py * scaleFactor;

        const dist = Math.sqrt((screenX - mouseX) ** 2 + (screenY - mouseY) ** 2);
        if (dist < minDist) {
          minDist = dist;
          nearest = d;
        }
      });

      // In S3_GALAXY_CANDIDATES, only allow hover for systems with candidates
      const canHover = !nearest ? false : 
        (lastView.sceneId === "S3_GALAXY_CANDIDATES" ? nearest.hasCandidate : true);

      if ((canHover ? nearest : null) !== hoveredSystem) {
        hoveredSystem = canHover ? nearest : null;
        if (hoveredSystem) {
          const content = formatSystemTooltip(hoveredSystem);
          tooltip.show(content, event.clientX, event.clientY);
          canvas.style.cursor = "pointer";
        } else {
          tooltip.hide();
          canvas.style.cursor = "default";
        }
      } else if (hoveredSystem) {
        // Update tooltip position
        tooltip.show(formatSystemTooltip(hoveredSystem), event.clientX, event.clientY);
      }
    });

    canvas.addEventListener("mouseleave", () => {
      hoveredSystem = null;
      hoveredPlanet = null;
      tooltip.hide();
      canvas.style.cursor = "default";
    });
  }

  /**
   * Calculate optimal scale factor based on data distribution
   */
  function calculateScaleFactor(data, x, y, width, height) {
    if (data.length === 0) return 60;
    
    const positions = data.map(d => ({ x: x(d), y: y(d) }));
    const xExtent = [
      Math.min(...positions.map(p => p.x)),
      Math.max(...positions.map(p => p.x))
    ];
    const yExtent = [
      Math.min(...positions.map(p => p.y)),
      Math.max(...positions.map(p => p.y))
    ];
    
    const xRange = xExtent[1] - xExtent[0] || 1;
    const yRange = yExtent[1] - yExtent[0] || 1;
    
    // Zoom in more - use full canvas width/height, systems fill entire view
    // This makes the inner half contain the closer systems
    const xScale = (width * 0.9) / xRange;
    const yScale = (height * 0.9) / yRange;
    
    return Math.min(xScale, yScale, 200); // Increased cap to allow more zoom
  }

  /**
   * Draw circular axes with distance rings and angle markers
   */
  function drawCircularAxes(cx, cy, width, height, scaleFactor, data) {
    if (data.length === 0) return;

    // Get max distance from data for scale
    const positions = data.map(d => {
      const px = lastView?.x ? lastView.x(d) : 0;
      const py = lastView?.y ? lastView.y(d) : 0;
      return Math.sqrt(px * px + py * py);
    });
    const maxDist = Math.max(...positions);
    
    // Draw concentric circles (distance rings)
    const numRings = 4;
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= numRings; i++) {
      const radius = (Math.min(width, height) * 0.4 * i) / numRings;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Add distance labels
      const distValue = (maxDist * i) / numRings;
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#9ca3af";
      ctx.font = "10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(distValue * 10) / 10}`, cx, cy - radius - 5);
    }
    
    // Draw radial lines (angle markers every 45°)
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;
    
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = (angle * Math.PI) / 180;
      const maxRadius = Math.min(width, height) * 0.4;
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(rad) * maxRadius,
        cy + Math.sin(rad) * maxRadius
      );
      ctx.stroke();
      
      // Add angle labels
      if (angle % 90 === 0) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#9ca3af";
        ctx.font = "11px system-ui";
        ctx.textAlign = "center";
        const labelRadius = maxRadius + 20;
        const labelText = angle === 0 ? "0°" : angle === 90 ? "90°" : angle === 180 ? "180°" : "270°";
        ctx.fillText(
          labelText,
          cx + Math.cos(rad) * labelRadius,
          cy + Math.sin(rad) * labelRadius + 4
        );
      }
    }
    
    // Add center label
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Center", cx, cy - 5);
    ctx.font = "10px system-ui";
    ctx.fillText("(Solar System)", cx, cy + 8);
    
    // Add axis labels in corners
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui";
    
    // Bottom right - distance scale label
    ctx.textAlign = "right";
    ctx.fillText("Distance: log₁₀(parsecs)", width - 10, height - 10);
    
    // Top left - angle label
    ctx.textAlign = "left";
    ctx.fillText("Angle: Galactic longitude (°)", 10, 20);
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }

  /**
   * Draw orbital rings and candidate planets around a star
   * Returns array of planet positions for hover detection
   */
  function drawOrbitsAndPlanets(starX, starY, system, starRadius, starColor) {
    const planets = system.candidatePlanets || [];
    if (planets.length === 0) return [];

    const planetPositions = [];

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = starColor;
    ctx.lineWidth = 0.5;

    planets.forEach((planet, idx) => {
      // Calculate orbital radius based on semi-major axis
      // Scale it relative to star size for visibility
      const orbitRadius = starRadius * 3 + (planet.pl_orbsmax || (idx + 1)) * 8;
      
      // Draw orbital ring
      ctx.beginPath();
      ctx.arc(starX, starY, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw planet at a position on the orbit (staggered by index)
      const angle = (idx * (2 * Math.PI / planets.length)) + (Date.now() * 0.0001); // Slow rotation
      const planetX = starX + Math.cos(angle) * orbitRadius;
      const planetY = starY + Math.sin(angle) * orbitRadius;

      // Determine planet color based on habitability
      let planetColor = "#888888"; // default grey
      if (planet.pl_is_conservative_candidate) {
        planetColor = "#4ade80"; // green for conservative candidate
      } else if (planet.pl_is_optimistic_candidate) {
        planetColor = "#22d3ee"; // cyan for optimistic candidate
      }

      // Draw planet
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = planetColor;
      ctx.beginPath();
      const planetSize = Math.max(2, (planet.pl_rade || 1) * 1.5);
      ctx.arc(planetX, planetY, planetSize, 0, Math.PI * 2);
      ctx.fill();

      // Add subtle glow to candidate planets
      if (planet.pl_is_conservative_candidate || planet.pl_is_optimistic_candidate) {
        ctx.globalAlpha = 0.3;
        const gradient = ctx.createRadialGradient(planetX, planetY, 0, planetX, planetY, planetSize * 2);
        gradient.addColorStop(0, planetColor);
        gradient.addColorStop(1, planetColor + "00");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(planetX, planetY, planetSize * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Store planet position for hover detection
      planetPositions.push({
        x: planetX,
        y: planetY,
        radius: planetSize,
        planet: planet,
        system: system
      });
    });

    ctx.globalAlpha = 1;
    return planetPositions;
  }

  /**
   * Draw with glow effect for highlighted points
   */
  function drawPoint(cx, cy, x, y, radius, color, alpha, glow = false) {
    ctx.globalAlpha = alpha;
    
    if (glow && alpha > 0.5) {
      // Add glow for important points
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.4, color + "88");
      gradient.addColorStop(1, color + "00");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw main point
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle stroke for better definition
    if (alpha > 0.6) {
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  function draw(data, view, forceRecalculate = false) {
    lastData = data;
    lastView = view;

    const { x, y, encodings = {}, sceneId } = view;

    // Defensive: if we have no x/y, don't try to draw
    if (typeof x !== "function" || typeof y !== "function") {
      console.warn("GalaxyView.draw: missing x/y mapping, skipping draw");
      return;
    }

    // Stop any previous animation
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    const {
      baseColor = "#dddddd",
      baseOpacity = () => 0.5,
      baseSize = () => 2,
      color,
      opacity,
      size
    } = encodings;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 400;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Calculate adaptive scale factor
    const scaleFactor = calculateScaleFactor(data, x, y, width, height);

    // Draw circular axes/guides
    drawCircularAxes(cx, cy, width, height, scaleFactor, data);

    // Sort data to draw dimmer points first, brighter points last
    const sortedData = [...data].sort((a, b) => {
      const opA = typeof opacity === "function" ? opacity(a) : 
                  typeof baseOpacity === "function" ? baseOpacity(a) : baseOpacity;
      const opB = typeof opacity === "function" ? opacity(b) :
                  typeof baseOpacity === "function" ? baseOpacity(b) : baseOpacity;
      return opA - opB;
    });

    sortedData.forEach((d) => {
      const px = x(d);
      const py = y(d);

      const r =
        typeof size === "function"
          ? size(d)
          : typeof baseSize === "function"
          ? baseSize(d)
          : baseSize;

      const col =
        typeof color === "function" ? color(d) : baseColor;

      const alpha =
        typeof opacity === "function"
          ? opacity(d)
          : typeof baseOpacity === "function"
          ? baseOpacity(d)
          : baseOpacity;

      const screenX = cx + px * scaleFactor;
      const screenY = cy + py * scaleFactor;

      // Draw candidate planets orbiting around stars (only in Scene 3)
      if (sceneId === "S3_GALAXY_CANDIDATES" && d.hasCandidate && d.candidatePlanets && alpha > 0.7) {
        const positions = drawOrbitsAndPlanets(screenX, screenY, d, r, col);
        lastPlanetPositions.push(...positions);
      }

      // Apply glow to highlighted/important points or hovered system
      const isHovered = hoveredSystem === d;
      const shouldGlow = alpha > 0.7 || isHovered;
      
      // Enhanced glow for hovered system - very visible
      if (isHovered) {
        // Draw multiple layers for intense glow
        ctx.globalAlpha = 0.6;
        const hoverGradient1 = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, r * 8);
        hoverGradient1.addColorStop(0, "#22d3ee");
        hoverGradient1.addColorStop(0.2, "#22d3eecc");
        hoverGradient1.addColorStop(0.5, "#22d3ee66");
        hoverGradient1.addColorStop(1, "#22d3ee00");
        ctx.fillStyle = hoverGradient1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, r * 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Add bright ring around the point
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, r * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
      }
      
      drawPoint(cx, cy, screenX, screenY, r, col, alpha, shouldGlow);
    });

    // Start animation loop if we're showing candidate planets
    if (sceneId === "S3_GALAXY_CANDIDATES") {
      animateOrbits();
    }
  }

  /**
   * Animation loop for continuous planet rotation
   */
  function animateOrbits() {
    if (!lastData || !lastView) return;
    
    // Redraw the scene
    const { x, y, encodings = {}, sceneId } = lastView;
    if (typeof x !== "function" || typeof y !== "function") return;

    const {
      baseColor = "#dddddd",
      baseOpacity = () => 0.5,
      baseSize = () => 2,
      color,
      opacity,
      size
    } = encodings;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 400;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Clear planet positions for this frame
    lastPlanetPositions = [];

    const scaleFactor = calculateScaleFactor(lastData, x, y, width, height);
    drawCircularAxes(cx, cy, width, height, scaleFactor, lastData);

    const sortedData = [...lastData].sort((a, b) => {
      const opA = typeof opacity === "function" ? opacity(a) : 
                  typeof baseOpacity === "function" ? baseOpacity(a) : baseOpacity;
      const opB = typeof opacity === "function" ? opacity(b) :
                  typeof baseOpacity === "function" ? baseOpacity(b) : baseOpacity;
      return opA - opB;
    });

    sortedData.forEach((d) => {
      const px = x(d);
      const py = y(d);

      const r =
        typeof size === "function"
          ? size(d)
          : typeof baseSize === "function"
          ? baseSize(d)
          : baseSize;

      const col =
        typeof color === "function" ? color(d) : baseColor;

      const alpha =
        typeof opacity === "function"
          ? opacity(d)
          : typeof baseOpacity === "function"
          ? baseOpacity(d)
          : baseOpacity;

      const screenX = cx + px * scaleFactor;
      const screenY = cy + py * scaleFactor;

      if (sceneId === "S3_GALAXY_CANDIDATES" && d.hasCandidate && d.candidatePlanets && alpha > 0.7) {
        const positions = drawOrbitsAndPlanets(screenX, screenY, d, r, col);
        lastPlanetPositions.push(...positions);
      }

      const shouldGlow = alpha > 0.7;
      drawPoint(cx, cy, screenX, screenY, r, col, alpha, shouldGlow);
    });

    ctx.globalAlpha = 1;

    // Continue animation loop
    animationFrameId = requestAnimationFrame(animateOrbits);
  }

  return {
    show() {
      canvas.style.display = "block";
    },
    hide() {
      canvas.style.display = "none";
    },
    update(data, view) {
      // Ensure canvas is properly sized before drawing
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 600;
      const height = rect.height || 400;
      
      // Only resize canvas if dimensions changed
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      
      draw(data || [], view || {});
    },
    transitionToGrid(data, view) {
      // For now, reuse the last galaxy layout (S3) if view has no x/y
      const effectiveView =
        (view && typeof view.x === "function" && typeof view.y === "function")
          ? view
          : lastView;

      if (!effectiveView) {
        console.warn("GalaxyView.transitionToGrid: no previous view; skipping draw");
        return;
      }

      draw(data || lastData || [], effectiveView);
      // Later you can start from effectiveView, then animate to grid positions
    }
  };
}
