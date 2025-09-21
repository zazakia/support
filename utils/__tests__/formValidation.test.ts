import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateMinLength,
  validateMaxLength,
  validatePattern,
  validateNumeric,
  validatePasswordStrength,
  validateField,
  validateForm,
  validateFieldRealTime,
  createJobValidationRules,
  loginValidationRules,
  formatPhoneNumber,
  sanitizeInput,
  normalizeEmail,
  validateEmailAvailability,
  validatePhoneAvailability,
  FormValidationError,
} from '../formValidation';
import { CreateJobFormData, LoginFormData } from '../../types';

describe('Form Validation Utilities', () => {
  describe('validateRequired', () => {
    it('should return error for null, undefined, or empty string', () => {
      expect(validateRequired(null, 'Test Field')).toBe('Test Field is required');
      expect(validateRequired(undefined, 'Test Field')).toBe('Test Field is required');
      expect(validateRequired('', 'Test Field')).toBe('Test Field is required');
      expect(validateRequired('   ', 'Test Field')).toBe('Test Field is required');
    });

    it('should return null for valid values', () => {
      expect(validateRequired('valid', 'Test Field')).toBeNull();
      expect(validateRequired(0, 'Test Field')).toBeNull();
      expect(validateRequired(false, 'Test Field')).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('should return null for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name+tag@domain.co.uk')).toBeNull();
      expect(validateEmail('user123@test-domain.org')).toBeNull();
    });

    it('should return error for invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
      expect(validateEmail('test@')).toBe('Please enter a valid email address');
      expect(validateEmail('@domain.com')).toBe('Please enter a valid email address');
      expect(validateEmail('test.domain.com')).toBe('Please enter a valid email address');
    });

    it('should return null for empty email (let required validation handle)', () => {
      expect(validateEmail('')).toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('should return null for valid phone numbers', () => {
      expect(validatePhone('1234567890')).toBeNull();
      expect(validatePhone('(555) 123-4567')).toBeNull();
      expect(validatePhone('+1-555-123-4567')).toBeNull();
      expect(validatePhone('555.123.4567')).toBeNull();
    });

    it('should return error for phone numbers that are too short', () => {
      expect(validatePhone('123456789')).toBe('Phone number must be at least 10 digits');
      expect(validatePhone('555-123')).toBe('Phone number must be at least 10 digits');
    });

    it('should return error for phone numbers that are too long', () => {
      expect(validatePhone('12345678901234567')).toBe('Phone number cannot exceed 15 digits');
    });

    it('should return null for empty phone (let required validation handle)', () => {
      expect(validatePhone('')).toBeNull();
    });
  });

  describe('validateMinLength', () => {
    it('should return error for strings shorter than minimum', () => {
      expect(validateMinLength('ab', 3, 'Name')).toBe('Name must be at least 3 characters long');
    });

    it('should return null for strings meeting minimum length', () => {
      expect(validateMinLength('abc', 3, 'Name')).toBeNull();
      expect(validateMinLength('abcd', 3, 'Name')).toBeNull();
    });

    it('should return null for empty strings (let required validation handle)', () => {
      expect(validateMinLength('', 3, 'Name')).toBeNull();
    });
  });

  describe('validateMaxLength', () => {
    it('should return error for strings longer than maximum', () => {
      expect(validateMaxLength('abcdef', 5, 'Name')).toBe('Name cannot exceed 5 characters');
    });

    it('should return null for strings within maximum length', () => {
      expect(validateMaxLength('abc', 5, 'Name')).toBeNull();
      expect(validateMaxLength('abcde', 5, 'Name')).toBeNull();
    });
  });

  describe('validatePattern', () => {
    it('should return null for strings matching pattern', () => {
      expect(validatePattern('abc123', /^[a-z0-9]+$/, 'Invalid format')).toBeNull();
    });

    it('should return error for strings not matching pattern', () => {
      expect(validatePattern('ABC123', /^[a-z0-9]+$/, 'Invalid format')).toBe('Invalid format');
    });

    it('should return null for empty strings (let required validation handle)', () => {
      expect(validatePattern('', /^[a-z0-9]+$/, 'Invalid format')).toBeNull();
    });
  });

  describe('validateNumeric', () => {
    it('should return null for valid numbers', () => {
      expect(validateNumeric('123', 'Cost')).toBeNull();
      expect(validateNumeric('123.45', 'Cost')).toBeNull();
      expect(validateNumeric('0', 'Cost')).toBeNull();
    });

    it('should return error for non-numeric values', () => {
      expect(validateNumeric('abc', 'Cost')).toBe('Cost must be a valid number');
      expect(validateNumeric('12.34.56', 'Cost')).toBe('Cost must be a valid number');
    });

    it('should return error for negative numbers', () => {
      expect(validateNumeric('-123', 'Cost')).toBe('Cost cannot be negative');
    });

    it('should return null for empty strings (let required validation handle)', () => {
      expect(validateNumeric('', 'Cost')).toBeNull();
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return error for passwords shorter than 8 characters', () => {
      expect(validatePasswordStrength('1234567')).toBe('Password must be at least 8 characters long');
    });

    it('should return error for weak passwords', () => {
      expect(validatePasswordStrength('12345678')).toBe(
        'Password must contain at least 2 of: uppercase letters, lowercase letters, numbers, or special characters'
      );
      expect(validatePasswordStrength('abcdefgh')).toBe(
        'Password must contain at least 2 of: uppercase letters, lowercase letters, numbers, or special characters'
      );
    });

    it('should return null for strong passwords', () => {
      expect(validatePasswordStrength('Password1')).toBeNull();
      expect(validatePasswordStrength('password123')).toBeNull();
      expect(validatePasswordStrength('Password!')).toBeNull();
      expect(validatePasswordStrength('Pass123!')).toBeNull();
    });

    it('should return null for empty passwords (let required validation handle)', () => {
      expect(validatePasswordStrength('')).toBeNull();
    });
  });

  describe('validateField', () => {
    it('should validate required fields', () => {
      const rules = { required: true };
      expect(validateField('', rules, 'Name')).toBe('Name is required');
      expect(validateField('John', rules, 'Name')).toBeNull();
    });

    it('should validate field with multiple rules', () => {
      const rules = { required: true, minLength: 3, maxLength: 10 };
      expect(validateField('', rules, 'Name')).toBe('Name is required');
      expect(validateField('Jo', rules, 'Name')).toBe('Name must be at least 3 characters long');
      expect(validateField('VeryLongName', rules, 'Name')).toBe('Name cannot exceed 10 characters');
      expect(validateField('John', rules, 'Name')).toBeNull();
    });

    it('should validate with custom validation', () => {
      const rules = {
        required: true,
        custom: (value: string) => value === 'forbidden' ? 'This value is not allowed' : null
      };
      expect(validateField('forbidden', rules, 'Name')).toBe('This value is not allowed');
      expect(validateField('allowed', rules, 'Name')).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should validate entire form and return errors', () => {
      const formData: CreateJobFormData = {
        customerName: '',
        customerPhone: '123',
        customerEmail: 'invalid-email',
        deviceType: 'iPhone',
        deviceModel: 'iPhone 14',
        deviceSerial: '',
        issueDescription: 'Short',
        priority: 'medium',
        estimatedCost: 'abc',
      };

      const result = validateForm(formData, createJobValidationRules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.customerName).toBe('customerName is required');
      expect(result.errors.customerPhone).toBe('Phone number must be at least 10 digits');
      expect(result.errors.customerEmail).toBe('Please enter a valid email address');
      expect(result.errors.issueDescription).toBe('issueDescription must be at least 10 characters long');
      expect(result.errors.estimatedCost).toBe('Estimated cost must be a valid number');
    });

    it('should return valid result for correct form data', () => {
      const formData: CreateJobFormData = {
        customerName: 'John Doe',
        customerPhone: '(555) 123-4567',
        customerEmail: 'john@example.com',
        deviceType: 'iPhone',
        deviceModel: 'iPhone 14 Pro',
        deviceSerial: 'ABC123',
        issueDescription: 'Screen is cracked and needs replacement',
        priority: 'medium',
        estimatedCost: '299.99',
      };

      const result = validateForm(formData, createJobValidationRules);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });

  describe('validateFieldRealTime', () => {
    it('should update errors for specific field', () => {
      const currentErrors = { customerName: 'Name is required' };
      const rules = createJobValidationRules;
      
      const newErrors = validateFieldRealTime('customerName', 'John Doe', rules, currentErrors);
      
      expect(newErrors.customerName).toBeUndefined();
    });

    it('should add error for invalid field', () => {
      const currentErrors = {};
      const rules = createJobValidationRules;
      
      const newErrors = validateFieldRealTime('customerEmail', 'invalid-email', rules, currentErrors);
      
      expect(newErrors.customerEmail).toBe('Please enter a valid email address');
    });
  });

  describe('Utility Functions', () => {
    describe('formatPhoneNumber', () => {
      it('should format phone numbers correctly', () => {
        expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
        expect(formatPhoneNumber('555123')).toBe('(555) 123');
        expect(formatPhoneNumber('555')).toBe('555');
        expect(formatPhoneNumber('55512345678901')).toBe('(555) 123-4567');
      });

      it('should handle non-numeric characters', () => {
        expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
        expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567');
      });
    });

    describe('sanitizeInput', () => {
      it('should trim and normalize whitespace', () => {
        expect(sanitizeInput('  hello   world  ')).toBe('hello world');
        expect(sanitizeInput('hello\n\nworld')).toBe('hello world');
        expect(sanitizeInput('hello\t\tworld')).toBe('hello world');
      });
    });

    describe('normalizeEmail', () => {
      it('should convert to lowercase and trim', () => {
        expect(normalizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
        expect(normalizeEmail('User@Domain.org')).toBe('user@domain.org');
      });
    });
  });

  describe('Async Validation', () => {
    describe('validateEmailAvailability', () => {
      it('should return valid for available email', async () => {
        const result = await validateEmailAvailability('available@example.com');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should return invalid for unavailable email', async () => {
        const result = await validateEmailAvailability('admin@repairshop.com');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('This email address is already registered');
      });
    });

    describe('validatePhoneAvailability', () => {
      it('should return valid for available phone', async () => {
        const result = await validatePhoneAvailability('(555) 999-8888');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should return invalid for unavailable phone', async () => {
        const result = await validatePhoneAvailability('555-0123');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('This phone number is already registered');
      });
    });
  });

  describe('Login Validation Rules', () => {
    it('should validate login form correctly', () => {
      const validLogin: LoginFormData = {
        email: 'user@example.com',
        password: 'password123',
      };

      const result = validateForm(validLogin, loginValidationRules);
      expect(result.isValid).toBe(true);
    });

    it('should catch login validation errors', () => {
      const invalidLogin: LoginFormData = {
        email: 'invalid-email',
        password: '123',
      };

      const result = validateForm(invalidLogin, loginValidationRules);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
      expect(result.errors.password).toBe('password must be at least 6 characters long');
    });
  });
});