import {
  ApiResponse,
  PaginatedResponse,
  AuthResponse,
  JobResponse,
  JobsResponse,
  UserResponse,
  UsersResponse,

  NotificationsResponse,
  KPIResponse,
  ApiErrorResponse,
  ValidationErrorResponse,
  AuthErrorResponse,
  NetworkErrorResponse,
  ServerErrorResponse,
  CreateJobRequest,
  UpdateJobRequest,
  LoginRequest,
  CreateUserRequest,
  UpdateUserRequest,
  AddNoteRequest,
  AddPartRequest,
  JobQueryParams,
  UserQueryParams,
  Job,
  User,
  Notification,
  KPI,
  Note,
  Part,
} from '../types';

import {
  validateJob,
  validateUser,
  validateNotification,
  validateNote,
  validatePart,
  validateKPI,
  validateApiResponse,
  validatePaginatedResponse,
} from './typeValidation';

// Base API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.repairshop.com';
const API_TIMEOUT = 10000;

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Type guards for API responses
export const isApiResponse = <T>(response: any): response is ApiResponse<T> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    'status' in response &&
    'data' in response &&
    response.success === true
  );
};

export const isPaginatedResponse = <T>(response: any): response is PaginatedResponse<T> => {
  return (
    isApiResponse(response) &&
    'pagination' in response &&
    typeof response.pagination === 'object' &&
    response.pagination !== null &&
    'page' in response.pagination &&
    'limit' in response.pagination &&
    'total' in response.pagination &&
    'totalPages' in response.pagination &&
    'hasNext' in response.pagination &&
    'hasPrev' in response.pagination
  );
};

export const isAuthResponse = (response: any): response is AuthResponse => {
  return (
    isApiResponse(response) &&
    'token' in response &&
    'refreshToken' in response &&
    'expiresIn' in response &&
    typeof response.token === 'string' &&
    typeof response.refreshToken === 'string' &&
    typeof response.expiresIn === 'number'
  );
};

// Error response type guards
export const isApiErrorResponse = (response: any): response is ApiErrorResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response &&
    typeof response.error === 'object' &&
    response.error !== null &&
    'code' in response.error &&
    'message' in response.error &&
    'timestamp' in response.error
  );
};

export const isValidationErrorResponse = (response: any): response is ValidationErrorResponse => {
  return (
    isApiErrorResponse(response) &&
    response.error.code === 'VALIDATION_ERROR' &&
    'details' in response.error &&
    response.error.details !== null &&
    response.error.details !== undefined &&
    'fields' in response.error.details &&
    Array.isArray(response.error.details.fields)
  );
};

export const isAuthErrorResponse = (response: any): response is AuthErrorResponse => {
  return (
    isApiErrorResponse(response) &&
    ['AUTH_ERROR', 'TOKEN_EXPIRED', 'INVALID_CREDENTIALS', 'INSUFFICIENT_PERMISSIONS'].includes(response.error.code)
  );
};

export const isNetworkErrorResponse = (response: any): response is NetworkErrorResponse => {
  return (
    isApiErrorResponse(response) &&
    ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_FAILED'].includes(response.error.code)
  );
};

export const isServerErrorResponse = (response: any): response is ServerErrorResponse => {
  return (
    isApiErrorResponse(response) &&
    ['INTERNAL_ERROR', 'SERVICE_UNAVAILABLE', 'DATABASE_ERROR'].includes(response.error.code)
  );
};

// The validation functions are now imported from typeValidation.ts

