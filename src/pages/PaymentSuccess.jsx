import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: "center", padding: "48px 40px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, maxWidth: 420, width: "100%" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Payment Successful</h1>
        <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.6, margin: "0 0 32px 0" }}>
          You have successfully purchased this product. Thank you for your order!
        </p>
        <button
          onClick={() => navigate("/products")}
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
