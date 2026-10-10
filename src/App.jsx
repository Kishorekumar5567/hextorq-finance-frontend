import { useEffect, useState, useMemo } from "react";
import "./App.css";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Building2,
  Wallet,
  Receipt,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import MagicCard from "./components/MagicCard";
import CashflowChart from "./components/CashflowChart";
import TransactionModal from "./components/TransactionModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [adata, setadata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ismodalopen, setismodalopen] = useState(false);
  const [editingid, seteditingid] = useState(null);
  const [searchtext, setsearchtext] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'credit' | 'debit'
  const [sortBy, setSortBy] = useState("date-desc"); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
  const [apiOnline, setApiOnline] = useState(true);

  const [formData, setFormData] = useState({
    date: "",
    description: "",
    amount: "",
    type: "Credit",
    remarks: "",
  });

  // Fetch all transactions from backend
  const getalldata = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tracks`);
      setadata(Array.isArray(res.data) ? res.data : []);
      setApiOnline(true);
    } catch (err) {
      console.error("Failed to fetch tracks:", err);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getalldata();
  }, []);

  // Filtered and Sorted Data
  const filteredAndSortedData = useMemo(() => {
    let result = [...adata];

    // Filter by Type
    if (typeFilter !== "all") {
      result = result.filter(
        (item) => item.type && item.type.toLowerCase() === typeFilter
      );
    }

    // Search query filter
    if (searchtext.trim()) {
      const q = searchtext.toLowerCase();
      result = result.filter(
        (item) =>
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.remarks && item.remarks.toLowerCase().includes(q)) ||
          (item.type && item.type.toLowerCase().includes(q)) ||
          (item.date && item.date.toLowerCase().includes(q))
      );
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date || 0) - new Date(a.date || 0);
      }
      if (sortBy === "date-asc") {
        return new Date(a.date || 0) - new Date(b.date || 0);
      }
      if (sortBy === "amount-desc") {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      }
      if (sortBy === "amount-asc") {
        return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      }
      return 0;
    });

    return result;
  }, [adata, searchtext, typeFilter, sortBy]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCredit = adata
      .filter((d) => d.type?.toLowerCase() === "credit")
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    const totalDebit = adata
      .filter((d) => d.type?.toLowerCase() === "debit")
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    const netBalance = totalCredit - totalDebit;
    const totalVolume = totalCredit + totalDebit;
    const profitMargin =
      totalCredit > 0 ? Math.round((netBalance / totalCredit) * 100) : 0;

    return {
      totalCredit,
      totalDebit,
      netBalance,
      totalVolume,
      profitMargin,
      count: adata.length,
    };
  }, [adata]);

  // Delete transaction
  const handledelete = async (id) => {
    const isconfirmed = window.confirm(
      "Are you sure you want to permanently delete this transaction record?"
    );
    if (!isconfirmed) return;

    try {
      const res = await axios.delete(`${API_URL}/tracks/${id}`);
      if (Array.isArray(res.data)) {
        setadata(res.data);
      } else {
        getalldata();
      }
    } catch (err) {
      console.error("Failed to delete track:", err);
      alert("Error deleting record from server.");
    }
  };

  // Open modal for Adding
  const handleadd = () => {
    seteditingid(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      type: "Credit",
      remarks: "",
    });
    setismodalopen(true);
  };

  // Open modal for Editing
  const handleedit = (item) => {
    seteditingid(item.id);
    setFormData({
      date: item.date || "",
      description: item.description || "",
      amount: item.amount || "",
      type: item.type || "Credit",
      remarks: item.remarks || "",
    });
    setismodalopen(true);
  };

  const handlechange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Add or Edit
  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.description || formData.amount === "" || !formData.type) {
      alert("Please fill in Date, Description, Amount, and Type");
      return;
    }

    try {
      if (editingid) {
        await axios.put(`${API_URL}/tracks/${editingid}`, formData);
      } else {
        await axios.post(`${API_URL}/tracks`, formData);
      }
      setismodalopen(false);
      getalldata();
    } catch (err) {
      console.error("Failed to save track:", err);
      alert("Error saving record. Please verify the backend connection.");
    }
  };

  // Export CSV
  const exportToCSV = () => {
    if (adata.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["ID", "Date", "Description", "Amount", "Type", "Remarks"];
    const rows = filteredAndSortedData.map((d) => [
      d.id,
      `"${d.date || ""}"`,
      `"${(d.description || "").replace(/"/g, '""')}"`,
      d.amount || 0,
      `"${d.type || ""}"`,
      `"${(d.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-600/10 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation / Top App Header */}
        <header className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 text-white font-black text-xl">
              H
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  HexTorq Finance
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-3 h-3" />
                  SaaS Core
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Enterprise Revenue & Expenditure Ledger</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      apiOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  {apiOnline ? "API Online (Port 8000)" : "API Disconnected"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer active:scale-95 shadow-sm"
              title="Export Current View to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            <button
              type="button"
              onClick={getalldata}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer active:scale-95 shadow-sm"
              title="Refresh ledger records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleadd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Record Entry
            </button>
          </div>
        </header>

        {/* Bento Grid: Metric Stat Cards with Spotlight Hover */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Card */}
          <MagicCard
            gradientColor="rgba(16, 185, 129, 0.15)"
            borderColor="rgba(16, 185, 129, 0.4)"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Gross Revenue
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                ₹{metrics.totalCredit.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Total Inflow
                </span>
                <span className="text-[11px] text-slate-400">
                  {adata.filter((d) => d.type?.toLowerCase() === "credit").length} payments
                </span>
              </div>
            </div>
          </MagicCard>

          {/* Expenses Card */}
          <MagicCard
            gradientColor="rgba(244, 63, 94, 0.15)"
            borderColor="rgba(244, 63, 94, 0.4)"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Operating Cost
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                ₹{metrics.totalDebit.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                  Burn Rate
                </span>
                <span className="text-[11px] text-slate-400">
                  {adata.filter((d) => d.type?.toLowerCase() === "debit").length} expenditures
                </span>
              </div>
            </div>
          </MagicCard>

          {/* Net Balance Card */}
          <MagicCard
            gradientColor="rgba(99, 102, 241, 0.18)"
            borderColor="rgba(99, 102, 241, 0.4)"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Net Operating Balance
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p
                className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${
                  metrics.netBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                ₹{metrics.netBalance.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  Margin: {metrics.profitMargin}%
                </span>
                <span className="text-[11px] text-slate-400">
                  {metrics.netBalance >= 0 ? "Cashflow Positive" : "Deficit Alert"}
                </span>
              </div>
            </div>
          </MagicCard>

          {/* Total Ledger Entries Card */}
          <MagicCard
            gradientColor="rgba(59, 130, 246, 0.15)"
            borderColor="rgba(59, 130, 246, 0.4)"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Total Transactions
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {metrics.count}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  Vol: ₹{metrics.totalVolume.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400">Verified</span>
              </div>
            </div>
          </MagicCard>
        </section>

        {/* Analytics Section: Cashflow Visual Velocity */}
        <section>
          <CashflowChart tracks={adata} />
        </section>

        {/* Ledger Controls & Table Container */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden">
          {/* Filter Bar */}
          <div className="p-5 border-b border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="search"
                placeholder="Search description, remarks, date..."
                value={searchtext}
                onChange={(e) => setsearchtext(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Quick Segment Filter & Sort */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Type Filter Buttons */}
              <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    typeFilter === "all"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All ({adata.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("credit")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    typeFilter === "credit"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("debit")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    typeFilter === "debit"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Costs
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 outline-none transition focus:border-blue-500 cursor-pointer"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto max-h-[520px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Classification</th>
                  <th className="py-3.5 px-5 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-5">Audit Notes</th>
                  <th className="py-3.5 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((d, index) => {
                    const isCredit = d.type?.toLowerCase() === "credit";
                    return (
                      <tr
                        key={d.id}
                        className={`transition-colors duration-150 hover:bg-slate-800/40 ${
                          index % 2 === 0 ? "bg-slate-900/30" : "bg-transparent"
                        }`}
                      >
                        {/* Date */}
                        <td className="py-4 px-5 whitespace-nowrap text-slate-300 font-mono text-[13px]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {d.date}
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`p-1.5 rounded-lg ${
                                isCredit
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-slate-100 text-sm">
                              {d.description}
                            </span>
                          </div>
                        </td>

                        {/* Classification */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              isCredit
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {d.type}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-5 whitespace-nowrap text-right">
                          <span
                            className={`font-mono text-sm font-bold ${
                              isCredit ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isCredit ? "+" : "-"} ₹{Number(d.amount).toLocaleString()}
                          </span>
                        </td>

                        {/* Remarks */}
                        <td className="py-4 px-5 text-slate-400 max-w-xs truncate text-[12px]">
                          {d.remarks ? (
                            <span className="inline-block bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                              {d.remarks}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleedit(d)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer"
                              title="Edit record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handledelete(d.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Layers className="w-8 h-8 text-slate-600 mb-1" />
                        <p className="text-sm font-medium text-slate-400">
                          No transactions matching your criteria
                        </p>
                        <p className="text-xs text-slate-600">
                          Try adjusting your search terms or filter view.
                        </p>
                        <button
                          type="button"
                          onClick={handleadd}
                          className="mt-3 px-4 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600 hover:text-white transition cursor-pointer"
                        >
                          + Record Transaction Now
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-3.5 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredAndSortedData.length} of {adata.length} recorded ledger entries
            </span>
            <span className="font-mono text-slate-400">
              Net: ₹{metrics.netBalance.toLocaleString()}
            </span>
          </div>
        </section>

        {/* Add / Edit Transaction Modal */}
        <TransactionModal
          isOpen={ismodalopen}
          onClose={() => setismodalopen(false)}
          onSubmit={handlesubmit}
          formData={formData}
          onChange={handlechange}
          isEditing={Boolean(editingid)}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default App;
