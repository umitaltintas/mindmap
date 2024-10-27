
// src/components/ErrorBoundary.js
import React from 'react';
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="text-center p-8 bg-white rounded-lg shadow-xl">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">
                            Bir şeyler yanlış gitti
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Sayfayı yenileyerek tekrar deneyebilirsiniz.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Sayfayı Yenile
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
export default ErrorBoundary;