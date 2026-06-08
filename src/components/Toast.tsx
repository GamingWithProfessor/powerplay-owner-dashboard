import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl min-w-[280px] backdrop-blur-xl"
            style={{
              background: 'rgba(8, 12, 23, 0.95)',
              borderColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : toast.type === 'error' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(99, 102, 241, 0.3)',
              boxShadow: `0 12px 32px rgba(0,0,0,0.4), 0 0 20px ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : toast.type === 'error' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)'}`,
            }}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-indigo-400" />}
            
            <p className="text-[13px] font-medium text-slate-100 flex-1">{toast.message}</p>
            
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
