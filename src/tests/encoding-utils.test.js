// src/tests/encoding-utils.test.js
import { describe, it, expect } from 'vitest';
import {
  densityAlpha,
  adaptivePointSize,
  formatNumber,
  getQuantiles,
  categoricalColors
} from '../encoding-utils.js';

describe('encoding-utils', () => {
  describe('densityAlpha', () => {
    it('should return base alpha for small datasets', () => {
      expect(densityAlpha(50, 0.8)).toBe(0.8);
      expect(densityAlpha(99, 0.8)).toBe(0.8);
    });

    it('should reduce alpha for larger datasets', () => {
      expect(densityAlpha(200, 0.8)).toBeLessThan(0.8);
      expect(densityAlpha(1000, 0.8)).toBeLessThan(densityAlpha(200, 0.8));
      expect(densityAlpha(10000, 0.8)).toBeLessThan(densityAlpha(1000, 0.8));
    });
  });

  describe('adaptivePointSize', () => {
    it('should return larger sizes for sparse data', () => {
      const sparse = adaptivePointSize(100, 240000);
      const dense = adaptivePointSize(10000, 240000);
      expect(sparse.max).toBeGreaterThan(dense.max);
      expect(sparse.min).toBeGreaterThan(dense.min);
    });

    it('should always have min < max', () => {
      const sizes = adaptivePointSize(1000, 240000);
      expect(sizes.min).toBeLessThan(sizes.max);
    });
  });

  describe('formatNumber', () => {
    it('should handle null values', () => {
      expect(formatNumber(null)).toBe('N/A');
      expect(formatNumber(undefined)).toBe('N/A');
    });

    it('should format large numbers with scientific notation', () => {
      const result = formatNumber(12345);
      expect(result).toMatch(/e/);
    });

    it('should format small numbers with decimals', () => {
      expect(formatNumber(1.234)).toBe('1.23');
      expect(formatNumber(0.1234)).toBe('0.123');
    });

    it('should format medium numbers appropriately', () => {
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(12.3)).toBe('12.3');
    });

    it('should respect precision parameter', () => {
      expect(formatNumber(1.23456, 2)).toBe('1.23');
      expect(formatNumber(1.23456, 0)).toBe('1');
    });
  });

  describe('getQuantiles', () => {
    it('should calculate quantiles correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const quantiles = getQuantiles(values, [0.25, 0.5, 0.75]);
      
      expect(quantiles[0.25]).toBeLessThan(quantiles[0.5]);
      expect(quantiles[0.5]).toBeLessThan(quantiles[0.75]);
    });

    it('should filter out null values', () => {
      const values = [1, null, 2, undefined, 3, 4, 5];
      const quantiles = getQuantiles(values, [0.5]);
      expect(quantiles[0.5]).toBeDefined();
      expect(isNaN(quantiles[0.5])).toBe(false);
    });
  });

  describe('categoricalColors', () => {
    it('should return a color mapping object', () => {
      const categories = ['A', 'B', 'C'];
      const colors = categoricalColors(categories);
      
      expect(colors).toHaveProperty('A');
      expect(colors).toHaveProperty('B');
      expect(colors).toHaveProperty('C');
      expect(colors.A).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should cycle through palette for many categories', () => {
      const categories = Array.from({ length: 20 }, (_, i) => `Cat${i}`);
      const colors = categoricalColors(categories);
      
      expect(Object.keys(colors)).toHaveLength(20);
      // First and 9th should have same color (8-color palette)
      expect(colors.Cat0).toBe(colors.Cat8);
    });
  });
});
