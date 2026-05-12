import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowRight, Package, Layers, Eye, ShoppingBag,
  Wind, Loader2, ChevronDown, SlidersHorizontal, X
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";;

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
};

const GENDERS  = [{ v: "", l: "الكل" }, { v: "male", l: "رجالي" }, { v: "female", l: "نسائي" }, { v: "unisex", l: "مشترك" }];
const FAMILIES = [
  { v: "", l: "الكل" }, { v: "oud", l: "عود" }, { v: "woody", l: "خشبي" },
  { v: "floral", l: "زهري" }, { v: "oriental", l: "شرقي" }, { v: "fresh", l: "منعش" },
  { v: "citrus", l: "حمضي" }, { v: "other", l: "أخرى" },
];
const SORTS = [
  { v: "newest",     l: "الأحدث" },
  { v: "price_asc",  l: "السعر: الأقل" },
  { v: "price_desc", l: "السعر: الأعلى" },
  { v: "rating",     l: "الأعلى تقييماً" },
];

function EmptyState({ section }) {
  return (
    <div className="bp-empty">
      <div className="bp-empty-icon"><Wind size={28} strokeWidth={1.2} /></div>
      <h3>لا توجد عطور</h3>
      <p>{section === "full" ? "لا توجد قوارير كاملة لهذا البراند." : "لا توجد تقسيمات لهذا البراند."}</p>
    </div>
  );
}

function PerfumeCard({ p, section }) {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(false);

  const price = section === "full"
    ? (p.fullBottle?.price ?? "—")
    : (p.taqseem?.sizes?.[0]?.price ?? "—");

  const finalPrice = section === "full" && p.discount > 0
    ? +(p.fullBottle.price * (1 - p.discount / 100)).toFixed(0)
    : price;

  const originalPrice = section === "full" && p.discount > 0 ? p.fullBottle?.price : null;
  const mainImg = p.images?.find(i => i.isMain)?.url ?? p.images?.[0]?.url;

  const goToDetail = (e) => {
    e.stopPropagation();
    navigate(`/shop/${p.slug}/${section}`);
  };

  return (
    <div className="bp-card" onClick={goToDetail} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="bp-card-img-wrap">
        {mainImg
          ? <img loading="lazy" src={mainImg} alt={p.name} className="bp-card-img" style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }} />
          : <div className="bp-card-img-ph"><Package size={32} strokeWidth={1} /></div>}
        {p.isFeatured && <span className="bp-tag featured">مميز</span>}
        {p.discount > 0 && <span className="bp-tag discount">-{p.discount}%</span>}
        <div className={`bp-card-actions ${hovered ? "visible" : ""}`}>
          <button className="bp-action" onClick={goToDetail}><Eye size={13} /></button>
          <button className="bp-action primary" onClick={goToDetail}><ShoppingBag size={13} /><span>تفاصيل</span></button>
        </div>
      </div>
      <div className="bp-card-body">
        <h3 className="bp-name">{p.name}</h3>
        <div className="bp-meta-row">
          <span className={`bp-type-badge ${p.perfumeType}`}>{p.perfumeType === "arabic" ? "عربي" : "أجنبي"}</span>
          <span className="bp-gender">{p.gender === "male" ? "رجالي" : p.gender === "female" ? "نسائي" : "مشترك"}</span>
        </div>
        {section === "taqseem" && p.taqseem?.sizes?.length > 0 && (
          <div className="bp-sizes">
            {p.taqseem.sizes.map(s => <span key={s.ml} className="bp-size-pill">{s.ml}مل</span>)}
          </div>
        )}
        <div className="bp-price-row">
          <span className="bp-price">{finalPrice !== "—" ? `₪${finalPrice}` : "—"}</span>
          {originalPrice && <span className="bp-original">₪{originalPrice}</span>}
        </div>
      </div>
    </div>
  );
}

