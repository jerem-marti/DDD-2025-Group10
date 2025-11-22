# Protocol Diagram: Exoplanet Habitability Visualization

## Research Question
**How can we identify and visualize potentially habitable exoplanets based on their physical characteristics and environmental conditions?**

This project explores the distribution of confirmed exoplanets in the galaxy and identifies candidates for habitability by analyzing multiple planetary parameters including size, temperature, orbital characteristics, and stellar properties.

---

## Methodology Overview

Our approach combines data processing, visual analytics, and interactive storytelling to guide users through the discovery process of potentially habitable exoplanets. The visualization employs a stepped narrative structure, progressively filtering and analyzing the dataset to narrow down habitability candidates.

---

## Process Diagram

```mermaid
graph TB
    Topic[Research Question:<br/>Identifying Habitable Exoplanets]
    
    Q1(("What is the spatial<br/>distribution of confirmed<br/>exoplanets in our galaxy?"))
    Q2(("What planetary characteristics<br/>indicate potential habitability?"))
    Q3(("How many candidates meet<br/>the habitability criteria?"))
    
    A1{"Filter and aggregate<br/>exoplanet data"}
    A2{"Apply habitability<br/>constraints"}
    A3{"Calculate candidate<br/>scores"}
    
    D1[("NASA Exoplanet Archive<br/>Confirmed Planets Dataset<br/>(5000+ exoplanets)")]
    D2[("Stellar Host Data<br/>(temperature, mass, distance)")]
    
    C1[\Galactic Coordinates<br/>distance, angle\]
    C2[\Planet Radius<br/>Earth radii\]
    C3[\Equilibrium Temperature<br/>Kelvin\]
    C4[\Stellar Effective Temperature<br/>Kelvin\]
    C5[\Insolation Flux<br/>Earth flux\]
    C6[\Surface Gravity<br/>m/s²\]
    
    T1(("D3.js v7"))
    T2(("Canvas API"))
    T3(("JavaScript ES6+"))
    
    V1>"Galaxy View<br/>(Polar Coordinates)"]
    V2>"Scatter Plot Analysis<br/>(Radius vs Temperature)"]
    V3>"Interactive Tooltips<br/>(System Details)"]
    V4>"Zoom & Pan Controls<br/>(Exploration)"]
    
    F1{{"Conservative Candidates:<br/>Rocky planets in HZ<br/>with suitable gravity"}}
    F2{{"Optimistic Candidates:<br/>Extended habitability<br/>criteria"}}
    
    Topic --> Q1
    Topic --> Q2
    Topic --> Q3
    
    Q1 --> A1
    Q2 --> A2
    Q3 --> A3
    
    D1 --> A1
    D2 --> A1
    
    A1 --> C1
    A1 --> C2
    A1 --> C3
    
    A2 --> C4
    A2 --> C5
    A2 --> C6
    
    C1 --> V1
    C2 --> V2
    C3 --> V2
    C4 --> A3
    C5 --> A3
    C6 --> A3
    
    T1 --> V2
    T2 --> V1
    T3 --> V1
    T3 --> V2
    
    V1 --> V3
    V2 --> V3
    V1 --> V4
    V2 --> V4
    
    A3 --> F1
    A3 --> F2
    
    F1 --> F1
    F2 --> F2

    style Topic fill:#e6e6fa,stroke:#9370db,stroke-width:3px
    style Q1 fill:#e6f3ff,stroke:#4a90e2,stroke-width:2px
    style Q2 fill:#e6f3ff,stroke:#4a90e2,stroke-width:2px
    style Q3 fill:#e6f3ff,stroke:#4a90e2,stroke-width:2px
    style A1 fill:#fff4e6,stroke:#ff9800,stroke-width:2px
    style A2 fill:#fff4e6,stroke:#ff9800,stroke-width:2px
    style A3 fill:#fff4e6,stroke:#ff9800,stroke-width:2px
    style D1 fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    style D2 fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    style V1 fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style V2 fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style V3 fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style V4 fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style F1 fill:#fff9c4,stroke:#fbc02d,stroke-width:3px
    style F2 fill:#fff9c4,stroke:#fbc02d,stroke-width:3px
    style T1 fill:#e0f7fa,stroke:#00acc1,stroke-width:2px
    style T2 fill:#e0f7fa,stroke:#00acc1,stroke-width:2px
    style T3 fill:#e0f7fa,stroke:#00acc1,stroke-width:2px
```

---

## Detailed Process Description

### 1. Data Acquisition & Preparation

**Dataset:** NASA Exoplanet Archive - Confirmed Planets
- **Source:** [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)
- **Size:** 5000+ confirmed exoplanets
- **Format:** JSON (preprocessed from CSV)

