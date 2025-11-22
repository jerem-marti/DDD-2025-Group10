// tests/data-loader.test.js
import { describe, it, expect } from "vitest";
import { loadData } from "../data-loader.js";

describe("loadData", () => {
  it("loads planets and systems via fetchFn", async () => {
    const fakePlanets = [{ pl_name: "Test b" }];
    const fakeSystems = [{ hostname: "Test star" }];

    const mockFetch = async (url) => {
      if (url.includes("planets.json")) {
        return {
          ok: true,
          json: async () => fakePlanets
        };
      }
      if (url.includes("systems.json")) {
        return {
          ok: true,
          json: async () => fakeSystems
        };
      }
      return { ok: false, status: 404 };
    };

    const { planets, systems } = await loadData(mockFetch);

    expect(planets).toEqual(fakePlanets);
    expect(systems).toEqual(fakeSystems);
  });

  it("throws if planets.json fails", async () => {
    const mockFetch = async (url) => ({
      ok: false,
      status: 500
    });

    await expect(loadData(mockFetch)).rejects.toThrow(/Failed to load planets\.json/);
  });
});
