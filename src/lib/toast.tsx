import toast from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const toastStyles = {
  success: {
    background: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #16a34a',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #dc2626',
  },
  info: {
    background: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #2563eb',
  },
  warning: {
    background: '#fefce8',
    color: '#d97706',
    border: '1px solid #d97706',
  },
};

// Type guard to check if the toast type is valid
function isToastMethod(type: string): type is keyof typeof toast {
  return ['success', 'error', 'info', 'warning', 'loading', 'default', 'promise'].includes(type);
}

export const showToast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
}: ToastOptions) => {
  if (isToastMethod(type)) {
    toast[type](message, {
      duration,
      position: 'top-left',
      style: toastStyles[type],
    });
  } else {
    // Fallback to default toast if type is invalid
    toast(message, {
      duration,
      position: 'top-left',
      style: toastStyles.info,
    });
  }
};

export const showActionToast = (options: {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  type?: ToastType;
}) => {
  const {
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    type = 'info',
  } = options;

  toast(
    (t) => (
      <div>
        <p>{message}</p>
        <div className="mt-2 flex gap-2">
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
          >
            {confirmText}
          </button>
          <button
            className="px-2 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={() => toast.dismiss(t.id)}
          >
            {cancelText}
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: 'top-left',
      style: toastStyles[type],
    }
  );
};