import { router } from 'expo-router';
import { errorLogger } from './errorLogger';
import { ErrorContext } from '@/types';

/**
 * Navigation error handling utilities
 */
export class NavigationErrorHandler {
  private static instance: NavigationErrorHandler;
  private navigationHistory: string[] = [];
  private maxHistorySize = 10;

  private constructor() {}

  static getInstance(): NavigationErrorHandler {
    if (!NavigationErrorHandler.instance) {
      NavigationErrorHandler.instance = new NavigationErrorHandler();
    }
    return NavigationErrorHandler.instance;
  }

  /**
   * Safe navigation with error handling
   */
  navigate(href: string, options?: { replace?: boolean; params?: Record<string, any> }): boolean {
    try {
      // Validate route before navigation
      if (!this.isValidRoute(href)) {
        this.handleInvalidRoute(href);
        return false;
      }

      // Add to navigation history
      this.addToHistory(href);

      // Perform navigation
      if (options?.replace) {
        router.replace(href as any);
      } else {
        router.push(href as any);
      }

      return true;
    } catch (error) {
      this.handleNavigationError(error as Error, href, options);
      return false;
    }
  }

  /**
   * Safe back navigation with fallback
   */
  goBack(fallbackRoute: string = '/'): boolean {
    try {
      if (router.canGoBack()) {
        router.back();
        return true;
      } else {
        // No history to go back to, navigate to fallback
        return this.navigate(fallbackRoute);
      }
    } catch (error) {
      this.handleNavigationError(error as Error, 'back', { fallback: fallbackRoute });
      // Try fallback route
      return this.navigate(fallbackRoute);
    }
  }

  /**
   * Validate route format and accessibility
   */
  private isValidRoute(href: string): boolean {
    // Basic route validation
    if (!href || typeof href !== 'string') {
      return false;
    }

    // Check for valid route patterns
    const validRoutePatterns = [
      /^\/$/,                           // Root
      /^\/\(tabs\)/,                   // Tab routes
      /^\/login$/,                     // Login
      /^\/admin/,                      // Admin routes
      /^\/job-details$/,               // Job details
      /^\/create-job$/,                // Create job
      /^\/customer-details$/,          // Customer details
      /^\/\+not-found$/                // Not found
    ];

    return validRoutePatterns.some(pattern => pattern.test(href));
  }

  /**
   * Handle invalid route attempts
   */
  private handleInvalidRoute(href: string): void {
    const context: ErrorContext = {
      component: 'Navigation',
      action: 'Invalid Route Access',
      additionalData: {
        attemptedRoute: href,
        currentRoute: this.getCurrentRoute(),
        navigationHistory: [...this.navigationHistory]
      }
    };

    errorLogger.logNavigationError(
      `Attempted to navigate to invalid route: ${href}`,
      {
        to: href,
        from: this.getCurrentRoute()
      },
      'medium'
    );

    // Navigate to not-found page
    try {
      router.push('/+not-found');
    } catch (fallbackError) {
      // If even not-found fails, go to root
      router.replace('/');
    }
  }

  /**
   * Handle navigation errors
   */
  private handleNavigationError(
    error: Error,
    targetRoute: string,
    options?: Record<string, any>
  ): void {
    const context: ErrorContext = {
      component: 'Navigation',
      action: 'Navigation Error',
      additionalData: {
        targetRoute,
        options,
        currentRoute: this.getCurrentRoute(),
        navigationHistory: [...this.navigationHistory],
        errorMessage: error.message
      }
    };

    errorLogger.logNavigationError(
      error,
      {
        to: targetRoute,
        from: this.getCurrentRoute(),
        params: options
      },
      'high'
    );

    // Try to recover by going to a safe route
    this.recoverFromNavigationError();
  }

  /**
   * Recover from navigation errors by going to a safe route
   */
  private recoverFromNavigationError(): void {
    const safeRoutes = ['/', '/login'];
    
    for (const route of safeRoutes) {
      try {
        router.replace(route as any);
        break;
      } catch (error) {
        // Continue to next safe route
        continue;
      }
    }
  }

  /**
   * Get current route (simplified implementation)
   */
  private getCurrentRoute(): string {
    // In a real implementation, this would get the current route from the router
    // For now, return the last item in history or root
    return this.navigationHistory[this.navigationHistory.length - 1] || '/';
  }

  /**
   * Add route to navigation history
   */
  private addToHistory(route: string): void {
    this.navigationHistory.push(route);
    
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory = this.navigationHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get navigation history for debugging
   */
  getNavigationHistory(): string[] {
    return [...this.navigationHistory];
  }

  /**
   * Clear navigation history
   */
  clearHistory(): void {
    this.navigationHistory = [];
  }

  /**
   * Validate deep link and handle errors
   */
  handleDeepLink(url: string): boolean {
    try {
      // Parse and validate deep link
      const parsedUrl = this.parseDeepLink(url);
      
      if (!parsedUrl.isValid) {
        this.handleInvalidDeepLink(url, parsedUrl.error);
        return false;
      }

      // Navigate to the deep link route
      return this.navigate(parsedUrl.route || '/', { params: parsedUrl.params });
    } catch (error) {
      this.handleDeepLinkError(error as Error, url);
      return false;
    }
  }

  /**
   * Parse deep link URL
   */
  private parseDeepLink(url: string): {
    isValid: boolean;
    route?: string;
    params?: Record<string, any>;
    error?: string;
  } {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const searchParams = Object.fromEntries(urlObj.searchParams);

      // Validate deep link format
      if (!this.isValidRoute(pathname)) {
        return {
          isValid: false,
          error: `Invalid route in deep link: ${pathname}`
        };
      }

      return {
        isValid: true,
        route: pathname,
        params: searchParams
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Malformed deep link URL: ${url}`
      };
    }
  }

  /**
   * Handle invalid deep link
   */
  private handleInvalidDeepLink(url: string, error?: string): void {
    errorLogger.logNavigationError(
      `Invalid deep link: ${error || 'Unknown error'}`,
      {
        to: url,
        from: this.getCurrentRoute()
      },
      'medium'
    );

    // Navigate to a safe route with error message
    this.navigate('/+not-found');
  }

  /**
   * Handle deep link processing errors
   */
  private handleDeepLinkError(error: Error, url: string): void {
    errorLogger.logNavigationError(
      error,
      {
        to: url,
        from: this.getCurrentRoute()
      },
      'high'
    );

    // Navigate to safe route
    this.navigate('/');
  }
}

// Export singleton instance
export const navigationErrorHandler = NavigationErrorHandler.getInstance();

// Convenience functions
export const safeNavigate = (href: string, options?: { replace?: boolean; params?: Record<string, any> }) =>
  navigationErrorHandler.navigate(href, options);

export const safeGoBack = (fallbackRoute?: string) =>
  navigationErrorHandler.goBack(fallbackRoute);

export const handleDeepLink = (url: string) =>
  navigationErrorHandler.handleDeepLink(url);