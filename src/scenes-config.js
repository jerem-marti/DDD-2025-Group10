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
        baseColor: "#dddddd",
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
          text: "What are all these dots?"
        },
        {
          from: "guide",
          text: "Each dot is a star system with at least one exoplanet. The angle shows its direction in the Galaxy; distance from the center grows with how far it is from us."
        }
      ],
      diagramHint: "Polar sketch of the galaxy with two stars: one near, one far.",
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
          text: "Here each dot is a planet. Left–right is size, bottom–top is mass. Tiny rocks bottom-left, giant gas worlds top-right."
        },
        {
          from: "guide",
          text: "If you are curious: the axes use Earth units. A value of 1 on each axis corresponds to Earth’s radius or mass."
        }
      ],
      diagramHint: "Plane with labels: small/light vs giant planets, Earth marked in between.",
      notes: [
        "The x-axis is planet radius in Earth radii (R⊕).",
        "The y-axis is planet mass in Earth masses (M⊕).",
        "No habitability filters yet - just the full diversity of known planets."
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
          text: "How do we spot rocky worlds in all these points?"
        },
        {
          from: "guide",
          text: "We focus on planets in a rocky size range, where they are more likely to be made of rock and metal instead of mostly gas."
        },
        {
          from: "guide",
          text: "The blue band shows that size range in radius, and coloured dots are planets whose mass and radius fit this rocky profile."
        }
      ],
      diagramHint: "Size line: Mars → Earth → Super-Earth → Neptune, rocky range highlighted.",
      notes: [
        "Rocky planets are coloured; others stay greyed out.",
        "Dot size also encodes radius.",
        "The rocky size window here is roughly 0.5 to 1.6 times Earth’s radius."
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
              { type: "area", color: COLORS.rocky, label: "Rocky size zone (0.5–1.6 R⊕)" }
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
        { from: "user", text: "Earth-size ≠ Earth-gravity, right?" },
        {
          from: "guide",
          text: "Right. For the same radius, more mass means stronger gravity. We use mass and radius to estimate how heavy you would feel."
        },
        {
          from: "guide",
          text: "If you are curious: in Earth units we approximate surface gravity as g_rel ≈ mass_rel / radius_rel²."
        }
      ],
      diagramHint: "Three circles with sparse, medium, dense hatch labelled low / ok / high g.",
      notes: [
        "Coloured points are rocky planets whose estimated surface gravity is between about 0.5 and 1.5 times Earth’s gravity.",
        "The diagonal band in the background shows where mass and radius combine to give that comfortable gravity.",
        "Formula hint: g_rel ≈ mass_rel / radius_rel² when mass and radius are measured relative to Earth."
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
          return COLORS.habitable;  // Meets all criteria
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
        { from: "user", text: "Where do Earth-like conditions appear?" },
        {
          from: "guide",
          text: "Left is frozen, right is scorched; up and down is gravity. Green dots in the central band are rocky planets with Earth-like light and human-friendly gravity."
        },
        {
          from: "guide",
          text: "If you are curious: insolation compares how much star energy hits the planet to Earth. A simple estimate is S_rel ≈ (L_star / L_sun) / (distance / 1 AU)²."
        }
      ],
      diagramHint: "Blue–green–orange x-axis, horizontal gravity ok band, green rectangle in the middle.",
      notes: [
        "Green dots are planets that are rocky, in the habitable light zone and in the comfortable gravity band.",
        "Other planets remain in the background as grey context."
      ],
      legend: {
        sections: [
          {
            title: "Dot",
            items: [
              { type: "color", color: COLORS.habitable, label: "Rocky + Habitable light + Comfortable gravity" },
              { type: "color", color: COLORS.grey, label: "Other planet" }
            ]
          },
          {
            title: "Area",
            items: [
              { type: "area", color: COLORS.habitable, label: "Habitable light zone (0.32–1.78 S⊕)" },
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
        { from: "user", text: "After all those filters, what’s left?" },
        {
          from: "guide",
          text:
            "Each coloured star hosts at least one promising planet. The colour now shows star type: red M-dwarfs, orange K-stars, yellow G-stars like the Sun, pale blue F-stars."
        }
      ],
      diagramHint:
        "One coloured star with several candidate planets drawn around it, plus a legend of star colours (M/K/G/F).",
      notes: [
        "Only systems with at least one candidate planet are highlighted; other systems fade into the background.",
        "Larger coloured stars represent systems with more candidate planets.",
        "These are the systems that will each become a card in the final small-multiples view.",
        "Colour encodes star type, from cool red M-dwarfs to hotter pale blue F-stars."
      ],
      legend: {
        sections: [
          {
            title: "Star",
            items: [
              { type: "color", color: COLORS.starM, label: "M – cool red dwarf" },
              { type: "color", color: COLORS.starK, label: "K – orange star" },
              { type: "color", color: COLORS.starG, label: "G – Sun-like (yellow)" },
              { type: "color", color: COLORS.starF, label: "F – hotter (pale blue)" }
            ]
          },
          {
            title: "Planet",
            items: [
              { type: "color", color: "#4ade80", label: "● Conservative candidate" },
              { type: "color", color: "#22d3ee", label: "● Optimistic candidate" }
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
          text: "Can we see more details on these systems?"
        },
        {
          from: "guide",
          text:
            "Yes. Each coloured star now turns into a card. In each card, the central star slowly morphs into our Sun and back, the orbits compare Earth’s year to the candidate planet’s year, and pulsing rings inside the planets show how strong gravity feels there compared to Earth. Let’s switch to this detailed view."
        }
      ],
      diagramHint:
        "Galaxy dots fading into a grid of cards. One card is enlarged, showing a star ↔ Sun morph, two orbits (Earth and the candidate planet) and pulsing rings for gravity.",
      notes: [
        "When this scene is active, the galaxy view can fade into the background while the small-multiples grid appears.",
        "Inside each card: the star morphs between the system’s star and our Sun, so you can compare colour and size.",
        "Two orbits are shown: one for Earth and one for the conservative candidate planet, with orbital speed based on their periods.",
        "Pulsing rings inside Earth and the candidate planet encode surface gravity relative to Earth."
      ]
    }
  }
];
