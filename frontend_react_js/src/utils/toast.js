/**
 * Extremely lightweight toast system using React context.
 * Shows small floating messages with success/error styling.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message, type = 'info', duration = 2500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    window.setTimeout(() => remove(id), duration);
  }, [remove]);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" aria-atomic="true" style={styles.host}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              ...styles.toast,
              ...(t.type === 'success' ? styles.success : t.type === 'error' ? styles.error : styles.info),
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  /** Access the toast API: push(message, type?, duration?) */
  return useContext(ToastContext);
}

const styles = {
  host: {
    position: 'fixed',
    top: 12,
    right: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    zIndex: 9999,
  },
  toast: {
    padding: '10px 14px',
    borderRadius: 12,
    color: '#fff',
    background: 'linear-gradient(135deg, #6366F1, #EC4899)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
    fontSize: 14,
    minWidth: 180,
  },
  success: {
    background: 'linear-gradient(135deg, #10B981, #34D399)',
  },
  error: {
    background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
  },
  info: {
    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
  },
};
