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

        // Check loan limits if location selected
        this.checkLoanLimits(principal);

        // Perform calculation
        const calculations = this.calculate(principal, interestRate, term);

        // Display results
        UIManager.displayMortgageResults(calculations, principal, interestRate, term);
    },

    // Get and validate inputs securely
    getSecureInputs: function() {
        console.log('=== Getting secure inputs ===');
        
        const principalInput = document.getElementById('principal');
        const interestRateInput = document.getElementById('interestRate');
        const termInput = document.getElementById('term');

        if (!principalInput || !interestRateInput || !termInput) {
            console.error('Form elements not found');
            UIManager.showMessage('Form elements not found. Please refresh the page.', 'error');
            return null;
        }

        // Get sanitized values
        const principalValue = SecurityUtils.sanitizeInput(principalInput.value);
        const interestRateValue = SecurityUtils.sanitizeInput(interestRateInput.value);
        const termValue = SecurityUtils.sanitizeInput(termInput.value);

        console.log('Raw input values:', {
            principal: principalInput.value,
            principalSanitized: principalValue,
            interestRate: interestRateValue,
            term: termValue
        });

        // Validate all inputs
        const validation = Validator.validateMortgageInputs(principalValue, interestRateValue, termValue);
        console.log('Validation result:', validation);
        
        if (!validation.isValid) {
            console.warn('Validation failed:', validation.errors);
            UIManager.showMessage(validation.errors[0], 'error');
            return null;
        }

        const parsedInputs = {
            principal: parseFloat(principalValue),
            interestRate: parseFloat(interestRateValue),
            term: parseInt(termValue, 10)
        };
        
        console.log('Parsed inputs:', parsedInputs);
        return parsedInputs;
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

        UIManager.showMessage('Mortage Form Reset.', 'info');
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
                input.addEventListener('input', () => {
                    // Format principal input with commas
                    if (inputId === 'principal') {
                        this.formatPrincipalInput(input);
                    }
                    this.validateInput(input);
                });
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
    },

    // Format principal input with commas
    formatPrincipalInput: function(input) {
        if (!input || input.id !== 'principal') return;
        
        const cursorPosition = input.selectionStart;
        const oldValue = input.value;
        const oldLength = oldValue.length;
        
        // Format the value with commas
        const formatted = SecurityUtils.formatNumberWithCommas(oldValue);
        
        console.log('Formatting principal:', {
            oldValue,
            formatted,
            cursorPosition
        });
        
        if (formatted !== oldValue) {
            input.value = formatted;
            
            // Calculate new cursor position
            // Count commas before cursor in old and new values
            const oldCommasBefore = (oldValue.substring(0, cursorPosition).match(/,/g) || []).length;
            const newCommasBefore = (formatted.substring(0, cursorPosition).match(/,/g) || []).length;
            const commaDiff = newCommasBefore - oldCommasBefore;
            
            // Adjust cursor position
            const newPosition = Math.min(cursorPosition + commaDiff, formatted.length);
            
            console.log('Cursor adjustment:', {
                oldCommasBefore,
                newCommasBefore,
                commaDiff,
                newPosition
            });
            
            // Set cursor position (only works with type="text")
            try {
                input.setSelectionRange(newPosition, newPosition);
            } catch (e) {
                // Silently fail if input type doesn't support selection
                console.warn('Unable to set cursor position:', e.message);
            }
        }
    },

    // Generate amortization schedule
    generateAmortizationSchedule: function(principal, annualRate, years) {
        AppConfig.performance.start('generateAmortization');
        
        const monthlyRate = (annualRate / 100) / 12;
        const numberOfPayments = years * 12;
        const monthlyPayment = this.calculate(principal, annualRate, years).monthlyPayment;
        
        const schedule = [];
        let balance = principal;
        
        for (let month = 1; month <= numberOfPayments; month++) {
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

    // Check loan limits based on property location
    checkLoanLimits: function(principal) {
        console.log('=== checkLoanLimits called ===');
        console.log('Principal:', principal);
        
        const loanLimitSection = document.getElementById('loanLimitSection');
        const jumboAlert = document.getElementById('jumboLoanAlert');

        console.log('Elements found:', {
            loanLimitSection: !!loanLimitSection,
            jumboAlert: !!jumboAlert
        });

        // Only check if LoanLimitService is available
        if (typeof LoanLimitService === 'undefined') {
            console.warn('LoanLimitService not available');
            return;
        }

        const baselineLimit = LoanLimitService.getBaselineLimit();
        console.log('Baseline limit:', baselineLimit);
        console.log('Principal > baseline?', principal > baselineLimit);

        // Show/hide the jumbo alert based on principal amount
        if (principal > baselineLimit) {
            // Show the alert if principal exceeds baseline
            console.log('Showing jumbo alert');
            if (jumboAlert) {
                jumboAlert.classList.remove('hidden');
                console.log('Jumbo alert displayed');
            }
        } else {
            // Hide the alert if principal is below baseline
            console.log('Hiding jumbo alert and location section');
            if (jumboAlert) {
                jumboAlert.classList.add('hidden');
            }
            // Also hide the property location section and indicator
            if (loanLimitSection) {
                loanLimitSection.classList.add('hidden');
                console.log('Location section hidden');
            }
            UIManager.hideLoanTypeIndicator();
            return;
        }

        // If property location section is visible, check the loan type
        const sectionIsVisible = loanLimitSection && !loanLimitSection.classList.contains('hidden');
        console.log('Location section visible?', sectionIsVisible);
        
        if (sectionIsVisible && typeof LocationSearch !== 'undefined') {
            const state = LocationSearch.getSelectedState();
            const county = LocationSearch.getSelectedCounty();

            console.log('Selected location:', { state, county });

            if (!state) {
                // No state selected, hide indicator
                console.log('No state selected, hiding indicator');
                UIManager.hideLoanTypeIndicator();
                return;
            }

            // Determine loan type
            const loanTypeInfo = LoanLimitService.determineLoanType(principal, state, county);
            console.log('Loan type determined:', loanTypeInfo);
            
            // Update UI
            UIManager.updateLoanTypeIndicator(loanTypeInfo);
            console.log('UI updated with loan type info');
        }
        
        console.log('=== checkLoanLimits complete ===');
    },

    // Setup location change handlers
    setupLocationHandlers: function() {
        console.log('=== Setting up location handlers ===');
        
        const principalInput = document.getElementById('principal');
        const checkLocationBtn = document.getElementById('checkLocationBtn');

        console.log('Handler elements:', {
            principalInput: !!principalInput,
            checkLocationBtn: !!checkLocationBtn
        });

        // Initialize LocationSearch if available
        if (typeof LocationSearch !== 'undefined') {
            console.log('Initializing LocationSearch');
            LocationSearch.init();
        } else {
            console.warn('LocationSearch not available');
        }

        // Handle principal change
        if (principalInput) {
            principalInput.addEventListener('input', () => {
                const principal = parseFloat(principalInput.value.replace(/,/g, ''));
                console.log('Principal input changed to:', principal);
                
                if (!isNaN(principal) && principal > 0) {
                    this.checkLoanLimits(principal);
                } else {
                    console.log('Invalid or zero principal, hiding elements');
                    UIManager.hideLoanTypeIndicator();
                    // Hide alert and location section when no principal
                    const jumboAlert = document.getElementById('jumboLoanAlert');
                    const loanLimitSection = document.getElementById('loanLimitSection');
                    if (jumboAlert) jumboAlert.classList.add('hidden');
                    if (loanLimitSection) loanLimitSection.classList.add('hidden');
                }
            });
        }

        // Handle "Check Property Location" button click
        console.log('Check location button found:', !!checkLocationBtn);
        
        if (checkLocationBtn) {
            checkLocationBtn.addEventListener('click', () => {
                console.log('=== Check Property Location button clicked ===');
                const loanLimitSection = document.getElementById('loanLimitSection');
                
                if (loanLimitSection) {
                    console.log('Showing location section');
                    loanLimitSection.classList.remove('hidden');
                    console.log('Section classes after remove:', loanLimitSection.className);
                    
                    // Scroll to the section smoothly
                    setTimeout(() => {
                        console.log('Scrolling to location section');
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
                        console.log('Re-checking loan limits with principal:', principal);
                        if (!isNaN(principal)) {
                            this.checkLoanLimits(principal);
                        }
                    }
                } else {
                    console.error('Loan limit section not found!');
                }
            });
        }
        
        console.log('=== Location handlers setup complete ===');
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MortgageCalculator;
}