/**
 * Application Configuration and Utilities
 * Centralized configuration for the Financial Calculator application
 * @module config
 */

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

/**
 * Validation limits for all calculator inputs
 * @constant
 */
export const ValidationConfig = {
    principal: {
        min: 1000,
        max: 10000000,
        label: 'Principal Amount'
    },
    interestRate: {
        min: 0.01,
        max: 30,
        label: 'Interest Rate'
    },
    term: {
        min: 1,
        max: 50,
        label: 'Loan Term'
    },
    rent: {
        min: 500,
        max: 20000,
        label: 'Rent Amount'
    },
    creditBalance: {
        min: 0,
        max: 999999,
        label: 'Credit Balance'
    },
    creditAPR: {
        min: 1.25,
        max: 29.99,
        label: 'APR'
    },
    creditPayment: {
        min: 1,
        max: 999999,
        label: 'Monthly Payment'
    },
    maxInputLength: 10
};

// ============================================================================
// RATE DEFAULTS
// ============================================================================

/**
 * Default mortgage rate configuration and spreads
 * @constant
 */
export const RateDefaults = {
    fallback30yr: 7.25,        // Fallback 30-year rate
    spread15yr: -0.5,           // 15-year spread from 30-year
    spread50yr: 0.5,            // 50-year spread from 30-year
    maxAmortizationMonths: 600  // 50 years max for calculations
};

// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

/**
 * Main application configuration
 * @constant
 */
export const AppConfig = {
    // Environment detection
    environment: {
        isDevelopment: window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.port !== '',
        isProduction: window.location.hostname.includes('github.io') ||
            window.location.hostname.includes('yourdomain.com')
    },

    // Debug settings
    debug: {
        enabled: false, // Toggle debug mode
        logLevel: 'info', // 'error', 'warn', 'info', 'debug'
        showTimestamps: true,
        showStackTrace: true
    },

    // API settings
    api: {
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000,
        cacheEnabled: true,
        cacheDuration: 3600000 // 1 hour
    },

    // UI settings
    ui: {
        animationDuration: 300,
        messageTimeout: 3000,
        autoFocusFirstInput: true,
        debounceDelay: 300,      // Input validation debounce
        loadingDelay: 100        // Loading state delay
    },

    /**
     * Initialize configuration based on environment
     */
    init: function () {
        // Auto-enable debug in development
        if (this.environment.isDevelopment && this.debug.enabled === false) {
            this.debug.enabled = true;
            this.log('info', 'Debug mode auto-enabled for development environment');
        }

        // Log environment info
        this.log('info', `Environment: ${this.environment.isDevelopment ? 'Development' : 'Production'}`);
        this.log('info', `Debug Mode: ${this.debug.enabled ? 'ON' : 'OFF'}`);

        // Check for CSP issues in production
        if (this.environment.isProduction) {
            const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            if (cspMeta && cspMeta.content.includes('unsafe-inline')) {
                this.log('warn', '⚠️ WARNING: CSP contains unsafe-inline in production!');
            }
        }
    },

    /**
     * Smart logging function with level filtering
     * @param {string} level - Log level: 'error', 'warn', 'info', 'debug'
     * @param {string} message - Log message
     * @param {*} data - Optional data to log
     */
    log: function (level, message, data = null) {
        if (!this.debug.enabled) return;

        const levels = ['error', 'warn', 'info', 'debug'];
        const currentLevelIndex = levels.indexOf(this.debug.logLevel);
        const messageLevelIndex = levels.indexOf(level);

        // Only log if message level is equal or higher priority than config level
        if (messageLevelIndex > currentLevelIndex) return;

        const timestamp = this.debug.showTimestamps ?
            `[${new Date().toISOString()}]` : '';
        const prefix = `${timestamp} [${level.toUpperCase()}]`;

        switch (level) {
            case 'error':
                console.error(prefix, message, data || '');
                if (this.debug.showStackTrace) console.trace();
                break;
            case 'warn':
                console.warn(prefix, message, data || '');
                break;
            case 'info':
                console.info(prefix, message, data || '');
                break;
            case 'debug':
                console.log(prefix, message, data || '');
                break;
        }
    },

    // Performance monitoring
    performance: {
        marks: {},

        /**
         * Start performance measurement
         * @param {string} name - Name of the measurement
         */
        start: function (name) {
            if (!AppConfig.debug.enabled) return;
            this.marks[name] = performance.now();
            AppConfig.log('debug', `⏱️ Performance: ${name} started`);
        },

        /**
         * End performance measurement
         * @param {string} name - Name of the measurement
         */
        end: function (name) {
            if (!AppConfig.debug.enabled || !this.marks[name]) return;
            const duration = performance.now() - this.marks[name];
            AppConfig.log('info', `⏱️ Performance: ${name} took ${duration.toFixed(2)}ms`);
            delete this.marks[name];
        }
    }
};

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Centralized error handling utility
 * @constant
 */
export const ErrorHandler = {
    /**
     * Handle errors with logging
     * Note: Calling code should handle showing messages to users via UIManager
     * @param {Error|string} error - Error object or message
     * @param {string} logMessage - Message to log (optional, defaults to error message)
     * @param {boolean} logOnly - If true, only log without user notification (default: false)
     * @returns {null} Always returns null for convenience
     */
    handleError: function (error, logMessage = null, logOnly = false) {
        // Log the error
        const errorMessage = error instanceof Error ? error.message : error;
        const errorStack = error instanceof Error ? error.stack : undefined;
        const messageToLog = logMessage || errorMessage;

        AppConfig.log('error', messageToLog, {
            error: errorMessage,
            stack: errorStack
        });

        // Return null for convenience in validation
        return null;
    },

    /**
     * Handle validation errors
     * Note: Calling code should display the error message via UIManager
     * @param {Array<string>} errors - Array of validation error messages
     * @returns {null} Always returns null
     */
    handleValidationErrors: function (errors) {
        if (errors.length === 0) return null;

        AppConfig.log('warn', 'Validation failed', { errors });

        return null;
    },

    /**
     * Handle API errors
     * @param {Error} error - API error
     * @param {string} endpoint - API endpoint that failed
     * @returns {null} Always returns null
     */
    handleApiError: function (error, endpoint) {
        AppConfig.log('error', `API Error at ${endpoint}`, error);
        return null;
    }
};

// Auto-initialize
AppConfig.init();