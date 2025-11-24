// Core mortgage calculation logic

const MortgageCalculator = {
    // Perform mortgage calculations
    calculate: function(principal, annualRate, years) {
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

        return {
            monthlyPayment: monthlyPayment,
            totalAmount: totalAmount,
            totalInterest: totalInterest,
            interestRatio: interestRatio,
            numberOfPayments: numberOfPayments
        };
    },

    // Handle mortgage calculation process
    handleCalculation: function() {
        console.log('Calculating mortgage payment...');

        UIManager.hideMessage();

        // Get and validate inputs
        const inputs = this.getSecureInputs();
        if (!inputs) return;

        const { principal, interestRate, term } = inputs;

        // Perform calculation
        const calculations = this.calculate(principal, interestRate, term);

        // Display results
        UIManager.displayMortgageResults(calculations, principal, interestRate, term);
    },

    // Get and validate inputs securely
    getSecureInputs: function() {
        const principalInput = document.getElementById('principal');
        const interestRateInput = document.getElementById('interestRate');
        const termInput = document.getElementById('term');

        if (!principalInput || !interestRateInput || !termInput) {
            UIManager.showMessage('Form elements not found. Please refresh the page.', 'error');
            return null;
        }

        // Get sanitized values
        const principalValue = SecurityUtils.sanitizeInput(principalInput.value);
        const interestRateValue = SecurityUtils.sanitizeInput(interestRateInput.value);
        const termValue = SecurityUtils.sanitizeInput(termInput.value);

        // Validate all inputs
        const validation = Validator.validateMortgageInputs(principalValue, interestRateValue, termValue);
        if (!validation.isValid) {
            UIManager.showMessage(validation.errors[0], 'error');
            return null;
        }

        return {
            principal: parseFloat(principalValue),
            interestRate: parseFloat(interestRateValue),
            term: parseInt(termValue, 10)
        };
    },

    // Handle form reset
    handleReset: function() {
        console.log('Resetting mortgage form...');
        
        const form = document.getElementById('mortgageForm');
        if (form) {
            form.reset();
        }

        // Clear validation classes
        const inputs = document.querySelectorAll('.form-group input');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });

        UIManager.showMortgagePlaceholders();
        UIManager.hideMessage();
        UIManager.hideInfoTooltip();

        // Focus first input
        const principalInput = document.getElementById('principal');
        if (principalInput) {
            principalInput.focus();
        }

        UIManager.showMessage('Form has been reset.', 'info');
    },

    // Setup event listeners
    setupEventListeners: function() {
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

        // Add input validation listeners
        const inputs = ['principal', 'interestRate', 'term'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.validateInput(input));
                input.addEventListener('blur', () => this.validateInput(input));
            }
        });
    },

    // Validate individual input
    validateInput: function(input) {
        if (!input) return;

        const value = input.value.trim();
        const isValid = Validator.validateSingleInput(input.id, value);
        UIManager.updateInputValidation(input, isValid);
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MortgageCalculator;
}