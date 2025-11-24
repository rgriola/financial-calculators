// UI management for financial calculator

const UIManager = {
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
    },

    // Show secure message
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

    // Hide message
    hideMessage: function() {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.classList.add('hidden');
        }
    },

    // Show mortgage result placeholders
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

    // Show rent result placeholders
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

    // Update input validation styling
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

    // Display mortgage results
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

    // Setup info tooltips
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

    // Show info tooltip
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

    // Hide info tooltip
    hideInfoTooltip: function() {
        const tooltip = document.getElementById('infoTooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}