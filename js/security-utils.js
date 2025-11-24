// Security utilities for financial calculator
// CSP compliant security functions

const SecurityUtils = {
    sanitizeInput: function(input) {
        if (!input || typeof input !== 'string') return '';
        return input.toString().trim();
    },

    sanitizeText: function(text) {
        if (!text || typeof text !== 'string') return '';
        return text.trim().replace(/[<>]/g, '');
    },

    validateNumericInput: function(value, min, max) {
        const num = parseFloat(value);
        if (isNaN(num) || num < min || num > max) return false;
        return true;
    },

    formatCurrency: function(amount) {
        if (isNaN(amount)) return '0.00';
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    // Check for HTML injection attempts
    detectHTMLInjection: function(input) {
        const htmlPattern = /<[^>]*>/g;
        return htmlPattern.test(input);
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}