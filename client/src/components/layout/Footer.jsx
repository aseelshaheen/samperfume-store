import { Phone, Mail, MapPin } from "lucide-react";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import logo from "/logo2.webp";

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
          padding: 3rem 0 1.5rem 0; /* Reduced padding */
        }

        .footer-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .f-brand { flex: 1.5; min-width: 200px; }
        .f-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #452829;
          letter-spacing: 1px;
          display: block;
        }

        .f-tagline {
          font-size: 0.7rem;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.2rem;
        }

        .footer-col { flex: 1; min-width: 150px; }
        .footer-col h4 {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #452829;
          margin-bottom: 1.2rem;
          letter-spacing: 0.05em;
        }

        .footer-col ul { list-style: none; padding: 0; }
        .footer-col li { margin-bottom: 0.6rem; }
        .footer-col a {
          color: #666;
          font-size: 0.85rem;
          text-decoration: none;
          transition: 0.3s;
        }
        .footer-col a:hover { color: #9d8461; padding-right: 4px; }

        .contact-box { font-size: 0.85rem; color: #666; }
        .contact-item { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; }
        .contact-item svg { color: #9d8461; }

        .social-links { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .social-links a { 
          width: 32px; height: 32px; border: 1px solid #eee; 
          border-radius: 50%; display: flex; align-items: center; 
          justify-content: center; color: #452829; transition: 0.3s;
        }
        .social-links a:hover { background: #452829; color: #fff; border-color: #452829; }

        .footer-bottom {
          max-width: 1100px;
          margin: 2rem auto 0 auto;
          padding: 1.5rem 2rem 0 2rem;
          border-top: 1px solid #f9f6f2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #aaa;
        }
          .f-brand-top{
  display:flex;
  align-items:center;
  gap:0.55rem;
}

.f-brand-logo{
  width:50px;
  height:50px;
  object-fit:contain;
}


        @media (max-width: 768px) {
          .footer-container { flex-direction: column; text-align: center; align-items: center; }
          .contact-item { justify-content: center; }
          .footer-bottom { flex-direction: column; gap: 1rem; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-container">
<div className="f-brand">
  <div className="f-brand-top">
    <span className="f-logo">SAM PERFUME</span>
    <img loading="lazy" src={logo} alt="SamPerfume" className="f-brand-logo" />
    
  </div>
          </div>

          <div className="footer-col">
            <h4>روابط سريعة</h4>
            <ul>
              <li><a href="/shop">المتجر</a></li>
              <li><a href="/returns">سياسة الإرجاع</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>تواصل معنا</h4>
            <div className="contact-box">
              <div className="contact-item"><Phone size={12} /><span>+970 59 907 7193</span></div>
              <div className="contact-item"><Mail size={12} /><span>samperfume8@gmail.com</span></div>
              <div className="contact-item"><MapPin size={12} /><span>سلفيت, فلسطين</span></div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} SamPerfume. جميع الحقوق محفوظة.</span>
          <div style={{display: 'flex', gap: '1rem'}}>
            <span>الدفع عند الاستلام</span>
          </div>
        </div>
      </footer>
    </>
  );
}