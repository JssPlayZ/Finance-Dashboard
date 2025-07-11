import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/BalanceSheet.css";

function BalanceSheet() {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [totals, setTotals] = useState({ assets: 0, liabilities: 0 });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const fetchBalanceSheet = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ledger/balance-sheet/${user.id}`);
        setAssets(res.data.assets);
        setLiabilities(res.data.liabilities);

        const assetTotal = res.data.assets.reduce((sum, a) => sum + a.total, 0);
        const liabilityTotal = res.data.liabilities.reduce((sum, l) => sum + l.total, 0);
        setTotals({ assets: assetTotal, liabilities: liabilityTotal });
      } catch (err) {
        console.error("Error fetching balance sheet:", err);
      }
    };

    fetchBalanceSheet();
  }, []);

  return (
  <div className="bs-container">
    <h2>📘 Balance Sheet</h2>

    <div className="bs-grid">
      <div className="bs-column">
        <h3>Assets</h3>
        <ul>
          {assets.map((a, idx) => (
            <li key={idx}>{a.category}: ₹{a.total}</li>
          ))}
        </ul>
        <strong>Total: ₹{totals.assets}</strong>
      </div>

      <div className="bs-column">
        <h3>Liabilities & Equity</h3>
        <ul>
          {liabilities.map((l, idx) => (
            <li key={idx}>{l.category}: ₹{l.total}</li>
          ))}
        </ul>
        <strong>Total: ₹{totals.liabilities}</strong>
      </div>
    </div>

    {totals.assets !== totals.liabilities && (
      <p className="bs-warning">⚠️ Assets and Liabilities do not balance!</p>
    )}
  </div>
);
}

export default BalanceSheet;