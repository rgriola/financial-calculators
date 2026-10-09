/**
 * Mortgage Calculator Module
 * Core mortgage calculation logic and payment calculations
 * @module mortgage-calculator
 */

import { AppConfig, ErrorHandler } from './config.js';
import { SecurityUtils } from './security-utils.js';
import { Validator } from './validation.js';
import { Utils } from './utils.js';
import { UIManager } from './ui-manager.js';

/**
 * Mortgage calculator for computing monthly payments and amortization
 * @namespace MortgageCalculator
 */
export const MortgageCalculator = {
    /**
     * Calculate mortgage payment and totals
     * @param {number} principal - Principal loan amount in dollars
     * @param {number} annualRate - Annual interest rate as percentage (e.g., 4.5)
     * @param {number} years - Loan term in years
     * @returns {Object} Calculation results with monthlyPayment, totalAmount, totalInterest, interestRatio, numberOfPayments
     * @example
     * const result = MortgageCalculator.calculate(200000, 4.5, 30);
     * console.log(result.monthlyPayment); // 1013.37
     */
    calculate: function (principal, annualRate, years) {
        AppConfig.performance.start('mortgageCalculation');

        const monthlyRate = (annualRate / 100) / 12;
        const numberOfPayments = years * 12;

        let monthlyPayment;

        // Handle zero interest rate case
        if (monthlyRate === 0) {
            monthlyPayment = principal / numberOfPayments;
        } else {
            // Standard mortgage payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
            monthlyPayment = principal *
                (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }

        // Calculate totals
        const totalAmount = monthlyPayment * numberOfPayments;
        const totalInterest = totalAmount - principal;
        const interestRatio = (totalInterest / principal) * 100;

        AppConfig.performance.end('mortgageCalculation');

        return {
            monthlyPayment: monthlyPayment,
            totalAmount: totalAmount,
            totalInterest: totalInterest,
            interestRatio: interestRatio,
            numberOfPayments: numberOfPayments
        };
    },

    /**
     * Handle mortgage calculation process
     * Gets inputs, validates, calculates, and displays results
     */
    handleCalculation: function () {
        AppConfig.log('info', 'Calculating mortgage payment...');

        // Hide previous messages
        UIManager.hideMessage();

        // Get and validate inputs
        const inputs = this.getSecureInputs();
        if (!inputs) return;

        const { principal, interestRate, term } = inputs;

        // Check loan limits if location selected
        this.checkLoanLimits(principal);

        // Perform calculation
        const calculations = this.calculate(principal, interestRate, term);

        // Display results
        UIManager.displayMortgageResults(calculations, principal, interestRate, term);
    },

    /**
     * Get and validate inputs securely
     * @returns {Object|null} Object with principal, interestRate, term or null if invalid
     */
    getSecureInputs: function () {
        AppConfig.log('debug', 'Getting secure inputs');

        const principalInput = document.getElementById('principal');
        const interestRateInput = document.getElementById('interestRate');
        const termInput = document.getElementById('term');

        if (!principalInput || !interestRateInput || !termInput) {
            AppConfig.log('error', 'Form elements not found');
            return ErrorHandler.handleError(
                'Form elements not found',
                'Form elements not found. Please refresh the page.'
            );
        }

        // Get sanitized values
        const principalValue = SecurityUtils.sanitizeInput(principalInput.value);
        const interestRateValue = SecurityUtils.sanitizeInput(interestRateInput.value);
        const termValue = SecurityUtils.sanitizeInput(termInput.value);

        AppConfig.log('debug', 'Sanitized input values', {
            principal: principalValue,
            interestRate: interestRateValue,
            term: termValue
        });

        // Validate all inputs
        const validation = Validator.validateMortgageInputs(principalValue, interestRateValue, termValue);
        AppConfig.log('debug', 'Validation result', validation);

        if (!validation.isValid) {
            AppConfig.log('warn', 'Validation failed', validation.errors);
            return ErrorHandler.handleValidationErrors(validation.errors);
        }

        const parsedInputs = {
            principal: parseFloat(principalValue),
            interestRate: parseFloat(interestRateValue),
            term: parseInt(termValue, 10)
        };

        AppConfig.log('debug', 'Parsed inputs', parsedInputs);
        return parsedInputs;
    },

    /**
     * Handle form reset
     * Clears form, removes validation classes, restores placeholders
     */
    handleReset: function () {
        AppConfig.log('info', 'Resetting mortgage form...');

        const form = document.getElementById('mortgageForm');
        if (form) {
            form.reset();
        }

        // Clear validation classes. Scoped to this form specifically - since
        // .calc-input-group is now shared across all three calculator tabs,
        // an unscoped document.querySelectorAll() here would incorrectly
        // also clear valid/invalid state on the Rent and Credit Card forms.
        if (form) {
            const inputs = form.querySelectorAll('.calc-input-group input');
            inputs.forEach(input => {
                input.classList.remove('valid', 'invalid');
            });
        }

        UIManager.showMortgagePlaceholders();
        UIManager.hideMessage();
        UIManager.hideInfoTooltip();

        // Focus first input
        const principalInput = document.getElementById('principal');
        if (principalInput) {
            principalInput.focus();
        }

        UIManager.showMessage('Mortgage Form Reset.', 'info');
    },

    /**
     * Setup event listeners for mortgage calculator
     * Attaches click handlers and input validation
     */
    setupEventListeners: function () {
        const calculateButton = document.getElementById('calculateButton');
        const resetButton = document.getElementById('resetButton');
        const form = document.getElementById('mortgageForm');

        if (calculateButton) {
            calculateButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCalculation();
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleReset();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCalculation();
            });
        }

        // Add input validation listeners with debouncing
        const inputs = ['principal', 'interestRate', 'term'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                // Immediate formatting for principal
                if (inputId === 'principal') {
                    input.addEventListener('input', () => {
                        this.formatPrincipalInput(input);
                    });
                } else if (inputId === 'interestRate') {
                    // XX.xx format, matching the 0.01%-30% range. See
                    // Utils.restrictDecimalFormat for why this is needed in
                    // JS rather than via HTML attributes.
                    input.addEventListener('input', () => Utils.restrictDecimalFormat(input, 2, 2));
                } else if (inputId === 'term') {
                    // Whole years only, max 2 digits (matches the 50-year cap)
                    input.addEventListener('input', () => Utils.restrictToWholeNumber(input, 2));
                }

                // Debounced validation
                const debouncedValidate = Utils.debounce(() => {
                    this.validateInput(input);
                }, AppConfig.ui.debounceDelay);

                input.addEventListener('input', debouncedValidate);
                input.addEventListener('blur', () => this.validateInput(input));
            }
        });
    },

    /**
     * Validate individual input field
     * @param {HTMLInputElement} input - Input element to validate
     */
    validateInput: function (input) {
        if (!input) return;

        const value = input.value.trim();
        const isValid = Validator.validateSingleInput(input.id, value);

        UIManager.updateInputValidation(input, isValid);

        // Auto-clear error message when user starts inputting valid data
        if (isValid && input.classList.contains('invalid')) {
            UIManager.hideMessage();
        }
    },

    /**
     * Format principal input with commas during input
     * @param {HTMLInputElement} input - Principal input element
     */
    formatPrincipalInput: function (input) {
        if (!input || input.id !== 'principal') return;

        const cursorPosition = input.selectionStart;
        const oldValue = input.value;

        // Format the value with commas
        let formatted = Utils.formatNumberWithCommas(oldValue);

        // Cap the integer portion to 8 digits (matches the $10,000,000 max).
        // formatNumberWithCommas only normalizes format/decimals; it doesn't
        // enforce a maximum digit count on its own.
        const [intPartFormatted, decPartFormatted] = formatted.split('.');
        const intDigitsOnly = (intPartFormatted || '').replace(/,/g, '');
        if (intDigitsOnly.length > 8) {
            const cappedIntDigits = intDigitsOnly.slice(0, 8).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            formatted = decPartFormatted !== undefined ? `${cappedIntDigits}.${decPartFormatted}` : cappedIntDigits;
        }

        AppConfig.log('debug', 'Formatting principal', {
            oldValue,
            formatted,
            cursorPosition
        });

        if (formatted !== oldValue) {
            input.value = formatted;

            // Calculate new cursor position
            const oldCommasBefore = (oldValue.substring(0, cursorPosition).match(/,/g) || []).length;
            const newCommasBefore = (formatted.substring(0, cursorPosition).match(/,/g) || []).length;
            const commaDiff = newCommasBefore - oldCommasBefore;

            // Adjust cursor position
            const newPosition = Math.min(cursorPosition + commaDiff, formatted.length);

            // Set cursor position
            try {
                input.setSelectionRange(newPosition, newPosition);
            } catch (e) {
                AppConfig.log('warn', 'Unable to set cursor position', e.message);
            }
        }
    },

    /**
     * Generate amortization schedule
     * @param {number} principal - Principal loan amount
     * @param {number} annualRate - Annual interest rate
     * @param {number} years - Loan term in years
     * @param {number|null} maxMonths - Maximum months to generate (null for all)
     * @returns {Array} Array of payment objects with month, payment, principal, interest, balance
     */
    generateAmortizationSchedule: function (principal, annualRate, years, maxMonths = null) {
        AppConfig.performance.start('generateAmortization');

        const monthlyRate = (annualRate / 100) / 12;
        const numberOfPayments = years * 12;
        const limit = maxMonths || numberOfPayments;
        const monthlyPayment = this.calculate(principal, annualRate, years).monthlyPayment;

        const schedule = [];
        let balance = principal;

        for (let month = 1; month <= Math.min(limit, numberOfPayments); month++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            balance -= principalPayment;

            schedule.push({
                month: month,
                payment: monthlyPayment,
                principal: principalPayment,
                interest: interestPayment,
                balance: Math.max(0, balance)
            });
        }

        AppConfig.performance.end('generateAmortization');
        AppConfig.log('debug', 'Amortization schedule generated', { payments: schedule.length });

        return schedule;
    },

    /**
     * Check loan limits based on property location
     * @param {number} principal - Principal loan amount
     */
    checkLoanLimits: function (principal) {
        AppConfig.log('debug', 'Checking loan limits', { principal });

        const loanLimitSection = document.getElementById('loanLimitSection');
        const jumboAlert = document.getElementById('jumboLoanAlert');

        // Only check if LoanLimitService is available
        if (typeof LoanLimitService === 'undefined') {
            AppConfig.log('warn', 'LoanLimitService not available');
            return;
        }

        const baselineLimit = LoanLimitService.getBaselineLimit();
        AppConfig.log('debug', 'Baseline limit comparison', {
            principal,
            baselineLimit,
            exceeds: principal > baselineLimit
        });

        // Show/hide the jumbo alert based on principal amount
        if (principal > baselineLimit) {
            AppConfig.log('info', 'Principal exceeds baseline - showing jumbo alert');
            if (jumboAlert) {
                jumboAlert.classList.remove('hidden');
            }
        } else {
            AppConfig.log('info', 'Principal below baseline - hiding alerts');
            if (jumboAlert) {
                jumboAlert.classList.add('hidden');
            }
            if (loanLimitSection) {
                loanLimitSection.classList.add('hidden');
            }
            UIManager.hideLoanTypeIndicator();
            return;
        }

        // If property location section is visible, check the loan type
        const sectionIsVisible = loanLimitSection && !loanLimitSection.classList.contains('hidden');

        if (sectionIsVisible && typeof LocationSearch !== 'undefined') {
            const state = LocationSearch.getSelectedState();
            const county = LocationSearch.getSelectedCounty();

            AppConfig.log('debug', 'Checking loan type for location', { state, county });

            if (!state) {
                AppConfig.log('info', 'No state selected');
                UIManager.hideLoanTypeIndicator();
                return;
            }

            // Determine loan type
            const loanTypeInfo = LoanLimitService.determineLoanType(principal, state, county);
            AppConfig.log('debug', 'Loan type determined', loanTypeInfo);

            // Update UI
            UIManager.updateLoanTypeIndicator(loanTypeInfo);
        }
    },

    /**
     * Setup location change handlers for loan limit checking
     */
    setupLocationHandlers: function () {
        AppConfig.log('info', 'Setting up location handlers');

        const principalInput = document.getElementById('principal');
        const checkLocationBtn = document.getElementById('checkLocationBtn');

        // Initialize LocationSearch if available
        if (typeof LocationSearch !== 'undefined') {
            AppConfig.log('info', 'Initializing LocationSearch');
            LocationSearch.init();
        } else {
            AppConfig.log('warn', 'LocationSearch not available');
        }

        // Handle principal change
        if (principalInput) {
            principalInput.addEventListener('input', () => {
                const principal = parseFloat(principalInput.value.replace(/,/g, ''));

                if (!isNaN(principal) && principal > 0) {
                    this.checkLoanLimits(principal);
                } else {
                    if (typeof UIManager !== 'undefined') {
                        UIManager.hideLoanTypeIndicator();
                    }
                    const jumboAlert = document.getElementById('jumboLoanAlert');
                    const loanLimitSection = document.getElementById('loanLimitSection');
                    if (jumboAlert) jumboAlert.classList.add('hidden');
                    if (loanLimitSection) loanLimitSection.classList.add('hidden');
                }
            });
        }

        // Handle "Check Property Location" button click
        if (checkLocationBtn) {
            checkLocationBtn.addEventListener('click', () => {
                AppConfig.log('info', 'Check Property Location button clicked');
                const loanLimitSection = document.getElementById('loanLimitSection');

                if (loanLimitSection) {
                    loanLimitSection.classList.remove('hidden');

                    // Scroll to the section smoothly
                    setTimeout(() => {
                        loanLimitSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });

                        // Focus on state input
                        const stateInput = document.getElementById('stateSearch');
                        if (stateInput) {
                            stateInput.focus();
                        }
                    }, 100);

                    // Re-check loan limits if principal is filled
                    if (principalInput && principalInput.value) {
                        const principal = parseFloat(principalInput.value.replace(/,/g, ''));
                        if (!isNaN(principal)) {
                            this.checkLoanLimits(principal);
                        }
                    }
                }
            });
        }
    }
};

export default MortgageCalculator;