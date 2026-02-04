import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import clsx from 'clsx';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const iconMap: Record<ToastType, string> = {
  success: 'fa-check-circle',
  error: 'fa-times-circle',
  warning: 'fa-exclamation-triangle',
  info: 'fa-info-circle',
};

const borderColorMap: Record<ToastType, string> = {
  success: '#38a169',
  error: '#e53e3e',
  warning: '#d69e2e',
  info: '#00b5d8',
};

function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-5 py-4 rounded-xl text-white transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      )}
      style={{
        background: '#1a202c',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
        borderLeft: `4px solid ${borderColorMap[toast.type]}`,
      }}
    >
      <i
        className={`fas ${iconMap[toast.type]}`}
        style={{ color: borderColorMap[toast.type] }}
      ></i>
      <span className="text-sm">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}

// Simple standalone toast for quick use (uses CSS classes)
export function showToastSimple(message: string, type: ToastType = 'success') {
  const toast = document.getElementById('global-toast');
  if (toast) {
    const messageEl = toast.querySelector('span');
    const iconEl = toast.querySelector('i');

    if (messageEl) messageEl.textContent = message;
    if (iconEl) {
      iconEl.className = `fas ${iconMap[type]}`;
    }

    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Global toast element to be added to App.tsx
export function GlobalToast() {
  return (
    <div id="global-toast" className="toast success">
      <i className="fas fa-check-circle"></i>
      <span>Acción completada exitosamente</span>
    </div>
  );
}

export default Toast;
