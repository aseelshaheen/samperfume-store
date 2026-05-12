import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Loader2,
  MapPin,
  Phone,
  Tag,
  ArrowLeft,
  Package,
  User,
  CheckCircle,
  Edit3,
  Save,
  X,
  StickyNote,
  ChevronDown,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";;
const getToken = () => localStorage.getItem("sp_token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/* ── Guest cart helpers ─────────────────────────────────────────────────── */
const GUEST_CART_KEY = "sp_guest_cart";

export function guestCartAdd(item) {
  const cart = guestCartGet();
  const idx = cart.findIndex(
    (i) =>
      i.perfumeId === item.perfumeId &&
      i.section === item.section &&
      i.size === item.size,
  );
  if (idx >= 0) {
    cart[idx].quantity += item.quantity ?? 1;
  } else {
    cart.push({
      ...item,
      _guestId: "g_" + Date.now() + "_" + Math.floor(Math.random() * 9999),
      quantity: item.quantity ?? 1,
    });
  }
  sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

export function guestCartGet() {
  try {
    return JSON.parse(sessionStorage.getItem(GUEST_CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function guestCartSave(items) {
  sessionStorage.setItem(
    GUEST_CART_KEY,
    JSON.stringify(items.map(({ perfume, ...rest }) => rest)),
  );
}

/* ── Regions ────────────────────────────────────────────────────────────── */
const REGIONS = [
  { label: "الضفة الغربية", value: "west_bank", shipping: 20 },
  { label: "القدس", value: "jerusalem", shipping: 50 },
  { label: "الداخل المحتل (48)", value: "inside_48", shipping: 70 },
];

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
export default function Cart() {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  /* ── Guest fields ── */
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestRegion, setGuestRegion] = useState("");
  const [guestCity, setGuestCity] = useState("");
  const [guestNotes, setGuestNotes] = useState("");

  /* ── Auth checkout fields ── */
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [street, setStreet] = useState("");
  const [addrNotes, setAddrNotes] = useState("");
  const [addrLabel, setAddrLabel] = useState("المنزل");
  const [saveAddr, setSaveAddr] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  /* ── Edit mode ── */
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingAddr, setEditingAddr] = useState(false);

  /* ── Promo / order ── */
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderDone, setOrderDone] = useState(null);
  const [error, setError] = useState("");

  /* ── Load ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (isLoggedIn) {
        try {
          const [cRes, uRes] = await Promise.all([
            fetch(`${API}/users/cart`, { headers: authHeaders() }),
            fetch(`${API}/auth/me`, { headers: authHeaders() }),
          ]);
          const cData = await cRes.json();
          const uData = await uRes.json();

          if (cData.success) setCart(cData.cart ?? []);
          if (uData.success) {
            const u = uData.user;
            setUser(u);

            if (u.phone) {
              setPhone(u.phone);
              setEditingPhone(false);
            } else {
              setEditingPhone(true);
            }

            const def =
              u.addresses?.find((a) => a.isDefault) ?? u.addresses?.[0];
            if (def) {
              setSelectedAddrId(def._id);
              setEditingAddr(false);
            } else {
              setSelectedAddrId(null);
              setEditingAddr(true);
            }
          }
        } catch {}
      } else {
        const raw = guestCartGet();
        if (raw.length === 0) {
          setLoading(false);
          return;
        }

        const uniqueSlugs = [
          ...new Set(raw.map((i) => i.slug).filter(Boolean)),
        ];
        if (uniqueSlugs.length > 0) {
          try {
            const results = await Promise.all(
              uniqueSlugs.map((slug) =>
                fetch(`${API}/perfumes/${slug}`)
                  .then((r) => r.json())
                  .then((d) => d.perfume ?? null)
                  .catch(() => null),
              ),
            );
            const perfumeMap = {};
            results.forEach((p) => {
              if (p) {
                perfumeMap[p.slug] = p;
                perfumeMap[p._id] = p;
              }
            });
            setCart(
              raw.map((item) => ({
                ...item,
                perfume:
                  perfumeMap[item.slug] ?? perfumeMap[item.perfumeId] ?? null,
              })),
            );
          } catch {
            setCart(raw);
          }
        } else {
          setCart(raw);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  /* ── Price helper — no rounding, exact value ── */
  const getItemPrice = (item) => {
    const p = item.perfume;
    if (!p) return 0;
    if (item.section === "full") {
      const base = p.fullBottle?.price ?? 0;
      return p.discount >= 1
        ? Math.round(base - (base * p.discount) / 100)
        : base;
    }
    return p.taqseem?.sizes?.find((s) => s.ml === item.size)?.price ?? 0;
  };

  const activeRegion = REGIONS.find(
    (r) => r.value === (isLoggedIn ? region : guestRegion),
  );
  const shippingFee = activeRegion?.shipping ?? null;
  const PROMO_DISC = 0.2;
  const itemsPrice = cart.reduce(
    (sum, i) => sum + getItemPrice(i) * i.quantity,
    0,
  );
  const discountAmt = promoApplied ? Math.round(itemsPrice * PROMO_DISC) : 0;
  const totalPrice =
    shippingFee != null ? itemsPrice + shippingFee - discountAmt : null;

  const selectedAddr = user?.addresses?.find((a) => a._id === selectedAddrId);

  /* ── Guest qty/remove ── */
  const updateQtyGuest = (gid, delta) => {
    const updated = cart.map((i) =>
      i._guestId === gid
        ? { ...i, quantity: Math.max(1, i.quantity + delta) }
        : i,
    );
    setCart(updated);
    guestCartSave(updated);
  };
  const removeGuest = (gid) => {
    const updated = cart.filter((i) => i._guestId !== gid);
    setCart(updated);
    guestCartSave(updated);
  };

  /* ── Auth qty/remove ── */
  const updateQtyAuth = async (itemId, qty) => {
    if (qty < 1) {
      removeAuth(itemId);
      return;
    }
    try {
      await fetch(`${API}/users/cart/${itemId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ quantity: qty }),
      });
      const r = await fetch(`${API}/users/cart`, { headers: authHeaders() });
      const d = await r.json();
      if (d.success) setCart(d.cart ?? []);
    } catch {}
  };
  const removeAuth = async (itemId) => {
    try {
      await fetch(`${API}/users/cart/${itemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setCart((prev) => prev.filter((i) => i._id !== itemId));
    } catch {}
  };

  /* ── Place guest order ── */
  const placeOrderGuest = async () => {
    setError("");
    if (!guestName.trim()) {
      setError("يرجى إدخال الاسم الكامل");
      return;
    }
    if (!guestPhone.trim()) {
      setError("يرجى إدخال رقم الهاتف");
      return;
    }
    if (!guestRegion) {
      setError("يرجى اختيار المنطقة");
      return;
    }
    if (!guestCity.trim()) {
      setError("يرجى إدخال المدينة / البلدة");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch(`${API}/orders/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          guestPhone,
          guestCity: `${activeRegion?.label} - ${guestCity}`,
          notes: guestNotes,
          items: cart.map((item) => ({
            perfumeId: item.perfumeId,
            name: item.perfume?.name ?? item.name ?? "—",
            brand: item.perfume?.brand ?? item.brand ?? "—",
            image:
              item.perfume?.images?.find((i) => i.isMain)?.url ??
              item.perfume?.images?.[0]?.url ??
              null,
            section: item.section,
            size: item.section === "taqseem" ? item.size : null,
            quantity: item.quantity,
            price: getItemPrice(item),
          })),
          itemsPrice,
          shippingPrice: shippingFee,
          discount: discountAmt,
          totalPrice,
          promoCode: promoApplied ? promoCode : undefined,
          paymentMethod: "cash_on_delivery",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderDone(data.order);
        sessionStorage.removeItem(GUEST_CART_KEY);
      } else setError(data.message ?? "حدث خطأ، حاول مجدداً");
    } catch {
      setError("تعذّر الاتصال بالخادم");
    }
    setPlacing(false);
  };

  /* ── Place auth order ── */
  const placeOrderAuth = async () => {
    setError("");
    if (!phone.trim()) {
      setError("يرجى إدخال رقم الهاتف");
      return;
    }
    if (!region) {
      setError("يرجى اختيار المنطقة");
      return;
    }

    let shippingAddress;
    if (selectedAddr && !editingAddr) {
      shippingAddress = {
        city: `${activeRegion?.label} - ${selectedAddr.city}`,
        area: selectedAddr.area ?? "",
        street: selectedAddr.street ?? "",
        notes: orderNotes,
      };
    } else {
      if (!city.trim()) {
        setError("يرجى إدخال المدينة");
        return;
      }
      shippingAddress = {
        city: `${activeRegion?.label} - ${city}`,
        area,
        street,
        notes: orderNotes,
      };
    }

    const profileChanged =
      phone !== (user?.phone ?? "") || (!selectedAddr && city.trim());

    const items = cart.map((item) => ({
      perfume: item.perfume._id,
      name: item.perfume.name,
      brand: item.perfume.brand,
      image:
        item.perfume.images?.find((i) => i.isMain)?.url ??
        item.perfume.images?.[0]?.url,
      section: item.section,
      size_ml: item.size ?? null,
      quantity: item.quantity,
      price: getItemPrice(item),
    }));

    setPlacing(true);
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          items,
          phone,
          shippingAddress,
          itemsPrice,
          shippingPrice: shippingFee,
          discount: discountAmt,
          totalPrice,
          promoCode: promoApplied ? promoCode : undefined,
          paymentMethod: "cash_on_delivery",
          updateProfile: profileChanged,
          newAddress: !selectedAddr && city.trim() && saveAddr,
          addressLabel: addrLabel,
          setAsDefault: !user?.addresses?.length,
        }),
      });
      const data = await res.json();
      if (data.success) setOrderDone(data.order);
      else setError(data.message ?? "حدث خطأ");
    } catch {
      setError("خطأ في الاتصال");
    }
    setPlacing(false);
  };

  /* ══════════════════════════════════════════════════════════════════════════
     ORDER SUCCESS SCREEN
     ══════════════════════════════════════════════════════════════════════════ */
  if (orderDone)
    return (
      <>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Tajawal:wght@400;500;700&display=swap');
        body{font-family:'Tajawal',sans-serif;direction:rtl;background:#fff;}
        @keyframes pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
        <div
          style={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            direction: "rtl",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "#f0fdf4",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pop 0.5s ease both",
            }}
          >
            <CheckCircle size={40} color="#2e7d5a" strokeWidth={1.5} />
          </div>
          <h2
            style={{
              fontFamily: "Playfair Display,serif",
              fontSize: "1.8rem",
              color: "#1a1a1a",
              animation: "rise 0.5s 0.15s ease both",
              opacity: 0,
            }}
          >
            تم تقديم طلبك!
          </h2>
          <p
            style={{
              color: "#888",
              fontSize: "0.95rem",
              maxWidth: 340,
              lineHeight: 1.7,
              animation: "rise 0.5s 0.25s ease both",
              opacity: 0,
            }}
          >
            سنتواصل معك قريباً لتأكيد الطلب وتحديد موعد التوصيل.
          </p>
          <div
            style={{
              background: "#faf8f6",
              border: "1px solid #e8e2dc",
              borderRadius: 8,
              padding: "1rem 2rem",
              fontSize: "0.88rem",
              color: "#555",
              animation: "rise 0.5s 0.35s ease both",
              opacity: 0,
            }}
          >
            رقم الطلب:{" "}
            <strong
              style={{ color: "#452829", fontFamily: "Playfair Display,serif" }}
            >
              SP-{orderDone._id?.slice(-5).toUpperCase()}
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.8rem",
              flexWrap: "wrap",
              justifyContent: "center",
              animation: "rise 0.5s 0.45s ease both",
              opacity: 0,
            }}
          >
            <button
              onClick={() => navigate("/")}
              style={{
                background: "#452829",
                color: "white",
                border: "none",
                padding: "0.75rem 1.8rem",
                borderRadius: 5,
                fontFamily: "Tajawal,sans-serif",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              الرئيسية
            </button>
            <button
              onClick={() => navigate("/shop")}
              style={{
                background: "white",
                color: "#452829",
                border: "1.5px solid #e8e2dc",
                padding: "0.75rem 1.8rem",
                borderRadius: 5,
                fontFamily: "Tajawal,sans-serif",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              مواصلة التسوق
            </button>
          </div>
        </div>
      </>
    );

  /* ══════════════════════════════════════════════════════════════════════════
     MAIN CART PAGE
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Tajawal:wght@300;400;500;700&display=swap');
        :root{--bob:#452829;--bob-l:#5c3637;--border:#e8e2dc;--off:#faf8f6;--black:#1a1a1a;--gray:#888;--green:#2e7d5a;--green-bg:#f0fdf4;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Tajawal',sans-serif;direction:rtl;background:#fff;color:#1a1a1a;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        /* Layout */
        .cart-header{padding:2rem 2rem 0;max-width:1400px;margin:0 auto;}
        .cart-title{font-family:'Playfair Display',serif;font-size:2rem;color:var(--black);font-weight:700;margin-bottom:0.3rem;}
        .cart-sub{font-size:0.88rem;color:var(--gray);}
        .cart-layout{max-width:1400px;margin:0 auto;padding:2rem;display:grid;grid-template-columns:1fr 420px;gap:2rem;align-items:start;}

        /* Cart items */
        .cart-item{display:flex;gap:1.2rem;padding:1.3rem 0;border-bottom:1px solid var(--border);align-items:center;}
        .cart-item:last-child{border-bottom:none;}
        .ci-img-wrap{width:86px;height:86px;border-radius:6px;overflow:hidden;background:var(--off);flex-shrink:0;}
        .ci-img{width:100%;height:100%;object-fit:cover;display:block;}
        .ci-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;}
        .ci-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:0.25rem;}
        .ci-brand{font-size:0.63rem;letter-spacing:0.14em;text-transform:uppercase;color:#aaa;}
        .ci-name{font-family:'Playfair Display',serif;font-size:0.98rem;color:var(--black);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .ci-section{font-size:0.74rem;color:var(--gray);}
        .ci-right{display:flex;flex-direction:column;align-items:flex-end;gap:0.55rem;flex-shrink:0;}
        .ci-price{font-family:'Playfair Display',serif;font-size:1rem;color:var(--bob);font-weight:700;}
        .ci-qty{display:flex;align-items:center;border:1.5px solid var(--border);border-radius:5px;overflow:hidden;}
        .ci-qty-btn{background:none;border:none;width:30px;height:30px;cursor:pointer;font-size:1rem;color:var(--black);display:flex;align-items:center;justify-content:center;transition:background 0.2s;}
        .ci-qty-btn:hover{background:var(--off);}
        .ci-qty-num{width:32px;text-align:center;font-size:0.85rem;font-weight:600;}
        .ci-remove{background:none;border:none;color:#ccc;cursor:pointer;padding:0.2rem;border-radius:4px;display:flex;transition:color 0.2s;}
        .ci-remove:hover{color:#c0392b;}

        /* Empty */
        .cart-empty{text-align:center;padding:4rem 2rem;display:flex;flex-direction:column;align-items:center;gap:1rem;color:var(--gray);}
        .cart-empty h2{font-family:'Playfair Display',serif;color:var(--black);}

        /* Summary panel */
        .cart-summary{background:var(--off);border:1px solid var(--border);border-radius:10px;padding:1.5rem;position:sticky;top:100px;}
        .cs-title{font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--black);font-weight:700;margin-bottom:1.3rem;}
        .delivery-alert{
  background:#fff1f1;
  border:1px solid #f5bcbc;
  color:#b42318;
  padding:0.7rem 0.85rem;
  border-radius:6px;
  font-size:0.76rem;
  line-height:1.7;
  margin-top:0.45rem;
}
        /* Section headers */
        .section-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;}
        .section-label{font-size:0.67rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;display:flex;align-items:center;gap:0.35rem;}
        .edit-btn{background:none;border:1px solid var(--border);color:#aaa;font-family:'Tajawal',sans-serif;font-size:0.72rem;padding:0.18rem 0.55rem;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:0.25rem;transition:all 0.2s;}
        .edit-btn:hover{border-color:var(--bob);color:var(--bob);}
        .edit-btn.active{background:var(--bob);color:white;border-color:var(--bob);}

        /* Display pills */
        .data-pill{background:white;border:1.5px solid var(--border);border-radius:6px;padding:0.6rem 0.85rem;font-size:0.87rem;color:var(--black);margin-bottom:0.6rem;display:flex;align-items:center;gap:0.5rem;line-height:1.4;}
        .data-pill-icon{color:#aaa;flex-shrink:0;}
        .data-pill-main{flex:1;}
        .data-pill-sub{font-size:0.74rem;color:#aaa;display:block;margin-top:0.1rem;}

        /* Inputs */
        .cs-field{margin-bottom:0.6rem;}
        .cs-input,.cs-select,.cs-textarea{background:white;border:1.5px solid var(--border);color:var(--black);font-family:'Tajawal',sans-serif;font-size:0.88rem;padding:0.58rem 0.82rem;border-radius:5px;outline:none;width:100%;transition:border-color 0.2s;}
        .cs-input:focus,.cs-select:focus,.cs-textarea:focus{border-color:var(--bob);}
        .cs-textarea{resize:vertical;min-height:68px;line-height:1.5;}
        .cs-select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:left 0.82rem center;}
        .cs-row-2{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;}
        .cs-small-label{font-size:0.68rem;color:#aaa;margin-bottom:0.2rem;display:block;}

        /* Shipping badge */
        .ship-badge{display:inline-flex;align-items:center;gap:0.3rem;font-size:0.73rem;font-weight:700;padding:0.28rem 0.65rem;border-radius:20px;margin:0.3rem 0 0.75rem;}
        .sb-west{background:#edf5ee;color:#2a6b3a;}
        .sb-jerusalem{background:#fdf4e7;color:#7a5020;}
        .sb-inside{background:#fef2f2;color:#9b2929;}

        /* Address selector */
        .addr-list{display:flex;flex-direction:column;gap:0.35rem;margin-bottom:0.6rem;}
        .addr-opt{display:flex;align-items:flex-start;gap:0.55rem;padding:0.6rem 0.75rem;border:1.5px solid var(--border);border-radius:5px;cursor:pointer;background:white;transition:border-color 0.2s;}
        .addr-opt.sel{border-color:var(--bob);background:rgba(69,40,41,0.03);}
        .addr-radio{width:15px;height:15px;accent-color:var(--bob);margin-top:2px;flex-shrink:0;}
        .addr-text{font-size:0.82rem;color:var(--black);line-height:1.5;}
        .addr-lbl{font-size:0.67rem;color:#aaa;margin-bottom:0.1rem;}

        /* Save address checkbox */
        .save-addr-row{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem;margin-top:0.2rem;}
        .save-addr-row input{accent-color:var(--bob);width:14px;height:14px;}
        .save-addr-row label{font-size:0.8rem;color:#555;cursor:pointer;}

        /* Guest notice */
        .guest-notice{background:#fff8f0;border:1px solid #fde8c8;border-radius:6px;padding:0.6rem 0.85rem;margin-bottom:1rem;font-size:0.77rem;color:#b5620a;}

        /* Promo */
        .promo-row{display:flex;gap:0.45rem;margin-bottom:0.9rem;}
        .promo-input{flex:1;background:white;border:1.5px solid var(--border);color:var(--black);font-family:'Tajawal',sans-serif;font-size:0.85rem;padding:0.55rem 0.8rem;border-radius:5px;outline:none;transition:border-color 0.2s;}
        .promo-input:focus{border-color:var(--bob);}
        .promo-btn{background:var(--black);color:white;border:none;padding:0.55rem 0.9rem;border-radius:5px;font-family:'Tajawal',sans-serif;font-size:0.82rem;font-weight:700;cursor:pointer;white-space:nowrap;}
        .promo-btn:hover{background:#333;}
        .promo-ok{font-size:0.77rem;color:var(--green);background:var(--green-bg);border:1px solid #86efac;padding:0.32rem 0.65rem;border-radius:4px;margin-bottom:0.8rem;}

        /* Totals */
        .divider{height:1px;background:var(--border);margin:0.85rem 0;}
        .row{display:flex;justify-content:space-between;font-size:0.85rem;color:var(--gray);margin-bottom:0.45rem;}
        .row.disc{color:var(--green);}
        .row.total{color:var(--black);font-weight:700;font-size:0.98rem;}

        /* Error + CTA */
        .cs-error{font-size:0.79rem;color:#c0392b;background:#fef2f2;border:1px solid #fecaca;padding:0.48rem 0.72rem;border-radius:4px;margin-bottom:0.75rem;}
        .place-btn{width:100%;background:var(--bob);color:white;border:none;padding:0.88rem;font-family:'Tajawal',sans-serif;font-size:0.98rem;font-weight:700;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:background 0.2s;margin-top:0.9rem;}
        .place-btn:hover:not(:disabled){background:var(--bob-l);}
        .place-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .cs-note{font-size:0.71rem;color:#aaa;text-align:center;margin-top:0.7rem;line-height:1.6;}

        /* Collapse animation */
        .form-block{animation:fadeSlide 0.22s ease both;}

        @media(max-width:900px){
          .cart-layout{grid-template-columns:1fr;}
          .cart-summary{position:static;}
        }
          @media(max-width:900px){
  .cart-layout{grid-template-columns:1fr;padding:1rem;}
  .cart-summary{position:static;}
}
@media(max-width:480px){
  .cart-header{padding:1rem 1rem 0;}
  .cart-title{font-size:1.35rem;}
  .cart-sub{font-size:0.78rem;}
  .cart-item{gap:0.65rem;padding:0.8rem 0;}
  .ci-img-wrap{width:60px;height:60px;flex-shrink:0;border-radius:5px;}
  .ci-brand{font-size:0.58rem;}
  .ci-name{font-size:0.84rem;}
  .ci-section{font-size:0.68rem;}
  .ci-price{font-size:0.88rem;}
  .ci-qty-btn{width:24px;height:24px;font-size:0.9rem;}
  .ci-qty-num{width:24px;font-size:0.78rem;}
  .cart-summary{padding:1rem;}
  .cs-title{font-size:0.95rem;margin-bottom:1rem;}
  .section-label{font-size:0.6rem;}
  .cs-input,.cs-select,.cs-textarea{font-size:0.82rem;padding:0.5rem 0.7rem;}
  .cs-row-2{grid-template-columns:1fr;}
  .data-pill{font-size:0.82rem;padding:0.5rem 0.7rem;}
  .addr-opt{padding:0.45rem 0.6rem;}
  .addr-text{font-size:0.76rem;}
  .promo-input{font-size:0.8rem;padding:0.48rem 0.65rem;}
  .promo-btn{font-size:0.78rem;padding:0.48rem 0.75rem;}
  .row{font-size:0.8rem;}
  .row.total{font-size:0.9rem;}
  .place-btn{font-size:0.88rem;padding:0.75rem;}
  .cs-note{font-size:0.67rem;}
  .guest-notice{font-size:0.73rem;padding:0.5rem 0.7rem;}
  .ship-badge{font-size:0.68rem;}
  .edit-btn{font-size:0.68rem;padding:0.15rem 0.45rem;}
  .divider{margin:0.65rem 0;}
}
      `}</style>

      {/* ── Page header ── */}
      <div className="cart-header">
        <h1 className="cart-title">سلة التسوق</h1>
        <p className="cart-sub">{cart.length} عنصر</p>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem",
            color: "#452829",
          }}
        >
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : cart.length === 0 ? (
        <div className="cart-empty">
          <ShoppingBag size={52} strokeWidth={1} color="#e8e2dc" />
          <h2>السلة فارغة</h2>
          <p>لم تضف أي منتجات بعد</p>
          <button
            onClick={() => navigate("/shop")}
            style={{
              background: "#452829",
              color: "white",
              border: "none",
              padding: "0.72rem 1.6rem",
              borderRadius: 5,
              fontFamily: "Tajawal,sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "0.4rem",
            }}
          >
            <ArrowLeft size={15} /> تسوق الآن
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* ────────── CART ITEMS ────────── */}
          <div>
            {cart.map((item, idx) => {
              const p = item.perfume;
              const img =
                p?.images?.find((i) => i.isMain)?.url ?? p?.images?.[0]?.url;
              const price = getItemPrice(item);
              const key = isLoggedIn
                ? (item._id ?? idx)
                : (item._guestId ?? idx);

              return (
                <div key={String(key)} className="cart-item">
                  <div className="ci-img-wrap">
                    {img ? (
                      <img loading="lazy"
                        src={img}
                        alt={p?.name ?? item.name}
                        className="ci-img"
                      />
                    ) : (
                      <div className="ci-img-ph">
                        <Package size={26} />
                      </div>
                    )}
                  </div>
                  <div className="ci-body">
                    <span className="ci-brand">{p?.brand ?? item.brand}</span>
                    <span className="ci-name">{p?.name ?? item.name}</span>
                    <span className="ci-section">
                      {item.section === "full"
                        ? "قارورة كاملة"
                        : `تقسيمة · ${item.size ?? ""}مل`}
                    </span>
                  </div>
                  <div className="ci-right">
                    <span className="ci-price">
                      {price > 0
                        ? `₪${Math.round(price * item.quantity)}`
                        : "—"}
                    </span>
                    <div className="ci-qty">
                      <button
                        className="ci-qty-btn"
                        onClick={() =>
                          isLoggedIn
                            ? updateQtyAuth(item._id, item.quantity - 1)
                            : updateQtyGuest(item._guestId, -1)
                        }
                      >
                        <Minus size={12} />
                      </button>
                      <span className="ci-qty-num">{item.quantity}</span>
                      <button
                        className="ci-qty-btn"
                        onClick={() =>
                          isLoggedIn
                            ? updateQtyAuth(item._id, item.quantity + 1)
                            : updateQtyGuest(item._guestId, 1)
                        }
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      className="ci-remove"
                      onClick={() =>
                        isLoggedIn
                          ? removeAuth(item._id)
                          : removeGuest(item._guestId)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ────────── CHECKOUT SUMMARY ────────── */}
          <div className="cart-summary">
            <div className="cs-title">تفاصيل الطلب</div>

            {/* ════ GUEST CHECKOUT ════ */}
            {!isLoggedIn && (
              <>
                <div className="guest-notice">
                  🛍 لا تحتاج لتسجيل دخول — أدخل بياناتك أدناه
                </div>

                <div className="section-label">
                  <User size={12} /> بياناتك
                </div>
                <div className="cs-field" style={{ marginTop: "0.4rem" }}>
                  <input
                    className="cs-input"
                    placeholder="الاسم الكامل *"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
                <div className="cs-field">
                  <input
                    className="cs-input"
                    placeholder="رقم الهاتف *"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="divider" />

                <div className="section-label">
                  <MapPin size={12} /> عنوان التوصيل
                </div>
                <div className="cs-field" style={{ marginTop: "0.4rem" }}>
                  <select
                    className="cs-select"
                    value={guestRegion}
                    onChange={(e) => setGuestRegion(e.target.value)}
                  >
                    <option value="">اختر المنطقة *</option>
                    {REGIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label} — توصيل ₪{r.shipping}
                      </option>
                    ))}
                  </select>
                </div>
                {guestRegion && (
                  <div
                    className={`ship-badge ${guestRegion === "west_bank" ? "sb-west" : guestRegion === "jerusalem" ? "sb-jerusalem" : "sb-inside"}`}
                  >
                    <MapPin size={11} /> {activeRegion?.label} · رسوم التوصيل ₪
                    {activeRegion?.shipping}
                  </div>
                )}
                <div className="cs-field">
                  <input
                    className="cs-input"
                    placeholder="المدينة / البلدة *"
                    value={guestCity}
                    onChange={(e) => setGuestCity(e.target.value)}
                  />
                </div>
                <div className="divider" />

                <div className="section-label">
                  <StickyNote size={12} /> ملاحظات الطلب
                </div>
                <div className="cs-field" style={{ marginTop: "0.4rem" }}>
                  <textarea
                    className="cs-textarea"
                    placeholder="ملاحظات للتوصيل أو الطلب (اختياري)"
                    value={guestNotes}
                    onChange={(e) => setGuestNotes(e.target.value)}
                  />
                  <div className="delivery-alert">
                    قد تستغرق مدة التوصيل من 2 إلى 5 أيام عمل حسب المنطقة والضغط
                    على الطلبات. إذا كان الطلب مستعجلاً، يرجى كتابة ملاحظة
                    وسنتواصل معك بأقرب وقت ممكن.
                  </div>
                </div>
              </>
            )}

            {/* ════ AUTH CHECKOUT ════ */}
            {isLoggedIn && (
              <>
                {/* ── Phone ── */}
                <div className="section-hd">
                  <div className="section-label">
                    <Phone size={12} /> رقم الهاتف
                  </div>
                  {phone && (
                    <button
                      className={`edit-btn ${editingPhone ? "active" : ""}`}
                      onClick={() => setEditingPhone(!editingPhone)}
                    >
                      {editingPhone ? (
                        <>
                          <X size={11} /> إلغاء
                        </>
                      ) : (
                        <>
                          <Edit3 size={11} /> تعديل
                        </>
                      )}
                    </button>
                  )}
                </div>

                {!editingPhone && phone ? (
                  <div className="data-pill">
                    <Phone size={14} className="data-pill-icon" />
                    <span className="data-pill-main" dir="ltr">
                      {phone}
                    </span>
                  </div>
                ) : (
                  <div className="cs-field form-block">
                    <input
                      className="cs-input"
                      type="tel"
                      placeholder="05X XXX XXXX *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      dir="ltr"
                    />
                  </div>
                )}

                <div className="divider" />

                {/* ── Region ── */}
                <div
                  className="section-label"
                  style={{ marginBottom: "0.45rem" }}
                >
                  <MapPin size={12} /> المنطقة
                </div>
                <div className="cs-field">
                  <select
                    className="cs-select"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="">اختر المنطقة *</option>
                    {REGIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label} — توصيل ₪{r.shipping}
                      </option>
                    ))}
                  </select>
                </div>
                {region && (
                  <div
                    className={`ship-badge ${region === "west_bank" ? "sb-west" : region === "jerusalem" ? "sb-jerusalem" : "sb-inside"}`}
                  >
                    <MapPin size={11} /> {activeRegion?.label} · رسوم التوصيل ₪
                    {activeRegion?.shipping}
                  </div>
                )}

                {/* ── Address ── */}
                <div className="section-hd">
                  <div className="section-label">
                    <MapPin size={12} /> عنوان التوصيل
                  </div>
                  {user?.addresses?.length > 0 && (
                    <button
                      className={`edit-btn ${editingAddr ? "active" : ""}`}
                      onClick={() => {
                        setEditingAddr(!editingAddr);
                        if (!editingAddr) setSelectedAddrId(null);
                      }}
                    >
                      {editingAddr ? (
                        <>
                          <X size={11} /> إلغاء
                        </>
                      ) : (
                        <>
                          <Plus size={11} /> عنوان جديد
                        </>
                      )}
                    </button>
                  )}
                </div>

                {user?.addresses?.length > 0 && !editingAddr && (
                  <div className="addr-list">
                    {user.addresses.map((a) => (
                      <div
                        key={a._id}
                        className={`addr-opt ${selectedAddrId === a._id ? "sel" : ""}`}
                        onClick={() => setSelectedAddrId(a._id)}
                      >
                        <input
                          type="radio"
                          className="addr-radio"
                          readOnly
                          checked={selectedAddrId === a._id}
                        />
                        <div>
                          <div className="addr-lbl">
                            {a.label}
                            {a.isDefault ? " · الافتراضي" : ""}
                          </div>
                          <div className="addr-text">
                            {[a.city, a.area, a.street]
                              .filter(Boolean)
                              .join("، ")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(editingAddr || !user?.addresses?.length) && (
                  <div className="form-block">
                    <div
                      className="cs-row-2"
                      style={{ marginBottom: "0.5rem" }}
                    >
                      <div>
                        <span className="cs-small-label">المدينة *</span>
                        <input
                          className="cs-input"
                          placeholder="مثل: نابلس"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="cs-small-label">الحي / المنطقة</span>
                        <input
                          className="cs-input"
                          placeholder="اختياري"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="cs-field">
                      <span className="cs-small-label">الشارع</span>
                      <input
                        className="cs-input"
                        placeholder="اختياري"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                    </div>
                    <div className="save-addr-row">
                      <input
                        type="checkbox"
                        id="saveAddr"
                        checked={saveAddr}
                        onChange={(e) => setSaveAddr(e.target.checked)}
                      />
                      <label htmlFor="saveAddr">
                        حفظ هذا العنوان في ملفي الشخصي
                      </label>
                    </div>
                    {saveAddr && (
                      <div className="cs-field form-block">
                        <span className="cs-small-label">اسم العنوان</span>
                        <input
                          className="cs-input"
                          placeholder="مثل: المنزل، العمل..."
                          value={addrLabel}
                          onChange={(e) => setAddrLabel(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="divider" />

                {/* ── Order notes ── */}
                <div
                  className="section-label"
                  style={{ marginBottom: "0.45rem" }}
                >
                  <StickyNote size={12} /> ملاحظات الطلب
                </div>
                <div className="cs-field">
                  <textarea
                    className="cs-textarea"
                    placeholder="ملاحظات للتوصيل أو أي تفاصيل إضافية (اختياري)"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                  <div className="delivery-alert">
                    قد تستغرق مدة التوصيل من 2 إلى 5 أيام عمل حسب المنطقة والضغط
                    على الطلبات. إذا كان الطلب مستعجلاً، يرجى كتابة ملاحظة
                    وسنتواصل معك بأقرب وقت ممكن.
                  </div>
                </div>
              </>
            )}

            <div className="divider" />

            {/* ── Price breakdown ── */}
            <div className="row">
              <span>المجموع الفرعي</span>
              <span>₪{Math.round(itemsPrice)}</span>
            </div>
            <div className="row">
              <span>رسوم التوصيل</span>
              <span>
                {shippingFee != null ? `₪${shippingFee}` : "اختر المنطقة"}
              </span>
            </div>
            {promoApplied && (
              <div className="row disc">
                <span>خصم الكود</span>
                <span>-₪{discountAmt}</span>
              </div>
            )}
            <div className="divider" />
            <div className="row total">
              <span>الإجمالي</span>
              <span>
                {totalPrice != null ? `₪${Math.round(totalPrice)}` : "—"}
              </span>
            </div>

            {error && <div className="cs-error">⚠ {error}</div>}

            <button
              className="place-btn"
              onClick={isLoggedIn ? placeOrderAuth : placeOrderGuest}
              disabled={placing || totalPrice == null}
            >
              {placing ? (
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <ShoppingBag size={16} />
              )}
              {placing ? "جاري التأكيد..." : "تأكيد الطلب"}
            </button>

            <p className="cs-note">
              الدفع عند الاستلام · شحن خلال 2-5 أيام عمل
            </p>
          </div>
        </div>
      )}
    </>
  );
}
