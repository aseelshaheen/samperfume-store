import { Phone, Mail, MapPin } from "lucide-react";
import { FaFacebook } from "react-icons/fa";

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    shop: ["العطور الرجالية", "العطور النسائية", "العطور المشتركة", "العروض والتخفيضات", "الجديد"],
    brands: ["Dior", "Chanel", "Tom Ford", "Creed", "Maison Margiela"],
    info: ["عن سام بيرفيوم", "سياسة الخصوصية", "سياسة الإرجاع", "تتبع طلبك", "اتصل بنا"],
  };

  return (
    <>
      <style>{`
        .footer {
          background: #faf8f6;
          color: #3a3a3a;
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
          border-top: 1px solid #e8e2dc;
        }

        /* Newsletter */
        .footer-newsletter {
          background: #452829;
          padding: 2.8rem 2rem;
          text-align: center;
        }

        .footer-newsletter h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: #ffffff;
          margin-bottom: 0.4rem;
        }

        .footer-newsletter p {
          color: rgba(255,255,255,0.65);
          font-size: 0.88rem;
          margin-bottom: 1.4rem;
        }

        .nl-form {
          display: flex;
          justify-content: center;
          max-width: 420px;
          margin: 0 auto;
        }

        .nl-form input {
          flex: 1;
          padding: 0.75rem 1.1rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-left: none;
          color: white;
          font-family: 'Tajawal', sans-serif;
          font-size: 0.9rem;
          outline: none;
          border-radius: 0 3px 3px 0;
        }

        .nl-form input::placeholder { color: rgba(255,255,255,0.4); }

        .nl-form button {
          padding: 0.75rem 1.4rem;
          background: #1a1a1a;
          color: #e8e2dc;
          border: 1px solid rgba(255,255,255,0.2);
          font-family: 'Tajawal', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 3px 0 0 3px;
          letter-spacing: 0.05em;
          transition: background 0.25s;
          white-space: nowrap;
        }

        .nl-form button:hover { background: #2a2a2a; }

        /* Main grid */
        .footer-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3.5rem 2rem 2.5rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 2.5rem;
        }

        /* Brand col */
        .footer-brand .f-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          color: #666;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 0.25rem;
        }

        .footer-brand .f-tagline {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: #452829;
          text-transform: uppercase;
          font-weight: 600;
          display: block;
          margin-bottom: 1.2rem;
        }

        .footer-brand p {
          font-size: 0.88rem;
          line-height: 1.85;
          color: #888;
          max-width: 280px;
        }

        .social-row {
          display: flex;
          gap: 0.7rem;
          margin-top: 1.4rem;
        }

        .social-btn {
          width: 38px; height: 38px;
          border: 1px solid #e8e2dc;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          cursor: pointer;
          transition: all 0.25s;
          background: white;
          text-decoration: none;
        }

        .social-btn:hover {
          border-color: #452829;
          color: #452829;
          background: rgba(69,40,41,0.05);
        }

        /* Column */
        .footer-col h4 {
          font-size: 0.75rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #1a1a1a;
          font-weight: 700;
          margin-bottom: 1.2rem;
          position: relative;
          padding-bottom: 0.7rem;
        }

        .footer-col h4::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 24px; height: 1.5px;
          background: #452829;
        }

        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.65rem; }

        .footer-col ul a {
          color: #888;
          text-decoration: none;
          font-size: 0.88rem;
          transition: color 0.25s;
        }

        .footer-col ul a:hover { color: #452829; }

        /* Contact */
        .contact-row {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          color: #888;
          font-size: 0.86rem;
          margin-bottom: 0.75rem;
        }

        .contact-row svg { color: #452829; flex-shrink: 0; margin-top: 2px; }

        /* Divider */
        .footer-divider {
          border: none;
          border-top: 1px solid #e8e2dc;
          margin: 0;
        }

        /* Bottom */
        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.2rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          color: #aaa;
        }

        .pay-badges { display: flex; gap: 0.5rem; }

        .pay-badge {
          background: white;
          border: 1px solid #e8e2dc;
          border-radius: 4px;
          padding: 0.22rem 0.55rem;
          font-size: 0.68rem;
          color: #888;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .footer-main { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .footer-brand { grid-column: 1 / -1; }
        }

        @media (max-width: 540px) {
          .footer-main { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; gap: 0.75rem; text-align: center; }
          .nl-form { flex-direction: column; }
          .nl-form button { border-radius: 3px 3px 0 0; border-left: 1px solid rgba(255,255,255,0.2); border-bottom: none; }
          .nl-form input { border-radius: 0 0 3px 3px; border-left: 1px solid rgba(255,255,255,0.2); }
        }
      `}</style>

      <footer className="footer">
        {/* Newsletter */}
        <div className="footer-newsletter">
          <h3>انضم إلى عالم الرقي</h3>
          <p>اشترك واحصل على أحدث العروض والعطور الجديدة أولاً</p>
          <div className="nl-form">
            <button type="button">اشتراك</button>
            <input type="email" placeholder="بريدك الإلكتروني..." />
          </div>
        </div>

        {/* Main */}
        <div className="footer-main">
          <div className="footer-brand">
            <span className="f-logo">SamPerfume</span>
            <span className="f-tagline">عطور فاخرة · since 2020</span>
            <p>
              نؤمن بأن العطر هو أكثر من مجرد رائحة — إنه ذاكرة وشخصية وهوية.
              نقدم لكم أرقى العطور العالمية بأسعار تنافسية وخدمة راقية.
            </p>
            <div className="social-row">
              <a className="social-btn" href="#" aria-label="Instagram">
                <InstagramIcon size={16} />
              </a>
              <a className="social-btn" href="#" aria-label="Facebook">
                <FaFacebook size={16} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>المتجر</h4>
            <ul>{links.shop.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>

          <div className="footer-col">
            <h4>العلامات</h4>
            <ul>{links.brands.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>

          <div className="footer-col">
            <h4>تواصل معنا</h4>
            <div className="contact-row"><Phone size={14} /><span>+970 59 000 0000</span></div>
            <div className="contact-row"><Mail size={14} /><span>info@samperfume.ps</span></div>
            <div className="contact-row"><MapPin size={14} /><span>نابلس، فلسطين</span></div>
            <br />
            <ul>{links.info.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <span>© {year} SamPerfume — جميع الحقوق محفوظة</span>
          <div className="pay-badges">
            <span className="pay-badge">VISA</span>
            <span className="pay-badge">PayPal</span>
            <span className="pay-badge">Cash</span>
          </div>
        </div>
      </footer>
    </>
  );
}