import { useState, useEffect } from "react";
import AdminLayout    from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminPerfumes  from "./AdminPerfumes";
import AdminOrders    from "./AdminOrders";
import AdminUsers     from "./AdminUsers";
import AdminReviews   from "./AdminReviews";

const API = import.meta.env.VITE_API_URL || "/api";
const OWNER_EMAIL = "samperfume8@gmail.com";

export default function AdminApp() {
  const [page,      setPage]      = useState("dashboard");
  const [adminUser, setAdminUser] = useState(null);
  const [checking,  setChecking]  = useState(true);
  const [denied,    setDenied]    = useState(false);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("sp_token");
      if (!token) { setDenied(true); setChecking(false); return; }
      try {
        const res  = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && (data.user?.role === "admin" || data.user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase())) {
          setAdminUser(data.user);
        } else {
          setDenied(true);
        }
      } catch { setDenied(true); }
      setChecking(false);
    };
    verify();
  }, []);

  const handleLogout = () => { localStorage.removeItem("sp_token"); window.location.href = "/"; };

  if (checking) return (
    <div style={{ minHeight:"100vh", background:"#faf8f6", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem", color:"#aaa", fontFamily:"Tajawal,sans-serif", direction:"rtl" }}>
      <div style={{ width:32, height:32, border:"3px solid #e8e2dc", borderTopColor:"#452829", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <span>جاري التحقق...</span>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  if (denied) return (
    <div style={{ minHeight:"100vh", background:"#faf8f6", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1.2rem", color:"#888", fontFamily:"Tajawal,sans-serif", direction:"rtl", textAlign:"center", padding:"2rem" }}>
      <div style={{ fontSize:"3rem" }}>🔒</div>
      <h2 style={{ fontFamily:"Playfair Display,serif", color:"#1a1a1a", fontSize:"1.6rem" }}>غير مصرح لك</h2>
      <p style={{ fontSize:"0.9rem", maxWidth:300 }}>هذه الصفحة مخصصة للمديرين فقط.</p>
      <a href="/" style={{ background:"#452829", color:"white", padding:"0.7rem 1.8rem", borderRadius:5, textDecoration:"none", fontSize:"0.9rem" }}>العودة للرئيسية</a>
    </div>
  );

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <AdminDashboard />;
      case "perfumes":  return <AdminPerfumes />;
      case "orders":    return <AdminOrders />;
      case "users":     return <AdminUsers />;
      case "reviews":   return <AdminReviews />;
      default:          return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout activePage={page} onNavigate={setPage} adminUser={adminUser} onLogout={handleLogout}>
      {renderPage()}
    </AdminLayout>
  );
}