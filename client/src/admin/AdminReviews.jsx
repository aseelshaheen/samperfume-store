import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Loader2, RefreshCw, MessageSquare } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("sp_token")}`,
});

function StarDisplay({ rating }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={13}
          fill={i <= rating ? "#b5620a" : "none"}
          stroke={i <= rating ? "#b5620a" : "#ccc"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, onApprove, onReject }) {
  const [acting, setActing] = useState(false);

  const act = async (action) => {
    setActing(true);
    try {
      const res = await fetch(`${API}/admin/reviews/${review._id}/${action}`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        action === "approve" ? onApprove(review._id) : onReject(review._id);
      }
    } catch {}
    setActing(false);
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-user">
          <div className="review-avatar">{review.user?.username?.[0]?.toUpperCase() ?? "?"}</div>
          <div>
            <div className="review-username">{review.user?.username ?? "مستخدم"}</div>
            <div className="review-email">{review.user?.email ?? ""}</div>
          </div>
        </div>
        <div className="review-meta">
          <StarDisplay rating={review.rating} />
          <span className="review-date">{new Date(review.createdAt).toLocaleDateString("ar-EG")}</span>
        </div>
      </div>

      <div className="review-perfume">
        <span className="review-perfume-label">العطر:</span>
        <span className="review-perfume-name">{review.perfume?.name ?? "—"}</span>
      </div>

      {review.title && <div className="review-title">"{review.title}"</div>}
      <p className="review-body">{review.comment}</p>

      <div className="review-actions">
        <button
          className="rev-btn approve"
          onClick={() => act("approve")}
          disabled={acting}
        >
          {acting ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <CheckCircle size={14} />}
          موافقة
        </button>
        <button
          className="rev-btn reject"
          onClick={() => act("reject")}
          disabled={acting}
        >
          <XCircle size={14} /> رفض
        </button>
      </div>
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState("pending"); // "pending" | "approved" | "rejected"

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/admin/reviews?status=${tab}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setReviews(data.reviews ?? []);
      else setError("تعذّر تحميل التقييمات");
    } catch { setError("تعذّر الاتصال بالخادم"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const removeReview = (id) => setReviews(prev => prev.filter(r => r._id !== id));

  return (
    <>
      <style>{`
        .rv-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.6rem; }
        .rv-heading { font-family:'Playfair Display',serif; font-size:1.4rem; color:#1a1a1a; font-weight:700; }

        .rv-tabs { display:flex; gap:0; border:1px solid #e8e2dc; border-radius:6px; overflow:hidden; }
        .rv-tab { background:white; border:none; padding:0.5rem 1.2rem; font-family:'Tajawal',sans-serif; font-size:0.85rem; color:#888; cursor:pointer; display:flex; align-items:center; gap:0.4rem; transition:all 0.2s; border-right:1px solid #e8e2dc; }
        .rv-tab:last-child { border-right:none; }
        .rv-tab.active { background:#452829; color:white; }

        .rv-refresh { display:flex; align-items:center; gap:0.4rem; background:white; border:1px solid #e8e2dc; color:#888; font-family:'Tajawal',sans-serif; font-size:0.82rem; padding:0.48rem 1rem; border-radius:6px; cursor:pointer; transition:all 0.2s; }
        .rv-refresh:hover { color:#1a1a1a; border-color:#ccc; }

        .review-card { background:white; border:1px solid #e8e2dc; border-radius:10px; padding:1.4rem; margin-bottom:1rem; transition:box-shadow 0.2s; }
        .review-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.06); }

        .review-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:0.9rem; }
        .review-user { display:flex; align-items:center; gap:0.7rem; }
        .review-avatar { width:36px; height:36px; border-radius:50%; background:#452829; color:white; display:flex; align-items:center; justify-content:center; font-size:0.82rem; font-weight:700; flex-shrink:0; }
        .review-username { font-size:0.88rem; font-weight:600; color:#1a1a1a; }
        .review-email { font-size:0.72rem; color:#aaa; }

        .review-meta { display:flex; flex-direction:column; align-items:flex-end; gap:0.3rem; }
        .review-date { font-size:0.72rem; color:#aaa; }

        .review-perfume { font-size:0.78rem; margin-bottom:0.65rem; }
        .review-perfume-label { color:#aaa; margin-left:0.3rem; }
        .review-perfume-name { color:#452829; font-weight:600; }

        .review-title { font-family:'Playfair Display',serif; font-size:0.95rem; color:#1a1a1a; font-style:italic; margin-bottom:0.5rem; }
        .review-body { font-size:0.86rem; color:#555; line-height:1.7; margin-bottom:1rem; }

        .review-actions { display:flex; gap:0.6rem; }
        .rev-btn { display:flex; align-items:center; gap:0.35rem; padding:0.45rem 1.1rem; border:none; border-radius:5px; font-family:'Tajawal',sans-serif; font-size:0.82rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .rev-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .rev-btn.approve { background:#f0fdf4; color:#2e7d5a; border:1px solid #b3e0ca; }
        .rev-btn.approve:hover:not(:disabled) { background:#2e7d5a; color:white; }
        .rev-btn.reject  { background:#fef2f2; color:#c0392b; border:1px solid #fecaca; }
        .rev-btn.reject:hover:not(:disabled) { background:#c0392b; color:white; }

        .rv-empty { text-align:center; padding:4rem 2rem; color:#aaa; }
        .rv-empty svg { margin-bottom:1rem; }
        .rv-empty p { font-size:0.88rem; }

        .rv-error { background:#fef2f2; border:1px solid #fecaca; color:#c0392b; padding:1rem 1.2rem; border-radius:8px; margin-bottom:1.5rem; font-size:0.88rem; }

        .rv-count { font-size:0.78rem; color:#888; background:#faf8f6; border:1px solid #e8e2dc; padding:0.2rem 0.6rem; border-radius:20px; margin-right:auto; }

        @keyframes spin { to { transform:rotate(360deg); } }
        @media(max-width:600px){
  .rv-top{flex-direction:column;align-items:flex-start;gap:0.65rem;margin-bottom:1rem;}
  .rv-heading{font-size:1.1rem;}
  .rv-tabs{width:100%;}
  .rv-tab{flex:1;justify-content:center;padding:0.45rem 0.4rem;font-size:0.76rem;border-right:1px solid #e8e2dc;}
  .rv-refresh{font-size:0.75rem;padding:0.38rem 0.7rem;}
  .review-card{padding:1rem;}
  .review-header{flex-direction:column;gap:0.5rem;align-items:flex-start;}
  .review-meta{align-items:flex-start;flex-direction:row;gap:0.6rem;}
  .review-avatar{width:30px;height:30px;font-size:0.72rem;}
  .review-username{font-size:0.82rem;}
  .review-email{font-size:0.68rem;}
  .review-title{font-size:0.88rem;}
  .review-body{font-size:0.8rem;}
  .rev-btn{padding:0.38rem 0.85rem;font-size:0.76rem;}
  .rv-count{font-size:0.72rem;}
}
      `}</style>

      <div className="rv-top">
        <h2 className="rv-heading">تقييمات العملاء</h2>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <div className="rv-tabs">
            {[
              { key: "pending",  label: "قيد الانتظار" },
              { key: "approved", label: "مقبولة" },
              { key: "rejected", label: "مرفوضة" },
            ].map(t => (
              <button key={t.key} className={`rv-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <button className="rv-refresh" onClick={load}><RefreshCw size={14} /> تحديث</button>
        </div>
      </div>

      {error && <div className="rv-error">⚠ {error}</div>}

      {loading ? (
        <div className="rv-empty">
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "#452829", display: "block", margin: "0 auto 1rem" }} />
          <p>جاري تحميل التقييمات...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rv-empty">
          <MessageSquare size={36} strokeWidth={1} />
          <p>لا توجد تقييمات {tab === "pending" ? "قيد الانتظار" : tab === "approved" ? "مقبولة" : "مرفوضة"}</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
            <span className="rv-count">{reviews.length} تقييم</span>
          </div>
          {reviews.map(r => (
            <ReviewCard
              key={r._id}
              review={r}
              onApprove={removeReview}
              onReject={removeReview}
            />
          ))}
        </>
      )}
    </>
  );
}