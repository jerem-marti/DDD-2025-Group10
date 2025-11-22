# Visual Encoding Refinements Summary

This document outlines the comprehensive visual encoding improvements made to the Galaxy of Filters exoplanet visualization project.

## 1. Scatter Plot Improvements (`scatterView.js`)

### Outlier Handling
- **IQR Method**: Uses interquartile range to detect and filter extreme outliers
- **Percentile Method**: Clips to 1st and 99th percentiles for robust scaling
- **Configurable**: Each scene can specify `outlierMethod` in `scaleConfig`

### Smart Scale Selection
- **Automatic Log Detection**: When data spans > 100× range, automatically uses log scale
- **Force Options**: Scenes can force linear or log scale via `scaleConfig`
- **Domain Clamping**: Prevents data outside computed bounds from distorting the view

### Perceptual Size Encoding
- **Sqrt Scale**: Point area (not radius) proportional to data value
- **Adaptive Range**: Adjusts min/max radius based on data distribution (2-12px default)
- **Better Visual Hierarchy**: Large values are perceptually distinct without dominating

### Background Layers
Added visual reference zones:
- **Rocky Window**: Vertical band for habitable radius range (0.5-1.6 Earth radii)
- **HZ Bands**: Optimistic (0.32-1.78) and conservative (0.35-1.04) insolation zones
- **Gravity Band**: Horizontal band for comfortable gravity (0.5-1.5 g)
- **Iso-gravity Lines**: Curves showing constant surface gravity on mass-radius plot

### Axis Improvements
- **Smart Formatting**: Automatically adjusts number format based on magnitude
  - Large numbers: scientific notation (2.5e3)
  - Medium: integers or 1 decimal
  - Small: 2-3 decimals
- **Better Ticks**: 8 ticks per axis for clear reading
- **Labeled Axes**: Clear axis labels with units

### Visual Polish
- **Subtle Strokes**: High-opacity points get subtle white stroke for definition
- **Smooth Transitions**: 300ms duration for enter/update, 200ms for exit
- **Anti-aliasing**: Better rendering with `geometricPrecision`

## 2. Galaxy View Improvements (`galaxyView.js`)

### Adaptive Scaling
- **Data-Driven Scale**: Calculates optimal scale factor from actual data extent
- **Consistent Margins**: Uses 80% of canvas to maintain margins
- **Capped Zoom**: Maximum scale factor of 100 to prevent over-zoom

### Depth Sorting
- **Painter's Algorithm**: Draws dimmer points first, brighter points last
- **Better Layering**: Important systems appear "on top" visually

### Visual Effects
- **Glow for Highlights**: Important points (opacity > 0.7) get radial gradient glow
- **Subtle Strokes**: High-opacity points get white stroke for better definition
- **Smooth Gradients**: 2.5× radius glow with alpha fade

### Performance
- **DPR Support**: Handles high-DPI displays correctly
- **Efficient Clearing**: Clear rect before each draw
- **Sorted Drawing**: Optimized draw order reduces visual artifacts

## 3. Scene Configuration Updates

### S2.0 - Raw Planets
- **Size Encoding**: Now uses actual `pl_rade` value for perceptual sizing
- **Outlier Filtering**: Percentile method prevents extreme values from dominating

### S2.1 - Rocky Size Filter
- **Perceptual Size**: Direct radius mapping with sqrt scale
- **Better Contrast**: Rocky planets at 0.9 opacity, others at 0.2
- **Visual Window**: Background band shows rocky size range

### S2.2 - Gravity Bands
- **Size from Radius**: Points sized by actual planet radius
- **Iso-gravity Lines**: Shows g = 0.5, 1.0, 1.5 curves on mass-radius plot
- **Texture Encoding**: Hatch patterns indicate gravity levels

