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

    // Auto-redirect to lobby after showing error briefly
    setTimeout(() => {
      window.location.href = '/games';
    }, 3000);
  }

  handleReturnToLobby = () => {
    window.location.href = '/games';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center p-4">
          <div className="bg-gray-800/80 backdrop-blur-sm border border-red-500/50 rounded-xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-300 text-sm">
                Don't worry, we're taking you back to safety
              </p>
            </div>

            {this.state.error && import.meta.env.DEV && (
              <details className="text-sm text-gray-400 mb-6 bg-gray-900/50 rounded p-3">
                <summary className="cursor-pointer hover:text-gray-300 font-medium">
                  Error details (dev mode)
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReturnToLobby}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:scale-105 transform"
              >
                Return to Lobby
              </button>

              <p className="text-center text-gray-500 text-xs">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
