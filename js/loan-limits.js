// Conforming Loan Limits Service
// Based on FHFA 2025 data

const LoanLimitService = {
    // Get loan limit for a specific state and county
    getLoanLimit: function(state, county) {
        if (!state || !LoanLimitsData.states[state]) {
            return LoanLimitsData.baseline;
        }

        const stateData = LoanLimitsData.states[state];
        
        // Check if county has specific limit
        if (county && stateData.counties && stateData.counties[county]) {
            return stateData.counties[county];
        }

        // Return state baseline or national baseline
        return stateData.baseline || LoanLimitsData.baseline;
    },

    // Determine if loan is conforming or jumbo
    determineLoanType: function(principal, state, county) {
        const limit = this.getLoanLimit(state, county);
        
        return {
            isConforming: principal <= limit,
            loanType: principal <= limit ? 'Conforming' : 'Jumbo',
            limit: limit,
            principal: principal,
            difference: principal - limit,
            percentageOfLimit: ((principal / limit) * 100).toFixed(1)
        };
    },

    // Get all states (sorted alphabetically)
    getStates: function() {
        return Object.keys(LoanLimitsData.states).sort();
    },

    // Get counties for a specific state (sorted alphabetically)
    getCounties: function(state) {
        if (!state || !LoanLimitsData.states[state]) {
            return [];
        }

        const stateData = LoanLimitsData.states[state];
        if (!stateData.counties) {
            return [];
        }

        return Object.keys(stateData.counties).sort();
    },

    // Get baseline conforming limit
    getBaselineLimit: function() {
        return LoanLimitsData.baseline;
    },

    // Get year of data
    getDataYear: function() {
        return LoanLimitsData.year;
    },

    // Format loan type for display
    formatLoanTypeDisplay: function(loanTypeInfo) {
        const { isConforming, loanType, limit, principal, difference } = loanTypeInfo;
        
        let message = `${loanType} Loan`;
        
        if (isConforming) {
            const remaining = limit - principal;
            message += ` (${SecurityUtils.formatCurrency(remaining)} below limit)`;
        } else {
            message += ` (${SecurityUtils.formatCurrency(Math.abs(difference))} above limit)`;
        }
        
        return message;
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoanLimitService;
}
