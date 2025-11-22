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

  const width = parseInt(svgEl.getAttribute("width") || "600", 10);
  const height = parseInt(svgEl.getAttribute("height") || "400", 10);
  const margin = { top: 30, right: 20, bottom: 50, left: 60 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Background layers (bands, windows, etc.)
  const bgG = g.append("g").attr("class", "background-layers");
  const xAxisG = g.append("g").attr("transform", `translate(0,${innerHeight})`);
  const yAxisG = g.append("g");
  const pointsG = g.append("g").attr("class", "points");

  const xScale = d3.scaleLinear().range([0, innerWidth]);
  const yScale = d3.scaleLinear().range([innerHeight, 0]);

  function update(data, view) {
    const { xVar, yVar, encodings = {} } = view;
    const {
      color,
      opacity,
      size,
      rockyWindow,
      hzBands,
      gravityBand,
      gravityBands
    } = encodings;

    const xVals = data.map((d) => d[xVar]).filter((v) => v != null);
    const yVals = data.map((d) => d[yVar]).filter((v) => v != null);

    if (!xVals.length || !yVals.length) {
      // nothing to draw
      pointsG.selectAll("circle").remove();
      xAxisG.selectAll("*").remove();
      yAxisG.selectAll("*").remove();
      bgG.selectAll("*").remove();
      return;
    }

    xScale.domain(d3.extent(xVals)).nice();
    yScale.domain(d3.extent(yVals)).nice();

    xAxisG.call(d3.axisBottom(xScale));
    yAxisG.call(d3.axisLeft(yScale));

    // ─────────────────────────────────────
    // BACKGROUND LAYERS
    // ─────────────────────────────────────
    bgG.selectAll("*").remove();

    // 1) Rocky window (S2.1): vertical band on radius axis
    if (rockyWindow && typeof rockyWindow.minR === "number" && typeof rockyWindow.maxR === "number") {
      const x1 = xScale(rockyWindow.minR);
      const x2 = xScale(rockyWindow.maxR);
      bgG
        .append("rect")
        .attr("class", "bg-rocky-window")
        .attr("x", Math.min(x1, x2))
        .attr("y", 0)
        .attr("width", Math.abs(x2 - x1))
        .attr("height", innerHeight)
        .attr("fill", "rgba(41,201,201,0.08)");
    }

    // 2) HZ bands (S2.3): vertical bands on insolation axis
    if (hzBands && xVar === "pl_insol_merged") {
      const { optimistic, conservative } = hzBands;

      if (optimistic && typeof optimistic.min === "number" && typeof optimistic.max === "number") {
        const xo1 = xScale(optimistic.min);
        const xo2 = xScale(optimistic.max);
        bgG
          .append("rect")
          .attr("class", "bg-hz-optimistic")
          .attr("x", Math.min(xo1, xo2))
          .attr("y", 0)
          .attr("width", Math.abs(xo2 - xo1))
          .attr("height", innerHeight)
          .attr("fill", "rgba(76, 175, 80, 0.05)"); // very light green
      }

      if (conservative && typeof conservative.min === "number" && typeof conservative.max === "number") {
        const xc1 = xScale(conservative.min);
        const xc2 = xScale(conservative.max);
        bgG
          .append("rect")
          .attr("class", "bg-hz-conservative")
          .attr("x", Math.min(xc1, xc2))
          .attr("y", 0)
          .attr("width", Math.abs(xc2 - xc1))
          .attr("height", innerHeight)
          .attr("fill", "rgba(76, 175, 80, 0.12)"); // slightly stronger green
      }
    }

    // 3) Gravity band (S2.3): horizontal band on gravity axis
    if (gravityBand && yVar === "pl_g_rel") {
      const { min, max } = gravityBand;
      if (typeof min === "number" && typeof max === "number") {
        const yTop = yScale(max); // note: higher value -> lower y
        const yBottom = yScale(min);
        bgG
          .append("rect")
          .attr("class", "bg-gravity-band")
          .attr("x", 0)
          .attr("y", Math.min(yTop, yBottom))
          .attr("width", innerWidth)
          .attr("height", Math.abs(yBottom - yTop))
          .attr("fill", "rgba(158, 158, 158, 0.12)"); // light grey band
      }
    }

    // 4) Gravity iso-lines (S2.2): lines of constant g on radius–mass plane
    //    eq: mass = g * radius^2
    if (gravityBands && xVar === "pl_rade" && yVar === "pl_bmasse") {
      const gValues = [];
      if (typeof gravityBands.low === "number") gValues.push(gravityBands.low);
      // add mid line at 1 g if it lies between low & high
      if (!gValues.includes(1)) gValues.push(1);
      if (typeof gravityBands.high === "number") gValues.push(gravityBands.high);

      const [rMin, rMax] = xScale.domain();

      gValues.forEach((gVal) => {
        const lineData = [
          { r: rMin, m: gVal * rMin * rMin },
          { r: rMax, m: gVal * rMax * rMax }
        ];

        bgG
          .append("path")
          .datum(lineData)
          .attr("class", "bg-gravity-iso")
          .attr("fill", "none")
          .attr("stroke", "rgba(120, 120, 120, 0.5)")
          .attr("stroke-dasharray", gVal === 1 ? "4,2" : "2,3") // 1 g more visible
          .attr("stroke-width", gVal === 1 ? 1.2 : 0.8)
          .attr("d", d3.line()
            .x((d) => xScale(d.r))
            .y((d) => yScale(d.m))
          );
      });
    }

    // ─────────────────────────────────────
    // POINTS
    // ─────────────────────────────────────
    const circles = pointsG.selectAll("circle").data(data, (d) => d.pl_name || d.id);

    circles
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[xVar]))
      .attr("cy", (d) => yScale(d[yVar]))
      .attr("r", 0)
      .merge(circles)
      .transition()
      .duration(300)
      .attr("cx", (d) => xScale(d[xVar]))
      .attr("cy", (d) => yScale(d[yVar]))
      .attr("r", (d) => (typeof size === "function" ? size(d) : 3))
      .style("fill", (d) => (typeof color === "function" ? color(d) : "#888"))
      .style("opacity", (d) =>
        typeof opacity === "function" ? opacity(d) : 0.8
      );

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
