/**
 * Analytics Module
 * Privacy-friendly analytics tracking (no personal data)
 * @module analytics
 */

import { AppConfig } from './config.js';

/**
 * Analytics service for tracking calculator usage
 * @namespace Analytics
 */
export const Analytics = {
    enabled: AppConfig.environment.isProduction,

    events: [],

    /**
     * Track an analytics event
     * @param {string} eventName - Name of the event
     * @param {Object} properties - Event properties
     */
    track: function (eventName, properties = {}) {
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

    /**
     * Track calculation performed
     * @param {string} calculatorType - Type of calculator used
     * @param {Object} inputs - Input parameters (anonymized)
     */
    trackCalculation: function (calculatorType, inputs) {
        this.track('calculation_performed', {
            calculator: calculatorType,
            hasValidInputs: true
        });
    },

    /**
     * Track error occurrence
     * @param {string} errorType - Type of error
     * @param {string} message - Error message
     */
    trackError: function (errorType, message) {
        this.track('error_occurred', {
            type: errorType,
            message: message
        });
    },

    /**
     * Get analytics statistics
     * @returns {Object} Statistics object
     */
    getStats: function () {
        return {
            totalEvents: this.events.length,
            eventTypes: [...new Set(this.events.map(e => e.name))],
            events: this.events
        };
    }
};

export default Analytics;