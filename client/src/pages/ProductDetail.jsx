import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingBag,
  ArrowLeftRight,
  Package,
  Layers,
  ChevronLeft,
  Share2,
  Loader2,
  Send,
  ArrowRight,
  CheckCircle,
  Heart,
} from "lucide-react";
import { guestCartAdd } from "./Cart";

const API = import.meta.env.VITE_API_URL || "/api";;
const getToken = () => localStorage.getItem("sp_token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const availLabel = {
  full_only: "قارورة كاملة فقط",
  taqseem_only: "تقسيمة فقط",
  both: "كاملة وتقسيمة",
};

/* ── Star Rating ── */
function StarRating({ value, onChange, readonly }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={18}
          fill={(readonly ? value : hovered || value) >= i ? "#452829" : "none"}
          color={
            (readonly ? value : hovered || value) >= i ? "#452829" : "#ddd"
          }
          style={{
            cursor: readonly ? "default" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(i)}
        />
      ))}
    </div>
  );
}

/* ── Main Component ── */
export default function ProductDetail() {
  const { slug, section } = useParams();
  const navigate = useNavigate();

  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(section ?? "full");
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [cartMsg, setCartMsg] = useState("");
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistMsg, setWishlistMsg] = useState("");
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (section === "full" || section === "taqseem") setActiveSection(section);
  }, [section]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/perfumes/${slug}`);
        const data = await res.json();
        if (data.success) {
          setPerfume(data.perfume);
          const avail = data.perfume.availability;
          if (activeSection === "taqseem" && avail === "full_only")
            setActiveSection("full");
          if (activeSection === "full" && avail === "taqseem_only")
            setActiveSection("taqseem");
          if (data.perfume.taqseem?.sizes?.length)
            setSelectedSize(data.perfume.taqseem.sizes[0]);

          if (getToken()) {
            try {
              const wRes = await fetch(`${API}/users/wishlist`, {
                headers: authHeaders(),
              });
              const wData = await wRes.json();
              if (wData.success) {
                setInWishlist(
                  wData.wishlist?.some((p) => p._id === data.perfume._id) ??
                    false,
                );
              }
            } catch {}
          }
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [slug]);

  const switchSection = (sec) => {
    setActiveSection(sec);
    navigate(`/shop/${slug}/${sec}`, { replace: true });
  };

  const handleAddToCart = async () => {
    if (activeSection === "taqseem" && !selectedSize) return;

    if (getToken()) {
      try {
        const res = await fetch(`${API}/users/cart`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            perfumeId: perfume._id,
            section: activeSection,
            size: activeSection === "taqseem" ? selectedSize?.ml : undefined,
            quantity: qty,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCartMsg("تمت الإضافة ✓");
          setTimeout(() => setCartMsg(""), 2500);
        } else {
          setCartMsg(data.message ?? "خطأ");
        }
      } catch {
        setCartMsg("خطأ في الاتصال");
      }
    } else {
      guestCartAdd({
        perfumeId: perfume._id,
        slug: perfume.slug,
        name: perfume.name,
        brand: perfume.brand,
        section: activeSection,
        size: activeSection === "taqseem" ? selectedSize?.ml : null,
        quantity: qty,
      });
      setCartMsg("تمت الإضافة ✓");
      setTimeout(() => setCartMsg(""), 2500);
    }
  };

  const handleWishlist = async () => {
    if (!getToken()) {
      navigate("/auth");
      return;
    }
    setLoadingWishlist(true);
    try {
      const res = await fetch(`${API}/users/wishlist/${perfume._id}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        const nowIn = !inWishlist;
        setInWishlist(nowIn);
        setWishlistMsg(nowIn ? "أُضيف للمفضلة" : "أُزيل من المفضلة");
        setTimeout(() => setWishlistMsg(""), 2000);
      }
    } catch {}
    setLoadingWishlist(false);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!getToken()) {
      navigate("/auth");
      return;
    }
    if (!reviewRating) {
      setReviewError("يرجى اختيار تقييم");
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError("يرجى كتابة تعليق");
      return;
    }
    setSubmitting(true);
    setReviewError("");
    try {
      const res = await fetch(`${API}/perfumes/${perfume._id}/reviews`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewRating(0);
        setReviewComment("");
        setReviewError("✓ شكراً! سيظهر تقييمك بعد مراجعته من قِبَل الإدارة.");
      } else {
        setReviewError(data.message ?? "حدث خطأ");
      }
    } catch {
      setReviewError("خطأ في الاتصال");
    }
    setSubmitting(false);
  };

  /* ── Loading / not found ── */
  if (loading)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2
          size={28}
          style={{ animation: "spin 1s linear infinite", color: "#452829" }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (!perfume)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          fontFamily: "Tajawal,sans-serif",
          direction: "rtl",
        }}
      >
        <h2 style={{ fontFamily: "Playfair Display,serif" }}>
          العطر غير موجود
        </h2>
        <button
          onClick={() => navigate("/shop")}
          style={{
            background: "#452829",
            color: "white",
            border: "none",
            padding: "0.7rem 1.8rem",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: "Tajawal,sans-serif",
          }}
        >
          العودة للمتجر
        </button>
      </div>
    );

  const images = perfume.images ?? [];
  const mainImg = images[selectedImg]?.url ?? images[0]?.url;
  const isBoth = perfume.availability === "both";

  // No rounding — exact price as entered by admin
