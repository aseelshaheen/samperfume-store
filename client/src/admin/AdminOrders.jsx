import { useState, useEffect } from "react";
import { Search, Loader2, ShoppingBag, Phone, MapPin, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("sp_token")}`,
});

const statusMap = {
  pending: { label: "قيد الانتظار", color: "#b5620a", bg: "#fff7ed" },
  confirmed: { label: "مؤكد", color: "#1e4db7", bg: "#eff4ff" },
  processing: { label: "قيد التجهيز", color: "#6b3d9e", bg: "#f5f0ff" },
  shipped: { label: "تم الشحن", color: "#0e7a6e", bg: "#f0fdfb" },
  delivered: { label: "تم التسليم", color: "#2e7d5a", bg: "#f0fdf4" },
  cancelled: { label: "ملغي", color: "#c0392b", bg: "#fef2f2" },
};

function OrderDetail({ order, onClose, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const st = statusMap[order.status] ?? statusMap.pending;

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API}/admin/orders/${order._id}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) onStatusChange(order._id, newStatus);
    } catch {}
    setUpdating(false);
  };

  return (
    <div
      className="od-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="od-panel">
        <div className="od-header">
          <div>
            <span className="od-id">
              SP-{order._id.slice(-5).toUpperCase()}
            </span>
            <span className="od-date">
              {new Date(order.createdAt).toLocaleDateString("ar-EG")}
            </span>
          </div>
          <button className="od-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="od-body">
          <div className="od-section">
            <div className="od-stitle">معلومات العميل</div>
            <div className="od-info-grid">
              
              <div className="od-info">
                <span className="od-info-label">الاسم</span>
                <span className="od-info-val">
                  {order.user?.username ?? order.guestName ?? "زائر"}
                </span>
              </div>
              <div className="od-info">
                <span className="od-info-label">البريد</span>
                <span className="od-info-val">
                  {order.user?.email ?? (
                    <em style={{ color: "#aaa", fontSize: "0.8rem" }}>
                      زائر (بدون حساب)
                    </em>
                  )}
                </span>
              </div>
              <div className="od-info">
                <span className="od-info-label">
                  <Phone size={12} /> الهاتف
                </span>
                <span className="od-info-val">
                  {order.phone ?? order.guestPhone ?? "—"}
                </span>
              </div>
              <div className="od-info">
                <span className="od-info-label">
                  <MapPin size={12} /> العنوان
                </span>
                <span className="od-info-val">
                  {[
                    order.shippingAddress?.city,
                    order.shippingAddress?.area,
                    order.shippingAddress?.street,
                  ]
                    .filter(Boolean)
                    .join("، ")}
                </span>
              </div>
              {order.shippingAddress?.notes && (
                <div className="od-info" style={{ gridColumn: "1/-1" }}>
                  <span className="od-info-label">ملاحظات</span>
                  <span className="od-info-val">
                    {order.shippingAddress.notes}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="od-section">
            <div className="od-stitle">العناصر المطلوبة</div>
            {order.items?.map((item, i) => (
              <div key={i} className="od-item">
                {item.image ? (
                  <img loading="lazy" src={item.image} alt="" className="od-item-img" />
                ) : (
                  <div className="od-item-ph">
                    <ShoppingBag size={14} />
                  </div>
                )}
                <div className="od-item-info">
                  <span className="od-item-name">{item.name}</span>
                  <span className="od-item-brand">{item.brand}</span>
                  <span className="od-item-sec">
                    {item.section === "full"
                      ? "قارورة كاملة"
                      : `تقسيمة ${item.size_ml ?? ""}مل`}
                  </span>
                </div>
                <div className="od-item-right">
                  <span className="od-item-qty">× {item.quantity}</span>
                  <span className="od-item-price">₪{item.price}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="od-section">
            <div className="od-stitle">الفاتورة</div>
            <div className="od-pricing">
              <div className="od-pr">
                <span>المجموع الفرعي</span>
                <span>₪{order.itemsPrice}</span>
              </div>
              <div className="od-pr">
                <span>الشحن</span>
                <span>₪{order.shippingPrice ?? 0}</span>
              </div>
              {order.discount > 0 && (
                <div className="od-pr" style={{ color: "#2e7d5a" }}>
                  <span>الخصم</span>
                  <span>-₪{order.discount}</span>
                </div>
              )}
              <div className="od-pr total">
                <span>الإجمالي</span>
                <span>₪{order.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="od-section">
            <div className="od-stitle">تحديث الحالة</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <span
                className="status-badge"
                style={{ color: st.color, background: st.bg }}
              >
                {st.label}
              </span>
              <select
                className="status-sel-lg"
                value={order.status}
                onChange={(e) => handleStatus(e.target.value)}
                disabled={updating}
              >
                {Object.entries(statusMap).map(([v, { label }]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
              {updating && (
                <Loader2
                  size={15}
                  style={{
                    animation: "spin 1s linear infinite",
                    color: "#452829",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusF) params.set("status", statusF);
      const res = await fetch(`${API}/admin/orders?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders ?? []);
        setTotal(data.total ?? 0);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page, statusF]);

  const handleStatusChange = (id, s) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status: s } : o)),
    );
    if (selected?._id === id) setSelected((prev) => ({ ...prev, status: s }));
  };

  const filtered = search
    ? orders.filter(
        (o) =>
          o.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          o._id.includes(search),
      )
    : orders;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }

        .oh { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.8rem; flex-wrap:wrap; gap:1rem; }
        .oh-title { font-family:'Playfair Display',serif; font-size:1.4rem; color:#1a1a1a; font-weight:700; }
        .oh-filters { display:flex; gap:0.7rem; flex-wrap:wrap; align-items:center; }

        .o-search { position:relative; }
        .o-search input { background:white; border:1.5px solid #e8e2dc; color:#1a1a1a; font-family:'Tajawal',sans-serif; font-size:0.85rem; padding:0.55rem 2.2rem 0.55rem 0.85rem; border-radius:5px; outline:none; width:220px; transition:border-color 0.2s; }
        .o-search input:focus { border-color:#452829; }
        .o-search-icon { position:absolute; right:0.65rem; top:50%; transform:translateY(-50%); color:#bbb; pointer-events:none; }

        .sf-sel { appearance:none; background:white; border:1.5px solid #e8e2dc; color:#555; font-family:'Tajawal',sans-serif; font-size:0.85rem; padding:0.55rem 1.6rem 0.55rem 0.85rem; border-radius:5px; outline:none; cursor:pointer; }
        .sf-sel:focus { border-color:#452829; }

        .ot-wrap { background:white; border:1px solid #e8e2dc; border-radius:10px; overflow:hidden; overflow-x:auto; }
        .ot { width:100%; border-collapse:collapse; }
        .ot thead th { background:#faf8f6; padding:0.75rem 1rem; font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#aaa; text-align:right; border-bottom:1px solid #e8e2dc; white-space:nowrap; }

        .or { cursor:pointer; }
        .or td { padding:0.88rem 1rem; border-bottom:1px solid #f5f1ed; font-size:0.84rem; vertical-align:middle; }
        .or:last-child td { border-bottom:none; }
        .or:hover td { background:#fdfcfb; }

        .o-id    { font-family:'Playfair Display',serif; font-size:0.85rem; color:#aaa; }
        .o-name  { color:#1a1a1a; font-weight:500; display:block; }
        .o-email { font-size:0.72rem; color:#aaa; }
        .o-price { font-family:'Playfair Display',serif; color:#452829; font-weight:700; }
        .o-date  { font-size:0.78rem; color:#aaa; white-space:nowrap; }

        .status-badge { font-size:0.7rem; font-weight:700; padding:0.22rem 0.65rem; border-radius:20px; letter-spacing:0.04em; white-space:nowrap; }

        .status-sel { appearance:none; background:#faf8f6; border:1px solid #e8e2dc; color:#555; font-family:'Tajawal',sans-serif; font-size:0.78rem; padding:0.35rem 0.7rem; border-radius:4px; cursor:pointer; outline:none; }
        .status-sel:focus { border-color:#452829; }

        .pagination { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-top:1.5rem; }
        .page-btn { background:white; border:1px solid #e8e2dc; color:#888; font-family:'Tajawal',sans-serif; font-size:0.82rem; padding:0.4rem 0.9rem; border-radius:5px; cursor:pointer; transition:all 0.2s; }
        .page-btn:hover:not(:disabled) { color:#1a1a1a; border-color:#ccc; }
        .page-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .page-info { font-size:0.78rem; color:#aaa; }

        .empty-o { text-align:center; padding:3rem; color:#aaa; }
        .empty-o p { margin-top:0.5rem; font-size:0.88rem; }

        /* Detail panel */
        .od-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:500; display:flex; align-items:center; justify-content:center; padding:1rem; }
        .od-panel { background:white; border:1px solid #e8e2dc; border-radius:12px; width:100%; max-width:580px; max-height:90vh; overflow-y:auto; scrollbar-width:thin; box-shadow:0 20px 60px rgba(0,0,0,0.15); }

        .od-header { display:flex; align-items:center; justify-content:space-between; padding:1.2rem 1.5rem; border-bottom:1px solid #e8e2dc; position:sticky; top:0; background:white; z-index:1; }
        .od-id   { font-family:'Playfair Display',serif; font-size:1.05rem; color:#1a1a1a; font-weight:700; margin-left:0.7rem; }
        .od-date { font-size:0.78rem; color:#aaa; }
        .od-close { background:none; border:none; color:#aaa; cursor:pointer; padding:0.3rem; border-radius:4px; }
        .od-close:hover { color:#1a1a1a; }

        .od-body    { padding:1.4rem; display:flex; flex-direction:column; gap:1.3rem; }
        .od-section { }
        .od-stitle  { font-size:0.68rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#452829; margin-bottom:0.75rem; }

        .od-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
        .od-info      { display:flex; flex-direction:column; gap:0.15rem; }
        .od-info-label { font-size:0.68rem; color:#aaa; display:flex; align-items:center; gap:0.25rem; }
        .od-info-val   { font-size:0.84rem; color:#1a1a1a; }

        .od-item { display:flex; gap:0.85rem; align-items:center; background:#faf8f6; border-radius:6px; padding:0.7rem; margin-bottom:0.5rem; }
        .od-item-img  { width:46px; height:46px; border-radius:4px; object-fit:cover; flex-shrink:0; }
        .od-item-ph   { width:46px; height:46px; border-radius:4px; background:#e8e2dc; display:flex; align-items:center; justify-content:center; color:#aaa; flex-shrink:0; }
        .od-item-info { flex:1; display:flex; flex-direction:column; gap:1px; }
        .od-item-name  { font-size:0.86rem; color:#1a1a1a; font-weight:600; }
        .od-item-brand { font-size:0.72rem; color:#aaa; }
        .od-item-sec   { font-size:0.7rem; color:#888; }
        .od-item-right { display:flex; flex-direction:column; align-items:flex-end; gap:1px; }
        .od-item-qty   { font-size:0.78rem; color:#aaa; }
        .od-item-price { font-family:'Playfair Display',serif; color:#452829; font-weight:700; }

        .od-pricing { background:#faf8f6; border-radius:6px; padding:0.9rem 1rem; display:flex; flex-direction:column; gap:0.55rem; }
        .od-pr      { display:flex; justify-content:space-between; font-size:0.85rem; color:#888; }
        .od-pr.total { color:#1a1a1a; font-weight:700; font-size:0.95rem; border-top:1px solid #e8e2dc; padding-top:0.55rem; }

        .status-sel-lg { appearance:none; background:white; border:1.5px solid #e8e2dc; color:#555; font-family:'Tajawal',sans-serif; font-size:0.88rem; padding:0.55rem 1rem; border-radius:5px; cursor:pointer; outline:none; }
        .status-sel-lg:focus { border-color:#452829; }
        @media(max-width:600px){
  .oh{flex-direction:column;align-items:flex-start;gap:0.65rem;margin-bottom:1rem;}
  .oh-title{font-size:1.1rem;}
  .oh-filters{width:100%;display:flex;gap:0.5rem;}
  .o-search{flex:1;}
  .o-search input{width:100%;font-size:0.8rem;}
  .sf-sel{font-size:0.8rem;padding:0.45rem 1.2rem 0.45rem 0.65rem;}
  .ot-wrap{overflow-x:auto;}
  .ot{min-width:600px;}
  .ot thead th{padding:0.55rem 0.7rem;font-size:0.62rem;}
  .or td{padding:0.6rem 0.7rem;font-size:0.78rem;}
  .o-price{font-size:0.85rem;}
  .status-badge{font-size:0.62rem;padding:0.18rem 0.5rem;}
  .status-sel{font-size:0.72rem;padding:0.28rem 0.5rem;}
  .pagination{margin-top:1rem;}
  .page-btn{font-size:0.75rem;padding:0.35rem 0.7rem;}
  .od-panel{max-height:92vh;border-radius:10px 10px 0 0;}
  .od-overlay{align-items:flex-end;padding:0;}
  .od-body{padding:1rem;}
  .od-info-grid{grid-template-columns:1fr;}
  .od-item{padding:0.55rem;}
  .od-item-img{width:38px;height:38px;}
  .od-item-ph{width:38px;height:38px;}
  .od-item-name{font-size:0.8rem;}
}
      `}</style>

      <div className="oh">
        <h2 className="oh-title">
          إدارة الطلبات{" "}
          <span style={{ fontSize: "0.85rem", color: "#aaa", fontWeight: 400 }}>
            ({total})
          </span>
        </h2>
        <div className="oh-filters">
          <div className="o-search">
            <Search size={14} className="o-search-icon" />
            <input
              placeholder="بحث بالاسم أو ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="sf-sel"
            value={statusF}
            onChange={(e) => {
              setStatusF(e.target.value);
              setPage(1);
            }}
          >
            <option value="">كل الحالات</option>
            {Object.entries(statusMap).map(([v, { label }]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ot-wrap">
        {loading ? (
          <div className="empty-o">
            <Loader2
              size={24}
              style={{ animation: "spin 1s linear infinite", color: "#452829" }}
            />
            <p>جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-o">
            <ShoppingBag size={32} strokeWidth={1} />
            <p>لا توجد طلبات</p>
          </div>
        ) : (
          <table className="ot">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>العناصر</th>
                <th>المبلغ</th>
                <th>الدفع</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>تغيير</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const st = statusMap[order.status] ?? statusMap.pending;
                return (
                  <tr
                    key={order._id}
                    className="or"
                    onClick={() => setSelected(order)}
                  >
                    <td>
                      <span className="o-id">
                        SP-{order._id.slice(-5).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="o-name">
                        {order.user?.username ?? order.guestName ?? "زائر"}
                      </span>
                      <span className="o-email">
                        {order.user?.email ?? (
                          <span
                            style={{ fontSize: "0.7rem", color: "#f59e0b" }}
                          >
                            طلب زائر
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ color: "#888", fontSize: "0.82rem" }}>
                      {order.items?.length ?? 0}
                    </td>
                    <td>
                      <span className="o-price">₪{order.totalPrice}</span>
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "#aaa" }}>
                      {order.paymentMethod === "cash_on_delivery"
                        ? "كاش"
                        : "أونلاين"}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td>
                      <span className="o-date">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className="status-sel"
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order._id, e.target.value);
                        }}
                      >
                        {Object.entries(statusMap).map(([v, { label }]) => (
                          <option key={v} value={v}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {total > LIMIT && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            السابق
          </button>
          <span className="page-info">
            صفحة {page} من {Math.ceil(total / LIMIT)}
          </span>
          <button
            className="page-btn"
            disabled={page >= Math.ceil(total / LIMIT)}
            onClick={() => setPage((p) => p + 1)}
          >
            التالي
          </button>
        </div>
      )}

      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
