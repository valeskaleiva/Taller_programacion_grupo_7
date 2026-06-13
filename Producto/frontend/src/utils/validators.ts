
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

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