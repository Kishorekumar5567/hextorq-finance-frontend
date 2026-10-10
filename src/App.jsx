import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [adata, setadata] = useState([]);
  const [filterdata, setfilterdata] = useState([]);
  const [ismodalopen, setismodalopen] = useState(false);
  const [editingid, seteditingid] = useState(null);
  const [searchtext, setsearchtext] = useState("");
  const [adddata, setadddata] = useState({
    date: "",
    description: "",
    amount: "",
    type: "Credit",
    remarks: "",
  });

  const getalldata = async () => {
    try {
      const res = await axios.get(`${API_URL}/tracks`);
      setadata(res.data);
      setfilterdata(res.data);
    } catch (err) {
      console.error("Failed to fetch tracks:", err);
    }
  };

  useEffect(() => {
    getalldata();
  }, []);

  // Search filter
  const handlesearch = (e) => {
    const val = e.target.value.toLowerCase();
    setsearchtext(val);
    if (!val) {
      setfilterdata(adata);
      return;
    }
    const filtered = adata.filter((d) => {
      return (
        (d.description && d.description.toLowerCase().includes(val)) ||
        (d.type && d.type.toLowerCase().includes(val)) ||
        (d.remarks && d.remarks.toLowerCase().includes(val)) ||
        (d.date && d.date.toLowerCase().includes(val))
      );
    });
    setfilterdata(filtered);
  };

  // Delete handler
  const handledelete = async (id) => {
    const isconfirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (isconfirmed) {
      try {
        const res = await axios.delete(`${API_URL}/tracks/${id}`);
        setadata(res.data);
        if (searchtext) {
          const filtered = res.data.filter((d) =>
            (d.description && d.description.toLowerCase().includes(searchtext)) ||
            (d.type && d.type.toLowerCase().includes(searchtext)) ||
            (d.remarks && d.remarks.toLowerCase().includes(searchtext)) ||
            (d.date && d.date.toLowerCase().includes(searchtext))
          );
          setfilterdata(filtered);
        } else {
          setfilterdata(res.data);
        }
      } catch (err) {
        console.error("Failed to delete track:", err);
      }
    }
  };

  // Open modal for Adding
  const handleadd = () => {
    seteditingid(null);
    setadddata({
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
    setadddata({
      date: item.date || "",
      description: item.description || "",
      amount: item.amount || "",
      type: item.type || "Credit",
      remarks: item.remarks || "",
    });
    setismodalopen(true);
  };

  // Input change handler
  const handlechange = (e) => {
    const { name, value } = e.target;
    setadddata((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Add or Edit
  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!adddata.date || !adddata.description || adddata.amount === "" || !adddata.type) {
      alert("Please fill in Date, Description, Amount, and Type");
      return;
    }

    try {
      if (editingid) {
        await axios.put(`${API_URL}/tracks/${editingid}`, adddata);
      } else {
        await axios.post(`${API_URL}/tracks`, adddata);
      }
      setismodalopen(false);
      getalldata();
    } catch (err) {
      console.error("Failed to save track:", err);
      alert("Error saving record. Please verify the backend is running.");
    }
  };

  // Dynamic Totals calculation
  const creditTotal = adata
    .filter((d) => d.type && d.type.toLowerCase() === "credit")
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const debitTotal = adata
    .filter((d) => d.type && d.type.toLowerCase() === "debit")
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const netTotal = creditTotal - debitTotal;

  return (
    <div className="flex min-h-screen justify-center p-4 bg-slate-200">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-300 p-6 shadow-md bg-white">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="rounded-xl bg-slate-800 text-white px-5 py-3 text-2xl font-bold tracking-wide shadow">
            Revenue and Cost Tracker
          </h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="search"
              placeholder="Search description, type, remarks..."
              value={searchtext}
              className="w-full md:w-72 h-11 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              onChange={handlesearch}
            />

            <button
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 cursor-pointer whitespace-nowrap"
              onClick={handleadd}
            >
              + ADD
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded-xl shadow-inner">
          <table className="w-full border-collapse text-center text-sm">
            <thead className="sticky top-0 z-10 bg-slate-800 text-white shadow">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-left">Description</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold text-left">Remarks</th>
                <th className="px-4 py-3 font-semibold">Edit</th>
                <th className="px-4 py-3 font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filterdata && filterdata.length > 0 ? (
                filterdata.map((d, index) => {
                  const isCredit = d.type && d.type.toLowerCase() === "credit";
                  return (
                    <tr
                      className={`transition hover:bg-slate-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-100/60"
                      }`}
                      key={d.id}
                    >
                      <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                        {d.date}
                      </td>
                      <td className="px-4 py-3 text-left font-medium text-slate-800">
                        {d.description}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800 whitespace-nowrap">
                        {Number(d.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isCredit
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "bg-rose-100 text-rose-700 border border-rose-300"
                          }`}
                        >
                          {d.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left text-slate-600 text-xs">
                        {d.remarks || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 cursor-pointer active:scale-95"
                          onClick={() => handleedit(d)}
                        >
                          Edit
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 cursor-pointer active:scale-95"
                          onClick={() => handledelete(d.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-12 text-center text-slate-500 font-medium"
                  >
                    No transaction records found. Click "+ ADD" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Financial Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Total Credit
              </p>
              <p className="text-2xl font-extrabold text-emerald-800 mt-1">
                ₹ {creditTotal.toLocaleString()}
              </p>
            </div>
            <span className="text-2xl font-bold text-emerald-500">↑</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-4 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Total Debit
              </p>
              <p className="text-2xl font-extrabold text-rose-800 mt-1">
                ₹ {debitTotal.toLocaleString()}
              </p>
            </div>
            <span className="text-2xl font-bold text-rose-500">↓</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-800 border border-slate-700 p-4 shadow-sm text-white">
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Net Balance
              </p>
              <p
                className={`text-2xl font-extrabold mt-1 ${
                  netTotal >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                ₹ {netTotal.toLocaleString()}
              </p>
            </div>
            <span className="text-xs font-semibold bg-slate-700 px-2 py-1 rounded">
              {adata.length} Entries
            </span>
          </div>
        </div>

        {/* Add / Edit Modal */}
        {ismodalopen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingid ? "Edit Transaction" : "New Transaction Entry"}
                </h2>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer transition"
                  onClick={() => setismodalopen(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handlesubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={adddata.date}
                    onChange={handlechange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    required
                    placeholder="e.g. Website Development Payment"
                    value={adddata.description}
                    onChange={handlechange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      required
                      min="0"
                      step="any"
                      placeholder="e.g. 50000"
                      value={adddata.amount}
                      onChange={handlechange}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      required
                      value={adddata.type}
                      onChange={handlechange}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Credit">Credit (Income)</option>
                      <option value="Debit">Debit (Expense)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Remarks
                  </label>
                  <input
                    type="text"
                    name="remarks"
                    placeholder="e.g. Invoice #1024, Bank Transfer"
                    value={adddata.remarks}
                    onChange={handlechange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 mt-5">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                    onClick={() => setismodalopen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer transition active:scale-95"
                  >
                    {editingid ? "Save Changes" : "Add Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
