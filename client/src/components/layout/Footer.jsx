import { Phone, Mail, MapPin } from "lucide-react";
import { FaInstagram, FaFacebook } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        .footer {
          background: #ffffff;
          color: #1a1a1a;
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
          border-top: 1px solid #f0ebe5;
          padding-top: 4rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          gap: 4rem;
        }

        /* Brand Section */
        .f-brand .f-logo {
          font-family: 'Amiri', serif;
          font-size: 1.8rem;
          color: #452829;
          display: block;
          margin-bottom: 0.5rem;
        }

        .f-brand .f-tagline {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: #aaa;
          text-transform: uppercase;
          display: block;
          margin-bottom: 1.5rem;
        }

        /* Column Styles */
        .footer-col h4 {
          font-family: 'Amiri', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #452829;
          margin-bottom: 1.5rem;
        }

        .footer-col ul { list-style: none; padding: 0; margin: 0; }
        .footer-col ul li { margin-bottom: 0.8rem; }
        
        .footer-col ul a {
          color: #777;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .footer-col ul a:hover { color: #452829; }

        /* Social & Contact Icons */
        .social-links { display: flex; gap: 1.2rem; margin-top: 0.5rem; }
        .social-links a { color: #aaa; transition: color 0.3s; }
        .social-links a:hover { color: #452829; }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          color: #777;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .contact-item svg { color: #452829; opacity: 0.6; }

        /* Footer Bottom */
        .footer-bottom {
          margin-top: 5rem;
          padding: 2rem;
          border-top: 1px solid #f0ebe5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #aaa;
        }

        .cod-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #452829;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        @media (max-width: 850px) {
          .footer-container { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
          .f-brand { grid-column: 1 / -1; text-align: center; }
          .social-links { justify-content: center; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-container">
          {/* Identity */}
          <div className="f-brand">
            <span className="f-logo">SamPerfume</span>
            <span className="f-tagline">Luxurious Scents — Est. 2020</span>
            <div className="social-links">
              <a href="#"><FaInstagram size={18} /></a>
              <a href="#"><FaFacebook size={18} /></a>
            </div>
          </div>

          {/* Shop */}
          <div className="footer-col">
            <h4>اكتشف</h4>
            <ul>
              <li><a href="#">العطور الرجالية</a></li>
              <li><a href="#">العطور النسائية</a></li>
              <li><a href="#">إصدارات النيش</a></li>
              <li><a href="#">وصلنا حديثاً</a></li>
            </ul>
          </div>

          {/* Info */}
          <div className="footer-col">
            <h4>المساعدة</h4>
            <ul>
              <li><a href="#">تتبع طلبك</a></li>
              <li><a href="#">سياسة الإرجاع</a></li>
              <li><a href="#">الخصوصية</a></li>
              <li><a href="#">الأسئلة الشائعة</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>اتصال</h4>
            <div className="contact-item"><Phone size={14} /><span>+970 56 000 000</span></div>
            <div className="contact-item"><Mail size={14} /><span>info@samperfume.ps</span></div>
            <div className="contact-item"><MapPin size={14} /><span>سلفيت, فلسطين</span></div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="cod-notice">
            <span>الدفع عند الاستلام فقط</span>
            <div style={{width: 4, height: 4, background: '#452829', borderRadius: '50%'}}></div>
            <span>التوصيل لكافة المدن</span>
          </div>
          
          <span>© {year} SamPerfume. الحقوق محفوظة.</span>
        </div>
      </footer>
    </>
  );
}