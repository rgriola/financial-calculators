// Security utilities for financial calculator
// CSP compliant security functions

const SecurityUtils = {
    sanitizeInput: function(input) {
        if (!input || typeof input !== 'string') return '';
        // Remove commas before processing numeric input
        return input.toString().trim().replace(/,/g, '');
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

    // Format number input with commas (for live input formatting)
    formatNumberWithCommas: function(value) {
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