function Pills({ options, value, onChange }) {
  return (
    <div className="pill-row">
      {options.map(o => (
        <button key={o.v} className={`pill ${value === o.v ? "active" : ""}`} onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}

function Select({ options, value, onChange }) {
  return (
    <div className="sel-wrap">
      <select className="sel" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <ChevronDown size={13} className="sel-arrow" />
    </div>
  );
}

export default function BrandPerfumes() {
  const { brandQuery } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const brandName = searchParams.get("label") ?? decodeURIComponent(brandQuery ?? "").replace(/\+/g, " ");
  const brandValue = decodeURIComponent(brandQuery ?? "").replace(/\+/g, " ");

  const [perfumes, setPerfumes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [gender,   setGender]   = useState("");
  const [family,   setFamily]   = useState("");
  const [sort,     setSort]     = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [activeSection, setActiveSection] = useState("full");

  const fetchPerfumes = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      params.set("brand", brandValue);
      if (gender) params.set("gender", gender);
      if (family) params.set("fragranceFamily", family);
      params.set("sort", sort);
      params.set("limit", "200");
      const data = await fetcher(`${API}/perfumes?${params.toString()}`);
      setPerfumes(data.perfumes ?? []);
    } catch {
      setError("تعذّر تحميل العطور.");
    } finally {
      setLoading(false);
    }
  }, [brandValue, gender, family, sort]);

  useEffect(() => { fetchPerfumes(); }, [fetchPerfumes]);

  const fullBottles    = perfumes.filter(p => p.availability === "full_only"    || p.availability === "both");
  const taqseemBottles = perfumes.filter(p => p.availability === "taqseem_only" || p.availability === "both");
  const displayed      = activeSection === "full" ? fullBottles : taqseemBottles;

  const hasFilters = gender || family;
  const clearFilters = () => { setGender(""); setFamily(""); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Tajawal:wght@300;400;500;700&display=swap');
        :root{--bob:#452829;--bob-light:#6b3d3e;--black:#0e0e0e;--dark:#1a1a1a;--gray:#888;--border:#e8e2dc;--off:#faf8f6;--white:#ffffff;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Tajawal',sans-serif;direction:rtl;background:var(--white);}
        @keyframes spin{to{transform:rotate(360deg)}}

        .bp-header{background:var(--off);border-bottom:1px solid var(--border);padding:2rem 2rem 0;}
        .bp-header-inner{max-width:1400px;margin:0 auto;}
        .bp-back{display:inline-flex;align-items:center;gap:0.4rem;background:none;border:1.5px solid var(--border);border-radius:4px;padding:0.35rem 0.8rem;font-family:'Tajawal',sans-serif;font-size:0.8rem;color:#666;cursor:pointer;transition:all 0.2s;margin-bottom:1.2rem;}
        .bp-back:hover{border-color:var(--bob);color:var(--bob);}
        .bp-eyebrow{font-size:0.65rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--bob);font-weight:600;display:block;margin-bottom:0.3rem;}
        .bp-title{font-family:'Playfair Display',serif;font-size:clamp(1.6rem,3vw,2.2rem);color:var(--dark);font-weight:700;margin-bottom:1.5rem;}

        .bp-section-tabs{display:flex;border-top:1px solid var(--border);margin-top:0.4rem;}
        .bp-tab{display:flex;align-items:center;gap:0.5rem;padding:0.9rem 1.8rem;background:none;border:none;border-bottom:3px solid transparent;font-family:'Tajawal',sans-serif;font-size:0.92rem;font-weight:500;color:var(--gray);cursor:pointer;transition:all 0.25s;position:relative;bottom:-1px;}
        .bp-tab.active{color:var(--bob);border-bottom-color:var(--bob);font-weight:700;background:white;}
        .bp-tab:hover:not(.active){color:var(--dark);}
        .bp-tab-count{background:var(--border);color:var(--gray);font-size:0.65rem;font-weight:700;padding:0.12rem 0.45rem;border-radius:20px;}
        .bp-tab.active .bp-tab-count{background:rgba(69,40,41,0.12);color:var(--bob);}

        .bp-toolbar{background:white;border-bottom:1px solid var(--border);padding:0.85rem 2rem;position:sticky;top:0;z-index:100;}
        .bp-toolbar-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;gap:0.9rem;flex-wrap:wrap;}
        .bp-filter-toggle{display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1rem;border:1.5px solid var(--border);border-radius:3px;background:var(--off);font-family:'Tajawal',sans-serif;font-size:0.85rem;color:var(--dark);cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .bp-filter-toggle.active,.bp-filter-toggle:hover{border-color:var(--bob);color:var(--bob);}
        .filter-dot{width:6px;height:6px;background:var(--bob);border-radius:50%;}
        .sel-wrap{position:relative;display:flex;align-items:center;}
        .sel{appearance:none;border:1.5px solid var(--border);border-radius:3px;padding:0.55rem 1.8rem 0.55rem 0.8rem;font-family:'Tajawal',sans-serif;font-size:0.85rem;color:var(--dark);background:var(--off);cursor:pointer;outline:none;}
        .sel:focus{border-color:var(--bob);}
        .sel-arrow{position:absolute;left:0.5rem;pointer-events:none;color:var(--gray);}
        .bp-result-count{margin-right:auto;font-size:0.8rem;color:var(--gray);white-space:nowrap;}
        .bp-clear-btn{display:flex;align-items:center;gap:0.3rem;background:none;border:none;color:var(--bob);font-family:'Tajawal',sans-serif;font-size:0.8rem;cursor:pointer;padding:0.35rem 0.55rem;border-radius:3px;transition:background 0.2s;white-space:nowrap;}
        .bp-clear-btn:hover{background:rgba(69,40,41,0.07);}

        .bp-filter-panel{background:var(--off);border-bottom:1px solid var(--border);overflow:hidden;max-height:0;transition:max-height 0.35s ease,padding 0.3s ease;}
        .bp-filter-panel.open{max-height:200px;padding:1.2rem 2rem;}
        .bp-filter-panel-inner{max-width:1400px;margin:0 auto;display:flex;flex-direction:column;gap:0.85rem;}
        .bp-filter-row{display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;}
        .bp-filter-label{font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gray);min-width:50px;}
        .pill-row{display:flex;gap:0.4rem;flex-wrap:wrap;}
        .pill{padding:0.28rem 0.8rem;border:1.5px solid var(--border);border-radius:20px;background:white;font-family:'Tajawal',sans-serif;font-size:0.77rem;color:var(--dark);cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .pill:hover{border-color:var(--bob);color:var(--bob);}
        .pill.active{background:var(--bob);border-color:var(--bob);color:white;font-weight:600;}

        .bp-main{max-width:1400px;margin:0 auto;padding:1.8rem 2rem;}
        .bp-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;padding-bottom:0.85rem;border-bottom:1px solid var(--border);}
        .bp-section-head-left{display:flex;align-items:center;gap:0.6rem;}
        .bp-section-head h2{font-family:'Playfair Display',serif;font-size:1.25rem;color:var(--dark);font-weight:700;}
        .bp-section-count{font-size:0.75rem;color:var(--gray);background:var(--off);border:1px solid var(--border);padding:0.18rem 0.55rem;border-radius:20px;}
        .bp-section-icon{width:30px;height:30px;border:1.5px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--bob);background:white;flex-shrink:0;}

        .bp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;}

        .bp-card{background:white;border:1px solid var(--border);border-radius:3px;overflow:hidden;cursor:pointer;transition:box-shadow 0.3s,transform 0.3s;}
        .bp-card:hover{box-shadow:0 8px 28px rgba(0,0,0,0.08);transform:translateY(-3px);}
        .bp-card-img-wrap{position:relative;aspect-ratio:1;background:#f5f1ed;overflow:hidden;}
        .bp-card-img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;}
        .bp-card-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;}
        .bp-tag{position:absolute;top:0.6rem;font-size:0.62rem;font-weight:700;letter-spacing:0.05em;padding:0.18rem 0.5rem;border-radius:2px;color:white;}
        .bp-tag.featured{right:0.6rem;background:var(--bob);}
        .bp-tag.discount{left:0.6rem;background:var(--dark);}
        .bp-card-actions{position:absolute;bottom:0;left:0;right:0;background:rgba(14,14,14,0.88);display:flex;opacity:0;transform:translateY(8px);transition:all 0.25s ease;}
        .bp-card-actions.visible{opacity:1;transform:translateY(0);}
        .bp-action{flex:1;background:none;border:none;color:#ccc;padding:0.6rem 0.35rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.3rem;font-family:'Tajawal',sans-serif;font-size:0.72rem;border-right:1px solid rgba(255,255,255,0.07);transition:background 0.2s,color 0.2s;}
        .bp-action:last-child{border-right:none;}
        .bp-action:hover,.bp-action.primary{background:var(--bob);color:white;}

        .bp-card-body{padding:0.85rem 0.95rem 1rem;}
        .bp-name{font-family:'Playfair Display',serif;font-size:0.9rem;color:var(--dark);font-weight:600;margin-bottom:0.45rem;line-height:1.35;}
        .bp-meta-row{display:flex;align-items:center;gap:0.35rem;margin-bottom:0.45rem;}
        .bp-type-badge{font-size:0.6rem;padding:0.12rem 0.45rem;border-radius:2px;font-weight:600;}
        .bp-type-badge.arabic{background:rgba(69,40,41,0.1);color:var(--bob);}
        .bp-type-badge.western{background:#eef2ff;color:#3a5bd9;}
        .bp-gender{font-size:0.7rem;color:var(--gray);}
        .bp-sizes{display:flex;gap:0.28rem;flex-wrap:wrap;margin-bottom:0.45rem;}
        .bp-size-pill{font-size:0.62rem;padding:0.12rem 0.4rem;border:1px solid var(--border);border-radius:2px;color:var(--gray);}
        .bp-price-row{display:flex;align-items:baseline;gap:0.45rem;}
        .bp-price{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:var(--bob);}
        .bp-original{font-size:0.78rem;color:#bbb;text-decoration:line-through;}

        .bp-empty{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 2rem;text-align:center;gap:0.6rem;}
        .bp-empty-icon{width:60px;height:60px;border:1.5px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ccc;margin-bottom:0.4rem;}
        .bp-empty h3{font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--dark);}
        .bp-empty p{font-size:0.85rem;color:var(--gray);max-width:280px;line-height:1.6;}

        .bp-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 2rem;gap:0.9rem;color:var(--gray);}
        .bp-error{text-align:center;padding:3rem 2rem;color:var(--gray);}

        @media(max-width:1100px){.bp-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:800px){.bp-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:500px){.bp-grid{grid-template-columns:1fr;}}
        @media(max-width:600px){
  .bp-header{padding:1.2rem 1rem 0;}
  .bp-title{font-size:1.5rem;margin-bottom:1rem;}
  .bp-eyebrow{font-size:0.6rem;}
  .bp-back{font-size:0.72rem;padding:0.28rem 0.55rem;margin-bottom:0.9rem;}
  .bp-toolbar{padding:0.6rem 0.75rem;}
  .bp-toolbar-inner{gap:0.4rem;}
  .bp-main{padding:0.75rem;}
  .bp-grid{grid-template-columns:repeat(2,1fr);gap:0.55rem;}
  .bp-card-img-wrap{aspect-ratio:1;}
  .bp-card-body{padding:0.5rem 0.55rem 0.65rem;}
  .bp-name{font-size:0.8rem;margin-bottom:0.25rem;line-height:1.25;}
  .bp-meta-row{margin-bottom:0.25rem;}
  .bp-price{font-size:0.88rem;}
  .bp-original{font-size:0.72rem;}
  .bp-tag{font-size:0.55rem;padding:0.12rem 0.35rem;top:0.45rem;}
  .bp-tag.featured{right:0.45rem;}
  .bp-tag.discount{left:0.45rem;}
  .bp-tab{padding:0.65rem 0.75rem;font-size:0.78rem;gap:0.3rem;}
  .bp-tab-count{font-size:0.58rem;}
  .bp-filter-panel.open{max-height:420px;padding:0.9rem 0.75rem;}
  .bp-filter-label{font-size:0.65rem;min-width:42px;}
  .pill{font-size:0.72rem;padding:0.22rem 0.6rem;}
  .bp-section-head h2{font-size:1rem;}
  .bp-section-count{font-size:0.68rem;}
  .bp-section-icon{width:26px;height:26px;}
  .bp-card-actions{display:none;}
}
      `}</style>

      {/* HEADER */}
      <div className="bp-header">
        <div className="bp-header-inner">
          <button className="bp-back" onClick={() => navigate("/brands")}>
            <ArrowRight size={13} /> العودة للبراندات
          </button>
          <span className="bp-eyebrow">SamPerfume · {brandName}</span>
          <h1 className="bp-title">عطور {brandName}</h1>
          <div className="bp-section-tabs">
            <button className={`bp-tab ${activeSection === "full" ? "active" : ""}`} onClick={() => setActiveSection("full")}>
              <Package size={15} /> العطور الكاملة <span className="bp-tab-count">{fullBottles.length}</span>
            </button>
            <button className={`bp-tab ${activeSection === "taqseem" ? "active" : ""}`} onClick={() => setActiveSection("taqseem")}>
              <Layers size={15} /> التقسيمات <span className="bp-tab-count">{taqseemBottles.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bp-toolbar">
        <div className="bp-toolbar-inner">
          <button className={`bp-filter-toggle ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={14} /> فلترة
            {hasFilters && <span className="filter-dot" />}
          </button>
          <Select options={SORTS} value={sort} onChange={setSort} />
          <span className="bp-result-count">{loading ? "..." : `${displayed.length} عطر`}</span>
          {hasFilters && (
            <button className="bp-clear-btn" onClick={clearFilters}><X size={12} /> مسح</button>
          )}
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className={`bp-filter-panel ${showFilters ? "open" : ""}`}>
        <div className="bp-filter-panel-inner">
          <div className="bp-filter-row">
            <span className="bp-filter-label">الجنس</span>
            <Pills options={GENDERS} value={gender} onChange={setGender} />
          </div>
          <div className="bp-filter-row">
            <span className="bp-filter-label">العائلة</span>
            <Pills options={FAMILIES} value={family} onChange={setFamily} />
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="bp-main">
        {loading ? (
          <div className="bp-loading">
            <Loader2 size={26} style={{ animation: "spin 1s linear infinite", color: "#452829" }} />
            <p>جاري تحميل عطور {brandName}...</p>
          </div>
        ) : error ? (
          <div className="bp-error">
            <p>{error}</p>
            <button onClick={fetchPerfumes} style={{ marginTop: "1rem", padding: "0.6rem 1.5rem", background: "#452829", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>إعادة المحاولة</button>
          </div>
        ) : (
          <>
            <div className="bp-section-head">
              <div className="bp-section-head-left">
                <div className="bp-section-icon">{activeSection === "full" ? <Package size={14} /> : <Layers size={14} />}</div>
                <h2>{activeSection === "full" ? "العطور الكاملة" : "التقسيمات"}</h2>
                <span className="bp-section-count">{displayed.length} عطر</span>
              </div>
            </div>
            <div className="bp-grid">
              {displayed.length === 0
                ? <EmptyState section={activeSection} />
                : displayed.map(p => <PerfumeCard key={p._id} p={p} section={activeSection} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}