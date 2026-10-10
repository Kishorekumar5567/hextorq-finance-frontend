import { useEffect, useState, useMemo } from "react";
import "./App.css";
import axios from "axios";
import {
  Plus,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  RefreshCw,
  Wallet,
  Receipt,
  ChevronUp,
  ChevronDown,
  Laptop,
  Cloud,
  CreditCard,
  Building2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import CashflowChart from "./components/CashflowChart";
import TransactionModal from "./components/TransactionModal";
import Toast from "./components/Toast";
import AmbientBackground from "./components/AmbientBackground";
import Card3D from "./components/Card3D";
import HexTorq3DVisual from "./components/HexTorq3DVisual";
import { StatCardSkeleton, TableRowSkeleton } from "./components/Skeletons";
import { motion } from "motion/react";

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

  // Keyboard shortcut ('/' to focus search)
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
        comparison = new Date(b.date || 0) - new Date(a.date || 0);
      } else if (sortField === "amount") {
        comparison = (Number(b.amount) || 0) - (Number(a.amount) || 0);
      } else if (sortField === "description") {
        comparison = (a.description || "").localeCompare(b.description || "");
      } else if (sortField === "type") {
        comparison = (a.type || "").localeCompare(b.type || "");
      }
      return sortOrder === "asc" ? -comparison : comparison;
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

  // Delete transaction
  const handledelete = async (id) => {
    const isconfirmed = window.confirm(
      "Are you sure you want to delete this transaction record?"
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
      showToast("Transaction record deleted.", "info");
    } catch (err) {
      console.error("Failed to delete track:", err);
      showToast("Failed to delete transaction.", "error");
    }
  };

  // Batch delete selected transactions
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    const isconfirmed = window.confirm(
      `Permanently delete all ${selectedIds.length} selected transaction(s)?`
    );
    if (!isconfirmed) return;

    try {
      for (const id of selectedIds) {
        await axios.delete(`${API_URL}/tracks/${id}`);
      }
      setSelectedIds([]);
      getalldata();
      showToast(`Deleted ${selectedIds.length} transaction(s).`);
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
      showToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      if (editingid) {
        await axios.put(`${API_URL}/tracks/${editingid}`, formData);
        showToast("Transaction updated.");
      } else {
        await axios.post(`${API_URL}/tracks`, formData);
        showToast("New transaction recorded.");
      }
      setismodalopen(false);
      getalldata();
    } catch (err) {
      console.error("Failed to save track:", err);
      showToast("Error saving record to server.", "error");
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
      showToast("No data to export.", "error");
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

  // Category Icon helper
  const getCategoryIcon = (desc = "") => {
    const text = desc.toLowerCase();
    if (text.includes("cloud") || text.includes("aws") || text.includes("server")) {
      return <Cloud className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (text.includes("software") || text.includes("saas") || text.includes("license")) {
      return <Laptop className="w-3.5 h-3.5 text-indigo-600" />;
    }
    if (text.includes("card") || text.includes("bank") || text.includes("payment")) {
      return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
    }
    return <Building2 className="w-3.5 h-3.5 text-slate-600" />;
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      {/* Dynamic Animated Ambient Background */}
      <AmbientBackground />

      {/* Top Application Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-xs p-1.5 shrink-0">
              <img
                src="/logo.png"
                alt="HexTorq Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/logo.svg";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  HexTorq
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                  Finance OS
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  3D Cinematic
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                <span>Revenue & Cost Ledger</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      apiOnline ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  {apiOnline ? "Live API :8000" : "Offline"}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Currency Selector */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => setCurrency("INR")}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  currency === "INR"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  currency === "USD"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Export CSV Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer shadow-xs active:scale-95"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </motion.button>

            {/* Refresh */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={getalldata}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer shadow-xs active:scale-95"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </motion.button>

            {/* Record Transaction Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleadd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm shadow-slate-900/10 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Transaction
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards (Bento Grid) */}
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
              {/* Gross Revenue */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card3D className="p-6 h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Gross Revenue
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-2xs">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-mono-numbers">
                      {currencySymbol}
                      {(metrics.totalCredit * currencyMultiplier).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        Total Inflow
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {adata.filter((d) => d.type?.toLowerCase() === "credit").length} payments
                      </span>
                    </div>
                  </div>
                </Card3D>
              </motion.div>

              {/* Operating Cost */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card3D className="p-6 h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Operating Cost
                    </span>
                    <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 shadow-2xs">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-mono-numbers">
                      {currencySymbol}
                      {(metrics.totalDebit * currencyMultiplier).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        Burn Rate
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {adata.filter((d) => d.type?.toLowerCase() === "debit").length} expenses
                      </span>
                    </div>
                  </div>
                </Card3D>
              </motion.div>

              {/* Net Balance (Featuring Interactive 3D HexTorq Polyhedron) */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card3D className="p-6 h-full border-emerald-200/60 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Net Operating Balance
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-semibold text-slate-400">Live 3D Treasury</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HexTorq3DVisual size={38} />
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p
                      className={`text-2xl lg:text-3xl font-extrabold tracking-tight font-mono-numbers ${
                        metrics.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {currencySymbol}
                      {(metrics.netBalance * currencyMultiplier).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        Margin: {metrics.profitMargin}%
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {metrics.netBalance >= 0 ? "Profitable" : "Deficit Alert"}
                      </span>
                    </div>
                  </div>
                </Card3D>
              </motion.div>

              {/* Total Volume */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card3D className="p-6 h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total Volume
                    </span>
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-mono-numbers">
                      {currencySymbol}
                      {(metrics.totalVolume * currencyMultiplier).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                        {metrics.count} Entries
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Reconciled</span>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            </>
          )}
        </section>

        {/* Velocity & Capital Health Chart */}
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <CashflowChart
            tracks={adata}
            currencySymbol={currencySymbol}
            currencyMultiplier={currencyMultiplier}
          />
        </motion.section>

        {/* Ledger Data Table Section */}
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md shadow-xs overflow-hidden"
        >
          {/* Table Controls Bar */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                id="ledger-search-input"
                type="search"
                placeholder="Search description, notes, or date... ('/' to focus)"
                value={searchtext}
                onChange={(e) => {
                  setsearchtext(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
              />
              {searchtext && (
                <button
                  type="button"
                  onClick={() => setsearchtext("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills & Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Batch Delete button */}
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected ({selectedIds.length})
                </button>
              )}

              {/* Filter Chips */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    typeFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
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
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    typeFilter === "credit"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
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
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    typeFilter === "debit"
                      ? "bg-white text-rose-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
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
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    typeFilter === "high-value"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  &gt; ₹50K
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortField(field);
                    setSortOrder(order);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-slate-900 cursor-pointer shadow-xs"
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
          <div className="overflow-x-auto max-h-[540px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        paginatedData.length > 0 &&
                        selectedIds.length === paginatedData.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortField === "date" && (
                        sortOrder === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-900" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-900" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center gap-1">
                      Description
                      {sortField === "description" && (
                        sortOrder === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-900" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-900" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {sortField === "type" && (
                        sortOrder === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-900" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-900" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-5 text-right cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Amount ({currencySymbol})
                      {sortField === "amount" && (
                        sortOrder === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-900" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-900" />
                        )
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-5">Remarks</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                        className={`transition-colors duration-100 ${
                          isSelected
                            ? "bg-blue-50/60"
                            : index % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50/40"
                        } hover:bg-slate-50`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(d.id)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[12px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {d.date}
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                              {getCategoryIcon(d.description)}
                            </div>
                            <span className="font-semibold text-slate-900 text-xs">
                              {d.description}
                            </span>
                          </div>
                        </td>

                        {/* Type pill */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-rose-600" />
                            )}
                            {d.type}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-5 whitespace-nowrap text-right">
                          <span
                            className={`font-mono-numbers text-xs font-bold ${
                              isCredit ? "text-emerald-700" : "text-rose-700"
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
                        <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate text-[11px]">
                          {d.remarks ? (
                            <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                              {d.remarks}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleedit(d)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                              title="Edit transaction"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handledelete(d.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Layers className="w-8 h-8 text-slate-300 mb-1" />
                        <p className="text-sm font-semibold text-slate-700">
                          No transactions found
                        </p>
                        <p className="text-xs text-slate-400">
                          Try searching for another keyword or clear current filters.
                        </p>
                        <button
                          type="button"
                          onClick={handleadd}
                          className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
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

          {/* Table Footer Pagination */}
          <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2 font-medium">
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
                  className="ml-1.5 rounded-lg bg-white border border-slate-200 px-2 py-1 text-slate-700 outline-none font-semibold cursor-pointer shadow-2xs"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </span>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer font-semibold shadow-2xs"
              >
                Previous
              </button>
              <span className="px-2 font-mono text-slate-700 font-semibold text-xs">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer font-semibold shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        </motion.section>

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
      </main>
    </div>
  );
}

export default App;
