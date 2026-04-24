

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, ShoppingBag, Eye,
  ChevronLeft, ChevronRight, Award, Zap,
} from "lucide-react";
import yslbg from "./../assets/yslbg.png";
import boisbg from "./../assets/boisimpbg.png"

const API = "/api";
const THEME = {
  primary: "#1A1A1A",
  accent: "#9D8461",
  bg: "#FDFDFD",
  surface: "#F8F5F2", 
  text: "#222222",
  muted: "#8A817C",
  border: "#E8E2DD"
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

/* ── RESTORED PRODUCT CARD WITH HOVER ACTIONS ─────────────────────────────── */
const ProductCard = ({ p, index }) => {
  const navigate = useNavigate();
  const price = getPrice(p);

  return (
    <div 
      className="stagger-card" 
      style={{ "--i": index }}
    >
      <div className="img-wrapper">
        <img src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80"} alt={p.name} loading="lazy" />
        
        {/* Restore Hover Actions */}
        <div className="card-hover-actions">
          <button className="action-pill primary-action" onClick={() => navigate(`/product/${p.slug || p._id}`)}>
            <Eye size={16} /> التفاصيل
          </button>
        </div>

        {p.discount > 0 && <div className="discount-tag">-{p.discount}%</div>}
      </div>

      <div className="card-meta" onClick={() => navigate(`/product/${p.slug || p._id}`)} style={{ cursor: 'pointer' }}>
        <span className="brand-label">{p.brand}</span>
        <h3 className="item-name">{p.name}</h3>
        <div className="price-wrap">
          <span className="main-price">₪{price}</span>
          {p.discount > 0 && <span className="old-price">₪{p.fullBottle?.price}</span>}
        </div>
      </div>
    </div>
  );
};

/* ── HOME PAGE ───────────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroSlides = [
    { tag: "Exclusive Collection", title: "خيالٌ يفيضُ بالأناقة", desc: "مجموعة من العطور الفاخرة التي تمزج بين سحر الشرق وعصريّة الغرب.", img: yslbg },
    { tag: "Niche Selection", title: "لغةُ الحواسِ الصامتة", desc: "اكتشف تركيباتنا النادرة من Tom Ford و Roja Dove المصممة للنخبة.", img: boisbg },
  ];

  const brands = [
    { name: "Tom Ford",  img: "https://images.seeklogo.com/logo-png/38/2/tom-ford-logo-png_seeklogo-383930.png", query: "/brands?brand=Tom+Ford" },
    { name: "Xerjoff",   img: "https://vesaura.com/cdn/shop/files/Xerjoff_Logo.png?v=1729180705&width=1500", query: "/brands?brand=Xerjoff" },
    { name: "Jean Paul", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjhUV9_E4Cod0wyNN8EMEG0NsFQhUR-1O-_w&s", query: "/brands?brand=Jean+Paul" },
    { name: "Valentino", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuM-qtpaBSEOid4tieSWJyjgLifmNnDlU1pQ&s", query: "/brands?brand=Valentino" },
    { name: "YSL",       img: "https://logoeps.com/wp-content/uploads/2012/10/yves-saint-laurent-logo-vector.png", query: "/brands?brand=YSL" },
    { name: "Versace",   img: "https://cdn.worldvectorlogo.com/logos/versace-medusa.svg", query: "/brands?brand=Versace" },
    { name: "Burberry",  img: "https://static.vecteezy.com/system/resources/thumbnails/014/414/693/small/burberry-old-logo-on-transparent-background-free-vector.jpg", query: "/brands?brand=Burberry" },
    { name: "Gucci",     img: "https://1000logos.net/wp-content/uploads/2017/01/Gucci-Logo.jpg", query: "/brands?brand=Gucci" },
  ];

  useEffect(() => {
    fetch(`${API}/perfumes?isFeatured=true&limit=6&isActive=true`)
      .then(r => r.json())
      .then(data => setFeatured(data.perfumes || data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const next = () => setCurrent((current + 1) % heroSlides.length);
  const prev = () => setCurrent((current - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="page-smooth-scroll">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;600&display=swap');

        :root { --accent: ${THEME.accent}; --text: ${THEME.text}; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${THEME.bg}; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text); direction: rtl; }
        
        h1, h2 { font-family: 'Playfair Display', serif; }

        /* ── HERO ── */
        .hero-v3 { height: 85vh; min-height: 600px; position: relative; overflow: hidden; background: #000; display: flex; align-items: center; }
        .hero-bg { position: absolute; inset: 0; }
        .hero-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.65; transition: 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 70%); }
        .hero-inner { position: relative; z-index: 2; width: 100%; padding: 0 8%; color: white; }
        .hero-title { font-size: clamp(2.2rem, 5vw, 4rem); line-height: 1.1; margin-bottom: 1.5rem; }
        .hero-eyebrow { color: var(--accent); letter-spacing: 4px; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 1rem; display: block; }
        .hero-p { opacity: 0.7; font-size: 1rem; line-height: 1.8; margin-bottom: 2.5rem; max-width: 500px; font-weight: 300; }

        /* ── BUTTONS ── */
        .btn-primary { padding: 1.1rem 2.2rem; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 12px; transition: 0.3s; background: var(--accent); color: white; border-radius: 2px; }
        .btn-primary:hover { background: white; color: black; transform: translateY(-2px); }

        .btn-shop-full { margin: 0 auto; background: #452829; border: 1px solid #452829; color: white; }
        .btn-shop-full:hover { background: white !important; color: #452829 !important; border-color: #452829; }

        .hero-nav-dots { position: absolute; bottom: 50px; left: 8%; display: flex; gap: 20px; align-items: center; }
        .dot-btn { background: none; border: 1px solid rgba(255,255,255,0.2); color: white; cursor: pointer; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .dot-btn:hover { background: white; color: black; }

        /* ── BRAND STRIP ── */
        .brand-strip { background: white; padding: 80px 0; border-bottom: 1px solid ${THEME.border}; margin-top: -50px; position: relative; z-index: 5; border-radius: 50px 50px 0 0; }
        .brand-grid { display: flex; justify-content: center; align-items: center; gap: 5vw; flex-wrap: wrap; padding: 0 8%; }
        .brand-grid img { height: 60px; filter: grayscale(1); opacity: 0.6; transition: 0.4s; cursor: pointer; }
        .brand-grid img:hover { filter: grayscale(0); opacity: 1; transform: scale(1.1); }

        /* ── FEATURED SECTION ── */
        .featured-wrap { background: ${THEME.surface}; padding: 120px 8%; border-radius: 0 0 50px 50px; }
        .section-head { margin-bottom: 60px; text-align: center; }
        .section-head h2 { font-size: 2.8rem; font-family: 'Amiri', serif; }
        .section-head p { color: var(--accent); letter-spacing: 2px; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }

        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 35px; }

        /* ── RE-ADDED HOVER ACTIONS & CARDS ── */
        .img-wrapper { aspect-ratio: 0.8; background: #fff; overflow: hidden; position: relative; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .img-wrapper img { width: 100%; height: 100%; object-fit: contain; padding: 20px; transition: 1s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .card-hover-actions { 
          position: absolute; inset: 0; background: rgba(0,0,0,0.05); 
          display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center;
          opacity: 0; transition: 0.4s; 
        }
        .stagger-card:hover .card-hover-actions { opacity: 1; }
        .stagger-card:hover img { transform: scale(1.08); }

        .action-pill { 
          width: 70%; padding: 12px; border: none; border-radius: 4px; font-weight: 600; 
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: 0.3s; font-size: 0.85rem; 
        }
        .primary-action { background: #111; color: white; }
        .secondary-action { background: white; color: #111; }
        .primary-action:hover { background: var(--accent); }
        .secondary-action:hover { background: #eee; }

        .card-meta { padding: 20px 0; text-align: center; }
        .brand-label { font-size: 0.7rem; color: var(--accent); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 5px; }
        
        /* Font Fixes */
        .item-name { font-family: 'Amiri', serif; font-size: 1.1rem; color: #1a1a1a; margin-bottom: 8px; }
        .price-wrap { font-family: 'Playfair Display', serif; display: flex; justify-content: center; gap: 12px; }
        .main-price { font-weight: 700; font-size: 1.1rem; color: #111; }
        .old-price { text-decoration: line-through; color: #BBB; font-size: 0.95rem; font-weight: 400; }
        .discount-tag { position: absolute; top: 15px; left: 15px; background: #B44; color: white; padding: 4px 10px; font-size: 0.7rem; font-weight: 700; border-radius: 2px; }

        /* ── TRUST PILLARS ── */
        .trust-connect { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; padding: 100px 8%; }
        .trust-box { text-align: center; }
        .icon-circ { width: 50px; height: 50px; border-radius: 50%; border: 1px solid ${THEME.border}; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; color: var(--accent); }
        .trust-box h4 { font-family: 'Playfair Display'; font-size: 1.3rem; margin-bottom: 12px; }
        .trust-box p { font-size: 0.85rem; opacity: 0.6; line-height: 1.8; }

        @media (max-width: 768px) {
          .products-grid { grid-template-columns: 1fr 1fr; }
          .trust-connect { grid-template-columns: 1fr; }
          .hero-title { font-size: 2.5rem; }
          .card-hover-actions { display: none; } /* Better mobile experience */
          @media(max-width:600px){
  /* Hero */
  .hero-v3{height:60vh;min-height:400px;}
  .hero-inner{padding:0 4%;}
  .hero-eyebrow{font-size:0.6rem;letter-spacing:1.5px;margin-bottom:0.5rem;}
  .hero-title{font-size:1.45rem;margin-bottom:0.75rem;line-height:1.15;}
  .hero-p{font-size:0.76rem;margin-bottom:1.2rem;line-height:1.6;}
  .btn-primary{padding:0.65rem 1.1rem;font-size:0.78rem;gap:8px;}
  .hero-nav-dots{left:4%;bottom:16px;gap:8px;}
  .dot-btn{width:30px;height:30px;}


  /* Featured section */
  .featured-wrap{padding:32px 4% 44px;border-radius:0 0 14px 14px;}
  .section-head{margin-bottom:20px;}
  .section-head h2{font-size:1.35rem;}
  .section-head p{font-size:0.62rem;}

  /* Product grid — 2 tight columns */
  .products-grid{grid-template-columns:repeat(2,1fr);gap:8px;}
  .img-wrapper{aspect-ratio:1;border-radius:5px;}
  .img-wrapper img{padding:10px;}
  .card-hover-actions{display:none;}
  .discount-tag{font-size:0.55rem;padding:2px 6px;top:6px;left:6px;}

  /* Card text */
  .card-meta{padding:8px 0 4px;}
  .brand-label{font-size:0.55rem;margin-bottom:2px;}
  .item-name{font-size:0.76rem;margin-bottom:4px;line-height:1.2;}
  .main-price{font-size:0.82rem;}
  .old-price{font-size:0.7rem;}

  /* Show more button */
  .btn-shop-full{padding:0.65rem 1.2rem;font-size:0.8rem;margin-top:48px;}

  /* Trust section */
  .trust-connect{grid-template-columns:1fr;padding:36px 4%;gap:16px;}
  .icon-circ{width:36px;height:36px;margin-bottom:12px;}
  .trust-box h4{font-size:0.95rem;}
  .trust-box p{font-size:0.75rem;line-height:1.6;}
}
      `}</style>

      {/* ── HERO ── */}
      <section className="hero-v3">
        <div className="hero-bg">
          <img src={heroSlides[current].img} alt="" key={current} />
          <div className="hero-overlay" />
        </div>
        <div className="hero-inner">
          <div className="hero-content-box">
            <span className="hero-eyebrow">{heroSlides[current].tag}</span>
            <h1 className="hero-title">{heroSlides[current].title}</h1>
            <p className="hero-p">{heroSlides[current].desc}</p>
            <button className="btn-primary" onClick={() => navigate("/shop")}>
              استكشف المتجر <ArrowLeft size={18} />
            </button>
          </div>
        </div>
        <div className="hero-nav-dots">
          <button className="dot-btn" onClick={prev}><ChevronRight size={20} /></button>
          <div style={{ width: 80, height: 1, background: 'rgba(255,255,255,0.2)' }}>
            <div style={{ width: current === 0 ? '50%' : '100%', height: '100%', background: THEME.accent, transition: '0.6s' }} />
          </div>
          <button className="dot-btn" onClick={next}><ChevronLeft size={20} /></button>
        </div>
      </section>

      {/* ── BRAND STRIP ── */}
      <div className="brand-strip">
        <div className="brand-grid">
          {brands.map(b => (
            <img key={b.name} src={b.img} alt={b.name} onClick={() => navigate(b.query)} />
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
            ? [1,2,3].map(n => <div key={n} style={{ height: 400, background: '#eee', borderRadius: 8 }} />)
            : featured.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)
          }
        </div>

        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <button className="btn-primary btn-shop-full" onClick={() => navigate("/shop")}>
            تصفح المتجر كاملاً
          </button>
        </div>
      </section>

      {/* ── TRUST PILLARS ── */}
      <section className="trust-connect">
        <div className="trust-box">
          <div className="icon-circ"><Award size={24} /></div>
          <h4>ضمان الجودة</h4>
          <p>نضمن أن كل زجاجة هي منتج أصلي 100%.</p>
        </div>
        <div className="trust-box">
          <div className="icon-circ"><Zap size={24} /></div>
          <h4>توصيل سريع</h4>
          <p>خدمة توصيل متميزة تصلك أينما كنت.</p>
        </div>
        <div className="trust-box">
          <div className="icon-circ"><Star size={24} /></div>
          <h4>تجربة VIP</h4>
          <p>استشارة عطرية لتدليل حواسك.</p>
        </div>
      </section>
    </div>
  );
}