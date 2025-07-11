import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/TrialBalance.css";

function TrialBalance() {
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const fetchTrialBalance = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ledger/trial-balance/${user.id}`);
        setData(res.data);

        // Calculate grand totals
        const debitSum = res.data.reduce((sum, row) => sum + row.debit, 0);
        const creditSum = res.data.reduce((sum, row) => sum + row.credit, 0);
        setTotals({ debit: debitSum, credit: creditSum });
      } catch (err) {
        console.error("Failed to fetch trial balance", err);
      }
    };

    fetchTrialBalance();
  }, []);

  return (
  <div className="trial-container">
    <h2>📊 Trial Balance</h2>

    <table className="trial-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Debit (₹)</th>
          <th>Credit (₹)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, idx) => (
          <tr key={idx}>
            <td>{entry.category}</td>
            <td>{entry.debit}</td>
            <td>{entry.credit}</td>
          </tr>
        ))}
        <tr>
          <td>Total</td>
          <td>₹ {totals.debit}</td>
          <td>₹ {totals.credit}</td>
        </tr>
      </tbody>
    </table>

    {totals.debit !== totals.credit && (
      <p className="trial-warning">⚠️ Debit and Credit totals do not match!</p>
    )}
  </div>
);
}

export default TrialBalance;