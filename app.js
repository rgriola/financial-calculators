// File: /financial-calculator/financial-calculator/src/app.js

// Mortgage Calculator - Secure Implementation with Enhanced Interest Data
// Following security.md guidelines for CSP compliance

const MortgageCalculator = {
    // Configuration with security constraints
    CONFIG: {
        VALIDATION: {  // Fixed: was "VALIDation"
            MAX_PRINCIPAL: 10000000,    // $10M max
            MIN_PRINCIPAL: 1000,        // $1K min
            MAX_INTEREST_RATE: 30,      // 30% max
            MIN_INTEREST_RATE: 0.01,    // 0.01% min
            MAX_TERM: 50,               // 50 years max
            MIN_TERM: 1,                // 1 year min
            MAX_INPUT_LENGTH: 10,       // Character limit
            HTML_PATTERN: /<[^>]*>/g    // Detect HTML injection
        },
        
        // Info content for tooltips
        INFO_CONTENT: {
            totalInterest: {
                title: "Total Interest Paid",
                content: "This is the total amount of money you'll pay in interest charges over the entire life of your loan. It's calculated by multiplying your monthly payment by the number of payments, then subtracting the original loan amount (principal)."
            },
            totalAmount: {
                title: "Total Amount Paid",
                content: "This is the complete amount you'll pay back to the lender, including both the original loan amount (principal) plus all interest charges. This represents your total financial commitment for the mortgage."
            },
            interestRatio: {
                title: "Interest vs Principal Ratio",
                content: "This percentage shows how much of your total payments go toward interest versus paying down the actual loan balance. A higher percentage means you're paying more in interest relative to the loan amount."
            },
            totalPayments: {
                title: "Total Number of Payments",
                content: "This is the total number of monthly payments you'll make over the life of your loan. It's calculated by multiplying the loan term in years by 12 months. For example, a 30-year loan equals 360 monthly payments."
            }
        }
    },

    // Security utilities
    SecurityUtils: {
        sanitizeInput: function(input) {
            if (!input || typeof input !== 'string') return '';
            return input.toString().trim();
        },

        sanitizeText: function(text) {
            if (!text || typeof text !== 'string') return '';
            return text.trim().replace(/[<>]/g, '');
        },

        validateNumericInput: function(value, min, max) {
            const num = parseFloat(value);
            if (isNaN(num) || num < min || num > max) return false;
            return true;
        },

        formatCurrency: function(amount) {
            if (isNaN(amount)) return '0.00';
            return parseFloat(amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    },

    // Initialize the calculator
    init: function() {
        console.log('Initializing Mortgage Calculator...');
        this._attachEventListeners();
        this._initializeForm();
        this._setupInfoTooltips();
    },

    // Secure event listener attachment
    _attachEventListeners: function() {
        const calculateButton = document.getElementById('calculateButton');
        const resetButton = document.getElementById('resetButton');
        const form = document.getElementById('mortgageForm');

        if (calculateButton) {
            calculateButton.addEventListener('click', (e) => {
                e.preventDefault();
                this._handleCalculation();
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                this._handleReset();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this._handleCalculation();
            });
        }

        // Add input validation listeners
        const inputs = ['principal', 'interestRate', 'term'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this._validateInput(input));
                input.addEventListener('blur', () => this._validateInput(input));
            }
        });
    },

    // Setup info tooltip functionality
    _setupInfoTooltips: function() {
        // Add event listeners to info icons
        const infoIcons = document.querySelectorAll('.info-icon');
        infoIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                const infoType = icon.getAttribute('data-info');
                this._showInfoTooltip(infoType);
            });
        });

        // Setup tooltip close functionality
        const tooltipClose = document.querySelector('.tooltip-close');
        if (tooltipClose) {
            tooltipClose.addEventListener('click', (e) => {
                e.preventDefault();
                this._hideInfoTooltip();
            });
        }

        // Close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            const tooltip = document.getElementById('infoTooltip');
            const isClickInsideTooltip = tooltip && tooltip.contains(e.target);
            const isInfoIcon = e.target.closest('.info-icon');
            
            if (!isClickInsideTooltip && !isInfoIcon && tooltip && !tooltip.classList.contains('hidden')) {
                this._hideInfoTooltip();
            }
        });

        // Close tooltip with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this._hideInfoTooltip();
            }
        });
    },

    // Show info tooltip with secure content
    _showInfoTooltip: function(infoType) {
        const tooltip = document.getElementById('infoTooltip');
        const tooltipText = document.getElementById('tooltipText');
        
        if (!tooltip || !tooltipText) return;

        const infoData = this.CONFIG.INFO_CONTENT[infoType];
        if (!infoData) return;

        // Create safe HTML content using textContent
        tooltipText.innerHTML = ''; // Clear first
        
        const titleElement = document.createElement('h4');
        titleElement.textContent = this.SecurityUtils.sanitizeText(infoData.title);
        
        const contentElement = document.createElement('p');
        contentElement.textContent = this.SecurityUtils.sanitizeText(infoData.content);
        
        tooltipText.appendChild(titleElement);
        tooltipText.appendChild(contentElement);

        // Show tooltip
        tooltip.classList.remove('hidden');
        
        // Focus the close button for accessibility
        const closeButton = tooltip.querySelector('.tooltip-close');
        if (closeButton) {
            setTimeout(() => closeButton.focus(), 100);
        }
    },

    // Hide info tooltip
    _hideInfoTooltip: function() {
        const tooltip = document.getElementById('infoTooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    },

    // Secure message display
    _showMessage: function(message, type = 'info') {
        const messageDiv = document.getElementById('message');
        if (!messageDiv) return;

        const sanitizedMessage = this.SecurityUtils.sanitizeText(message);
        messageDiv.textContent = sanitizedMessage;  // CSP compliant
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');

        // Auto-hide info messages after 3 seconds
        if (type === 'info' || type === 'success') {
            setTimeout(() => {
                this._hideMessage();
            }, 3000);
        }
    },

    // Hide message
    _hideMessage: function() {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.classList.add('hidden');
        }
    },

    // Hide result
    _hideResult: function() {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.classList.add('hidden');
        }
    },

    // Initialize form state
    _initializeForm: function() {
        this._hideMessage();
        this._showResultPlaceholders(); // Show placeholders instead of hiding
        this._hideInfoTooltip();
        
        // Set focus to first input for accessibility
        const principalInput = document.getElementById('principal');
        if (principalInput) {
            principalInput.focus();
        }
    },

    // Show result placeholders
    _showResultPlaceholders: function() {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.classList.remove('hidden');
        }

        // Set placeholder values with placeholder class
        const placeholders = {
            'monthlyPayment': '---.--',
            'principalDisplay': '$---,---',
            'interestDisplay': '--.--% ',
            'termDisplay': '-- years',
            'totalInterest': '$---,---',
            'totalAmount': '$---,---',
            'interestRatio': '--.-%',
            'totalPayments': '---'
        };

        Object.keys(placeholders).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = placeholders[id];
                element.classList.add('placeholder');
                element.classList.remove('calculated');
            }
        });
    },

    // Handle mortgage calculation
    _handleCalculation: function() {
        console.log('Calculating mortgage payment...');

        // Clear any previous messages
        this._hideMessage();

        // Get and validate inputs
        const inputs = this._getSecureInputs();
        if (!inputs) return;

        const { principal, interestRate, term } = inputs;

        // Perform calculation
        const calculations = this._performMortgageCalculations(principal, interestRate, term);

        // Display results securely
        this._displayResult(calculations, principal, interestRate, term);
    },

    // Secure input collection and validation
    _getSecureInputs: function() {
        const principalInput = document.getElementById('principal');
        const interestRateInput = document.getElementById('interestRate');
        const termInput = document.getElementById('term');

        if (!principalInput || !interestRateInput || !termInput) {
            this._showMessage('Form elements not found. Please refresh the page.', 'error');
            return null;
        }

        // Get sanitized values
        const principalValue = this.SecurityUtils.sanitizeInput(principalInput.value);
        const interestRateValue = this.SecurityUtils.sanitizeInput(interestRateInput.value);
        const termValue = this.SecurityUtils.sanitizeInput(termInput.value);

        // Validate all inputs
        if (!this._validateAllInputs(principalValue, interestRateValue, termValue)) {
            return null;
        }

        return {
            principal: parseFloat(principalValue),
            interestRate: parseFloat(interestRateValue),
            term: parseInt(termValue, 10)
        };
    },

    // Comprehensive input validation
    _validateAllInputs: function(principal, interestRate, term) {
        // Check for HTML injection attempts
        if (this.CONFIG.VALIDATION.HTML_PATTERN.test(principal + interestRate + term)) {
            this._showMessage('Invalid characters detected in input.', 'error');
            return false;
        }

        // Validate principal amount
        if (!this.SecurityUtils.validateNumericInput(
            principal, 
            this.CONFIG.VALIDATION.MIN_PRINCIPAL, 
            this.CONFIG.VALIDATION.MAX_PRINCIPAL
        )) {
            this._showMessage(
                `Principal must be between $${this.CONFIG.VALIDATION.MIN_PRINCIPAL.toLocaleString()} and $${this.CONFIG.VALIDATION.MAX_PRINCIPAL.toLocaleString()}.`, 
                'error'
            );
            return false;
        }

        // Validate interest rate
        if (!this.SecurityUtils.validateNumericInput(
            interestRate, 
            this.CONFIG.VALIDATION.MIN_INTEREST_RATE, 
            this.CONFIG.VALIDATION.MAX_INTEREST_RATE
        )) {
            this._showMessage(
                `Interest rate must be between ${this.CONFIG.VALIDATION.MIN_INTEREST_RATE}% and ${this.CONFIG.VALIDATION.MAX_INTEREST_RATE}%.`, 
                'error'
            );
            return false;
        }

        // Validate term
        if (!this.SecurityUtils.validateNumericInput(
            term, 
            this.CONFIG.VALIDATION.MIN_TERM, 
            this.CONFIG.VALIDATION.MAX_TERM
        )) {
            this._showMessage(
                `Loan term must be between ${this.CONFIG.VALIDATION.MIN_TERM} and ${this.CONFIG.VALIDATION.MAX_TERM} years.`, 
                'error'
            );
            return false;
        }

        return true;
    },

    // Individual input validation for real-time feedback
    _validateInput: function(input) {
        if (!input) return;

        const value = input.value.trim();
        const inputId = input.id;
        let isValid = true;

        switch (inputId) {
            case 'principal':
                isValid = this.SecurityUtils.validateNumericInput(
                    value, 
                    this.CONFIG.VALIDATION.MIN_PRINCIPAL, 
                    this.CONFIG.VALIDATION.MAX_PRINCIPAL
                );
                break;
            case 'interestRate':
                isValid = this.SecurityUtils.validateNumericInput(
                    value, 
                    this.CONFIG.VALIDATION.MIN_INTEREST_RATE, 
                    this.CONFIG.VALIDATION.MAX_INTEREST_RATE
                );
                break;
            case 'term':
                isValid = this.SecurityUtils.validateNumericInput(
                    value, 
                    this.CONFIG.VALIDATION.MIN_TERM, 
                    this.CONFIG.VALIDATION.MAX_TERM
                );
                break;
        }

        // Update input styling based on validation - CSP compliant
        if (value && isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else if (value) {
            input.classList.remove('valid');
            input.classList.add('invalid');
        } else {
            input.classList.remove('valid', 'invalid');
        }
    },

    // Enhanced mortgage calculations with interest breakdown
    _performMortgageCalculations: function(principal, annualRate, years) {
        // Convert annual rate to monthly and years to months
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

    // Enhanced result display that removes placeholders
    _displayResult: function(calculations, principal, interestRate, term) {
        const resultDiv = document.getElementById('result');
        const paymentSpan = document.getElementById('monthlyPayment');
        const principalDisplay = document.getElementById('principalDisplay');
        const interestDisplay = document.getElementById('interestDisplay');
        const termDisplay = document.getElementById('termDisplay');

        // Interest summary elements
        const totalInterestSpan = document.getElementById('totalInterest');
        const totalAmountSpan = document.getElementById('totalAmount');
        const interestRatioSpan = document.getElementById('interestRatio');
        const totalPaymentsSpan = document.getElementById('totalPayments');

        if (!resultDiv || !paymentSpan) {
            this._showMessage('Unable to display results. Please try again.', 'error');
            return;
        }

        // Update values and remove placeholder classes
        const updates = [
            { element: paymentSpan, value: this.SecurityUtils.formatCurrency(calculations.monthlyPayment) },
            { element: principalDisplay, value: '$' + this.SecurityUtils.formatCurrency(principal) },
            { element: interestDisplay, value: interestRate.toFixed(2) + '%' },
            { element: termDisplay, value: term + ' years' },
            { element: totalInterestSpan, value: '$' + this.SecurityUtils.formatCurrency(calculations.totalInterest) },
            { element: totalAmountSpan, value: '$' + this.SecurityUtils.formatCurrency(calculations.totalAmount) },
            { element: interestRatioSpan, value: calculations.interestRatio.toFixed(1) + '%' },
            { element: totalPaymentsSpan, value: calculations.numberOfPayments.toLocaleString() }
        ];

        updates.forEach(update => {
            if (update.element) {
                update.element.textContent = update.value;
                update.element.classList.remove('placeholder');
                update.element.classList.add('calculated');
            }
        });

        // Ensure result is visible and scroll to it
        resultDiv.classList.remove('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        this._showMessage('Calculation completed successfully!', 'success');
    },

    // Handle form reset - restore placeholders
    _handleReset: function() {
        console.log('Resetting form...');
        
        const form = document.getElementById('mortgageForm');
        if (form) {
            form.reset();
        }

        // Clear validation classes
        const inputs = document.querySelectorAll('.form-group input');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });

        // Restore placeholders instead of hiding results
        this._showResultPlaceholders();
        this._hideMessage();
        this._hideInfoTooltip();

        // Focus first input
        const principalInput = document.getElementById('principal');
        if (principalInput) {
            principalInput.focus();
        }

        this._showMessage('Form has been reset.', 'info');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    MortgageCalculator.init();
    
    // Initialize mortgage rates service if available
    if (typeof MortgageRateService !== 'undefined') {
        MortgageRateService.init();
    }
});