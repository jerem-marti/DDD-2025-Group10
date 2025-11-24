# Visual Encoding Refinements - Implementation Guide

## Overview

This project implements comprehensive visual encoding refinements to improve data visualization quality, handling of outliers, and perceptual accuracy. The improvements span across scatter plots, galaxy views, small multiples, and scene configurations. This guide documents the actual implementation as found in the codebase.

## Key Improvements

### 🎯 1. Smart Scaling & Outlier Handling

**Problem Solved**: Extreme outliers (like Jupiter-mass planets) were compressing the interesting data range.

**Solutions Implemented**:
- **Percentile clipping**: Uses 1st-99th percentile to determine axis ranges in scatter view
- **IQR method**: Alternative outlier detection using interquartile range (available but percentile is primary)
- **Domain clamping**: Prevents out-of-range values from affecting the view in small multiples
  - Star radius: 0.3-3.0 solar radii
  - Gravity: 0.3-2.0g
  - Orbital period: 10-1000 days

**Usage in scenes-config.js**:
```javascript
scaleConfig: {
  x: { outlierMethod: "percentile" },  // Currently used method
  y: { outlierMethod: "percentile" }
}
```

**Note**: Automatic log scales and IQR method are available in the codebase but not currently used in scene configurations. The project uses percentile-based filtering for all scatter views.

### 📏 2. Perceptual Size Encoding

**Problem Solved**: Linear radius scaling made large planets visually dominate (area grows with r²).

**Current Implementation**: 
- Scatter views use direct radius values: `size: (p) => p.pl_rade ?? 1`
- Scale is applied with appropriate min/max ranges in the view
- Galaxy views use square root scaling: `2 + Math.sqrt(pnum) × factor`
- Small multiples use clamped linear scaling with safe ranges

**Galaxy View Example** (S1, S3):
```javascript
baseSize: (d) => {
  const pnum = d.sy_pnum || 1;
  return 2 + Math.sqrt(pnum) * 1.2;  // Sqrt for perceptual accuracy
}
```

**Scatter View Example** (S2.1):
```javascript
size: (p) => p.pl_rade ?? 1  // Direct value, scale handles sizing
```

**Small Multiples** (S4):
```javascript
// Star radius with clamping
const clampedStarRad = Math.max(0.3, Math.min(3.0, system.st_rad || 1));
const starRadius = Math.max(8, clampedStarRad * 15); // 8-45px range
```

**Result**: Visual hierarchy is maintained without extreme size differences. A system with 4 planets appears ~2× larger in area (not 4×).

### 🎨 3. Enhanced Background Layers

Added visual reference zones directly in the plot:

- **Rocky Window** (S2.1): Vertical cyan band showing habitable radius range
- **HZ Bands** (S2.3): Green zones for optimistic/conservative habitable zone
- **Gravity Band** (S2.3): Horizontal yellow band for comfortable gravity
- **Iso-gravity Lines** (S2.2): Curves showing g = 0.5, 1.0, 1.5

These provide immediate visual context without cluttering the legend.

### ✨ 4. Galaxy View Enhancements

**Interactive Zoom & Pan**:
- Mouse wheel zoom centered on cursor position (0.5× to 10× range)
- Click-and-drag panning
- Zoom controls (zoom in ×1.5, zoom out ×0.67, reset)
- Smooth zoom maintains focus on mouse position

**Adaptive Scaling**:
- Calculates optimal scale factor from data extent
- Uses available canvas space with proper centering
- Dynamic scale adjustment based on zoom level

**Visual Effects**:
- **Depth sorting**: Draws dim points first, bright points last (in sortedData)
- **Glow effect**: Stars get radial gradient fills based on their colors
- **Hover states**: Pointer cursor and tooltip for hoverable systems
- **Spectral coloring**: M-type (red), K-type (orange), G-type (yellow), F-type (blue)

**Performance**:
- High-DPI display support (devicePixelRatio)
- Efficient canvas clearing and sorted drawing
- Debounced resize handler (150ms)
- Optimized redraw only when needed

### 📊 5. Improved Axis Formatting

**Smart number formatting** (adaptive based on zoom):
- Large (≥1000): Scientific notation → `d3.format(".2s")`
- Medium (≥10): Integers → `d3.format(".0f")`
- Medium (≥1): One decimal → `d3.format(".1f")`
- Small (<1): Two decimals → `d3.format(".2f")`

**Adaptive tick counts** based on zoom level:
- Default (zoom = 1): 3-4 ticks per axis
- Medium zoom (zoom > 2): 2-3 ticks per axis
- High zoom (zoom > 5): 2 ticks per axis
- Prevents tick crowding at high zoom levels

