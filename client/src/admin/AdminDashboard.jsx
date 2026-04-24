import { useState, useEffect } from "react";
import { Users, ShoppingBag, Package, TrendingUp, Loader2, RefreshCw } from "lucide-react";

const API = "/api";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("sp_token")}`,
});

const statusMap = {
  pending:    { label: "قيد الانتظار", color: "#b5620a", bg: "#fff7ed" },
  confirmed:  { label: "مؤكد",         color: "#1e4db7", bg: "#eff4ff" },
  processing: { label: "قيد التجهيز",  color: "#6b3d9e", bg: "#f5f0ff" },
  shipped:    { label: "تم الشحن",     color: "#0e7a6e", bg: "#f0fdfb" },
  delivered:  { label: "تم التسليم",   color: "#2e7d5a", bg: "#f0fdf4" },
  cancelled:  { label: "ملغي",         color: "#c0392b", bg: "#fef2f2" },
};

function StatCard({ icon: Icon, label, value, sub, color, loading }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}15`, color }}>
        <Icon size={20} />
      </div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        {loading
          ? <div className="stat-skeleton" />
          : <span className="stat-value">{value}</span>}
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

function OrderRow({ order, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const st = statusMap[order.status] ?? statusMap.pending;

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API}/admin/orders/${order._id}/status`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) onStatusChange(order._id, newStatus);
    } catch {}
    setUpdating(false);
  };

  return (
    <tr className="order-row">
      <td><span className="order-id">SP-{order._id.slice(-5).toUpperCase()}</span></td>
      <td>
        <div className="order-customer">
          <span className="oc-name">{order.user?.username ?? "—"}</span>
          <span className="oc-email">{order.user?.email ?? ""}</span>
        </div>
      </td>
      <td><span className="o-items">{order.items?.length ?? 0} عنصر</span></td>
      <td><span className="o-price">₪{order.totalPrice}</span></td>
      <td><span className="status-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span></td>
      <td><span className="o-date">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</span></td>
      <td>
        <select className="status-select" value={order.status}
          onChange={e => handleStatus(e.target.value)} disabled={updating}>
          {Object.entries(statusMap).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
        </select>
      </td>
    </tr>
  );
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [sRes, oRes] = await Promise.all([
        fetch(`${API}/admin/stats`,  { headers: authHeaders() }),
        fetch(`${API}/admin/orders?limit=8`, { headers: authHeaders() }),
      ]);
      const sData = await sRes.json();
      const oData = await oRes.json();
      if (sData.success) setStats(sData.stats);
      if (oData.success) setOrders(oData.orders);
    } catch { setError("تعذّر تحميل البيانات"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = (id, s) =>
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: s } : o));

  return (
    <>
      <style>{`
        .dash-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.8rem; }
        .dash-heading { font-family:'Playfair Display',serif; font-size:1.4rem; color:#1a1a1a; font-weight:700; }

        .refresh-btn {
          display:flex; align-items:center; gap:0.4rem; background:white;
          border:1px solid #e8e2dc; color:#888; font-family:'Tajawal',sans-serif;
          font-size:0.82rem; padding:0.48rem 1rem; border-radius:6px; cursor:pointer; transition:all 0.2s;
        }
        .refresh-btn:hover { color:#1a1a1a; border-color:#ccc; }

        /* Stat cards */
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.2rem; margin-bottom:1.8rem; }

        .stat-card {
          background:white; border:1px solid #e8e2dc; border-radius:10px;
          padding:1.3rem; display:flex; gap:1rem; align-items:flex-start;
          transition:box-shadow 0.2s;
        }
        .stat-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.06); }

        .stat-icon { width:42px; height:42px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .stat-body { flex:1; }
        .stat-label { font-size:0.74rem; color:#888; display:block; margin-bottom:0.28rem; letter-spacing:0.03em; }
        .stat-value { font-family:'Playfair Display',serif; font-size:1.7rem; color:#1a1a1a; font-weight:700; display:block; line-height:1; }
        .stat-sub   { font-size:0.7rem; color:#aaa; margin-top:0.28rem; display:block; }

        .stat-skeleton { height:26px; width:80px; background:linear-gradient(90deg,#f5f5f5 25%,#eee 50%,#f5f5f5 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:4px; margin:4px 0; }
        @keyframes shimmer { to { background-position:-200% 0; } }

        /* Status chips */
        .status-chips { display:grid; grid-template-columns:repeat(3,1fr); gap:0.8rem; margin-bottom:1.8rem; }

        .status-chip {
          background:white; border:1px solid #e8e2dc; border-radius:8px;
          padding:0.85rem 1.1rem; display:flex; align-items:center; justify-content:space-between;
        }

        .sc-label { font-size:0.8rem; color:#888; }
        .sc-value { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; }

        /* Section title */
        .section-title {
          font-family:'Playfair Display',serif; font-size:1.05rem; color:#1a1a1a;
          font-weight:600; margin-bottom:1rem; display:flex; align-items:center; gap:0.7rem;
        }
        .section-title::after { content:''; flex:1; height:1px; background:#e8e2dc; }

        /* Table */
        .orders-table-wrap { background:white; border:1px solid #e8e2dc; border-radius:10px; overflow:hidden; overflow-x:auto; }

        table { width:100%; border-collapse:collapse; }

        thead th {
          background:#faf8f6; padding:0.75rem 1rem; font-size:0.7rem; font-weight:700;
          letter-spacing:0.1em; text-transform:uppercase; color:#aaa; text-align:right;
          border-bottom:1px solid #e8e2dc; white-space:nowrap;
        }

        .order-row td { padding:0.88rem 1rem; border-bottom:1px solid #f5f1ed; font-size:0.85rem; vertical-align:middle; }
        .order-row:last-child td { border-bottom:none; }
        .order-row:hover td { background:#fdfcfb; }

        .order-id    { font-family:'Playfair Display',serif; font-size:0.85rem; color:#aaa; }
        .order-customer { display:flex; flex-direction:column; gap:1px; }
        .oc-name  { font-size:0.85rem; color:#1a1a1a; font-weight:500; }
        .oc-email { font-size:0.72rem; color:#aaa; }
        .o-items  { font-size:0.82rem; color:#888; }
        .o-price  { font-family:'Playfair Display',serif; color:#452829; font-weight:700; }
        .o-date   { font-size:0.78rem; color:#aaa; white-space:nowrap; }

        .status-badge { font-size:0.7rem; font-weight:700; padding:0.22rem 0.65rem; border-radius:20px; letter-spacing:0.04em; white-space:nowrap; }

        .status-select {
          appearance:none; background:#faf8f6; border:1px solid #e8e2dc; color:#555;
          font-family:'Tajawal',sans-serif; font-size:0.78rem; padding:0.35rem 0.7rem;
          border-radius:4px; cursor:pointer; outline:none;
        }
        .status-select:focus { border-color:#452829; }

        .empty-state { text-align:center; padding:3rem; color:#aaa; }
        .empty-state p { margin-top:0.5rem; font-size:0.88rem; }

        .error-banner { background:#fef2f2; border:1px solid #fecaca; color:#c0392b; padding:1rem 1.2rem; border-radius:8px; margin-bottom:1.5rem; font-size:0.88rem; }

        @keyframes spin { to { transform:rotate(360deg); } }
        @media (max-width:1100px) { .stats-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:600px)  { .stats-grid { grid-template-columns:1fr 1fr; } .status-chips { grid-template-columns:1fr 1fr; } }
        @media(max-width:600px){
  /* Header row */
  .dash-top{margin-bottom:0.85rem;gap:0.5rem;}
  .dash-heading{font-size:1rem;}
  .refresh-btn{font-size:0.7rem;padding:0.32rem 0.6rem;}

  /* Stat cards — 2 per row, very compact */
  .stats-grid{grid-template-columns:1fr 1fr;gap:0.45rem;margin-bottom:0.85rem;}
  .stat-card{padding:0.6rem 0.65rem;gap:0.45rem;border-radius:8px;}
  .stat-icon{width:28px;height:28px;border-radius:5px;flex-shrink:0;}
  .stat-icon svg{width:14px;height:14px;}
  .stat-value{font-size:1.05rem;line-height:1;}
  .stat-label{font-size:0.58rem;margin-bottom:0.18rem;}
  .stat-sub{font-size:0.56rem;margin-top:0.18rem;}
  .stat-skeleton{height:20px;width:60px;}

  /* Status chips — 2 per row, tight */
  .status-chips{grid-template-columns:1fr 1fr;gap:0.4rem;margin-bottom:0.85rem;}
  .status-chip{padding:0.5rem 0.6rem;border-radius:6px;}
  .sc-label{font-size:0.64rem;}
  .sc-value{font-size:0.92rem;}

  /* Section title */
  .section-title{font-size:0.82rem;margin-bottom:0.75rem;}

  /* Orders table — horizontal scroll */
  .orders-table-wrap{border-radius:8px;}
  table{min-width:520px;}
  thead th{padding:0.5rem 0.6rem;font-size:0.58rem;letter-spacing:0.06em;}
  .order-row td{padding:0.55rem 0.6rem;font-size:0.74rem;}
  .order-id{font-size:0.74rem;}
  .oc-name{font-size:0.78rem;}
  .oc-email{font-size:0.66rem;}
  .o-items{font-size:0.74rem;}
  .o-price{font-size:0.82rem;}
  .o-date{font-size:0.68rem;}
  .status-badge{font-size:0.58rem;padding:0.15rem 0.4rem;}
  .status-select{font-size:0.7rem;padding:0.25rem 0.45rem;}
}
      `}</style>

      <div className="dash-top">
        <h2 className="dash-heading">نظرة عامة</h2>
        <button className="refresh-btn" onClick={load}><RefreshCw size={14} /> تحديث</button>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      <div className="stats-grid">
        <StatCard icon={Users}       label="إجمالي المستخدمين" value={stats?.totalUsers ?? 0}  sub={`+${stats?.newUsersToday ?? 0} اليوم`}      color="#1e4db7" loading={loading} />
        <StatCard icon={ShoppingBag} label="إجمالي الطلبات"    value={stats?.totalOrders ?? 0} sub={`${stats?.pendingOrders ?? 0} قيد الانتظار`} color="#b5620a" loading={loading} />
        <StatCard icon={Package}     label="عدد العطور"         value={stats?.totalPerfumes ?? 0} sub={`${stats?.activePerfumes ?? 0} نشط`}      color="#452829" loading={loading} />
        <StatCard icon={TrendingUp}  label="الإيرادات الكلية"  value={stats ? `₪${stats.totalRevenue ?? 0}` : "—"} sub="من الطلبات المكتملة"    color="#2e7d5a" loading={loading} />
      </div>

      {stats && (
        <div className="status-chips">
          {Object.entries(statusMap).map(([key, { label, color, bg }]) => (
            <div key={key} className="status-chip">
              <span className="sc-label">{label}</span>
              <span className="sc-value" style={{ color }}>{stats.ordersByStatus?.[key] ?? 0}</span>
            </div>
          ))}
        </div>
      )}

      <div className="section-title">آخر الطلبات</div>

      <div className="orders-table-wrap">
        {loading ? (
          <div className="empty-state">
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#452829" }} />
            <p>جاري التحميل...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><ShoppingBag size={32} strokeWidth={1} /><p>لا توجد طلبات بعد</p></div>
        ) : (
          <table>
            <thead>
              <tr><th>رقم الطلب</th><th>العميل</th><th>العناصر</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th><th>تغيير الحالة</th></tr>
            </thead>
            <tbody>
              {orders.map(o => <OrderRow key={o._id} order={o} onStatusChange={handleStatusChange} />)}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}