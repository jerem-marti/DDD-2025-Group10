### DDD-2025-Group10
Jérémy Martin; Artem Sadoviy; Nicholas Vos

# Goldilocks Worlds

### Visualisation

![Prototype screenshot](/resources/Visualisation.jpeg)

#### Link to the prototype or website
https://jerem-marti.github.io/DDD-2025-Group10/


### Abstract
This project explores which known exoplanets could be viable homes for humans. Using the NASA Exoplanet Archive, we filter the composite PSCompPars table to find planets that are roughly Earth-sized, receive an Earth-like amount of stellar energy and orbit “normal” stars. Where insolation is missing, we reconstruct it from stellar luminosity and orbital parameters, and compute surface gravity from mass and radius. The resulting subset is visualised as small multiples, comparing “Goldilocks” worlds across star types and distances from Earth.

---

### Protocol Diagram
#### Indian Journey

![Prototype screenshot](/resources/Diagram_indian.svg)
![Prototype screenshot](/resources/Diagram_indian.svg)

---

### What topic does the project address?

The project investigates how we can define and visualise “human-habitable” exoplanets using astrophysical data. Instead of focusing on purely speculative alien life, we restrict ourselves to planets that could plausibly host humans: rocky, with Earth-like stellar flux, orbiting long-lived stars and with surface gravity in a tolerable range. The visualisation treats the NASA exoplanet catalogue as a cultural artefact: we compare these “Goldilocks” worlds to Earth and to each other, across different star types and distances from our solar system.

---

### What data have you considered?

We work exclusively with the NASA Exoplanet Archive, specifically the **PSCompPars** (Planetary Systems Composite Parameters) table. PSCompPars is a composite table with one row per confirmed exoplanet and a more complete, though not always perfectly self-consistent, set of parameters, designed for statistical studies of the exoplanet population.

Format:

* Exported as **CSV** from the archive interface.
* Each row corresponds to a confirmed exoplanet.
* Columns include planetary, stellar and system parameters as well as our own derived fields.

**Key original columns used**

* **Planet identity and system context**

  * `pl_name`: planet name
  * `hostname`: host star name
  * `sy_snum`: number of stars in the system
  * `sy_pnum`: number of planets in the system
  * `cb_flag`: circumbinary flag

* **Planet physical properties**

  * `pl_rade`: radius in Earth radii
  * `pl_bmasse`: mass in Earth masses
  * `pl_dens`: bulk density (sanity check for rocky composition)
  * `pl_insol`: insolation flux in Earth units (when available)
  * `pl_eqt`: equilibrium temperature
  * `pl_orbper`: orbital period (days)
  * `pl_orbsmax`: semi major axis (AU)
  * `pl_orbeccen`: orbital eccentricity

* **Stellar environment**

  * `st_lum`: stellar luminosity (log L/L⊙)
  * `st_mass`: stellar mass (M⊙)
  * `st_teff`: effective temperature (K)
  * `st_spectype`: spectral type (used for grouping and labels)
  * `st_age`: stellar age (optional context)
  * `st_met`, `st_metratio`: metallicity (optional context)

* **Observational context**

  * `sy_dist`: distance from Earth (pc)
  * `tran_flag`, `rv_flag`, `ima_flag`, `micro_flag`: detection method flags
  * `discoverymethod`: discovery method label
  * `disc_year`: discovery year
  * `disc_facility`, `disc_telescope`: mission and telescope names

**Derived columns created in this project**

To make the dataset usable for a “human-habitable” filter, we create:

* `pl_insol_est`: reconstructed insolation when `pl_insol` is missing. We use stellar luminosity (`st_lum`) and orbital distance (`pl_orbsmax`), or, if needed, orbital period (`pl_orbper`) and stellar mass (`st_mass`) via Kepler’s third law and the inverse-square law for flux, consistent with habitable-zone work that uses stellar flux rather than equilibrium temperature as the main variable.
* `pl_insol_merged`: final insolation value used for filtering, equal to `pl_insol` if present, otherwise `pl_insol_est`.
* `pl_insol_source`: provenance flag (`archive`, `estimated`, `missing`).
* `pl_g_rel`: surface gravity relative to Earth, computed as `pl_bmasse / pl_rade^2`.
* `pl_g_band`: gravity band category (`low`, `ok`, `high`, `unknown`) to summarise “human comfort”.

We also add boolean flags for each criterion:

* `pl_is_rocky_size` – radius in a “rocky” range (0.5–1.6 R⊕ or similar), inspired by the **Habitable Worlds Catalog** (ex Habitable Exoplanets Catalog) conservative sample.
* `pl_in_optimistic_habitable-zone-insolation` – insolation between 0.32 and 1.78 S⊕ (optimistic habitable zone).
* `pl_in_conservative_habitable-zone-insolation` – insolation between 0.35 and 1.04 S⊕ (conservative habitable zone).
* `st_2600–7200K` – host star effective temperature between 2600 and 7200 K, corresponding roughly to main-sequence M to F stars.
* `pl_is_gravity_comfortable` – surface gravity between 0.5 and 1.5 g, a design band informed by studies on human adaptation to altered gravity and hypotheses on maximum long-term tolerable gravity.
* `has_data` – all key parameters for filtering (radius, insolation_merged, Teff, gravity) are present.
* `pl_is_optimistic_candidate` – planet passes all criteria for the optimistic sample (rocky size, optimistic HZ, good star temperature, comfortable gravity, has_data).
* `pl_is_conservative_candidate` – same, but with conservative HZ limits.

