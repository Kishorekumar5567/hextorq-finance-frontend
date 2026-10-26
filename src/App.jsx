import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [adata, setadata] = useState([]);
  const [filterdata, setfilterdata] = useState([]);
  const [ismodalopen, setismodalopen] = useState(false);
  const [adddata, setadddata] = useState({
    date: "",
    description: "",
    amount: "",
    type: "",
    remarks: "",
  });
  const [message, setmessage] = useState("");
  const [month, setmonth] = useState("");

  const getalldata = async () => {
    await axios.get("http://localhost:8000/tracks").then((res) => {
      setadata(res.data);
      setfilterdata(res.data);
    });
  };

  useEffect(() => {
    getalldata();
  }, []);

  //Search
  const handlesearch = (e) => {
    const searchtext = e.target.value.toLowerCase();
    const filtereddata = adata.filter((d) => {
      return (
        d.type.toLowerCase().includes(searchtext) ||
        d.remarks.toLowerCase().includes(searchtext)
      );
    });
    setfilterdata(filtereddata);
  };

  //delete
  const handledelete = async (id) => {
    const isconfirmed = window.confirm(
      "Are you sure you want to delete this data?",
    );
    if (isconfirmed) {
      await axios.delete(`http://localhost:8000/tracks/${id}`).then((res) => {
        setadata(res.data);
        setfilterdata(res.data);
      });
    }
  };

  //close modal
  const closemodal = () => {
    setismodalopen(false);
    getalldata();
  };

  //add
  const handleadd = async () => {
    setadddata({
      date: "",
      description: "",
      amount: "",
      type: "",
      remarks: "",
    });
    setismodalopen(true);
  };

  const handleadddata = (e) => {
    setadddata({ ...adddata, [e.target.name]: e.target.value });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    const { date, description, amount, type, remarks } = adddata;

    if (!date || !description || !amount || !type || !remarks) {
      setmessage("All fields are required");
      return;
    }

    try {
      let res;

      if (adddata.id) {
        res = await axios.patch(
          `http://localhost:8000/tracks/${adddata.id}`,
          adddata,
        );
      } else {
        res = await axios.post("http://localhost:8000/tracks", adddata);
      }
      getalldata();
      setadddata({
        date: "",
        description: "",
        amount: "",
        type: "",
        remarks: "",
      });
      setmessage(res.data.message);
    } catch (err) {
      console.log(err); // check the browser console to see the real cause
      setmessage(err.response?.data?.message || "Something went wrong");
    }
  };

  //edit
  const handleedit = (d) => {
    setadddata(d);
    setmessage("");
    setismodalopen(true);
  };

  //search by month
  const handlemonth = (e) => {
  const selected = e.target.value; // e.g. "2026-09" or "" when cleared
  setmonth(selected);

  if (!selected) {
    setfilterdata(adata); // cleared, show everything
    return;
  }

  const filtered = adata.filter((d) => d.date.startsWith(selected));
  setfilterdata(filtered);
};

//credit & debit
const creditTotal = filterdata
  .filter((d) => d.type === "Credit")
  .reduce((sum, d) => sum + Number(d.amount), 0);

const debitTotal = filterdata
  .filter((d) => d.type === "Debit")
  .reduce((sum, d) => sum + Number(d.amount), 0);

