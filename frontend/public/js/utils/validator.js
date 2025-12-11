// Form validation utilities

const Validator = {
    // Email validation
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Password validation (minimum 6 characters)
    isValidPassword: (password) => {
        return password && password.length >= 6;
    },

    // Required field validation
    isRequired: (value) => {
        return value && value.trim().length > 0;
    },

    // Year validation
    isValidYear: (year) => {
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(year);
        return yearNum >= 1900 && yearNum <= currentYear + 1;
    },

    // Number validation
    isValidNumber: (value) => {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    // Validate motor form
    validateMotorForm: (formData) => {
        const errors = [];

        if (!Validator.isRequired(formData.chassis_number)) {
            errors.push('Şase numarası gereklidir');
        }

        if (!Validator.isRequired(formData.engine_number)) {
            errors.push('Motor numarası gereklidir');
        }

        if (!Validator.isRequired(formData.color)) {
            errors.push('Renk gereklidir');
        }

        if (!Validator.isRequired(formData.model)) {
            errors.push('Model gereklidir');
        }

        if (!formData.year || !Validator.isValidYear(formData.year)) {
            errors.push('Geçerli bir yıl giriniz');
        }

        return errors;
    },

    // Validate service form
    validateServiceForm: (formData) => {
        const errors = [];

        if (!formData.service_date) {
            errors.push('Servis tarihi gereklidir');
        }

        if (!Validator.isRequired(formData.service_type)) {
            errors.push('Servis tipi gereklidir');
        }

        if (formData.cost && !Validator.isValidNumber(formData.cost)) {
            errors.push('Geçerli bir maliyet giriniz');
        }

        return errors;
    },

    // Validate login form
    validateLoginForm: (data) => {
        const errors = [];

        // Email or username required
        if (!data.email || data.email.trim().length === 0) {
            errors.push('Email veya kullanıcı adı gereklidir');
        }

        // Password required
        if (!data.password || data.password.trim().length === 0) {
            errors.push('Şifre gereklidir');
        }

        return errors;
    },

    // Validate register form
    validateRegisterForm: (formData) => {
        const errors = [];

        if (!Validator.isRequired(formData.username)) {
            errors.push('Kullanıcı adı gereklidir');
        }

        if (!Validator.isValidEmail(formData.email)) {
            errors.push('Geçerli bir email adresi giriniz');
        }

        if (!Validator.isValidPassword(formData.password)) {
            errors.push('Şifre en az 6 karakter olmalıdır');
        }

        if (formData.password !== formData.confirmPassword) {
            errors.push('Şifreler eşleşmiyor');
        }

        return errors;
    }
};
