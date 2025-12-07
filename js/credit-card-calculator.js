/**
 * Credit Card Payoff Calculator Module
 * 
 * Calculates credit card payoff time, total interest, and total payment based on:
 * - Current balance
 * - Annual Percentage Rate (APR)
 * - Fixed monthly payment amount
 * 
 * Uses compound interest method with monthly compounding to determine payoff timeline.
 * 
 * @module CreditCardCalculator
 * @author Financial Calculators Team
 * @version 1.0.0
 */

const CreditCardCalculator = (function() {
    'use strict';

    // DOM element references
    let elements = {};

    /**
     * Initialize the credit card calculator module
     * Sets up event listeners and caches DOM element references
     * 
     * @returns {void}
     */
    function init() {
        console.log('Credit Card Calculator: Starting initialization...');
        
        // Cache DOM elements
        elements = {
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
            // Payment breakdown elements
            paymentBreakdown: document.getElementById('paymentBreakdown'),
            principalBar: document.getElementById('principalBar'),
            interestBar: document.getElementById('interestBar'),
            principalAmount: document.getElementById('principalAmount'),
            interestAmount: document.getElementById('interestAmount'),
            monthlyPaymentDisplay: document.getElementById('monthlyPaymentDisplay')
        };

        // Log which elements were found
        console.log('Credit Card Calculator elements found:', {
            form: !!elements.form,
            calculateButton: !!elements.calculateButton,
            resetButton: !!elements.resetButton,
            balanceInput: !!elements.balanceInput,
            aprInput: !!elements.aprInput,
            monthlyPaymentInput: !!elements.monthlyPaymentInput
        });

        // Set up event listeners
        setupEventListeners();

        console.log('Credit Card Calculator initialized successfully');
    }

    /**
     * Set up event listeners for calculator interactions
     * 
     * @returns {void}
     */
    function setupEventListeners() {
        // Check if elements exist before adding listeners
        if (!elements.calculateButton || !elements.resetButton) {
            console.error('Credit Card Calculator: Required button elements not found');
            return;
        }

        // Calculate button
        elements.calculateButton.addEventListener('click', handleCalculate);

        // Reset button
        elements.resetButton.addEventListener('click', handleReset);

        // Enter key on inputs
        [elements.balanceInput, elements.aprInput, elements.monthlyPaymentInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCalculate();
                    }
                });
            }
        });

        // Real-time validation
        if (elements.balanceInput) elements.balanceInput.addEventListener('input', () => validateInput(elements.balanceInput));
        if (elements.aprInput) elements.aprInput.addEventListener('input', () => validateInput(elements.aprInput));
        if (elements.monthlyPaymentInput) elements.monthlyPaymentInput.addEventListener('input', () => validateInput(elements.monthlyPaymentInput));
    }

    /**
     * Validate individual input field
     * 
     * @param {HTMLInputElement} input - Input element to validate
     * @returns {boolean} Whether input is valid
     */
    function validateInput(input) {
        if (!input) {
            console.warn('Credit Card Calculator: validateInput called with null input');
            return false;
        }
        
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);

        console.log(`Credit Card Calculator: Validating ${input.id}:`, { 
            value, 
            min, 
            max, 
            rawValue: input.value,
            isNaN: isNaN(value),
            isEmpty: !input.value || input.value.trim() === ''
        });

        // If empty, it's invalid
        if (!input.value || input.value.trim() === '') {
            input.classList.add('invalid');
            return false;
        }

        if (isNaN(value) || value < min || value > max) {
            input.classList.add('invalid');
            return false;
        }

        input.classList.remove('invalid');
        return true;
    }

    /**
     * Handle calculate button click
     * Validates inputs and performs credit card payoff calculation
     * 
     * @returns {void}
     */
    function handleCalculate() {
        console.log('Credit Card Calculator: Calculate button clicked');
        
        // Log raw element values
        console.log('Credit Card Calculator: Raw input elements:', {
            balanceElement: elements.balanceInput,
            balanceValue: elements.balanceInput?.value,
            aprElement: elements.aprInput,
            aprValue: elements.aprInput?.value,
            paymentElement: elements.monthlyPaymentInput,
            paymentValue: elements.monthlyPaymentInput?.value
        });
        
        // Get input values
        const balance = parseFloat(elements.balanceInput.value);
        const apr = parseFloat(elements.aprInput.value);
        const monthlyPayment = parseFloat(elements.monthlyPaymentInput.value);

        console.log('Credit Card Calculator: Input values:', { balance, apr, monthlyPayment });

        // Validate all inputs
        const isBalanceValid = validateInput(elements.balanceInput);
        const isAprValid = validateInput(elements.aprInput);
        const isPaymentValid = validateInput(elements.monthlyPaymentInput);

        console.log('Credit Card Calculator: Validation results:', { 
            isBalanceValid, 
            isAprValid, 
            isPaymentValid 
        });

        if (!isBalanceValid || !isAprValid || !isPaymentValid) {
            const message = 'Please enter valid values for all fields';
            console.warn('Credit Card Calculator:', message);
            if (typeof UIManager !== 'undefined') {
                UIManager.showMessage(message, 'error');
            } else {
                alert(message);
            }
            return;
        }

        // Check if balance is positive
        if (balance <= 0) {
            const message = 'Balance must be greater than zero';
            console.warn('Credit Card Calculator:', message);
            if (typeof UIManager !== 'undefined') {
                UIManager.showMessage(message, 'error');
            } else {
                alert(message);
            }
            return;
        }

        // Calculate monthly interest rate
        const monthlyInterestRate = apr / 12 / 100;

        // Calculate minimum payment needed to pay off debt
        const minimumPayment = balance * monthlyInterestRate;

        if (monthlyPayment <= minimumPayment) {
            const message = `Monthly payment ($${monthlyPayment.toFixed(2)}) must be greater than the monthly interest ($${minimumPayment.toFixed(2)}) to pay off the balance`;
            console.warn('Credit Card Calculator:', message);
            if (typeof UIManager !== 'undefined') {
                UIManager.showMessage(message, 'error');
            } else {
                alert(message);
            }
            return;
        }

        // Perform calculation
        const result = calculatePayoff(balance, monthlyInterestRate, monthlyPayment);

        console.log('Credit Card Calculator: Calculation result:', result);

        // Display results
        displayResults(result, monthlyInterestRate * 100, balance, monthlyPayment);

        // Show results section
        elements.resultDiv.style.display = 'block';
        
        const successMessage = 'Payoff calculation complete';
        console.log('Credit Card Calculator:', successMessage);
        if (typeof UIManager !== 'undefined') {
            UIManager.showMessage(successMessage, 'success');
        }
    }

    /**
     * Calculate credit card payoff details using amortization method
     * 
     * @param {number} balance - Current credit card balance
     * @param {number} monthlyRate - Monthly interest rate (as decimal)
     * @param {number} payment - Fixed monthly payment amount
     * @returns {Object} Calculation results with months, totalPaid, and totalInterest
     */
    function calculatePayoff(balance, monthlyRate, payment) {
        let remainingBalance = balance;
        let totalPaid = 0;
        let months = 0;
        const maxMonths = 600; // 50 years max to prevent infinite loops

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

        return {
            months: months,
            totalPaid: totalPaid,
            totalInterest: totalInterest
        };
    }

    /**
     * Display calculation results in the UI
     * 
     * @param {Object} result - Calculation results
     * @param {number} monthlyRatePercent - Monthly interest rate as percentage
     * @param {number} initialBalance - The original balance
     * @param {number} monthlyPayment - The fixed monthly payment
     * @returns {void}
     */
    function displayResults(result, monthlyRatePercent, initialBalance, monthlyPayment) {
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
        elements.initialBalance.textContent = `$${initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        elements.initialBalance.classList.remove('placeholder');

        // Update UI elements - Payoff Summary
        elements.payoffTime.textContent = payoffText;
        elements.totalInterest.textContent = `$${result.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        elements.totalAmount.textContent = `$${result.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        elements.monthlyRate.textContent = `${monthlyRatePercent.toFixed(4)}%`;

        // Remove placeholder class
        elements.payoffTime.classList.remove('placeholder');
        elements.totalInterest.classList.remove('placeholder');
        elements.totalAmount.classList.remove('placeholder');
        elements.monthlyRate.classList.remove('placeholder');

        // Calculate first month's payment breakdown
        const firstMonthInterest = initialBalance * (monthlyRatePercent / 100);
        const firstMonthPrincipal = monthlyPayment - firstMonthInterest;

        // Calculate percentages for bar chart
        const interestPercent = (firstMonthInterest / monthlyPayment) * 100;
        const principalPercent = (firstMonthPrincipal / monthlyPayment) * 100;

        // Update payment breakdown chart
        elements.principalAmount.textContent = `$${firstMonthPrincipal.toFixed(2)}`;
        elements.interestAmount.textContent = `$${firstMonthInterest.toFixed(2)}`;
        elements.monthlyPaymentDisplay.textContent = `$${monthlyPayment.toFixed(2)}`;

        // Animate the bars
        setTimeout(() => {
            elements.principalBar.style.width = `${principalPercent}%`;
            elements.interestBar.style.width = `${interestPercent}%`;
        }, 100);

        // Show the breakdown chart
        elements.paymentBreakdown.style.display = 'block';
    }

    /**
     * Handle reset button click
     * Clears all inputs and hides results
     * 
     * @returns {void}
     */
    function handleReset() {
        // Clear form
        elements.form.reset();

        // Remove invalid states
        [elements.balanceInput, elements.aprInput, elements.monthlyPaymentInput].forEach(input => {
            input.classList.remove('invalid');
        });

        // Hide results
        elements.resultDiv.style.display = 'none';

        // Add placeholder class back
        elements.initialBalance.classList.add('placeholder');
        elements.payoffTime.classList.add('placeholder');
        elements.totalInterest.classList.add('placeholder');
        elements.totalAmount.classList.add('placeholder');
        elements.monthlyRate.classList.add('placeholder');

        // Reset display values
        elements.initialBalance.textContent = '$---,---';
        elements.payoffTime.textContent = '-- months';
        elements.totalInterest.textContent = '$---,---';
        elements.totalAmount.textContent = '$---,---';
        elements.monthlyRate.textContent = '--.--% ';

        // Hide and reset payment breakdown
        elements.paymentBreakdown.style.display = 'none';
        elements.principalBar.style.width = '0%';
        elements.interestBar.style.width = '0%';
        elements.principalAmount.textContent = '$---.--';
        elements.interestAmount.textContent = '$---.--';
        elements.monthlyPaymentDisplay.textContent = '$---.--';

        const message = 'Credit card calculator reset';
        console.log('Credit Card Calculator:', message);
        if (typeof UIManager !== 'undefined') {
            UIManager.showMessage(message, 'info');
        }
    }

    // Public API
    return {
        init: init
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', CreditCardCalculator.init);
} else {
    CreditCardCalculator.init();
}
