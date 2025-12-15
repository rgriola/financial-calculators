/**
 * Rent to Mortgage Calculator Module
 * Calculate affordable mortgage principal from monthly rent payment
 * @module rent-calculator
 */

import { AppConfig, RateDefaults, ErrorHandler } from './config.js';
import { SecurityUtils } from './security-utils.js';
import { Validator } from './validation.js';
import { Utils } from './utils.js';

/**
 * Rent to mortgage calculator for reverse mortgage calculations
 * @namespace RentCalculator
 */
export const RentCalculator = {
    /**
     * Calculate affordable principal from monthly payment (reverse mortgage calculation)
     * @param {number} monthlyPayment - Monthly payment amount
     * @param {number} annualRate - Annual interest rate as percentage
     * @param {number} years - Loan term in years
     * @returns {number} Maximum affordable principal
     * @example
     * const affordable = RentCalculator.calculateAffordablePrincipal(2000, 4.5, 30);
     * console.log(affordable); // Approximately 395,000
     */
    calculateAffordablePrincipal: function (monthlyPayment, annualRate, years) {
        const monthlyRate = (annualRate / 100) / 12;
        const numberOfPayments = years * 12;

        if (monthlyRate === 0) {
            return monthlyPayment * numberOfPayments;
        }

        // Reverse mortgage formula: P = M * [(1+r)^n - 1] / [r(1+r)^n]
        const principal = monthlyPayment *
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));

        return principal;
    },

    /**
     * Get current mortgage rates from UI with fallback handling
     * @returns {Object} Object with rate30yr, rate15yr, and fallback flags
     */
    getCurrentMortgageRates: function () {
        const rate30Element = document.getElementById('rate-30yr');
        const rate15Element = document.getElementById('rate-15yr');

        let rate30yr = null;
        let rate15yr = null;

        // Check 30-year rate
        if (rate30Element &&
            rate30Element.textContent !== '...' &&
            rate30Element.textContent !== 'N/A' &&
            rate30Element.textContent.trim() !== '' &&
            !rate30Element.textContent.includes('Loading')) {

            const rateText = rate30Element.textContent.replace('%', '').trim();
            const parsedRate = parseFloat(rateText);
            if (!isNaN(parsedRate) && parsedRate > 0) {
                rate30yr = parsedRate;
            }
        }

        // Check 15-year rate
        if (rate15Element &&
            rate15Element.textContent !== '...' &&
            rate15Element.textContent !== 'N/A' &&
            rate15Element.textContent.trim() !== '' &&
            !rate15Element.textContent.includes('Loading')) {

            const rateText = rate15Element.textContent.replace('%', '').trim();
            const parsedRate = parseFloat(rateText);
            if (!isNaN(parsedRate) && parsedRate > 0) {
                rate15yr = parsedRate;
            }
        }

        // Fallback rates if API data not available
        if (!rate30yr) {
            AppConfig.log('warn', '30-year rate not available from API, using fallback', {
                fallback: RateDefaults.fallback30yr
            });
            rate30yr = RateDefaults.fallback30yr;
        }

        if (!rate15yr) {
            AppConfig.log('warn', '15-year rate not available from API, using estimated rate');
            rate15yr = rate30yr + RateDefaults.spread15yr;
        }

        return {
            rate30yr: rate30yr,
            rate15yr: rate15yr,
            usingFallback30: !rate30Element || rate30Element.textContent === '...' || rate30Element.textContent === 'N/A',
            usingFallback15: !rate15Element || rate15Element.textContent === '...' || rate15Element.textContent === 'N/A'
        };
    },

    /**
     * Handle rent calculation with multiple loan terms
     * Calculates affordable mortgage for 15, 30, and 50 year terms
     */
    handleCalculation: function () {
        AppConfig.log('info', 'Calculating affordable mortgage from rent...');

        const rentInput = document.getElementById('rentAmount');
        if (!rentInput) {
            return ErrorHandler.handleError(
                'Rent input not found',
                'Rent input not found.'
            );
        }

        const rentValue = SecurityUtils.sanitizeInput(rentInput.value);

        // Validate rent input
        if (!Validator.validateRentInput(rentValue)) {
            return ErrorHandler.handleError(
                'Invalid rent amount',
                `Please enter a valid rent amount between $${ValidationConfig.rent.min.toLocaleString()} and $${ValidationConfig.rent.max.toLocaleString()}.`
            );
        }

        const monthlyRent = parseFloat(rentValue);

        // Get current mortgage rates (with fallback detection)
        const rates = this.getCurrentMortgageRates();

        AppConfig.log('info', 'Using rates for calculation', rates);

        // Calculate for all three terms
        const calculations = {
            '15yr': {
                rate: rates.rate15yr,
                term: 15,
                principal: 0,
                totalInterest: 0,
                usingFallback: rates.usingFallback15
            },
            '30yr': {
                rate: rates.rate30yr,
                term: 30,
                principal: 0,
                totalInterest: 0,
                usingFallback: rates.usingFallback30
            },
            '50yr': {
                rate: rates.rate30yr + RateDefaults.spread50yr,
                term: 50,
                principal: 0,
                totalInterest: 0,
                usingFallback: true // Always estimated
            }
        };

        // Calculate affordable principal for each term
        Object.keys(calculations).forEach(term => {
            const calc = calculations[term];
            calc.principal = this.calculateAffordablePrincipal(monthlyRent, calc.rate, calc.term);
            calc.totalInterest = (monthlyRent * calc.term * 12) - calc.principal;
        });

        // Display results
        this.displayResults(calculations);

        // Show appropriate message based on rate source
        if (typeof UIManager !== 'undefined') {
            if (rates.usingFallback30 || rates.usingFallback15) {
                UIManager.showMessage('Calculation complete using estimated rates - live rates may not be available.', 'info');
            } else {
                UIManager.showMessage('Calculation complete using current market rates!', 'success');
            }
        }
    },

    /**
     * Display multiple rent calculation results for all terms
     * @param {Object} calculations - Calculation results for 15yr, 30yr, 50yr
     */
    displayResults: function (calculations) {
        // Update 15-year results
        this.updateResultElements('15yr', calculations['15yr']);

        // Update 30-year results
        this.updateResultElements('30yr', calculations['30yr']);

        // Update 50-year results
        this.updateResultElements('50yr', calculations['50yr']);
    },

    /**
     * Update rent result elements for a specific term
     * @param {string} term - Term identifier (15yr, 30yr, 50yr)
     * @param {Object} calculation - Calculation results for this term
     */
    updateResultElements: function (term, calculation) {
        const rateElement = document.getElementById(`rate${term.charAt(0).toUpperCase() + term.slice(1)}Display`);
        const principalElement = document.getElementById(`principal${term}`);
        const interestElement = document.getElementById(`totalInterest${term}`);

        if (rateElement) {
            let rateText;
            if (term === '50yr') {
                rateText = `${calculation.rate.toFixed(2)}% est.*`;
            } else if (calculation.usingFallback) {
                rateText = `${calculation.rate.toFixed(2)}% est.`;
            } else {
                rateText = `${calculation.rate.toFixed(2)}% rate`;
            }

            rateElement.textContent = rateText;
            rateElement.classList.remove('placeholder');
            rateElement.classList.add('calculated');

            // Add visual styling for different rate sources
            if (calculation.usingFallback) {
                rateElement.classList.add('estimated');
            } else {
                rateElement.classList.add('live-rate');
            }
        }

        if (principalElement) {
            principalElement.textContent = '$' + Utils.formatCurrency(calculation.principal);
            principalElement.classList.remove('placeholder');
            principalElement.classList.add('calculated');
        }

        if (interestElement) {
            interestElement.textContent = '$' + Utils.formatCurrency(calculation.totalInterest);
            interestElement.classList.remove('placeholder');
            interestElement.classList.add('calculated');
        }
    },

    /**
     * Initialize rent placeholders to show current rates immediately
     * Called when rates are loaded to update display before calculation
     */
    initializeWithCurrentRates: function () {
        const rates = this.getCurrentMortgageRates();

        AppConfig.log('info', 'Initializing rent calculator with current rates', rates);

        // Update rate displays immediately without calculation
        const rate15Element = document.getElementById('rate15Display');
        const rate30Element = document.getElementById('rate30Display');
        const rate50Element = document.getElementById('rate50Display');

        if (rate15Element) {
            const rateText = rates.usingFallback15 ?
                `${rates.rate15yr.toFixed(2)}% est.` :
                `${rates.rate15yr.toFixed(2)}% rate`;
            rate15Element.textContent = rateText;
            rate15Element.classList.remove('placeholder');
        }

        if (rate30Element) {
            const rateText = rates.usingFallback30 ?
                `${rates.rate30yr.toFixed(2)}% est.` :
                `${rates.rate30yr.toFixed(2)}% rate`;
            rate30Element.textContent = rateText;
            rate30Element.classList.remove('placeholder');
        }

        if (rate50Element) {
            const estimatedRate = rates.rate30yr + RateDefaults.spread50yr;
            rate50Element.textContent = `${estimatedRate.toFixed(2)}% est.*`;
            rate50Element.classList.remove('placeholder');
        }
    },

    /**
     * Handle rent form reset
     * Clears form and restores placeholders while keeping rate data
     */
    handleReset: function () {
        AppConfig.log('info', 'Resetting rent form...');

        const rentForm = document.getElementById('rentForm');
        if (rentForm) {
            rentForm.reset();
        }

        // Clear validation classes
        const rentInput = document.getElementById('rentAmount');
        if (rentInput) {
            rentInput.classList.remove('valid', 'invalid');
        }

        // Restore placeholders for calculations but keep rate data
        if (typeof UIManager !== 'undefined') {
            UIManager.showRentPlaceholders();
        }

        // Re-initialize with current rates
        setTimeout(() => {
            this.initializeWithCurrentRates();
        }, 100);

        // Focus rent input
        if (rentInput) {
            rentInput.focus();
        }

        if (typeof UIManager !== 'undefined') {
            UIManager.showMessage('Rent Form Reset.', 'info');
        }
    },

    /**
     * Setup event listeners for rent calculator
     * Attaches click handlers and input validation
     */
    setupEventListeners: function () {
        const calculateRentButton = document.getElementById('calculateRentButton');
        const resetRentButton = document.getElementById('resetRentButton');
        const rentForm = document.getElementById('rentForm');

        if (calculateRentButton) {
            calculateRentButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCalculation();
            });
        }

        if (resetRentButton) {
            resetRentButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleReset();
            });
        }

        if (rentForm) {
            rentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCalculation();
            });
        }

        // Add input validation for rent amount with debouncing
        const rentInput = document.getElementById('rentAmount');
        if (rentInput) {
            const debouncedValidate = Utils.debounce(() => {
                this.validateInput(rentInput);
            }, AppConfig.ui.debounceDelay);

            rentInput.addEventListener('input', debouncedValidate);
            rentInput.addEventListener('blur', () => this.validateInput(rentInput));
        }
    },

    /**
     * Validate rent input
     * @param {HTMLInputElement} input - Rent input element
     */
    validateInput: function (input) {
        if (!input) return;

        const value = input.value.trim();
        const isValid = Validator.validateSingleInput(input.id, value);

        if (typeof UIManager !== 'undefined') {
            UIManager.updateInputValidation(input, isValid);

            // Auto-clear error message when user starts inputting valid data
            if (isValid && input.classList.contains('invalid')) {
                UIManager.hideMessage();
            }
        }
    }
};

export default RentCalculator;