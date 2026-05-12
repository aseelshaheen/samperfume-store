import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ShoppingBag,
  Eye,
  Layers,
  Package,
  ArrowLeftRight,
  Loader2,
  Wind,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";;

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
};

const TYPES = [
  { v: "", l: "الكل" },
  { v: "arabic", l: "عربية" },
  { v: "western", l: "أجنبية" },
];
const GENDERS = [
  { v: "", l: "الكل" },
  { v: "male", l: "رجالي" },
  { v: "female", l: "نسائي" },
  { v: "unisex", l: "مشترك" },
];
const FAMILIES = [
  { v: "", l: "الكل" },
  { v: "oud", l: "عود" },
  { v: "woody", l: "خشبي" },
  { v: "floral", l: "زهري" },
  { v: "oriental", l: "شرقي" },
  { v: "fresh", l: "منعش" },
  { v: "citrus", l: "حمضي" },
  { v: "other", l: "أخرى" },
];
const SORTS = [
  { v: "newest", l: "الأحدث" },
  { v: "price_asc", l: "السعر: الأقل" },
  { v: "price_desc", l: "السعر: الأعلى" },
  { v: "rating", l: "الأعلى تقييماً" },
];

// ── Client-side bilingual search filter ──────────────────────────────────────
// Matches if ANY word in the query starts with the token (case-insensitive, Arabic/Latin)
function matchesSearch(p, query) {
  if (!query.trim()) return true;
  const tokens = query.trim().toLowerCase().split(/\s+/);
  // Fields to search: english name, arabic name, brand, slug
  const haystack = [
    p.name ?? "",
    p.nameAr ?? p.arabicName ?? "", // support both common field names
    p.brand ?? "",
    p.slug ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) =>
    haystack.split(/\s+/).some((word) => word.startsWith(token)),
  );
}

function EmptyState({ section }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Wind size={32} strokeWidth={1.2} />
      </div>
      <h3>لا توجد عطور</h3>
      <p>
        {section === "full"
          ? "لم يتم إضافة قوارير كاملة في هذا القسم حتى الآن."
          : "لم يتم إضافة تقسيمات في هذا القسم حتى الآن."}
      </p>
      <span className="empty-hint">سيتم الإضافة قريباً ✦</span>
    </div>
  );
}

