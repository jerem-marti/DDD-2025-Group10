// src/scenes-config.js
// Config describing all scenes in the “Galaxy of Filters” story.

const COLORS = {
  rocky: "#22d3ee",        // cyan
  grey: "#9ca3af",
  gravity: "#fb923c",      // orange (comfortable gravity)

  cold: "#60a5fa",         // blue (too cold)
  habitable: "#4ade80",    // green
  hot: "#fb923c",          // orange (too hot)

  starM: "#ff6b6b",        // red (M-type: cool red dwarf)
  starK: "#ff9f4a",        // orange (K-type: orange star)
  starG: "#ffd93d",        // yellow (G-type: Sun-like)
  starF: "#a5d8ff"         // pale blue (F-type: hotter than Sun)
};

export const scenes = [
  // ─────────────────────────────────────────
  // SCENE 1 – Galaxy of star systems (context)
  // ─────────────────────────────────────────
  {
    id: "S1_GALAXY_CONTEXT",
    dataset: "systems", // "systems" | "planets"
    title: "A Galaxy of Exoplanet Systems",
    filterFn: (system) => system.has_data === true,
    view: {
      type: "galaxy",
      sceneId: "S1_GALAXY_CONTEXT",
      // positions computed from glon + sy_dist, actual scaling is done in view
      x: (d) => {
        const angle = (d.glon || 0) * Math.PI / 180;
        const r = Math.log10((d.sy_dist || 1) + 1);
        return r * Math.cos(angle);
      },
      y: (d) => {
        const angle = (d.glon || 0) * Math.PI / 180;
        const r = Math.log10((d.sy_dist || 1) + 1);
        return r * Math.sin(angle);
      },
      encodings: {
        baseColor: "#ffd93d",
        baseOpacity: (d) => {
          const dist = d.sy_dist || 10;
          return Math.max(0.15, 1 - Math.log10(dist + 1) * 0.25);
        },
        baseSize: (d) => {
          const pnum = d.sy_pnum || 1;
          return 2 + Math.sqrt(pnum) * 1.2;
        }
      }
    },
    sidebarContent: {
      heading: "Step 1 · Where are our exoplanet systems?",
      chat: [
        {
          from: "user",
          text: "What is this?"
        },
        {
          from: "guide",
          text: "This is a visualization of all the star systems in our galaxy. Our system, the Solar system, is in the center and each dot is a star system with at least one exoplanet."
        },
        {
          from: "user",
          text: "How are these systems positioned?"
        },
        {
          from: "guide",
          text: "The angle shows the system's direction in our Galaxy and the distance from the center grows with how far it is from us."
        }
      ],
      diagramHint: "Did you know? A parsec roughly equals to 31 thousand billions kilometers",
      notes: [
        "Dot size roughly encodes how many known planets a system has.",
        "We use galactic longitude for the angle around the map.",
        "Radial distance uses a logarithmic scale so that nearby and far-away systems can fit on the same view."
      ]
    }
  },

  // ─────────────────────────────────────────
  // SCENE 2.0 – Planets: raw mass vs radius
  // ─────────────────────────────────────────
  {
    id: "S2_0_PLANETS_RAW",
    dataset: "planets",
    title: "All known planets: mass vs size",
    filterFn: (p) =>
      p.has_data === true &&
      p.pl_rade != null &&
      p.pl_bmasse != null,
    view: {
      type: "scatter",
      xVar: "pl_rade",
      yVar: "pl_bmasse",
      xLabel: "Planet Radius (R⊕)",
      yLabel: "Planet Mass (M⊕)",
      scaleConfig: {
        x: { outlierMethod: "percentile" },
        y: { outlierMethod: "percentile" }
      },
      encodings: {
        color: () => "#bbbbbb",
        opacity: () => 0.6,
        size: (p) => p.pl_rade ?? 1,
        shape: () => "circle"
      }
    },
    sidebarContent: {
      heading: "Step 2 · Zooming in to planets",
      chat: [
        { from: "user", text: "Can we see individual planets instead of systems?" },
        {
          from: "guide",
          text: "Yes. Here, each dot represents a planet, and they’re plotted according to their mass and radius: small, light rocky worlds appear in the lower-left area, while huge, massive gas giants appear in the upper-right area."
        },
        {
          from: "user",
          text: "So, where are the habitable planets?"
        },
        {
          from: "guide",
          text: "There's no habitability filters yet - just the full diversity of known planets."
        }
      ],
      diagramHint: "Did you know? Some exoplanets are about the size of Jupiter but so light and “puffy” that their average density is similar to Styrofoam.",
      notes: [
        "The x-axis shows the planet’s radius, measured in units of Earth’s radius (R⊕).",
        "The y-axis shows the planet's mass, mesaured in units of Earth masses (M⊕)."
      ]
    }
  },

  // ─────────────────────────────────────────
  // SCENE 2.1 – Rocky size filter
  // ─────────────────────────────────────────
  {
    id: "S2_1_ROCKY_SIZE",
    dataset: "planets",
    title: "Rocky-size planets",
    filterFn: (p) =>
      p.has_data === true &&
      p.pl_rade != null &&
      p.pl_bmasse != null,
    view: {
      type: "scatter",
      xVar: "pl_rade",
      yVar: "pl_bmasse",
      xLabel: "Planet Radius (R⊕)",
      yLabel: "Planet Mass (M⊕)",
      scaleConfig: {
        x: { outlierMethod: "percentile" },
        y: { outlierMethod: "percentile" }
      },
      encodings: {
        baseColor: () => COLORS.grey,
        baseOpacity: () => 0.2,
        baseSize: () => 2.5,
        color: (p) => (p.pl_is_rocky_size ? COLORS.rocky : COLORS.grey),
        opacity: (p) => (p.pl_is_rocky_size ? 0.9 : 0.2),
        size: (p) => p.pl_rade ?? 1,
        shape: () => "circle",
        rockyWindow: { minR: 0.5, maxR: 1.6 }
      }
    },
    sidebarContent: {
      heading: "Step 3 · Looking for rocky-size planets",
      chat: [
        {
          from: "user",
          text: "Planets made of gas? we need rocky planets to live on!"
        },
        {
          from: "guide",
          text: "Correct. We need to identify planets made of solid materials. One way to do this is by focusing on the size range where planets are most likely to be composed of rock and/or metal."
        },
        {
          from: "user",
          text: "So the blue area is this range?"
        },
        {
          from: "guide",
          text: "Exactly, the blue band shows size range, and coloured dots are planets whose radius fit this rocky profile."
        }
      ],
      diagramHint: "Did you know? For small rocky planets, adding mass doesn’t always increase radius much: gravity compresses them, so they get heavier without getting much bigger.",
      notes: [
        "The rocky size window here is roughly 0.5 to 1.6 times Earth’s radius.",
        "Dot size also encodes radius."
      ],
      legend: {
        sections: [
          {
            title: "Dot",
            items: [
              { type: "color", color: COLORS.rocky, label: "Rocky-size planet" },
              { type: "color", color: COLORS.grey, label: "Other planet" }
            ]
          },
          {
            title: "Area",
            items: [
              { type: "area", color: COLORS.rocky, label: "Rocky size zone" }
            ]
          }
        ]
      }
    }
  },

  // ─────────────────────────────────────────
  // SCENE 2.2 – Gravity bands with hatch texture
  // ─────────────────────────────────────────
  {
    id: "S2_2_GRAVITY",
    dataset: "planets",
    title: "How heavy would you feel?",
    filterFn: (p) =>
      p.has_data === true &&
      p.pl_rade != null &&
      p.pl_bmasse != null &&
      p.pl_g_rel != null,
    view: {
      type: "scatter",
      xVar: "pl_rade",
      yVar: "pl_bmasse",
      xLabel: "Planet Radius (R⊕)",
      yLabel: "Planet Mass (M⊕)",
      scaleConfig: {
        x: { outlierMethod: "percentile" },
        y: { outlierMethod: "percentile" }
      },
      encodings: {
        rockyWindow: { minR: 0.5, maxR: 1.6 },
        baseColor: () => COLORS.grey,
        baseOpacity: () => 0.2,
        baseSize: () => 2.5,
        color: (p) => {
          if (!p.pl_is_rocky_size) return COLORS.grey;
          const g = p.pl_g_rel;
          if (g == null) return COLORS.grey;
          if (g >= 0.5 && g <= 1.5) return COLORS.gravity;
          return COLORS.grey;
        },
        opacity: (p) => {
          if (!p.pl_is_rocky_size) return 0.2;
          const g = p.pl_g_rel;
          if (g != null && g >= 0.5 && g <= 1.5) return 0.9;
          return 0.2;
        },
        size: (p) => p.pl_rade ?? 1,
        shape: () => "circle",
        gravityZone: {
          xVar: "pl_rade",
          yVar: "pl_bmasse",
          gMin: 0.5,
          gMax: 1.5
        }
      }
    },
    sidebarContent: {
      heading: "Step 4 · Estimating surface gravity",
      chat: [
        { 
          from: "user", 
          text: "So, these are habitable planets?" },
        {
          from: "guide",
          text: "No, we still need to assess a few things. Gravity, for example, dictates how heavy you would feel on the planet."
        },
         { 
          from: "user", 
          text: "How do we define gravity?" },
        {
          from: "guide",
          text: "Earth’s gravity is defined as 1g. For humans to live comfortably, an exoplanet’s gravity should be roughly between 0.5g and 1.5g. Using mass and radius, we mark this range as the orange region."
        }
      ],
      diagramHint: "Did you know? On a low-gravity exoplanet, you could jump several meters and do slow-motion flips, but over time your bones would weaken and your muscles would shrink.",
      notes: [
        "The orange area is defined with this formula: g_rel ≈ mass_rel / radius_rel² when mass and radius are measured relative to Earth."
      ],
      legend: {
        sections: [
          {
            title: "Dot",
            items: [
              { type: "color", color: COLORS.gravity, label: "Rocky + Comfortable gravity" },
              { type: "color", color: COLORS.grey, label: "Other planet" }
            ]
          },
          {
            title: "Area",
            items: [
              { type: "area", color: COLORS.rocky, label: "Rocky size zone (0.5–1.6 R⊕)" },
              { type: "area", color: COLORS.gravity, label: "Comfortable gravity zone (0.5–1.5 g)" }
            ]
          }
        ]
      }
    }
  },

  // ─────────────────────────────────────────
  // SCENE 2.3 – Gravity vs insolation
  // ─────────────────────────────────────────
  {
    id: "S2_3_G_GRAVITY_X_INSOL",
    dataset: "planets",
    title: "Goldilocks light × comfortable gravity",
    filterFn: (p) =>
      p.has_data === true &&
      p.pl_g_rel != null &&
      p.pl_insol_merged != null,
    view: {
      type: "scatter",
      xVar: "pl_insol_merged",
      yVar: "pl_g_rel",
      xLabel: "Stellar Flux (S⊕, Earth = 1.0)",
      yLabel: "Surface Gravity (g⊕)",
      scaleConfig: {
        x: { forceLog: true, outlierMethod: "percentile" },
        y: { outlierMethod: "percentile" }
      },
      encodings: {
        hzBands: {
          optimistic: { min: 0.32, max: 1.78 },
          conservative: { min: 0.35, max: 1.04 }
        },
        gravityBand: { min: 0.5, max: 1.5 },
        baseColor: () => COLORS.grey,
        baseOpacity: () => 0.2,
        size: (p) => p.pl_rade ?? 1,
        shape: () => "circle",
        color: (p) => {
          // Must be rocky (Step 3)
          if (!p.pl_is_rocky_size) return COLORS.grey;
          // Must have comfortable gravity (Step 4)
          const g = p.pl_g_rel;
          if (g == null || g < 0.5 || g > 1.5) return COLORS.grey;
          // Must be in habitable zone (Step 5)
          const s = p.pl_insol_merged;
          if (s == null || s < 0.32 || s > 1.78) return COLORS.grey;
          // In conservative zone (0.35-1.04): green
          if (s >= 0.35 && s <= 1.04) return COLORS.habitable;
          // In optimistic only (0.32-0.35 or 1.04-1.78): pink
          return "#ec4899";
        },
        opacity: (p) => {
          if (!p.pl_is_rocky_size) return 0.2;
          const g = p.pl_g_rel;
          if (g == null || g < 0.5 || g > 1.5) return 0.2;
          const s = p.pl_insol_merged;
          if (s != null && s >= 0.32 && s <= 1.78) return 0.9;
          return 0.2;
        }
      }
    },
    sidebarContent: {
      heading: "Step 5 · Combining light and gravity",
      chat: [
        { from: "user", 
          text: "And what about temperature?" },
        {
          from: "guide",
          text: "We don't measure temperature directly. Instead, we use stellar flux, which is the amount of energy a planet receives from its star. In this new chart, the green area shows the conservative survivable range, while the pink areas show the wider optimistic range."
        },
        {
          from: "user",
          text: "So does this mean all planets in the green area are habitable?"
        },
        {
          from: "guide",
          text: "No. We also need to keep considering gravity shown on the orange area. Planets are truly habitable only where the stellar flux zones (green or pink) and orange gravity region overlap."
        },
        {
          from: "user",
          text: "What are the green and pink dots?"
        },
        {
          from: "guide",
          text: "These are rocky planets with comfortable gravity that also fall within the habitable light zones. Green dots are in the conservative zone (most likely habitable), while pink dots are in the optimistic-only zone (potentially habitable but with more uncertainty)."
        }
      ],
      diagramHint: "Stellar flux on x-axis from cold (left) to hot (right). Pink vertical bands on left and right edges show optimistic habitable zone. Darker green vertical band in middle shows conservative habitable zone. Orange horizontal band shows OK gravity range. Green and pink dots appear where zones overlap.",
      notes: [
        "Since stellar flux is only an estimate, we show both an optimistic and a conservative scenario. The lighter pink area shows the optimistic range, while the darker green area shows the conservative range."
      ],
      legend: {
        sections: [
          {
            title: "Dot",
            items: [
              { type: "color", color: COLORS.habitable, label: "Rocky + Conservative zone + Comfortable gravity" },
              { type: "color", color: "#ec4899", label: "Rocky + Optimistic zone only + Comfortable gravity" },
              { type: "color", color: COLORS.grey, label: "Other planet" }
            ]
          },
          {
            title: "Area",
            items: [
              { type: "area", color: "#ec4899", label: "Optimistic habitable light zone (0.32–1.78 S⊕)" },
              { type: "area", color: COLORS.habitable, label: "Conservative habitable light zone (0.35–1.04 S⊕)" },
              { type: "area", color: "#facc15", label: "Comfortable gravity zone (0.5–1.5 g)" }
            ]
          }
        ]
      }
    }
  },

  // ─────────────────────────────────────────
  // SCENE 3 – Galaxy with candidates + spectral colours
  // ─────────────────────────────────────────
  {
    id: "S3_GALAXY_CANDIDATES",
    dataset: "systems",
    title: "Where do our candidate systems live?",
    filterFn: (system) => system.has_data === true,
    view: {
      type: "galaxy",
      sceneId: "S3_GALAXY_CANDIDATES",
      x: (d) => {
        const angle = (d.glon || 0) * Math.PI / 180;
        const r = Math.log10((d.sy_dist || 1) + 1);
        return r * Math.cos(angle);
      },
      y: (d) => {
        const angle = (d.glon || 0) * Math.PI / 180;
        const r = Math.log10((d.sy_dist || 1) + 1);
        return r * Math.sin(angle);
      },
      encodings: {
        baseColor: "#555555",
        baseOpacity: (d) => (d.hasCandidate ? 0.05 : 0.3),
        baseSize: (d) => 2 + Math.sqrt(d.sy_pnum || 1) * 0.8,
        color: (d) => {
            if (!d.hasCandidate) return "#555555";
            
            // Get spectral type, estimate from temperature if missing
            let spectralType = d.st_spectype || "";
            if (!spectralType && d.st_teff) {
              // Estimate spectral class from effective temperature
              const temp = d.st_teff;
              if (temp >= 7500) spectralType = "F";
              else if (temp >= 5200) spectralType = "G";
              else if (temp >= 3700) spectralType = "K";
              else spectralType = "M";
            }
            
            const t = spectralType.charAt(0);
            if (t === "M") return COLORS.starM;
            if (t === "K") return COLORS.starK;
            if (t === "G") return COLORS.starG;
            if (t === "F") return COLORS.starF;
            return "#999999";  // Grey for truly unknown cases
        },
        opacity: (d) => (d.hasCandidate ? 0.95 : 0.05),
        size: (d) => {
          if (!d.hasCandidate) return 2;
          const count = d.candidateCountOptimistic || 1;
          return 4 + Math.sqrt(count) * 2;
        }
      }
    },
    sidebarContent: {
      heading: "Step 6 · Our short list of systems",
      chat: [
        { from: "user", 
          text: "After all those filters, what’s left in the galaxy?" 
        },
        {
          from: "guide",
          text: "These are all the systems that contain at least one potentially habitable exoplanet. All other systems are no longer highlighted."
        }
      ],
      diagramHint:
        "Did you know? M-type stars are the most common stars in the Milky Way, making up about 70% of all stars.",
      notes: [
        "Larger coloured stars represent systems with more candidate planets."
      ],
      legend: {
        sections: [
          {
            title: "Star",
            items: [
              { type: "color", color: COLORS.starM, label: "M – cool red dwarf" },
              { type: "color", color: COLORS.starK, label: "K – orange star" }
            ]
          },
          {
            title: "Planet",
            items: [
              { type: "color", color: "#4ade80", label: "● Conservative candidate" },
              { type: "color", color: "#ec4899", label: "● Optimistic candidate" }
            ]
          }
        ]
      }
    }
  },

  // ─────────────────────────────────────────
  // SCENE 4 – Transition to small multiples
  // ─────────────────────────────────────────
  {
    id: "S4_TRANSITION_TO_SMALL_MULTIPLES",
    dataset: "systems",
    title: "From stars to detailed portraits",
    filterFn: (system) => system.hasCandidate === true,
    view: {
      type: "transition"
    },
    sidebarContent: {
      heading: "Meet each candidate system",
      chat: [
        {
          from: "user",
          text: "What am I seeing right now?"
        },
        {
          from: "guide",
          text: "You’re looking at all the systems that contain conservative potentially habitable planets, shown in green."
        },
        {
          from: "user",
          text: "What is the purple planet?"
        },
        {
          from: "guide",
          text: "The purple planet represents Earth, so you can compare it with the exoplanets. You can see differences in orbital speed and gravity through the concentric movements inside each planet."
        },
        {
          from: "guide",
          text: "Which planet would you move to?"
        }
      ],
      diagramHint:
        "Did you know? One parsec is 3.26 light-years. Even at the speed of light, it would take 3.26 years to travel a single parsec.",
      notes: [
        "At the center of each system, the Sun morphs into that system’s star(s). Here you can see their temperature, size, and number of stars."
      ]
    }
  }
];
