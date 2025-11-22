// src/encoding-utils.js
// Utility functions for better visual encodings

/**
 * Perceptually uniform color scales for continuous data
 */
export function createColorScale(domain, scheme = "viridis") {
  // Simple implementation - can be extended with d3-scale-chromatic
  const schemes = {
    viridis: ["#440154", "#31688e", "#35b779", "#fde724"],
    plasma: ["#0d0887", "#7e03a8", "#cc4778", "#f89540", "#f0f921"],
    temperature: ["#3b4cc0", "#7fa1e3", "#f7f7f7", "#f4a582", "#b40426"]
  };
  
  return (value) => {
    const colors = schemes[scheme] || schemes.viridis;
    const normalized = (value - domain[0]) / (domain[1] - domain[0]);
    const index = Math.floor(normalized * (colors.length - 1));
    return colors[Math.max(0, Math.min(colors.length - 1, index))];
  };
}

/**
 * Calculate optimal alpha based on point density
 * More points = lower alpha to avoid overplotting
 */
export function densityAlpha(dataLength, baseAlpha = 0.8) {
  if (dataLength < 100) return baseAlpha;
  if (dataLength < 500) return baseAlpha * 0.7;
  if (dataLength < 1000) return baseAlpha * 0.5;
  if (dataLength < 5000) return baseAlpha * 0.3;
  return baseAlpha * 0.2;
}

/**
 * Robust color contrast check
 */
export function ensureContrast(color, background = "#020617", minContrast = 3) {
  // Simple luminance calculation
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };
  
  const colorLum = getLuminance(color);
  const bgLum = getLuminance(background);
  const contrast = Math.abs(colorLum - bgLum) / 255;
  
  if (contrast < minContrast / 21) {
    // Increase brightness if too similar to background
    return colorLum < bgLum ? "#ffffff" : "#000000";
  }
  
  return color;
}

/**
 * Calculate adaptive point size based on visible area and data density
 */
export function adaptivePointSize(dataLength, viewportArea = 240000) {
  // Estimate point density
  const density = dataLength / viewportArea;
  
  if (density < 0.00005) return { min: 3, max: 14 }; // sparse
  if (density < 0.0001) return { min: 2.5, max: 12 };
  if (density < 0.0005) return { min: 2, max: 10 };
  if (density < 0.001) return { min: 1.5, max: 8 };
  return { min: 1, max: 6 }; // very dense
}

/**
 * Format numbers for display with appropriate precision
 */
export function formatNumber(value, precision = "auto") {
  if (value == null) return "N/A";
  
  if (precision === "auto") {
    if (Math.abs(value) >= 1000) return value.toExponential(2);
    if (Math.abs(value) >= 100) return value.toFixed(0);
    if (Math.abs(value) >= 10) return value.toFixed(1);
    if (Math.abs(value) >= 1) return value.toFixed(2);
    return value.toFixed(3);
  }
  
  return value.toFixed(precision);
}

/**
 * Create categorical color palette with maximum perceptual distance
 */
export function categoricalColors(categories) {
  // Predefined palette with good contrast on dark background
  const palette = [
    "#22d3ee", // cyan
    "#fb923c", // orange
    "#4ade80", // green
    "#f97373", // red
    "#facc15", // yellow
    "#a5b4fc", // blue
    "#f0abfc", // pink
    "#fdba74", // light orange
  ];
  
  return categories.reduce((acc, cat, i) => {
    acc[cat] = palette[i % palette.length];
    return acc;
  }, {});
}

/**
 * Calculate quantiles for better outlier detection
 */
export function getQuantiles(values, percentiles = [0.01, 0.25, 0.5, 0.75, 0.99]) {
  const sorted = [...values].filter(v => v != null).sort((a, b) => a - b);
  return percentiles.reduce((acc, p) => {
    const index = Math.floor(sorted.length * p);
    acc[p] = sorted[Math.max(0, Math.min(sorted.length - 1, index))];
    return acc;
  }, {});
}
