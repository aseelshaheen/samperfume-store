import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Package,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("sp_token")}`,
});

const EMPTY = {
  name: "",
  nameAr: "",
  brand: "",
  perfumeType: "western",
  gender: "unisex",
  fragranceFamily: "other",
  description: "",
  availability: "full_only",
  fullBottle: { price: "", stock: "", size_ml: "" },
  taqseem: { sourceBottle_ml: "", sizes: [] },
  discount: 0,
  _originalPrice: "",
  _discountedPrice: "",
  isFeatured: false,
  images: [{ url: "", isMain: true }],
};

function TaqseemSizes({ sizes, onChange }) {
  const add = () => onChange([...sizes, { ml: "", price: "", stock: "" }]);
  const remove = (i) => onChange(sizes.filter((_, idx) => idx !== i));
  const update = (i, f, v) =>
    onChange(sizes.map((s, idx) => (idx === i ? { ...s, [f]: v } : s)));

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.6rem",
        }}
      >
        <label className="af-label">أحجام التقسيمة</label>
        <button type="button" className="ts-add" onClick={add}>
          <Plus size={12} /> حجم
        </button>
      </div>
      {sizes.map((s, i) => (
        <div key={i} className="ts-row">
          <input
            className="af-input"
            type="number"
            placeholder="مل"
            value={s.ml ?? ""}
            onChange={(e) => update(i, "ml", e.target.value)}
          />
          <input className="af-input" type="text" inputMode="decimal" placeholder="₪ السعر"
            
            value={s.price ?? ""}
            onChange={(e) => update(i, "price", e.target.value)}
          />
          <input
            className="af-input"
            type="number"
            placeholder="مخزون"
            value={s.stock ?? ""}
            onChange={(e) => update(i, "stock", e.target.value)}
          />
          <button type="button" className="ts-del" onClick={() => remove(i)}>
            <X size={12} />
          </button>
        </div>
      ))}
      {sizes.length === 0 && (
        <p style={{ fontSize: "0.78rem", color: "#bbb" }}>
          لا توجد أحجام مضافة
        </p>
      )}
    </div>
  );
}

function buildInitial(perfume) {
  if (!perfume) return { ...EMPTY };
  const orig = perfume.fullBottle?.price ?? "";
  const disc =
    perfume.discount > 0 && orig !== ""
      ? orig - (orig * perfume.discount) / 100
      : "";
  return {
    ...EMPTY,
    ...perfume,
    name:        perfume.name        ?? "",
    nameAr:      perfume.nameAr      ?? "",
    brand:       perfume.brand       ?? "",
    description: perfume.description ?? "",
    discount:    perfume.discount    ?? 0,
    fullBottle: {
      price:   perfume.fullBottle?.price   ?? "",
      stock:   perfume.fullBottle?.stock   ?? "",
      size_ml: perfume.fullBottle?.size_ml ?? "",
    },
    taqseem: {
      sourceBottle_ml: perfume.taqseem?.sourceBottle_ml ?? "",
      sizes: (perfume.taqseem?.sizes ?? []).map((s) => ({
        ml:    s.ml    ?? "",
        price: s.price ?? "",
        stock: s.stock ?? "",
      })),
    },
    images:
      perfume.images?.length
        ? perfume.images.map((img) => ({ ...img, url: img.url ?? "" }))
        : [{ url: "", isMain: true }],
    _originalPrice:   orig !== "" ? String(orig) : "",
    _discountedPrice: disc !== "" ? String(disc) : "",
  };
}

function PerfumeForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => buildInitial(initial));

  // Reset form when the perfume being edited changes
  useEffect(() => {
    setForm(buildInitial(initial));
  }, [initial]);

  const set = (path, val) => {
    const parts = path.split(".");
    setForm((prev) =>
      parts.length === 1
        ? { ...prev, [path]: val }
        : { ...prev, [parts[0]]: { ...prev[parts[0]], [parts[1]]: val } },
    );
  };

  const handleOriginalPrice = (rawVal) => {
    const orig = parseFloat(rawVal);
    const disc = parseFloat(form._discountedPrice);
    const pct =
      !isNaN(orig) && orig > 0 && !isNaN(disc) && disc >= 0 && disc < orig
        ? Math.round(((orig - disc) / orig) * 100)
        : 0;
    setForm((prev) => ({
      ...prev,
      _originalPrice: rawVal,
      fullBottle: { ...prev.fullBottle, price: rawVal },
      discount: pct,
    }));
  };

  const handleDiscountedPrice = (rawVal) => {
    const orig = parseFloat(form._originalPrice);
    const disc = parseFloat(rawVal);
    const pct =
      !isNaN(orig) && orig > 0 && !isNaN(disc) && disc >= 0 && disc < orig
        ? Math.round(((orig - disc) / orig) * 100)
        : 0;
    setForm((prev) => ({ ...prev, _discountedPrice: rawVal, discount: pct }));
  };

  const showFull    = ["full_only", "both"].includes(form.availability);
  const showTaqseem = ["taqseem_only", "both"].includes(form.availability);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { _originalPrice, _discountedPrice, ...payload } = form;
    onSave(payload);
  };

  return (
    <form className="af-form" onSubmit={handleSubmit}>

      {/* ── Names ── */}
      <div className="af-row-2">
        <div className="af-field">
          <label className="af-label">الاسم بالإنجليزية *</label>
          <input
            className="af-input"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Bleu de Chanel"
            dir="ltr"
            style={{ textAlign: "left" }}
          />
        </div>
        <div className="af-field">
          <label className="af-label">الاسم بالعربية</label>
          <input
            className="af-input"
            value={form.nameAr}
            onChange={(e) => set("nameAr", e.target.value)}
            placeholder="بلو دي شانيل"
            dir="rtl"
          />
        </div>
      </div>

      {/* ── Brand ── */}
      <div className="af-field">
        <label className="af-label">البراند *</label>
        <input
          className="af-input"
          required
          value={form.brand}
          onChange={(e) => set("brand", e.target.value)}
          placeholder="Chanel"
          dir="ltr"
          style={{ textAlign: "left" }}
        />
      </div>

      <div className="af-row-3">
        <div className="af-field">
          <label className="af-label">نوع العطر</label>
          <select
            className="af-select"
            value={form.perfumeType}
            onChange={(e) => set("perfumeType", e.target.value)}
          >
            <option value="arabic">عربي</option>
            <option value="western">أجنبي</option>
          </select>
        </div>
        <div className="af-field">
          <label className="af-label">الجنس</label>
          <select
            className="af-select"
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
          >
            <option value="male">رجالي</option>
            <option value="female">نسائي</option>
            <option value="unisex">مشترك</option>
          </select>
        </div>
        <div className="af-field">
          <label className="af-label">عائلة العطر</label>
          <select
            className="af-select"
            value={form.fragranceFamily}
            onChange={(e) => set("fragranceFamily", e.target.value)}
          >
            {[
              "oud","woody","floral","oriental","fresh",
              "citrus","aquatic","gourmand","chypre","fougere","other",
            ].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="af-field">
        <label className="af-label">الوصف *</label>
        <textarea
          className="af-textarea"
          required
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="وصف العطر، مكوناته، رائحته..."
        />
      </div>

      <div className="af-field">
        <label className="af-label">طريقة البيع</label>
        <select
          className="af-select"
          value={form.availability}
          onChange={(e) => set("availability", e.target.value)}
        >
          <option value="full_only">قارورة كاملة فقط</option>
          <option value="taqseem_only">تقسيمة فقط</option>
          <option value="both">كليهما</option>
        </select>
      </div>

      {showFull && (
        <div className="af-subsection">
          <div className="af-sub-title">القارورة الكاملة</div>
          <div className="af-row-3">
            <div className="af-field">
              <label className="af-label">المخزون</label>
              <input
                className="af-input"
                type="number"
                value={form.fullBottle.stock}
                onChange={(e) => set("fullBottle.stock", e.target.value)}
              />
            </div>
            <div className="af-field">
              <label className="af-label">الحجم (مل)</label>
              <input
                className="af-input"
                type="number"
                value={form.fullBottle.size_ml}
                onChange={(e) => set("fullBottle.size_ml", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {showTaqseem && (
        <div className="af-subsection">
          <div className="af-sub-title">التقسيمات</div>
          <div className="af-field" style={{ marginBottom: "0.8rem" }}>
            <label className="af-label">حجم القارورة الأصلية (مل)</label>
            <input
              className="af-input"
              type="number"
              value={form.taqseem.sourceBottle_ml}
              onChange={(e) => set("taqseem.sourceBottle_ml", e.target.value)}
              style={{ maxWidth: 150 }}
            />
          </div>
          <TaqseemSizes
            sizes={form.taqseem.sizes}
            onChange={(sizes) =>
              setForm((p) => ({ ...p, taqseem: { ...p.taqseem, sizes } }))
            }
          />
        </div>
      )}

      {/* ── Pricing ── */}
      <div className="af-subsection">
        <div className="af-sub-title">التسعير</div>
        <div className="af-row-2">
          <div className="af-field">
            <label className="af-label">السعر الأصلي (₪) *</label>
            <input className="af-input" type="text" inputMode="decimal"
              step="any"
              required={showFull}
              value={form._originalPrice}
              onChange={(e) => handleOriginalPrice(e.target.value)}
              placeholder="مثال: 200"
            />
          </div>
          <div className="af-field">
            <label className="af-label">السعر بعد الخصم (₪)</label>
            <input className="af-input" type="text" inputMode="decimal"
              step="any"
              value={form._discountedPrice}
              onChange={(e) => handleDiscountedPrice(e.target.value)}
              placeholder="اتركه فارغاً إن لم يكن هناك خصم"
            />
          </div>
        </div>
        {form.discount > 0 ? (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#2e7d5a",
              fontWeight: 700,
              marginTop: "0.3rem",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <span>✓</span>
            <span>
              نسبة الخصم: {form.discount}% · السعر المعروض: ₪
              {Math.round(
                parseFloat(form._originalPrice) -
                  (parseFloat(form._originalPrice) * form.discount) / 100,
              )}
            </span>
          </div>
        ) : (
          form._originalPrice && (
            <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "0.3rem" }}>
              لا يوجد خصم · السعر المعروض = ₪{form._originalPrice}
            </div>
          )
        )}
      </div>

      <div className="af-field">
        <label className="af-label">مميز في الرئيسية</label>
        <div
          className="af-toggle"
          onClick={() => set("isFeatured", !form.isFeatured)}
        >
          {form.isFeatured ? (
            <ToggleRight size={26} color="#452829" />
          ) : (
            <ToggleLeft size={26} color="#ccc" />
          )}
          <span>{form.isFeatured ? "نعم" : "لا"}</span>
        </div>
      </div>

      <div className="af-subsection">
        <div className="af-sub-title">روابط الصور</div>
        {form.images.map((img, i) => (
          <div key={i} className="img-row">
            <input
              className="af-input"
              placeholder={`رابط الصورة ${i + 1}`}
              value={img.url}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  images: p.images.map((im, idx) =>
                    idx === i ? { ...im, url: e.target.value } : im,
                  ),
                }))
              }
            />
            {i > 0 && (
              <button
                type="button"
                className="ts-del"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    images: p.images.filter((_, idx) => idx !== i),
                  }))
                }
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="ts-add"
          onClick={() =>
            setForm((p) => ({
              ...p,
              images: [...p.images, { url: "", isMain: false }],
            }))
          }
        >
          <Plus size={12} /> صورة
        </button>
      </div>

      <div className="af-actions">
        <button type="button" className="af-cancel" onClick={onCancel}>
          إلغاء
        </button>
        <button type="submit" className="af-save" disabled={saving}>
          {saving ? (
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Save size={14} />
          )}
          {saving ? "جاري الحفظ..." : "حفظ العطر"}
        </button>
      </div>
    </form>
  );
}

export default function AdminPerfumes() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState("");
  const [mode,     setMode]     = useState("list");
  const [editing,  setEditing]  = useState(null);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/perfumes?limit=100`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setPerfumes(data.perfumes ?? []);
    } catch {
      showToast("تعذّر التحميل", "error");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const url    = editing ? `${API}/perfumes/${editing._id}` : `${API}/perfumes`;
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editing ? "تم التعديل" : "تمت الإضافة");
        setMode("list");
        setEditing(null);
        load();
      } else {
        showToast(data.message ?? "خطأ", "error");
      }
    } catch {
      showToast("خطأ في الاتصال", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res  = await fetch(`${API}/perfumes/${id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (data.success) { showToast("تم الحذف"); load(); }
      else showToast(data.message ?? "خطأ", "error");
    } catch {
      showToast("خطأ", "error");
    }
  };

  const handleToggle = async (p) => {
    try {
      await fetch(`${API}/perfumes/${p._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      setPerfumes((prev) =>
        prev.map((x) => x._id === p._id ? { ...x, isActive: !x.isActive } : x),
      );
    } catch {}
  };

  const q = search.toLowerCase().trim();
  const filtered = q
    ? perfumes.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.nameAr?.includes(search.trim()) ||
          p.brand?.toLowerCase().includes(q),
      )
    : perfumes;

  const displayPrice = (p) => {
    const base = p.fullBottle?.price;
    if (!base) return "—";
    if (p.discount > 0) {
      const final = Math.round(base - (base * p.discount) / 100);
      return `₪${final} (-${p.discount}%)`;
    }
    return `₪${Math.round(base)}`;
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        .af-form { display:flex; flex-direction:column; gap:1.2rem; }
        .af-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .af-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; }
        .af-field { display:flex; flex-direction:column; gap:0.32rem; }
        .af-label { font-size:0.72rem; font-weight:700; color:#888; letter-spacing:0.06em; text-transform:uppercase; }
        .af-input, .af-select, .af-textarea { background:white; border:1.5px solid #e8e2dc; color:#1a1a1a; font-family:'Tajawal',sans-serif; font-size:0.88rem; padding:0.6rem 0.82rem; border-radius:5px; outline:none; transition:border-color 0.2s; width:100%; }
        .af-input:focus, .af-select:focus, .af-textarea:focus { border-color:#452829; box-shadow:0 0 0 3px rgba(69,40,41,0.07); }
        .af-textarea { resize:vertical; min-height:85px; }
        .af-select { appearance:none; cursor:pointer; }
        .af-subsection { background:#faf8f6; border:1px solid #e8e2dc; border-radius:8px; padding:1.1rem; }
        .af-sub-title { font-size:0.68rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#452829; margin-bottom:0.85rem; }
        .ts-row { display:grid; grid-template-columns:1fr 1fr 1fr 30px; gap:0.45rem; align-items:center; margin-bottom:0.45rem; }
        .ts-add { display:inline-flex; align-items:center; gap:0.3rem; background:rgba(69,40,41,0.08); border:1px solid rgba(69,40,41,0.2); color:#452829; font-family:'Tajawal',sans-serif; font-size:0.75rem; padding:0.28rem 0.7rem; border-radius:4px; cursor:pointer; transition:background 0.2s; margin-top:0.3rem; }
        .ts-add:hover { background:rgba(69,40,41,0.15); }
        .ts-del { background:rgba(192,57,43,0.08); border:none; color:#c0392b; cursor:pointer; border-radius:4px; padding:0.28rem; display:flex; align-items:center; justify-content:center; }
        .img-row { display:grid; grid-template-columns:1fr 30px; gap:0.45rem; align-items:center; margin-bottom:0.45rem; }
        .af-toggle { display:flex; align-items:center; gap:0.5rem; cursor:pointer; padding-top:0.2rem; }
        .af-toggle span { font-size:0.85rem; color:#555; }
        .af-actions { display:flex; gap:0.8rem; justify-content:flex-end; padding-top:0.5rem; border-top:1px solid #e8e2dc; }
        .af-cancel { background:white; border:1.5px solid #e8e2dc; color:#888; font-family:'Tajawal',sans-serif; font-size:0.88rem; padding:0.62rem 1.4rem; border-radius:5px; cursor:pointer; transition:all 0.2s; }
        .af-cancel:hover { color:#1a1a1a; border-color:#ccc; }
        .af-save { background:#452829; border:none; color:white; font-family:'Tajawal',sans-serif; font-size:0.88rem; font-weight:700; padding:0.62rem 1.7rem; border-radius:5px; cursor:pointer; display:flex; align-items:center; gap:0.4rem; transition:background 0.2s; }
        .af-save:hover { background:#5c3637; }
        .af-save:disabled { opacity:0.6; cursor:not-allowed; }
        .pm-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.8rem; flex-wrap:wrap; gap:1rem; }
        .pm-heading { font-family:'Playfair Display',serif; font-size:1.4rem; color:#1a1a1a; font-weight:700; }
        .pm-actions { display:flex; gap:0.8rem; align-items:center; }
        .pm-search { position:relative; }
        .pm-search input { background:white; border:1.5px solid #e8e2dc; color:#1a1a1a; font-family:'Tajawal',sans-serif; font-size:0.85rem; padding:0.55rem 2.2rem 0.55rem 0.85rem; border-radius:5px; outline:none; width:240px; transition:border-color 0.2s; }
        .pm-search input:focus { border-color:#452829; }
        .pm-search-icon { position:absolute; right:0.65rem; top:50%; transform:translateY(-50%); color:#bbb; pointer-events:none; }
        .add-btn { display:flex; align-items:center; gap:0.4rem; background:#452829; border:none; color:white; font-family:'Tajawal',sans-serif; font-size:0.88rem; font-weight:700; padding:0.55rem 1.2rem; border-radius:5px; cursor:pointer; transition:background 0.2s; white-space:nowrap; }
        .add-btn:hover { background:#5c3637; }
        .pm-table-wrap { background:white; border:1px solid #e8e2dc; border-radius:10px; overflow:hidden; overflow-x:auto; }
        .pm-table { width:100%; border-collapse:collapse; table-layout:fixed; min-width:720px; }
        .pm-table thead th { background:#faf8f6; padding:0.65rem 0.9rem; font-size:0.68rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#aaa; text-align:right; border-bottom:1.5px solid #e8e2dc; white-space:nowrap; overflow:hidden; }
        .pm-row td { padding:0.75rem 0.9rem; border-bottom:1px solid #f5f1ed; font-size:0.82rem; vertical-align:middle; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pm-row:last-child td { border-bottom:none; }
        .pm-row:hover td { background:#fdfcfb; }
        .pm-img { width:40px; height:40px; border-radius:5px; object-fit:cover; }
        .pm-img-ph { width:40px; height:40px; border-radius:5px; background:#f5f1ed; display:flex; align-items:center; justify-content:center; color:#ccc; }
        .pm-name { font-weight:600; color:#1a1a1a; display:block; font-size:0.84rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pm-name-ar { font-size:0.72rem; color:#888; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pm-brand { font-size:0.78rem; color:#666; }
        .avail-badge { font-size:0.63rem; font-weight:700; padding:0.18rem 0.5rem; border-radius:3px; letter-spacing:0.03em; }
        .av-full    { background:rgba(69,40,41,0.1); color:#452829; }
        .av-taqseem { background:#eff4ff; color:#1e4db7; }
        .av-both    { background:#f0fdf4; color:#2e7d5a; }
        .toggle-btn { cursor:pointer; background:none; border:none; display:flex; align-items:center; }
        .pm-edit { background:none; border:none; color:#bbb; cursor:pointer; padding:0.28rem; border-radius:4px; display:inline-flex; transition:all 0.2s; }
        .pm-edit:hover { color:#1a1a1a; background:#f5f1ed; }
        .pm-del { background:none; border:none; color:#ddd; cursor:pointer; padding:0.28rem; border-radius:4px; display:inline-flex; transition:all 0.2s; }
        .pm-del:hover { color:#c0392b; background:#fef2f2; }
        .form-panel { background:white; border:1px solid #e8e2dc; border-radius:10px; padding:1.8rem; }
        .form-panel-title { font-family:'Playfair Display',serif; font-size:1.1rem; color:#1a1a1a; font-weight:600; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid #e8e2dc; display:flex; align-items:center; justify-content:space-between; }
        .fp-close { background:none; border:none; color:#aaa; cursor:pointer; }
        .fp-close:hover { color:#1a1a1a; }
        .admin-toast { position:fixed; bottom:2rem; left:50%; transform:translateX(-50%); padding:0.75rem 1.5rem; border-radius:6px; font-size:0.88rem; font-weight:600; z-index:9999; white-space:nowrap; animation:slideUp 0.3s ease; font-family:'Tajawal',sans-serif; }
        .admin-toast.success { background:#2e7d5a; color:white; }
        .admin-toast.error { background:#c0392b; color:white; }
        @keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .empty-pm { text-align:center; padding:3rem; color:#aaa; }
        .empty-pm p { margin-top:0.5rem; font-size:0.88rem; }

        @media(max-width:600px){
          .pm-header{flex-direction:column;align-items:flex-start;gap:0.65rem;margin-bottom:1rem;}
          .pm-heading{font-size:1.1rem;}
          .pm-actions{width:100%;display:flex;gap:0.5rem;}
          .pm-search{flex:1;}
          .pm-search input{width:100%;font-size:0.8rem;}
          .add-btn{font-size:0.8rem;padding:0.45rem 0.85rem;}
          .pm-table-wrap{overflow-x:auto;}
          .pm-table{min-width:700px;}
          .pm-table thead th{padding:0.5rem 0.65rem;font-size:0.6rem;}
          .pm-row td{padding:0.55rem 0.65rem;font-size:0.76rem;}
          .pm-img,.pm-img-ph{width:32px;height:32px;}
          .avail-badge{font-size:0.58rem;padding:0.12rem 0.38rem;}
          .form-panel{padding:1rem;}
          .form-panel-title{font-size:0.95rem;margin-bottom:1rem;padding-bottom:0.75rem;}
          .af-row-2{grid-template-columns:1fr;}
          .af-row-3{grid-template-columns:1fr 1fr;}
          .af-input,.af-select,.af-textarea{font-size:0.84rem;padding:0.52rem 0.7rem;}
          .af-label{font-size:0.65rem;}
          .af-subsection{padding:0.85rem;}
          .ts-row{grid-template-columns:1fr 1fr 1fr 26px;gap:0.35rem;}
          .af-actions{gap:0.55rem;}
          .af-cancel,.af-save{font-size:0.82rem;padding:0.52rem 1rem;}
        }
      `}</style>

      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}

      {mode === "list" ? (
        <>
          <div className="pm-header">
            <h2 className="pm-heading">إدارة العطور</h2>
            <div className="pm-actions">
              <div className="pm-search">
                <Search size={14} className="pm-search-icon" />
                <input
                  placeholder="بحث بالاسم أو البراند..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                className="add-btn"
                onClick={() => { setEditing(null); setMode("add"); }}
              >
                <Plus size={15} /> إضافة عطر
              </button>
            </div>
          </div>

          <div className="pm-table-wrap">
            {loading ? (
              <div className="empty-pm">
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#452829" }} />
                <p>جاري التحميل...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-pm">
                <Package size={32} strokeWidth={1} />
                <p>لا توجد عطور. أضف أول عطر!</p>
              </div>
            ) : (
              <table className="pm-table">
                <colgroup>
                  <col style={{ width: "50px" }} />
                  <col style={{ width: "180px" }} />
                  <col style={{ width: "90px" }} />
                  <col style={{ width: "65px" }} />
                  <col style={{ width: "75px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "55px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "68px" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>صورة</th>
                    <th>الاسم</th>
                    <th>البراند</th>
                    <th>النوع</th>
                    <th>البيع</th>
                    <th>السعر</th>
                    <th>مخزون</th>
                    <th>نشط</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const img =
                      p.images?.find((i) => i.isMain)?.url ?? p.images?.[0]?.url;
                    const avClass =
                      p.availability === "full_only" ? "av-full"
                      : p.availability === "taqseem_only" ? "av-taqseem"
                      : "av-both";
                    const avLabel =
                      p.availability === "full_only" ? "كاملة"
                      : p.availability === "taqseem_only" ? "تقسيمة"
                      : "كليهما";
                    return (
                      <tr key={p._id} className="pm-row">
                        <td>
                          {img ? (
                            <img loading="lazy" src={img} alt="" className="pm-img" />
                          ) : (
                            <div className="pm-img-ph">
                              <Package size={15} />
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="pm-name">{p.name}</span>
                          {p.nameAr && p.nameAr.trim() !== "" && (
                            <span className="pm-name-ar">{p.nameAr}</span>
                          )}
                        </td>
                        <td>
                          <span className="pm-brand">{p.brand}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.76rem", color: "#888" }}>
                            {p.perfumeType === "arabic" ? "عربي" : "أجنبي"}
                          </span>
                        </td>
                        <td>
                          <span className={`avail-badge ${avClass}`}>{avLabel}</span>
                        </td>
                        <td>
                          <span style={{ color: "#452829", fontWeight: 700, fontSize: "0.8rem" }}>
                            {displayPrice(p)}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: "#888", fontSize: "0.8rem" }}>
                            {p.fullBottle?.stock ?? 0}
                          </span>
                        </td>
                        <td>
                          <button className="toggle-btn" onClick={() => handleToggle(p)}>
                            {p.isActive ? (
                              <ToggleRight size={22} color="#2e7d5a" />
                            ) : (
                              <ToggleLeft size={22} color="#ccc" />
                            )}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.2rem" }}>
                            <button
                              className="pm-edit"
                              onClick={() => { setEditing(p); setMode("edit"); }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="pm-del"
                              onClick={() => handleDelete(p._id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="form-panel">
          <div className="form-panel-title">
            <span>
              {mode === "edit" ? `تعديل: ${editing?.name}` : "إضافة عطر جديد"}
            </span>
            <button
              className="fp-close"
              onClick={() => { setMode("list"); setEditing(null); }}
            >
              <X size={18} />
            </button>
          </div>
          <PerfumeForm
            initial={editing ?? null}
            onSave={handleSave}
            onCancel={() => { setMode("list"); setEditing(null); }}
            saving={saving}
          />
        </div>
      )}
    </>
  );
}