// validators.ts

/**
 * Validate if the input is a valid email address.
 * @param email - The email address to validate.
 * @returns true if valid, else false.
 */
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate if the input is a valid password.
 * @param password - The password to validate.
 * @returns true if valid, else false.
 */
function validatePassword(password: string): boolean {
    const minLength = 8;
    const hasNumber = /[0-9]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    return (
        password.length >= minLength &&
        hasNumber &&
        hasUppercase &&
        hasLowercase
    );
}

/**
 * Validate if the input is a valid form object.
 * @param form - The form object to validate.
 * @returns true if valid, else false.
 */
function validateForm(form: Record<string, any>): boolean {
    // Example validation: check if all fields are filled
    for (const key in form) {
        if (form[key] === '' || form[key] === null || form[key] === undefined) {
            return false;
        }
    }
    return true;
}

export { validateEmail, validatePassword, validateForm };