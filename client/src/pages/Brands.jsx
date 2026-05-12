import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ArrowLeft, Sparkles } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";;

const BRAND_CATALOGUE = [
  { name: "Tom Ford",  query: "Tom+Ford",  logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778601223/tom-ford-logo-png_seeklogo-383930_qwwbef.webp", origin: "الولايات المتحدة", type: "نيش", year: "2006" },
  { name: "Xerjoff",   query: "Xerjoff",   logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778601288/Xerjoff_Logo_cxrl1i.webp", origin: "إيطاليا", type: "نيش", year: "2003" },
  { name: "Jean Paul", query: "Jean+Paul", logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778601494/jean_paul_tka67m.png", origin: "فرنسا", type: "مصمم", year: "1976" },
  { name: "Valentino", query: "Valentino", logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778601535/valentino_sytghn.png", origin: "إيطاليا", type: "مصمم", year: "1978" },
  { name: "YSL",       query: "YSL",       logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778601632/yves-saint-laurent-logo-vector_csxisk.png", origin: "فرنسا", type: "مصمم", year: "1964" },
  { name: "Versace",   query: "Versace",   logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778601738/vercase_gsccja.png", origin: "إيطاليا", type: "مصمم", year: "1978" },
  { name: "Burberry",  query: "Burberry",  logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778601791/burberry_ea6ipk.png", origin: "بريطانيا", type: "مصمم", year: "1856" },
  { name: "Gucci",     query: "Gucci",     logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778601829/gucci_nlpsxu.png", origin: "إيطاليا", type: "مصمم", year: "1921" },
  { name: "Chanel",    query: "Chanel",    logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778602184/chanel_k9abdp.png", origin: "فرنسا", type: "مصمم", year: "1910" },
  { name: "Armani",    query: "Armani",    logo: "https://res.cloudinary.com/dsxz0cybq/image/upload/f_auto,q_auto/v1778601989/giorgio-armani-logo-png-transparent_h24msy.png", origin: "إيطاليا", type: "مصمم", year: "1975" },

];

const TYPE_FILTERS = ["الكل", "نيش", "مصمم"];

export default function Brands() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search,     setSearch]     = useState("");
  const [counts,     setCounts]     = useState({});
  const [activeType, setActiveType] = useState("الكل");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const b = params.get("brand");
    if (b) setSearch(decodeURIComponent(b.replace(/\+/g, " ")));
  }, [location.search]);

  useEffect(() => {
    fetch(`${API}/perfumes?limit=200&isActive=true`)
      .then(r => r.json())
      .then(data => {
        const perfumes = data.perfumes ?? data.data ?? [];
        const map = {};
        perfumes.forEach(p => { const b = p.brand?.trim(); if (b) map[b] = (map[b] || 0) + 1; });
        setCounts(map);
      }).catch(() => {});
  }, []);

  const filtered = BRAND_CATALOGUE.filter(b => {
    const ms = b.name.toLowerCase().includes(search.toLowerCase());
    const mt = activeType === "الكل" || b.type === activeType;
    return ms && mt;
  });

  const getCount = (brand) => {
    if (counts[brand.name]) return counts[brand.name];
    const key = Object.keys(counts).find(k =>
      k.toLowerCase().includes(brand.name.toLowerCase()) ||
      brand.name.toLowerCase().includes(k.toLowerCase())
    );
    return key ? counts[key] : null;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Tajawal:wght@300;400;500;700&display=swap');

        :root {
          --bob: #452829;
          --bob-l: #6b3d3e;
          --bob-ll: #8a5051;
          --gold: #c9a96e;
          --gold-l: #e8d5a3;
          --dark: #1a1a1a;
          --ink: #2e1f1f;
          --gray: #7a6f6f;
          --border: #e8e2dc;
          --off: #faf8f6;
          --cream: #f5f1eb;
          --white: #ffffff;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Tajawal', sans-serif; direction: rtl; background: var(--off); color: var(--dark); }

        @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cardIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }

        /* ── STICKY BAR ── */
        .bh-bar {
          position: sticky;
          top: 0;
          z-index: 200;
          background: rgba(250,248,246,0.97);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          padding: 0.85rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .bh-search-wrap {
          position: relative;
          flex: 1;
          max-width: 340px;
        }
        .bh-search-icon {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
          pointer-events: none;
        }
        .bh-search {
          width: 100%;
          border: 1.5px solid var(--border);
          border-radius: 40px;
          padding: 0.56rem 2.5rem 0.56rem 1rem;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.87rem;
          color: var(--dark);
          background: white;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .bh-search:focus {
          border-color: var(--bob);
          box-shadow: 0 0 0 3px rgba(69,40,41,0.09);
        }
        .bh-filters {
          display: flex;
          gap: 0.38rem;
          flex-wrap: wrap;
        }
        .bh-pill {
          padding: 0.36rem 0.95rem;
          border: 1.5px solid var(--border);
          border-radius: 40px;
          background: white;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.78rem;
          color: var(--gray);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          font-weight: 500;
        }
        .bh-pill:hover { border-color: var(--bob-ll); color: var(--bob); }
        .bh-pill.active {
          background: var(--bob);
          border-color: var(--bob);
          color: white;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(69,40,41,0.22);
        }

        /* ── BODY ── */
        .bh-body { max-width: 1280px; margin: 0 auto; padding: 2.2rem 2rem 4rem; }
        .bh-meta-line {
          font-size: 0.76rem;
          color: var(--gray);
          margin-bottom: 1.4rem;
          letter-spacing: 0.04em;
        }
        .bh-meta-line strong { color: var(--bob); font-weight: 700; }

        /* ── GRID ── */
        .bh-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(208px, 1fr));
          gap: 1.15rem;
        }

        /* ── CARD ── */
        .bh-card {
          position: relative;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition:
            transform 0.38s cubic-bezier(.22,.68,0,1.15),
            box-shadow 0.35s ease,
            border-color 0.25s;
          animation: cardIn 0.5s ease both;
        }
        .bh-card:hover {
          transform: translateY(-7px) scale(1.015);
          box-shadow:
            0 20px 44px rgba(69,40,41,0.14),
            0 4px 14px rgba(0,0,0,0.04);
          border-color: rgba(69,40,41,0.25);
        }
        .bh-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(to right, var(--bob), var(--gold));
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s cubic-bezier(.22,.68,0,1.15);
          z-index: 1;
        }
        .bh-card:hover::before { transform: scaleX(1); transform-origin: left; }

        /* logo zone */
        .bh-logo-zone {
          height: 108px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 2rem;
          background: var(--cream);
          border-bottom: 1px solid var(--border);
          transition: background 0.3s;
          overflow: hidden;
        }
        .bh-card:hover .bh-logo-zone { background: #e9e2d7; }
        .bh-logo-zone img {
          max-height: 46px;
          max-width: 128px;
          object-fit: contain;
          filter: grayscale(25%) brightness(0.92);
          transition: transform 0.45s ease, filter 0.3s;
        }
        .bh-card:hover .bh-logo-zone img {
          transform: scale(1.12);
          filter: grayscale(0%) brightness(1);
        }

        /* card body */
        .bh-card-body {
          padding: 0.9rem 1rem 0.95rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .bh-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.02rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 0.2rem;
          line-height: 1.25;
        }
        .bh-card-origin {
          font-size: 0.65rem;
          color: var(--gray);
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 0.7rem;
        }
        .bh-type-badge {
          display: inline-block;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.16rem 0.5rem;
          border-radius: 2px;
          border: 1px solid rgba(69,40,41,0.18);
          color: var(--bob-ll);
          background: rgba(69,40,41,0.05);
          margin-bottom: 0.7rem;
          width: fit-content;
        }
        .bh-card-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.65rem;
          border-top: 1px solid var(--border);
          margin-top: auto;
        }
        .bh-count-text {
          font-size: 0.7rem;
          color: var(--gray);
        }
        .bh-count-text strong { color: var(--bob); font-weight: 700; }
        .bh-explore-cta {
          display: flex;
          align-items: center;
          gap: 0.28rem;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          transition: color 0.2s, gap 0.2s;
        }
        .bh-card:hover .bh-explore-cta { color: var(--bob); gap: 0.45rem; }

        /* empty */
        .bh-empty {
          grid-column: 1/-1;
          text-align: center;
          padding: 5rem 2rem;
          color: var(--gray);
        }
        .bh-empty h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 400;
          margin-bottom: 0.5rem;
          color: var(--ink);
        }

        @media(max-width: 900px) {
          .bh-bar { padding: 0.7rem 1rem; gap: 0.7rem; }
          .bh-body { padding: 1.5rem 1rem 3rem; }
          .bh-grid { grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); gap: 0.85rem; }
          .bh-logo-zone { height: 88px; }
        }
        @media(max-width: 480px) {
          .bh-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* ── HERO — uses global page-hero classes from index.css ── */}
      <header className="page-hero">
        <div className="page-hero__pattern" />
        <div className="page-hero__glow" />
        <div className="page-hero__inner">
          <span className="page-hero__eyebrow">
            <Sparkles size={10} /> SamPerfume · البراندات
          </span>
          <h1 className="page-hero__title">دور العطور العالمية</h1>
          <p className="page-hero__sub">اختر براندك المفضل واستعرض المجموعة كاملة</p>
          <div className="page-hero__rule">
            <div className="page-hero__rule-line" />
            <div className="page-hero__rule-dot" />
            <div className="page-hero__rule-line" />
          </div>
        </div>
      </header>

      {/* STICKY BAR */}
      <div className="bh-bar">
        <div className="bh-search-wrap">
          <Search size={15} className="bh-search-icon" />
          <input
            className="bh-search"
            placeholder="ابحث عن دار عطور..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="bh-filters">
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              className={`bh-pill ${activeType === t ? "active" : ""}`}
              onClick={() => setActiveType(t)}
            >
              {t === "الكل" ? "الجميع" : t}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div className="bh-body">
        <p className="bh-meta-line">
          عرض <strong>{filtered.length}</strong> دار عطور
        </p>
        <div className="bh-grid">
          {filtered.length === 0 ? (
            <div className="bh-empty">
              <h3>لا توجد نتائج</h3>
              <p>جرب البحث بكلمة أخرى أو غيّر التصنيف.</p>
            </div>
          ) : filtered.map((brand, idx) => {
            const count = getCount(brand);
            return (
              <div
                key={brand.name}
                className="bh-card"
                style={{ animationDelay: `${idx * 0.045}s` }}
                onClick={() => navigate(`/brands/${encodeURIComponent(brand.query)}?label=${encodeURIComponent(brand.name)}`)}
              >
                <div className="bh-logo-zone">
                  <img
  src={brand.logo}
  alt={brand.name}
  loading="lazy"
  width="80"
  height="80"
/>
                </div>
                <div className="bh-card-body">
                  <span className="bh-card-name">{brand.name}</span>
                  <span className="bh-card-origin">{brand.origin} · {brand.year}</span>
                  <span className="bh-type-badge">{brand.type}</span>
                  <div className="bh-card-foot">
                    <span className="bh-count-text">
                      {count != null
                        ? <><strong>{count}</strong> عطر</>
                        : <span style={{ color: "#ccc" }}>—</span>}
                    </span>
                    <span className="bh-explore-cta">
                      استكشف <ArrowLeft size={10} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}