### S2.3 - Gravity × Insolation
- **Log Scale X-axis**: Forced log scale for insolation (spans ~3 orders of magnitude)
- **Size Encoding**: Point size represents planet radius
- **Color Zones**: Blue (cold), green (habitable), orange (hot)
- **Dual Bands**: HZ bands (vertical) × gravity band (horizontal) = target zone

### S1 & S3 - Galaxy Views
- **Sqrt Size Encoding**: Point size = 2 + √(planet_count) × factor
- **Better Progression**: More intuitive size differences for 1, 2, 4, 9 planets
- **Candidate Highlighting**: S3 uses size = 4 + √(candidate_count) × 2

## 4. Utility Functions (`encoding-utils.js`)

New helper functions for encoding logic:

### `createColorScale(domain, scheme)`
- Perceptually uniform color ramps
- Schemes: viridis, plasma, temperature
- Returns mapping function from value → color

### `densityAlpha(dataLength, baseAlpha)`
- Calculates opacity based on point count
- Prevents overplotting in dense regions
- <100 points: full alpha; >5000: 20% alpha

### `adaptivePointSize(dataLength, viewportArea)`
- Returns {min, max} radius based on density
- Sparse data: larger points (3-14px)
- Dense data: smaller points (1-6px)

### `formatNumber(value, precision)`
- Smart formatting for display
- Auto-detects appropriate precision
- Handles scientific notation for large values

### `categoricalColors(categories)`
- Generates distinct colors for categories
- High contrast on dark background
- Cycles through 8-color palette

### `getQuantiles(values, percentiles)`
- Calculates distribution statistics
- Default: [1%, 25%, 50%, 75%, 99%]
- Used for outlier detection

## 5. CSS Enhancements

### Axis Styling
- Subtle tick lines (15% opacity)
- Muted text color for labels
- Domain lines at 30% opacity
- Better font rendering

### Background Layers
- Rocky window: 12% cyan with dashed border
- HZ optimistic: 5% green
- HZ conservative: 18% green with solid border
- Gravity band: 15% grey with dashed border
- Iso-lines: 70% grey, 1g line emphasized

### Point Rendering
- `geometricPrecision` for better anti-aliasing
- Reduced stroke artifacts
- Smooth opacity transitions

## Usage Examples

### Force log scale on X-axis
```javascript
scaleConfig: {
  x: { forceLog: true, outlierMethod: "percentile" },
  y: { outlierMethod: "iqr" }
}
```

### Perceptual size encoding
```javascript
encodings: {
  size: (d) => d.pl_rade ?? 1  // Handled by sqrt scale internally
}
```

### Adaptive opacity for dense data
```javascript
import { densityAlpha } from "./encoding-utils.js";

encodings: {
  opacity: (d) => densityAlpha(data.length) * (d.isHighlighted ? 1.2 : 1)
}
```

## Testing Recommendations

1. **Outlier Handling**: Test with datasets containing extreme values (e.g., Jupiter-mass planets)
2. **Scale Transitions**: Verify smooth transitions when switching between linear/log scales
3. **Size Perception**: Confirm that 4× radius planet appears ~4× larger in area
4. **Performance**: Test with full dataset (5000+ points) for rendering speed
5. **Visual Hierarchy**: Ensure candidate planets stand out in crowded regions

## Future Enhancements

1. **Interactive Brushing**: Select regions in scatter plot
2. **Zoom & Pan**: D3 zoom behavior for detailed exploration
3. **Density Contours**: 2D density estimation for very dense regions
4. **Color Schemes**: User-selectable color palettes
5. **Animation**: Smooth interpolation between scenes
6. **Responsive Sizing**: Adjust encodings based on window size

## Performance Considerations

- **Canvas vs SVG**: Canvas for >1000 points (galaxy), SVG for scatter
- **Transition Duration**: 300ms strikes balance between smooth and responsive
- **Outlier Filtering**: Reduces extreme domain values that cause poor scaling
- **Sorted Drawing**: Ensures visual priority without z-index complexity

---

**Updated**: November 22, 2025
**Version**: 1.0
