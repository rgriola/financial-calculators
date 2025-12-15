/**
 * Utility Functions Module
 * General-purpose utilities for the Financial Calculator
 * @module utils
 */

/**
 * Utility functions collection
 * @namespace Utils
 */
export const Utils = {
    /**
     * Debounce function execution
     * Delays function execution until after specified wait time has elapsed
     * since the last time it was invoked
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     * @example
     * const debouncedSearch = Utils.debounce(searchFunction, 300);
     * input.addEventListener('input', debouncedSearch);
     */
    debounce: function (func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            const later = () => {
                clearTimeout(timeout);
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function execution
     * Ensures function is called at most once per specified time period
     * @param {Function} func - Function to throttle
     * @param {number} wait - Milliseconds to wait between calls
     * @returns {Function} Throttled function
     * @example
     * const throttledScroll = Utils.throttle(handleScroll, 100);
     * window.addEventListener('scroll', throttledScroll);
     */
    throttle: function (func, wait) {
        let timeout = null;
        let previous = 0;

        return function executedFunction(...args) {
            const context = this;
            const now = Date.now();
            const remaining = wait - (now - previous);

            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(context, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    previous = Date.now();
                    timeout = null;
                    func.apply(context, args);
                }, remaining);
            }
        };
    },

    /**
     * Format number as currency (USD)
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     * @example
     * Utils.formatCurrency(1234.5) // "1,234.50"
     */
    formatCurrency: function (amount) {
        if (isNaN(amount)) return '0.00';
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    /**
     * Format number with commas (for live input formatting)
     * @param {string|number} value - Value to format
     * @returns {string} Formatted number string
     * @example
     * Utils.formatNumberWithCommas("1234567") // "1,234,567"
     */
    formatNumberWithCommas: function (value) {
        if (!value) return '';

        // Remove any non-digit characters except decimal point
        const cleaned = value.toString().replace(/[^\d.]/g, '');

        // Prevent multiple decimal points
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            // Keep only the first decimal point
            parts[0] = parts[0] + parts.slice(1, -1).join('');
            parts.splice(1, parts.length - 2);
        }

        // Format integer part with commas
        if (parts[0]) {
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        // Return formatted number (limit to 2 decimal places if present)
        return parts.length > 1 ? parts[0] + '.' + parts[1].slice(0, 2) : parts[0];
    },

    /**
     * Remove formatting from number string
     * @param {string} value - Formatted number string
     * @returns {string} Clean number string
     * @example
     * Utils.cleanNumber("1,234.56") // "1234.56"
     */
    cleanNumber: function (value) {
        if (!value) return '';
        return value.toString().replace(/,/g, '');
    },

    /**
     * Format percentage
     * @param {number} value - Decimal value (e.g., 0.045 for 4.5%)
     * @param {number} decimals - Number of decimal places (default: 2)
     * @returns {string} Formatted percentage string
     * @example
     * Utils.formatPercent(0.045, 2) // "4.50%"
     */
    formatPercent: function (value, decimals = 2) {
        if (isNaN(value)) return '0.00%';
        return (value * 100).toFixed(decimals) + '%';
    },

    /**
     * Create DOM element with optional class and text
     * @param {string} tag - HTML tag name
     * @param {string} className - CSS class name (optional)
     * @param {string} textContent - Text content (optional)
     * @returns {HTMLElement} Created element
     * @example
     * const div = Utils.createElement('div', 'error-message', 'Invalid input');
     */
    createElement: function (tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    },

    /**
     * Format date to localized string
     * @param {Date} date - Date object
     * @param {string} locale - Locale string (default: 'en-US')
     * @returns {string} Formatted date string
     * @example
     * Utils.formatDate(new Date(), 'en-US') // "12/15/2025"
     */
    formatDate: function (date, locale = 'en-US') {
        if (!(date instanceof Date) || isNaN(date)) return '';
        return date.toLocaleDateString(locale);
    },

    /**
     * Format date and time to localized string
     * @param {Date} date - Date object
     * @param {string} locale - Locale string (default: 'en-US')
     * @returns {string} Formatted date and time string
     */
    formatDateTime: function (date, locale = 'en-US') {
        if (!(date instanceof Date) || isNaN(date)) return '';
        return date.toLocaleString(locale);
    },

    /**
     * Safely parse float with fallback
     * @param {*} value - Value to parse
     * @param {number} fallback - Fallback value if parsing fails
     * @returns {number} Parsed number or fallback
     */
    safeParseFloat: function (value, fallback = 0) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? fallback : parsed;
    },

    /**
     * Safely parse integer with fallback
     * @param {*} value - Value to parse
     * @param {number} fallback - Fallback value if parsing fails
     * @returns {number} Parsed integer or fallback
     */
    safeParseInt: function (value, fallback = 0) {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? fallback : parsed;
    },

    /**
     * Clamp number between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp: function (value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Check if value is empty (null, undefined, or empty string)
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    isEmpty: function (value) {
        return value === null || value === undefined || value === '';
    },

    /**
     * Sleep/delay function
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after delay
     * @example
     * await Utils.sleep(1000); // Wait 1 second
     */
    sleep: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

export default Utils;