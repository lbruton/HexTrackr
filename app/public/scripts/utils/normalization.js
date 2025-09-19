/**
 * @module normalization
 * @description Utility functions for normalizing chart data to enable trend comparison
 * @since 1.0.17
 */

/**
 * Normalizes an array of values to index 100 (percentage-based normalization)
 * @description Converts absolute values to relative values with baseline = 100
 * @param {number[]} data - Array of numerical values to normalize
 * @param {Object} options - Normalization options
 * @param {boolean} options.skipZeros - Whether to skip zero values when finding baseline
 * @returns {number[]} Array of normalized values indexed to 100
 * @throws {Error} If data is empty or all values are zero
 * @example
 * const data = [100, 150, 125, 175, 200];
 * const normalized = normalizeToIndex100(data);
 * // Returns: [100, 150, 125, 175, 200]
 */
function normalizeToIndex100(data, options = {}) {
    if (!data || data.length === 0) {
        throw new Error('Cannot normalize empty dataset');
    }

    // Find baseline (first non-zero value if skipZeros is true)
    let baseline = data[0];
    let baselineIndex = 0;

    if (options.skipZeros && baseline === 0) {
        for (let i = 1; i < data.length; i++) {
            if (data[i] !== 0) {
                baseline = data[i];
                baselineIndex = i;
                break;
            }
        }
    }

    // Handle all-zero case
    if (baseline === 0) {
        console.warn('All values are zero, returning zeros');
        return data.map(() => 0);
    }

    // Normalize to index 100
    return data.map((value, index) => {
        if (index < baselineIndex) {
            return 0; // Values before baseline
        }
        return (value / baseline) * 100;
    });
}

/**
 * Transforms chart series data for normalization
 * @description Applies normalization to multiple data series for chart display
 * @param {Object} rawData - Raw chart data with severity levels
 * @param {number[]} rawData.critical - Critical severity values
 * @param {number[]} rawData.high - High severity values
 * @param {number[]} rawData.medium - Medium severity values
 * @param {number[]} rawData.low - Low severity values
 * @param {boolean} normalized - Whether to apply normalization
 * @returns {Object} Transformed data ready for chart rendering
 * @example
 * const rawData = {
 *     critical: [148, 152, 145, 160],
 *     high: [18846, 19000, 18500, 19200],
 *     medium: [33706, 34000, 33500, 35000],
 *     low: [1507, 1600, 1550, 1700]
 * };
 * const chartData = getChartData(rawData, true);
 */
function getChartData(rawData, normalized = false) {
    if (!normalized) {
        return rawData;
    }

    const normalizedData = {};

    for (const severity in rawData) {
        if (rawData.hasOwnProperty(severity)) {
            try {
                normalizedData[severity] = normalizeToIndex100(rawData[severity], { skipZeros: true });
            } catch (error) {
                console.error(`Failed to normalize ${severity} data:`, error);
                normalizedData[severity] = rawData[severity]; // Fallback to raw data
            }
        }
    }

    return normalizedData;
}

/**
 * Formats tooltip values for normalized charts
 * @description Creates tooltip text showing both normalized and actual values
 * @param {number} normalizedValue - The normalized value (indexed to 100)
 * @param {number} actualValue - The actual/raw value
 * @param {string} label - Label for the data point (e.g., "Critical")
 * @returns {string} Formatted tooltip HTML string
 * @example
 * const tooltip = formatNormalizedTooltip(105.4, 156, "Critical");
 * // Returns: "Critical<br>Normalized: 105.4<br>Actual: 156"
 */
function formatNormalizedTooltip(normalizedValue, actualValue, label) {
    return `
        <div class="chart-tooltip">
            <strong>${label}</strong><br>
            <span class="tooltip-normalized">Index: ${normalizedValue.toFixed(1)}</span><br>
            <span class="tooltip-actual">Actual: ${actualValue.toLocaleString()}</span>
        </div>
    `.trim();
}

/**
 * Validates normalization settings
 * @description Ensures normalization settings are valid before applying
 * @param {Object} settings - Normalization settings object
 * @param {string} settings.method - Normalization method ('index100', 'percentage', 'logarithmic')
 * @param {boolean} settings.showBothInTooltip - Whether to show both values in tooltips
 * @returns {boolean} True if settings are valid
 */
function validateNormalizationSettings(settings) {
    const validMethods = ['index100', 'percentage', 'logarithmic'];

    if (!settings || typeof settings !== 'object') {
        return false;
    }

    if (!validMethods.includes(settings.method)) {
        console.error(`Invalid normalization method: ${settings.method}`);
        return false;
    }

    if (typeof settings.showBothInTooltip !== 'boolean') {
        console.error('showBothInTooltip must be a boolean');
        return false;
    }

    return true;
}

/**
 * Saves normalization preferences to localStorage
 * @description Persists user's normalization view preference
 * @param {Object} state - View state to save
 * @param {string} state.viewMode - 'normalized' or 'absolute'
 * @param {string} state.selectedTimeRange - Time range selection
 * @param {Date} state.lastUpdated - Timestamp of last update
 * @returns {boolean} True if saved successfully
 */
function saveNormalizationState(state) {
    try {
        const stateToSave = {
            ...state,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('hextrackr.chartViewState', JSON.stringify(stateToSave));
        return true;
    } catch (error) {
        console.error('Failed to save normalization state:', error);
        return false;
    }
}

/**
 * Loads normalization preferences from localStorage
 * @description Retrieves user's saved normalization view preference
 * @returns {Object|null} Saved state or null if not found
 */
function loadNormalizationState() {
    try {
        const saved = localStorage.getItem('hextrackr.chartViewState');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Failed to load normalization state:', error);
        return null;
    }
}

// Export functions for use in other modules
export {
    normalizeToIndex100,
    getChartData,
    formatNormalizedTooltip,
    validateNormalizationSettings,
    saveNormalizationState,
    loadNormalizationState
};