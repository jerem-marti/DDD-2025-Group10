// src/data-loader.js

/**
 * Load planets and systems JSON from /data/.
 * @param {typeof fetch} fetchFn - optional custom fetch for testing
 */
export async function loadData(fetchFn = fetch) {
  const [planetsRes, systemsRes] = await Promise.all([
    fetchFn("/data/planets.json"),
    fetchFn("/data/systems.json")
  ]);

  if (!planetsRes.ok) {
    throw new Error(`Failed to load planets.json: ${planetsRes.status}`);
  }
  if (!systemsRes.ok) {
    throw new Error(`Failed to load systems.json: ${systemsRes.status}`);
  }

  const [planets, systems] = await Promise.all([
    planetsRes.json(),
    systemsRes.json()
  ]);

  // Optional: small sanity checks
  return {
    planets: Array.isArray(planets) ? planets : [],
    systems: Array.isArray(systems) ? systems : []
  };
}
