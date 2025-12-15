/**
 * Input Validation Module
 * Comprehensive validation for all calculator inputs
 * @module validation
 */

import { ValidationConfig } from './config.js';
import { SecurityUtils } from './security-utils.js';
import { AppConfig } from './config.js';

/**
 * Input validator for financial calculators
 * @namespace Validator
 */
export const Validator = {
    /**
     * Validate all mortgage calculator inputs
     * @param {string|number} principal - Principal loan amount
     * @param {string|number} interestRate - Annual interest rate
     * @param {string|number} term - Loan term in years
     * @returns {Object} Validation result with isValid, errors, and fieldErrors
     * @example
     * const result = Validator.validateMortgageInputs("250000", "4.5", "30");
     * if (!result.isValid) {
     *     console.log(result.errors);
     * }
     */
    validateMortgageInputs: function (principal, interestRate, term) {
        const errors = [];
        const fieldErrors = {};

        // Check for HTML injection across all inputs
        const combinedInput = String(principal) + String(interestRate) + String(term);
        if (SecurityUtils.detectHTMLInjection(combinedInput)) {
            errors.push('Invalid characters detected in input.');
            return { isValid: false, errors, fieldErrors };
        }

        // Validate principal
        if (!SecurityUtils.validateNumericInput(
            principal,
            ValidationConfig.principal.min,
            ValidationConfig.principal.max
        )) {
            const error = `${ValidationConfig.principal.label} must be between $${ValidationConfig.principal.min.toLocaleString()} and $${ValidationConfig.principal.max.toLocaleString()}.`;
            errors.push(error);
            fieldErrors.principal = error;
        }

        // Validate interest rate
        if (!SecurityUtils.validateNumericInput(
            interestRate,
            ValidationConfig.interestRate.min,
            ValidationConfig.interestRate.max
        )) {
            const error = `${ValidationConfig.interestRate.label} must be between ${ValidationConfig.interestRate.min}% and ${ValidationConfig.interestRate.max}%.`;
            errors.push(error);
            fieldErrors.interestRate = error;
        }

        // Validate term
        if (!SecurityUtils.validateNumericInput(
            term,
            ValidationConfig.term.min,
            ValidationConfig.term.max
        )) {
            const error = `${ValidationConfig.term.label} must be between ${ValidationConfig.term.min} and ${ValidationConfig.term.max} years.`;
            errors.push(error);
            fieldErrors.term = error;
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            fieldErrors: fieldErrors
        };
    },

    /**
     * Validate rent calculator input
     * @param {string|number} rentAmount - Monthly rent amount
     * @returns {boolean} True if valid
     */
    validateRentInput: function (rentAmount) {
        return SecurityUtils.validateNumericInput(
            rentAmount,
            ValidationConfig.rent.min,
            ValidationConfig.rent.max
        );
    },

    /**
     * Validate credit card calculator inputs
     * @param {string|number} balance - Credit card balance
     * @param {string|number} apr - Annual percentage rate
     * @param {string|number} monthlyPayment - Monthly payment amount
     * @returns {Object} Validation result
     */
    validateCreditCardInputs: function (balance, apr, monthlyPayment) {
        const errors = [];
        const fieldErrors = {};

        // Check for HTML injection
        const combinedInput = String(balance) + String(apr) + String(monthlyPayment);
        if (SecurityUtils.detectHTMLInjection(combinedInput)) {
            errors.push('Invalid characters detected in input.');
            return { isValid: false, errors, fieldErrors };
        }

        // Validate balance
        if (!SecurityUtils.validateNumericInput(
            balance,
            ValidationConfig.creditBalance.min,
            ValidationConfig.creditBalance.max
        )) {
            const error = `${ValidationConfig.creditBalance.label} must be between $${ValidationConfig.creditBalance.min.toLocaleString()} and $${ValidationConfig.creditBalance.max.toLocaleString()}.`;
            errors.push(error);
            fieldErrors.creditBalance = error;
        }

        // Validate APR
        if (!SecurityUtils.validateNumericInput(
            apr,
            ValidationConfig.creditAPR.min,
            ValidationConfig.creditAPR.max
        )) {
            const error = `${ValidationConfig.creditAPR.label} must be between ${ValidationConfig.creditAPR.min}% and ${ValidationConfig.creditAPR.max}%.`;
            errors.push(error);
            fieldErrors.creditAPR = error;
        }

        // Validate monthly payment
        if (!SecurityUtils.validateNumericInput(
            monthlyPayment,
            ValidationConfig.creditPayment.min,
            ValidationConfig.creditPayment.max
        )) {
            const error = `${ValidationConfig.creditPayment.label} must be between $${ValidationConfig.creditPayment.min.toLocaleString()} and $${ValidationConfig.creditPayment.max.toLocaleString()}.`;
            errors.push(error);
            fieldErrors.creditPayment = error;
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            fieldErrors: fieldErrors
        };
    },

    /**
     * Validate single input field in real-time
     * @param {string} inputId - ID of the input element
     * @param {string|number} value - Value to validate
     * @returns {boolean} True if valid
     * @example
     * const isValid = Validator.validateSingleInput('principal', '250000');
     */
    validateSingleInput: function (inputId, value) {
        // Remove commas before validating
        const cleanValue = String(value).replace(/,/g, '');

        AppConfig.log('debug', `Validating ${inputId}`, { value: cleanValue });

        switch (inputId) {
            case 'principal':
                return SecurityUtils.validateNumericInput(
                    cleanValue,
                    ValidationConfig.principal.min,
                    ValidationConfig.principal.max
                );
            case 'interestRate':
                return SecurityUtils.validateNumericInput(
                    cleanValue,
                    ValidationConfig.interestRate.min,
                    ValidationConfig.interestRate.max
                );
            case 'term':
                return SecurityUtils.validateNumericInput(
                    cleanValue,
                    ValidationConfig.term.min,
                    ValidationConfig.term.max
                );
            case 'rentAmount':
                return SecurityUtils.validateNumericInput(
                    cleanValue,
                    ValidationConfig.rent.min,
                    ValidationConfig.rent.max
                );
            case 'creditBalance':
                return SecurityUtils.validateNumericInput(
                    cleanValue,
                    ValidationConfig.creditBalance.min,
                    ValidationConfig.creditBalance.max
                );
            case 'creditAPR':
                return SecurityUtils.validateNumericInput(
                    cleanValue,
                    ValidationConfig.creditAPR.min,
                    ValidationConfig.creditAPR.max
                );
            case 'creditMonthlyPayment':
                return SecurityUtils.validateNumericInput(
                    cleanValue,
                    ValidationConfig.creditPayment.min,
                    ValidationConfig.creditPayment.max
                );
            default:
                AppConfig.log('warn', `Unknown input ID: ${inputId}`);
                return false;
        }
    },

    /**
     * Get user-friendly error message for a field
     * @param {string} fieldId - Field ID
     * @param {string} errorType - Type of error (required, min, max, invalid)
     * @returns {string} Error message
     */
    getErrorMessage: function (fieldId, errorType = 'invalid') {
        const messages = {
            principal: {
                required: 'Principal amount is required',
                min: `Principal must be at least $${ValidationConfig.principal.min.toLocaleString()}`,
                max: `Principal cannot exceed $${ValidationConfig.principal.max.toLocaleString()}`,
                invalid: 'Please enter a valid dollar amount'
            },
            interestRate: {
                required: 'Interest rate is required',
                min: `Interest rate must be at least ${ValidationConfig.interestRate.min}%`,
                max: `Interest rate cannot exceed ${ValidationConfig.interestRate.max}%`,
                invalid: 'Please enter a valid interest rate'
            },
            term: {
                required: 'Loan term is required',
                min: `Term must be at least ${ValidationConfig.term.min} year`,
                max: `Term cannot exceed ${ValidationConfig.term.max} years`,
                invalid: 'Please enter a valid loan term'
            },
            rentAmount: {
                required: 'Rent amount is required',
                min: `Rent must be at least $${ValidationConfig.rent.min}`,
                max: `Rent cannot exceed $${ValidationConfig.rent.max}`,
                invalid: 'Please enter a valid rent amount'
            }
        };

        return messages[fieldId]?.[errorType] || 'Invalid input';
    }
};

export default Validator;