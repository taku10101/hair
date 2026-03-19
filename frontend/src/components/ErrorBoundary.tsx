import type { ReactNode } from "react";
import { type FallbackProps, ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/Button";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

/**
 * Error Boundary component
 * Catches React errors and displays a fallback UI
 */
export const ErrorBoundary = ({ children, fallback }: ErrorBoundaryProps) => {
  const handleError = (_error: unknown) => {};

  const defaultFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    if (fallback) {
      return fallback(errorObj, resetErrorBoundary);
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600">エラーが発生しました</h1>
          <p className="text-gray-700">{errorObj.message}</p>
          <Button onClick={resetErrorBoundary} className="w-full">
            リトライ
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ReactErrorBoundary FallbackComponent={defaultFallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
};
