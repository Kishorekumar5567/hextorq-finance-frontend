import React, { useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";

export function CashflowChart({ tracks = [] }) {
  const [activeView, setActiveView] = useState("ratio");

  const totalCredit = tracks
    .filter((t) => t.type?.toLowerCase() === "credit")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalDebit = tracks
    .filter((t) => t.type?.toLowerCase() === "debit")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalVolume = totalCredit + totalDebit || 1;
  const creditPercent = Math.round((totalCredit / totalVolume) * 100);
  const debitPercent = 100 - creditPercent;
  const netSavings = totalCredit - totalDebit;
  const marginPercent = totalCredit > 0 ? Math.round((netSavings / totalCredit) * 100) : 0;

  // Group by date for mini visual sparkline
  const dateMap = {};
  tracks.forEach((t) => {
    if (!t.date) return;
    if (!dateMap[t.date]) {
      dateMap[t.date] = { credit: 0, debit: 0 };
    }
    const amt = Number(t.amount) || 0;
    if (t.type?.toLowerCase() === "credit") {
      dateMap[t.date].credit += amt;
    } else {
      dateMap[t.date].debit += amt;
    }
  });

  const sortedDates = Object.keys(dateMap).sort().slice(-8);
  const maxDayVal = Math.max(
    ...sortedDates.map((d) => Math.max(dateMap[d].credit, dateMap[d].debit)),
    1000
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-semibold text-slate-100 tracking-wide">
              Financial Health & Cashflow Velocity
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ratio analysis across revenue and operational expenditures
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 p-1 border border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => setActiveView("ratio")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeView === "ratio"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Allocation Ratio
          </button>
          <button
            type="button"
            onClick={() => setActiveView("trend")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeView === "trend"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Activity Pulse
          </button>
        </div>
      </div>

      {activeView === "ratio" ? (
        <div className="space-y-6">
          {/* Ratio bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Revenue: {creditPercent}% (₹{totalCredit.toLocaleString()})
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Expense: {debitPercent}% (₹{totalDebit.toLocaleString()})
              </span>
            </div>

            <div className="h-3.5 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${creditPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
              />
              <div
                style={{ width: `${debitPercent}%` }}
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-700"
              />
            </div>
          </div>

          {/* Quick Metrics Cards Inside Chart */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Operating Margin
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-100">
                  {marginPercent}%
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  {marginPercent >= 20 ? "Optimal" : "Standard"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Total Volume Tracked
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-100">
                  ₹{totalVolume.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Transaction Count
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-100">
                  {tracks.length}
                </span>
                <span className="text-xs text-blue-400">Total Entries</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Trend bars view */
        <div className="space-y-4">
          <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 px-2">
            {sortedDates.length > 0 ? (
              sortedDates.map((date) => {
                const day = dateMap[date];
                const creditHeight = Math.max(
                  Math.round((day.credit / maxDayVal) * 110),
                  day.credit > 0 ? 8 : 0
                );
                const debitHeight = Math.max(
                  Math.round((day.debit / maxDayVal) * 110),
                  day.debit > 0 ? 8 : 0
                );

                return (
                  <div
                    key={date}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                  >
                    <div className="flex items-end gap-1 w-full justify-center">
                      <div
                        style={{ height: `${creditHeight}px` }}
                        className="w-3 rounded-t-sm bg-emerald-500/80 group-hover:bg-emerald-400 transition-all shadow-sm"
                        title={`Credit: ₹${day.credit.toLocaleString()}`}
                      />
                      <div
                        style={{ height: `${debitHeight}px` }}
                        className="w-3 rounded-t-sm bg-rose-500/80 group-hover:bg-rose-400 transition-all shadow-sm"
                        title={`Debit: ₹${day.debit.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300 whitespace-nowrap">
                      {date.slice(5)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-slate-500 text-sm py-12">
                No chronological data available.
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Inflow (Credit)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Outflow (Debit)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashflowChart;
