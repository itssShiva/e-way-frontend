import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { logoutUser } from "../redux/authSlice";

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await api.get("/payment/transactions");
        setTransactions(data.transactions);
      } catch {
        toast.error("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const statusStyle = (status) => {
    const map = {
      paid: { background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" },
      failed: { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
      created: { background: "rgba(234,179,8,0.15)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.3)" },
    };
    return map[status] || map.created;
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px" }}>
            e-way <span style={{ color: "#a78bfa" }}>Admin</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            Welcome, <span style={{ color: "#fff", fontWeight: 500 }}>{user?.name}</span>
          </span>
          <button
            onClick={() => navigate("/products")}
            style={{ fontSize: 13, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", color: "#c4b5fd", padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            📦 Products
          </button>
          <button
            onClick={handleLogout}
            style={{ fontSize: 13, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, background: "linear-gradient(90deg, #fff, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Transaction History
          </h1>
          <p style={{ color: "#6b7280", marginTop: 6, fontSize: 14 }}>All payment and order transactions.</p>
        </div>

        {/* Table Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>

          {/* Table Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr 1.8fr 1.8fr 0.7fr 1.2fr", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", gap: 8 }}>
            {["Product", "User", "Email", "Amount", "Payment ID", "Order ID", "Status", "Date"].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
            ))}
          </div>

          {/* States */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#6b7280", fontSize: 14 }}>
              Loading transactions...
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 24px", gap: 12 }}>
              <div style={{ fontSize: 44, opacity: 0.3 }}>🧾</div>
              <p style={{ color: "#4b5563", fontSize: 15, margin: 0, fontWeight: 500 }}>No transactions yet</p>
              <p style={{ color: "#374151", fontSize: 13, margin: 0 }}>Transactions will appear here once orders are placed.</p>
            </div>
          )}

          {/* Rows */}
          {!loading && transactions.map((txn, i) => (
            <div
              key={txn._id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr 1.8fr 1.8fr 0.7fr 1.2fr",
                padding: "14px 20px",
                borderBottom: i < transactions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>{txn.productName}</span>
              <span style={{ fontSize: 13, color: "#d1d5db" }}>{txn.userName}</span>
              <span style={{ fontSize: 12, color: "#9ca3af", wordBreak: "break-all" }}>{txn.userEmail}</span>
              <span style={{ fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>₹{txn.amount.toLocaleString("en-IN")}</span>
              <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace", wordBreak: "break-all" }}>{txn.razorpayPaymentId || "—"}</span>
              <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace", wordBreak: "break-all" }}>{txn.razorpayOrderId}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", ...statusStyle(txn.status) }}>
                {txn.status}
              </span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{formatDate(txn.createdAt)}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
