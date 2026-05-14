import React from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Unhandled UI error', error, info);
  }

  private readonly reset = () => {
    this.setState({ error: null });
  };

  override render(): React.ReactNode {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    // The fallback UI runs after the React tree has crashed; the i18n provider
    // may itself be the cause, so we intentionally render English literals.
    /* eslint-disable i18next/no-literal-string */
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground break-words">{error.message}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={this.reset} variant="outline">Try again</Button>
            <Button onClick={() => {
              globalThis.location.assign('/');
            }}>Go home</Button>
          </div>
        </div>
      </div>
    );
    /* eslint-enable i18next/no-literal-string */
  }
}
