// Rent to mortgage calculation logic

const RentCalculator = {
    // Calculate affordable principal (reverse mortgage calculation)
    calculateAffordablePrincipal: function(monthlyPayment, annualRate, years) {
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

    // Get current mortgage rates from UI (enhanced with better detection)
    getCurrentMortgageRates: function() {
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
            console.warn('30-year rate not available from API, using fallback');
            rate30yr = 7.25; // Current market average fallback
        }

        if (!rate15yr) {
            console.warn('15-year rate not available from API, using estimated rate');
            rate15yr = rate30yr - 0.5; // Typical 15-year spread
        }

        return {
            rate30yr: rate30yr,
            rate15yr: rate15yr,
            usingFallback30: !rate30Element || rate30Element.textContent === '...' || rate30Element.textContent === 'N/A',
            usingFallback15: !rate15Element || rate15Element.textContent === '...' || rate15Element.textContent === 'N/A'
        };
    },

    // Handle rent calculation with multiple terms
    handleCalculation: function() {
        console.log('Calculating affordable mortgage from rent...');

        const rentInput = document.getElementById('rentAmount');
        if (!rentInput) {
            UIManager.showMessage('Rent input not found.', 'error');
            return;
        }

        const rentValue = SecurityUtils.sanitizeInput(rentInput.value);
        
        // Validate rent input
        if (!Validator.validateRentInput(rentValue)) {
            UIManager.showMessage('Please enter a valid rent amount between $500 and $20,000.', 'error');
            return;
        }

        const monthlyRent = parseFloat(rentValue);

        // Get current mortgage rates (with fallback detection)
        const rates = this.getCurrentMortgageRates();
        
        console.log('Using rates:', rates);

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
                rate: rates.rate30yr + 0.5, // Always estimated
                term: 50,
                principal: 0,
                totalInterest: 0,
                usingFallback: true // Always true for 50-year
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
        if (rates.usingFallback30 || rates.usingFallback15) {
            UIManager.showMessage('Calculation complete using estimated rates - live rates may not be available.', 'info');
        } else {
            UIManager.showMessage('Calculation complete using current market rates!', 'success');
        }
    },

    // Display multiple rent calculation results
    displayResults: function(calculations) {
        // Update 15-year results
        this.updateResultElements('15yr', calculations['15yr']);
        
        // Update 30-year results
        this.updateResultElements('30yr', calculations['30yr']);
        
        // Update 50-year results
        this.updateResultElements('50yr', calculations['50yr']);
    },

    // Update rent result elements for a specific term
    updateResultElements: function(term, calculation) {
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
            principalElement.textContent = '$' + SecurityUtils.formatCurrency(calculation.principal);
            principalElement.classList.remove('placeholder');
            principalElement.classList.add('calculated');
        }

        if (interestElement) {
            interestElement.textContent = '$' + SecurityUtils.formatCurrency(calculation.totalInterest);
            interestElement.classList.remove('placeholder');
            interestElement.classList.add('calculated');
        }
    },

    // Initialize rent placeholders to show current rates immediately
    initializeWithCurrentRates: function() {
        const rates = this.getCurrentMortgageRates();
        
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
            const estimatedRate = rates.rate30yr + 0.5;
            rate50Element.textContent = `${estimatedRate.toFixed(2)}% est.*`;
            rate50Element.classList.remove('placeholder');
        }
    },

    // Handle rent form reset
    handleReset: function() {
        console.log('Resetting rent form...');
        
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
        UIManager.showRentPlaceholders();
        
        // Re-initialize with current rates
        setTimeout(() => {
            this.initializeWithCurrentRates();
        }, 100);

        // Focus rent input
        if (rentInput) {
            rentInput.focus();
        }

        UIManager.showMessage('Rent form has been reset.', 'info');
    },

    // Setup event listeners
    setupEventListeners: function() {
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

        // Add input validation for rent amount
        const rentInput = document.getElementById('rentAmount');
        if (rentInput) {
            rentInput.addEventListener('input', () => this.validateInput(rentInput));
            rentInput.addEventListener('blur', () => this.validateInput(rentInput));
        }
    },

    // Validate rent input
    validateInput: function(input) {
        if (!input) return;

        const value = input.value.trim();
        const isValid = Validator.validateSingleInput(input.id, value);
        UIManager.updateInputValidation(input, isValid);
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RentCalculator;
}