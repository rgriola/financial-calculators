// Privacy-friendly analytics (no personal data)

const Analytics = {
    enabled: AppConfig.environment.isProduction,
    
    events: [],
    
    track: function(eventName, properties = {}) {
        if (!this.enabled) return;
        
        const event = {
            name: eventName,
            properties: properties,
            timestamp: new Date().toISOString()
        };
        
        this.events.push(event);
        AppConfig.log('debug', 'Analytics event:', event);
        
        // Could send to analytics service here
        // Example: this.sendToService(event);
    },
    
    trackCalculation: function(calculatorType, inputs) {
        this.track('calculation_performed', {
            calculator: calculatorType,
            hasValidInputs: true
        });
    },
    
    trackError: function(errorType, message) {
        this.track('error_occurred', {
            type: errorType,
            message: message
        });
    },
    
    getStats: function() {
        return {
            totalEvents: this.events.length,
            eventTypes: [...new Set(this.events.map(e => e.name))],
            events: this.events
        };
    }
};