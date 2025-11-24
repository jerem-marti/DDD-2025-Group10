// src/sources.js
// Scientific sources and citations for each step

export const sources = {
  "S1_GALAXY_CONTEXT": [
    {
      id: "pscomp_about",
      author: "NASA",
      shortLabel: "NASA Exoplanet Archive – About the PSCompPars table",
      url: "https://exoplanetarchive.ipac.caltech.edu/docs/pscp_about.html",
      whatItSays: "Explains that the Planetary Systems Composite Parameters (PSCompPars) table contains one row per confirmed planet, combining measurements and calculated values from multiple references into a single, more complete parameter set.",
      whyWeUseIt: "Justifies using PSCompPars instead of the raw PS table for this project, because we need a single, filled-in set of parameters per planet for statistical views and visualisation."
    },
    {
      id: "ps_vs_pscomp",
      author: "NASA",
      shortLabel: "NASA Exoplanet Archive – PS vs PSCompPars",
      url: "https://exoplanetarchive.ipac.caltech.edu/docs/transition.html",
      whatItSays: "Describes how the PS table lists all published parameter sets for planets, while PSCompPars merges them into one composite set, and explicitly recommends PSCompPars when users need a more complete table for population studies.",
      whyWeUseIt: "Supports our choice to aggregate and visualise the whole exoplanet population using PSCompPars, and explains to users why each dot in the galaxy view corresponds to one composite system."
    },
    {
      id: "ps_columns",
      author: "NASA",
      shortLabel: "NASA Exoplanet Archive – PS / PSCompPars column definitions",
      url: "https://exoplanetarchive.ipac.caltech.edu/docs/API_PSCompPars_columns.html",
      whatItSays: "Lists and defines the table columns (sy_dist, glon, sy_snum, sy_pnum, etc.) used in the Planetary Systems tables, including units and meaning.",
      whyWeUseIt: "Provides the official definitions for the positional and system-level fields used in the polar galaxy map (galactic longitude, distance, number of stars/planets per system)."
    }
  ],
  "S2_0_PLANETS_RAW": [
    {
      id: "pscomp_about_reused",
      author: "NASA",
      shortLabel: "NASA Exoplanet Archive – PSCompPars data",
      url: "https://exoplanetarchive.ipac.caltech.edu/docs/pscp_about.html",
      whatItSays: "Clarifies that PSCompPars provides planet mass and radius in Earth units when available, and that some missing values are estimated using empirical relations.",
      whyWeUseIt: "Explains why we have enough pl_rade and pl_bmasse values to build a mass–radius scatter plot, and why some points are based on calculated rather than directly observed parameters."
    },
    {
      id: "phl_hec_overview",
      author: "PHL",
      shortLabel: "PHL – Habitable Exoplanets Catalog (overview)",
      url: "https://phl.upr.edu/projects/habitable-exoplanets-catalog",
      whatItSays: "Introduces the Habitable Exoplanets Catalog and its focus on terrestrial-size planets, often using rough size bands to separate rocky planets from mini-Neptunes and gas giants.",
      whyWeUseIt: "Gives context for talking about 'small rocky' vs 'giant gas' planets in the mass–radius plot, and anticipates the later rocky-size filter without applying it yet."
    }
  ],
  "S2_1_ROCKY_SIZE": [
    {
      id: "phl_rocky_criteria",
      author: "PHL",
      shortLabel: "PHL – Habitable Exoplanets Catalog / rocky planet criteria",
      url: "https://phl.upr.edu/projects/habitable-exoplanets-catalog",
      whatItSays: "Uses thresholds like ≤1.6 Earth radii and ≤3 Earth masses for a conservative rocky sample and ≤2.5 R⊕ / ≤10 M⊕ for a broader 'potentially habitable' sample.",
      whyWeUseIt: "Inspires our radius-based rockiness cut (roughly 0.5–1.6 R⊕) and our decision to treat mass as optional: size is the primary criterion for calling a planet 'rocky-size'."
    },
    {
      id: "wiki_potentially_habitable",
      author: "Wikipedia",
      shortLabel: "General habitability criteria (e.g. 0.5–1.5 R⊕, 0.1–5 M⊕)",
      url: "https://en.wikipedia.org/wiki/List_of_potentially_habitable_exoplanets",
      whatItSays: "Summarises typical ranges used in the literature to define potentially habitable terrestrial planets, such as 0.5–1.5 Earth radii and 0.1–5 Earth masses, and distinguishes terrestrial from gaseous worlds.",
      whyWeUseIt: "Supports our choice of a relatively narrow 'rocky-size' window and gives a recognisable reference for visitors who have seen similar criteria in popular science articles."
    }
  ],
  "S2_2_GRAVITY": [
    {
      id: "surface_gravity_basic",
      author: "Wikipedia",
      shortLabel: "Basic physics of surface gravity (g ∝ M/R²)",
      url: "https://en.wikipedia.org/wiki/Surface_gravity",
      whatItSays: "Shows that surface gravity scales directly with mass and inversely with the square of radius, allowing gravity to be expressed in units of Earth-g from planetary mass and radius.",
      whyWeUseIt: "Justifies our computed gravity column g_rel = pl_bmasse / pl_rade² and explains why this is the most relevant quantity for 'how heavy you would feel' on a planet."
    },
    {
      id: "levenson_max_gravity",
      author: "Levenson 2023",
      shortLabel: "Levenson 2023 – Maximum tolerable gravity for human colonies",
      url: "https://bis-space.com/shop/product/jbis-076-08-0279/",
      whatItSays: "Argues, using engineering and physiological considerations, that long-term human settlements would struggle much above roughly 1.5–2 g, suggesting an upper bound for sustainable gravity.",
      whyWeUseIt: "Anchors the high end of our 'comfortable gravity' band and supports treating gravities significantly above 1.5 g as problematic for permanent human habitation."
    },
    {
      id: "goswami_altered_gravity",
      author: "Goswami 2021",
      shortLabel: "Goswami 2021 – Human physiology adaptation to altered gravity",
      url: "https://www.sciencedirect.com/science/article/pii/S0094576521001094",
      whatItSays: "Reviews how the cardiovascular and musculoskeletal systems respond to both microgravity and hypergravity and highlights the health issues that appear when gravity is far from 1 g for extended periods.",
      whyWeUseIt: "Supports the idea that very low gravity (<0.5 g) leads to severe deconditioning, while sustained hypergravity (>1.5 g) imposes serious physiological stress, which motivates our 0.5–1.5 g 'comfort band'."
    },
    {
      id: "nasa_body_in_space",
      author: "NASA",
      shortLabel: "NASA – The Human Body in Space",
      url: "https://science.nasa.gov/learn/basics-of-space-flight/chapter-13-the-human-body-in-space/",
      whatItSays: "Describes how microgravity causes bone loss, muscle atrophy and cardiovascular changes in astronauts, even with exercise and countermeasures.",
      whyWeUseIt: "Provides accessible background for visitors on why long-term low-gravity environments are unhealthy and why we prefer planets with gravity not too far below Earth's."
    },
    {
      id: "high_g_centrifuge_training",
      author: "IJASM",
      shortLabel: "High G Centrifuge Training – Indian Journal of Aerospace Medicine",
      url: "https://indjaerospacemed.com/high-g-centrifuge-training/",
      whatItSays: "Reports on fighter-pilot centrifuge training, where humans can briefly tolerate extreme accelerations (up to 9 g) but only for seconds and with specialised techniques and equipment.",
      whyWeUseIt: "Helps communicate that short-term tolerance of high g is very different from comfortable day-to-day living, reinforcing why our long-term 'human-friendly' gravity band is much narrower (0.5–1.5 g)."
    }
  ],
  "S2_3_G_GRAVITY_X_INSOL": [
    {
      id: "kopparapu_hz",
      author: "Kopparapu 2013",
      shortLabel: "Kopparapu et al. 2013 – Habitable Zones Around Main-Sequence Stars",
      url: "https://ui.adsabs.harvard.edu/abs/2013ApJ...765..131K/abstract",
      whatItSays: "Provides updated climate-model calculations for habitable zones, giving flux boundaries in Earth units such as early Mars (~0.32 S⊕), maximum greenhouse (~0.35), runaway greenhouse (~1.04) and recent Venus (~1.78).",
      whyWeUseIt: "Defines our conservative (0.35–1.04 S⊕) and optimistic (0.32–1.78 S⊕) habitable-zone flux ranges, which we apply to pl_insol_merged when filtering candidate planets."
    },
    {
      id: "nasa_habitable_zone",
      author: "NASA",
      shortLabel: "NASA – The Habitable Zone ('Goldilocks zone')",
      url: "https://science.nasa.gov/exoplanets/what-is-the-habitable-zone/",
      whatItSays: "Explains for a broad audience that a star's habitable zone is the region where a planet could keep liquid water on its surface, often called the 'Goldilocks zone' where it's not too hot and not too cold.",
      whyWeUseIt: "Provides plain-language support for the narrative around our insolation filters and the idea that we are looking for 'just right' levels of starlight, not simply Earth clones."
    },
    {
      id: "hz_lifetimes",
      author: "Rushby 2013",
      shortLabel: "Habitable Zone Lifetimes of Exoplanets around Main-Sequence Stars",
      url: "https://journals.sagepub.com/doi/10.1089/ast.2012.0955",
      whatItSays: "Discusses how long different types of main-sequence stars keep planets within their habitable zones, emphasising that cooler, longer-lived stars can offer longer stable habitable periods.",
      whyWeUseIt: "Motivates our focus on main-sequence F–M stars and our Teff cut (roughly 2600–7200 K) when interpreting which habitable-zone planets are interesting for long-term habitability."
    },
    {
      id: "pscp_calculations_insol",
      author: "NASA",
      shortLabel: "PSCompPars – How the archive calculates composite values",
      url: "https://exoplanetarchive.ipac.caltech.edu/docs/pscp_calculations.html",
      whatItSays: "Describes how the NASA Exoplanet Archive derives composite parameters like stellar luminosity and insolation for PSCompPars, including the use of L*/a² and Kepler's third law when necessary.",
      whyWeUseIt: "Supports our own approach to filling missing pl_insol values using st_lum and orbital distance, and explains to users why some insolation values are estimated rather than directly published."
    }
  ],
  "S3_GALAXY_CANDIDATES": [
    {
      id: "ps_columns_stellar",
      author: "NASA",
      shortLabel: "PS / PSCompPars stellar columns (st_teff, st_spectype)",
      url: "https://exoplanetarchive.ipac.caltech.edu/docs/API_PSCompPars_columns.html",
      whatItSays: "Defines stellar properties such as effective temperature, luminosity and spectral type for host stars, with units and typical ranges.",
      whyWeUseIt: "Provides the official definitions for the stellar parameters used to colour stars by type (M/K/G/F) and to filter out very unusual stars when building the short list."
    },
    {
      id: "interior_controls_habitability",
      author: "Barnes 2012",
      shortLabel: "Barnes et al. – Interior Controls on the Habitability of Rocky Planets",
      url: "https://arxiv.org/abs/1209.4011",
      whatItSays: "Reviews how planetary interiors, stellar type and long-term energy balance affect the habitability of rocky planets, and discusses the special challenges of planets around very cool or very hot stars.",
      whyWeUseIt: "Gives scientific backing for distinguishing between cool M-dwarfs, K/G Sun-like stars and hotter F-stars when discussing which candidate systems might be more promising for long-term human habitats."
    },
    {
      id: "hz_lifetimes_reused",
      author: "Rushby 2013",
      shortLabel: "Habitable Zone Lifetimes (reused)",
      url: "https://journals.sagepub.com/doi/10.1089/ast.2012.0955",
      whatItSays: "Highlights that different spectral types offer different habitable-zone lifetimes, with long-lived K and M stars potentially offering very stable environments.",
      whyWeUseIt: "Supports the explanation that not all coloured stars in our short list are equal: some types may offer more stable habitable conditions over billions of years."
    }
  ],
  "S4_TRANSITION_TO_SMALL_MULTIPLES": [
    {
      id: "ps_columns_orbits",
      author: "NASA",
      shortLabel: "PS / PSCompPars orbital columns (pl_orbper, pl_orbsmax, pl_orbeccen)",
      url: "https://exoplanetarchive.ipac.caltech.edu/docs/API_PSCompPars_columns.html",
      whatItSays: "Defines orbital period, semi-major axis and eccentricity for planets in the composite table, including units and uncertainty fields.",
      whyWeUseIt: "Supplies the orbital parameters we use to draw the candidate planet's orbit, set the animation speed, and distinguish more circular vs more eccentric orbits in each card."
    },
    {
      id: "ps_columns_stellar_radius_luminosity",
      author: "NASA",
      shortLabel: "PS / PSCompPars stellar radius and luminosity",
      url: "https://exoplanetarchive.ipac.caltech.edu/docs/API_PSCompPars_columns.html",
      whatItSays: "Defines stellar luminosity (st_lum, in log10 L⊙) and stellar radius (st_rad, in solar radii), as well as their uncertainties.",
      whyWeUseIt: "Allows us to scale the star's apparent size and brightness in each small multiple and to animate the morph between the host star and our Sun using physically meaningful values."
    },
    {
      id: "phl_hec_reused",
      author: "PHL",
      shortLabel: "PHL – Habitable Exoplanets Catalog (candidate lists)",
      url: "https://phl.upr.edu/projects/habitable-exoplanets-catalog",
      whatItSays: "Publishes curated lists of conservative and optimistic potentially habitable exoplanets, based on similar criteria to ours (rocky size, habitable-zone flux, stellar type).",
      whyWeUseIt: "Provides an external reference that there are on the order of tens of 'conservative' candidate systems, making a small-multiples grid of around a dozen systems a reasonable and interpretable final view."
    }
  ]
};
