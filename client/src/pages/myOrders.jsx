import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, Package, ChevronDown, ChevronUp,
  Loader2, MapPin, Phone, Clock, CheckCircle,
  Truck, XCircle, RefreshCw, StickyNote, Sparkles,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";;
const getToken = () => localStorage.getItem("sp_token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const statusConfig = {
  pending:    { label: "قيد الانتظار", color: "#b5620a", bg: "#fff7ed", border: "#fde8c8", icon: Clock,       step: 1 },
  confirmed:  { label: "مؤكد",         color: "#1e4db7", bg: "#eff4ff", border: "#c7d9fb", icon: CheckCircle, step: 2 },
  processing: { label: "قيد التجهيز",  color: "#6b3d9e", bg: "#f5f0ff", border: "#ddd0f8", icon: RefreshCw,   step: 3 },
  shipped:    { label: "تم الشحن",     color: "#0e7a6e", bg: "#f0fdfb", border: "#b3e8e2", icon: Truck,       step: 4 },
  delivered:  { label: "تم التسليم",   color: "#2e7d5a", bg: "#f0fdf4", border: "#b3e0ca", icon: CheckCircle, step: 5 },
  cancelled:  { label: "ملغي",         color: "#c0392b", bg: "#fef2f2", border: "#fecaca", icon: XCircle,     step: 0 },
};

const STEPS = [
  { key: "pending",    label: "الطلب"   },
  { key: "confirmed",  label: "تأكيد"   },
  { key: "processing", label: "تجهيز"   },
  { key: "shipped",    label: "شحن"     },
  { key: "delivered",  label: "استلام"  },
];

