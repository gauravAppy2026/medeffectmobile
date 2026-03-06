export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Invalid email format';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

// HIPAA: Strong password policy - 12+ chars with uppercase, lowercase, number, special char
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 12) return 'Password must be at least 12 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[@$!%*?&#]/.test(password)) return 'Password must contain at least one special character (@$!%*?&#)';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  if (!/^[\d\s\-\(\)\+]+$/.test(phone)) return 'Invalid phone format';
  return null;
};
