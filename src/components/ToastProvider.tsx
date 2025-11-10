// components/ToastProvider.tsx
'use client';

import { Toaster, toast as toastInstance } from 'react-hot-toast';
import { useEffect } from 'react';

// Custom toast function that replaces previous toasts
export const toast = {
  success: (message: string, options?: any) => {
    toastInstance.dismiss(); // Dismiss any existing toast
    return toastInstance.success(message, options);
  },
  error: (message: string, options?: any) => {
    toastInstance.dismiss(); // Dismiss any existing toast
    return toastInstance.error(message, options);
  },
  loading: (message: string, options?: any) => {
    toastInstance.dismiss(); // Dismiss any existing toast
    return toastInstance.loading(message, options);
  },
custom: (message: React.ReactNode | ((t: any) => React.ReactNode), options?: any) => {
  toastInstance.dismiss();
  return toastInstance.custom(message as any, options);
},

  dismiss: () => toastInstance.dismiss(),
};

export default function ToastProvider() {
  // Effect to ensure only one toast at a time globally
  useEffect(() => {
    const originalError = toastInstance.error;
    const originalSuccess = toastInstance.success;
    const originalLoading = toastInstance.loading;
    const originalCustom = toastInstance.custom;

    // Override to always dismiss previous toasts
    toastInstance.error = (message: any, options?: any) => {
      toastInstance.dismiss();
      return originalError(message, options);
    };

    toastInstance.success = (message: any, options?: any) => {
      toastInstance.dismiss();
      return originalSuccess(message, options);
    };

    toastInstance.loading = (message: any, options?: any) => {
      toastInstance.dismiss();
      return originalLoading(message, options);
    };

    toastInstance.custom = (message: any, options?: any) => {
      toastInstance.dismiss();
      return originalCustom(message, options);
    };

    return () => {
      // Restore original functions on cleanup
      toastInstance.error = originalError;
      toastInstance.success = originalSuccess;
      toastInstance.loading = originalLoading;
      toastInstance.custom = originalCustom;
    };
  }, []);

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName="!z-[10000]"
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          maxWidth: '500px',
        },
        // Custom styles for different types
        success: {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
        loading: {
          duration: Infinity,
          style: {
            background: '#6b7280',
            color: '#fff',
          },
        },
      }}
    />
  );
}