const balance = creditTotal - debitTotal;

  return (
    <>
      <div className="flex min-h-screen  justify-center p-4">
        <div className=" w-full max-w-4xl rounded-xl border border-slate-200  p-5 shadow-sm bg-slate-100">
          <div className="flex justify-between">
            <h1 className="rounded-xl border bg-slate-700 text-white  p-3 mb-4 text-2xl font-semibold">
              Revenue and Cost Tracker
            </h1>

            <input
              type="search"
              placeholder="Search text here"
              className="w-64 h-10 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              onChange={handlesearch}
            />

            <input
              type="month"
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={month}
              onChange={handlemonth}
            />

            <button
              className="rounded-md bg-blue-500 px-3 py-2 text-md font-medium text-white cursor-pointer transition hover:bg-blue-700 mb-4"
              onClick={handleadd}
            >
              ADD
            </button>
          </div>
          <div className="max-h-150 overflow-y-auto border border-slate-300 rounded-md">
            <table className="w-full border-collapse border border-slate-300 text-center">
              <thead className="sticky -top-1 z-10 bg-slate-700 ">
                <tr className="bg-slate-700 text-white">
                  <th className="border border-slate-300 px-3 py-2 sticky top-0 z-10">
                    Date
                  </th>
                  <th className="border border-slate-300 px-3 py-2">
                    Description
                  </th>
                  <th className="border border-slate-300 px-3 py-2">Amount</th>
                  <th className="border border-slate-300 px-3 py-2">Type</th>
                  <th className="border border-slate-300 px-3 py-2">Remarks</th>
                  <th className="border border-slate-300 px-3 py-2">Edit</th>
                  <th className="border border-slate-300 px-3 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filterdata &&
                  filterdata.map((d) => {
                    return (
                      <tr className="bg-slate-400" key={d.id}>
                        <td className="border border-slate-300 px-3 py-2">
                          {d.date}
                        </td>
                        <td className="border border-slate-300 px-3 py-2">
                          {d.description}
                        </td>
                        <td className="border border-slate-300 px-3 py-2">
                          {d.amount}
                        </td>
                        <td
                          className={`border border-slate-300 px-3 py-2 font-semibold ${d.type === "Credit" ? "text-green-700" : "text-red-700"}`}
                        >
                          {d.type}
                        </td>
                        <td className="border border-slate-300 px-3 py-2">
                          {d.remarks}
                        </td>
                        <td className="border border-slate-300 px-3 py-2">
                          <button
                            className="rounded-md bg-green-500 px-3 py-2 text-md font-medium text-white  transition hover:bg-green-700"
                            onClick={() => handleedit(d)}
                          >
                            Edit
                          </button>
                        </td>
                        <td className="border border-slate-300 px-3 py-2">
                          <button
                            className="rounded-md bg-red-500 px-3 py-2 text-md font-medium text-white cursor-pointer transition hover:bg-red-700"
                            onClick={() => handledelete(d.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>{" "}
          <div className=" flex  rounded-xl  justify-center bg-slate-700 mt-4 ">
            <p className="p-4 font-bold text-green-600">
              {" "}
              Credit Amt :{" "}
              <span className="rounded-sm bg-white text-slate-950 p-1 ">
                 {creditTotal.toLocaleString("en-IN")}
              </span>
            </p>
            <p className="p-4 font-bold text-red-600">
              {" "}
              Debit Amt :{" "}
              <span className="rounded-sm bg-white text-slate-950 p-1 ">
                 {debitTotal.toLocaleString("en-IN")}
              </span>
            </p>
            <p className="p-4 font-bold text-white">
              {" "}
              Total Amt :{" "}
              <span className="rounded-sm bg-white text-slate-950 p-1 ">
                {balance.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
          {ismodalopen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                <span
                  className="text-2xl float-right text-red-400 cursor-pointer hover:text-red-700 font-bold"
                  onClick={closemodal}
                >
                  &times;
                </span>
                <h2 className="mb-4 text-xl font-semibold text-slate-800">
                  Data Entry
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="date"
                      className="text-sm font-medium text-slate-600"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus: ring-2 focus:ring-blue-200"
                      value={adddata.date}
                      onChange={handleadddata}
                      placeholder="00/00/0000"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium text-slate-600"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      id="description"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus: ring-2 focus:ring-blue-200"
                      value={adddata.description}
                      onChange={handleadddata}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="amount"
                      className="text-sm font-medium text-slate-600"
                    >
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus: ring-2 focus:ring-blue-200"
                      value={adddata.amount}
                      onChange={handleadddata}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="type"
                      className="text-sm font-medium text-slate-600"
                    >
                      Type
                    </label>
                    <select
                      name="type"
                      value={adddata.type}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus: ring-2 focus:ring-blue-200"
                      onChange={handleadddata}
                    >
                      <option value="">Select type</option>
                      <option value="Credit">Credit</option>
                      <option value="Debit">Debit</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="remarks"
                      className="text-sm font-medium text-slate-600"
                    >
                      Remarks
                    </label>
                    <input
                      type="text"
                      name="remarks"
                      id="remarks"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus: ring-2 focus:ring-blue-200"
                      value={adddata.remarks}
                      onChange={handleadddata}
                    />
                  </div>
                  <div>
                    <button
                      className="rounded-md bg-blue-500 px-3 py-2 text-md font-medium text-white cursor-pointer transition hover:bg-blue-700 mb-4"
                      onClick={handlesubmit}
                    >
                      ADD
                    </button>
                    {message && (
                      <p
                        className={`text-sm font-medium ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}
                      >
                        {message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