const displayPrice =
  activeSection === "full"
    ? perfume.discount > 0
      ? Math.round(perfume.fullBottle.price - (perfume.fullBottle.price * perfume.discount / 100))
      : perfume.fullBottle?.price
    : selectedSize?.price;

const originalPrice =
  activeSection === "full" && perfume.discount > 0
    ? Math.ceil(perfume.fullBottle?.price)  // ← ceil, not round
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Tajawal:wght@300;400;500;700&display=swap');
        :root{--bob:#452829;--bob-l:#5c3637;--black:#1a1a1a;--gray:#888;--border:#e8e2dc;--off:#faf8f6;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Tajawal',sans-serif;direction:rtl;background:#fff;color:#1a1a1a;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

        .pd-back-btn{display:inline-flex;align-items:center;gap:0.4rem;background:none;border:1.5px solid var(--border);border-radius:4px;padding:0.4rem 0.9rem;font-family:'Tajawal',sans-serif;font-size:0.82rem;color:#666;cursor:pointer;transition:all 0.2s;margin:1.2rem 2rem 0.5rem;max-width:fit-content;}
        .pd-back-btn:hover{border-color:var(--bob);color:var(--bob);}

        .pd-breadcrumb{display:flex;align-items:center;gap:0.5rem;padding:0.6rem 2rem 1rem;font-size:0.78rem;color:#aaa;max-width:1400px;margin:0 auto;flex-wrap:wrap;}
        .pd-breadcrumb a{color:#aaa;text-decoration:none;transition:color 0.2s;cursor:pointer;}
        .pd-breadcrumb a:hover{color:var(--bob);}
        .pd-breadcrumb span{color:#ccc;}

        .pd-main{max-width:1400px;margin:0 auto;padding:0 2rem 4rem;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start;}

        .pd-gallery{position:sticky;top:100px;}
        .pd-main-img-wrap{position:relative;background:var(--off);border-radius:8px;overflow:hidden;aspect-ratio:1;margin-bottom:0.8rem;}
        .pd-main-img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;}
        .pd-main-img-wrap:hover .pd-main-img{transform:scale(1.04);}
        .pd-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;}
        .pd-discount-badge{position:absolute;top:1rem;right:1rem;background:var(--black);color:white;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:3px;}
        .pd-thumbs{display:flex;gap:0.6rem;flex-wrap:wrap;}
        .pd-thumb{width:68px;height:68px;border-radius:5px;overflow:hidden;cursor:pointer;border:2px solid transparent;transition:border-color 0.2s;}
        .pd-thumb.active{border-color:var(--bob);}
        .pd-thumb img{width:100%;height:100%;object-fit:cover;}

        .pd-info{animation:fadeIn 0.5s ease both;}
        .pd-brand{font-size:0.7rem;letter-spacing:0.22em;text-transform:uppercase;color:#aaa;font-weight:600;display:block;margin-bottom:0.4rem;}
        .pd-name{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,3vw,2.6rem);color:var(--black);font-weight:700;line-height:1.2;margin-bottom:0.75rem;}
        .pd-rating-row{display:flex;align-items:center;gap:0.6rem;margin-bottom:1.2rem;}
        .pd-rating-count{font-size:0.78rem;color:#aaa;}

        .pd-section-tabs{display:flex;border:1.5px solid var(--border);border-radius:6px;overflow:hidden;margin-bottom:1.4rem;}
        .pd-section-tab{flex:1;padding:0.7rem;background:none;border:none;font-family:'Tajawal',sans-serif;font-size:0.88rem;font-weight:500;color:#aaa;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.4rem;transition:all 0.2s;}
        .pd-section-tab:first-child{border-left:1.5px solid var(--border);}
        .pd-section-tab.active{background:var(--bob);color:white;font-weight:700;}

        .pd-crosslink{display:flex;align-items:center;gap:0.6rem;background:rgba(69,40,41,0.06);border:1px solid rgba(69,40,41,0.2);border-radius:6px;padding:0.7rem 1rem;margin-bottom:1.2rem;cursor:pointer;transition:background 0.2s;}
        .pd-crosslink:hover{background:rgba(69,40,41,0.1);}
        .pd-crosslink-text{font-size:0.82rem;color:var(--bob);flex:1;}

        .pd-price-block{margin-bottom:1.4rem;}
        .pd-price{font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--bob);}
        .pd-price-original{font-size:1rem;color:#bbb;text-decoration:line-through;margin-right:0.6rem;}
        .pd-price-sub{font-size:0.78rem;color:#aaa;margin-top:0.2rem;display:block;}

        .pd-sizes-label{font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-bottom:0.6rem;display:block;}
        .pd-sizes{display:flex;gap:0.6rem;flex-wrap:wrap;margin-bottom:1.4rem;}
        .pd-size-btn{padding:0.5rem 1rem;border:1.5px solid var(--border);border-radius:5px;background:white;font-family:'Tajawal',sans-serif;font-size:0.85rem;color:var(--black);cursor:pointer;transition:all 0.2s;}
        .pd-size-btn:hover{border-color:var(--bob);}
        .pd-size-btn.active{border-color:var(--bob);background:var(--bob);color:white;font-weight:700;}

        .pd-bottle-info{display:flex;gap:1.5rem;margin-bottom:1.4rem;padding:0.9rem 1rem;background:var(--off);border-radius:6px;}
        .pd-bi-item{display:flex;flex-direction:column;gap:2px;}
        .pd-bi-label{font-size:0.68rem;color:#aaa;letter-spacing:0.06em;text-transform:uppercase;}
        .pd-bi-val{font-size:0.9rem;font-weight:600;color:var(--black);}

        .pd-guest-note{font-size:0.78rem;color:#b5620a;background:#fff7ed;border:1px solid #fde8c8;border-radius:5px;padding:0.5rem 0.85rem;margin-bottom:1rem;}

        .pd-actions{display:flex;gap:0.8rem;margin-bottom:1.4rem;flex-wrap:wrap;}
        .pd-qty{display:flex;align-items:center;border:1.5px solid var(--border);border-radius:5px;overflow:hidden;}
        .pd-qty-btn{background:none;border:none;width:38px;height:44px;cursor:pointer;font-size:1.1rem;color:var(--black);transition:background 0.2s;display:flex;align-items:center;justify-content:center;}
        .pd-qty-btn:hover{background:var(--off);}
        .pd-qty-num{width:44px;text-align:center;font-size:0.95rem;font-weight:600;color:var(--black);}
        .pd-add-btn{flex:1;background:var(--bob);color:white;border:none;padding:0 1.5rem;height:44px;font-family:'Tajawal',sans-serif;font-size:0.95rem;font-weight:700;cursor:pointer;border-radius:5px;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:background 0.2s;min-width:160px;}
        .pd-add-btn:hover:not(:disabled){background:var(--bob-l);}
        .pd-add-btn.success{background:#2e7d5a;}
        .pd-share-btn{width:44px;height:44px;border:1.5px solid var(--border);border-radius:5px;background:white;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#888;transition:all 0.2s;}
        .pd-share-btn:hover{border-color:#ccc;color:var(--black);}

        .pd-meta{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.4rem;}
        .pd-meta-badge{font-size:0.7rem;font-weight:700;padding:0.22rem 0.7rem;border-radius:20px;letter-spacing:0.04em;}
        .mb-arabic{background:rgba(69,40,41,0.1);color:var(--bob);}
        .mb-western{background:#eff4ff;color:#1e4db7;}
        .mb-gender{background:#f5f5f5;color:#666;}
        .mb-family{background:#f0fdf4;color:#2e7d5a;}

        .pd-desc-title{font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-bottom:0.5rem;}
        .pd-desc{font-size:0.92rem;color:#555;line-height:1.85;margin-bottom:1.4rem;}

        .pd-reviews{max-width:1400px;margin:0 auto;padding:0 2rem 4rem;}
        .pd-reviews-title{font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--black);font-weight:700;margin-bottom:2rem;display:flex;align-items:center;gap:0.8rem;}
        .pd-reviews-title::after{content:'';flex:1;height:1px;background:var(--border);}
        .pd-reviews-layout{display:grid;grid-template-columns:1fr 1fr;gap:3rem;}

        .review-list{display:flex;flex-direction:column;gap:1.2rem;}
        .review-item{background:var(--off);border-radius:8px;padding:1.2rem;}
        .review-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;}
        .review-author{font-weight:600;color:var(--black);font-size:0.9rem;}
        .review-date{font-size:0.72rem;color:#aaa;}
        .review-comment{font-size:0.88rem;color:#555;line-height:1.7;margin-top:0.4rem;}
        .reviews-empty{text-align:center;padding:2rem;color:#aaa;font-size:0.9rem;}

        .review-form-title{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--black);font-weight:600;margin-bottom:1.2rem;}
        .rf-field{display:flex;flex-direction:column;gap:0.35rem;margin-bottom:1rem;}
        .rf-label{font-size:0.72rem;font-weight:700;color:#aaa;letter-spacing:0.08em;text-transform:uppercase;}
        .rf-textarea{background:white;border:1.5px solid var(--border);color:var(--black);font-family:'Tajawal',sans-serif;font-size:0.9rem;padding:0.7rem 0.9rem;border-radius:5px;outline:none;resize:vertical;min-height:100px;transition:border-color 0.2s;width:100%;box-sizing:border-box;}
        .rf-textarea:focus{border-color:var(--bob);}
        .rf-error{font-size:0.8rem;color:#c0392b;background:#fef2f2;border:1px solid #fecaca;padding:0.5rem 0.75rem;border-radius:4px;margin-bottom:0.75rem;}
        .rf-submit{background:var(--bob);color:white;border:none;padding:0.7rem 1.8rem;font-family:'Tajawal',sans-serif;font-size:0.9rem;font-weight:700;border-radius:5px;cursor:pointer;display:flex;align-items:center;gap:0.4rem;transition:background 0.2s;}
        .rf-submit:hover:not(:disabled){background:var(--bob-l);}
        .rf-submit:disabled{opacity:0.6;cursor:not-allowed;}
        .rf-login-prompt{font-size:0.85rem;color:#aaa;padding:1rem;background:var(--off);border-radius:6px;text-align:center;}
        .rf-login-prompt a{color:var(--bob);font-weight:700;text-decoration:none;}

        @media(max-width:900px){
          .pd-main{grid-template-columns:1fr;gap:2rem;}
          .pd-gallery{position:static;}
          .pd-reviews-layout{grid-template-columns:1fr;}
          .pd-breadcrumb,.pd-main,.pd-reviews{padding-right:1rem;padding-left:1rem;}
          .pd-back-btn{margin:1rem 1rem 0.5rem;}
        }
      `}</style>

      <button className="pd-back-btn" onClick={() => navigate("/shop")}>
        <ArrowRight size={14} /> العودة للمتجر
      </button>

      <nav className="pd-breadcrumb">
        <a onClick={() => navigate("/")}>الرئيسية</a>
        <span>/</span>
        <a onClick={() => navigate("/shop")}>المتجر</a>
        <span>/</span>
        <span style={{ color: "#452829" }}>{perfume.name}</span>
      </nav>

      <div className="pd-main">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-img-wrap">
            {mainImg ? (
              <img loading="lazy" src={mainImg} alt={perfume.name} className="pd-main-img" />
            ) : (
              <div className="pd-img-ph">
                <Package size={64} strokeWidth={0.8} />
              </div>
            )}
            {perfume.discount > 0 && (
              <span className="pd-discount-badge">-{perfume.discount}%</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`pd-thumb ${selectedImg === i ? "active" : ""}`}
                  onClick={() => setSelectedImg(i)}
                >
                  <img loading="lazy" src={img.url} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <span className="pd-brand">{perfume.brand}</span>
          <h1 className="pd-name">{perfume.name}</h1>

          <div className="pd-rating-row">
            <StarRating value={Math.round(perfume.rating ?? 0)} readonly />
            <span className="pd-rating-count">
              ({perfume.reviewCount ?? 0} تقييم)
            </span>
          </div>

          {isBoth && (
            <div className="pd-section-tabs">
              <button
                className={`pd-section-tab ${activeSection === "full" ? "active" : ""}`}
                onClick={() => switchSection("full")}
              >
                <Package size={15} /> قارورة كاملة
              </button>
              <button
                className={`pd-section-tab ${activeSection === "taqseem" ? "active" : ""}`}
                onClick={() => switchSection("taqseem")}
              >
                <Layers size={15} /> تقسيمة
              </button>
            </div>
          )}

          {isBoth && (
            <div
              className="pd-crosslink"
              onClick={() =>
                switchSection(activeSection === "full" ? "taqseem" : "full")
              }
            >
              <ArrowLeftRight size={16} color="#452829" />
              <span className="pd-crosslink-text">
                {activeSection === "full"
                  ? "هذا العطر متوفر أيضاً كتقسيمة — انقر للتبديل"
                  : "هذا العطر متوفر أيضاً كقارورة كاملة — انقر للتبديل"}
              </span>
              <ChevronLeft size={15} className="pd-crosslink-arrow" />
            </div>
          )}

          <div className="pd-price-block">
            <div>
              {originalPrice && (
                <span className="pd-price-original">₪{originalPrice}</span>
              )}
              <span className="pd-price">
                {displayPrice != null ? `₪${displayPrice}` : "—"}
              </span>
            </div>
            {activeSection === "full" && perfume.fullBottle?.size_ml && (
              <span className="pd-price-sub">
                قارورة {perfume.fullBottle.size_ml} مل
              </span>
            )}
            {activeSection === "taqseem" &&
              perfume.taqseem?.sourceBottle_ml && (
                <span className="pd-price-sub">
                  تقسيمات من قارورة {perfume.taqseem.sourceBottle_ml} مل
                </span>
              )}
          </div>

          {activeSection === "taqseem" &&
            perfume.taqseem?.sizes?.length > 0 && (
              <>
                <span className="pd-sizes-label">اختر الحجم</span>
                <div className="pd-sizes">
                  {perfume.taqseem.sizes.map((s) => (
                    <button
                      key={s.ml}
                      className={`pd-size-btn ${selectedSize?.ml === s.ml ? "active" : ""}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s.ml} مل — ₪{s.price}
                    </button>
                  ))}
                </div>
              </>
            )}

          {activeSection === "full" &&
            perfume.fullBottle &&
            (perfume.fullBottle.size_ml || perfume.discount > 0) && (
              <div className="pd-bottle-info">
                {perfume.fullBottle.size_ml && (
                  <div className="pd-bi-item">
                    <span className="pd-bi-label">الحجم</span>
                    <span className="pd-bi-val">
                      {perfume.fullBottle.size_ml} مل
                    </span>
                  </div>
                )}
                {perfume.discount > 0 && (
                  <div className="pd-bi-item">
                    <span className="pd-bi-label">الخصم</span>
                    <span className="pd-bi-val" style={{ color: "#b5620a" }}>
                      {perfume.discount}%
                    </span>
                  </div>
                )}
              </div>
            )}

          <div className="pd-guest-note">
            🛍 لا تحتاج لتسجيل دخول — أضف للسلة وأدخل بياناتك عند الطلب
          </div>

          <div className="pd-actions">
            <div className="pd-qty">
              <button
                className="pd-qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="pd-qty-num">{qty}</span>
              <button
                className="pd-qty-btn"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
            <button
              className={`pd-add-btn ${cartMsg ? "success" : ""}`}
              onClick={handleAddToCart}
            >
              {cartMsg ? <CheckCircle size={16} /> : <ShoppingBag size={16} />}
              {cartMsg || "أضف للسلة"}
            </button>
            {cartMsg && (
              <button
                className="pd-add-btn"
                style={{
                  background: "#1a1a1a",
                  minWidth: "auto",
                  padding: "0 1rem",
                }}
                onClick={() => navigate("/cart")}
              >
                عرض السلة
              </button>
            )}
            <button
              className="pd-share-btn"
              title={inWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              onClick={handleWishlist}
              disabled={loadingWishlist}
              style={{ color: inWishlist ? "#452829" : undefined }}
            >
              {loadingWishlist ? (
                <Loader2
                  size={15}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Heart size={17} fill={inWishlist ? "#452829" : "none"} />
              )}
            </button>
            {wishlistMsg && (
              <span
                style={{
                  fontSize: "0.78rem",
                  color: inWishlist ? "#452829" : "#888",
                  alignSelf: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {wishlistMsg}
              </span>
            )}
            <button
              className="pd-share-btn"
              onClick={() =>
                navigator.clipboard?.writeText(window.location.href)
              }
            >
              <Share2 size={17} />
            </button>
          </div>

          <div className="pd-meta">
            <span
              className={`pd-meta-badge ${perfume.perfumeType === "arabic" ? "mb-arabic" : "mb-western"}`}
            >
              {perfume.perfumeType === "arabic" ? "عربي" : "أجنبي"}
            </span>
            <span className="pd-meta-badge mb-gender">
              {perfume.gender === "male"
                ? "رجالي"
                : perfume.gender === "female"
                  ? "نسائي"
                  : "مشترك"}
            </span>
            {perfume.fragranceFamily && (
              <span className="pd-meta-badge mb-family">
                {perfume.fragranceFamily}
              </span>
            )}
            <span
              className="pd-meta-badge"
              style={{ background: "#f5f5f5", color: "#888" }}
            >
              {availLabel[perfume.availability]}
            </span>
          </div>

          <div className="pd-desc-title">الوصف</div>
          <p className="pd-desc">{perfume.description}</p>
        </div>
      </div>

      {/* Reviews */}
      <div className="pd-reviews">
        <h2 className="pd-reviews-title">التقييمات والمراجعات</h2>
        <div className="pd-reviews-layout">
          <div>
            {perfume.reviews?.length > 0 ? (
              <div className="review-list">
                {perfume.reviews.map((r, i) => (
                  <div key={i} className="review-item">
                    <div className="review-header">
                      <span className="review-author">{r.name}</span>
                      <span className="review-date">
                        {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                    <StarRating value={r.rating} readonly />
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="reviews-empty">
                <Star size={32} strokeWidth={1} color="#ccc" />
                <p style={{ marginTop: "0.75rem" }}>
                  لا توجد تقييمات بعد. كن أول من يقيّم!
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="review-form-title">أضف تقييمك</h3>
            {getToken() ? (
              <form onSubmit={handleReview}>
                <div className="rf-field">
                  <span className="rf-label">التقييم</span>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div className="rf-field">
                  <span className="rf-label">تعليقك</span>
                  <textarea
                    className="rf-textarea"
                    placeholder="شاركنا رأيك بهذا العطر..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>
                {reviewError && <div className="rf-error">{reviewError}</div>}
                <button
                  type="submit"
                  className="rf-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2
                      size={15}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Send size={15} />
                  )}
                  {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
                </button>
              </form>
            ) : (
              <div className="rf-login-prompt">
                يجب <a href="/auth">تسجيل الدخول</a> لإضافة تقييم
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}