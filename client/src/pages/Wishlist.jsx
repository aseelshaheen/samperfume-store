import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Package,
  ShoppingBag,
  Loader2,
  Trash2,
  ArrowLeft,
  Sparkles,
  Eye,
} from "lucide-react";
import { guestCartAdd } from "./Cart";

const API = import.meta.env.VITE_API_URL || "/api";;
const getToken = () => localStorage.getItem("sp_token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState({});
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    if (!getToken()) {
      navigate("/auth");
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/users/wishlist`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success) setItems(data.wishlist ?? []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const removeFromWishlist = async (perfumeId) => {
    setRemoving((r) => ({ ...r, [perfumeId]: true }));
    await new Promise((res) => setTimeout(res, 280));
    try {
      const res = await fetch(`${API}/users/wishlist/${perfumeId}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success)
        setItems((prev) => prev.filter((p) => p._id !== perfumeId));
    } catch {
      setRemoving((r) => ({ ...r, [perfumeId]: false }));
    }
  };

  const addToCart = async (perfume) => {
    setAdding((a) => ({ ...a, [perfume._id]: true }));
    if (getToken()) {
      try {
        await fetch(`${API}/users/cart`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            perfumeId: perfume._id,
            section:
              perfume.availability === "taqseem_only" ? "taqseem" : "full",
            quantity: 1,
          }),
        });
      } catch {}
    } else {
      guestCartAdd({
        perfumeId: perfume._id,
        slug: perfume.slug,
        name: perfume.name,
        brand: perfume.brand,
        section: perfume.availability === "taqseem_only" ? "taqseem" : "full",
        size: null,
        quantity: 1,
      });
    }
    setTimeout(() => setAdding((a) => ({ ...a, [perfume._id]: false })), 1800);
  };

  const getPrice = (p) => {
    if (!p) return null;
    const base = p.fullBottle?.price;
    if (!base) return null;
    return p.discount >= 1
      ? Math.round(base - (base * p.discount) / 100)
      : base;
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Tajawal:wght@300;400;500;700&display=swap');
        :root{--ink:#1a1410;--bob:#452829;--bob-l:#5c3637;--bob-pale:#f7f0ec;--gold:#b89b6a;--border:#e6ddd4;--muted:#9a8f85;--off:#faf7f4;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Tajawal',sans-serif;direction:rtl;background:var(--off);color:var(--ink);}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardOut{to{opacity:0;transform:scale(0.93) translateY(-6px)}}

        .wl-hero{background:#f3f4f6;padding:3.5rem 2rem 3rem;text-align:center;position:relative;overflow:hidden;}
        .wl-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 25% 50%,rgba(184,155,106,.10) 0%,transparent 55%),radial-gradient(ellipse at 75% 50%,rgba(0,0,0,.02) 0%,transparent 55%);pointer-events:none;}
        .wl-hero-eyebrow{font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;color:var(--bob);font-weight:600;margin-bottom:.55rem;display:flex;align-items:center;justify-content:center;gap:.4rem;}
        .wl-hero-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,4vw,3.2rem);font-weight:300;color:var(--ink);letter-spacing:.04em;line-height:1.1;margin-bottom:.4rem;}
        .wl-hero-sub{font-size:.8rem;color:var(--muted);letter-spacing:.04em;}

        .wl-toolbar{background:#fff;border-bottom:1px solid var(--border);padding:1.2rem 2rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.8rem;}
        .wl-count-pill{font-size:.72rem;color:var(--muted);background:var(--off);border:1px solid var(--border);padding:.2rem .7rem;border-radius:20px;display:flex;align-items:center;gap:.35rem;}
        .wl-back{display:flex;align-items:center;gap:.4rem;background:none;border:1.5px solid var(--border);color:var(--muted);border-radius:3px;padding:.42rem .9rem;font-family:'Tajawal',sans-serif;font-size:.8rem;cursor:pointer;transition:all .2s;}
        .wl-back:hover{border-color:var(--bob);color:var(--bob);}

        .wl-wrap{max-width:1300px;margin:0 auto;padding:2.5rem 2rem 5rem;}

        .wl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1.6rem;animation:fadeUp .4s ease both;}

        .wl-card{background:#fff;border:1px solid var(--border);border-radius:2px;overflow:hidden;transition:box-shadow .3s,transform .3s;position:relative;}
        .wl-card:hover{box-shadow:0 16px 48px rgba(69,40,41,.1);transform:translateY(-4px);}
        .wl-card.out{animation:cardOut .28s ease forwards;}

        .wl-img-wrap{position:relative;aspect-ratio:3/4;background:var(--bob-pale);overflow:hidden;}
        .wl-img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease;}
        .wl-card:hover .wl-img{transform:scale(1.07);}
        .wl-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#d0c0b5;}

        .wl-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,20,16,.55) 0%,transparent 50%);opacity:0;transition:opacity .3s;display:flex;align-items:flex-end;padding:1rem;}
        .wl-card:hover .wl-overlay{opacity:1;}
        .wl-hover-add{width:100%;background:rgba(255,255,255,.96);backdrop-filter:blur(6px);border:none;padding:.62rem;font-family:'Tajawal',sans-serif;font-size:.78rem;font-weight:700;color:var(--bob);cursor:pointer;border-radius:2px;letter-spacing:.06em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:.4rem;transform:translateY(6px);opacity:0;transition:all .25s .05s;}
        .wl-card:hover .wl-hover-add{transform:translateY(0);opacity:1;}
        .wl-hover-add.done{background:var(--bob);color:#fff;}

        .wl-disc{position:absolute;top:.75rem;right:.75rem;background:var(--bob);color:#fff;font-size:.6rem;font-weight:700;padding:.2rem .52rem;letter-spacing:.06em;}
        .wl-del{position:absolute;top:.75rem;left:.75rem;width:30px;height:30px;border-radius:50%;background:#fff;border:1px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#bbb;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.07);}
        .wl-del:hover{background:#fef2f2;color:#c0392b;border-color:#fecaca;}

        .wl-body{padding:1rem 1.1rem 1.25rem;}
        .wl-brand-tag{font-size:.58rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:.28rem;}
        .wl-name{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:600;color:var(--ink);line-height:1.3;margin-bottom:.55rem;cursor:pointer;transition:color .2s;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .wl-name:hover{color:var(--bob);}
        .wl-prices{display:flex;align-items:baseline;gap:.45rem;margin-bottom:.8rem;}
        .wl-price{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;color:var(--bob);}
        .wl-orig{font-size:.78rem;color:#bbb;text-decoration:line-through;}
        .wl-rule{height:1px;background:var(--border);margin-bottom:.8rem;}
        .wl-add-btn{width:100%;background:var(--bob);color:#fff;border:none;padding:.65rem;font-family:'Tajawal',sans-serif;font-size:.8rem;font-weight:700;cursor:pointer;border-radius:2px;display:flex;align-items:center;justify-content:center;gap:.4rem;transition:background .2s;letter-spacing:.05em;text-transform:uppercase;}
        .wl-add-btn:hover{background:var(--bob-l);}
        .wl-add-btn.done{background:#2e7d5a;}

        .wl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:7rem 2rem;text-align:center;animation:fadeUp .4s ease;}
        .wl-empty-ring{width:90px;height:90px;border-radius:50%;border:1.5px solid var(--border);background:var(--bob-pale);display:flex;align-items:center;justify-content:center;margin-bottom:1.8rem;}
        .wl-empty h2{font-family:'Cormorant Garamond',serif;font-size:1.7rem;font-weight:400;color:var(--ink);margin-bottom:.5rem;}
        .wl-empty p{font-size:.85rem;color:var(--muted);max-width:280px;line-height:1.75;margin-bottom:1.8rem;}
        .wl-empty-cta{background:var(--bob);color:#fff;border:none;padding:.82rem 2.2rem;font-family:'Tajawal',sans-serif;font-weight:700;font-size:.88rem;cursor:pointer;border-radius:2px;letter-spacing:.07em;text-transform:uppercase;transition:background .2s;}
        .wl-empty-cta:hover{background:var(--bob-l);}

        @media(max-width:640px){
          .wl-grid{grid-template-columns:repeat(2,1fr);gap:.9rem;}
          .wl-wrap{padding:1.5rem 1rem 4rem;}
        }
          @media(max-width:600px){
  .wl-toolbar{padding:0.75rem 1rem;}
  .wl-wrap{padding:1rem 0.75rem 3rem;}
  .wl-grid{grid-template-columns:repeat(2,1fr);gap:0.65rem;}
  .wl-img-wrap{aspect-ratio:1;}
  .wl-body{padding:0.6rem 0.65rem 0.75rem;}
  .wl-brand-tag{font-size:0.52rem;margin-bottom:0.18rem;}
  .wl-name{font-size:0.85rem;margin-bottom:0.4rem;}
  .wl-price{font-size:0.95rem;}
  .wl-orig{font-size:0.72rem;}
  .wl-add-btn{font-size:0.68rem;padding:0.5rem;gap:0.3rem;letter-spacing:0.03em;}
  .wl-rule{margin-bottom:0.6rem;}
  .wl-disc{font-size:0.55rem;padding:0.15rem 0.4rem;top:0.5rem;right:0.5rem;}
  .wl-del{width:26px;height:26px;top:0.5rem;left:0.5rem;}
  .wl-overlay{display:none;}
  .wl-empty{padding:4rem 1rem;}
  .wl-empty h2{font-size:1.35rem;}
  .wl-empty-ring{width:70px;height:70px;margin-bottom:1.2rem;}
}
      `}</style>

      {/* Hero */}
      <header ClassName="page-hero">
        <div ClassName="page-hero__pattern"></div>
        <div ClassName="page-hero__glow"></div>
        <div ClassName="page-hero__inner">
          <span class="page-hero__eyebrow">مجموعتك المفضلة</span>
          <h1 ClassName="page-hero__title">قائمة المفضلة</h1>
          <p ClassName="page-hero__sub">العطور التي تسحرك، في مكان واحد</p>
          <div ClassName="page-hero__rule">
            <div ClassName="page-hero__rule-line"></div>
            <div ClassName="page-hero__rule-dot"></div>
            <div ClassName="page-hero__rule-line"></div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="wl-toolbar">
        <div className="wl-count-pill">
          <Heart size={12} fill="#452829" color="#452829" /> {items.length} عطر
          محفوظ
        </div>
        <button className="wl-back" onClick={() => navigate("/shop")}>
          <ArrowLeft size={13} /> متابعة التسوق
        </button>
      </div>

      <div className="wl-wrap">
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "5rem",
              color: "#452829",
            }}
          >
            <Loader2
              size={28}
              style={{ animation: "spin 1s linear infinite" }}
            />
          </div>
        ) : items.length === 0 ? (
          <div className="wl-empty">
            <div className="wl-empty-ring">
              <Heart size={34} strokeWidth={1} color="#452829" />
            </div>
            <h2>قائمتك فارغة</h2>
            <p>احفظ العطور التي تعجبك لتجدها بسرعة وتطلبها لاحقاً</p>
            <button className="wl-empty-cta" onClick={() => navigate("/shop")}>
              اكتشف عطورنا
            </button>
          </div>
        ) : (
          <div className="wl-grid">
            {items.map((perfume) => {
              const price = getPrice(perfume);
              const orig =
                perfume.discount > 0
                  ? Math.ceil(perfume.fullBottle?.price)
                  : null;
              const img =
                perfume.images?.find((i) => i.isMain)?.url ??
                perfume.images?.[0]?.url;
              const isAdded = adding[perfume._id];
              const isOut = removing[perfume._id];

              return (
                <div
                  key={perfume._id}
                  className={`wl-card ${isOut ? "out" : ""}`}
                >
                  <div className="wl-img-wrap">
                    {img ? (
                      <img loading="lazy" src={img} alt={perfume.name} className="wl-img" />
                    ) : (
                      <div className="wl-img-ph">
                        <Package size={52} strokeWidth={0.6} />
                      </div>
                    )}
                    <div className="wl-overlay">
                      <button
                        className={`wl-hover-add ${isAdded ? "done" : ""}`}
                        onClick={() => addToCart(perfume)}
                      >
                        <ShoppingBag size={13} />{" "}
                        {isAdded ? "تمت الإضافة ✓" : "أضف للسلة"}
                      </button>
                    </div>
                    {perfume.discount > 0 && (
                      <span className="wl-disc">−{perfume.discount}%</span>
                    )}
                    <button
                      className="wl-del"
                      onClick={() => removeFromWishlist(perfume._id)}
                      title="إزالة"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="wl-body">
                    <div className="wl-brand-tag">{perfume.brand}</div>
                    <div
                      className="wl-name"
                      onClick={() => navigate(`/shop/${perfume.slug || perfume._id}/full`)}
                    >
                      {perfume.name}
                    </div>
                    <div className="wl-prices">
                      {orig && <span className="wl-orig">₪{orig}</span>}
                      <span className="wl-price">
                        {price != null ? `₪${price}` : "—"}
                      </span>
                    </div>
                    <div className="wl-rule" />
                    <button
                      className="wl-add-btn"
                      onClick={() => navigate(`/shop/${perfume.slug || perfume._id}/full`)}
                    >
                      <Eye size={13} /> عرض التفاصيل
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