function StatusTracker({ status }) {
  if (status === "cancelled") return (
    <div style={{ display:"flex", alignItems:"center", gap:".5rem", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:4, padding:".65rem 1rem", fontSize:".82rem", color:"#c0392b", fontWeight:700 }}>
      <XCircle size={14} /> تم إلغاء هذا الطلب
    </div>
  );

  const currentStep = statusConfig[status]?.step ?? 1;

  return (
    <div style={{ padding:".4rem 0" }}>
      <div style={{ display:"flex", alignItems:"center" }}>
        {STEPS.map((s, i) => {
          const done   = statusConfig[s.key].step <= currentStep;
          const active = statusConfig[s.key].step === currentStep;
          return (
            <div key={s.key} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".28rem" }}>
                <div style={{
                  width: 26, height: 26, borderRadius:"50%",
                  background: done ? "#452829" : "#f0ede9",
                  border: active ? "2.5px solid #452829" : "2px solid transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow: active ? "0 0 0 4px rgba(69,40,41,.12)" : "none",
                  transition:"all .3s",
                }}>
                  {done
                    ? <CheckCircle size={12} color="white" strokeWidth={2.5} />
                    : <div style={{ width:7, height:7, borderRadius:"50%", background:"#ccc" }} />}
                </div>
                <span style={{ fontSize:".62rem", fontWeight: active ? 700 : 400, color: done ? "#452829" : "#bbb", whiteSpace:"nowrap" }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex:1, height:2, margin:"0 3px", marginBottom:18, background: statusConfig[s.key].step < currentStep ? "#452829" : "#e8e2dc", transition:"background .3s" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const st   = statusConfig[order.status] ?? statusConfig.pending;
  const Icon = st.icon;

  return (
    <div style={{ background:"#fff", border:"1px solid #e6ddd4", borderRadius:2, overflow:"hidden", transition:"box-shadow .25s", boxShadow: open ? "0 8px 32px rgba(69,40,41,.08)" : "none" }}>

      {/* Card header — always visible */}
      <div onClick={() => setOpen(o => !o)} style={{ padding:"1.1rem 1.4rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>

        {/* Left: thumbnails */}
        <div style={{ display:"flex", gap:".35rem", flexShrink:0 }}>
          {order.items?.slice(0, 3).map((item, i) => (
            <div key={i} style={{ width:46, height:46, borderRadius:2, overflow:"hidden", background:"#f7f0ec", border:"1px solid #e6ddd4", flexShrink:0 }}>
              {item.image
                ? <img loading="lazy" src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}><Package size={14} color="#c8b5a8" /></div>}
            </div>
          ))}
          {(order.items?.length ?? 0) > 3 && (
            <div style={{ width:46, height:46, borderRadius:2, background:"#f7f0ec", border:"1px solid #e6ddd4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".68rem", color:"#b89b6a", fontWeight:700 }}>
              +{order.items.length - 3}
            </div>
          )}
        </div>

        {/* Middle: order info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".3rem", flexWrap:"wrap" }}>
            <span style={{ fontFamily:"Cormorant Garamond, serif", fontSize:"1rem", fontWeight:600, color:"#1a1410", letterSpacing:".02em" }}>
              SP-{order._id.slice(-5).toUpperCase()}
            </span>
            <span style={{ fontSize:".65rem", fontWeight:700, padding:".18rem .6rem", borderRadius:20, background:st.bg, color:st.color, border:`1px solid ${st.border}`, display:"flex", alignItems:"center", gap:".25rem", letterSpacing:".03em" }}>
              <Icon size={9} /> {st.label}
            </span>
          </div>
          <div style={{ fontSize:".73rem", color:"#9a8f85", display:"flex", gap:".8rem", flexWrap:"wrap" }}>
            <span>{new Date(order.createdAt).toLocaleDateString("ar-EG", { year:"numeric", month:"long", day:"numeric" })}</span>
            <span>·</span>
            <span>{order.items?.length ?? 0} عنصر</span>
            <span>·</span>
            <span style={{ fontFamily:"Cormorant Garamond, serif", color:"#452829", fontWeight:600, fontSize:".82rem" }}>₪{order.totalPrice}</span>
          </div>
        </div>

        {/* Right: chevron */}
        <div style={{ color:"#c8b5a8", flexShrink:0 }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* Expanded panel */}
      {open && (
        <div style={{ borderTop:"1px solid #f0e8e0" }}>

          {/* Tracker */}
          <div style={{ padding:"1.1rem 1.4rem", background:"#faf7f4", borderBottom:"1px solid #f0e8e0" }}>
            <div style={{ fontSize:".6rem", fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#b89b6a", marginBottom:".7rem" }}>تتبع الطلب</div>
            <StatusTracker status={order.status} />
          </div>

          {/* Items */}
          <div style={{ padding:"1.1rem 1.4rem", borderBottom:"1px solid #f0e8e0" }}>
            <div style={{ fontSize:".6rem", fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#b89b6a", marginBottom:".8rem" }}>المنتجات</div>
            <div style={{ display:"flex", flexDirection:"column", gap:".55rem" }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display:"flex", gap:".8rem", alignItems:"center", background:"#faf7f4", borderRadius:2, padding:".65rem", border:"1px solid #f0e8e0" }}>
                  <div style={{ width:44, height:44, borderRadius:2, overflow:"hidden", background:"#f0ece8", flexShrink:0 }}>
                    {item.image
                      ? <img loading="lazy" src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}><Package size={14} color="#c8b5a8" /></div>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"Cormorant Garamond, serif", fontSize:".95rem", fontWeight:600, color:"#1a1410", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</div>
                    <div style={{ fontSize:".7rem", color:"#9a8f85" }}>
                      {item.brand} · {item.section === "full" ? "قارورة كاملة" : `تقسيمة ${item.size_ml ?? ""}مل`}
                    </div>
                  </div>
                  <div style={{ textAlign:"left", flexShrink:0 }}>
                    <div style={{ fontSize:".72rem", color:"#bbb", marginBottom:"2px" }}>× {item.quantity}</div>
                    <div style={{ fontFamily:"Cormorant Garamond, serif", fontSize:".95rem", color:"#452829", fontWeight:600 }}>
                      ₪{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing + Delivery */}
          <div style={{ padding:"1.1rem 1.4rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>

            {/* Pricing */}
            <div>
              <div style={{ fontSize:".6rem", fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#b89b6a", marginBottom:".7rem" }}>الفاتورة</div>
              <div style={{ display:"flex", flexDirection:"column", gap:".32rem", fontSize:".82rem", color:"#9a8f85" }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}><span>المجموع الفرعي</span><span>₪{order.itemsPrice}</span></div>
                <div style={{ display:"flex", justifyContent:"space-between" }}><span>الشحن</span><span>₪{order.shippingPrice ?? 0}</span></div>
                {order.discount > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", color:"#2e7d5a" }}><span>الخصم</span><span>−₪{order.discount}</span></div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #e6ddd4", paddingTop:".32rem", fontWeight:700, color:"#1a1410", fontSize:".88rem" }}>
                  <span>الإجمالي</span>
                  <span style={{ fontFamily:"Cormorant Garamond, serif", fontSize:"1rem", color:"#452829" }}>₪{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div>
              <div style={{ fontSize:".6rem", fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#b89b6a", marginBottom:".7rem" }}>التوصيل</div>
              <div style={{ display:"flex", flexDirection:"column", gap:".4rem", fontSize:".82rem", color:"#9a8f85" }}>
                {order.phone && (
                  <div style={{ display:"flex", alignItems:"center", gap:".4rem" }}>
                    <Phone size={11} style={{ flexShrink:0 }} />
                    <span dir="ltr">{order.phone}</span>
                  </div>
                )}
                {order.shippingAddress?.city && (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:".4rem" }}>
                    <MapPin size={11} style={{ marginTop:2, flexShrink:0 }} />
                    <span>{[order.shippingAddress.city, order.shippingAddress.area, order.shippingAddress.street].filter(Boolean).join("، ")}</span>
                  </div>
                )}
                {order.shippingAddress?.notes && (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:".4rem", fontSize:".75rem", color:"#bbb" }}>
                    <StickyNote size={10} style={{ marginTop:2, flexShrink:0 }} />
                    <span>{order.shippingAddress.notes}</span>
                  </div>
                )}
                <div style={{ fontSize:".72rem", color:"#bbb", marginTop:".1rem" }}>
                  {order.paymentMethod === "cash_on_delivery" ? "💵 الدفع عند الاستلام" : "💳 دفع إلكتروني"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    if (!getToken()) { navigate("/auth"); return; }
    const load = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API}/users/orders`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) setOrders(data.orders ?? []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const filtered    = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const activeCount = orders.filter(o => ["pending","confirmed","processing","shipped"].includes(o.status)).length;
  const totalSpent  = orders.reduce((s, o) => s + (o.totalPrice ?? 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Tajawal:wght@300;400;500;700&display=swap');
        :root{--bob:#452829;--bob-l:#5c3637;--gold:#b89b6a;--border:#e6ddd4;--off:#faf7f4;--ink:#1a1410;--muted:#9a8f85;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Tajawal',sans-serif;direction:rtl;background:var(--off);color:var(--ink);}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}


        .mo-stats-bar{background:#fff;border-bottom:1px solid var(--border);padding:0;}
        .mo-stats-inner{max-width:860px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);}
        .mo-stat{padding:1.2rem 1.5rem;text-align:center;border-left:1px solid var(--border);}
        .mo-stat:last-child{border-left:none;}
        .mo-stat-num{font-family:'Cormorant Garamond',serif;font-size:1.6rem;color:var(--bob);font-weight:600;line-height:1;}
        .mo-stat-label{font-size:.68rem;color:var(--muted);margin-top:.25rem;letter-spacing:.04em;}

        .mo-filters-bar{background:#fff;border-bottom:1px solid var(--border);padding:.9rem 2rem;overflow-x:auto;}
        .mo-filters{max-width:860px;margin:0 auto;display:flex;gap:.5rem;flex-wrap:wrap;}
        .mo-fbtn{padding:.38rem .9rem;border-radius:20px;border:1.5px solid var(--border);background:#fff;font-family:'Tajawal',sans-serif;font-size:.77rem;color:var(--muted);cursor:pointer;transition:all .2s;white-space:nowrap;}
        .mo-fbtn:hover{border-color:var(--bob);color:var(--bob);}
        .mo-fbtn.on{background:var(--bob);border-color:var(--bob);color:#fff;font-weight:700;}

        .mo-wrap{max-width:860px;margin:0 auto;padding:2rem 2rem 5rem;}
        .mo-list{display:flex;flex-direction:column;gap:1rem;animation:fadeUp .35s ease;}

        .mo-empty{display:flex;flex-direction:column;align-items:center;padding:7rem 2rem;text-align:center;gap:1rem;}
        .mo-empty-ring{width:88px;height:88px;border-radius:50%;border:1.5px solid var(--border);background:#fff;display:flex;align-items:center;justify-content:center;}
        .mo-empty h3{font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:400;color:var(--ink);}
        .mo-empty p{font-size:.85rem;color:var(--muted);max-width:280px;line-height:1.75;}
        .mo-empty-cta{background:var(--bob);color:#fff;border:none;padding:.82rem 2.2rem;font-family:'Tajawal',sans-serif;font-weight:700;font-size:.88rem;cursor:pointer;border-radius:2px;letter-spacing:.07em;text-transform:uppercase;transition:background .2s;margin-top:.5rem;}
        .mo-empty-cta:hover{background:var(--bob-l);}

        .mo-none-msg{text-align:center;padding:2.5rem;color:var(--muted);font-size:.85rem;}

        @media(max-width:640px){
          .mo-wrap{padding:1.2rem 1rem 4rem;}
          .mo-stat{padding:.9rem .8rem;}
          .mo-stat-num{font-size:1.3rem;}
        }
      `}</style>
      
      <header class="page-hero">
  <div class="page-hero__pattern"></div>
  <div class="page-hero__glow"></div>
  <div class="page-hero__inner">
    <span class="page-hero__eyebrow">سجل مشترياتك
    </span>
    <h1 class="page-hero__title">طلباتي</h1>
    <p class="page-hero__sub">تتبع طلباتك الحالية وراجع سجل مشترياتك</p>
    <div class="page-hero__rule">
      <div class="page-hero__rule-line"></div>
      <div class="page-hero__rule-dot"></div>
      <div class="page-hero__rule-line"></div>
    </div>
  </div>
</header>

      {/* Stats bar */}
      {!loading && orders.length > 0 && (
        <div className="mo-stats-bar">
          <div className="mo-stats-inner">
            <div className="mo-stat">
              <div className="mo-stat-num">{orders.length}</div>
              <div className="mo-stat-label">إجمالي الطلبات</div>
            </div>
            <div className="mo-stat">
              <div className="mo-stat-num">{activeCount}</div>
              <div className="mo-stat-label">طلبات نشطة</div>
            </div>
            <div className="mo-stat">
              <div className="mo-stat-num">₪{totalSpent.toLocaleString()}</div>
              <div className="mo-stat-label">إجمالي المصروف</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {!loading && orders.length > 0 && (
        <div className="mo-filters-bar">
          <div className="mo-filters">
            <button className={`mo-fbtn ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>
              الكل ({orders.length})
            </button>
            {Object.entries(statusConfig).map(([key, cfg]) => {
              const count = orders.filter(o => o.status === key).length;
              if (!count) return null;
              return (
                <button key={key} className={`mo-fbtn ${filter === key ? "on" : ""}`} onClick={() => setFilter(key)}>
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mo-wrap">
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"5rem", color:"#452829" }}>
            <Loader2 size={28} style={{ animation:"spin 1s linear infinite" }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="mo-empty">
            <div className="mo-empty-ring"><ShoppingBag size={32} strokeWidth={1} color="#b89b6a" /></div>
            <h3>لا توجد طلبات بعد</h3>
            <p>لم تقم بأي طلبات حتى الآن. ابدأ التسوق الآن!</p>
            <button className="mo-empty-cta" onClick={() => navigate("/shop")}>تصفح المتجر</button>
          </div>
        ) : (
          <div className="mo-list">
            {filtered.length === 0
              ? <div className="mo-none-msg">لا توجد طلبات بهذه الحالة</div>
              : filtered.map(order => <OrderCard key={order._id} order={order} />)
            }
          </div>
        )}
      </div>
    </>
  );
}