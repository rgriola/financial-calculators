/**
 * Financial Calculator App - Main Entry Point
 * Coordinates initialization of all calculator modules
 * @module app
 */

import { AppConfig, ErrorHandler } from './config.js';
import { MortgageCalculator } from './mortgage-calculator.js';
import { RentCalculator } from './rent-calculator.js';
import { CreditCardCalculator } from './credit-card-calculator.js';
import { UIManager } from './ui-manager.js';
import { MortgageRateService } from './mortgage-rates.js';
import { Analytics } from './analytics.js';

/**
 * Main application coordinator
 * @namespace FinancialCalculatorApp
 */
export const FinancialCalculatorApp = {
    /**
     * Initialize the entire application and modules
     */
    init: function () {
        AppConfig.log('info', '🚀 Initializing Financial Calculator App...');

        try {
            this.initializeUI();
            this.setupModules();
            this.initializeMortgageRates();
            AppConfig.log('info', '✅ Financial Calculator App initialized successfully!');
        } catch (error) {
            ErrorHandler.handleError(error, 'Failed to initialize application');
        }
    },

    /**
     * Initialize UI state (delegates to UIManager)
     */
    initializeUI: function () {
        AppConfig.log('debug', 'Initializing UI state...');

        UIManager.hideMessage();
        UIManager.showMortgagePlaceholders();
        UIManager.showRentPlaceholders();
        UIManager.showCreditPlaceholders();
        UIManager.hideInfoTooltip();

        // Set focus to first input for accessibility
        const principalInput = document.getElementById('principal');
        if (principalInput) {
            principalInput.focus();
        }
    },

    /**
     * Setup all calculator modules and UI event listeners
     */
    setupModules: function () {
        AppConfig.log('debug', 'Setting up calculator modules...');

        try {
            // Setup mortgage calculator
            MortgageCalculator.setupEventListeners();
            MortgageCalculator.setupLocationHandlers();
            AppConfig.log('debug', '✓ Mortgage calculator setup complete');

            // Setup rent calculator
            RentCalculator.setupEventListeners();
            AppConfig.log('debug', '✓ Rent calculator setup complete');

            // Setup credit card calculator
            CreditCardCalculator.init();
            AppConfig.log('debug', '✓ Credit card calculator setup complete');

            // Setup UI components
            UIManager.setupInfoTooltips();
            UIManager.setupCalculatorTabs();
            UIManager.setupKeyboardShortcuts();
            AppConfig.log('debug', '✓ UI components setup complete');

        } catch (error) {
            ErrorHandler.handleError(error, 'Failed to setup calculator modules');
        }
    },

    /**
     * Initialize mortgage rates service and update rent calculator
     */
    initializeMortgageRates: function () {
        AppConfig.log('info', 'Initializing mortgage rates service...');

        try {
            MortgageRateService.init();

            // Update rent calculator after rates load
            setTimeout(() => {
                this.updateRentCalculatorRates();
            }, 2000);

            // Listen for rate updates
            document.addEventListener('ratesUpdated', () => {
                this.updateRentCalculatorRates();
            });

            AppConfig.log('debug', '✓ Mortgage rates service initialized');
        } catch (error) {
            ErrorHandler.handleError(error, 'Failed to initialize mortgage rates', false);
            this.useDefaultRates();
        }
    },

    /**
     * Use default rates when API service is unavailable
     */
    useDefaultRates: function () {
        setTimeout(() => {
            RentCalculator.initializeWithCurrentRates();
        }, 500);
    },

    /**
     * Update rent calculator when rates are loaded
     */
    updateRentCalculatorRates: function () {
        AppConfig.log('debug', 'Updating rent calculator with current rates...');
        RentCalculator.initializeWithCurrentRates();
    }
};

/**
 * DOMContentLoaded Initialization
 * Initializes the Financial Calculator App when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
    FinancialCalculatorApp.init();
});

/**
 * Global error handling
 */
window.addEventListener('error', function (event) {
    ErrorHandler.handleError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    }, 'An unexpected error occurred. Please refresh the page.', !AppConfig.environment.isDevelopment);
});

/**
 * Unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', function (event) {
    ErrorHandler.handleError({
        reason: event.reason,
        promise: event.promise
    }, 'An unexpected error occurred.', false);
});

// Export for potential testing or external use
export default FinancialCalculatorApp;