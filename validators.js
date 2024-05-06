function isValidEmailAddress(email) {
    const emailRegex = /^[a-zA-Z]{1}\.[a-zA-Z]{2,}@([a-zA-Z]{2,})\.([a-zA-Z]{2,3})$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^06[- ]?\d{8}$/;
    return phoneRegex.test(phoneNumber);
}
