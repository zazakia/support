import { ApiErrorTransformer, getUserFriendlyMessage } from '../apiErrorTransformer';

// Mock fetch Response
class MockResponse {
  status: number;
  statusText: string;
  headers: Map<string, string>;
  private jsonData: any;
  private textData: string;

  constructor(status: number, data: any, contentType = 'application/json') {
    this.status = status;
    this.statusText = status === 404 ? 'Not Found' : 'Error';
    this.headers = new Map();
    this.headers.set('content-type', contentType);
    
    if (contentType === 'application/json') {
      this.jsonData = data;
      this.textData = JSON.stringify(data);
    } else {
      this.textData = data;
    }
  }

  async json() {
    if (this.headers.get('content-type')?.includes('application/json')) {
      return this.jsonData;
    }
    throw new Error('Not JSON');
  }

  async text() {
    return this.textData;
  }
}

describe('ApiErrorTransformer', () => {
  describe('fromFetchResponse', () => {
    it('should transform JSON error response', async () => {
      const response = new MockResponse(400, {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { field: 'email', error: 'Invalid format' }
      }) as any;

      const apiError = await ApiErrorTransformer.fromFetchResponse(response);

      expect(apiError.status).toBe(400);
      expect(apiError.message).toBe('Validation failed');
      expect(apiError.code).toBe('VALIDATION_ERROR');
      expect(apiError.details).toEqual({ field: 'email', error: 'Invalid format' });
    });

    it('should handle text error response', async () => {
      const response = new MockResponse(500, 'Internal Server Error', 'text/plain') as any;

      const apiError = await ApiErrorTransformer.fromFetchResponse(response);

      expect(apiError.status).toBe(500);
      expect(apiError.message).toBe('Internal Server Error');
    });

    it('should handle response without content-type', async () => {
      const response = {
        status: 404,
        statusText: 'Not Found',
        headers: new Map(),
        json: () => Promise.reject(new Error('Not JSON')),
        text: () => Promise.resolve('Not Found')
      } as any;

      const apiError = await ApiErrorTransformer.fromFetchResponse(response);

      expect(apiError.status).toBe(404);
      expect(apiError.message).toBe('Not Found');
    });

    it('should handle malformed JSON response', async () => {
      const response = {
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.reject(new Error('Malformed JSON')),
        text: () => Promise.resolve('Internal Server Error')
      } as any;

      const apiError = await ApiErrorTransformer.fromFetchResponse(response);

      expect(apiError.status).toBe(500);
      expect(apiError.message).toBe('Internal Server Error');
    });
  });

  describe('fromNetworkError', () => {
    it('should transform network error', () => {
      const networkError = new Error('Network request failed');
      
      const apiError = ApiErrorTransformer.fromNetworkError(networkError);

      expect(apiError.status).toBe(0);
      expect(apiError.message).toBe('Network connection failed. Please check your internet connection.');
      expect(apiError.code).toBe('NETWORK_ERROR');
      expect(apiError.details?.originalMessage).toBe('Network request failed');
    });
  });

  describe('fromTimeoutError', () => {
    it('should create timeout error', () => {
      const apiError = ApiErrorTransformer.fromTimeoutError();

      expect(apiError.status).toBe(408);
      expect(apiError.message).toBe('Request timed out. Please try again.');
      expect(apiError.code).toBe('TIMEOUT_ERROR');
    });
  });

  describe('transformValidationErrors', () => {
    it('should transform array format validation errors', () => {
      const apiError = {
        status: 400,
        message: 'Validation failed',
        details: [
          { field: 'email', message: 'Invalid email format', value: 'invalid-email' },
          { field: 'password', message: 'Password too short', value: '123' }
        ]
      };

      const validationErrors = ApiErrorTransformer.transformValidationErrors(apiError);

      expect(validationErrors).toHaveLength(2);
      expect(validationErrors[0]).toEqual({
        field: 'email',
        message: 'Invalid email format',
        value: 'invalid-email'
      });
      expect(validationErrors[1]).toEqual({
        field: 'password',
        message: 'Password too short',
        value: '123'
      });
    });

    it('should transform object format validation errors', () => {
      const apiError = {
        status: 400,
        message: 'Validation failed',
        details: {
          email: ['Invalid email format', 'Email already exists'],
          password: 'Password too short'
        }
      };

      const validationErrors = ApiErrorTransformer.transformValidationErrors(apiError);

      expect(validationErrors).toHaveLength(3);
      expect(validationErrors[0]).toEqual({
        field: 'email',
        message: 'Invalid email format',
        value: undefined
      });
      expect(validationErrors[1]).toEqual({
        field: 'email',
        message: 'Email already exists',
        value: undefined
      });
      expect(validationErrors[2]).toEqual({
        field: 'password',
        message: 'Password too short',
        value: undefined
      });
    });

    it('should return empty array for no details', () => {
      const apiError = {
        status: 400,
        message: 'Validation failed'
      };

      const validationErrors = ApiErrorTransformer.transformValidationErrors(apiError);

      expect(validationErrors).toHaveLength(0);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable status codes', () => {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];
      
      retryableStatuses.forEach(status => {
        const apiError = { status, message: 'Error' };
        expect(ApiErrorTransformer.isRetryableError(apiError)).toBe(true);
      });
    });

    it('should identify non-retryable status codes', () => {
      const nonRetryableStatuses = [400, 401, 403, 404];
      
      nonRetryableStatuses.forEach(status => {
        const apiError = { status, message: 'Error' };
        expect(ApiErrorTransformer.isRetryableError(apiError)).toBe(false);
      });
    });

    it('should identify retryable error codes', () => {
      const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR'];
      
      retryableCodes.forEach(code => {
        const apiError = { status: 0, message: 'Error', code };
        expect(ApiErrorTransformer.isRetryableError(apiError)).toBe(true);
      });
    });
  });

  describe('getRetryDelay', () => {
    it('should return longer delay for rate limiting', () => {
      const apiError = { status: 429, message: 'Rate limited' };
      
      const delay1 = ApiErrorTransformer.getRetryDelay(apiError, 1);
      const delay2 = ApiErrorTransformer.getRetryDelay(apiError, 2);
      
      expect(delay1).toBeGreaterThan(1000);
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay2).toBeLessThanOrEqual(30000);
    });

    it('should return moderate delay for network errors', () => {
      const apiError = { status: 0, message: 'Network error', code: 'NETWORK_ERROR' };
      
      const delay = ApiErrorTransformer.getRetryDelay(apiError, 1);
      
      expect(delay).toBeGreaterThan(1000);
      expect(delay).toBeLessThanOrEqual(30000);
    });

    it('should use exponential backoff for other errors', () => {
      const apiError = { status: 500, message: 'Server error' };
      
      const delay1 = ApiErrorTransformer.getRetryDelay(apiError, 1);
      const delay2 = ApiErrorTransformer.getRetryDelay(apiError, 2);
      
      expect(delay2).toBeGreaterThan(delay1);
    });
  });
});

describe('getUserFriendlyMessage', () => {
  it('should return mapped message for known error code', () => {
    const message = getUserFriendlyMessage('JOB_NOT_FOUND');
    
    expect(message).toBe('The requested job could not be found. It may have been deleted or you may not have access to it.');
  });

  it('should return default message for unknown error code', () => {
    const message = getUserFriendlyMessage('UNKNOWN_ERROR', 'Custom default');
    
    expect(message).toBe('Custom default');
  });

  it('should return generic message when no default provided', () => {
    const message = getUserFriendlyMessage('UNKNOWN_ERROR');
    
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });
});