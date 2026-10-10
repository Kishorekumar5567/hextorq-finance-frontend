import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 text-sm max-w-sm bg-white/95 border-slate-200 text-slate-900">
      <div className="shrink-0">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600" />}
      </div>

      <div className="flex-1">
        <p className="font-bold text-[11px] tracking-wide uppercase text-slate-500">
          {isSuccess ? "Success" : isError ? "Action Alert" : "Information"}
        </p>
        <p className="text-xs text-slate-800 mt-0.5">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Toast;
