import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-light text-black mb-4">Something went wrong</h1>
            <p className="text-sm font-light text-gray-600 mb-4">Please refresh the page</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-black text-white text-sm font-light uppercase tracking-wider hover:bg-gray-900 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
