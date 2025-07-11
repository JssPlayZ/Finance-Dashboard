// client/src/pages/Ledger.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Ledger.css";
import GlassSelect from "../components/GlassSelect";
import { toast } from "react-toastify";

function Ledger() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    date: "",
    description: "",
    type: "Debit",
    amount: "",
    category: "",
  });
  const [userId, setUserId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    setUserId(user.id);
    fetchEntries(user.id);
  }, []);

  const fetchEntries = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/ledger/user/${id}`);
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching entries:", err.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    if (form.amount < 0) {
      toast.error("Amount cannot be negative");
      return;
    }

    try {
      if (isEditing) {
        const res = await axios.put(`http://localhost:5000/api/ledger/${editId}`, {
          ...form,
          userId,
        });

        setEntries(entries.map((entry) =>
          entry._id === editId ? res.data.updated : entry
        ));

        setIsEditing(false);
        setEditId(null);
      } else {
        const res = await axios.post("http://localhost:5000/api/ledger/add", {
          ...form,
          userId,
        });
        setEntries(
          [...entries, res.data.entry].sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      }

      toast.success("Ledger Entry added.")
      setForm({
        date: "",
        description: "",
        type: "Debit",
        amount: "",
        category: "",
      });
    } catch (err) {
      console.error("Submit failed:", err.message);
    }
  };

  const calculateBalance = () => {
    let balance = 0;
    entries.forEach((entry) => {
      if (entry.type === "Credit") {
        balance += entry.amount;
      } else {
        balance -= entry.amount;
      }
    });
    return balance;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/ledger/${id}`);
      setEntries(entries.filter((entry) => entry._id !== id));
      toast.success("Entry deleted successfully");
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const startEdit = (entry) => {
    if (editId === entry._id) {
      // Tapping same entry again — cancel editing
      setForm({
        date: "",
        description: "",
        type: "Debit",
        amount: "",
        category: "",
      });
      setEditId(null);
      setIsEditing(false);
    } else {
      // Start editing new entry
      setForm({
        date: entry.date.slice(0, 10),
        description: entry.description,
        type: entry.type,
        amount: entry.amount,
        category: entry.category,
      });
      setEditId(entry._id);
      setIsEditing(true);
    }
  };

  return (
    <div className="ledger-container">
      <h2>🧾 Ledger</h2>

      <div className="filter-controls">
        <GlassSelect
          value={selectedMonth}
          onChange={setSelectedMonth}
          placeholder="Select Month"
          options={[
            { value: "", label: "All Months" },
            ...Array.from({ length: 12 }, (_, i) => ({
              value: i + 1,
              label: new Date(0, i).toLocaleString("default", { month: "long" }),
            })),
          ]}
        />

        <GlassSelect
          value={selectedYear}
          onChange={setSelectedYear}
          placeholder="Select Year"
          options={[
            { value: "", label: "All Years" },
            ...[...new Set(entries.map(entry => new Date(entry.date).getFullYear()))]
              .sort()
              .map((year) => ({
                value: year,
                label: String(year),
              })),
          ]}
        />
      </div>

      <form onSubmit={handleSubmit} className="ledger-form">
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          min="0"
          required
        />
        <div className="glass-dropdown">
          <GlassSelect
            value={form.type}
            onChange={(val) => setForm({ ...form, type: val })}
            placeholder="Select Type"
            options={[
              { value: "Debit", label: "Debit" },
              { value: "Credit", label: "Credit" },
            ]}
          />
        </div>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        {form.amount < 0 && (
          <p style={{ color: "red", marginTop: "-10px" }}>Amount must be a positive number.</p>
        )}
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />
        <button type="submit">
          {isEditing ? "Update Entry" : "Add Entry"}
        </button>
      </form>

      <table className="ledger-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {entries
            .filter((entry) => {
              const entryDate = new Date(entry.date);
              const monthMatch = selectedMonth ? entryDate.getMonth() + 1 === parseInt(selectedMonth) : true;
              const yearMatch = selectedYear ? entryDate.getFullYear() === parseInt(selectedYear) : true;
              return monthMatch && yearMatch;
            })
            .map((entry) => (
              <tr key={entry._id} className={editId === entry._id ? "editing-row" : ""}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.description}</td>
                <td>{entry.type}</td>
                <td>₹ {entry.amount}</td>
                <td>{entry.category}</td>
                <td>
                  <button className="edit-btn" onClick={() => startEdit(entry)}>✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(entry._id)}>🗑️</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ledger;