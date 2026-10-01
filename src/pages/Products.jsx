import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { logoutUser } from "../redux/authSlice";

const PRODUCTS = [
  {
    id: "scooter_001",
    title: "Lumina V — Electric Scooter",
    description: "A next-gen electric scooter with a 120 km range, smart LCD dashboard, and zero-emission ride. Perfect for city commuting.",
    displayPrice: "₹799",
    image: "/scooter.jpg",
    tag: "Best Seller",
    tagColor: "#7c3aed",
  },
  {
    id: "bike_001",
    title: "Volta X — Electric Bike",
    description: "High-performance electric bike built for speed and endurance. Carbon-fibre frame, 150 km range, and integrated anti-theft system.",
    displayPrice: "₹999",
    image: "/bike.jpg",
    tag: "New Arrival",
    tagColor: "#0ea5e9",
  },
];

function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // payingId tracks which product is currently being purchased
  const [payingId, setPayingId] = useState(null);

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      toast.success("Logged out successfully.");
    } else {
      toast.error(result.payload || "Logout failed.");
    }
    navigate("/login");
  };

  const handlePurchase = async (product) => {
    if (payingId) return; // Prevent duplicate clicks
    setPayingId(product.id);

    try {
      toast("Payment initiated...", { icon: "⏳" });

      // Step 1: Create Razorpay order on the backend
      const { data } = await api.post("/payment/create-order", { productId: product.id });
      const { orderId, amount, currency, keyId } = data;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "e-way",
        description: product.title,
        order_id: orderId,
        handler: async (response) => {
          // Step 3: Verify payment on the backend
          try {
            await api.post("/payment/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful!");
            navigate("/payment-success");
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled.", { icon: "❌" });
            setPayingId(null);
          },
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#7c3aed" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPayingId(null);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to create payment. Please try again.");
      setPayingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px" }}>
            e-way <span style={{ color: "#a78bfa" }}>Store</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            Welcome, <span style={{ color: "#fff", fontWeight: 500 }}>{user?.name}</span>
          </span>
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              style={{ fontSize: 13, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", color: "#c4b5fd", padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
            >
              🛠 Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{ fontSize: 13, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, background: "linear-gradient(90deg, #fff, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Our Products
          </h1>
          <p style={{ color: "#6b7280", marginTop: 8, fontSize: 14 }}>Explore our electric vehicle lineup — sustainable, smart, and stylish.</p>
        </div>

        {/* Product Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
          {PRODUCTS.map((p) => {
            const isLoading = payingId === p.id;
            return (
              <div
                key={p.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 20,
                  overflow: "hidden",
                  backdropFilter: "blur(12px)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(124,58,237,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Image */}
                <div style={{ position: "relative", background: "#111" }}>
                  <img src={p.image} alt={p.title} style={{ width: "100%", height: 230, objectFit: "cover", display: "block" }} />
                  <span style={{ position: "absolute", top: 12, left: 12, background: p.tagColor, color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, letterSpacing: "0.04em" }}>
                    {p.tag}
                  </span>
                </div>

                {/* Details */}
                <div style={{ padding: "22px 24px" }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px 0", color: "#f3f4f6" }}>{p.title}</h2>
                  <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 18px 0" }}>{p.description}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#a78bfa" }}>{p.displayPrice}</span>
                    <button
                      disabled={!!payingId}
                      onClick={() => handlePurchase(p)}
                      style={{
                        background: isLoading ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        color: "#fff",
                        border: "none",
                        padding: "9px 20px",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: payingId ? "not-allowed" : "pointer",
                        opacity: payingId && !isLoading ? 0.5 : 1,
                        transition: "opacity 0.2s",
                        minWidth: 110,
                      }}
                    >
                      {isLoading ? "Processing..." : "Purchase"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Products;
