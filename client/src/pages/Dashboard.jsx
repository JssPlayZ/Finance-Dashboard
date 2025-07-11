import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Charts.css"
import { IncomeExpensePie, CategoryBar, CashFlowLine } from "../components/Charts.jsx";

function Dashboard() {
  const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, balance: 0 });
  const [chartData, setChartData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/ledger/summary/${user.id}`)
      .then((res) => {
        setSummary(res.data);
        setChartData([
          { name: "Income", value: res.data.totalCredit },
          { name: "Expenses", value: res.data.totalDebit },
        ]);

        axios
          .get(`${import.meta.env.VITE_API_URL}/api/ledger/category-summary/${user.id}`)
          .then((res) => setBarData(res.data))
          .catch((err) => console.error("Category summary fetch error:", err));
      })
      .catch((err) => console.error("Failed to load dashboard data:", err));

    axios.get(`${import.meta.env.VITE_API_URL}/api/ledger/line-summary/${user.id}`)
      .then((res) => setLineData(res.data))
      .catch((err) => console.error("Line summary error:", err));
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Welcome back 👋</h2>

      <div className="dashboard-summary">
        <div className="summary-card income">💰 Income: ₹ {summary.totalCredit}</div>
        <div className="summary-card expense">💸 Expenses: ₹ {summary.totalDebit}</div>
        <div className="summary-card balance">🧾 Balance: ₹ {summary.balance}</div>
      </div>

      {/* Top two charts side-by-side */}
      <div className="dashboard-charts-top">
        <div className="chart-box">
          <IncomeExpensePie data={chartData} />
        </div>
        <div className="chart-box">
          <CategoryBar data={barData} />
        </div>
      </div>

      {/* Line chart full width below */}
      <div className="chart-box full-width">
        <CashFlowLine data={lineData} />
      </div>
    </div>
  );
}

export default Dashboard;