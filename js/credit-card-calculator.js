/**
 * Credit Card Payoff Calculator Module
 * Calculate credit card payoff time, total interest, and total payment
 * @module credit-card-calculator
 */

import { AppConfig, ErrorHandler, ValidationConfig, RateDefaults } from './config.js';
import { Utils } from './utils.js';
import { UIManager } from './ui-manager.js';

/**
 * Credit card payoff calculator
 * @namespace CreditCardCalculator
 */
export const CreditCardCalculator = {
    // DOM element references cache
    elements: {},

    // Tracks whether the user has manually typed into the monthly payment
    // field, so we stop auto-filling it once they've entered their own value
    hasUserEditedPayment: false,

    /**
     * Initialize the credit card calculator module
     * Sets up event listeners and caches DOM element references
     */
    init: function () {
        AppConfig.log('info', 'Credit Card Calculator: Starting initialization...');

        // Cache DOM elements
        this.elements = {
            form: document.getElementById('creditForm'),
            calculateButton: document.getElementById('calculateCreditButton'),
            resetButton: document.getElementById('resetCreditButton'),
            balanceInput: document.getElementById('creditBalance'),
            aprInput: document.getElementById('creditAPR'),
            monthlyPaymentInput: document.getElementById('creditMonthlyPayment'),
            resultDiv: document.getElementById('creditResult'),
            initialBalance: document.getElementById('initialBalance'),
            payoffTime: document.getElementById('payoffTime'),
            totalInterest: document.getElementById('totalCreditInterest'),
            totalAmount: document.getElementById('totalCreditAmount'),
            monthlyRate: document.getElementById('monthlyInterestRate'),
            estimatedMinPayment: document.getElementById('estimatedMinPayment'),
            // Payment breakdown elements
            paymentBreakdown: document.getElementById('paymentBreakdown'),
            principalBar: document.getElementById('principalBar'),
            interestBar: document.getElementById('interestBar'),
            principalAmount: document.getElementById('principalAmount'),
            interestAmount: document.getElementById('interestAmount'),
            monthlyPaymentDisplay: document.getElementById('monthlyPaymentDisplay')
        };

        // Log which elements were found
        AppConfig.log('debug', 'Credit Card Calculator elements found', {
            form: !!this.elements.form,
            calculateButton: !!this.elements.calculateButton,
            resetButton: !!this.elements.resetButton
        });

        // Set up event listeners
        this.setupEventListeners();

        AppConfig.log('info', 'Credit Card Calculator initialized successfully');
    },

    /**
     * Set up event listeners for calculator interactions
     */
    setupEventListeners: function () {
        // Check if required elements exist
        if (!this.elements.calculateButton || !this.elements.resetButton) {
            return ErrorHandler.handleError(
                'Credit Card Calculator: Required button elements not found',
                'Unable to initialize credit card calculator',
                false
            );
        }

        // Calculate button
        this.elements.calculateButton.addEventListener('click', () => this.handleCalculate());

        // Reset button
        this.elements.resetButton.addEventListener('click', () => this.handleReset());

        // Enter key on inputs
        [this.elements.balanceInput, this.elements.aprInput, this.elements.monthlyPaymentInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleCalculate();
                    }
                });
            }
        });

        // Live input format restrictions (see Utils.restrictToWholeNumber /
        // Utils.restrictDecimalFormat for why this must be enforced in JS).
        // Registered before validation/auto-fill listeners so those always
        // read the already-sanitized value.
        if (this.elements.balanceInput) {
            this.elements.balanceInput.addEventListener('input', () => Utils.restrictToWholeNumber(this.elements.balanceInput, 6));
        }
        if (this.elements.aprInput) {
            this.elements.aprInput.addEventListener('input', () => Utils.restrictDecimalFormat(this.elements.aprInput, 2, 2));
        }
        if (this.elements.monthlyPaymentInput) {
            this.elements.monthlyPaymentInput.addEventListener('input', () => Utils.restrictToWholeNumber(this.elements.monthlyPaymentInput, 6));
        }

        // Real-time validation with debouncing
        const debouncedValidate = Utils.debounce((input) => {
            this.validateInput(input);
        }, AppConfig.ui.debounceDelay);

        if (this.elements.balanceInput) {
            this.elements.balanceInput.addEventListener('input', () => debouncedValidate(this.elements.balanceInput));
        }
        if (this.elements.aprInput) {
            this.elements.aprInput.addEventListener('input', () => debouncedValidate(this.elements.aprInput));
        }
        if (this.elements.monthlyPaymentInput) {
            this.elements.monthlyPaymentInput.addEventListener('input', () => debouncedValidate(this.elements.monthlyPaymentInput));
        }

        // Auto-fill the monthly payment with the estimated card minimum once
        // both balance and APR are entered, unless the user has already
        // typed their own payment amount
        const debouncedAutoFill = Utils.debounce(() => this.autoFillMinimumPayment(), AppConfig.ui.debounceDelay);

        if (this.elements.balanceInput) {
            this.elements.balanceInput.addEventListener('input', debouncedAutoFill);
        }
        if (this.elements.aprInput) {
            this.elements.aprInput.addEventListener('input', debouncedAutoFill);
        }
        if (this.elements.monthlyPaymentInput) {
            // A real keystroke in this field means the user wants to override
            // the auto-filled value. Programmatic value assignment elsewhere
            // does not fire 'input', so this only catches genuine user edits.
            this.elements.monthlyPaymentInput.addEventListener('input', () => {
                this.hasUserEditedPayment = true;
            });
        }
    },

    /**
     * Auto-fill the monthly payment field with the estimated card minimum
     * payment, based on the current balance and APR. Does nothing if either
     * field is empty/invalid, or if the user has already typed their own
     * payment amount.
     */
    autoFillMinimumPayment: function () {
        if (this.hasUserEditedPayment) return;
        if (!this.elements.balanceInput || !this.elements.aprInput || !this.elements.monthlyPaymentInput) return;

        const balance = parseFloat(this.elements.balanceInput.value);
        const apr = parseFloat(this.elements.aprInput.value);

        if (isNaN(balance) || balance <= 0 || isNaN(apr) || apr <= 0) return;

        const monthlyRate = apr / 12 / 100;
        const estimatedMinPayment = this.estimateCardMinimumPayment(balance, monthlyRate);

        // Payment field is whole-dollar only, so round up to ensure the
        // auto-filled amount still meets (never falls short of) the estimate
        this.elements.monthlyPaymentInput.value = Math.ceil(estimatedMinPayment).toString();
        this.validateInput(this.elements.monthlyPaymentInput);
    },

    /**
     * Validate individual input field
     * @param {HTMLInputElement} input - Input element to validate
     * @returns {boolean} Whether input is valid
     */
    validateInput: function (input) {
        if (!input) {
            AppConfig.log('warn', 'validateInput called with null input');
            return false;
        }

        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);

        AppConfig.log('debug', `Validating ${input.id}`, {
            value,
            min,
            max,
            isValid: !isNaN(value) && value >= min && value <= max
        });

        // If empty, it's invalid
        if (!input.value || input.value.trim() === '') {
            input.classList.add('invalid');
            input.classList.remove('valid');
            return false;
        }

        if (isNaN(value) || value < min || value > max) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            return false;
        }

        input.classList.remove('invalid');
        input.classList.add('valid');

        // Auto-clear error message when valid
        if (typeof UIManager !== 'undefined') {
            UIManager.hideMessage();
        }

        return true;
    },

    /**
     * Handle calculate button click
     * Validates inputs and performs credit card payoff calculation
     */
    handleCalculate: function () {
        AppConfig.log('info', 'Credit Card Calculator: Calculate button clicked');

        // Get input values
        const balance = parseFloat(this.elements.balanceInput.value);
        const apr = parseFloat(this.elements.aprInput.value);
        const monthlyPayment = parseFloat(this.elements.monthlyPaymentInput.value);

        AppConfig.log('debug', 'Input values', { balance, apr, monthlyPayment });

        // Validate all inputs
        const isBalanceValid = this.validateInput(this.elements.balanceInput);
        const isAprValid = this.validateInput(this.elements.aprInput);
        const isPaymentValid = this.validateInput(this.elements.monthlyPaymentInput);

        if (!isBalanceValid || !isAprValid || !isPaymentValid) {
            return ErrorHandler.handleError(
                'Invalid credit card inputs',
                'Please enter valid values for all fields'
            );
        }

        // Check if balance is positive
        if (balance <= 0) {
            return ErrorHandler.handleError(
                'Balance must be positive',
                'Balance must be greater than zero'
            );
        }

        // Calculate monthly interest rate
        const monthlyInterestRate = apr / 12 / 100;

        // Interest-only floor: the payment must exceed this or the balance
        // never shrinks (negative amortization). This is NOT a realistic
        // card-issuer minimum payment - see estimateCardMinimumPayment().
        const interestOnlyFloor = balance * monthlyInterestRate;

        if (monthlyPayment <= interestOnlyFloor) {
            return ErrorHandler.handleError(
                'Monthly payment too low',
                `Monthly payment ($${monthlyPayment.toFixed(2)}) must be greater than the monthly interest ($${interestOnlyFloor.toFixed(2)}) to pay off the balance`
            );
        }

        // Perform calculation
        const result = this.calculatePayoff(balance, monthlyInterestRate, monthlyPayment);

        AppConfig.log('info', 'Calculation result', result);

        // Estimate a realistic card-issuer minimum payment for display
        const estimatedMinPayment = this.estimateCardMinimumPayment(balance, monthlyInterestRate);

        // Display results
        this.displayResults(result, monthlyInterestRate * 100, balance, monthlyPayment, apr, estimatedMinPayment);

        // Show results section
        this.elements.resultDiv.style.display = 'block';

        if (typeof UIManager !== 'undefined') {
            UIManager.showMessage('Payoff calculation complete', 'success');
        }
    },

    /**
     * Calculate credit card payoff details using amortization method
     * @param {number} balance - Current credit card balance
     * @param {number} monthlyRate - Monthly interest rate (as decimal)
     * @param {number} payment - Fixed monthly payment amount
     * @returns {Object} Calculation results with months, totalPaid, and totalInterest
     */
    calculatePayoff: function (balance, monthlyRate, payment) {
        let remainingBalance = balance;
        let totalPaid = 0;
        let months = 0;
        const maxMonths = RateDefaults.maxAmortizationMonths || 600; // 50 years max

        AppConfig.performance.start('creditCardCalculation');

        // Simulate monthly payments
        while (remainingBalance > 0 && months < maxMonths) {
            // Calculate interest for this month
            const interestCharge = remainingBalance * monthlyRate;

            // Add interest to balance
            remainingBalance += interestCharge;

            // Apply payment
            const actualPayment = Math.min(payment, remainingBalance);
            remainingBalance -= actualPayment;
            totalPaid += actualPayment;

            months++;
        }

        const totalInterest = totalPaid - balance;

        AppConfig.performance.end('creditCardCalculation');

        return {
            months: months,
            totalPaid: totalPaid,
            totalInterest: totalInterest
        };
    },

    /**
     * Estimate a realistic card-issuer minimum payment, matching the common
     * industry formula used by most major issuers: the greater of
     * (1% of balance + that month's interest) or a flat $25 floor. Actual
     * issuer formulas vary (1-3% of balance, fees, etc.), so this is an
     * estimate for informational display only.
     * @param {number} balance - Current credit card balance
     * @param {number} monthlyRate - Monthly interest rate (as decimal)
     * @returns {number} Estimated minimum payment
     */
    estimateCardMinimumPayment: function (balance, monthlyRate) {
        const flatFloor = 25;
        const percentPlusInterest = (balance * 0.01) + (balance * monthlyRate);
        return Math.max(percentPlusInterest, flatFloor);
    },

    /**
     * Display calculation results in the UI
     * @param {Object} result - Calculation results
     * @param {number} monthlyRatePercent - Monthly interest rate as percentage
     * @param {number} initialBalance - The original balance
     * @param {number} monthlyPayment - The fixed monthly payment
     * @param {number} apr - The annual percentage rate as entered by the user
     * @param {number} estimatedMinPayment - Estimated realistic card-issuer minimum payment
     */
    displayResults: function (result, monthlyRatePercent, initialBalance, monthlyPayment, apr, estimatedMinPayment) {
        // Format payoff time
        const years = Math.floor(result.months / 12);
        const remainingMonths = result.months % 12;
        let payoffText = '';

        if (years > 0) {
            payoffText = `${years} year${years > 1 ? 's' : ''}`;
            if (remainingMonths > 0) {
                payoffText += `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
            }
        } else {
            payoffText = `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        }

        payoffText += ` (${result.months} total months)`;

        // Update UI elements - Initial Balance
        this.elements.initialBalance.textContent = '$' + Utils.formatCurrency(initialBalance);
        this.elements.initialBalance.classList.remove('placeholder');

        // Update UI elements - Payoff Summary
        this.elements.payoffTime.textContent = payoffText;
        this.elements.totalInterest.textContent = '$' + Utils.formatCurrency(result.totalInterest);
        this.elements.totalAmount.textContent = '$' + Utils.formatCurrency(result.totalPaid);
        this.elements.monthlyRate.textContent = `${monthlyRatePercent.toFixed(4)}% (${apr.toFixed(2)}% APR)`;
        this.elements.estimatedMinPayment.textContent = '$' + Utils.formatCurrency(estimatedMinPayment);

        // Remove placeholder class
        this.elements.payoffTime.classList.remove('placeholder');
        this.elements.totalInterest.classList.remove('placeholder');
        this.elements.totalAmount.classList.remove('placeholder');
        this.elements.monthlyRate.classList.remove('placeholder');
        this.elements.estimatedMinPayment.classList.remove('placeholder');

        // Calculate first month's payment breakdown
        const firstMonthInterest = initialBalance * (monthlyRatePercent / 100);
        const firstMonthPrincipal = monthlyPayment - firstMonthInterest;

        // Calculate percentages for bar chart
        const interestPercent = (firstMonthInterest / monthlyPayment) * 100;
        const principalPercent = (firstMonthPrincipal / monthlyPayment) * 100;

        // Update payment breakdown chart
        this.elements.principalAmount.textContent = '$' + firstMonthPrincipal.toFixed(2);
        this.elements.interestAmount.textContent = '$' + firstMonthInterest.toFixed(2);
        this.elements.monthlyPaymentDisplay.textContent = '$' + monthlyPayment.toFixed(2);

        // Animate the bars
        setTimeout(() => {
            this.elements.principalBar.style.width = `${principalPercent}%`;
            this.elements.interestBar.style.width = `${interestPercent}%`;
        }, AppConfig.ui.loadingDelay);

        // Show the breakdown chart
        this.elements.paymentBreakdown.style.display = 'block';
    },

    /**
     * Handle reset button click
     * Clears all inputs and hides results
     */
    handleReset: function () {
        AppConfig.log('info', 'Resetting credit card calculator');

        // Clear form
        this.elements.form.reset();

        // Allow auto-fill to populate the payment field again on next entry
        this.hasUserEditedPayment = false;

        // Remove invalid/valid states
        [this.elements.balanceInput, this.elements.aprInput, this.elements.monthlyPaymentInput].forEach(input => {
            input.classList.remove('invalid', 'valid');
        });

        // Hide results
        this.elements.resultDiv.style.display = 'none';

        // Add placeholder class back
        this.elements.initialBalance.classList.add('placeholder');
        this.elements.payoffTime.classList.add('placeholder');
        this.elements.totalInterest.classList.add('placeholder');
        this.elements.totalAmount.classList.add('placeholder');
        this.elements.monthlyRate.classList.add('placeholder');
        this.elements.estimatedMinPayment.classList.add('placeholder');

        // Reset display values
        this.elements.initialBalance.textContent = '$---,---';
        this.elements.payoffTime.textContent = '-- months';
        this.elements.totalInterest.textContent = '$---,---';
        this.elements.totalAmount.textContent = '$---,---';
        this.elements.monthlyRate.textContent = '--.--% ';
        this.elements.estimatedMinPayment.textContent = '$---.--';

        // Hide and reset payment breakdown
        this.elements.paymentBreakdown.style.display = 'none';
        this.elements.principalBar.style.width = '0%';
        this.elements.interestBar.style.width = '0%';
        this.elements.principalAmount.textContent = '$---.--';
        this.elements.interestAmount.textContent = '$---.--';
        this.elements.monthlyPaymentDisplay.textContent = '$---.--';

        if (typeof UIManager !== 'undefined') {
            UIManager.showMessage('Credit card calculator reset', 'info');
        }
    }
};

export default CreditCardCalculator;
