import { useToast } from "../context/ToastContext.jsx";

const toastStyles = {
  info: "bg-primary-500/95",
  success: "bg-emerald-500/95",
  error: "bg-rose-500/95",
};

const Toast = () => {
  const { toast, hideToast } = useToast();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm animate-fade-in-up items-center gap-3 rounded-2xl px-5 py-3 text-white shadow-lg shadow-black/20 backdrop-blur">
      <div className={`h-10 w-1 rounded-full ${toastStyles[toast.type] ?? toastStyles.info}`} />
      <p className="text-sm font-semibold">{toast.message}</p>
      <button
        onClick={hideToast}
        className="rounded-full border border-white/30 px-3 py-1 text-xs transition hover:bg-white/20"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;

