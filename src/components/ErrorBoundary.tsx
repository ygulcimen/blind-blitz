import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500/50 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-400 mb-4">
              ⚠️ Something went wrong
            </h2>
            <p className="text-gray-300 mb-4">
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            {this.state.error && (
              <details className="text-sm text-gray-400 mb-4">
                <summary className="cursor-pointer hover:text-gray-300">
                  Error details
                </summary>
                <pre className="mt-2 p-2 bg-gray-900 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
