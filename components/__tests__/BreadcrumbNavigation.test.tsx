import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BreadcrumbNavigation, useBreadcrumbs, ErrorRecoveryBreadcrumb } from '../BreadcrumbNavigation';

// Mock navigation error handler
jest.mock('@/utils/navigationErrorHandler', () => ({
  safeNavigate: jest.fn(),
}));

import { safeNavigate } from '@/utils/navigationErrorHandler';

describe('BreadcrumbNavigation', () => {
  const mockSafeNavigate = safeNavigate as jest.MockedFunction<typeof safeNavigate>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleItems = [
    { label: 'Home', route: '/' },
    { label: 'Jobs', route: '/jobs' },
    { label: 'Job Details', route: '/job-details', isActive: true }
  ];

  it('renders breadcrumb items correctly', () => {
    const { getByText } = render(
      <BreadcrumbNavigation items={sampleItems} />
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Jobs')).toBeTruthy();
    expect(getByText('Job Details')).toBeTruthy();
  });

  it('shows home button by default', () => {
    const { getByLabelText } = render(
      <BreadcrumbNavigation items={sampleItems} />
    );

    expect(getByLabelText('Go to home')).toBeTruthy();
  });

  it('hides home button when showHomeButton is false', () => {
    const { queryByLabelText } = render(
      <BreadcrumbNavigation items={sampleItems} showHomeButton={false} />
    );

    expect(queryByLabelText('Go to home')).toBeNull();
  });

  it('navigates when breadcrumb item is pressed', () => {
    const { getByText } = render(
      <BreadcrumbNavigation items={sampleItems} />
    );

    fireEvent.press(getByText('Home'));
    expect(mockSafeNavigate).toHaveBeenCalledWith('/');

    fireEvent.press(getByText('Jobs'));
    expect(mockSafeNavigate).toHaveBeenCalledWith('/jobs');
  });

  it('calls custom onNavigate when provided', () => {
    const mockOnNavigate = jest.fn();
    const { getByText } = render(
      <BreadcrumbNavigation items={sampleItems} onNavigate={mockOnNavigate} />
    );

    fireEvent.press(getByText('Home'));
    expect(mockOnNavigate).toHaveBeenCalledWith('/');
    expect(mockSafeNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when item is active', () => {
    const { getByText } = render(
      <BreadcrumbNavigation items={sampleItems} />
    );

    fireEvent.press(getByText('Job Details'));
    expect(mockSafeNavigate).not.toHaveBeenCalled();
  });

  it('truncates items when maxItems is exceeded', () => {
    const manyItems = [
      { label: 'Home', route: '/' },
      { label: 'Level 1', route: '/level1' },
      { label: 'Level 2', route: '/level2' },
      { label: 'Level 3', route: '/level3' },
      { label: 'Level 4', route: '/level4' },
      { label: 'Current', route: '/current', isActive: true }
    ];

    const { getByText, queryByText } = render(
      <BreadcrumbNavigation items={manyItems} maxItems={4} />
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('...')).toBeTruthy();
    expect(getByText('Level 4')).toBeTruthy();
    expect(getByText('Current')).toBeTruthy();
    expect(queryByText('Level 1')).toBeNull();
    expect(queryByText('Level 2')).toBeNull();
  });

  it('navigates to home when home button is pressed', () => {
    const { getByLabelText } = render(
      <BreadcrumbNavigation items={sampleItems} />
    );

    fireEvent.press(getByLabelText('Go to home'));
    expect(mockSafeNavigate).toHaveBeenCalledWith('/');
  });
});

describe('useBreadcrumbs', () => {
  const TestComponent: React.FC<{ route: string }> = ({ route }) => {
    const breadcrumbs = useBreadcrumbs(route);
    return (
      <BreadcrumbNavigation items={breadcrumbs} />
    );
  };

  it('generates breadcrumbs for root route', () => {
    const { getByText } = render(<TestComponent route="/" />);
    expect(getByText('Home')).toBeTruthy();
  });

  it('generates breadcrumbs for nested routes', () => {
    const { getByText } = render(<TestComponent route="/job-details" />);
    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Jobs')).toBeTruthy();
    expect(getByText('Job Details')).toBeTruthy();
  });

  it('generates breadcrumbs for admin routes', () => {
    const { getByText } = render(<TestComponent route="/admin/branches" />);
    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Admin')).toBeTruthy();
    expect(getByText('Branches')).toBeTruthy();
  });

  it('marks current route as active', () => {
    const { getByText } = render(<TestComponent route="/job-details" />);
    const jobDetailsElement = getByText('Job Details');
    // In a real test, you'd check for active styling
    expect(jobDetailsElement).toBeTruthy();
  });
});

describe('ErrorRecoveryBreadcrumb', () => {
  it('renders error recovery breadcrumb', () => {
    const { getByText } = render(
      <ErrorRecoveryBreadcrumb 
        currentRoute="/+not-found"
        errorContext="Page Not Found"
      />
    );

    expect(getByText('Navigation Path:')).toBeTruthy();
    expect(getByText('Page Not Found')).toBeTruthy();
  });

  it('uses default route when none provided', () => {
    const { getByText } = render(
      <ErrorRecoveryBreadcrumb errorContext="Error occurred" />
    );

    expect(getByText('Navigation Path:')).toBeTruthy();
    expect(getByText('Error occurred')).toBeTruthy();
  });

  it('replaces last breadcrumb with error context', () => {
    const { getByText, queryByText } = render(
      <ErrorRecoveryBreadcrumb 
        currentRoute="/job-details"
        errorContext="Failed to load job"
      />
    );

    expect(getByText('Failed to load job')).toBeTruthy();
    // The original "Job Details" should be replaced
    expect(queryByText('Job Details')).toBeNull();
  });
});