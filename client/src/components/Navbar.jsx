import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const hideNavbarOn = ["/", "/signup"];

  if (hideNavbarOn.includes(location.pathname)) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">💼 FinanceApp</div>
      <div className="navbar-links">
        <Link to="/dashboard">🏠 Dashboard</Link>
        <Link to="/ledger">🧾 Ledger</Link>
        <Link to="/trial-balance">📊 Trial Balance</Link>
        <Link to="/balance-sheet">📘 Balance Sheet</Link>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;