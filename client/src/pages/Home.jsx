import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Eye,
  ChevronLeft,
  ChevronRight,
  Award,
  Zap,
} from "lucide-react";
import yslbg from "./../assets/yslbg2.webp";
import dolcegabbana from "./../assets/dolce&gabbana.webp";

const API = import.meta.env.VITE_API_URL || "/api";;
const THEME = {
  primary: "#1A1A1A",
  accent: "#9D8461",
  bg: "#FDFDFD",
  surface: "#F8F5F2",
  text: "#222222",
  muted: "#8A817C",
  border: "#E8E2DD",
};

/* ── HELPERS ─────────────────────────────────────────────────────────────── */
function getPrice(p) {
  if (p.availability === "taqseem_only") {
    const sizes = p.taqseem?.sizes || [];
    return sizes.length ? Math.min(...sizes.map((s) => s.price)) : null;
  }
  const base = p.fullBottle?.price;
  return p.discount ? +(base * (1 - p.discount / 100)).toFixed(0) : base;
}

/* ── PRODUCT CARD ────────────────────────────────────────────────────────── */
const ProductCard = ({ p, index }) => {
  const navigate = useNavigate();
  const price = getPrice(p);

  return (
    <div className="stagger-card" style={{ "--i": index }}>
      <div className="img-wrapper">
        <img
          src={p.images?.[0]?.url || "https://via.placeholder.com/600"}
          alt={p.name}
          loading="lazy"
        />
        <div className="card-hover-actions">
          <button
            className="action-pill primary-action"
            onClick={() => navigate(`/product/${p.slug || p._id}`)}
          >
            <Eye size={16} /> التفاصيل
          </button>
        </div>
        {p.discount > 0 && <div className="discount-tag">-{p.discount}%</div>}
      </div>

      <div
        className="card-meta"
        onClick={() => navigate(`/product/${p.slug || p._id}`)}
        style={{ cursor: "pointer" }}
      >
        <span className="brand-label">{p.brand}</span>
        <h3 className="item-name">{p.name}</h3>
        <div className="price-wrap">
          <span className="main-price">₪{price}</span>
          {p.discount > 0 && (
            <span className="old-price">₪{p.fullBottle?.price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroSlides = [
    {
      title: "عطورٌ تُترجم الفخامة",
      desc: "تشكيلةٌ آسرة تجمع دفء النفحات الشرقية برقيّ اللمسات العصرية",
      img: yslbg,
      accent: "#C4A882",
    },
    {
      title: "تفاصيل صغيرة… حضور لا يُنسى",
      desc: "عطور منتقاة بعناية لتمنحك لمسة فريدة تعبّر عنك في كل وقت.",
      img: dolcegabbana,
      accent: "#A8896C",
    },
  ];

  const brands = [
    {
      name: "Tom Ford",
      img: "https://images.seeklogo.com/logo-png/38/2/tom-ford-logo-png_seeklogo-383930.png",
      query: "/brands?brand=Tom+Ford",
    },
    {
      name: "Xerjoff",
      img: "https://vesaura.com/cdn/shop/files/Xerjoff_Logo.png?v=1729180705&width=1500",
      query: "/brands?brand=Xerjoff",
    },
    {
      name: "Jean Paul",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjhUV9_E4Cod0wyNN8EMEG0NsFQhUR-1O-_w&s",
      query: "/brands?brand=Jean+Paul",
    },
    {
      name: "Valentino",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuM-qtpaBSEOid4tieSWJyjgLifmNnDlU1pQ&s",
      query: "/brands?brand=Valentino",
    },
    {
      name: "YSL",
      img: "https://logoeps.com/wp-content/uploads/2012/10/yves-saint-laurent-logo-vector.png",
      query: "/brands?brand=YSL",
    },
    {
      name: "Versace",
      img: "https://cdn.worldvectorlogo.com/logos/versace-medusa.svg",
      query: "/brands?brand=Versace",
    },
    {
      name: "Burberry",
      img: "https://static.vecteezy.com/system/resources/thumbnails/014/414/693/small/burberry-old-logo-on-transparent-background-free-vector.jpg",
      query: "/brands?brand=Burberry",
    },
    {
      name: "Gucci",
      img: "https://1000logos.net/wp-content/uploads/2017/01/Gucci-Logo.jpg",
      query: "/brands?brand=Gucci",
    },
  ];

  useEffect(() => {
    fetch(`${API}/perfumes?isFeatured=true&limit=6&isActive=true`)
      .then((r) => r.json())
      .then((data) => setFeatured(data.perfumes || data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const next = () => setCurrent((current + 1) % heroSlides.length);
  const prev = () =>
    setCurrent((current - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="page-smooth-scroll">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;600&display=swap');

        :root { --accent: #9D8461; --text: #222222; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FDFDFD; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text); direction: rtl; }

        h1, h2 { font-family: 'Playfair Display', serif; }

        /* ── HERO ── */
        .hero-v3 { height: 85vh; min-height: 600px; position: relative; overflow: hidden; background: #000; display: flex; align-items: center; }
        .hero-bg { position: absolute; inset: 0; }
        .hero-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.65; transition: 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 70%); }
        .hero-inner { position: relative; z-index: 2; width: 100%; padding: 0 8%; color: white; }
        .hero-title { font-size: clamp(2rem, 5vw, 3rem); line-height: 1.1; margin-bottom: 1.5rem; }
        .hero-eyebrow { color: var(--accent); letter-spacing: 4px; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 1rem; display: block; }
        .hero-p { opacity: 0.7; font-size: 1rem; line-height: 1.8; margin-bottom: 2.5rem; max-width: 500px; font-weight: 300; }

        /* ── BUTTONS ── */
        .btn-primary { padding: 1.1rem 2.2rem; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 12px; transition: 0.3s; background: var(--accent); color: white; border-radius: 2px; }
        .btn-primary:hover { background: white; color: black; transform: translateY(-2px); }
        .btn-shop-full { margin: 40px auto 0; background: #452829; border: 1px solid #452829; color: white; }
        .btn-shop-full:hover { background: white !important; color: #452829 !important; border-color: #452829; }

        .hero-nav-dots { position: absolute; bottom: 50px; left: 8%; display: flex; gap: 20px; align-items: center; }
        .dot-btn { background: none; border: 1px solid rgba(255,255,255,0.2); color: white; cursor: pointer; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .dot-btn:hover { background: white; color: black; }

        /* ── BRAND STRIP ── */
        .brand-strip { background: white; padding: 80px 0; border-bottom: 1px solid #E8E2DD; margin-top: -50px; position: relative; z-index: 5; border-radius: 50px 50px 0 0; }
        .brand-grid { display: flex; justify-content: center; align-items: center; gap: 5vw; flex-wrap: wrap; padding: 0 8%; }
        .brand-grid img { height: 60px; filter: grayscale(1); opacity: 0.6; transition: 0.4s; cursor: pointer; }
        .brand-grid img:hover { filter: grayscale(0); opacity: 1; transform: scale(1.1); }

        /* ── FEATURED SECTION ── */
        .featured-wrap { background: #F8F5F2; padding: 120px 8%; border-radius: 0 0 50px 50px; }
        .section-head { margin-bottom: 60px; text-align: center; }
        .section-head h2 { font-size: 2.8rem; font-family: 'Amiri', serif; }
        .section-head p { color: var(--accent); letter-spacing: 2px; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }

        /* ── PRODUCT GRID ── */
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 35px; }

        /* ── CARD ── */
        .img-wrapper { aspect-ratio: 0.8; background: #fff; overflow: hidden; position: relative; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .img-wrapper img { width: 100%; height: 100%; object-fit: contain; padding: 20px; transition: 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .card-hover-actions { position: absolute; inset: 0; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.4s; }
        .stagger-card:hover .card-hover-actions { opacity: 1; }
        .stagger-card:hover img { transform: scale(1.08); }
        .action-pill { width: 70%; padding: 12px; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s; font-size: 0.85rem; background: #111; color: white; }
        .action-pill:hover { background: var(--accent); }

        .card-meta { padding: 20px 0; text-align: center; }
        .brand-label { font-size: 0.7rem; color: var(--accent); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 5px; }
        .item-name { font-family: 'Amiri', serif; font-size: 1.1rem; color: #1a1a1a; margin-bottom: 8px; }
        .price-wrap { font-family: 'Playfair Display', serif; display: flex; justify-content: center; gap: 12px; }
        .main-price { font-weight: 700; font-size: 1.1rem; }
        .old-price { text-decoration: line-through; color: #BBB; font-size: 0.95rem; }
        .discount-tag { position: absolute; top: 15px; left: 15px; background: #B44; color: white; padding: 4px 10px; font-size: 0.7rem; font-weight: 700; border-radius: 2px; }

        /* ── TRUST PILLARS (CENTERED) ── */
        .trust-section { background: #ffffff; padding: 100px 8%; }
        .trust-connect { 
            display: flex; 
            justify-content: center; 
            gap: 40px; 
            max-width: 1000px; 
            margin: 0 auto; 
        }
        .trust-box { 
            flex: 1; 
            max-width: 400px; 
            text-align: center; 
            padding: 50px 30px; 
            border: 1px solid #F0EBE6; 
            border-radius: 4px;
            transition: 0.4s;
        }
        .trust-box:hover { 
            transform: translateY(-10px); 
            border-color: var(--accent); 
            box-shadow: 0 20px 40px rgba(157, 132, 97, 0.08); 
        }
        .icon-circ { 
            width: 65px; height: 65px; border-radius: 50%; background: #F9F7F5; 
            display: flex; align-items: center; justify-content: center; 
            margin: 0 auto 25px; color: var(--accent); border: 1px solid #E8E2DD;
            transition: 0.3s;
        }
        .trust-box:hover .icon-circ { background: var(--accent); color: white; border-color: var(--accent); }
        .trust-box h4 { font-family: 'Amiri', serif; font-size: 1.5rem; margin-bottom: 12px; color: #111; }
        .trust-box p { font-size: 0.95rem; color: #666; line-height: 1.7; }

        /* ══════════════════════════════════════════════════════════════
           MOBILE RESTORATION (≤ 600px)
           ══════════════════════════════════════════════════════════════ */
        @media (max-width: 600px) {
          /* Hero Restored */
          .hero-v3 { height: 60vh; min-height: 380px; }
          .hero-inner { padding: 0 4%; }
          .hero-eyebrow { font-size: 0.58rem; letter-spacing: 1.5px; margin-bottom: 0.4rem; }
          .hero-title { font-size: 1.4rem; margin-bottom: 0.65rem; line-height: 1.15; }
          .hero-p { font-size: 0.74rem; margin-bottom: 1.1rem; line-height: 1.55; }
          .btn-primary { padding: 0.6rem 1rem; font-size: 0.76rem; gap: 6px; }
          .hero-nav-dots { left: 4%; bottom: 14px; gap: 8px; }
          .dot-btn { width: 28px; height: 28px; }

          /* Brand Strip Restored */
          .brand-strip { padding: 22px 0; margin-top: -10px; border-radius: 12px 12px 0 0; }
          .brand-grid { gap: 3vw; padding: 0 4%; }
          .brand-grid img { height: 24px; }

          /* Featured Section Restored */
          .featured-wrap { padding: 28px 3% 36px; border-radius: 0 0 12px 12px; }
          .section-head { margin-bottom: 16px; }
          .section-head h2 { font-size: 1.25rem; }
          .section-head p { font-size: 0.58rem; letter-spacing: 1px; }

          /* Product Grid Restored */
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 7px; }
          .img-wrapper { aspect-ratio: 1 / 1; border-radius: 5px; }
          .img-wrapper img { padding: 8px; }
          .card-meta { padding: 6px 2px 4px; }
          .brand-label { font-size: 0.52rem; }
          .item-name { font-size: 0.72rem; }
          .main-price { font-size: 0.78rem; }
          .old-price { font-size: 0.65rem; }

          /* Trust Section Corrected */
          .trust-section { padding: 40px 4%; }
          .trust-connect { flex-direction: column; gap: 15px; }
          .trust-box { padding: 30px 20px; max-width: 100%; width: 100%; }
          .icon-circ { width: 45px; height: 45px; margin-bottom: 15px; }
          .trust-box h4 { font-size: 1.1rem; margin-bottom: 8px; }
          .trust-box p { font-size: 0.8rem; }
        }

        @media (min-width: 601px) and (max-width: 768px) {
          .products-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
          .trust-connect { flex-direction: column; align-items: center; }
          .hero-title { font-size: 2.5rem; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero-v3">
        <div className="hero-bg">
          <img src={heroSlides[current].img} alt="" key={current} />

          <div
            className="hero-overlay"
            style={{
              background: `linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)`,
            }}
          />
        </div>
        <div className="hero-inner">
          <div className="hero-content-box">
            <span
              className="hero-eyebrow"
              style={{ color: heroSlides[current].accent }}
            >
              {heroSlides[current].tag}
            </span>
            <h1 className="hero-title">{heroSlides[current].title}</h1>
            <p className="hero-p">{heroSlides[current].desc}</p>
            <button className="btn-primary" onClick={() => navigate("/shop")}>
              استكشف المتجر <ArrowLeft size={18} />
            </button>
          </div>
        </div>
        <div className="hero-nav-dots">
          <button className="dot-btn" onClick={prev}>
            <ChevronRight size={20} />
          </button>
          <div
            style={{
              width: 80,
              height: 1,
              background: "rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                width: current === 0 ? "50%" : "100%",
                height: "100%",
                background: THEME.accent,
                transition: "0.6s",
              }}
            />
          </div>
          <button className="dot-btn" onClick={next}>
            <ChevronLeft size={20} />
          </button>
        </div>
      </section>

      {/* ── BRAND STRIP ── */}
      <div className="brand-strip">
        <div className="brand-grid">
          {brands.map((b) => (
            <img
              key={b.name}
              src={b.img}
              alt={b.name}
              onClick={() => navigate(b.query)}
            />
          ))}
        </div>
      </div>

      {/* ── FEATURED COLLECTION ── */}
      <section className="featured-wrap">
        <div className="section-head">
          <p>Curated Selection</p>
          <h2 className="section-title">المجموعة المختارة</h2>
        </div>

        <div className="products-grid">
          {loading
            ? [1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{ height: 400, background: "#eee", borderRadius: 8 }}
                />
              ))
            : featured.map((p, i) => (
                <ProductCard key={p._id} p={p} index={i} />
              ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            className="btn-primary btn-shop-full"
            onClick={() => navigate("/shop")}
          >
            تصفح المتجر كاملاً
          </button>
        </div>
      </section>

      {/* ── TRUST PILLARS ── */}
      <section className="trust-section">
        <div className="trust-connect">
          <div className="trust-box">
            <div className="icon-circ">
              <Award size={28} />
            </div>
            <h4>ضمان الجودة</h4>
            <p>نضمن أن كل زجاجة هي منتج أصلي 100% من المصدر مباشرة.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
