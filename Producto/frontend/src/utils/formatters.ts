

/**
 * Formatea un número como precio con símbolo de moneda
 * @param {number} amount - The amount of money
 * @param {string} currency - The currency symbol
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount: number, currency: string): string {
    return `${currency}${amount.toFixed(2)}`;
}

/**
 * Format a date to a specific string format
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
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
function capitalizeText(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export {
    formatCurrency,
    formatDate,
    capitalizeText,
};