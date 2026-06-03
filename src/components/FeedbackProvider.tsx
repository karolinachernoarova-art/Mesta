import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, Trash2, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'default';
}

interface FeedbackContextType {
  showToast: (toast: Omit<Toast, 'id'>, timeout?: number) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);

  const showToast = useCallback((toast: Omit<Toast, 'id'>, timeout = 4200) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    if (toast.type !== 'loading') {
      window.setTimeout(() => {
        setToasts(prev => prev.filter(item => item.id !== id));
      }, timeout);
    }
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => (
    new Promise<boolean>(resolve => setConfirmState({ ...options, resolve }))
  ), []);

  const closeConfirm = (value: boolean) => {
    confirmState?.resolve(value);
    setConfirmState(null);
  };

  const value = useMemo(() => ({ showToast, confirm }), [showToast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fixed top-4 left-4 right-4 z-[80] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="w-full max-w-md bg-white border border-[#E2E2D1] shadow-xl rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-3 pointer-events-auto">
            <ToastIcon type={toast.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#3A3A2F]">{toast.title}</p>
              {toast.message && <p className="text-xs text-[#8E8E8E] leading-relaxed mt-1">{toast.message}</p>}
            </div>
            <button onClick={() => setToasts(prev => prev.filter(item => item.id !== toast.id))} className="w-7 h-7 flex items-center justify-center rounded-full text-[#8E8E8E] hover:bg-[#F5F5F0]">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E2E2D1] shadow-2xl p-6 animate-in slide-in-from-bottom-6 zoom-in-95">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${confirmState.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-[#ECECE1] text-[#5A5A40]'}`}>
              {confirmState.tone === 'danger' ? <Trash2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
            </div>
            <h3 className="text-xl font-serif font-bold text-[#3A3A2F] mb-2">{confirmState.title}</h3>
            <p className="text-sm text-[#8E8E8E] leading-relaxed mb-6">{confirmState.message}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => closeConfirm(false)} className="h-12 rounded-2xl bg-[#F5F5F0] text-[#3A3A2F] text-sm font-bold hover:bg-[#ECECE1] transition-colors">
                {confirmState.cancelText || 'Отмена'}
              </button>
              <button onClick={() => closeConfirm(true)} className={`h-12 rounded-2xl text-sm font-bold text-white transition-transform active:scale-[0.98] ${confirmState.tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#5A5A40] hover:opacity-90'}`}>
                {confirmState.confirmText || 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

function ToastIcon({ type }: { type: ToastType }) {
  const className = 'w-5 h-5 mt-0.5';
  if (type === 'success') return <CheckCircle2 className={`${className} text-emerald-600`} />;
  if (type === 'error') return <AlertCircle className={`${className} text-red-600`} />;
  if (type === 'loading') return <Loader2 className={`${className} text-[#5A5A40] animate-spin`} />;
  return <Info className={`${className} text-[#5A5A40]`} />;
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used inside FeedbackProvider');
  }
  return context;
}
