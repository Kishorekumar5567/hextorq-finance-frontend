import React, { useEffect } from "react";
import {
  X,
  Calendar,
  FileText,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  CheckCircle2,
} from "lucide-react";

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  isEditing,
  loading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-7 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                formData.type?.toLowerCase() === "credit"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {formData.type?.toLowerCase() === "credit" ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {isEditing ? "Edit Transaction" : "New Transaction Entry"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing
                  ? "Update ledger entry attributes and amounts"
                  : "Log an inflow or expenditure into the finance ledger"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Transaction Type Segmented Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Transaction Flow *
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() =>
                  onChange({ target: { name: "type", value: "Credit" } })
                }
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  formData.type === "Credit"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Credit (Revenue)
              </button>

              <button
                type="button"
                onClick={() =>
                  onChange({ target: { name: "type", value: "Debit" } })
                }
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  formData.type === "Debit"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-900/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                Debit (Cost)
              </button>
            </div>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Posting Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title / Description *
            </label>
            <div className="relative">
              <input
                type="text"
                name="description"
                required
                placeholder="e.g. Enterprise SLA Renewal, AWS Cloud Clusters"
                value={formData.description}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Internal Remarks / Notes
            </label>
            <input
              type="text"
              name="remarks"
              placeholder="e.g. PO-84920, wired via Stripe, invoice settled"
              value={formData.remarks}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition active:scale-95 cursor-pointer ${
                formData.type === "Credit"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-950/40"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Record"
                : "Record Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
