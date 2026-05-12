import { useState, useEffect } from "react";
import { Search, Users, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";;
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("sp_token")}` });

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 20;

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set("search", search);
      const res  = await fetch(`${API}/admin/users?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) { setUsers(data.users ?? []); setTotal(data.total ?? 0); }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e) => { if (e.key === "Enter") { setPage(1); load(); } };

  const toggleActive = async (user) => {
    try {
      const res  = await fetch(`${API}/admin/users/${user._id}/toggle`, { method: "PUT", headers: authHeaders() });
      const data = await res.json();
      if (data.success) setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
    } catch {}
  };

  const filtered = users.filter(u =>
    !search ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }

        .uh { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.8rem; flex-wrap:wrap; gap:1rem; }
        .uh-title { font-family:'Playfair Display',serif; font-size:1.4rem; color:#1a1a1a; font-weight:700; }

        .u-search { position:relative; }
        .u-search input { background:white; border:1.5px solid #e8e2dc; color:#1a1a1a; font-family:'Tajawal',sans-serif; font-size:0.85rem; padding:0.55rem 2.2rem 0.55rem 0.85rem; border-radius:5px; outline:none; width:240px; transition:border-color 0.2s; }
        .u-search input:focus { border-color:#452829; }
        .u-search-icon { position:absolute; right:0.65rem; top:50%; transform:translateY(-50%); color:#bbb; pointer-events:none; }

        .ut-wrap { background:white; border:1px solid #e8e2dc; border-radius:10px; overflow:hidden; overflow-x:auto; }
        .ut { width:100%; border-collapse:collapse; }
        .ut thead th { background:#faf8f6; padding:0.75rem 1rem; font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#aaa; text-align:right; border-bottom:1px solid #e8e2dc; white-space:nowrap; }

        .ur td { padding:0.88rem 1rem; border-bottom:1px solid #f5f1ed; font-size:0.84rem; vertical-align:middle; }
        .ur:last-child td { border-bottom:none; }
        .ur:hover td { background:#fdfcfb; }

        .u-avatar { width:32px; height:32px; border-radius:50%; background:#452829; display:flex; align-items:center; justify-content:center; font-size:0.78rem; font-weight:700; color:white; flex-shrink:0; }
        .u-cell   { display:flex; align-items:center; gap:0.65rem; }
        .u-name   { color:#1a1a1a; font-weight:500; display:block; }
        .u-email  { font-size:0.72rem; color:#aaa; }

        .role-badge { font-size:0.68rem; font-weight:700; padding:0.18rem 0.6rem; border-radius:20px; letter-spacing:0.04em; }
        .role-admin    { background:rgba(69,40,41,0.1); color:#452829; }
        .role-customer { background:#f5f5f5; color:#aaa; }

        .u-toggle { cursor:pointer; background:none; border:none; display:flex; align-items:center; }
        .u-date   { font-size:0.78rem; color:#aaa; white-space:nowrap; }

        .pagination { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-top:1.5rem; }
        .page-btn { background:white; border:1px solid #e8e2dc; color:#888; font-family:'Tajawal',sans-serif; font-size:0.82rem; padding:0.4rem 0.9rem; border-radius:5px; cursor:pointer; transition:all 0.2s; }
        .page-btn:hover:not(:disabled) { color:#1a1a1a; border-color:#ccc; }
        .page-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .page-info { font-size:0.78rem; color:#aaa; }

        .empty-u { text-align:center; padding:3rem; color:#aaa; }
        .empty-u p { margin-top:0.5rem; font-size:0.88rem; }
        @media(max-width:600px){
  .uh{flex-direction:column;align-items:flex-start;gap:0.65rem;margin-bottom:1rem;}
  .uh-title{font-size:1.1rem;}
  .u-search{width:100%;}
  .u-search input{width:100%;font-size:0.8rem;}
  .ut-wrap{overflow-x:auto;}
  .ut{min-width:560px;}
  .ut thead th{padding:0.55rem 0.7rem;font-size:0.62rem;}
  .ur td{padding:0.6rem 0.7rem;font-size:0.78rem;}
  .u-avatar{width:28px;height:28px;font-size:0.7rem;}
  .u-name{font-size:0.8rem;}
  .u-email{font-size:0.68rem;}
  .role-badge{font-size:0.62rem;padding:0.14rem 0.45rem;}
  .u-date{font-size:0.7rem;}
  .pagination{margin-top:1rem;}
  .page-btn{font-size:0.75rem;padding:0.35rem 0.7rem;}
}
      `}</style>

      <div className="uh">
        <h2 className="uh-title">المستخدمون <span style={{ fontSize: "0.85rem", color: "#aaa", fontWeight: 400 }}>({total})</span></h2>
        <div className="u-search">
          <Search size={14} className="u-search-icon" />
          <input placeholder="بحث بالاسم أو البريد..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} />
        </div>
      </div>

      <div className="ut-wrap">
        {loading ? (
          <div className="empty-u"><Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#452829" }} /><p>جاري التحميل...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-u"><Users size={32} strokeWidth={1} /><p>لا توجد مستخدمون</p></div>
        ) : (
          <table className="ut">
            <thead><tr><th>المستخدم</th><th>البريد</th><th>الهاتف</th><th>الدور</th><th>الطلبات</th><th>تاريخ التسجيل</th><th>الحالة</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id} className="ur">
                  <td>
                    <div className="u-cell">
                      <div className="u-avatar">{u.username?.[0]?.toUpperCase() ?? "U"}</div>
                      <span className="u-name">{u.username ?? "—"}</span>
                    </div>
                  </td>
                  <td><span className="u-email">{u.email}</span></td>
                  <td><span style={{ fontSize: "0.82rem", color: "#888" }}>{u.phone ?? "—"}</span></td>
                  <td><span className={`role-badge ${u.role === "admin" ? "role-admin" : "role-customer"}`}>{u.role === "admin" ? "مدير" : "عميل"}</span></td>
                  <td><span style={{ color: "#888", fontSize: "0.82rem" }}>{u.orderCount ?? 0}</span></td>
                  <td><span className="u-date">{new Date(u.createdAt).toLocaleDateString("ar-EG")}</span></td>
                  <td><button className="u-toggle" onClick={() => toggleActive(u)}>{u.isActive ? <ToggleRight size={22} color="#2e7d5a" /> : <ToggleLeft size={22} color="#ccc" />}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > LIMIT && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</button>
          <span className="page-info">صفحة {page} من {Math.ceil(total / LIMIT)}</span>
          <button className="page-btn" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)}>التالي</button>
        </div>
      )}
    </>
  );
}