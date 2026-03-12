import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle, AlertTriangle, Info, X, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const value: ToastContextType = {
    toast: addToast,
    success: (title, message) => addToast("success", title, message),
    error: (title, message) => addToast("error", title, message),
    warning: (title, message) => addToast("warning", title, message),
    info: (title, message) => addToast("info", title, message),
  };

  const icon = (type: ToastType) => {
    switch (type) {
      case "success": return <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />;
      case "error": return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />;
      case "info": return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const borderColor = (type: ToastType) => {
    switch (type) {
      case "success": return "border-l-green-500";
      case "error": return "border-l-red-500";
      case "warning": return "border-l-orange-500";
      case "info": return "border-l-blue-500";
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container — fixed top-right */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 380 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto bg-white rounded-xl shadow-xl border border-gray-200 border-l-4 ${borderColor(t.type)} p-4 flex items-start gap-3 animate-slide-in-right`}
            style={{
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            {icon(t.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black">{t.title}</p>
              {t.message && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
