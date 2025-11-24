// Main application initialization and coordination

const FinancialCalculatorApp = {
    // Initialize the entire application
    init: function() {
        console.log('Initializing Financial Calculator App...');
        
        // Initialize UI
        this.initializeUI();
        
        // Setup all modules
        this.setupModules();
        
        // Initialize mortgage rates service first
        this.initializeMortgageRates();
        
        console.log('Financial Calculator App initialized successfully!');
    },

    // Initialize UI state
    initializeUI: function() {
        UIManager.hideMessage();
        UIManager.showMortgagePlaceholders();
        UIManager.showRentPlaceholders();
        UIManager.hideInfoTooltip();
        
        // Set focus to first input for accessibility
        const principalInput = document.getElementById('principal');
        if (principalInput) {
            principalInput.focus();
        }
    },

    // Setup all calculator modules
    setupModules: function() {
        // Setup mortgage calculator
        MortgageCalculator.setupEventListeners();
        
        // Setup rent calculator
        RentCalculator.setupEventListeners();
        
        // Setup UI components
        UIManager.setupInfoTooltips();
    },

    // Initialize mortgage rates service and update rent calculator
    initializeMortgageRates: function() {
        if (typeof MortgageRateService !== 'undefined') {
            console.log('Initializing mortgage rates service...');
            
            // Initialize the service
            MortgageRateService.init();
            
            // Wait a bit for rates to load, then update rent calculator
            setTimeout(() => {
                this.updateRentCalculatorRates();
            }, 2000); // Give API time to respond
            
            // Also listen for rate updates
            document.addEventListener('ratesUpdated', () => {
                this.updateRentCalculatorRates();
            });
            
        } else {
            console.warn('MortgageRateService not found. Using fallback rates.');
            // Initialize rent calculator with fallback rates immediately
            setTimeout(() => {
                RentCalculator.initializeWithCurrentRates();
            }, 500);
        }
    },

    // Update rent calculator when rates are loaded
    updateRentCalculatorRates: function() {
        console.log('Updating rent calculator with current rates...');
        RentCalculator.initializeWithCurrentRates();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    FinancialCalculatorApp.init();
});