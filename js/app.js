/**
 * Financial Calculator App Coordinator
 * ------------------------------------
 * Handles high-level initialization and coordination of all modules for the financial calculator web app.
 * Delegates all UI manipulation to UIManager. Does not directly interact with the DOM except for initialization.
 *
 * Exposed Methods:
 * - FinancialCalculatorApp.init()
 * - FinancialCalculatorApp.initializeUI()
 * - FinancialCalculatorApp.setupModules()
 * - FinancialCalculatorApp.initializeMortgageRates()
 * - FinancialCalculatorApp.updateRentCalculatorRates()
 *
 * Global error and promise rejection handlers are also set up here.
 */

const FinancialCalculatorApp = {
    /**
     * Initialize the entire application and modules.
     */
    init: function() {
        console.log('Initializing Financial Calculator App...');
        this.initializeUI();
        this.setupModules();
        this.initializeMortgageRates();
        console.log('Financial Calculator App initialized successfully!');
    },

    /**
     * Initialize UI state (delegates to UIManager).
     */
    initializeUI: function() {
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
     * Setup all calculator modules and UI event listeners.
     */
    setupModules: function() {
        MortgageCalculator.setupEventListeners();
        MortgageCalculator.setupLocationHandlers();
        RentCalculator.setupEventListeners();
        UIManager.setupInfoTooltips();
        UIManager.setupCalculatorTabs();
        UIManager.setupKeyboardShortcuts();
    },

    /**
     * Initialize mortgage rates service and update rent calculator.
     */
    initializeMortgageRates: function() {
        if (typeof MortgageRateService !== 'undefined') {
            console.log('Initializing mortgage rates service...');
            MortgageRateService.init();
            setTimeout(() => {
                this.updateRentCalculatorRates();
            }, 2000);
            document.addEventListener('ratesUpdated', () => {
                this.updateRentCalculatorRates();
            });
        } else {
            console.warn('MortgageRateService not found. Using fallback rates.');
            setTimeout(() => {
                RentCalculator.initializeWithCurrentRates();
            }, 500);
        }
    },

    /**
     * Update rent calculator when rates are loaded.
     */
    updateRentCalculatorRates: function() {
        console.log('Updating rent calculator with current rates...');
        RentCalculator.initializeWithCurrentRates();
    }
};

/**
 * DOMContentLoaded Initialization
 * ------------------------------
 * Initializes the Financial Calculator App and all modules when the DOM is ready.
 * Delegates all UI setup to UIManager via FinancialCalculatorApp.setupModules().
 */
document.addEventListener('DOMContentLoaded', function() {
    FinancialCalculatorApp.init();
});

// Global error handling
window.addEventListener('error', function(event) {
    AppConfig.log('error', 'Global Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    if (!AppConfig.environment.isDevelopment) {
        UIManager.showMessage('An unexpected error occurred. Please refresh the page.', 'error');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    AppConfig.log('error', 'Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise
    });
});