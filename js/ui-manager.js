/**
 * UI Manager for Financial Calculators
 * ------------------------------------
 * Handles all user interface updates, event bindings, validation, tooltips, tab switching,
 * keyboard shortcuts, and result display for the financial calculator web app.
 * All direct DOM manipulation and UI logic should be centralized here.
 *
 * Exposed Methods:
 * - showMessage(message, type)
 * - hideMessage()
 * - showMortgagePlaceholders()
 * - showRentPlaceholders()
 * - showCreditPlaceholders()
 * - updateInputValidation(input, isValid)
 * - displayMortgageResults(calculations, principal, interestRate, term)
 * - setupInfoTooltips()
 * - showInfoTooltip(infoType)
 * - hideInfoTooltip()
 * - setupKeyboardShortcuts()
 * - updateLoanTypeIndicator(loanTypeInfo)
 * - hideLoanTypeIndicator()
 * - populateStates(states)
 * - populateCounties(counties)
 * - setupCalculatorTabs()
 */

const UIManager = {
    /**
     * Info content for tooltips.
     * @type {Object}
     */
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
        },
        loanLimits: {
            title: "Conforming vs Jumbo Loans",
            content: "Conforming loans follow limits set by the Federal Housing Finance Agency (FHFA) and can be purchased by Fannie Mae and Freddie Mac. These loans typically offer better interest rates and terms. Jumbo loans exceed these limits and usually require higher credit scores, larger down payments, and come with higher interest rates. The 2026 baseline limit is $832,750, but many counties have higher limits based on local housing costs."
        }
    },

    /**
     * Show a secure message to the user.
     * @param {string} message - The message to display.
     * @param {string} [type='info'] - Message type: 'info', 'success', 'error'.
     */
    showMessage: function(message, type = 'info') {
        const messageDiv = document.getElementById('message');
        if (!messageDiv) return;

        const sanitizedMessage = SecurityUtils.sanitizeText(message);
        messageDiv.textContent = sanitizedMessage;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');

        // Auto-hide info messages after 3 seconds
        if (type === 'info' || type === 'success') {
            setTimeout(() => {
                this.hideMessage();
            }, 3000);
        }
    },

    /**
     * Hide the message display.
     */
    hideMessage: function() {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.classList.add('hidden');
        }
    },

    /**
     * Show mortgage result placeholders in the UI.
     */
    showMortgagePlaceholders: function() {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.classList.remove('hidden');
        }

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

    /**
     * Show rent result placeholders in the UI.
     */
    showRentPlaceholders: function() {
        const placeholders = {
            // 15-year placeholders
            'rate15Display': '--.--% rate',
            'principal15yr': '$---,---',
            'totalInterest15yr': '$---,---',
            
            // 30-year placeholders
            'rate30Display': '--.--% rate',
            'principal30yr': '$---,---',
            'totalInterest30yr': '$---,---',
            
            // 50-year placeholders
            'rate50Display': '--.--% rate*',
            'principal50yr': '$---,---',
            'totalInterest50yr': '$---,---'
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

    /**
     * Show credit card result placeholders in the UI.
     */
    showCreditPlaceholders: function() {
        const placeholders = {
            'initialBalance': '$---,---',
            'payoffTime': '-- months',
            'totalCreditInterest': '$---,---',
            'totalCreditAmount': '$---,---',
            'monthlyInterestRate': '--.--% '
        };

        Object.keys(placeholders).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = placeholders[id];
                element.classList.add('placeholder');
            }
        });
    },

    /**
     * Update input validation styling for a given input.
     * @param {HTMLElement} input - The input element.
     * @param {boolean} isValid - Whether the input is valid.
     */
    updateInputValidation: function(input, isValid) {
        if (!input) return;

        const value = input.value.trim();

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

    /**
     * Display mortgage calculation results in the UI.
     * @param {Object} calculations - Calculation results.
     * @param {number} principal - Principal amount.
     * @param {number} interestRate - Interest rate.
     * @param {number} term - Loan term in years.
     */
    displayMortgageResults: function(calculations, principal, interestRate, term) {
        const resultDiv = document.getElementById('result');
        const paymentSpan = document.getElementById('monthlyPayment');
        const principalDisplay = document.getElementById('principalDisplay');
        const interestDisplay = document.getElementById('interestDisplay');
        const termDisplay = document.getElementById('termDisplay');
        const totalInterestSpan = document.getElementById('totalInterest');
        const totalAmountSpan = document.getElementById('totalAmount');
        const interestRatioSpan = document.getElementById('interestRatio');
        const totalPaymentsSpan = document.getElementById('totalPayments');

        if (!resultDiv || !paymentSpan) {
            this.showMessage('Unable to display results. Please try again.', 'error');
            return;
        }

        // Update values and remove placeholder classes
        const updates = [
            { element: paymentSpan, value: SecurityUtils.formatCurrency(calculations.monthlyPayment) },
            { element: principalDisplay, value: '$' + SecurityUtils.formatCurrency(principal) },
            { element: interestDisplay, value: interestRate.toFixed(2) + '%' },
            { element: termDisplay, value: term + ' years' },
            { element: totalInterestSpan, value: '$' + SecurityUtils.formatCurrency(calculations.totalInterest) },
            { element: totalAmountSpan, value: '$' + SecurityUtils.formatCurrency(calculations.totalAmount) },
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

        resultDiv.classList.remove('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        this.showMessage('Calculation completed successfully!', 'success');
    },

    /**
     * Setup info tooltips for info icons.
     */
    setupInfoTooltips: function() {
        const infoIcons = document.querySelectorAll('.info-icon');
        infoIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                const infoType = icon.getAttribute('data-info');
                this.showInfoTooltip(infoType);
            });
        });

        const tooltipClose = document.querySelector('.tooltip-close');
        if (tooltipClose) {
            tooltipClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideInfoTooltip();
            });
        }

        // Close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            const tooltip = document.getElementById('infoTooltip');
            const isClickInsideTooltip = tooltip && tooltip.contains(e.target);
            const isInfoIcon = e.target.closest('.info-icon');
            
            if (!isClickInsideTooltip && !isInfoIcon && tooltip && !tooltip.classList.contains('hidden')) {
                this.hideInfoTooltip();
            }
        });

        // Close tooltip with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideInfoTooltip();
            }
        });
    },

    /**
     * Show an info tooltip for a given info type.
     * @param {string} infoType - The info type key.
     */
    showInfoTooltip: function(infoType) {
        const tooltip = document.getElementById('infoTooltip');
        const tooltipText = document.getElementById('tooltipText');
        
        if (!tooltip || !tooltipText) return;

        const infoData = this.INFO_CONTENT[infoType];
        if (!infoData) return;

        // Create safe HTML content
        tooltipText.innerHTML = '';
        
        const titleElement = document.createElement('h4');
        titleElement.textContent = SecurityUtils.sanitizeText(infoData.title);
        
        const contentElement = document.createElement('p');
        contentElement.textContent = SecurityUtils.sanitizeText(infoData.content);
        
        tooltipText.appendChild(titleElement);
        tooltipText.appendChild(contentElement);

        tooltip.classList.remove('hidden');
        
        const closeButton = tooltip.querySelector('.tooltip-close');
        if (closeButton) {
            setTimeout(() => closeButton.focus(), 100);
        }
    },

    /**
     * Hide the info tooltip.
     */
    hideInfoTooltip: function() {
        const tooltip = document.getElementById('infoTooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    },

    /**
     * Setup keyboard shortcuts for calculator actions.
     */
    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to calculate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('calculateButton')?.click();
                AppConfig.log('debug', 'Keyboard shortcut: Calculate');
            }
            
            // Ctrl/Cmd + R to reset (prevent page reload)
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                document.getElementById('resetButton')?.click();
                AppConfig.log('debug', 'Keyboard shortcut: Reset');
            }
            
            // Escape to close tooltips
            if (e.key === 'Escape') {
                this.hideInfoTooltip();
            }
        });
    },

    /**
     * Update the loan type indicator display.
     * @param {Object} loanTypeInfo - Info about the loan type.
     */
    updateLoanTypeIndicator: function(loanTypeInfo) {
        const indicator = document.getElementById('loanTypeIndicator');
        const badge = document.getElementById('loanTypeBadge');
        const limitDisplay = document.getElementById('countyLimitDisplay');
        const statusMessage = document.getElementById('loanStatusMessage');

        if (!indicator || !badge || !limitDisplay || !statusMessage) return;

        // Show the indicator
        indicator.classList.remove('hidden');

        // Update badge
        badge.textContent = loanTypeInfo.loanType;
        badge.className = `badge ${loanTypeInfo.isConforming ? 'conforming' : 'jumbo'}`;

        // Update limit display
        limitDisplay.textContent = '$' + SecurityUtils.formatCurrency(loanTypeInfo.limit);

        // Update status message
        if (loanTypeInfo.isConforming) {
            const remaining = loanTypeInfo.limit - loanTypeInfo.principal;
            statusMessage.textContent = `✓ ${SecurityUtils.formatCurrency(remaining)} below limit`;
            statusMessage.className = 'status-message conforming';
        } else {
            const excess = Math.abs(loanTypeInfo.difference);
            statusMessage.textContent = `⚠ ${SecurityUtils.formatCurrency(excess)} above limit`;
            statusMessage.className = 'status-message jumbo';
        }
    },

    /**
     * Hide the loan type indicator.
     */
    hideLoanTypeIndicator: function() {
        const indicator = document.getElementById('loanTypeIndicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    },

    /**
     * Populate the state dropdown with available states.
     * @param {Array<string>} states - List of state names.
     */
    populateStates: function(states) {
        const stateSelect = document.getElementById('propertyState');
        if (!stateSelect) return;

        // Clear existing options except first
        stateSelect.innerHTML = '<option value="">Select State...</option>';

        // Add state options
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    },

    /**
     * Populate the county dropdown with available counties.
     * @param {Array<string>} counties - List of county names.
     */
    populateCounties: function(counties) {
        const countySelect = document.getElementById('propertyCounty');
        if (!countySelect) return;

        // Clear existing options
        countySelect.innerHTML = '<option value="">Select County...</option>';

        if (counties.length === 0) {
            countySelect.innerHTML = '<option value=""> available</option>';
            countySelect.disabled = true;
            return;
        }

        // Add county options
        counties.forEach(county => {
            const option = document.createElement('option');
            option.value = county;
            option.textContent = county;
            countySelect.appendChild(option);
        });

        countySelect.disabled = false;
    },

    /**
     * Setup tab switching logic for calculator panels.
     * Handles tab navigation and panel visibility.
     * Only toggles .hidden on individual tab panels, not the parent container.
     */
    setupCalculatorTabs: function() {
        const tabMortgage = document.getElementById('tab-mortgage');
        const tabRent = document.getElementById('tab-rent');
        const tabCredit = document.getElementById('tab-credit');
        const panelMortgage = document.getElementById('panel-mortgage');
        const panelRent = document.getElementById('panel-rent');
        const panelCredit = document.getElementById('panel-credit');

        function showPanel(panelToShow, tabToActivate) {
            // Hide all panels
            panelMortgage.classList.add('hidden');
            panelRent.classList.add('hidden');
            panelCredit.classList.add('hidden');
            
            // Deactivate all tabs
            tabMortgage.classList.remove('active');
            tabMortgage.setAttribute('aria-selected', 'false');
            tabRent.classList.remove('active');
            tabRent.setAttribute('aria-selected', 'false');
            tabCredit.classList.remove('active');
            tabCredit.setAttribute('aria-selected', 'false');
            
            // Show selected panel and activate tab
            panelToShow.classList.remove('hidden');
            tabToActivate.classList.add('active');
            tabToActivate.setAttribute('aria-selected', 'true');
        }

        tabMortgage.addEventListener('click', function() {
            showPanel(panelMortgage, tabMortgage);
        });

        tabRent.addEventListener('click', function() {
            showPanel(panelRent, tabRent);
        });

        tabCredit.addEventListener('click', function() {
            showPanel(panelCredit, tabCredit);
        });
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}