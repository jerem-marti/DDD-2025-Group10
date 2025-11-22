# Visual Encoding Refinements - Implementation Guide

## Overview

This project has been enhanced with comprehensive visual encoding refinements to improve data visualization quality, handling of outliers, and perceptual accuracy. The improvements span across scatter plots, galaxy views, and scene configurations.

## Key Improvements

### 🎯 1. Smart Scaling & Outlier Handling

**Problem Solved**: Extreme outliers (like Jupiter-mass planets) were compressing the interesting data range.

**Solutions**:
- **Percentile clipping**: Uses 1st-99th percentile to determine axis ranges
- **IQR method**: Alternative outlier detection using interquartile range
- **Automatic log scales**: Detects when data spans >100× range and uses log scale
- **Domain clamping**: Prevents out-of-range values from affecting the view

**Usage**:
```javascript
scaleConfig: {
  x: { outlierMethod: "percentile", forceLog: true },
  y: { outlierMethod: "iqr" }
}
```

### 📏 2. Perceptual Size Encoding

**Problem Solved**: Linear radius scaling made large planets visually dominate (area grows with r²).

**Solution**: 
- Uses `d3.scaleSqrt()` so point **area** is proportional to data value
- Adaptive size ranges based on data density
- Better visual hierarchy

**Before**: 
```javascript
size: (p) => 2 + p.pl_rade * 1.2  // Linear
```

**After**:
```javascript
size: (p) => p.pl_rade  // Sqrt scale applied internally
```

**Result**: A planet with 4× radius now appears ~4× larger in area (not 16×).

### 🎨 3. Enhanced Background Layers

Added visual reference zones directly in the plot:

- **Rocky Window** (S2.1): Vertical cyan band showing habitable radius range
- **HZ Bands** (S2.3): Green zones for optimistic/conservative habitable zone
- **Gravity Band** (S2.3): Horizontal yellow band for comfortable gravity
- **Iso-gravity Lines** (S2.2): Curves showing g = 0.5, 1.0, 1.5

These provide immediate visual context without cluttering the legend.

### ✨ 4. Galaxy View Enhancements

**Adaptive Scaling**:
- Calculates optimal scale factor from data extent
- Uses 80% of canvas (maintains margins)
- Capped at 100× to prevent over-zoom

**Visual Effects**:
- **Depth sorting**: Draws dim points first, bright points last
- **Glow effect**: Important systems (opacity > 0.7) get radial gradient
- **Subtle strokes**: High-opacity points have white outline for definition

**Performance**:
- High-DPI display support (devicePixelRatio)
- Efficient canvas clearing and sorted drawing

### 📊 5. Improved Axis Formatting

**Smart number formatting**:
- Large (>1000): Scientific notation → `2.5e3`
- Medium (10-100): Integers or 1 decimal → `42.3`
- Small (<1): 2-3 decimals → `0.123`

**Visual improvements**:
- 8 ticks per axis (balanced readability)
- Subtle grid lines (15% opacity)
- Clear axis labels with units
- Muted text colors for better focus on data

### 🛠️ 6. Utility Functions (`encoding-utils.js`)

New helper functions for common encoding tasks:

```javascript
import { densityAlpha, adaptivePointSize, formatNumber } from './encoding-utils.js';

// Reduce alpha for dense regions (prevents overplotting)
const alpha = densityAlpha(data.length, 0.8);

// Get optimal point size range
const { min, max } = adaptivePointSize(data.length, viewportArea);

// Format for display
const label = formatNumber(1234.567, "auto"); // "1.23e3"
```

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
- **Log scale on X-axis** (insolation spans 0.01-100+)
- Dual reference zones: HZ (vertical) × gravity (horizontal)
- Color coding: blue (cold) → green (habitable) → orange (hot)
- Target region is green rectangle in center

### S1 & S3 - Galaxy Views
- System size: `2 + √(planet_count) × factor`
- Better progression: 1→2→4→9 planets visually distinct
- Candidate highlighting with spectral colors
- Adaptive scale based on system distribution

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
- **Canvas** (galaxy view): Best for >1000 points, static rendering
- **SVG** (scatter view): Best for <1000 points, interactivity, transitions

### Transition Timing
- Enter/Update: 300ms (smooth but responsive)
- Exit: 200ms (faster removal feels snappier)

### Data Processing
- Outlier filtering happens once per scale update
- Sorted drawing optimizes painter's algorithm
- Clamped domains prevent pathological cases

## Troubleshooting

### "All points are tiny"
- Check if log scale is being forced on small range data
- Verify size accessor returns valid numbers
- Confirm `scaleConfig` is properly passed to view

### "Outliers still visible"
- Try switching from `percentile` to `iqr` method
- Adjust IQR factor: `{ outlierMethod: "iqr", factor: 2.0 }`
- Consider manual domain override if needed

### "Colors look washed out"
- Check data length - high density reduces opacity
- Verify `baseOpacity` and `opacity` functions
- Ensure background layer opacities aren't too high

### "Axes not showing"
- Confirm data has valid values for xVar and yVar
- Check browser console for D3 scale errors
- Verify `xLabel` and `yLabel` are set in view config

## Future Enhancements

1. **Interactive Zoom**: Add D3 zoom behavior for detail exploration
2. **Brushing**: Select regions to filter linked views
3. **Density Estimation**: 2D contours for very dense data
4. **Custom Palettes**: User-selectable color schemes
5. **Responsive Layout**: Adjust encodings based on viewport size
6. **Tooltip Details**: Hover for planet/system information

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

---

**Last Updated**: November 22, 2025  
**Version**: 1.0.0
