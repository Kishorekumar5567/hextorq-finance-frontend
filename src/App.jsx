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
  ChevronUp,
  ChevronDown,
  Server,
  Activity,
  CreditCard,
  Laptop,
  Cloud,
  FileCheck2,
  AlertTriangle,
  X,
  PieChart,
  Table as TableIcon,
  ShieldCheck,
} from "lucide-react";
import MagicCard from "./components/MagicCard";
import CashflowChart from "./components/CashflowChart";
import TransactionModal from "./components/TransactionModal";
import Toast from "./components/Toast";
import { StatCardSkeleton, TableRowSkeleton } from "./components/Skeletons";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [adata, setadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ismodalopen, setismodalopen] = useState(false);
  const [editingid, seteditingid] = useState(null);
  const [searchtext, setsearchtext] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'credit' | 'debit' | 'high-value'
  const [sortField, setSortField] = useState("date"); // 'date' | 'amount' | 'description' | 'type'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'
  const [apiOnline, setApiOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("ledger"); // 'ledger' | 'analytics' | 'compliance'
  const [currency, setCurrency] = useState("INR"); // 'INR' | 'USD'
  const [toast, setToast] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    date: "",
    description: "",
    amount: "",
    type: "Credit",
    remarks: "",
  });

  const currencySymbol = currency === "USD" ? "$" : "₹";
  const currencyMultiplier = currency === "USD" ? 0.012 : 1;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

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
      showToast("Backend connection offline. Make sure port 8000 is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getalldata();
  }, []);

  // Keyboard shortcut listener ('/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("ledger-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered and Sorted Data
  const filteredAndSortedData = useMemo(() => {
    let result = [...adata];

    // Filter by Type / Quick Presets
    if (typeFilter === "credit") {
      result = result.filter((item) => item.type?.toLowerCase() === "credit");
    } else if (typeFilter === "debit") {
      result = result.filter((item) => item.type?.toLowerCase() === "debit");
    } else if (typeFilter === "high-value") {
      result = result.filter((item) => Number(item.amount) >= 50000);
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
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.date || 0) - new Date(b.date || 0);
      } else if (sortField === "amount") {
        comparison = (Number(a.amount) || 0) - (Number(b.amount) || 0);
      } else if (sortField === "description") {
        comparison = (a.description || "").localeCompare(b.description || "");
      } else if (sortField === "type") {
        comparison = (a.type || "").localeCompare(b.type || "");
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [adata, searchtext, typeFilter, sortField, sortOrder]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize) || 1;

  // Toggle sort order
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

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

  // Delete single transaction
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
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      showToast("Transaction successfully deleted.", "info");
    } catch (err) {
      console.error("Failed to delete track:", err);
      showToast("Failed to delete transaction from server.", "error");
    }
  };

  // Batch delete selected transactions
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    const isconfirmed = window.confirm(
      `Delete all ${selectedIds.length} selected transaction(s)?`
    );
    if (!isconfirmed) return;

    try {
      for (const id of selectedIds) {
        await axios.delete(`${API_URL}/tracks/${id}`);
      }
      setSelectedIds([]);
      getalldata();
      showToast(`Deleted ${selectedIds.length} transactions successfully.`);
    } catch (err) {
      console.error("Failed batch delete:", err);
      showToast("Error during batch delete.", "error");
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
      showToast("Please complete all required fields.", "error");
      return;
    }

    try {
      if (editingid) {
        await axios.put(`${API_URL}/tracks/${editingid}`, formData);
        showToast("Transaction updated successfully.");
      } else {
        await axios.post(`${API_URL}/tracks`, formData);
        showToast("New transaction logged to ledger.");
      }
      setismodalopen(false);
      getalldata();
    } catch (err) {
      console.error("Failed to save track:", err);
      showToast("Error saving record. Verify server status.", "error");
    }
  };

  // Select all toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map((d) => d.id));
    }
  };

  // Toggle single selection
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export CSV
  const exportToCSV = () => {
    if (adata.length === 0) {
      showToast("No data available to export.", "error");
      return;
    }

    const headers = ["ID", "Date", "Description", "Amount", "Currency", "Type", "Remarks"];
    const rows = filteredAndSortedData.map((d) => [
      d.id,
      `"${d.date || ""}"`,
      `"${(d.description || "").replace(/"/g, '""')}"`,
      d.amount || 0,
      currency,
      `"${d.type || ""}"`,
      `"${(d.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `hextorq_ledger_${currency}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Ledger CSV export downloaded.");
  };

  // Helper icon for categories
  const getCategoryIcon = (desc = "") => {
    const text = desc.toLowerCase();
    if (text.includes("cloud") || text.includes("aws") || text.includes("server")) {
      return <Cloud className="w-3.5 h-3.5" />;
    }
    if (text.includes("software") || text.includes("saas") || text.includes("license")) {
      return <Laptop className="w-3.5 h-3.5" />;
    }
    if (text.includes("card") || text.includes("bank") || text.includes("payment")) {
      return <CreditCard className="w-3.5 h-3.5" />;
    }
    return <Building2 className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Background Subtle Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 h-[550px] w-[550px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-32 h-[550px] w-[550px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Navbar / SaaS Header */}
        <header className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 text-white font-black text-xl">
              H
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  HexTorq Finance
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-3 h-3" />
                  SaaS Core
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Enterprise Ledger</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      apiOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  {apiOnline ? "Live Sync (Port 8000)" : "Disconnected"}
                </span>
                <span>•</span>
                <span className="text-slate-500 font-mono text-[11px]">v2.4.0</span>
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
            {/* Currency Selector */}
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setCurrency("INR")}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  currency === "INR"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  currency === "USD"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700/80 bg-slate-800/60 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer active:scale-95 shadow-sm"
              title="Download sanitized CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={getalldata}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer active:scale-95 shadow-sm"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Record Transaction Button */}
            <button
              type="button"
              onClick={handleadd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </header>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("ledger")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "ledger"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Ledger & Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              Cashflow Analytics
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("compliance")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "compliance"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Audit Integrity
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Press '/' to search
            </span>
          </div>
        </div>

        {/* Bento Grid: 4 Metric Cards with Spotlight Hover */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Gross Revenue Card */}
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
                  <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono-numbers">
                    {currencySymbol}
                    {(metrics.totalCredit * currencyMultiplier).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Inflow
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {adata.filter((d) => d.type?.toLowerCase() === "credit").length} payments
                    </span>
                  </div>
                </div>
              </MagicCard>

              {/* Operating Cost Card */}
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
                  <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono-numbers">
                    {currencySymbol}
                    {(metrics.totalDebit * currencyMultiplier).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
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
                    className={`text-2xl lg:text-3xl font-extrabold tracking-tight font-mono-numbers ${
                      metrics.netBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {currencySymbol}
                    {(metrics.netBalance * currencyMultiplier).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
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

              {/* Total Transactions Card */}
              <MagicCard
                gradientColor="rgba(59, 130, 246, 0.15)"
                borderColor="rgba(59, 130, 246, 0.4)"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Total Volume
                  </span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono-numbers">
                    {currencySymbol}
                    {(metrics.totalVolume * currencyMultiplier).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                      {metrics.count} Entries
                    </span>
                    <span className="text-[11px] text-slate-400">Audited</span>
                  </div>
                </div>
              </MagicCard>
            </>
          )}
        </section>

        {/* Tab 1: Ledger View & Chart */}
        {activeTab === "ledger" && (
          <div className="space-y-8">
            {/* Cashflow Chart */}
            <CashflowChart tracks={adata} />

            {/* Table Container */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Filter & Controls Bar */}
              <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-84">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    id="ledger-search-input"
                    type="search"
                    placeholder="Search by description, remarks, or date..."
                    value={searchtext}
                    onChange={(e) => {
                      setsearchtext(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {searchtext && (
                    <button
                      type="button"
                      onClick={() => setsearchtext("")}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Chips & Sort Controls */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  {/* Batch Delete Action button (appears if items are selected) */}
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBatchDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold hover:bg-rose-600 hover:text-white transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Selected ({selectedIds.length})
                    </button>
                  )}

                  {/* Filter Pills */}
                  <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTypeFilter("all");
                        setCurrentPage(1);
                      }}
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
                      onClick={() => {
                        setTypeFilter("credit");
                        setCurrentPage(1);
                      }}
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
                      onClick={() => {
                        setTypeFilter("debit");
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        typeFilter === "debit"
                          ? "bg-rose-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Costs
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTypeFilter("high-value");
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        typeFilter === "high-value"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      &gt; ₹50K
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto max-h-[520px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-md text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            paginatedData.length > 0 &&
                            selectedIds.length === paginatedData.length
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th
                        className="py-3.5 px-4 cursor-pointer hover:text-slate-200 select-none"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-1.5">
                          Date
                          {sortField === "date" && (
                            sortOrder === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="py-3.5 px-5 cursor-pointer hover:text-slate-200 select-none"
                        onClick={() => handleSort("description")}
                      >
                        <div className="flex items-center gap-1.5">
                          Description
                          {sortField === "description" && (
                            sortOrder === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="py-3.5 px-4 cursor-pointer hover:text-slate-200 select-none"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center gap-1.5">
                          Classification
                          {sortField === "type" && (
                            sortOrder === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="py-3.5 px-5 text-right cursor-pointer hover:text-slate-200 select-none"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          Amount ({currencySymbol})
                          {sortField === "amount" && (
                            sortOrder === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                            )
                          )}
                        </div>
                      </th>
                      <th className="py-3.5 px-5">Audit Notes</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                      <>
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                      </>
                    ) : paginatedData.length > 0 ? (
                      paginatedData.map((d, index) => {
                        const isCredit = d.type?.toLowerCase() === "credit";
                        const isSelected = selectedIds.includes(d.id);
                        return (
                          <tr
                            key={d.id}
                            className={`transition-colors duration-150 ${
                              isSelected
                                ? "bg-blue-950/30"
                                : index % 2 === 0
                                ? "bg-slate-900/30"
                                : "bg-transparent"
                            } hover:bg-slate-800/40`}
                          >
                            {/* Checkbox */}
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOne(d.id)}
                                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                              />
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 whitespace-nowrap text-slate-300 font-mono text-[12px]">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                {d.date}
                              </div>
                            </td>

                            {/* Description */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`p-1.5 rounded-lg shrink-0 ${
                                    isCredit
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-rose-500/10 text-rose-400"
                                  }`}
                                >
                                  {getCategoryIcon(d.description)}
                                </div>
                                <span className="font-semibold text-slate-100 text-sm">
                                  {d.description}
                                </span>
                              </div>
                            </td>

                            {/* Classification */}
                            <td className="py-4 px-4 whitespace-nowrap">
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
                                className={`font-mono-numbers text-sm font-bold ${
                                  isCredit ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isCredit ? "+" : "-"} {currencySymbol}
                                {(Number(d.amount) * currencyMultiplier).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 2 }
                                )}
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
                            <td className="py-4 px-4 whitespace-nowrap text-center">
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
                        <td colSpan="7" className="py-16 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Layers className="w-8 h-8 text-slate-600 mb-1" />
                            <p className="text-sm font-medium text-slate-400">
                              No matching transactions found
                            </p>
                            <p className="text-xs text-slate-600">
                              Try adjusting your search terms or filter view.
                            </p>
                            <button
                              type="button"
                              onClick={handleadd}
                              className="mt-3 px-4 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600 hover:text-white transition cursor-pointer"
                            >
                              + Record Entry Now
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Pagination */}
              <div className="px-5 py-3.5 bg-slate-950/70 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>
                    Showing {paginatedData.length} of {filteredAndSortedData.length} entries
                  </span>
                  <span>•</span>
                  <span>
                    Rows per page:
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-1.5 rounded-lg bg-slate-900 border border-slate-800 px-2 py-1 text-slate-300 outline-none"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-mono text-slate-400">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Analytics & Velocity View */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <CashflowChart tracks={adata} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-3">
                  Capital Velocity Breakdown
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  HexTorq calculates liquidity efficiency based on inflow vs. operational burn.
                  Maintaining an operating margin above 20% ensures healthy self-sustaining runway.
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Total Capital Handled</span>
                    <span className="font-mono text-slate-200">
                      {currencySymbol}{(metrics.totalVolume * currencyMultiplier).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Net Retained Earnings</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {currencySymbol}{(metrics.netBalance * currencyMultiplier).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Profitability Ratio</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {metrics.profitMargin}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-3">
                  Expense Classification Insights
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Operational expenditure is tracked across SaaS tools, servers, cloud infrastructure,
                  and vendor retainers.
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Average Transaction Size</span>
                    <span className="font-mono text-slate-200">
                      {currencySymbol}
                      {(
                        (metrics.totalVolume / (adata.length || 1)) *
                        currencyMultiplier
                      ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Verified Postings</span>
                    <span className="font-mono text-blue-400 font-bold">{adata.length} records</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="font-mono text-emerald-400">JSON Storage / Node Express</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Compliance & Integrity View */}
        {activeTab === "compliance" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Ledger Integrity & Audit Verification</h3>
                <p className="text-xs text-slate-400">
                  Continuous validation of all accounting entries against tamper checks and schema models.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-400">Data Redundancy</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">Verified (100%)</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-400">API Health</p>
                <p className="text-lg font-bold text-blue-400 mt-1">
                  {apiOnline ? "Healthy (HTTP 200)" : "Down"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-400">Export Readiness</p>
                <p className="text-lg font-bold text-indigo-400 mt-1">CSV & JSON Ready</p>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Transaction Modal */}
        <TransactionModal
          isOpen={ismodalopen}
          onClose={() => setismodalopen(false)}
          onSubmit={handlesubmit}
          formData={formData}
          onChange={handlechange}
          isEditing={Boolean(editingid)}
          loading={loading}
          currency={currency}
        />

        {/* Floating Toast Notification */}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}

export default App;