// HTTP client with proper error handling
class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Retry logic with exponential backoff
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    attempts: number,
    delay: number
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempts <= 1) {
        throw error;
      }

      // Don't retry on authentication errors or client errors (4xx)
      if (error instanceof ApiError) {
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryRequest(requestFn, attempts - 1, delay * 2);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipRetry: boolean = false
  ): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const url = `${this.baseURL}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.defaultHeaders,
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
          // Handle different types of API errors based on response structure
          if (isValidationErrorResponse(responseData)) {
            throw new ApiError(
              response.status,
              responseData.error.message,
              responseData.error.code,
              responseData.error.details
            );
          }
          
          if (isAuthErrorResponse(responseData)) {
            throw new ApiError(
              response.status,
              responseData.error.message,
              responseData.error.code,
              responseData.error.details
            );
          }
          
          if (isServerErrorResponse(responseData)) {
            throw new ApiError(
              response.status,
              responseData.error.message,
              responseData.error.code,
              responseData.error.details
            );
          }
          
          if (isApiErrorResponse(responseData)) {
            throw new ApiError(
              response.status,
              responseData.error.message,
              responseData.error.code,
              responseData.error.details
            );
          }

          // Fallback for non-structured error responses
          throw new ApiError(
            response.status,
            responseData.message || `HTTP ${response.status}: ${response.statusText}`,
            responseData.code || 'UNKNOWN_ERROR',
            responseData.details
          );
        }

        // Validate successful response structure
        if (!isApiResponse(responseData) && !isPaginatedResponse(responseData)) {
          console.warn('API response does not match expected structure:', responseData);
        }

        return responseData;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof ApiError) {
          throw error;
        }
        
        if ((error as Error).name === 'AbortError') {
          throw new ApiError(408, 'Request timeout. Please check your connection and try again.', 'TIMEOUT');
        }
        
        throw new ApiError(0, 'Network error. Please check your internet connection.', 'NETWORK_ERROR', error);
      }
    };

    if (skipRetry) {
      return makeRequest();
    }

    return this.retryRequest(makeRequest, this.retryAttempts, this.retryDelay);
  }

  async get<T>(endpoint: string, params?: Record<string, any>, skipRetry?: boolean): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' }, skipRetry);
  }

  async post<T>(endpoint: string, data?: any, skipRetry?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, skipRetry);
  }

  async put<T>(endpoint: string, data?: any, skipRetry?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, skipRetry);
  }

  async patch<T>(endpoint: string, data?: any, skipRetry?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, skipRetry);
  }

  async delete<T>(endpoint: string, skipRetry?: boolean): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, skipRetry);
  }

  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

// Create API client instance
export const apiClient = new HttpClient(API_BASE_URL);

// API service functions with proper typing and validation
export const jobsApi = {
  async getJobs(params?: JobQueryParams): Promise<Job[]> {
    const response = await apiClient.get<JobsResponse>('/jobs', params);
    
    if (!isPaginatedResponse(response)) {
      throw new ApiError(500, 'Invalid jobs response format', 'INVALID_RESPONSE');
    }
    
    const validated = validatePaginatedResponse(response, validateJob);
    return validated.items;
  },

  async getJob(jobId: string): Promise<Job> {
    const response = await apiClient.get<JobResponse>(`/jobs/${jobId}`);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid job response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, validateJob);
  },

  async createJob(jobData: CreateJobRequest): Promise<Job> {
    const response = await apiClient.post<JobResponse>('/jobs', jobData);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid job creation response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, validateJob);
  },

  async updateJob(jobId: string, updates: UpdateJobRequest): Promise<Job> {
    const response = await apiClient.patch<JobResponse>(`/jobs/${jobId}`, updates);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid job update response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, validateJob);
  },

  async deleteJob(jobId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/jobs/${jobId}`);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid delete response format', 'INVALID_RESPONSE');
    }
  },

  async addNote(noteData: AddNoteRequest): Promise<Note> {
    const response = await apiClient.post<ApiResponse<Note>>(`/jobs/${noteData.jobId}/notes`, noteData);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid note creation response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, validateNote);
  },

  async addPart(partData: AddPartRequest): Promise<Part> {
    const response = await apiClient.post<ApiResponse<Part>>(`/jobs/${partData.jobId}/parts`, partData);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid part creation response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, validatePart);
  },
};

export const usersApi = {
  async getUsers(params?: UserQueryParams): Promise<User[]> {
    const response = await apiClient.get<UsersResponse>('/users', params);
    
    if (!isPaginatedResponse(response)) {
      throw new ApiError(500, 'Invalid users response format', 'INVALID_RESPONSE');
    }
    
    const validated = validatePaginatedResponse(response, validateUser);
    return validated.items;
  },

  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get<UserResponse>(`/users/${userId}`);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid user response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, validateUser);
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<UserResponse>('/users', userData);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid user creation response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, validateUser);
  },

  async updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<UserResponse>(`/users/${userId}`, updates);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid user update response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, validateUser);
  },

  async deleteUser(userId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${userId}`);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid delete response format', 'INVALID_RESPONSE');
    }
  },
};

export const authApi = {
  async login(credentials: LoginRequest): Promise<{ user: User; token: string; refreshToken: string; expiresIn: number }> {
    // Don't retry authentication requests
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials, true);
    
    if (!isAuthResponse(response)) {
      throw new ApiError(500, 'Invalid login response format', 'INVALID_RESPONSE');
    }
    
    return {
      user: validateApiResponse(response, validateUser),
      token: response.token,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    };
  },

  async logout(): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout', undefined, true);
    apiClient.removeAuthToken();
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid logout response format', 'INVALID_RESPONSE');
    }
  },

  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    const response = await apiClient.post<ApiResponse<{ token: string; expiresIn: number }>>('/auth/refresh', {
      refreshToken,
    }, true);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid token refresh response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, (data: any) => {
      if (!data.token || !data.expiresIn) {
        throw new Error('Invalid token data structure');
      }
      return data;
    });
  },
};

export const notificationsApi = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const response = await apiClient.get<NotificationsResponse>(`/users/${userId}/notifications`);
    
    if (!isPaginatedResponse(response)) {
      throw new ApiError(500, 'Invalid notifications response format', 'INVALID_RESPONSE');
    }
    
    const validated = validatePaginatedResponse(response, validateNotification);
    return validated.items;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const response = await apiClient.patch<ApiResponse<void>>(`/notifications/${notificationId}`, { read: true });
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid mark as read response format', 'INVALID_RESPONSE');
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const response = await apiClient.patch<ApiResponse<void>>(`/users/${userId}/notifications/mark-all-read`);
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid mark all as read response format', 'INVALID_RESPONSE');
    }
  },
};

export const kpiApi = {
  async getKPIs(): Promise<KPI> {
    const response = await apiClient.get<KPIResponse>('/analytics/kpis');
    
    if (!isApiResponse(response)) {
      throw new ApiError(500, 'Invalid KPI response format', 'INVALID_RESPONSE');
    }
    
    return validateApiResponse(response, validateKPI);
  },
};