**Data Processing Steps:**
1. Load raw exoplanet data (`planets.json`) and stellar system data (`systems.json`)
2. Calculate derived properties:
   - Galactic coordinates (distance and angle from solar system)
   - Equilibrium temperatures
   - Rocky planet classification (radius < 1.6 Earth radii)
   - Habitable zone boundaries based on stellar temperature
3. Filter invalid/incomplete records
4. Aggregate planet data by host star system

### 2. Habitability Criteria Definition

**Conservative Candidates:**
- Rocky planet (radius ≤ 1.6 R⊕)
- Within habitable zone (suitable insolation flux)
- Surface gravity similar to Earth (4-15 m/s²)
- Host star temperature: 2,400-7,000 K

**Optimistic Candidates:**
- Extended radius range (up to 2.0 R⊕)
- Broader temperature tolerance
- Relaxed gravity constraints

### 3. Visual Analysis Pipeline

**Step 1: Galaxy Overview**
- **Visualization:** Polar coordinate plot (Canvas)
- **Purpose:** Show spatial distribution of all confirmed exoplanets
- **Encoding:** Distance (radial), angle (galactic longitude), opacity (presence)

**Step 2: Initial Filtering**
- **Visualization:** Galaxy view with opacity encoding
- **Purpose:** Highlight systems with complete data
- **Encoding:** Opacity based on data completeness (6 key parameters)

**Step 3-5: Progressive Filtering**
- **Step 3:** Rocky planets only
- **Step 4:** Temperature constraints applied
- **Step 5:** Gravity constraints applied
- **Encoding:** Increasing opacity for planets meeting each criterion

**Step 6: Candidate Systems**
- **Visualization:** Galaxy view with orbital animations
- **Purpose:** Show final candidate systems with their planets
- **Encoding:** Animated orbits, color-coded by habitability status

**Step 7-9: Detailed Analysis**
- **Visualization:** Scatter plots (D3.js SVG)
- **Axes:** Planet radius vs. equilibrium temperature
- **Zones:** Rocky planet zone, habitable zone, gravity zone
- **Purpose:** Detailed parameter space exploration

### 4. Interactive Features

**Implemented Interactions:**
- **Tooltips:** Hover to see detailed system/planet information
- **Zoom & Pan:** Both galaxy and scatter views support zoom/pan
  - Mouse wheel zoom (centered on cursor)
  - Drag to pan
  - Zoom controls (+/−/reset buttons)
- **Adaptive Axes:** More detail when zoomed in
- **Hover Animations:** Glow effects on hoverable elements
- **Step Navigation:** Linear storytelling with prev/next controls

### 5. Technical Implementation

**Frontend Stack:**
- **D3.js v7:** Scatter plot rendering, scales, axes, zoom behavior
- **Canvas API:** High-performance galaxy view rendering
- **Vanilla JavaScript:** State management, event handling
- **CSS3:** Styling, animations, responsive layout

**Architecture:**
- **State Management:** Centralized state with observer pattern
- **View System:** Separate galaxy (Canvas) and scatter (SVG) views
- **Scene Configuration:** Declarative scene definitions with filters
- **Module Structure:** Separate concerns (data loading, views, UI, state)

**Performance Optimizations:**
- Canvas rendering for 5000+ points in galaxy view
- Debounced resize handlers
- Efficient zoom/pan transforms
- RequestAnimationFrame for smooth animations

---

## Key Findings

### Conservative Habitability Candidates
**Count:** ~50-100 systems
- Rocky planets in traditional habitable zone
- Earth-like surface gravity
- Stable host stars

### Optimistic Habitability Candidates
**Count:** ~100-200 systems
- Extended criteria including super-Earths
- Broader temperature ranges
- Diverse stellar hosts

### Spatial Distribution Insights
- Most exoplanets discovered within 1000-3000 parsecs
- Concentration along galactic plane
- Detection bias toward nearby, bright stars

---

## Visualization Insights

1. **Rocky Planet Bias:** Most confirmed exoplanets are gas giants; rocky planets are relatively rare
2. **Hot Jupiter Prevalence:** Many large planets orbit very close to their stars
3. **Temperature-Size Correlation:** Clear clustering patterns in radius-temperature space
4. **Habitable Zone Overlap:** Small region where all criteria align

---

## References

- NASA Exoplanet Archive: https://exoplanetarchive.ipac.caltech.edu/
- Habitable Zone Calculator: Kopparapu et al. (2013)
- D3.js Documentation: https://d3js.org/
- Project inspired by Climate Imaginaries (Digital Methods Initiative)

---

## Project Repository

**GitHub:** [DDD-2025-Group10](https://github.com/jerem-marti/DDD-2025-Group10)

**Live Demo:** [GitHub Pages](https://jerem-marti.github.io/DDD-2025-Group10/)

---

*Created for Making Sense of Data course, SUPSI MAIND 2025*
