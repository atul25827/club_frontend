export function validateEmail(email: string): string | null {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    return null;
}

export function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least 1 uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least 1 number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least 1 special character";
    return null;
}

export function validateSignup(data: any): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!data.employee_code) errors.employee_code = "Employee code is required";

    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;

    if (data.password !== data.confirm_password) {
        errors.confirm_password = "Passwords do not match";
    }

    return errors;
}

export function validateResetPassword(data: any): Record<string, string> {
    const errors: Record<string, string> = {};
    const passwordError = validatePassword(data.new_password);
    if (passwordError) errors.new_password = passwordError;

    if (data.new_password !== data.confirm_password) {
        errors.confirm_password = "Passwords do not match";
    }

    return errors;
}
