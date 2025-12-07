// Configuration and environment management

const AppConfig = {
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
        enabled: false, // Set this to toggle debug mode (true = show logs, false = hide logs)
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
        autoFocusFirstInput: true
    },

    // Initialize based on environment
    init: function() {
        // Auto-enable debug in development
        if (this.environment.isDevelopment && this.debug.enabled === false) {
           this.debug.enabled = true;
            this.log('info', 'Debug mode auto-enabled for development environment');
        }

        // Log environment info
        this.log('info', `Environment: ${this.environment.isDevelopment ? 'Development' : 'Production'}`);
        this.log('info', `Debug Mode: ${this.debug.enabled ? 'ON' : 'OFF'}`);
    },

    // Smart logging function
    log: function(level, message, data = null) {
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
        
        start: function(name) {
            if (!AppConfig.debug.enabled) return;
            this.marks[name] = performance.now();
            AppConfig.log('debug', `⏱️ Performance: ${name} started`);
        },
        
        end: function(name) {
            if (!AppConfig.debug.enabled || !this.marks[name]) return;
            const duration = performance.now() - this.marks[name];
            AppConfig.log('info', `⏱️ Performance: ${name} took ${duration.toFixed(2)}ms`);
            delete this.marks[name];
        }
    }
};

// Auto-initialize
AppConfig.init();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}