These columns turn the scientific catalogue into a more legible dataset for visualisation and for discussing “human-habitable” worlds.


![Dataset overview](/resources/Schermata.png)

#### Link to the dataset

NASA Exoplanet Archive – Planetary Systems Composite Parameters (PSCompPars) table:
[https://exoplanetarchive.ipac.caltech.edu/](https://exoplanetarchive.ipac.caltech.edu/)

---

### What does the visualisation show?

The visualization is designed to bring the user through a journey on identifying habitable hexoplanets starting from step 1 where known planets in our galaxy are presented all the way through step 7 where the most habitable planet are shown and are compared to Earth.

Three key readings:

* **Shortlist of “Goldilocks” worlds**
  By combining radius, insolation, stellar temperature and surface gravity, we build “optimistic” and “conservative” sets of candidate planets. Among all 6 thousand planets, only 12 conservative planets would be suitable for human life.

* **Diversity across star types and distances**
  Panels can be grouped by host star class (for example M, K, G, F) and by distance from Earth. This reveals how our best candidates are distributed in terms of stellar environment and proximity, and highlights the trade-off between habitability and observability.

* **Comparison with Earth and human comfort**
  Each panel includes Earth as a visual reference. Planet markers encode surface gravity and insolation, making it easy to see which worlds are too light, too heavy, too cold or too hot for long-term human life, even if they lie inside the classical habitable zone defined by stellar flux.

---

### Sources and references

| Source | Type | Role in project |
| ------ | ---- | ----------------|
| [NASA Exoplanet Archive – PS and PSCompPars documentation](https://exoplanetarchive.ipac.caltech.edu/docs/pscp_about.html) | Official database documentation | Explains the difference between the Planetary Systems (ps) and Planetary Systems Composite Parameters (PSCompPars) tables and why PSCompPars is recommended for statistical work. Justifies switching from PS to PSCompPars and using its parameters as our core dataset. |
| [NASA Exoplanet Archive – PSCompPars web table](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=PSCompPars) | Data table | Primary source of planetary and stellar parameters (radius, mass, insolation, Teff, luminosity, etc.). All rows in our project come from this table, exported as CSV. |
| [Kopparapu et al., “Habitable Zones around Main-Sequence Stars: New Estimates”](https://ui.adsabs.harvard.edu/abs/2013ApJ...765..131K/abstract) | Scientific paper on habitable zones | Provides updated habitable-zone flux limits in units of Earth’s insolation: early Mars (~0.32), maximum greenhouse (~0.35), runaway greenhouse (~1.04), recent Venus (~1.78). We use these as conservative and optimistic insolation boundaries. |
| [NASA – “The Habitable Zone”](https://science.nasa.gov/exoplanets/habitable-zone/) | Outreach science page | Defines the habitable zone as the region around a star where liquid water could exist on a planet’s surface and introduces the “Goldilocks zone” metaphor used in our framing. |
| [Planetary Habitability Laboratory – Habitable Exoplanets Catalog / Habitable Worlds Catalog](https://phl.upr.edu/hec) | Catalog of potentially habitable exoplanets | Provides example criteria for rocky, potentially habitable planets (e.g. 0.5 < R ≤ 1.6 R⊕ or 0.1 < M ≤ 3 M⊕) and for conservative vs optimistic samples. Inspires our rocky size cut and the idea of separate optimistic and conservative candidate sets. |
| [Rushby et al. 2013 – “Habitable Zone Lifetimes of Exoplanets around Main Sequence Stars”](https://journals.sagepub.com/doi/10.1089/ast.2012.0938) and [Gillmann et al. 2024 – “Interior Controls on the Habitability of Rocky Planets”](https://arxiv.org/abs/2403.17630) | Scientific reviews | Give broader context on planetary habitability and the time evolution of habitable zones around main-sequence stars. Support our focus on main-sequence F–M stars and on long-term habitability rather than instantaneous conditions. |
| [Goswami 2021 – “Human physiology adaptation to altered gravity environments”](https://www.sciencedirect.com/science/article/pii/S0094576521004434) and [Levenson 2023 – “The Maximum Tolerable Gravity for Human Colonies”](https://bis-space.com/shop/product/jbis-076-08-0279/) | Scientific and technical literature on gravity tolerance | Inform our design choice of a “comfortable” gravity band for humans roughly between 0.5 g and 1.5 g, acknowledging that very low gravity leads to deconditioning and high gravity challenges cardiovascular and musculoskeletal systems over long timescales. |
| [High-G centrifuge training and G-tolerance references](https://indjaerospacemed.com/high-g-centrifuge-training/) | Applied physiology / reference | Provide intuitive ranges and examples of human performance at different G-levels (pilots, centrifuge tests), reinforcing that sustained gravities significantly above 1 g quickly become problematic, which supports our upper bound choice. |