**Visual improvements**:
- Clear axis labels with units (e.g., "Planet Radius (R⊕)")
- Muted text colors (#ccc) for better focus on data
- Proper margins (top: 30, right: 20, bottom: 50, left: 60)
- Responsive axis updates during zoom/pan

### 🛠️ 6. Utility Functions (`encoding-utils.js`)

Available helper functions for visual encodings:

```javascript
import { 
  densityAlpha, 
  adaptivePointSize, 
  formatNumber,
  getQuantiles,
  categoricalColors,
  createColorScale,
  ensureContrast
} from './encoding-utils.js';

// Reduce alpha for dense regions (prevents overplotting)
const alpha = densityAlpha(data.length, 0.8);
// Returns: 0.8 (<100), 0.56 (100-500), 0.4 (500-1000), 
//          0.24 (1000-5000), 0.16 (>5000)

// Get optimal point size range based on density
const { min, max } = adaptivePointSize(data.length, viewportArea);
// Examples: {min: 3, max: 14} (sparse), {min: 1, max: 6} (dense)

// Format numbers with auto precision
const label = formatNumber(1234.567, "auto"); // "1.23e+3"

// Calculate quantiles for outlier detection
const quantiles = getQuantiles(values, [0.01, 0.25, 0.5, 0.75, 0.99]);

// Generate categorical color palette
const colors = categoricalColors(['rocky', 'gas', 'ice']);
// Returns: {rocky: '#22d3ee', gas: '#fb923c', ice: '#4ade80'}

// Create perceptual color scales
const tempScale = createColorScale([3000, 7000], 'temperature');

// Ensure contrast against background
const visibleColor = ensureContrast('#333333', '#020617', 3);
```

**Note**: These utilities are available but not all are actively used in current scenes. The most used are `formatNumber`, `getQuantiles`, and `densityAlpha` concepts (implemented inline in views).

## Scene-Specific Improvements

### S2.0 - All Planets (Raw)
- Percentile outlier filtering on both axes
- Perceptual size encoding
- Base opacity 0.6 (reduced overplotting)

### S2.1 - Rocky Size Filter
- Background window shows rocky range (0.5-1.6 R⊕)
- Rocky planets at 0.9 opacity, others at 0.2
- Size directly represents radius

### S2.2 - Gravity Bands
- Iso-gravity curves: mass ≈ g × radius²
- Shows g = 0.5, 1.0, 1.5 lines
- 1g line emphasized (dashed yellow)

### S2.3 - Gravity × Insolation
- Dual reference zones: HZ (vertical) × gravity (horizontal)
- Color coding: blue (cold) → green (habitable) → orange (hot)
- Target region is where zones overlap
- Uses percentile outlier filtering on both axes

### S1 & S3 - Galaxy Views
- System size: `2 + √(planet_count) × 1.2`
- Visual progression: 1→2→4→9 planets scale appropriately
- Candidate highlighting with spectral colors (M/K/G/F types)
- Interactive zoom (mouse wheel, buttons) and pan (click-drag)
- Adaptive scale based on system distribution and zoom level

### S4 - Small Multiples
- **Star morphing**: Animates between system star and Sun for size comparison
- **Orbital animations**: 
  - Synchronized Earth and candidate planet orbits
  - Logarithmic period scaling: maps 10-1000 day orbits to 30-240s animations
  - Clamps extreme values for consistent visual experience
- **Gravity pulse**: 
  - Animation speed based on surface gravity: `speed = 2 / (g³)`
  - Clamps gravity to 0.3-2.0g range
  - Final speed range: 0.3-8 seconds
- **Star coloring**: Temperature-based (M-red, K-orange, G-yellow, F-blue)
- **Multi-star support**: Visual arrangement for binary/multiple star systems

## Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- Outlier filtering accuracy
- Size scale calculations
- Number formatting edge cases
- Quantile calculations
- Color mapping logic

## Performance Considerations

### Canvas vs SVG
- **Canvas** (galaxy view): Used for all galaxy views (S1, S3), handles thousands of systems efficiently
- **SVG** (scatter view): Used for scatter plots (S2.0-S2.3), provides smooth transitions and zoom
- **SVG** (small multiples): Used for S4, enables complex animations (orbital motion, morphing, pulses)

### Animation Timing
- **Galaxy view**: Immediate canvas redraw (no transitions)
- **Scatter view**: D3 transitions for smooth updates
- **Small multiples**: 
  - Orbital periods: 30-240 seconds (logarithmic scaling)
  - Gravity pulses: 0.3-8 seconds (based on surface gravity)
  - Star morphing: CSS animation between system star and Sun

### Data Processing
- Outlier filtering uses percentile-based approach (1st-99th percentile)
- Galaxy view sorts data by opacity before drawing (depth effect)
- Small multiples clamp extreme values for safe visual ranges
- Zoom/pan updates only affect positions, not encodings

## Troubleshooting

### "All points are tiny in scatter view"
- Verify size accessor returns valid numbers: `size: (p) => p.pl_rade ?? 1`
- Check if data has null values for the size variable
- Confirm `scaleConfig` is properly passed to view with `outlierMethod: "percentile"`

### "Outliers still visible in scatter plots"
- Current implementation uses percentile method (1st-99th percentile)
- Check `scaleConfig` in scenes-config.js for the scene
- Verify data filtering is working: outliers beyond percentiles are shown but compressed

### "Colors look washed out"
- Check opacity settings in scene encodings: `baseOpacity` and `opacity` functions
- Typical values: 0.2 for background, 0.6-0.9 for highlighted points
- Ensure background layer opacities aren't too high (rockyWindow, HZ bands)

### "Axes not showing or wrong formatting"
- Confirm data has valid values for xVar and yVar (check `has_data` flag)
- Verify `xLabel` and `yLabel` are set in view config
- Check browser console for D3 scale errors (domain/range issues)

### "Galaxy zoom not working"
- Verify zoom controls are present in HTML: `#zoom-in`, `#zoom-out`, `#zoom-reset`
- Check mouse wheel event listener is attached (canvas element)
- Ensure `zoomLevel` and `panX/panY` state variables are initialized

### "Small multiples animations jerky"
- Check if extreme values are being clamped properly
- Verify orbital period calculation: `Math.max(30, Math.min(240, ...))`
- Ensure CSS animations are defined in small-multiples.css

## Implemented Features

✅ **Interactive Zoom**: 
- Scatter view: D3 zoom behavior with mouse wheel and buttons
- Galaxy view: Custom zoom with mouse wheel (0.5×-10×) and control buttons

✅ **Pan/Drag**: Click-and-drag panning in galaxy view

✅ **Tooltip Details**: 
- Hover for system information in galaxy views
- Hover for planet information in small multiples
- Citation tooltips in sidebar with visibility control

✅ **Responsive Layout**: 
- Canvas/SVG resize handlers with debouncing
- High-DPI display support (devicePixelRatio)
- Zoom extent adapts to viewport size

✅ **Animations**:
- Small multiples: orbital motion, star morphing, gravity pulses
- Scatter view: smooth D3 transitions for data updates

## Future Enhancements

1. **Brushing**: Select regions in scatter view to filter linked views
2. **Density Estimation**: 2D contours or heatmaps for very dense scatter data
3. **Custom Palettes**: User-selectable color schemes (currently hardcoded)
4. **Linked Highlighting**: Click system in galaxy to highlight in scatter view
5. **Export**: Save current view as PNG or SVG
6. **Data Filters UI**: Interactive sliders for gravity, insolation ranges

## Browser Compatibility

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Requires ES6 module support
- Uses Canvas API (galaxy view) and SVG (scatter view)
- D3.js v7 for scales and axes

## Resources

- **D3 Scales**: https://d3js.org/d3-scale
- **Perceptual Encoding**: [Cleveland & McGill 1984](https://www.jstor.org/stable/2288400)
- **Color Theory**: [ColorBrewer](https://colorbrewer2.org/)
- **Outlier Detection**: [Tukey's Fences](https://en.wikipedia.org/wiki/Outlier#Tukey's_fences)

## Credits

Visual encoding best practices informed by:
- Tamara Munzner, *Visualization Analysis and Design*
- Edward Tufte, *The Visual Display of Quantitative Information*
- D3.js documentation and examples

## Implementation Summary

**Key Files**:
- `src/encoding-utils.js`: Utility functions for visual encodings
- `src/views/scatterView.js`: SVG-based scatter plots with zoom
- `src/views/galaxyView.js`: Canvas-based galaxy visualization with interactive zoom/pan
- `src/views/smallMultiplesView.js`: Animated system cards with orbital mechanics
- `src/scenes-config.js`: Scene definitions with encoding specifications

**Current Scene Flow**:
1. **S1**: Galaxy context (all systems with data)
2. **S2.0**: Mass vs Radius scatter (all planets)
3. **S2.1**: Rocky size filter applied
4. **S2.2**: Gravity bands visualization
5. **S2.3**: Gravity × Insolation with HZ zones
6. **S3**: Galaxy with candidate systems highlighted
7. **S4**: Small multiples with animations

**Testing**:
- Unit tests in `src/tests/encoding-utils.test.js`
- Run with: `npm test`
- Coverage: densityAlpha, adaptivePointSize, formatNumber, getQuantiles, categoricalColors

---

**Last Updated**: November 24, 2025  
**Version**: 1.1.0 (Updated to reflect actual implementation)
