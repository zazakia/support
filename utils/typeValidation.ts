import {
  Job,
  User,
  Notification,
  Part,
  Note,
  KPI,
  isJobStatus,
  isJobPriority,
  isUserRole,
  isNotificationType,
} from '../types';

// Simple validation error class
export class ValidationError extends Error {
  constructor(
    public field: string,
    public value: any,
    public expectedType: string,
    message?: string
  ) {
    super(message || `Invalid ${field}: expected ${expectedType}, got ${typeof value}`);
    this.name = 'ValidationError';
  }
}

// Basic type guards
export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: any): value is boolean => typeof value === 'boolean';
export const isDate = (value: any): value is Date => value instanceof Date && !isNaN(value.getTime());
export const isArray = (value: any): value is any[] => Array.isArray(value);
export const isObject = (value: any): value is Record<string, any> => 
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Simple validation functions
export const validateJob = (data: any): Job => {
  if (!isObject(data)) {
    throw new ValidationError('job', data, 'object');
  }

  // Basic validation - just check required fields exist
  const requiredFields = ['id', 'customerId', 'customerName', 'deviceType', 'status', 'priority'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new ValidationError(field, data[field], 'non-empty value');
    }
  }

  // Validate enums
  if (!isJobStatus(data.status)) {
    throw new ValidationError('status', data.status, 'valid job status');
  }

  if (!isJobPriority(data.priority)) {
    throw new ValidationError('priority', data.priority, 'valid job priority');
  }

  // Convert dates and return complete job object
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    estimatedCompletion: data.estimatedCompletion ? new Date(data.estimatedCompletion) : undefined,
    actualCompletion: data.actualCompletion ? new Date(data.actualCompletion) : undefined,
    parts: data.parts || [],
    notes: data.notes || [],
    images: data.images || [],
  } as Job;
};

export const validateUser = (data: any): User => {
  if (!isObject(data)) {
    throw new ValidationError('user', data, 'object');
  }

  const requiredFields = ['id', 'email', 'name', 'role'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new ValidationError(field, data[field], 'non-empty value');
    }
  }

  if (!isUserRole(data.role)) {
    throw new ValidationError('role', data.role, 'valid user role');
  }

  return data as User;
};

export const validateNotification = (data: any): Notification => {
  if (!isObject(data)) {
    throw new ValidationError('notification', data, 'object');
  }

  const requiredFields = ['id', 'userId', 'title', 'message', 'type'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new ValidationError(field, data[field], 'non-empty value');
    }
  }

  if (!isNotificationType(data.type)) {
    throw new ValidationError('type', data.type, 'valid notification type');
  }

  return {
    ...data,
    createdAt: new Date(data.createdAt),
  } as Notification;
};

export const validatePart = (data: any): Part => {
  if (!isObject(data)) {
    throw new ValidationError('part', data, 'object');
  }

  const requiredFields = ['id', 'name', 'partNumber', 'cost', 'quantity'];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      throw new ValidationError(field, data[field], 'non-null value');
    }
  }

  return data as Part;
};

export const validateNote = (data: any): Note => {
  if (!isObject(data)) {
    throw new ValidationError('note', data, 'object');
  }

  const requiredFields = ['id', 'text', 'authorId', 'authorName', 'timestamp', 'type'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new ValidationError(field, data[field], 'non-empty value');
    }
  }

  return {
    ...data,
    timestamp: new Date(data.timestamp),
  } as Note;
};

export const validateKPI = (data: any): KPI => {
  if (!isObject(data)) {
    throw new ValidationError('kpi', data, 'object');
  }

  const requiredFields = ['totalJobs', 'completedJobs', 'pendingJobs', 'revenue'];
  for (const field of requiredFields) {
    if (typeof data[field] !== 'number') {
      throw new ValidationError(field, data[field], 'number');
    }
  }

  return data as KPI;
};

// Array validation helpers
export const validateJobArray = (data: any[]): Job[] => {
  if (!isArray(data)) {
    throw new ValidationError('jobs', data, 'array');
  }
  return data.map(validateJob);
};

export const validateUserArray = (data: any[]): User[] => {
  if (!isArray(data)) {
    throw new ValidationError('users', data, 'array');
  }
  return data.map(validateUser);
};

export const validateNotificationArray = (data: any[]): Notification[] => {
  if (!isArray(data)) {
    throw new ValidationError('notifications', data, 'array');
  }
  return data.map(validateNotification);
};

// API Response validation functions
export const validateApiResponse = <T>(
  data: any,
  validator: (item: any) => T
): T => {
  if (!isObject(data)) {
    throw new ValidationError('response', data, 'object');
  }

  if (!data.success) {
    throw new ValidationError('success', data.success, 'true');
  }

  if (!data.data) {
    throw new ValidationError('data', data.data, 'non-null value');
  }

  return validator(data.data);
};

export const validatePaginatedResponse = <T>(
  data: any,
  validator: (item: any) => T
): { items: T[]; pagination: any } => {
  if (!isObject(data)) {
    throw new ValidationError('response', data, 'object');
  }

  if (!data.success) {
    throw new ValidationError('success', data.success, 'true');
  }

  if (!isArray(data.data)) {
    throw new ValidationError('data', data.data, 'array');
  }

  if (!data.pagination || !isObject(data.pagination)) {
    throw new ValidationError('pagination', data.pagination, 'pagination object');
  }

  const requiredPaginationFields = ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev'];
  for (const field of requiredPaginationFields) {
    if (!(field in data.pagination)) {
      throw new ValidationError(`pagination.${field}`, data.pagination[field], 'required field');
    }
  }

  return {
    items: data.data.map(validator),
    pagination: data.pagination,
  };
};

// Safe validation functions that return results instead of throwing
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: ValidationError;
}

export const safeValidateJob = (data: any): ValidationResult<Job> => {
  try {
    return {
      success: true,
      data: validateJob(data),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ValidationError ? error : new ValidationError('job', data, 'valid Job object'),
    };
  }
};

export const safeValidateUser = (data: any): ValidationResult<User> => {
  try {
    return {
      success: true,
      data: validateUser(data),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ValidationError ? error : new ValidationError('user', data, 'valid User object'),
    };
  }
};

export const safeValidateNotification = (data: any): ValidationResult<Notification> => {
  try {
    return {
      success: true,
      data: validateNotification(data),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ValidationError ? error : new ValidationError('notification', data, 'valid Notification object'),
    };
  }
};

export const safeValidateApiResponse = <T>(
  data: any,
  validator: (item: any) => T
): ValidationResult<T> => {
  try {
    return {
      success: true,
      data: validateApiResponse(data, validator),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ValidationError ? error : new ValidationError('apiResponse', data, 'valid API response'),
    };
  }
};

export const safeValidatePaginatedResponse = <T>(
  data: any,
  validator: (item: any) => T
): ValidationResult<{ items: T[]; pagination: any }> => {
  try {
    return {
      success: true,
      data: validatePaginatedResponse(data, validator),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ValidationError ? error : new ValidationError('paginatedResponse', data, 'valid paginated response'),
    };
  }
};