import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function CashflowChart({ tracks = [], currencySymbol = "₹", currencyMultiplier = 1 }) {
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

  // Group by date for sparkline
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
    <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Cashflow Velocity & Health Ratio
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time balance allocation between revenue inflows and operational costs
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs">
          <button
            type="button"
            onClick={() => setActiveView("ratio")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeView === "ratio"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Capital Allocation
          </button>
          <button
            type="button"
            onClick={() => setActiveView("trend")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeView === "trend"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
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
              <span className="flex items-center gap-1.5 text-emerald-700">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Revenue: {creditPercent}% ({currencySymbol}{(totalCredit * currencyMultiplier).toLocaleString()})
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Expenses: {debitPercent}% ({currencySymbol}{(totalDebit * currencyMultiplier).toLocaleString()})
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200/60 shadow-inner">
              <div
                style={{ width: `${creditPercent}%` }}
                className="h-full bg-emerald-500 transition-all duration-700"
              />
              <div
                style={{ width: `${debitPercent}%` }}
                className="h-full bg-rose-500 transition-all duration-700"
              />
            </div>
          </div>

          {/* KPI Mini-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Operating Margin
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-slate-900 font-mono-numbers">
                  {marginPercent}%
                </span>
                <span
                  className={`text-xs font-bold ${
                    marginPercent >= 20 ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {marginPercent >= 20 ? "Positive Cashflow" : "Tight Margin"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Capital Handled
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-slate-900 font-mono-numbers">
                  {currencySymbol}{(totalVolume * currencyMultiplier).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Ledger Entries
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-slate-900 font-mono-numbers">
                  {tracks.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">Reconciled</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Trend Activity Pulse */
        <div className="space-y-4">
          <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 px-2">
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
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div
                        style={{ height: `${creditHeight}px` }}
                        className="w-3 rounded-t-sm bg-emerald-500 hover:bg-emerald-600 transition-all shadow-xs"
                        title={`Inflow: ${currencySymbol}${(day.credit * currencyMultiplier).toLocaleString()}`}
                      />
                      <div
                        style={{ height: `${debitHeight}px` }}
                        className="w-3 rounded-t-sm bg-rose-500 hover:bg-rose-600 transition-all shadow-xs"
                        title={`Outflow: ${currencySymbol}${(day.debit * currencyMultiplier).toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium group-hover:text-slate-800 whitespace-nowrap">
                      {date.slice(5)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-slate-400 text-xs py-12">
                No chronologically indexed data available.
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-3 border-t border-slate-100 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Inflow (Credit)
            </span>
            <span className="flex items-center gap-1.5">
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
