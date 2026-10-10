import React, { useEffect, useState } from "react";
import {
  X,
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
    if (!formData.date) newErrors.date = "Posting date is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    if (!formData.amount || Number(formData.amount) <= 0)
      newErrors.amount = "Enter a valid positive amount";
    if (!formData.type) newErrors.type = "Select credit or debit";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-7 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                formData.type?.toLowerCase() === "credit"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  : "bg-rose-50 text-rose-700 border border-rose-200/80"
              }`}
            >
              {formData.type?.toLowerCase() === "credit" ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold tracking-tight text-slate-900">
                {isEditing ? "Edit Ledger Entry" : "New Transaction Entry"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? "Update ledger entry attributes and amounts"
                  : "Record an inflow or outflow to your financial ledger"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={validateAndSubmit} className="space-y-4">
          {/* Classification Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Accounting Type *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() =>
                  onChange({ target: { name: "type", value: "Credit" } })
                }
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  formData.type === "Credit"
                    ? "bg-white text-emerald-700 shadow-xs border border-emerald-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                Credit (Revenue)
              </button>

              <button
                type="button"
                onClick={() =>
                  onChange({ target: { name: "type", value: "Debit" } })
                }
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  formData.type === "Debit"
                    ? "bg-white text-rose-700 shadow-xs border border-rose-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                Debit (Cost)
              </button>
            </div>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Posting Date *
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, date: null }));
                  onChange(e);
                }}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900/10 ${
                  errors.date ? "border-rose-500" : "border-slate-300 focus:border-slate-900"
                }`}
              />
              {errors.date && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.date}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Amount ({currencySymbol}) *
                </label>
                {numericAmount > 0 && (
                  <span className="text-[11px] font-mono-numbers text-emerald-600 font-bold">
                    {currencySymbol}{numericAmount.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">
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
                  className={`w-full rounded-xl border bg-white pl-8 pr-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900/10 font-mono-numbers ${
                    errors.amount ? "border-rose-500" : "border-slate-300 focus:border-slate-900"
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.amount}
                </p>
              )}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-slate-900/10 ${
                errors.description
                  ? "border-rose-500"
                  : "border-slate-300 focus:border-slate-900"
              }`}
            />
            {/* Quick preset suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> Preset:
              </span>
              {SUGGESTED_DESCRIPTIONS.slice(0, 4).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    onChange({ target: { name: "description", value: preset } })
                  }
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Audit Notes / Invoice Reference
            </label>
            <input
              type="text"
              name="remarks"
              placeholder="e.g. Wire transfer ref #84920, Approved by Finance"
              value={formData.remarks}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/15 transition active:scale-95 cursor-pointer"
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
