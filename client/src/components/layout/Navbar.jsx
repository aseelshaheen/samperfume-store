import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Heart,
  User,
  LogOut,
  Package,
  ListOrdered,
  ChevronDown,
  LayoutDashboard,
  Layers,
} from "lucide-react";
import { guestCartGet } from "./../../pages/Cart";

const API = import.meta.env.VITE_API_URL || "/api";;
const getToken = () => localStorage.getItem("sp_token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export default function Navbar({ currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = currentUser?.role === "admin";

  const refreshCartCount = useCallback(async () => {
    if (getToken()) {
      try {
        const res = await fetch(`${API}/users/cart`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          const total = (data.cart ?? []).reduce(
            (s, i) => s + (i.quantity ?? 1),
            0,
          );
          setCartCount(total);
        }
      } catch {}
    } else {
      const guest = guestCartGet();
      setCartCount(guest.reduce((s, i) => s + (i.quantity ?? 1), 0));
    }
  }, []);

  useEffect(() => {
    refreshCartCount();
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("sp_token");
    onLogout?.();
    navigate("/");
    setIsOpen(false);
    setUserMenuOpen(false);
  };

  const isActive = (href) => location.pathname === href;

  // Desktop nav links — "المتجر" stays as-is on desktop
  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "المتجر", href: "/shop" },
    { label: "العلامات", href: "/brands" },
    { label: "تواصل", href: "/contact" },
  ];

  // Helper: navigate to /shop and set the section via query param
  // Shop.jsx reads ?section= on mount to activate the right tab
  const goToShopSection = (section) => {
    navigate(`/shop?section=${section}`);
    setIsOpen(false);
  };

  const isShopSectionActive = (section) => {
    const params = new URLSearchParams(location.search);
    return location.pathname === "/shop" && params.get("section") === section;
  };

  const userInitial = (currentUser?.username ||
    currentUser?.email ||
    "U")[0].toUpperCase();
  const userName = currentUser?.username || currentUser?.email?.split("@")[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Tajawal:wght@300;400;500;700&display=swap');

        :root {
          --bob:       #452829;
          --bob-light: #6b3d3e;
          --bob-pale:  rgba(69,40,41,0.12);
          --surface:   #111010;
          --surface-2: #1c1a1a;
          --border:    rgba(255,255,255,0.07);
          --muted:     #8a8585;
          --white:     #f5f0eb;
          --gold:      #c4a882;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Tajawal', sans-serif; direction: rtl; }

        .navbar {
          background: #111010;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .navbar.scrolled {
          box-shadow: 0 2px 32px rgba(0,0,0,0.55);
          border-color: rgba(255,255,255,0.04);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 66px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          gap: 1rem;
        }

        .logo-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          background: none;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }
        .logo-main {
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: #f5f0eb;
  line-height: 1;
  transition: color 0.3s ease, transform 0.3s ease;
  text-transform: uppercase;
}

.logo-btn:hover .logo-main {
  color: #c4a882;
  transform: translateY(-1px);
}
        .logo-sub {
  font-size: 0.5rem;
  letter-spacing: 0.35em;
  color: #7a5a5b;
  text-transform: uppercase;
  font-weight: 700;
  font-family: 'Tajawal', sans-serif;
}

        .nav-links {
          display: flex;
          list-style: none;
          align-items: center;
          flex: 1;
          justify-content: center;
        }
        .nav-link-item a {
          font-family: 'Tajawal', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          color: #8a8585;
          text-decoration: none;
          padding: 0.5rem 1.1rem;
          display: block;
          position: relative;
          transition: color 0.25s;
          letter-spacing: 0.04em;
        }
        .nav-link-item a::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 50%;
          left: 50%;
          height: 1px;
          background: #c4a882;
          transition: right 0.3s ease, left 0.3s ease;
        }
        .nav-link-item a:hover,
        .nav-link-item a.active { color: #f5f0eb; }
        .nav-link-item a:hover::after,
        .nav-link-item a.active::after { right: 1.1rem; left: 1.1rem; }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          color: #c4896e !important;
          text-decoration: none;
          padding: 0.32rem 0.85rem !important;
          border: 1px solid rgba(69,40,41,0.4);
          border-radius: 3px;
          background: rgba(69,40,41,0.12);
          transition: background 0.2s, border-color 0.2s, color 0.2s !important;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .admin-nav-link:hover  { background: rgba(69,40,41,0.24) !important; border-color: rgba(69,40,41,0.6) !important; color: #e09a8a !important; }
        .admin-nav-link.active { background: #452829 !important; border-color: #452829 !important; color: white !important; }
        .admin-nav-link::after { display: none !important; }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-shrink: 0;
        }
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #8a8585;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: color 0.2s, background 0.2s;
        }
        .icon-btn:hover { color: #f5f0eb; background: rgba(255,255,255,0.06); }
        .cart-badge {
          position: absolute;
          top: 2px; left: 2px;
          background: #452829;
          color: white;
          font-size: 0.5rem;
          font-weight: 700;
          min-width: 14px;
          height: 14px;
          border-radius: 20px;
          padding: 0 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Tajawal', sans-serif;
        }
        .nav-divider { width: 1px; height: 16px; background: rgba(255,255,255,0.07); margin: 0 0.25rem; }

        .signin-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          color: #8a8585;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.38rem 0.9rem;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.25s;
          white-space: nowrap;
        }
        .signin-btn:hover { background: #452829; color: white; border-color: #452829; }

        .user-menu-wrap { position: relative; }
        .user-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.07);
          color: #8a8585;
          padding: 0.32rem 0.7rem 0.32rem 0.5rem;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.82rem;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.25s;
        }
        .user-btn:hover, .user-btn.open { border-color: rgba(255,255,255,0.15); background: #1c1a1a; color: #f5f0eb; }
        .user-avatar {
          width: 22px; height: 22px; border-radius: 50%; background: #452829;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 700; color: white; flex-shrink: 0;
        }
        .user-chevron { transition: transform 0.25s; color: #8a8585; }
        .user-chevron.open { transform: rotate(180deg); }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          background: #1c1a1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          min-width: 180px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6);
          opacity: 0;
          transform: translateY(-8px) scale(0.97);
          pointer-events: none;
          transition: opacity 0.22s ease, transform 0.22s ease;
          z-index: 200;
        }
        .user-dropdown.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
        .dropdown-header { padding: 0.85rem 1rem 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .dropdown-username { font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 600; color: #f5f0eb; line-height: 1.2; }
        .dropdown-email { font-size: 0.68rem; color: #8a8585; margin-top: 2px; direction: ltr; text-align: right; }
        .dropdown-role-badge {
          display: inline-flex; align-items: center; gap: 0.25rem;
          font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: #e09a8a; background: rgba(69,40,41,0.25); border: 1px solid rgba(69,40,41,0.4);
          padding: 0.12rem 0.45rem; border-radius: 3px; margin-top: 0.35rem;
        }
        .dropdown-section { padding: 0.35rem 0; }
        .dropdown-item {
          display: flex; align-items: center; gap: 0.65rem; padding: 0.6rem 1rem;
          font-family: 'Tajawal', sans-serif; font-size: 0.83rem; color: #8a8585;
          background: none; border: none; width: 100%; cursor: pointer;
          transition: background 0.18s, color 0.18s; text-align: right; direction: rtl;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.05); color: #f5f0eb; }
        .dropdown-item .di-icon {
          width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.18s;
        }
        .dropdown-item:hover .di-icon { background: rgba(255,255,255,0.1); }
        .dropdown-item.admin-item { color: #c4896e; }
        .dropdown-item.admin-item .di-icon { background: rgba(69,40,41,0.2); }
        .dropdown-item.admin-item:hover { background: rgba(69,40,41,0.15); color: #e09a8a; }
        .dropdown-item.admin-item:hover .di-icon { background: rgba(69,40,41,0.3); }
        .dropdown-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0.2rem 0; }
        .dropdown-item.danger { color: #c0726a; }
        .dropdown-item.danger .di-icon { background: rgba(192,57,43,0.12); }
        .dropdown-item.danger:hover { background: rgba(192,57,43,0.1); color: #e08a82; }
        .dropdown-item.danger:hover .di-icon { background: rgba(192,57,43,0.2); }

        .hamburger {
          display: none; background: none; border: none;
          cursor: pointer; color: #8a8585; padding: 0.4rem; transition: color 0.2s;
        }
        .hamburger:hover { color: #f5f0eb; }

        /* ══ MOBILE DRAWER ══ */
        .mobile-overlay-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px); z-index: 1001;
          opacity: 0; pointer-events: none; transition: opacity 0.35s ease;
        }
        .mobile-overlay-backdrop.open { opacity: 1; pointer-events: auto; }

        .mobile-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(340px, 88vw); background: #111010;
          border-left: 1px solid rgba(255,255,255,0.07); z-index: 1002;
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.38s cubic-bezier(0.76, 0, 0.24, 1);
          overflow-y: auto; overscroll-behavior: contain;
        }
        .mobile-drawer.open { transform: translateX(0); }
        .mobile-drawer::before {
          content: ''; position: fixed; top: 0; right: min(340px, 88vw);
          width: 2px; height: 100%;
          background: linear-gradient(to bottom, transparent, #452829, transparent);
          pointer-events: none;
        }
        .mob-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.2rem 1.4rem; border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
        }
        .mob-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: #f5f0eb; letter-spacing: 0.1em; }
        .mob-close {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); color: #8a8585;
          cursor: pointer; border-radius: 50%; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;
        }
        .mob-close:hover { background: rgba(255,255,255,0.1); color: #f5f0eb; }
        .mob-user {
          display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.4rem;
          border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
        }
        .mob-user-avatar {
          width: 40px; height: 40px; border-radius: 50%; background: #452829;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; font-weight: 700; color: white; flex-shrink: 0;
          font-family: 'Cormorant Garamond', serif;
        }
        .mob-user-name { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-weight: 600; color: #f5f0eb; line-height: 1.2; }
        .mob-user-email { font-size: 0.72rem; color: #8a8585; direction: ltr; text-align: right; }
        .mob-admin-badge {
          display: inline-flex; align-items: center; gap: 0.2rem;
          font-size: 0.58rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #e09a8a; background: rgba(69,40,41,0.25); border: 1px solid rgba(69,40,41,0.4);
          padding: 0.1rem 0.4rem; border-radius: 3px; margin-top: 0.2rem;
        }
        .mob-quick {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
        }
        .mob-quick-btn {
          display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
          padding: 0.85rem 0.4rem; background: none; border: none;
          border-left: 1px solid rgba(255,255,255,0.07); color: #8a8585;
          cursor: pointer; font-family: 'Tajawal', sans-serif; font-size: 0.65rem;
          transition: background 0.2s, color 0.2s; position: relative;
        }
        .mob-quick-btn:first-child { border-left: none; }
        .mob-quick-btn:hover { background: rgba(255,255,255,0.04); color: #f5f0eb; }
        .mob-quick-btn.admin-quick { color: #c4896e; background: rgba(69,40,41,0.08); }
        .mob-quick-btn.admin-quick:hover { background: rgba(69,40,41,0.18); color: #e09a8a; }
        .mob-nav {
          display: flex; flex-direction: column; padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
        }
        .mob-nav-label {
          font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: #452829; padding: 0.6rem 1.4rem 0.3rem; font-weight: 700;
        }
        .mob-nav-link {
          padding: 0.72rem 1.4rem; font-family: 'Tajawal', sans-serif; font-size: 0.95rem;
          color: #8a8585; background: none; border: none; text-align: right; cursor: pointer;
          transition: color 0.2s, background 0.2s, padding-right 0.2s;
          display: flex; align-items: center; justify-content: space-between;
        }
        .mob-nav-link:hover, .mob-nav-link.active { color: #f5f0eb; background: rgba(255,255,255,0.03); padding-right: 1.8rem; }
        .mob-nav-link.active { color: #c4a882; }
        .mob-nav-link::before {
          content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: #452829; opacity: 0; transition: opacity 0.2s; flex-shrink: 0;
        }
        .mob-nav-link:hover::before, .mob-nav-link.active::before { opacity: 1; }

        /* ── Mobile shop section links (العطور الكاملة / التقسيمات) ── */
        .mob-shop-sections {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .mob-shop-section-link {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.72rem 1.4rem;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.92rem;
          color: #8a8585;
          background: none;
          border: none;
          text-align: right;
          cursor: pointer;
          transition: color 0.2s, background 0.2s, padding-right 0.2s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .mob-shop-section-link:last-child { border-bottom: none; }
        .mob-shop-section-link:hover { color: #f5f0eb; background: rgba(255,255,255,0.03); padding-right: 1.8rem; }
        .mob-shop-section-link.active { color: #c4a882; background: rgba(196,168,130,0.06); padding-right: 1.8rem; }
        .mob-shop-section-icon {
          width: 28px; height: 28px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: rgba(255,255,255,0.05);
          transition: background 0.2s;
        }
        .mob-shop-section-link:hover .mob-shop-section-icon,
        .mob-shop-section-link.active .mob-shop-section-icon {
          background: rgba(69,40,41,0.2);
        }

        .mob-nav-link.admin-mob-link { color: #c4896e; font-weight: 600; }
        .mob-nav-link.admin-mob-link:hover { color: #e09a8a; background: rgba(69,40,41,0.1); padding-right: 1.8rem; }
        .mob-nav-link.admin-mob-link.active { color: #e09a8a; background: rgba(69,40,41,0.15); }
        .mob-bottom { padding: 1.2rem 1.4rem; margin-top: auto; flex-shrink: 0; }
        .mob-auth-btn {
          width: 100%; background: #452829; color: white; border: none; padding: 0.8rem;
          font-family: 'Tajawal', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer;
          border-radius: 2px; display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; transition: background 0.25s;
        }
        .mob-auth-btn:hover { background: #6b3d3e; }
        .mob-auth-btn.ghost { background: transparent; border: 1px solid rgba(255,255,255,0.07); color: #8a8585; margin-top: 0.6rem; }
        .mob-auth-btn.ghost:hover { background: rgba(255,255,255,0.04); color: #f5f0eb; }
        .mob-auth-btn.danger { background: transparent; border: 1px solid rgba(192,57,43,0.3); color: #c0726a; margin-top: 0.6rem; }
        .mob-auth-btn.danger:hover { background: rgba(192,57,43,0.1); color: #e08a82; }

        @media (max-width: 900px) {
          .nav-links      { display: none; }
          .hamburger      { display: flex; }
          .signin-btn     { display: none; }
          .user-menu-wrap { display: none; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <button className="logo-btn" onClick={() => navigate("/")}>
            <span className="logo-main">SamPerfume</span>
            <span className="logo-sub">عطور فاخرة</span>
          </button>

          <ul className="nav-links">
            {navLinks.map((l) => (
              <li key={l.label} className="nav-link-item">
                <a
                  href={l.href}
                  className={isActive(l.href) ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(l.href);
                  }}
                >
                  {l.label}
                </a>
              </li>
            ))}
            {isAdmin && (
              <li className="nav-link-item" style={{ marginRight: "0.6rem" }}>
                <a
                  href="/admin"
                  className={`admin-nav-link${isActive("/admin") ? " active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin");
                  }}
                >
                  <LayoutDashboard size={13} />
                  لوحة التحكم
                </a>
              </li>
            )}
          </ul>

          <div className="nav-actions">
            <button
              className="icon-btn"
              aria-label="المفضلة"
              onClick={() => navigate("/wishlist")}
            >
              <Heart size={17} />
            </button>
            <button
              className="icon-btn"
              aria-label="السلة"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            <div className="nav-divider" />

            {currentUser ? (
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button
                  className={`user-btn${userMenuOpen ? " open" : ""}`}
                  onClick={() => setUserMenuOpen((v) => !v)}
                >
                  <div className="user-avatar">{userInitial}</div>
                  <span>{userName}</span>
                  <ChevronDown
                    size={13}
                    className={`user-chevron${userMenuOpen ? " open" : ""}`}
                  />
                </button>

                <div className={`user-dropdown${userMenuOpen ? " open" : ""}`}>
                  <div className="dropdown-header">
                    <div className="dropdown-username">{userName}</div>
                    {currentUser.email && (
                      <div className="dropdown-email">{currentUser.email}</div>
                    )}
                    {isAdmin && (
                      <div className="dropdown-role-badge">
                        <LayoutDashboard size={8} /> مدير
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <>
                      <div className="dropdown-section">
                        <button
                          className="dropdown-item admin-item"
                          onClick={() => {
                            navigate("/admin");
                            setUserMenuOpen(false);
                          }}
                        >
                          <span className="di-icon">
                            <LayoutDashboard size={12} />
                          </span>
                          لوحة التحكم
                        </button>
                      </div>
                      <div className="dropdown-divider" />
                    </>
                  )}
                  <div className="dropdown-section">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/profile");
                        setUserMenuOpen(false);
                      }}
                    >
                      <span className="di-icon">
                        <User size={12} />
                      </span>{" "}
                      حسابي
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/my-orders");
                        setUserMenuOpen(false);
                      }}
                    >
                      <span className="di-icon">
                        <ListOrdered size={12} />
                      </span>{" "}
                      طلباتي
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/wishlist");
                        setUserMenuOpen(false);
                      }}
                    >
                      <span className="di-icon">
                        <Heart size={12} />
                      </span>{" "}
                      المفضلة
                    </button>
                  </div>
                  <div className="dropdown-divider" />
                  <div className="dropdown-section">
                    <button
                      className="dropdown-item danger"
                      onClick={handleLogout}
                    >
                      <span className="di-icon">
                        <LogOut size={12} />
                      </span>{" "}
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button className="signin-btn" onClick={() => navigate("/auth")}>
                <User size={14} /> تسجيل الدخول
              </button>
            )}

            <button
              className="hamburger"
              onClick={() => setIsOpen(true)}
              aria-label="القائمة"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <div
        className={`mobile-overlay-backdrop${isOpen ? " open" : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`mobile-drawer${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mob-head">
          <span className="mob-logo">SamPerfume</span>
          <button
            className="mob-close"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق"
          >
            <X size={15} />
          </button>
        </div>

        {currentUser && (
          <div className="mob-user">
            <div className="mob-user-avatar">{userInitial}</div>
            <div>
              <div className="mob-user-name">{userName}</div>
              {currentUser.email && (
                <div className="mob-user-email">{currentUser.email}</div>
              )}
              {isAdmin && (
                <div className="mob-admin-badge">
                  <LayoutDashboard size={8} /> مدير النظام
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mob-quick">
          <button className="mob-quick-btn" onClick={() => navigate("/cart")}>
            <div style={{ position: "relative" }}>
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -5,
                    left: -5,
                    background: "#452829",
                    color: "white",
                    fontSize: "0.5rem",
                    fontWeight: 700,
                    minWidth: 13,
                    height: 13,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 2px",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </div>
            السلة
          </button>
          <button
            className="mob-quick-btn"
            onClick={() => navigate("/wishlist")}
          >
            <Heart size={19} /> المفضلة
          </button>
          {currentUser ? (
            <>
              <button
                className="mob-quick-btn"
                onClick={() => navigate("/my-orders")}
              >
                <Package size={19} /> طلباتي
              </button>
              {isAdmin ? (
                <button
                  className="mob-quick-btn admin-quick"
                  onClick={() => navigate("/admin")}
                >
                  <LayoutDashboard size={19} /> التحكم
                </button>
              ) : (
                <button
                  className="mob-quick-btn"
                  onClick={() => navigate("/profile")}
                >
                  <User size={19} /> حسابي
                </button>
              )}
            </>
          ) : (
            <button
              className="mob-quick-btn"
              onClick={() => navigate("/auth")}
              style={{ gridColumn: "span 2" }}
            >
              <User size={19} /> دخول
            </button>
          )}
        </div>

        {/* ── Main nav links (الرئيسية، العلامات، تواصل — without المتجر) ── */}

        <nav className="mob-nav">
          <div className="mob-nav-label">القائمة الرئيسية</div>

          <button
            className={`mob-nav-link${isActive("/") ? " active" : ""}`}
            onClick={() => navigate("/")}
          >
            الرئيسية
          </button>
          <button
            className={`mob-nav-link${isShopSectionActive("full") ? " active" : ""}`}
            onClick={() => goToShopSection("full")}
          >
            العطور الكاملة
          </button>
          <button
            className={`mob-nav-link${isShopSectionActive("taqseem") ? " active" : ""}`}
            onClick={() => goToShopSection("taqseem")}
          >
            التقسيمات
          </button>

          <button
            className={`mob-nav-link${isActive("/brands") ? " active" : ""}`}
            onClick={() => navigate("/brands")}
          >
            العلامات
          </button>

          <button
            className={`mob-nav-link${isActive("/contact") ? " active" : ""}`}
            onClick={() => navigate("/contact")}
          >
            تواصل
          </button>

          {isAdmin && (
            <>
              <div className="mob-nav-label" style={{ marginTop: "0.4rem" }}>
                الإدارة
              </div>
              <button
                className={`mob-nav-link admin-mob-link${isActive("/admin") ? " active" : ""}`}
                onClick={() => navigate("/admin")}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <LayoutDashboard size={15} /> لوحة التحكم
                </span>
              </button>
            </>
          )}
        </nav>
        <div className="mob-bottom">
          {currentUser ? (
            <button className="mob-auth-btn danger" onClick={handleLogout}>
              <LogOut size={15} /> تسجيل الخروج
            </button>
          ) : (
            <>
              <button
                className="mob-auth-btn"
                onClick={() => navigate("/auth")}
              >
                <User size={15} /> تسجيل الدخول
              </button>
              <button
                className="mob-auth-btn ghost"
                onClick={() => navigate("/auth?tab=register")}
              >
                إنشاء حساب جديد
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
