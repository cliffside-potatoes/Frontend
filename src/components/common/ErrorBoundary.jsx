// 컴포넌트 오류 처리

import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          margin: '16px',
          backgroundColor: '#fee',
          border: '1px solid #c33',
          borderRadius: '8px',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#c33', marginTop: 0 }}>오류가 발생했습니다</h2>
          <pre style={{ overflow: 'auto', fontSize: '12px' }}>
            {this.state.error?.toString?.()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
