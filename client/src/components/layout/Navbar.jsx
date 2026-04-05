import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Search, Heart } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount] = useState(3);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "الرئيسية", href: "#" },
    { label: "المتجر", href: "#" },
    { label: "العلامات التجارية", href: "#" },
    { label: "العروض", href: "#" },
    { label: "تواصل معنا", href: "#" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Tajawal:wght@300;400;500;700&display=swap');

        :root {
          --clr-bob: #452829;
          --clr-bob-light: #6b3d3e;
          --clr-black: #0e0e0e;
          --clr-gray-dark: #2a2a2a;
          --clr-gray-mid: #7a7a7a;
          --clr-gray-light: #c8c8c8;
          --clr-border-dark: rgba(255,255,255,0.08);
          --clr-white: #ffffff;
          --clr-off: #faf8f6;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
          background: #ffffff;
          color: #1a1a1a;
        }

        /* ── TOP BAR ── */
        .nav-top-bar {
          background: var(--clr-bob);
          text-align: center;
          padding: 0.48rem 1rem;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.88);
          font-family: 'Tajawal', sans-serif;
        }

        /* ── NAVBAR ── */
        .navbar {
          background: var(--clr-black);
          border-bottom: 1px solid var(--clr-border-dark);
          transition: box-shadow 0.3s ease;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar.scrolled {
          box-shadow: 0 2px 24px rgba(0,0,0,0.4);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* ── LOGO ── */
        .logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-decoration: none;
          gap: 1px;
        }

        .logo-main {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #9a9a9a;
          line-height: 1;
        }

        .logo-sub {
          font-size: 0.6rem;
          letter-spacing: 0.22em;
          color: var(--clr-bob);
          text-transform: uppercase;
          font-weight: 600;
        }

        /* ── NAV LINKS ── */
        .nav-links {
          display: flex;
          gap: 1.8rem;
          list-style: none;
          align-items: center;
        }

        .nav-links a {
          font-size: 0.92rem;
          font-weight: 400;
          color: var(--clr-gray-light);
          text-decoration: none;
          position: relative;
          padding-bottom: 3px;
          transition: color 0.25s;
          letter-spacing: 0.02em;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 0; height: 1.5px;
          background: var(--clr-bob);
          transition: width 0.3s ease;
        }

        .nav-links a:hover { color: #ffffff; }
        .nav-links a:hover::after { width: 100%; }

        /* ── ACTIONS ── */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--clr-gray-light);
          padding: 0.45rem;
          border-radius: 50%;
          transition: color 0.25s, background 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .icon-btn:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.07);
        }

        .cart-badge {
          position: absolute;
          top: -3px; left: -3px;
          background: var(--clr-bob);
          color: white;
          font-size: 0.58rem;
          font-weight: 700;
          width: 15px; height: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-sep {
          width: 1px; height: 18px;
          background: rgba(255,255,255,0.1);
          margin: 0 0.3rem;
        }

        /* ── HAMBURGER ── */
        .hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--clr-gray-light);
        }

        /* ── MOBILE MENU ── */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: var(--clr-black);
          z-index: 999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1);
        }

        .mobile-overlay.open { transform: translateX(0); }

        .mobile-overlay::before {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 4px; height: 100%;
          background: var(--clr-bob);
        }

        .mobile-logo {
          position: absolute;
          top: 1.6rem; right: 2rem;
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: #9a9a9a;
          letter-spacing: 0.1em;
        }

        .mobile-close {
          position: absolute;
          top: 1.4rem; left: 1.5rem;
          background: none;
          border: none;
          color: var(--clr-gray-light);
          cursor: pointer;
        }

        .mobile-overlay a {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--clr-gray-light);
          text-decoration: none;
          transition: color 0.25s;
        }

        .mobile-overlay a:hover { color: var(--clr-bob); }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>

      <div className="nav-top-bar">
        ✦ شحن مجاني على الطلبات فوق ₪500 &nbsp;·&nbsp; عروض حصرية لأعضاء VIP ✦
      </div>

      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <a href="#" className="logo-wrap">
            <span className="logo-main">SamPerfume</span>
            <span className="logo-sub">عطور فاخرة</span>
          </a>

          <ul className="nav-links">
            {navLinks.map((l) => (
              <li key={l.label}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>

          <div className="nav-actions">
            <button className="icon-btn"><Search size={18} /></button>
            <button className="icon-btn"><Heart size={18} /></button>
            <div className="nav-sep" />
            <button className="icon-btn">
              <ShoppingBag size={19} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button className="hamburger" onClick={() => setIsOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-overlay ${isOpen ? "open" : ""}`}>
        <span className="mobile-logo">SamPerfume</span>
        <button className="mobile-close" onClick={() => setIsOpen(false)}>
          <X size={26} />
        </button>
        {navLinks.map((l) => (
          <a key={l.label} href={l.href} onClick={() => setIsOpen(false)}>{l.label}</a>
        ))}
      </div>
    </>
  );
}