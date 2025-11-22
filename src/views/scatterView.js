// src/views/scatterView.js
import * as d3 from "d3";

/**
 * Initialize scatterplot view on an <svg>.
 * @param {SVGSVGElement} svgEl
 */
export function initScatterView(svgEl) {
  if (!svgEl) {
    throw new Error("ScatterView: svg element is required");
  }

  const svg = d3.select(svgEl);
  const margin = { top: 30, right: 20, bottom: 50, left: 60 };

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
          .style("fill", "#4ade80")
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
        .style("fill", "#facc15")
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

  function update(data, view) {
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

    // Draw background elements
    drawBackground(view, xScale, yScale);

    // Update axes with better formatting
    const xAxis = d3.axisBottom(xScale)
      .ticks(8)
      .tickFormat(d => {
        if (d >= 1000) return d3.format(".2s")(d);
        if (d >= 10) return d3.format(".0f")(d);
        if (d >= 1) return d3.format(".1f")(d);
        return d3.format(".2f")(d);
      });
    
    const yAxis = d3.axisLeft(yScale)
      .ticks(8)
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
    circles
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d[xVar]))
      .attr("cy", d => yScale(d[yVar]))
      .attr("r", 0)
      .merge(circles)
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

    // Exit
    circles
      .exit()
      .transition()
      .duration(200)
      .attr("r", 0)
      .remove();
  }

  return {
    show() {
      svgEl.style.display = "block";
    },
    hide() {
      svgEl.style.display = "none";
    },
    update(data, view) {
      update(data || [], view || {});
    }
  };
}
