/**
 * Security Utilities Module
 * Security-focused functions for input validation and sanitization
 * @module security-utils
 */

/**
 * Security utilities for protecting against XSS and injection attacks
 * @namespace SecurityUtils
 */
export const SecurityUtils = {
    /**
     * Sanitize numeric input - removes all non-numeric characters except decimal
     * @param {string|number} input - Input value to sanitize
     * @returns {string} Sanitized numeric string
     * @example
     * SecurityUtils.sanitizeInput("$1,234.56") // "1234.56"
     */
    sanitizeInput: function (input) {
        if (!input || typeof input !== 'string') return '';

        // Remove all non-numeric characters except decimal point
        const cleaned = input.toString()
            .trim()
            .replace(/,/g, '')
            .replace(/[^\d.]/g, '');

        // Prevent multiple decimal points
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            // Keep only first decimal point
            return parts[0] + '.' + parts.slice(1).join('');
        }

        return cleaned;
    },

    /**
     * Sanitize text input - removes potentially dangerous characters
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     * @example
     * SecurityUtils.sanitizeText("<script>alert('xss')</script>") // "scriptalert('xss')/script"
     */
    sanitizeText: function (text) {
        if (!text || typeof text !== 'string') return '';

        // Remove HTML tags and potentially dangerous characters
        return text
            .trim()
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, ''); // Remove event handlers
    },

    /**
     * Validate numeric input is within acceptable range
     * @param {string|number} value - Value to validate
     * @param {number} min - Minimum acceptable value
     * @param {number} max - Maximum acceptable value
     * @returns {boolean} True if valid
     * @example
     * SecurityUtils.validateNumericInput("100", 0, 1000) // true
     * SecurityUtils.validateNumericInput("2000", 0, 1000) // false
     */
    validateNumericInput: function (value, min, max) {
        const num = parseFloat(value);
        if (isNaN(num) || num < min || num > max) return false;
        return true;
    },

    /**
     * Check for HTML injection attempts in input
     * @param {string} input - Input string to check
     * @returns {boolean} True if HTML/script tags detected
     * @example
     * SecurityUtils.detectHTMLInjection("<script>alert(1)</script>") // true
     * SecurityUtils.detectHTMLInjection("Hello World") // false
     */
    detectHTMLInjection: function (input) {
        if (!input) return false;

        const htmlPattern = /<[^>]*>/g;
        const scriptPattern = /<script|javascript:|on\w+=/gi;

        return htmlPattern.test(input) || scriptPattern.test(input);
    },

    /**
     * Check for SQL injection patterns (for future backend integration)
     * @param {string} input - Input string to check
     * @returns {boolean} True if SQL injection patterns detected
     */
    detectSQLInjection: function (input) {
        if (!input) return false;

        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
            /(--|\#|\/\*|\*\/)/g,
            /(\bOR\b.*=.*)/gi,
            /(\bAND\b.*=.*)/gi
        ];

        return sqlPatterns.some(pattern => pattern.test(input));
    },

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text safe for HTML insertion
     * @example
     * SecurityUtils.escapeHTML("<div>Test</div>") // "&lt;div&gt;Test&lt;/div&gt;"
     */
    escapeHTML: function (text) {
        if (!text) return '';

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };

        return text.replace(/[&<>"'/]/g, char => map[char]);
    },

    /**
     * Validate email format (basic validation)
     * @param {string} email - Email address to validate
     * @returns {boolean} True if valid email format
     */
    validateEmail: function (email) {
        if (!email) return false;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    },

    /**
     * Generate secure random string (for tokens, IDs, etc.)
     * @param {number} length - Length of string to generate
     * @returns {string} Random string
     */
    generateRandomString: function (length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        // Use crypto.getRandomValues if available for better randomness
        if (window.crypto && window.crypto.getRandomValues) {
            const randomValues = new Uint8Array(length);
            window.crypto.getRandomValues(randomValues);

            for (let i = 0; i < length; i++) {
                result += chars[randomValues[i] % chars.length];
            }
        } else {
            // Fallback to Math.random
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }

        return result;
    },

    /**
     * Rate limiting helper - tracks function calls and enforces limits
     * @param {string} key - Unique identifier for this rate limit
     * @param {number} maxCalls - Maximum calls allowed
     * @param {number} timeWindow - Time window in milliseconds
     * @returns {boolean} True if call is allowed
     * @example
     * if (SecurityUtils.rateLimit('apiCall', 10, 60000)) {
     *     // Make API call
     * }
     */
    rateLimit: (function () {
        const limits = new Map();

        return function (key, maxCalls, timeWindow) {
            const now = Date.now();

            if (!limits.has(key)) {
                limits.set(key, { count: 1, resetTime: now + timeWindow });
                return true;
            }

            const limit = limits.get(key);

            if (now >= limit.resetTime) {
                // Reset window
                limits.set(key, { count: 1, resetTime: now + timeWindow });
                return true;
            }

            if (limit.count >= maxCalls) {
                return false; // Rate limit exceeded
            }

            limit.count++;
            return true;
        };
    })()
};

export default SecurityUtils;