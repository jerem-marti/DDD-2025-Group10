// src/views/scatterView.js
import * as d3 from "d3";
import { formatPlanetTooltip } from "../ui/tooltip.js";

/**
 * Initialize scatterplot view on an <svg>.
 * @param {SVGSVGElement} svgEl
 * @param {Object} tooltip - Tooltip controller
 */
export function initScatterView(svgEl, tooltip = null) {
  if (!svgEl) {
    throw new Error("ScatterView: svg element is required");
  }

  const svg = d3.select(svgEl);
  const margin = { top: 30, right: 20, bottom: 50, left: 60 };
  
  // Zoom state
  let currentZoom = d3.zoomIdentity;
  let zoomBehavior = null;

  // Function to get current dimensions
  function getDimensions() {
    const rect = svgEl.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 400;
    return {
      width,
      height,
      innerWidth: width - margin.left - margin.right,
      innerHeight: height - margin.top - margin.bottom
    };
  }

  let { width, height, innerWidth, innerHeight } = getDimensions();

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Background layers (bands, zones, iso-lines)
  const bgG = g.append("g").attr("class", "background-layers");
  
  // Earth reference point layer (after background, before data points)
  const earthG = g.append("g").attr("class", "earth-reference");
  
  const xAxisG = g.append("g").attr("transform", `translate(0,${innerHeight})`);
  const yAxisG = g.append("g");
  const xLabelG = g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .style("fill", "#ccc")
    .style("font-size", "12px");
  const yLabelG = g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -45)
    .style("fill", "#ccc")
    .style("font-size", "12px");
  
  const pointsG = g.append("g").attr("class", "points");

  let xScale = d3.scaleLinear().range([0, innerWidth]);
  let yScale = d3.scaleLinear().range([innerHeight, 0]);
  
  // Original scales for reset
  let xScaleOriginal = xScale.copy();
  let yScaleOriginal = yScale.copy();
  
  // Get zoom controls
  const zoomControls = document.getElementById('zoom-controls');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomResetBtn = document.getElementById('zoom-reset');
  
  // Setup zoom behavior
  function setupZoom() {
    // Calculate zoom extent based on window size
    // Larger windows get more zoom range
    const baseZoom = 20;
    const sizeMultiplier = Math.max(1, Math.min(innerWidth, innerHeight) / 400);
    const maxZoom = baseZoom * sizeMultiplier;
    
    zoomBehavior = d3.zoom()
      .scaleExtent([1, maxZoom])
      .on("zoom", (event) => {
        currentZoom = event.transform;
        
        // Update scales with zoom transform
        const newXScale = currentZoom.rescaleX(xScaleOriginal);
        const newYScale = currentZoom.rescaleY(yScaleOriginal);
        
        // Update axes with proper formatting
        // Adaptive tick counts based on zoom level
        const zoomScale = currentZoom.k;
        
        // Start with more ticks when zoomed out, reduce as we zoom in
        let xTickCount = 3;
        let yTickCount = 4;
        
        if (zoomScale > 2) {
          xTickCount = 2;
          yTickCount = 3;
        }
        if (zoomScale > 5) {
          xTickCount = 2;
          yTickCount = 2;
        }
        
        const xAxis = d3.axisBottom(newXScale)
          .ticks(xTickCount)
          .tickFormat(d => {
            if (d >= 1000) return d3.format(".2s")(d);
            if (d >= 10) return d3.format(".0f")(d);
            if (d >= 1) return d3.format(".1f")(d);
            return d3.format(".2f")(d);
          });
        
        const yAxis = d3.axisLeft(newYScale)
          .ticks(yTickCount)
          .tickFormat(d => {
            if (d >= 1000) return d3.format(".2s")(d);
            if (d >= 10) return d3.format(".0f")(d);
            if (d >= 1) return d3.format(".1f")(d);
            return d3.format(".2f")(d);
          });
        
        xAxisG.call(xAxis);
        yAxisG.call(yAxis);
        
        // Update points positions only (not size)
        pointsG.selectAll("circle")
          .attr("cx", d => newXScale(d[currentView.xVar]))
          .attr("cy", d => newYScale(d[currentView.yVar]));
        
        // Update background layers
        updateBackgroundLayers(newXScale, newYScale);
        
        // Update Earth reference point
        drawEarthReference(currentView, newXScale, newYScale);
      });
    
    svg.call(zoomBehavior);
  }
  
  // Zoom control handlers
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      if (zoomBehavior) {
        svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.5);
      }
    });
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      if (zoomBehavior) {
        svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.67);
      }
    });
  }
  
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => {
      if (zoomBehavior) {
        svg.transition().duration(300).call(zoomBehavior.transform, d3.zoomIdentity);
      }
    });
  }
  
  let currentView = null;

  /**
   * Filter outliers using IQR method (configurable)
   */
  function filterOutliers(values, method = "percentile", factor = 1.5) {
    if (values.length === 0) return { min: 0, max: 1 };
    
    if (method === "iqr") {
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = d3.quantile(sorted, 0.25);
      const q3 = d3.quantile(sorted, 0.75);
      const iqr = q3 - q1;
      return {
        min: Math.max(d3.min(values), q1 - factor * iqr),
        max: Math.min(d3.max(values), q3 + factor * iqr)
      };
    } else if (method === "percentile") {
      // Use 1st and 99th percentile to clip extreme outliers
      const sorted = [...values].sort((a, b) => a - b);
      return {
        min: d3.quantile(sorted, 0.01),
        max: d3.quantile(sorted, 0.99)
      };
    }
    return { min: d3.min(values), max: d3.max(values) };
  }

  /**
   * Determine if log scale is appropriate
   */
  function shouldUseLogScale(values, threshold = 100) {
    const extent = d3.extent(values);
    return extent[1] / extent[0] > threshold && extent[0] > 0;
  }

  /**
   * Create appropriate scale based on data distribution
   */
  function createScale(values, range, config = {}) {
    const { forceLinear = false, forceLog = false, outlierMethod = "percentile" } = config;
    
    if (forceLog || (!forceLinear && shouldUseLogScale(values))) {
      // Log scale with outlier handling
      const bounds = filterOutliers(values, outlierMethod);
      return d3.scaleLog()
        .domain([Math.max(bounds.min, 0.01), bounds.max])
        .range(range)
        .nice()
        .clamp(true);
    } else {
      // Linear scale with outlier handling
      const bounds = filterOutliers(values, outlierMethod);
      return d3.scaleLinear()
        .domain([bounds.min, bounds.max])
        .range(range)
        .nice()
        .clamp(true);
    }
  }

  /**
   * Perceptually-scaled size encoding (sqrt of value for area)
   */
  function createSizeScale(data, sizeAccessor, minRadius = 2, maxRadius = 12) {
    const values = data.map(sizeAccessor).filter(v => v != null && v > 0);
    if (values.length === 0) return () => minRadius;
    
    const extent = d3.extent(values);
    // Use sqrt scale so that area (not radius) is proportional to value
    return d3.scaleSqrt()
      .domain(extent)
      .range([minRadius, maxRadius])
      .clamp(true);
  }

  /**
   * Draw Earth reference point with connecting lines to axes
   */
  function drawEarthReference(view, xScale, yScale) {
    earthG.selectAll("*").remove();
    
    // Define Earth's values for different plot types
    const earthValues = {
      pl_rade: 1.0,        // Earth radius = 1 R⊕
      pl_bmasse: 1.0,      // Earth mass = 1 M⊕
      pl_g_rel: 1.0,       // Earth gravity = 1 g
      pl_insol_merged: 1.0 // Earth insolation = 1 S⊕
    };
    
    const { xVar, yVar } = view;
    
    // Check if Earth should be shown (only if both axes have Earth values defined)
    if (!earthValues[xVar] || !earthValues[yVar]) return;
    
    const earthX = earthValues[xVar];
    const earthY = earthValues[yVar];
    
    // Check if Earth is within the domain
    const xDomain = xScale.domain();
    const yDomain = yScale.domain();
    
    if (earthX < xDomain[0] || earthX > xDomain[1] || 
        earthY < yDomain[0] || earthY > yDomain[1]) {
      return; // Earth is outside the visible range
    }
    
    const earthPx = xScale(earthX);
    const earthPy = yScale(earthY);
    
    // Draw connecting lines to axes (dashed, subtle)
    earthG.append("line")
      .attr("class", "earth-line-x")
      .attr("x1", earthPx)
      .attr("y1", earthPy)
      .attr("x2", earthPx)
      .attr("y2", innerHeight)
      .style("stroke", "#a855f7")
      .style("stroke-width", 1.5)
      .style("stroke-dasharray", "4,4")
      .style("opacity", 0.4);
    
    earthG.append("line")
      .attr("class", "earth-line-y")
      .attr("x1", earthPx)
      .attr("y1", earthPy)
      .attr("x2", 0)
      .attr("y2", earthPy)
      .style("stroke", "#a855f7")
      .style("stroke-width", 1.5)
      .style("stroke-dasharray", "4,4")
      .style("opacity", 0.4);
    
    // Draw Earth marker (special symbol)
    const earthGroup = earthG.append("g")
      .attr("class", "earth-marker")
      .attr("transform", `translate(${earthPx},${earthPy})`);
    
    // Outer glow circle
    earthGroup.append("circle")
      .attr("r", 10)
      .style("fill", "#a855f7")
      .style("opacity", 0.2);
    
    // Inner filled circle
    earthGroup.append("circle")
      .attr("r", 6)
      .style("fill", "#a855f7")
      .style("stroke", "#581c87")
      .style("stroke-width", 2)
      .style("opacity", 0.9);
    
    // Earth symbol "⊕" or "🜨"
    earthGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .style("fill", "#fff")
      .style("pointer-events", "none")
      .text("⊕");
    
    // Label
    earthGroup.append("text")
      .attr("class", "earth-label")
      .attr("x", 0)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .style("fill", "#a855f7")
      .style("stroke", "#0c1521")
      .style("stroke-width", 3)
      .style("paint-order", "stroke")
      .style("pointer-events", "none")
      .text("Earth");
    
    // Raise Earth marker above all data points
    earthG.raise();
  }

  /**
   * Draw background elements (bands, zones, reference lines)
   */
  function drawBackground(view, xScale, yScale) {
    bgG.selectAll("*").remove();
    
    const { encodings } = view;
    if (!encodings) return;

    // Rocky window (vertical band for radius)
    if (encodings.rockyWindow) {
      const { minR, maxR } = encodings.rockyWindow;
      bgG.append("rect")
        .attr("class", "bg-rocky-window")
        .attr("x", xScale(minR))
        .attr("y", 0)
        .attr("width", xScale(maxR) - xScale(minR))
        .attr("height", innerHeight)
        .style("fill", "#22d3ee")
        .style("opacity", 0.08);
    }

    // Habitable zone bands (vertical, for insolation)
    if (encodings.hzBands) {
      const { optimistic, conservative } = encodings.hzBands;
      
      // Optimistic HZ
      if (optimistic) {
        bgG.append("rect")
          .attr("class", "bg-hz-optimistic")
          .attr("x", xScale(optimistic.min))
          .attr("y", 0)
          .attr("width", xScale(optimistic.max) - xScale(optimistic.min))
          .attr("height", innerHeight)
          .style("fill", "#ec4899")
          .style("opacity", 0.06);
      }
      
      // Conservative HZ (darker)
      if (conservative) {
        bgG.append("rect")
          .attr("class", "bg-hz-conservative")
          .attr("x", xScale(conservative.min))
          .attr("y", 0)
          .attr("width", xScale(conservative.max) - xScale(conservative.min))
          .attr("height", innerHeight)
          .style("fill", "#4ade80")
          .style("opacity", 0.1);
      }
    }

    // Gravity band (horizontal)
    if (encodings.gravityBand) {
      const { min, max } = encodings.gravityBand;
      bgG.append("rect")
        .attr("class", "bg-gravity-band")
        .attr("x", 0)
        .attr("y", yScale(max))
        .attr("width", innerWidth)
        .attr("height", yScale(min) - yScale(max))
        .style("fill", "#fb923c")
        .style("opacity", 0.15);
    }

    // Gravity zone (curved band for mass-radius plot)
    if (encodings.gravityZone && view.xVar === "pl_rade" && view.yVar === "pl_bmasse") {
      const { gMin, gMax } = encodings.gravityZone;
      
      // Create path data for the zone between two gravity curves
      const radii = d3.range(0.1, 10, 0.05).filter(r => {
        const massMin = gMin * r * r;
        const massMax = gMax * r * r;
        return massMax >= yScale.domain()[0] && massMin <= yScale.domain()[1] &&
               r >= xScale.domain()[0] && r <= xScale.domain()[1];
      });
      
      if (radii.length > 0) {
        // Create the area between the two curves
        const area = d3.area()
          .x(d => xScale(d))
          .y0(d => yScale(gMin * d * d))  // Lower bound (0.5g)
          .y1(d => yScale(gMax * d * d)); // Upper bound (1.5g)
        
        bgG.append("path")
          .attr("class", "bg-gravity-zone")
          .attr("d", area(radii))
          .style("fill", "#fb923c")  // Orange
          .style("opacity", 0.12);
      }
    }
  }

  function updateBackgroundLayers(xScl, yScl) {
    if (!currentView) return;
    const { encodings = {} } = currentView;
    
    bgG.selectAll("*").remove();
    
    // Get current domain to check if zones are visible
    const xDomain = xScl.domain();
    const yDomain = yScl.domain();
    
    // Rocky window
    if (encodings.rockyWindow) {
      const { minR, maxR } = encodings.rockyWindow;
      bgG.append("rect")
        .attr("class", "bg-rocky-window")
        .attr("x", xScl(minR))
        .attr("y", 0)
        .attr("width", xScl(maxR) - xScl(minR))
        .attr("height", innerHeight)
        .style("fill", "#22d3ee")
        .style("opacity", 0.08);
    }
    
    // Habitable zone bands
    if (encodings.hzBands) {
      const { optimistic, conservative } = encodings.hzBands;
      if (optimistic) {
        bgG.append("rect")
          .attr("x", xScl(optimistic.min))
          .attr("y", 0)
          .attr("width", xScl(optimistic.max) - xScl(optimistic.min))
          .attr("height", innerHeight)
          .style("fill", "#ec4899")
          .style("opacity", 0.06);
      }
      if (conservative) {
        bgG.append("rect")
          .attr("x", xScl(conservative.min))
          .attr("y", 0)
          .attr("width", xScl(conservative.max) - xScl(conservative.min))
          .attr("height", innerHeight)
          .style("fill", "#4ade80")
          .style("opacity", 0.1);
      }
    }
    
    // Gravity band (horizontal)
    if (encodings.gravityBand) {
      const { min, max } = encodings.gravityBand;
      // Y scale is inverted (higher values at bottom), so yScl(max) gives top position
      const yTop = yScl(max);  // Top of band (max gravity value)
      const yBottom = yScl(min);  // Bottom of band (min gravity value)
      
      // Clamp to visible area
      const clampedTop = Math.max(0, Math.min(innerHeight, yTop));
      const clampedBottom = Math.max(0, Math.min(innerHeight, yBottom));
      const height = clampedBottom - clampedTop;
      
      if (height > 0) {
        bgG.append("rect")
          .attr("class", "bg-gravity-band")
          .attr("x", 0)
          .attr("y", clampedTop)
          .attr("width", innerWidth)
          .attr("height", height)
          .style("fill", "#fb923c")
          .style("opacity", 0.15);
      }
    }
    
    // Gravity zone (curved band for mass-radius plot)
    if (encodings.gravityZone && currentView.xVar === "pl_rade" && currentView.yVar === "pl_bmasse") {
      const { gMin, gMax } = encodings.gravityZone;
      const radii = d3.range(0.1, 10, 0.05).filter(r => {
        const massMin = gMin * r * r;
        const massMax = gMax * r * r;
        return massMax >= yScl.domain()[0] && massMin <= yScl.domain()[1] &&
               r >= xScl.domain()[0] && r <= xScl.domain()[1];
      });
      
      if (radii.length > 0) {
        const area = d3.area()
          .x(d => xScl(d))
          .y0(d => yScl(gMin * d * d))
          .y1(d => yScl(gMax * d * d));
        
        bgG.append("path")
          .attr("d", area(radii))
          .style("fill", "#fb923c")
          .style("opacity", 0.12);
      }
    }
  }

  function update(data, view) {
    currentView = view;
    
    // Always reset zoom when updating (including when going back to previous steps)
    if (zoomBehavior) {
      svg.call(zoomBehavior.transform, d3.zoomIdentity);
      currentZoom = d3.zoomIdentity;
    }
    
    // Recalculate dimensions in case window was resized
    const dims = getDimensions();
    width = dims.width;
    height = dims.height;
    innerWidth = dims.innerWidth;
    innerHeight = dims.innerHeight;

    // Update group transform and axis positions
    g.attr("transform", `translate(${margin.left},${margin.top})`);
    xAxisG.attr("transform", `translate(0,${innerHeight})`);
    xLabelG.attr("x", innerWidth / 2).attr("y", innerHeight + 40);
    yLabelG.attr("x", -innerHeight / 2);
    
    // Update zoom extent based on new dimensions
    if (zoomBehavior) {
      const baseZoom = 20;
      const sizeMultiplier = Math.max(1, Math.min(innerWidth, innerHeight) / 400);
      const maxZoom = baseZoom * sizeMultiplier;
      zoomBehavior.scaleExtent([1, maxZoom]);
    }

    const { xVar, yVar, xLabel, yLabel, encodings, scaleConfig = {} } = view;
    const { color, opacity, size } = encodings || {};

    // Filter valid data points
    const validData = data.filter(d => d[xVar] != null && d[yVar] != null);
    
    if (validData.length === 0) {
      pointsG.selectAll("circle").remove();
      bgG.selectAll("*").remove();
      xAxisG.selectAll("*").remove();
      yAxisG.selectAll("*").remove();
      return;
    }

    // Extract values for scaling
    const xVals = validData.map(d => d[xVar]);
    const yVals = validData.map(d => d[yVar]);

    // Create scales with outlier handling
    xScale = createScale(xVals, [0, innerWidth], scaleConfig.x || {});
    yScale = createScale(yVals, [innerHeight, 0], scaleConfig.y || {});
    
    // Store original scales for zoom reset
    xScaleOriginal = xScale.copy();
    yScaleOriginal = yScale.copy();
    
    // Setup zoom if not already done
    if (!zoomBehavior) {
      setupZoom();
    }

    // Draw background elements
    drawBackground(view, xScale, yScale);

    // Update axes with better formatting and reduced tick count to prevent overlap
    const xAxis = d3.axisBottom(xScale)
      .ticks(3)  // Reduced to 3 for X-axis to prevent horizontal overlap
      .tickFormat(d => {
        if (d >= 1000) return d3.format(".2s")(d);
        if (d >= 10) return d3.format(".0f")(d);
        if (d >= 1) return d3.format(".1f")(d);
        return d3.format(".2f")(d);
      });
    
    const yAxis = d3.axisLeft(yScale)
      .ticks(4)  // Keep 4 for Y-axis (vertical has more space)
      .tickFormat(d => {
        if (d >= 1000) return d3.format(".2s")(d);
        if (d >= 10) return d3.format(".0f")(d);
        if (d >= 1) return d3.format(".1f")(d);
        return d3.format(".2f")(d);
      });

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);

    // Update axis labels
    xLabelG.text(xLabel || xVar);
    yLabelG.text(yLabel || yVar);

    // Size scale (perceptual)
    const sizeScale = typeof size === "function" 
      ? createSizeScale(validData, size, 2, 12)
      : null;

    // Bind data
    const circles = pointsG.selectAll("circle").data(validData, d => d.pl_name || d.hostname || d.id);

    // Enter + update
    const allCircles = circles
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d[xVar]))
      .attr("cy", d => yScale(d[yVar]))
      .attr("r", 0)
      .merge(circles);

    allCircles
      .transition()
      .duration(300)
      .attr("cx", d => xScale(d[xVar]))
      .attr("cy", d => yScale(d[yVar]))
      .attr("r", d => {
        if (typeof size === "function" && sizeScale) {
          return sizeScale(size(d));
        }
        return typeof size === "function" ? size(d) : 3;
      })
      .style("fill", d => typeof color === "function" ? color(d) : "#888")
      .style("opacity", d => typeof opacity === "function" ? opacity(d) : 0.7)
      .style("stroke", d => {
        // Add subtle stroke for better visibility
        if (typeof opacity === "function" && opacity(d) > 0.6) {
          return "rgba(255,255,255,0.2)";
        }
        return "none";
      })
      .style("stroke-width", 0.5);

    // Add tooltip interactions only for highlighted circles
    if (tooltip) {
      allCircles
        .on("mouseenter", function(event, d) {
          // Check if this circle is highlighted (opacity >= 0.6)
          const isHighlighted = typeof opacity === "function" ? opacity(d) >= 0.6 : true;
          
          if (!isHighlighted) {
            return; // No interaction for dimmed circles
          }
          
          // Highlight circle with very visible stroke and shadow
          d3.select(this)
            .style("cursor", "pointer")
            .transition()
            .duration(200)
            .style("stroke", "#22d3ee")
            .style("stroke-width", 4)
            .style("filter", "drop-shadow(0 0 8px #22d3ee)");
          
          d3.select(this).raise();

          // Show tooltip
          const content = formatPlanetTooltip(d);
          tooltip.show(content, event.clientX, event.clientY);
        })
        .on("mousemove", function(event, d) {
          // Only update tooltip if this is a highlighted circle
          const isHighlighted = typeof opacity === "function" ? opacity(d) >= 0.6 : true;
          if (isHighlighted) {
            tooltip.show(formatPlanetTooltip(d), event.clientX, event.clientY);
          }
        })
        .on("mouseleave", function(event, d) {
          // Restore original stroke
          const originalOpacity = typeof opacity === "function" ? opacity(d) : 0.7;
          
          d3.select(this)
            .style("cursor", "default")
            .transition()
            .duration(200)
            .style("stroke", originalOpacity > 0.6 ? "rgba(255,255,255,0.2)" : "none")
            .style("stroke-width", 0.5)
            .style("filter", "none");

          // Hide tooltip
          tooltip.hide();
        });
    }

    // Exit
    circles
      .exit()
      .transition()
      .duration(200)
      .attr("r", 0)
      .remove();
    
    // Draw Earth reference point after data points to ensure it's on top
    drawEarthReference(view, xScale, yScale);
  }

  return {
    show() {
      svgEl.style.display = "block";
      if (zoomControls) {
        zoomControls.style.display = "flex";
      }
    },
    hide() {
      svgEl.style.display = "none";
      if (zoomControls) {
        zoomControls.style.display = "none";
      }
    },
    update(data, view) {
      update(data || [], view || {});
    }
  };
}
