import { NavigationErrorHandler } from '../navigationErrorHandler';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
}));

// Mock error logger
jest.mock('../errorLogger', () => ({
  errorLogger: {
    logNavigationError: jest.fn(),
  },
}));

import { router } from 'expo-router';
import { errorLogger } from '../errorLogger';

describe('NavigationErrorHandler', () => {
  let navigationHandler: NavigationErrorHandler;
  const mockRouter = router as jest.Mocked<typeof router>;
  const mockErrorLogger = errorLogger as jest.Mocked<typeof errorLogger>;

  beforeEach(() => {
    navigationHandler = NavigationErrorHandler.getInstance();
    navigationHandler.clearHistory();
    jest.clearAllMocks();
  });

  describe('navigate', () => {
    it('should navigate to valid routes', () => {
      const result = navigationHandler.navigate('/');
      
      expect(result).toBe(true);
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('should use replace option when specified', () => {
      const result = navigationHandler.navigate('/', { replace: true });
      
      expect(result).toBe(true);
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });

    it('should reject invalid routes', () => {
      const result = navigationHandler.navigate('/invalid-route');
      
      expect(result).toBe(false);
      expect(mockRouter.push).toHaveBeenCalledWith('/+not-found');
      expect(mockErrorLogger.logNavigationError).toHaveBeenCalled();
    });

    it('should handle navigation errors', () => {
      mockRouter.push.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      const result = navigationHandler.navigate('/');
      
      expect(result).toBe(false);
      expect(mockErrorLogger.logNavigationError).toHaveBeenCalled();
    });

    it('should add routes to navigation history', () => {
      navigationHandler.navigate('/');
      navigationHandler.navigate('/login');
      
      const history = navigationHandler.getNavigationHistory();
      expect(history).toEqual(['/', '/login']);
    });
  });

  describe('goBack', () => {
    it('should go back when history is available', () => {
      mockRouter.canGoBack.mockReturnValue(true);
      
      const result = navigationHandler.goBack();
      
      expect(result).toBe(true);
      expect(mockRouter.back).toHaveBeenCalled();
    });

    it('should navigate to fallback when no history', () => {
      mockRouter.canGoBack.mockReturnValue(false);
      
      const result = navigationHandler.goBack('/dashboard');
      
      expect(result).toBe(true);
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle back navigation errors', () => {
      mockRouter.canGoBack.mockReturnValue(true);
      mockRouter.back.mockImplementation(() => {
        throw new Error('Back navigation failed');
      });

      const result = navigationHandler.goBack();
      
      expect(mockErrorLogger.logNavigationError).toHaveBeenCalled();
      // Should try fallback route
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  describe('isValidRoute', () => {
    const validRoutes = [
      '/',
      '/(tabs)',
      '/login',
      '/admin/branches',
      '/job-details',
      '/create-job',
      '/customer-details',
      '/+not-found'
    ];

    const invalidRoutes = [
      '',
      '/invalid',
      '/random-route',
      'not-a-route',
      null,
      undefined
    ];

    validRoutes.forEach(route => {
      it(`should validate route: ${route}`, () => {
        const result = navigationHandler.navigate(route);
        expect(result).toBe(true);
      });
    });

    invalidRoutes.forEach(route => {
      it(`should reject invalid route: ${route}`, () => {
        const result = navigationHandler.navigate(route as any);
        expect(result).toBe(false);
      });
    });
  });

  describe('handleDeepLink', () => {
    it('should handle valid deep links', () => {
      const url = 'https://app.example.com/job-details?id=123';
      
      const result = navigationHandler.handleDeepLink(url);
      
      expect(result).toBe(true);
      expect(mockRouter.push).toHaveBeenCalledWith('/job-details');
    });

    it('should reject invalid deep links', () => {
      const url = 'https://app.example.com/invalid-route';
      
      const result = navigationHandler.handleDeepLink(url);
      
      expect(result).toBe(false);
      expect(mockErrorLogger.logNavigationError).toHaveBeenCalled();
    });

    it('should handle malformed URLs', () => {
      const url = 'not-a-valid-url';
      
      const result = navigationHandler.handleDeepLink(url);
      
      expect(result).toBe(false);
      expect(mockErrorLogger.logNavigationError).toHaveBeenCalled();
    });
  });

  describe('navigation history', () => {
    it('should maintain navigation history', () => {
      navigationHandler.navigate('/');
      navigationHandler.navigate('/login');
      navigationHandler.navigate('/job-details');
      
      const history = navigationHandler.getNavigationHistory();
      expect(history).toEqual(['/', '/login', '/job-details']);
    });

    it('should limit history size', () => {
      // Add more than max history size (10)
      for (let i = 0; i < 15; i++) {
        navigationHandler.navigate('/');
      }
      
      const history = navigationHandler.getNavigationHistory();
      expect(history.length).toBe(10);
    });

    it('should clear history', () => {
      navigationHandler.navigate('/');
      navigationHandler.navigate('/login');
      
      navigationHandler.clearHistory();
      
      const history = navigationHandler.getNavigationHistory();
      expect(history).toEqual([]);
    });
  });

  describe('error recovery', () => {
    it('should recover from navigation errors by going to safe route', () => {
      mockRouter.push.mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      mockRouter.replace.mockImplementation(() => {
        // Simulate successful recovery
      });

      navigationHandler.navigate('/some-route');
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });

    it('should try multiple safe routes if first fails', () => {
      mockRouter.push.mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      mockRouter.replace
        .mockImplementationOnce(() => {
          throw new Error('First safe route failed');
        })
        .mockImplementationOnce(() => {
          // Second safe route succeeds
        });

      navigationHandler.navigate('/some-route');
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });
});