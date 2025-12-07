// Input validation for financial calculator

const ValidationConfig = {
    MAX_PRINCIPAL: 10000000,    // $10M max
    MIN_PRINCIPAL: 1000,        // $1K min
    MAX_INTEREST_RATE: 30,      // 30% max
    MIN_INTEREST_RATE: 0.01,    // 0.01% min
    MAX_TERM: 50,               // 50 years max
    MIN_TERM: 1,                // 1 year min
    MAX_INPUT_LENGTH: 10,       // Character limit
    
    // Rent validation
    MAX_RENT: 20000,            // $20K max
    MIN_RENT: 500               // $500 min
};

const Validator = {
    // Validate all mortgage inputs
    validateMortgageInputs: function(principal, interestRate, term) {
        const errors = [];

        // Check for HTML injection
        if (SecurityUtils.detectHTMLInjection(principal + interestRate + term)) {
            errors.push('Invalid characters detected in input.');
            return { isValid: false, errors };
        }

        // Validate principal
        if (!SecurityUtils.validateNumericInput(
            principal, 
            ValidationConfig.MIN_PRINCIPAL, 
            ValidationConfig.MAX_PRINCIPAL
        )) {
            errors.push(`Principal must be between $${ValidationConfig.MIN_PRINCIPAL.toLocaleString()} and $${ValidationConfig.MAX_PRINCIPAL.toLocaleString()}.`);
        }

        // Validate interest rate
        if (!SecurityUtils.validateNumericInput(
            interestRate, 
            ValidationConfig.MIN_INTEREST_RATE, 
            ValidationConfig.MAX_INTEREST_RATE
        )) {
            errors.push(`Interest rate must be between ${ValidationConfig.MIN_INTEREST_RATE}% and ${ValidationConfig.MAX_INTEREST_RATE}%.`);
        }

        // Validate term
        if (!SecurityUtils.validateNumericInput(
            term, 
            ValidationConfig.MIN_TERM, 
            ValidationConfig.MAX_TERM
        )) {
            errors.push(`Loan term must be between ${ValidationConfig.MIN_TERM} and ${ValidationConfig.MAX_TERM} years.`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Validate rent input
    validateRentInput: function(rentAmount) {
        return SecurityUtils.validateNumericInput(
            rentAmount, 
            ValidationConfig.MIN_RENT, 
            ValidationConfig.MAX_RENT
        );
    },

    // Real-time input validation
    validateSingleInput: function(inputId, value) {
        // Remove commas before validating
        const cleanValue = value.replace(/,/g, '');
        
        switch (inputId) {
            case 'principal':
                return SecurityUtils.validateNumericInput(
                    cleanValue, 
                    ValidationConfig.MIN_PRINCIPAL, 
                    ValidationConfig.MAX_PRINCIPAL
                );
            case 'interestRate':
                return SecurityUtils.validateNumericInput(
                    cleanValue, 
                    ValidationConfig.MIN_INTEREST_RATE, 
                    ValidationConfig.MAX_INTEREST_RATE
                );
            case 'term':
                return SecurityUtils.validateNumericInput(
                    cleanValue, 
                    ValidationConfig.MIN_TERM, 
                    ValidationConfig.MAX_TERM
                );
            case 'rentAmount':
                return SecurityUtils.validateNumericInput(
                    cleanValue, 
                    ValidationConfig.MIN_RENT, 
                    ValidationConfig.MAX_RENT
                );
            default:
                return false;
        }
    },

    // Add custom error messages
    VALIDATION_MESSAGES: {
        principal: {
            required: 'Principal amount is required',
            min: 'Principal must be at least $1,000',
            max: 'Principal cannot exceed $10,000,000',
            invalid: 'Please enter a valid dollar amount'
        },
        interestRate: {
            required: 'Interest rate is required',
            min: 'Interest rate must be at least 0.01%',
            max: 'Interest rate cannot exceed 30%',
            invalid: 'Please enter a valid interest rate'
        },
        // ... more messages
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Validator, ValidationConfig };
}