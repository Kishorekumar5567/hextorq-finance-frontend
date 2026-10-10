import React, { useEffect, useState } from "react";
import {
  X,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Tag,
  AlertCircle,
} from "lucide-react";

const SUGGESTED_DESCRIPTIONS = [
  "Client Project Milestone",
  "AWS & Cloud Hosting",
  "Design Consulting Fee",
  "Software Subscriptions (SaaS)",
  "Hardware & Equipment",
  "Marketing & Ads Campaign",
  "Office Operations",
  "Team Retainer",
];

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  isEditing,
  loading = false,
  currency = "INR",
}) {
  const [errors, setErrors] = useState({});

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

  const validateAndSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    if (!formData.amount || Number(formData.amount) <= 0)
      newErrors.amount = "Valid positive amount is required";
    if (!formData.type) newErrors.type = "Transaction type is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(e);
  };

  const currencySymbol = currency === "USD" ? "$" : "₹";
  const numericAmount = Number(formData.amount) || 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700/80 bg-slate-900 p-7 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Ambient Top Glow in Modal */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 h-36 w-72 rounded-full blur-[80px] pointer-events-none transition-colors duration-500 ${
            formData.type === "Credit" ? "bg-emerald-500/20" : "bg-rose-500/20"
          }`}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl transition-colors duration-300 ${
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
              <h2 id="modal-title" className="text-xl font-bold tracking-tight text-white">
                {isEditing ? "Edit Ledger Record" : "New Financial Entry"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing
                  ? "Update ledger entry attributes and amounts"
                  : "Post an authenticated transaction to your revenue ledger"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={validateAndSubmit} className="space-y-4 relative z-10">
          {/* Transaction Flow Segmented Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Accounting Classification *
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() =>
                  onChange({ target: { name: "type", value: "Credit" } })
                }
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  formData.type === "Credit"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Credit (Revenue Inflow)
              </button>

              <button
                type="button"
                onClick={() =>
                  onChange({ target: { name: "type", value: "Debit" } })
                }
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  formData.type === "Debit"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                Debit (Operational Cost)
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
                  onChange={(e) => {
                    setErrors((prev) => ({ ...prev, date: null }));
                    onChange(e);
                  }}
                  className={`w-full rounded-xl border bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:ring-1 ${
                    errors.date
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.date}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Amount ({currencySymbol}) *
                </label>
                {numericAmount > 0 && (
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {currencySymbol}{numericAmount.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => {
                    setErrors((prev) => ({ ...prev, amount: null }));
                    onChange(e);
                  }}
                  className={`w-full rounded-xl border bg-slate-950 pl-8 pr-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:ring-1 font-mono-numbers ${
                    errors.amount
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.amount}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title / Description *
            </label>
            <input
              type="text"
              name="description"
              required
              placeholder="e.g. Enterprise Client Retainer Q3"
              value={formData.description}
              onChange={(e) => {
                setErrors((prev) => ({ ...prev, description: null }));
                onChange(e);
              }}
              className={`w-full rounded-xl border bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:ring-1 ${
                errors.description
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            {/* Quick Description Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> Preset:
              </span>
              {SUGGESTED_DESCRIPTIONS.slice(0, 4).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    onChange({ target: { name: "description", value: preset } })
                  }
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Internal Audit Notes / Invoice Reference
            </label>
            <input
              type="text"
              name="remarks"
              placeholder="e.g. Wire transfer ref #84920, Approved by Finance"
              value={formData.remarks}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95 cursor-pointer ${
                formData.type === "Credit"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-950/40"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading
                ? "Processing..."
                : isEditing
                ? "Update Record"
                : "Post Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
