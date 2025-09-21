import { 
  CreateJobFormData, 
  LoginFormData, 
  ValidationError,
  FieldValidationRule,
  ValidationRules,
  FormValidationResult 
} from '../types';

// Validation error class for form validation
export class FormValidationError extends Error {
  constructor(
    public field: string,
    public value: any,
    message: string
  ) {
    super(message);
    this.name = 'FormValidationError';
  }
}

// Individual field validation functions
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return null; // Let required validation handle empty values
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Let required validation handle empty values
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return 'Phone number must be at least 10 digits';
  }
  
  if (digitsOnly.length > 15) {
    return 'Phone number cannot exceed 15 digits';
  }
  
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (!value) return null; // Let required validation handle empty values
  
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (!value) return null;
  
  if (value.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  return null;
};

export const validatePattern = (value: string, pattern: RegExp, message: string): string | null => {
  if (!value) return null; // Let required validation handle empty values
  
  if (!pattern.test(value)) {
    return message;
  }
  return null;
};

export const validateNumeric = (value: string, fieldName: string): string | null => {
  if (!value) return null; // Let required validation handle empty values
  
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (numericValue < 0) {
    return `${fieldName} cannot be negative`;
  }
  
  return null;
};

export const validatePasswordStrength = (password: string): string | null => {
  if (!password) return null; // Let required validation handle empty values
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (criteriaMet < 2) {
    return 'Password must contain at least 2 of: uppercase letters, lowercase letters, numbers, or special characters';
  }
  
  return null;
};

// Generic field validation function
export const validateField = (
  value: any,
  rules: FieldValidationRule,
  fieldName: string
): string | null => {
  // Check required first
  if (rules.required) {
    const requiredError = validateRequired(value, fieldName);
    if (requiredError) return requiredError;
  }
  
  // If value is empty and not required, skip other validations
  if (!value && !rules.required) return null;
  
  // Convert value to string for string-based validations
  const stringValue = String(value);
  
  // Check minimum length
  if (rules.minLength !== undefined) {
    const minLengthError = validateMinLength(stringValue, rules.minLength, fieldName);
    if (minLengthError) return minLengthError;
  }
  
  // Check maximum length
  if (rules.maxLength !== undefined) {
    const maxLengthError = validateMaxLength(stringValue, rules.maxLength, fieldName);
    if (maxLengthError) return maxLengthError;
  }
  
  // Check pattern
  if (rules.pattern) {
    const patternError = validatePattern(stringValue, rules.pattern, `${fieldName} format is invalid`);
    if (patternError) return patternError;
  }
  
  // Check custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) return customError;
  }
  
  return null;
};

// Form validation function
export const validateForm = <T extends Record<string, any>>(
  formData: T,
  validationRules: ValidationRules
): FormValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validate each field according to its rules
  Object.keys(validationRules).forEach(fieldName => {
    const fieldValue = formData[fieldName];
    const fieldRules = validationRules[fieldName];
    
    const error = validateField(fieldValue, fieldRules, fieldName);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time validation for individual fields
export const validateFieldRealTime = (
  fieldName: string,
  value: any,
  validationRules: ValidationRules,
  currentErrors: Record<string, string>
): Record<string, string> => {
  const newErrors = { ...currentErrors };
  
  if (validationRules[fieldName]) {
    const error = validateField(value, validationRules[fieldName], fieldName);
    
    if (error) {
      newErrors[fieldName] = error;
    } else {
      delete newErrors[fieldName];
    }
  }
  
  return newErrors;
};

// Predefined validation rules for common forms
export const createJobValidationRules: ValidationRules = {
  customerName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  customerPhone: {
    required: true,
    custom: (value: string) => validatePhone(value),
  },
  customerEmail: {
    required: true,
    custom: (value: string) => validateEmail(value),
  },
  deviceType: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  deviceModel: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  deviceSerial: {
    required: false,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9-_]+$/,
  },
  issueDescription: {
    required: true,
    minLength: 10,
    maxLength: 1000,
  },
  estimatedCost: {
    required: false,
    custom: (value: string) => {
      if (value && value.trim() !== '') {
        return validateNumeric(value, 'Estimated cost');
      }
      return null;
    },
  },
};

export const loginValidationRules: ValidationRules = {
  email: {
    required: true,
    custom: (value: string) => validateEmail(value),
  },
  password: {
    required: true,
    minLength: 6, // More lenient for login than registration
  },
};

// Registration validation rules (if needed in the future)
export const registrationValidationRules: ValidationRules = {
  email: {
    required: true,
    custom: (value: string) => validateEmail(value),
  },
  password: {
    required: true,
    custom: (value: string) => validatePasswordStrength(value),
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  phone: {
    required: false,
    custom: (value: string) => validatePhone(value),
  },
};

// Async validation functions for server-side checks
export interface AsyncValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmailAvailability = async (email: string): Promise<AsyncValidationResult> => {
  try {
    // Simulate API call to check email availability
    // In a real app, this would make an actual API request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock validation - in real app, this would check against the server
    const unavailableEmails = ['admin@repairshop.com', 'test@test.com'];
    
    if (unavailableEmails.includes(email.toLowerCase())) {
      return {
        isValid: false,
        error: 'This email address is already registered'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Unable to verify email availability. Please try again.'
    };
  }
};

export const validatePhoneAvailability = async (phone: string): Promise<AsyncValidationResult> => {
  try {
    // Simulate API call to check phone availability
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock validation
    const unavailablePhones = ['555-0123', '555-0124'];
    const normalizedPhone = phone.replace(/\D/g, '');
    
    if (unavailablePhones.some(p => p.replace(/\D/g, '') === normalizedPhone)) {
      return {
        isValid: false,
        error: 'This phone number is already registered'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Unable to verify phone availability. Please try again.'
    };
  }
};

// Utility functions for form handling
export const formatPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length <= 3) {
    return digitsOnly;
  } else if (digitsOnly.length <= 6) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
  } else if (digitsOnly.length <= 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  } else {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
  }
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Debounced validation for real-time feedback
export const createDebouncedValidator = (
  validationFn: (value: any) => Promise<AsyncValidationResult>,
  delay: number = 500
) => {
  let timeoutId: any;
  
  return (value: any): Promise<AsyncValidationResult> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        const result = await validationFn(value);
        resolve(result);
      }, delay);
    });
  };
};

// Export debounced validators
export const debouncedEmailValidation = createDebouncedValidator(validateEmailAvailability);
export const debouncedPhoneValidation = createDebouncedValidator(validatePhoneAvailability);