'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, ShoppingCart, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon?: React.ReactNode;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, icon?: React.ReactNode) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success', icon?: React.ReactNode) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-[var(--fresh)]" />,
    error: <AlertCircle className="w-4 h-4 text-[var(--error)]" />,
    info: <ShoppingCart className="w-4 h-4 text-[var(--gold)]" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none" aria-live="polite" aria-label="Notifications">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              data-theme="dark"
              className={cn(
                'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-raised border backdrop-blur-md',
                'bg-[var(--bg-surface)] border-[var(--border-default)]',
              )}
            >
              {toast.icon || iconMap[toast.type]}
              <span className="text-sm text-[var(--text-primary)] font-medium flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 flex items-center justify-center w-11 h-11 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-surface-raised rounded-md transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
