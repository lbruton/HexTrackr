/**
 * @module normalization.test
 * @description Unit tests for normalization utility functions
 * @since 1.0.17
 */

// Note: These tests are written to FAIL initially as the normalization
// functions are not yet integrated into the chart manager

describe('Normalization Utility Functions', () => {
    // Mock the module since it uses ES6 exports and we haven't configured the build yet
    let normalizeToIndex100, getChartData, formatNormalizedTooltip,
        validateNormalizationSettings, saveNormalizationState, loadNormalizationState;

    beforeAll(() => {
        // These will fail initially as the module isn't properly imported
        try {
            const normModule = require('../../app/public/scripts/utils/normalization.js');
            normalizeToIndex100 = normModule.normalizeToIndex100;
            getChartData = normModule.getChartData;
            formatNormalizedTooltip = normModule.formatNormalizedTooltip;
            validateNormalizationSettings = normModule.validateNormalizationSettings;
            saveNormalizationState = normModule.saveNormalizationState;
            loadNormalizationState = normModule.loadNormalizationState;
        } catch (error) {
            // Expected to fail initially - ES6 modules not configured
            console.log('Module import failed - expected for TDD');
        }
    });

    describe('normalizeToIndex100', () => {
        test('should normalize array with first value as baseline', () => {
            const data = [100, 150, 125, 175, 200];
            const result = normalizeToIndex100(data);

            expect(result).toEqual([100, 150, 125, 175, 200]);
            expect(result[0]).toBe(100);
        });

        test('should handle zero baseline by finding next non-zero value', () => {
            const data = [0, 100, 150, 200];
            const result = normalizeToIndex100(data, { skipZeros: true });

            expect(result).toEqual([0, 100, 150, 200]);
            expect(result[1]).toBe(100);
        });

        test('should return all zeros for all-zero dataset', () => {
            const data = [0, 0, 0, 0];
            const result = normalizeToIndex100(data);

            expect(result).toEqual([0, 0, 0, 0]);
        });

        test('should throw error for empty dataset', () => {
            expect(() => normalizeToIndex100([])).toThrow('Cannot normalize empty dataset');
        });

        test('should handle single value dataset', () => {
            const data = [150];
            const result = normalizeToIndex100(data);

            expect(result).toEqual([100]);
        });

        test('should correctly calculate normalized values', () => {
            const data = [50, 100, 75, 25];
            const result = normalizeToIndex100(data);

            expect(result[0]).toBe(100);  // 50/50 * 100
            expect(result[1]).toBe(200);  // 100/50 * 100
            expect(result[2]).toBe(150);  // 75/50 * 100
            expect(result[3]).toBe(50);   // 25/50 * 100
        });
    });

    describe('getChartData', () => {
        test('should return raw data when not normalized', () => {
            const rawData = {
                critical: [148, 152, 145],
                high: [18846, 19000, 18500],
                medium: [33706, 34000, 33500],
                low: [1507, 1600, 1550]
            };

            const result = getChartData(rawData, false);
            expect(result).toEqual(rawData);
        });

        test('should normalize all severity levels', () => {
            const rawData = {
                critical: [100, 150, 200],
                high: [1000, 1100, 900],
                medium: [5000, 5500, 6000],
                low: [200, 180, 220]
            };

            const result = getChartData(rawData, true);

            expect(result.critical[0]).toBe(100);
            expect(result.critical[1]).toBe(150);
            expect(result.critical[2]).toBe(200);

            expect(result.high[0]).toBe(100);
            expect(result.high[1]).toBe(110);
            expect(result.high[2]).toBe(90);
        });

        test('should handle severity with zero baseline', () => {
            const rawData = {
                critical: [0, 10, 20],
                high: [100, 110, 90]
            };

            const result = getChartData(rawData, true);

            expect(result.critical[0]).toBe(0);
            expect(result.critical[1]).toBe(100);
            expect(result.critical[2]).toBe(200);
        });
    });

    describe('formatNormalizedTooltip', () => {
        test('should format tooltip with both values', () => {
            const tooltip = formatNormalizedTooltip(105.4, 156, 'Critical');

            expect(tooltip).toContain('Critical');
            expect(tooltip).toContain('Index: 105.4');
            expect(tooltip).toContain('Actual: 156');
        });

        test('should handle large numbers with locale formatting', () => {
            const tooltip = formatNormalizedTooltip(125.8, 18846, 'High');

            expect(tooltip).toContain('High');
            expect(tooltip).toContain('Index: 125.8');
            expect(tooltip).toContain('18,846');
        });
    });

    describe('validateNormalizationSettings', () => {
        test('should validate correct settings', () => {
            const settings = {
                method: 'index100',
                showBothInTooltip: true
            };

            expect(validateNormalizationSettings(settings)).toBe(true);
        });

        test('should reject invalid method', () => {
            const settings = {
                method: 'invalid',
                showBothInTooltip: true
            };

            expect(validateNormalizationSettings(settings)).toBe(false);
        });

        test('should reject non-boolean showBothInTooltip', () => {
            const settings = {
                method: 'index100',
                showBothInTooltip: 'yes'
            };

            expect(validateNormalizationSettings(settings)).toBe(false);
        });

        test('should reject null settings', () => {
            expect(validateNormalizationSettings(null)).toBe(false);
        });
    });

    describe('localStorage functions', () => {
        beforeEach(() => {
            // Mock localStorage
            global.localStorage = {
                getItem: jest.fn(),
                setItem: jest.fn(),
                clear: jest.fn()
            };
        });

        test('saveNormalizationState should save to localStorage', () => {
            const state = {
                viewMode: 'normalized',
                selectedTimeRange: '30d'
            };

            const result = saveNormalizationState(state);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'hextrackr.chartViewState',
                expect.stringContaining('"viewMode":"normalized"')
            );
            expect(result).toBe(true);
        });

        test('loadNormalizationState should load from localStorage', () => {
            const savedState = {
                viewMode: 'normalized',
                selectedTimeRange: '30d',
                lastUpdated: '2025-09-18T10:00:00Z'
            };

            localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

            const result = loadNormalizationState();

            expect(localStorage.getItem).toHaveBeenCalledWith('hextrackr.chartViewState');
            expect(result).toEqual(savedState);
        });

        test('loadNormalizationState should return null if no saved state', () => {
            localStorage.getItem.mockReturnValue(null);

            const result = loadNormalizationState();

            expect(result).toBe(null);
        });

        test('should handle localStorage errors gracefully', () => {
            localStorage.setItem.mockImplementation(() => {
                throw new Error('localStorage full');
            });

            const state = { viewMode: 'normalized' };
            const result = saveNormalizationState(state);

            expect(result).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        test('should handle negative values', () => {
            const data = [-10, -5, -15, -20];
            const result = normalizeToIndex100(data);

            expect(result[0]).toBe(100);
            expect(result[1]).toBe(50);   // -5/-10 * 100
            expect(result[2]).toBe(150);  // -15/-10 * 100
            expect(result[3]).toBe(200);  // -20/-10 * 100
        });

        test('should handle very large numbers', () => {
            const data = [1000000, 2000000, 1500000];
            const result = normalizeToIndex100(data);

            expect(result[0]).toBe(100);
            expect(result[1]).toBe(200);
            expect(result[2]).toBe(150);
        });

        test('should handle decimal values', () => {
            const data = [0.5, 1.0, 0.75, 0.25];
            const result = normalizeToIndex100(data);

            expect(result[0]).toBe(100);
            expect(result[1]).toBe(200);
            expect(result[2]).toBe(150);
            expect(result[3]).toBe(50);
        });
    });
});