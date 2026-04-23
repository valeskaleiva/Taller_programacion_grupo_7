// Formatting utility functions

/**
 * Format a number to currency
 * @param {number} amount - The amount of money
 * @param {string} currency - The currency symbol
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency) {
    return `${currency}${amount.toFixed(2)}`;
}

/**
 * Format a date to a specific string format
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
function formatDate(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format text to capitalize the first letter
 * @param {string} text - The text to format
 * @returns {string} Capitalized text
 */
function capitalizeText(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Exporting functions
module.exports = {
    formatCurrency,
    formatDate,
    capitalizeText
};