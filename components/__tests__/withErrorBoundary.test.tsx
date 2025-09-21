import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { withErrorBoundary, ErrorBoundaryWrapper } from '../withErrorBoundary';

// Test components
const WorkingComponent: React.FC<{ message: string }> = ({ message }) => (
  <Text>{message}</Text>
);

const ThrowingComponent: React.FC = () => {
  throw new Error('Component error');
};

describe('withErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(WorkingComponent);
    
    const { getByText } = render(
      <WrappedComponent message="Hello World" />
    );

    expect(getByText('Hello World')).toBeTruthy();
  });

  it('catches errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowingComponent);
    
    const { getByText } = render(<WrappedComponent />);

    expect(getByText('Oops! Something went wrong')).toBeTruthy();
  });

  it('passes through props correctly', () => {
    const WrappedComponent = withErrorBoundary(WorkingComponent);
    
    const { getByText } = render(
      <WrappedComponent message="Test message" />
    );

    expect(getByText('Test message')).toBeTruthy();
  });

  it('sets correct display name', () => {
    const TestComponent = () => <Text>Test</Text>;
    TestComponent.displayName = 'TestComponent';
    
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  it('handles component without display name', () => {
    const WrappedComponent = withErrorBoundary(WorkingComponent);
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(WorkingComponent)');
  });

  it('passes error context correctly', () => {
    const onError = jest.fn();
    const WrappedComponent = withErrorBoundary(ThrowingComponent, {
      context: { action: 'test' },
      onError
    });
    
    render(<WrappedComponent />);

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });
});

describe('ErrorBoundaryWrapper', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('wraps children with error boundary', () => {
    const { getByText } = render(
      <ErrorBoundaryWrapper componentName="TestWrapper">
        <Text>Child component</Text>
      </ErrorBoundaryWrapper>
    );

    expect(getByText('Child component')).toBeTruthy();
  });

  it('catches errors in children', () => {
    const { getByText } = render(
      <ErrorBoundaryWrapper componentName="TestWrapper">
        <ThrowingComponent />
      </ErrorBoundaryWrapper>
    );

    expect(getByText('Oops! Something went wrong')).toBeTruthy();
  });

  it('passes context correctly', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundaryWrapper 
        componentName="TestWrapper"
        context={{ action: 'test' }}
        onError={onError}
      >
        <ThrowingComponent />
      </ErrorBoundaryWrapper>
    );

    expect(onError).toHaveBeenCalled();
  });

  it('uses custom fallback when provided', () => {
    const customFallback = <Text>Custom wrapper error</Text>;
    
    const { getByText } = render(
      <ErrorBoundaryWrapper 
        componentName="TestWrapper"
        fallback={customFallback}
      >
        <ThrowingComponent />
      </ErrorBoundaryWrapper>
    );

    expect(getByText('Custom wrapper error')).toBeTruthy();
  });
});