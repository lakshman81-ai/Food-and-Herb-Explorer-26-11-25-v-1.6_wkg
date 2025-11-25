import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: ErrorInfo) {
        console.error("Component crashed:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center bg-red-50 rounded-xl border border-red-100 m-4">
                    <span className="material-icons text-red-400 text-4xl mb-2">error_outline</span>
                    <p className="text-red-700 font-medium">Something went wrong while displaying this section.</p>
                    <button 
                        onClick={this.handleRetry}
                        className="mt-3 text-sm text-red-600 underline hover:text-red-800"
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;