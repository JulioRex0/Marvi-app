export const validateEmail = (email: string) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePasswordLength = (password: string) => {
    if (!password) return false;
    return password.length >= 8;
};

export default { validateEmail, validatePasswordLength };