function PerfumeCard({ p, section }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const price =
    section === "full"
      ? (p.fullBottle?.price ?? "—")
      : (p.taqseem?.sizes?.[0]?.price ?? "—");

  const originalPrice =
    section === "full" && p.discount > 0 ? p.fullBottle?.price : null;
  const finalPrice =
    section === "full" && p.discount > 0
      ? +(p.fullBottle.price * (1 - p.discount / 100)).toFixed(0)
      : price;

  const mainImg = p.images?.find((i) => i.isMain)?.url ?? p.images?.[0]?.url;

  // Bilingual name support
  const arabicName = p.nameAr ?? p.arabicName ?? null;
  const englishName = p.name ?? null;

  const goToDetail = (e, overrideSection) => {
    e.stopPropagation();
    navigate(`/shop/${p.slug}/${overrideSection ?? section}`);
  };

  return (
    <div
      className="p-card"
      onClick={goToDetail}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-card-img-wrap">
        {mainImg ? (
          <img loading="lazy"
            src={mainImg}
            alt={p.name}
            className="p-card-img"
            style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
          />
        ) : (
          <div className="p-card-img-placeholder">
            <Package size={36} strokeWidth={1} />
          </div>
        )}

        {p.isFeatured && <span className="p-tag featured">مميز</span>}
        {p.discount > 0 && (
          <span className="p-tag discount">-{p.discount}%</span>
        )}

        <div className={`p-card-actions ${hovered ? "visible" : ""}`}>
          <button className="p-action" onClick={goToDetail}>
            <Eye size={14} />
          </button>
        </div>
      </div>

      <div className="p-card-body">
        <span className="p-brand">{p.brand}</span>

        {/* ── Bilingual name block ── */}
        <div className="p-names">
          {englishName && <h3 className="p-name p-name-ar">{englishName}</h3>}
          {arabicName && <p className="p-name-en">{arabicName}</p>}
          {/* Fallback: if only one name field exists, show it as main */}
          {!arabicName && englishName && (
            <h3 className="p-name">{englishName}</h3>
          )}
          {arabicName && !englishName && (
            <h3 className="p-name">{arabicName}</h3>
          )}
        </div>

        <div className="p-meta-row">
          <span className={`p-type-badge ${p.perfumeType}`}>
            {p.perfumeType === "arabic" ? "عربي" : "أجنبي"}
          </span>
          <span className="p-gender">
            {p.gender === "male"
              ? "رجالي"
              : p.gender === "female"
                ? "نسائي"
                : "مشترك"}
          </span>
        </div>
        {section === "taqseem" && p.taqseem?.sizes?.length > 0 && (
          <div className="p-sizes">
            {p.taqseem.sizes.map((s) => (
              <span key={s.ml} className="p-size-pill">
                {s.ml}مل
              </span>
            ))}
          </div>
        )}
        <div className="p-price-row">
          <span className="p-price">
            {finalPrice !== "—" ? `₪${finalPrice}` : "—"}
          </span>
          {originalPrice && (
            <span className="p-original">₪{originalPrice}</span>
          )}
          {section === "taqseem" && p.taqseem?.sizes?.length > 1 && (
            <span className="p-from">يبدأ من</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Pills({ options, value, onChange }) {
  return (
    <div className="pill-row">
      {options.map((o) => (
        <button
          key={o.v}
          className={`pill ${value === o.v ? "active" : ""}`}
          onClick={() => onChange(o.v)}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Select({ options, value, onChange }) {
  return (
    <div className="sel-wrap">
      <select
        className="sel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="sel-arrow" />
    </div>
  );
}

export default function Shop({ initialSection }) {
  const [perfumes, setPerfumes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [gender, setGender] = useState("");
  const [family, setFamily] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  // initialSection prop comes from the navbar mobile links
  const [activeSection, setActiveSection] = useState(initialSection ?? "full");

  // Sync if prop changes (e.g. navigating from mobile nav)
  useEffect(() => {
    if (initialSection) setActiveSection(initialSection);
  }, [initialSection]);

  // Also read ?section= query param as a fallback
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("section");
    if (s === "full" || s === "taqseem") setActiveSection(s);
  }, [location.search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetcher(`${API}/perfumes/brands`)
      .then((d) => setBrands(d.brands ?? []))
      .catch(() => {});
  }, []);

  const fetchPerfumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      // Note: we send search to backend too for index-assisted filtering,
      // but we also do client-side bilingual filtering below
      if (brand) params.set("brand", brand);
      if (type) params.set("perfumeType", type);
      if (gender) params.set("gender", gender);
      if (family) params.set("fragranceFamily", family);
      params.set("sort", sort);
      params.set("limit", "200");
      const data = await fetcher(`${API}/perfumes?${params.toString()}`);
      setPerfumes(data.perfumes ?? []);
    } catch {
      setError("تعذّر تحميل العطور. تحقق من تشغيل الخادم.");
    } finally {
      setLoading(false);
    }
  }, [brand, type, gender, family, sort]);

  useEffect(() => {
    fetchPerfumes();
  }, [fetchPerfumes]);

  // Client-side bilingual search applied after fetch
  const filteredPerfumes = debouncedSearch
    ? perfumes.filter((p) => matchesSearch(p, debouncedSearch))
    : perfumes;

  const fullBottles = filteredPerfumes.filter(
    (p) => p.availability === "full_only" || p.availability === "both",
  );
  const taqseemBottles = filteredPerfumes.filter(
    (p) => p.availability === "taqseem_only" || p.availability === "both",
  );

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setType("");
    setGender("");
    setFamily("");
    setSort("newest");
    setVisibleCount(15);
  };
  const hasActiveFilters = search || brand || type || gender || family;
  const displayed = activeSection === "full" ? fullBottles : taqseemBottles;
  const visibleItems = displayed.slice(0, visibleCount);
  const hasMore = visibleCount < displayed.length;
  return (
    <>
      <style>{`
        
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Tajawal:wght@300;400;500;700&display=swap');
        :root { --bob:#452829; --bob-light:#6b3d3e; --black:#0e0e0e; --dark:#1a1a1a; --gray:#888; --border:#e8e2dc; --off:#faf8f6; --white:#ffffff; }
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Tajawal',sans-serif;direction:rtl;background:var(--white);}
        
        .shop-header{background:var(--off);border-bottom:1px solid var(--border);padding:2.8rem 2rem 0;}
        .shop-header-inner{max-width:1400px;margin:0 auto;}
        .shop-eyebrow{font-size:0.68rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--bob);font-weight:600;display:block;margin-bottom:0.4rem;}
        .shop-title{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,3vw,2.6rem);color:var(--dark);font-weight:700;margin-bottom:1.8rem;}

        .section-tabs{display:flex;border-top:1px solid var(--border);margin-top:0.5rem;}
        .section-tab{display:flex;align-items:center;gap:0.55rem;padding:1rem 2rem;background:none;border:none;border-bottom:3px solid transparent;font-family:'Tajawal',sans-serif;font-size:0.95rem;font-weight:500;color:var(--gray);cursor:pointer;transition:all 0.25s;position:relative;bottom:-1px;}
        .section-tab.active{color:var(--bob);border-bottom-color:var(--bob);font-weight:700;background:white;}
        .section-tab:hover:not(.active){color:var(--dark);}
        .tab-count{background:var(--border);color:var(--gray);font-size:0.68rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:20px;min-width:22px;text-align:center;}
        .section-tab.active .tab-count{background:rgba(69,40,41,0.12);color:var(--bob);}

        .shop-toolbar{background:white;border-bottom:1px solid var(--border);padding:1rem 2rem;position:sticky;top:102px;z-index:100;}
        .shop-toolbar-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;}

        .search-wrap{position:relative;flex:1;min-width:200px;max-width:380px;}
        .search-wrap input{width:100%;border:1.5px solid var(--border);border-radius:3px;padding:0.62rem 2.4rem 0.62rem 0.9rem;font-family:'Tajawal',sans-serif;font-size:0.9rem;color:var(--dark);background:var(--off);outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .search-wrap input:focus{border-color:var(--bob);background:white;box-shadow:0 0 0 3px rgba(69,40,41,0.08);}
        .search-icon{position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);color:var(--gray);pointer-events:none;}
        .search-clear{position:absolute;left:0.65rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--gray);cursor:pointer;padding:0;display:flex;}

        .filter-toggle{display:flex;align-items:center;gap:0.45rem;padding:0.62rem 1.1rem;border:1.5px solid var(--border);border-radius:3px;background:var(--off);font-family:'Tajawal',sans-serif;font-size:0.88rem;color:var(--dark);cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .filter-toggle.active,.filter-toggle:hover{border-color:var(--bob);color:var(--bob);background:rgba(69,40,41,0.04);}
        .filter-dot{width:7px;height:7px;background:var(--bob);border-radius:50%;}

        .sel-wrap{position:relative;display:flex;align-items:center;}
        .sel{appearance:none;border:1.5px solid var(--border);border-radius:3px;padding:0.62rem 2rem 0.62rem 0.9rem;font-family:'Tajawal',sans-serif;font-size:0.88rem;color:var(--dark);background:var(--off);cursor:pointer;outline:none;transition:border-color 0.2s;}
        .sel:focus{border-color:var(--bob);}
        .sel-arrow{position:absolute;left:0.6rem;pointer-events:none;color:var(--gray);}

        .result-count{margin-right:auto;font-size:0.82rem;color:var(--gray);white-space:nowrap;}
        .clear-btn{display:flex;align-items:center;gap:0.3rem;background:none;border:none;color:var(--bob);font-family:'Tajawal',sans-serif;font-size:0.82rem;cursor:pointer;padding:0.4rem 0.6rem;border-radius:3px;transition:background 0.2s;white-space:nowrap;}
        .clear-btn:hover{background:rgba(69,40,41,0.07);}

        .filter-panel{background:var(--off);border-bottom:1px solid var(--border);overflow:hidden;max-height:0;transition:max-height 0.35s ease,padding 0.3s ease;}
        .filter-panel.open{max-height:320px;padding:1.4rem 2rem;}
        .filter-panel-inner{max-width:1400px;margin:0 auto;display:flex;flex-direction:column;gap:1rem;}
        .filter-row{display:flex;align-items:center;gap:0.8rem;flex-wrap:wrap;}
        .filter-label{font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gray);min-width:56px;}
        .pill-row{display:flex;gap:0.45rem;flex-wrap:wrap;}
        .pill{padding:0.3rem 0.85rem;border:1.5px solid var(--border);border-radius:20px;background:white;font-family:'Tajawal',sans-serif;font-size:0.8rem;color:var(--dark);cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .pill:hover{border-color:var(--bob);color:var(--bob);}
        .pill.active{background:var(--bob);border-color:var(--bob);color:white;font-weight:600;}
        .brand-scroll{display:flex;gap:0.45rem;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;}
        .brand-scroll::-webkit-scrollbar{display:none;}

        .shop-main{max-width:1400px;margin:0 auto;padding:2rem;}
        .p-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.4rem;}

        .p-card{background:white;border:1px solid var(--border);border-radius:3px;overflow:hidden;cursor:pointer;transition:box-shadow 0.3s,transform 0.3s;}
        .p-card:hover{box-shadow:0 8px 32px rgba(0,0,0,0.09);transform:translateY(-3px);}
        .p-card-img-wrap{position:relative;aspect-ratio:1;background:#f5f1ed;overflow:hidden;}
        .p-card-img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;}
        .p-card-img-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;background:#f5f1ed;}

        .p-tag{position:absolute;top:0.7rem;font-size:0.65rem;font-weight:700;letter-spacing:0.06em;padding:0.2rem 0.55rem;border-radius:2px;color:white;}
        .p-tag.featured{right:0.7rem;background:var(--bob);}
        .p-tag.discount{left:0.7rem;background:var(--dark);}

        .p-card-actions{position:absolute;bottom:0;left:0;right:0;background:rgba(14,14,14,0.88);display:flex;opacity:0;transform:translateY(8px);transition:all 0.25s ease;}
        .p-card-actions.visible{opacity:1;transform:translateY(0);}
        .p-action{flex:1;background:none;border:none;color:#ccc;padding:0.65rem 0.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.3rem;font-family:'Tajawal',sans-serif;font-size:0.75rem;border-right:1px solid rgba(255,255,255,0.07);transition:background 0.2s,color 0.2s;}
        .p-action:last-child{border-right:none;}
        .p-action:hover,.p-action.primary{background:var(--bob);color:white;}

        .p-card-body{padding:0.95rem 1rem 1.1rem;}
        .p-brand{font-size:0.65rem;letter-spacing:0.13em;text-transform:uppercase;color:#aaa;display:block;margin-bottom:0.22rem;}

        /* ── Bilingual name block ── */
        .p-names{margin-bottom:0.5rem;}
        .p-name{font-family:'Playfair Display',serif;font-size:0.95rem;color:var(--dark);font-weight:600;line-height:1.3;}
        .p-name-ar{font-family:'Tajawal',sans-serif;font-size:1rem;color:var(--dark);font-weight:600;line-height:1.3;}
        .p-name-en{font-family:'Playfair Display',serif;font-size:0.78rem;color:var(--gray);font-weight:400;line-height:1.3;margin-top:1px;direction:ltr;text-align:right;}

        .p-meta-row{display:flex;align-items:center;gap:0.4rem;margin-bottom:0.55rem;}
        .p-type-badge{font-size:0.62rem;padding:0.15rem 0.5rem;border-radius:2px;font-weight:600;letter-spacing:0.04em;}
        .p-type-badge.arabic{background:rgba(69,40,41,0.1);color:var(--bob);}
        .p-type-badge.western{background:#eef2ff;color:#3a5bd9;}
        .p-gender{font-size:0.72rem;color:var(--gray);}
        .p-sizes{display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.55rem;}
        .p-size-pill{font-size:0.65rem;padding:0.15rem 0.45rem;border:1px solid var(--border);border-radius:2px;color:var(--gray);}
        .p-price-row{display:flex;align-items:baseline;gap:0.5rem;}
        .p-price{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:var(--bob);}
        .p-original{font-size:0.8rem;color:#bbb;text-decoration:line-through;}
        .p-from{font-size:0.72rem;color:var(--gray);}

        .loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem 2rem;gap:1rem;color:var(--gray);}
        .error-state{text-align:center;padding:4rem 2rem;color:var(--gray);}
        .error-state h3{font-family:'Playfair Display',serif;color:var(--dark);margin-bottom:0.5rem;}
        .error-state p{font-size:0.88rem;margin-bottom:1.2rem;}
        .retry-btn{padding:0.7rem 1.8rem;background:var(--bob);color:white;border:none;border-radius:3px;font-family:'Tajawal',sans-serif;font-size:0.9rem;cursor:pointer;}

        .empty-state{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem 2rem;text-align:center;gap:0.6rem;}
        .empty-icon{width:68px;height:68px;border:1.5px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ccc;margin-bottom:0.5rem;}
        .empty-state h3{font-family:'Playfair Display',serif;font-size:1.25rem;color:var(--dark);}
        .empty-state p{font-size:0.88rem;color:var(--gray);max-width:300px;line-height:1.6;}
        .empty-hint{font-size:0.78rem;color:var(--bob);letter-spacing:0.06em;margin-top:0.3rem;}

        .section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.8rem;padding-bottom:1rem;border-bottom:1px solid var(--border);}
        .section-head-left{display:flex;align-items:center;gap:0.7rem;}
        .section-head h2{font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--dark);font-weight:700;}
        .section-head-count{font-size:0.78rem;color:var(--gray);background:var(--off);border:1px solid var(--border);padding:0.2rem 0.6rem;border-radius:20px;}
        .section-icon{width:34px;height:34px;border:1.5px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--bob);background:white;flex-shrink:0;}

        .guest-notice{background:#fff7ed;border-bottom:1px solid #fde8c8;padding:0.55rem 2rem;font-size:0.8rem;color:#b5620a;text-align:center;letter-spacing:0.02em;}
        .toolbar-mobile-row{display:contents;}
        @media(max-width:600px){.toolbar-mobile-row{display:flex;gap:0.4rem;align-items:center;}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:1100px){.p-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:800px){.p-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:500px){.p-grid{grid-template-columns:1fr;}.section-tab{padding:0.8rem 1rem;font-size:0.85rem;}}
        @media(max-width:600px){
          .shop-header{padding:1.2rem 1rem 0;}
          .shop-title{font-size:1.5rem;margin-bottom:1rem;}
          .shop-eyebrow{font-size:0.6rem;}
          .shop-toolbar{padding:0.5rem 0.75rem;top:0;}
          .shop-toolbar-inner{gap:0.4rem;flex-direction:column;align-items:stretch;}
          .search-wrap{min-width:0;max-width:100%;width:100%;flex:unset;}
          .search-wrap input{font-size:0.88rem;padding:0.6rem 2.4rem 0.6rem 0.8rem;width:100%;border-width:2px;border-color:var(--bob);background:white;box-shadow:0 0 0 3px rgba(69,40,41,0.08);}
          .search-icon{color:var(--bob);}
          .toolbar-mobile-row{display:flex;gap:0.4rem;align-items:center;}
          .filter-toggle{flex:1;justify-content:center;padding:0.45rem 0.65rem;font-size:0.82rem;}
          .sel{flex:1;padding:0.45rem 1.6rem 0.45rem 0.6rem;font-size:0.82rem;}
          .result-count{display:none;}
          .shop-main{padding:0.75rem;}
          .p-grid{grid-template-columns:repeat(2,1fr);gap:0.55rem;}
          .p-card-img-wrap{aspect-ratio:1;}
          .p-card-body{padding:0.5rem 0.55rem 0.65rem;}
          .p-brand{font-size:0.56rem;margin-bottom:0.12rem;}
          .p-name-ar{font-size:0.82rem;line-height:1.2;}
          .p-name-en{font-size:0.68rem;}
          .p-names{margin-bottom:0.25rem;}
          .p-meta-row{margin-bottom:0.25rem;gap:0.25rem;}
          .p-type-badge{font-size:0.56rem;padding:0.1rem 0.35rem;}
          .p-gender{font-size:0.62rem;}
          .p-sizes{gap:0.2rem;margin-bottom:0.25rem;}
          .p-size-pill{font-size:0.58rem;padding:0.1rem 0.35rem;}
          .p-price{font-size:0.88rem;}
          .p-original{font-size:0.72rem;}
          .p-tag{font-size:0.55rem;padding:0.12rem 0.35rem;top:0.45rem;}
          .p-tag.featured{right:0.45rem;}
          .p-tag.discount{left:0.45rem;}
          .section-tab{padding:0.65rem 0.75rem;font-size:0.78rem;gap:0.3rem;}
          .tab-count{font-size:0.58rem;padding:0.08rem 0.3rem;}
          .filter-panel.open{max-height:420px;padding:0.9rem 0.75rem;}
          .filter-label{font-size:0.65rem;min-width:42px;}
          .pill{font-size:0.72rem;padding:0.22rem 0.6rem;}
          .section-head{margin-bottom:0.85rem;}
          .section-head h2{font-size:1rem;}
          .section-head-count{font-size:0.68rem;}
          .section-icon{width:26px;height:26px;}
          .guest-notice{padding:0.4rem 0.75rem;font-size:0.7rem;}
          .p-card-actions{display:none;}
          .show-more-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 0 1rem;
}
.show-more-count {
  font-size: 0.82rem;
  color: var(--gray);
  letter-spacing: 0.04em;
}
.show-more-btn {
  padding: 0.75rem 2.5rem;
  border: 1.5px solid var(--bob);
  border-radius: 3px;
  background: white;
  color: var(--bob);
  font-family: 'Tajawal', sans-serif;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.show-more-btn:hover {
  background: var(--bob);
  color: white;
}
        }
      `}</style>

      <div className="guest-notice">
        يمكنك التسوق بدون تسجيل دخول · ادخل بياناتك عند الطلب
      </div>

      <div className="shop-header">
        <div className="shop-header-inner">
          <span className="shop-eyebrow">SamPerfume · المتجر</span>
          <h1 className="shop-title">اكتشف عالم العطور</h1>
          <div className="section-tabs">
            <button
              className={`section-tab ${activeSection === "full" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("full");
                setVisibleCount(15);
              }}
            >
              العطور الكاملة
              <span className="tab-count">{fullBottles.length}</span>
            </button>
            <button
              className={`section-tab ${activeSection === "taqseem" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("taqseem");
                setVisibleCount(15);
              }}
            >
              التقسيمات
              <span className="tab-count">{taqseemBottles.length}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="shop-toolbar">
        <div className="shop-toolbar-inner">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="ابحث بالعربي أو الإنجليزي..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="toolbar-mobile-row">
            <button
              className={`filter-toggle ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal size={15} /> فلترة
              {hasActiveFilters && <span className="filter-dot" />}
            </button>
            <Select options={SORTS} value={sort} onChange={setSort} />
            <span className="result-count">
              {loading ? "..." : `${displayed.length} عطر`}
            </span>
            {hasActiveFilters && (
              <button className="clear-btn" onClick={clearFilters}>
                <X size={13} /> مسح الفلاتر
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={`filter-panel ${showFilters ? "open" : ""}`}>
        <div className="filter-panel-inner">
          {brands.length > 0 && (
            <div className="filter-row">
              <span className="filter-label">البراند</span>
              <div className="brand-scroll">
                <button
                  className={`pill ${brand === "" ? "active" : ""}`}
                  onClick={() => setBrand("")}
                >
                  الكل
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    className={`pill ${brand === b ? "active" : ""}`}
                    onClick={() => setBrand(brand === b ? "" : b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="filter-row">
            <span className="filter-label">النوع</span>
            <Pills options={TYPES} value={type} onChange={setType} />
          </div>
          <div className="filter-row">
            <span className="filter-label">الجنس</span>
            <Pills options={GENDERS} value={gender} onChange={setGender} />
            <span className="filter-label" style={{ marginRight: "1rem" }}>
              العائلة
            </span>
            <Pills options={FAMILIES} value={family} onChange={setFamily} />
          </div>
        </div>
      </div>

      <div className="shop-main">
        {loading ? (
          <div className="loading-state">
            <Loader2
              size={28}
              style={{ animation: "spin 1s linear infinite", color: "#452829" }}
            />
            <p>جاري تحميل العطور...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <h3>تعذّر تحميل العطور</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchPerfumes}>
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            <div className="section-head">
              <div className="section-head-left">
                <h2>
                  {activeSection === "full" ? "العطور الكاملة" : "التقسيمات"}
                </h2>
                <span className="section-head-count">
                  {displayed.length} عطر
                </span>
              </div>
            </div>
            <div className="p-grid">
              {displayed.length === 0 ? (
                <EmptyState section={activeSection} />
              ) : (
                visibleItems.map((p) => (
                  <PerfumeCard key={p._id} p={p} section={activeSection} />
                ))
              )}
            </div>
            {/* ── Show more ── */}
            {!loading && !error && displayed.length > 0 && (
              <div className="show-more-wrap">
                <span className="show-more-count">
                  عرض {Math.min(visibleCount, displayed.length)} من{" "}
                  {displayed.length} عطر
                </span>
                {hasMore && (
                  <button
                    className="show-more-btn"
                    onClick={() => setVisibleCount((v) => v + 15)}
                  >
                    عرض المزيد
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
