// preprocess.js
// Usage: node preprocess.js exoplanets.csv

import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";

// ---------- helpers ----------

const toNumber = (value) => {
  if (value === undefined || value === null) return null;
  const v = String(value).trim();
  if (v === "" || v.toLowerCase() === "nan") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const toInt = (value) => {
  const n = toNumber(value);
  return n === null ? null : Math.round(n);
};

const toBool = (value) => {
  if (value === undefined || value === null) return false;
  const v = String(value).trim().toLowerCase();
  return v === "true" || v === "t" || v === "1" || v === "yes";
};

// normalize weird header name for JS
const normalizeStTempFlag = (row) => {
  const raw = row["st_2600–7200K"] ?? row["st_2600-7200K"] ?? row["st_2600_7200K"];
  return toBool(raw);
};

// ---------- input & parse ----------

const inputCsvPath = process.argv[2] || "exoplanets.csv";
const csvText = readFileSync(inputCsvPath, "utf8");

const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
});

// ---------- pass 1: build planets + aggregate systems ----------

const systemsMap = new Map();
const planets = [];

for (const row of records) {
  // Build planet object (typed)
  const planet = {
    pl_name: row.pl_name || null,
    hostname: row.hostname || null,

    sy_snum: toInt(row.sy_snum),
    sy_pnum: toInt(row.sy_pnum),
    cb_flag: toBool(row.cb_flag),

    pl_rade: toNumber(row.pl_rade),
    pl_bmasse: toNumber(row.pl_bmasse),
    pl_dens: toNumber(row.pl_dens),
    pl_g_rel: toNumber(row.pl_g_rel),
    pl_g_band: row.pl_g_band || null,

    pl_insol: toNumber(row.pl_insol),
    pl_insol_est: toNumber(row.pl_insol_est),
    pl_insol_merged: toNumber(row.pl_insol_merged),
    pl_insol_source: row.pl_insol_source || null,

    pl_eqt: toNumber(row.pl_eqt),
    pl_orbper: toNumber(row.pl_orbper),
    pl_orbsmax: toNumber(row.pl_orbsmax),
    pl_orbeccen: toNumber(row.pl_orbeccen),

    st_lum: toNumber(row.st_lum),
    st_mass: toNumber(row.st_mass),
    st_rad: toNumber(row.st_rad),
    st_teff: toNumber(row.st_teff),
    st_spectype: row.st_spectype || null,
    st_age: toNumber(row.st_age),
    st_met: toNumber(row.st_met),
    st_metratio: row.st_metratio || null,

    sy_dist: toNumber(row.sy_dist),
    glon: toNumber(row.glon),

    tran_flag: toBool(row.tran_flag),
    rv_flag: toBool(row.rv_flag),
    ima_flag: toBool(row.ima_flag),
    micro_flag: toBool(row.micro_flag),

    discoverymethod: row.discoverymethod || null,
    disc_year: toInt(row.disc_year),
    disc_facility: row.disc_facility || null,
    disc_telescope: row.disc_telescope || null,

    pl_is_rocky_size: toBool(row.pl_is_rocky_size),
    pl_in_optimistic_habitable_zone_insolation: toBool(
      row["pl_in_optimistic_habitable-zone-insolation"]
    ),
    pl_in_conservative_habitable_zone_insolation: toBool(
      row["pl_in_conservative_habitable-zone-insolation"]
    ),

    st_2600_7200K: normalizeStTempFlag(row),

    pl_is_gravity_comfortable: toBool(row.pl_is_gravity_comfortable),
    has_data: toBool(row.has_data),

    pl_is_optimistic_candidate: toBool(row.pl_is_optimistic_candidate),
    pl_is_conservative_candidate: toBool(row.pl_is_conservative_candidate),
  };

  planets.push(planet);

  // -------- aggregate into systems --------
  if (!planet.hostname) continue;

  let system = systemsMap.get(planet.hostname);
  if (!system) {
    system = {
      hostname: planet.hostname,

      sy_snum: planet.sy_snum,
      sy_pnum: planet.sy_pnum,
      cb_flag: planet.cb_flag,

      st_spectype: planet.st_spectype,
      st_teff: planet.st_teff,
      st_mass: planet.st_mass,
      st_rad: planet.st_rad,
      st_lum: planet.st_lum,
      st_age: planet.st_age,
      st_met: planet.st_met,
      st_metratio: planet.st_metratio,

      sy_dist: planet.sy_dist,
      glon: planet.glon,

      has_data: planet.has_data,

      hasCandidate: false,
      candidateCountOptimistic: 0,
      candidateCountConservative: 0,
      candidatePlanets: [],
    };

    systemsMap.set(planet.hostname, system);
  }

  // System-level has_data can be OR of all planets
  system.has_data = system.has_data || planet.has_data;

  const isOpt = planet.pl_is_optimistic_candidate;
  const isCons = planet.pl_is_conservative_candidate;
  const isAnyCandidate = isOpt || isCons;

  if (isAnyCandidate) {
    system.hasCandidate = true;
    if (isOpt) system.candidateCountOptimistic += 1;
    if (isCons) system.candidateCountConservative += 1;

    system.candidatePlanets.push({
      pl_name: planet.pl_name,
      pl_rade: planet.pl_rade,
      pl_bmasse: planet.pl_bmasse,
      pl_g_rel: planet.pl_g_rel,
      pl_insol_merged: planet.pl_insol_merged,
      pl_eqt: planet.pl_eqt,
      pl_orbsmax: planet.pl_orbsmax,
      pl_orbper: planet.pl_orbper,
      pl_is_optimistic_candidate: isOpt,
      pl_is_conservative_candidate: isCons,
    });
  }
}

// ---------- output ----------

const outDir = join(process.cwd(), "public", "data");
mkdirSync(outDir, { recursive: true });

const planetsOut = join(outDir, "planets.json");
const systemsOut = join(outDir, "systems.json");

writeFileSync(planetsOut, JSON.stringify(planets, null, 2), "utf8");
writeFileSync(
  systemsOut,
  JSON.stringify(Array.from(systemsMap.values()), null, 2),
  "utf8"
);

console.log(`Wrote ${planets.length} planets to ${planetsOut}`);
console.log(`Wrote ${systemsMap.size} systems to ${systemsOut}`);
