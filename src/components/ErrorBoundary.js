// src/components/ErrorBoundary.js
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { addToast } = this.props; // Pass `addToast` via props or context

    if (this.state.hasError) {
      addToast('An unexpected error occurred. Please reload the page.', 'error');

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                Oops! Something went wrong.
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                We encountered an unexpected error. Please try reloading the page.
              </p>
            </div>

            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-blue-500 hover:text-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>

            <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              If the issue persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
