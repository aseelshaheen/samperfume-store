import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Shop from "./pages/Shop";
import AdminApp from "./admin/AdminApp";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import MyOrders from "./pages/myOrders";
import Wishlist from "./pages/Wishlist";
import Brands from "./pages/Brands";
import BrandPerfumes from "./pages/Brandperfume";
import ContactUs from "./pages/Contactus";
import ReturnsPolicy from "./pages/returns";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Tajawal,sans-serif",
        fontSize: "1.5rem",
        color: "#888",
      }}
    >
      404 — الصفحة غير موجودة
    </div>
  );
}

// ── Auth guard: redirects to /auth if not logged in ───────────────────────
function ProtectedRoute({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/auth" replace />;
  return children;
}

// ── Inner app (needs router context for useNavigate) ──────────────────────
function AppInner() {
  const navigate = useNavigate();

  // ── Auth state ────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On mount: try to restore session from localStorage token
  useEffect(() => {
    const token = localStorage.getItem("sp_token");
    if (!token) {
      setAuthLoading(false);
      return;
    }

    // Verify token with backend and get user data
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCurrentUser(data.user);
        else localStorage.removeItem("sp_token"); // token expired/invalid
      })
      .catch(() => localStorage.removeItem("sp_token"))
      .finally(() => setAuthLoading(false));
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("sp_token");
    setCurrentUser(null);
    navigate("/");
  };

  // Don't render anything until we know if the user is logged in
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Tajawal,sans-serif",
          color: "#888",
        }}
      >
        ...
      </div>
    );
  }

  return (
    <>
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/shop/:slug/:section" element={<ProductDetail />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/brands/:brandQuery" element={<BrandPerfumes />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/returns" element={<ReturnsPolicy />} />

          {/* Auth page — redirect to home if already logged in */}
          <Route
            path="/auth"
            element={
              currentUser ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage onSuccess={handleAuthSuccess} />
              )
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

// ── Root export ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
