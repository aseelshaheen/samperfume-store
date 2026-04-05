import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Star, Flame, Sparkles, ChevronLeft, ChevronRight, ShoppingBag, Eye } from "lucide-react";

/* ── DATA ──────────────────────────────────────────────────────────────── */
const featured = [
  { id: 1, name: "Bleu de Chanel", brand: "Chanel", price: 320, originalPrice: 380, rating: 4.9, reviews: 214, tag: "الأكثر مبيعاً", availability: "both",            img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80" },
  { id: 2, name: "Oud Wood",       brand: "Tom Ford", price: 580, originalPrice: null, rating: 4.8, reviews: 98,  tag: "جديد",        availability: "full_only",       img: "https://images.unsplash.com/photo-1588514912908-8ab4b1e97e07?w=600&q=80" },
  { id: 3, name: "Black Opium",    brand: "YSL",      price: 275, originalPrice: 310, rating: 4.7, reviews: 176, tag: "عرض خاص",     availability: "individual_only", img: "https://images.unsplash.com/photo-1592945403237-9530b7ab5f71?w=600&q=80" },
  { id: 4, name: "Sauvage Elixir", brand: "Dior",     price: 490, originalPrice: null, rating: 5.0, reviews: 67,  tag: "محدود",       availability: "both",            img: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&q=80" },
];

const categories = [
  { label: "عطور رجالية",  count: 84, img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80" },
  { label: "عطور نسائية", count: 96, img: "https://images.unsplash.com/photo-1569235186275-626cb53b83ce?w=600&q=80" },
  { label: "عطور مشتركة", count: 42, img: "https://images.unsplash.com/photo-1616949755610-8c9bbc08c4b2?w=600&q=80" },
  { label: "عود وبخور",   count: 28, img: "https://images.unsplash.com/photo-1600612253971-c56d1e0e9100?w=600&q=80" },
];

const heroSlides = [
  { headline: "عندما تصبح الرائحة هوية",      sub: "اكتشف مجموعتنا الحصرية من أرقى العطور العالمية",     cta: "تسوق الآن",        img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=1400&q=80" },
  { headline: "فن العطور الفاخرة",             sub: "من Tom Ford إلى Creed — كل ما تبحث عنه في مكان واحد", cta: "استكشف المجموعة", img: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=1400&q=80" },
  { headline: "قطرة تحكي قصة",                sub: "عطور مختارة بعناية لتعبّر عن شخصيتك الفريدة",         cta: "تعرف علينا",       img: "https://images.unsplash.com/photo-1588514912908-8ab4b1e97e07?w=1400&q=80" },
];

const availLabel = {
  both:            { text: "كاملة وفردية",    bg: "#452829" },
  full_only:       { text: "كاملة فقط",       bg: "#3a3a3a" },
  individual_only: { text: "فردية فقط",       bg: "#5a3535" },
};

/* ── STARS ─────────────────────────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          fill={i <= Math.round(rating) ? "#452829" : "none"}
          color={i <= Math.round(rating) ? "#452829" : "#ccc"} />
      ))}
    </div>
  );
}

/* ── PRODUCT CARD ──────────────────────────────────────────────────────── */
function ProductCard({ p }) {
  const [hovered, setHovered] = useState(false);
  const av = availLabel[p.availability];
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;

  return (
    <div className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className="card-img-wrap">
        <img src={p.img} alt={p.name} className="card-img"
          style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }} />
        <div className="card-tag">{p.tag}</div>
        {discount && <div className="card-discount">-{discount}%</div>}
        <div className={`card-actions ${hovered ? "visible" : ""}`}>
          <button className="card-action-btn"><Eye size={14} /><span>معاينة</span></button>
          <button className="card-action-btn primary"><ShoppingBag size={14} /><span>أضف للسلة</span></button>
        </div>
      </div>
      <div className="card-body">
        <span className="card-brand">{p.brand}</span>
        <h3 className="card-name">{p.name}</h3>
        <div className="card-meta">
          <Stars rating={p.rating} />
          <span className="card-reviews">({p.reviews})</span>
        </div>
        <span className="card-avail" style={{ background: av.bg }}>{av.text}</span>
        <div className="card-price-row">
          <span className="card-price">₪{p.price}</span>
          {p.originalPrice && <span className="card-original">₪{p.originalPrice}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── HOME ──────────────────────────────────────────────────────────────── */
export default function Home() {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef(null);

  const changeSlide = (dir) => {
    if (animating) return;
    setAnimating(true);
    setSlide(s => (s + dir + heroSlides.length) % heroSlides.length);
    setTimeout(() => setAnimating(false), 600);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => changeSlide(1), 5500);
    return () => clearInterval(intervalRef.current);
  }, []);

  const current = heroSlides[slide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Tajawal:wght@300;400;500;700&display=swap');

        :root {
          --bob: #452829;
          --bob-light: #6b3d3e;
          --black: #1a1a1a;
          --gray: #888;
          --border: #e8e2dc;
          --off: #faf8f6;
          --white: #ffffff;
        }

        * { box-sizing: border-box; }
        body { background: #ffffff; }

        /* ── HERO ── */
        .hero {
          position: relative;
          height: 88vh;
          min-height: 560px;
          overflow: hidden;
          background: #f0ebe5;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
        }

        .hero-bg img {
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.28;
          transition: opacity 0.5s ease;
        }

        /* Subtle warm gradient over image */
        .hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            rgba(250,248,246,0.92) 38%,
            rgba(240,235,229,0.5) 70%,
            transparent 100%
          );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 6%;
          padding-left: 2rem;
          max-width: 680px;
          animation: fadeUp 0.65s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--bob);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 600;
        }

        .hero-eyebrow::before {
          content: '';
          display: inline-block;
          width: 28px; height: 1.5px;
          background: var(--bob);
        }

        .hero-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          color: var(--black);
          line-height: 1.25;
          margin-bottom: 1.1rem;
        }

        .hero-sub {
          font-size: 1rem;
          color: #666;
          line-height: 1.8;
          margin-bottom: 2rem;
          font-weight: 400;
          max-width: 440px;
        }

        .hero-ctas { display: flex; gap: 1rem; flex-wrap: wrap; }

        .btn-primary {
          background: var(--bob);
          color: white;
          border: none;
          padding: 0.85rem 2rem;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          transition: background 0.25s, transform 0.2s;
          border-radius: 2px;
        }

        .btn-primary:hover { background: var(--bob-light); transform: translateY(-2px); }

        .btn-outline {
          background: transparent;
          color: var(--black);
          border: 1.5px solid #ccc;
          padding: 0.85rem 1.8rem;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.92rem;
          cursor: pointer;
          border-radius: 2px;
          transition: border-color 0.25s, color 0.25s;
        }

        .btn-outline:hover { border-color: var(--bob); color: var(--bob); }

        /* Hero arrows */
        .hero-arrows {
          position: absolute;
          bottom: 2rem; left: 2rem;
          display: flex;
          gap: 0.5rem;
          z-index: 3;
        }

        .arrow-btn {
          width: 40px; height: 40px;
          border: 1.5px solid #d0c8c0;
          background: white;
          color: var(--black);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          transition: all 0.25s;
        }

        .arrow-btn:hover { border-color: var(--bob); color: var(--bob); }

        /* Hero dots */
        .hero-dots {
          position: absolute;
          bottom: 2.4rem; right: 6%;
          display: flex;
          gap: 0.45rem;
          z-index: 3;
        }

        .hero-dot {
          width: 22px; height: 2px;
          background: #ccc;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .hero-dot.active { background: var(--bob); width: 42px; }

        /* Hero decorative badge */
        .hero-badge {
          position: absolute;
          top: 50%;
          left: 5%;
          transform: translateY(-50%);
          width: 110px; height: 110px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0.5rem;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          z-index: 2;
        }

        .hero-badge span:first-child {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--bob);
          display: block;
        }

        .hero-badge span:last-child {
          font-size: 0.62rem;
          color: #888;
          letter-spacing: 0.08em;
          line-height: 1.4;
        }

        /* ── SECTIONS ── */
        .section { padding: 5rem 2rem; }
        .section-inner { max-width: 1400px; margin: 0 auto; }

        .section-head { text-align: center; margin-bottom: 3rem; }

        .section-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--bob);
          margin-bottom: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          color: var(--black);
          font-weight: 700;
        }

        .section-line {
          width: 44px; height: 2px;
          background: var(--bob);
          margin: 0.85rem auto 0;
        }

        /* ── STATS ── */
        .stats-strip {
          background: var(--black);
          padding: 2.2rem 2rem;
        }

        .stats-inner {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          text-align: center;
        }

        .stat-item {
          padding: 0.5rem 1rem;
          border-right: 1px solid #2a2a2a;
        }

        .stat-item:last-child { border-right: none; }

        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #c8c8c8;
          font-weight: 700;
          display: block;
        }

        .stat-label { font-size: 0.75rem; color: #666; letter-spacing: 0.1em; }

        /* ── CATEGORIES ── */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.1rem;
        }

        .cat-card {
          position: relative;
          overflow: hidden;
          border-radius: 3px;
          cursor: pointer;
          aspect-ratio: 3/4;
        }

        .cat-card img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .cat-card:hover img { transform: scale(1.06); }

        .cat-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26,26,26,0.75) 25%, transparent 65%);
        }

        .cat-label {
          position: absolute;
          bottom: 1.3rem;
          right: 1.3rem;
        }

        .cat-label h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          color: white;
          font-weight: 600;
        }

        .cat-label span { font-size: 0.72rem; color: rgba(255,255,255,0.7); }

        /* ── PRODUCT CARDS ── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.4rem;
        }

        .product-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 3px;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow 0.3s, transform 0.3s;
        }

        .product-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.09);
          transform: translateY(-3px);
        }

        .card-img-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1;
          background: #f5f1ed;
        }

        .card-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .card-tag {
          position: absolute;
          top: 0.75rem; right: 0.75rem;
          background: var(--bob);
          color: white;
          font-size: 0.67rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.22rem 0.6rem;
          border-radius: 2px;
        }

        .card-discount {
          position: absolute;
          top: 0.75rem; left: 0.75rem;
          background: var(--black);
          color: white;
          font-size: 0.67rem;
          font-weight: 700;
          padding: 0.22rem 0.5rem;
          border-radius: 2px;
        }

        .card-actions {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: rgba(26,26,26,0.9);
          display: flex;
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.28s ease;
        }

        .card-actions.visible { opacity: 1; transform: translateY(0); }

        .card-action-btn {
          flex: 1;
          background: none;
          border: none;
          color: #ccc;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.78rem;
          padding: 0.7rem 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          transition: background 0.2s, color 0.2s;
          border-right: 1px solid rgba(255,255,255,0.08);
        }

        .card-action-btn:last-child { border-right: none; }
        .card-action-btn:hover { background: var(--bob); color: white; }
        .card-action-btn.primary { background: var(--bob); color: white; }

        .card-body { padding: 1rem 1.1rem 1.2rem; }

        .card-brand {
          font-size: 0.67rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #aaa;
          display: block;
          margin-bottom: 0.25rem;
        }

        .card-name {
          font-family: 'Playfair Display', serif;
          font-size: 0.98rem;
          color: var(--black);
          font-weight: 600;
          margin-bottom: 0.45rem;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.55rem;
        }

        .card-reviews { font-size: 0.72rem; color: #aaa; }

        .card-avail {
          display: inline-block;
          font-size: 0.65rem;
          letter-spacing: 0.04em;
          color: white;
          padding: 0.18rem 0.55rem;
          border-radius: 2px;
          margin-bottom: 0.7rem;
        }

        .card-price-row { display: flex; align-items: baseline; gap: 0.55rem; }

        .card-price {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--bob);
        }

        .card-original {
          font-size: 0.82rem;
          color: #bbb;
          text-decoration: line-through;
        }

        /* ── MID BANNER ── */
        .mid-banner {
          position: relative;
          overflow: hidden;
          background: #f0ebe5;
          padding: 5rem 2rem;
          text-align: center;
        }

        .mid-banner img {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.18;
        }

        .mid-banner-content { position: relative; z-index: 2; }

        .mid-banner-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.7rem, 3.5vw, 2.8rem);
          color: var(--black);
          margin-bottom: 0.65rem;
        }

        .mid-banner-content p {
          color: #666;
          font-size: 1rem;
          margin-bottom: 1.6rem;
        }

        .code-pill {
          display: inline-block;
          background: var(--bob);
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 0.3rem 1rem;
          border-radius: 2px;
          margin: 0 0.3rem;
        }

        /* ── FEATURES ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          text-align: center;
        }

        .feature-item { padding: 1.5rem 1rem; }

        .feature-icon {
          width: 52px; height: 52px;
          border: 1.5px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.3rem;
          background: white;
        }

        .feature-item h4 {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          color: var(--black);
          margin-bottom: 0.4rem;
        }

        .feature-item p { font-size: 0.84rem; color: #888; line-height: 1.65; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); }
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
          .hero-badge { display: none; }
        }

        @media (max-width: 600px) {
          .products-grid { grid-template-columns: 1fr; }
          .cat-grid { grid-template-columns: 1fr 1fr; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .stats-inner { grid-template-columns: 1fr 1fr; }
          .hero-content { padding: 0 5%; align-items: center; text-align: center; margin: 0 auto; max-width: 100%; }
          .hero-sub { text-align: center; }
          .hero-ctas { justify-content: center; }
          .hero-eyebrow { justify-content: center; }
        }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" key={slide}>
          <img src={current.img} alt="" />
        </div>

        <div className="hero-content" key={`c-${slide}`}>
          <p className="hero-eyebrow">SamPerfume · عطور فاخرة</p>
          <h1 className="hero-headline">{current.headline}</h1>
          <p className="hero-sub">{current.sub}</p>
          <div className="hero-ctas">
            <button className="btn-primary">{current.cta} <ArrowLeft size={15} /></button>
            <button className="btn-outline">العروض الحصرية</button>
          </div>
        </div>

        {/* Decorative circle badge */}
        <div className="hero-badge">
          <span>+200</span>
          <span>عطر فاخر متاح</span>
        </div>

        <div className="hero-arrows">
          <button className="arrow-btn" onClick={() => changeSlide(-1)}><ChevronRight size={17} /></button>
          <button className="arrow-btn" onClick={() => changeSlide(1)}><ChevronLeft size={17} /></button>
        </div>

        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button key={i} className={`hero-dot ${i === slide ? "active" : ""}`} onClick={() => setSlide(i)} />
          ))}
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <div className="stats-strip">
        <div className="stats-inner">
          {[
            { num: "+200", label: "عطر متاح" },
            { num: "+50",  label: "علامة تجارية" },
            { num: "+2K",  label: "عميل سعيد" },
            { num: "5★",   label: "تقييم العملاء" },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="section" style={{ background: "#faf8f6" }}>
        <div className="section-inner">
          <div className="section-head">
            <p className="section-eyebrow">تسوق حسب الفئة</p>
            <h2 className="section-title">اكتشف عالم العطور</h2>
            <div className="section-line" />
          </div>
          <div className="cat-grid">
            {categories.map(c => (
              <div key={c.label} className="cat-card">
                <img src={c.img} alt={c.label} />
                <div className="cat-overlay" />
                <div className="cat-label">
                  <h3>{c.label}</h3>
                  <span>{c.count} عطر</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ─────────────────────────────────────────── */}
      <section className="section" style={{ background: "white" }}>
        <div className="section-inner">
          <div className="section-head">
            <p className="section-eyebrow"><Flame size={13} /> الأكثر مبيعاً</p>
            <h2 className="section-title">المفضلة لدى عملائنا</h2>
            <div className="section-line" />
          </div>
          <div className="products-grid">
            {featured.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <button className="btn-primary">عرض جميع المنتجات <ArrowLeft size={15} /></button>
          </div>
        </div>
      </section>

      {/* ── MID BANNER ───────────────────────────────────────── */}
      <div className="mid-banner">
        <img src="https://images.unsplash.com/photo-1592945403237-9530b7ab5f71?w=1400&q=80" alt="" />
        <div className="mid-banner-content">
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.26em", color: "var(--bob)", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.65rem" }}>عرض محدود</p>
          <h2>احصل على خصم 20% على طلبك الأول</h2>
          <p>استخدم كود <span className="code-pill">SAM20</span> عند الدفع</p>
          <button className="btn-primary">تسوق الآن <ArrowLeft size={15} /></button>
        </div>
      </div>

      {/* ── NEW ARRIVALS ─────────────────────────────────────── */}
      <section className="section" style={{ background: "#faf8f6" }}>
        <div className="section-inner">
          <div className="section-head">
            <p className="section-eyebrow"><Sparkles size={13} /> وصل حديثاً</p>
            <h2 className="section-title">أحدث الإضافات</h2>
            <div className="section-line" />
          </div>
          <div className="products-grid">
            {[...featured].reverse().map(p => <ProductCard key={p.id + 10} p={{ ...p, tag: "جديد" }} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="section" style={{ background: "white", borderTop: "1px solid #e8e2dc" }}>
        <div className="section-inner">
          <div className="features-grid">
            {[
              { icon: "🚚", title: "شحن سريع",       desc: "توصيل لجميع أنحاء فلسطين خلال 2-4 أيام عمل" },
              { icon: "✅", title: "عطور أصلية 100%", desc: "نضمن أصالة جميع منتجاتنا مع إمكانية الإرجاع" },
              { icon: "💎", title: "تجربة VIP",       desc: "برنامج ولاء حصري مع مكافآت وعروض دائمة" },
              { icon: "📞", title: "دعم متواصل",      desc: "فريق خدمة العملاء متاح 7 أيام في الأسبوع" },
            ].map(f => (
              <div key={f.title} className="feature-item">
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}