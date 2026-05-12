import { useState } from "react";
import {
  Send, Phone, Mail, MapPin, Clock,
  CheckCircle, Loader2, MessageCircle
} from "lucide-react";
import { FaInstagram, FaWhatsapp, FaFacebook  } from "react-icons/fa";
import emailjs from "@emailjs/browser";
const API = import.meta.env.VITE_API_URL || "/api";;

const SUBJECTS = [
  { v: "order",    l: "استفسار عن طلب" },
  { v: "product",  l: "استفسار عن منتج" },
  { v: "return",   l: "إرجاع أو استبدال" },
  { v: "custom",   l: "طلب خاص / تخصيص" },
  { v: "other",    l: "موضوع آخر" },
];

const CONTACT_ITEMS = [

  {
    icon: FaWhatsapp,
    label: "واتساب",
    value: "+970 599 077 193",
    href: "https://wa.me/message/6GBQWGLBSFR7A1",
    external: true,
  },
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "samperfume8@gmail.com",
    href: "mailto:samperfume8@gmail.com",
  },
  {
    icon: MapPin,
    label: "الموقع",
    value: "سلفيت، فلسطين",
    href: null,
  },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.name.trim() || !form.message.trim()) {
    setError("يرجى ملء الاسم والرسالة على الأقل.");
    return;
  }
  setSubmitting(true); setError("");

  try {
    await emailjs.send(
      "YOUR_SERVICE_ID",      // from EmailJS dashboard
      "YOUR_TEMPLATE_ID",     // from EmailJS dashboard
      {
        from_name:    form.name,
        phone:        form.phone,
        from_email:   form.email,
        subject:      form.subject,
        message:      form.message,
      },
      "YOUR_PUBLIC_KEY"       // from EmailJS dashboard
    );
    setSuccess(true);
    setForm({ name: "", phone: "", email: "", subject: "", message: "" });
  } catch (err) {
    setError("حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.");
  }
  setSubmitting(false);
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Playfair+Display:wght@400;600;700&family=Tajawal:wght@300;400;500;700&display=swap');

        :root {
          --bob: #452829;
          --bob-l: #6b3d3e;
          --bob-pale: rgba(69,40,41,0.07);
          --gold: #c9a96e;
          --dark: #1a1a1a;
          --ink: #2a1f1f;
          --gray: #7a7070;
          --gray-l: #b0a8a8;
          --border: #e8e2dc;
          --off: #faf8f6;
          --cream: #f3ede7;
          --white: #fff;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Tajawal', sans-serif; direction: rtl; color: var(--dark); }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes pop     { 0%{transform:scale(.6);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }

        /* ── MAIN LAYOUT ── */
        .cu-main {
          max-width: 1160px;
          margin: 0 auto;
          padding: 4rem 2rem 6rem;
          display: grid;
          grid-template-columns: 1fr 1.55fr;
          gap: 3.5rem;
          align-items: start;
        }

        /* ════════════════════════════════
           INFO COLUMN
        ════════════════════════════════ */
        .cu-info { animation: fadeUp .55s ease both; }

        .cu-info-lead {
          font-size: .9rem;
          color: var(--gray);
          line-height: 1.85;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        /* contact cards */
        .cu-cards { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 2rem; }

        .cu-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: .9rem 1.1rem;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 6px;
          transition: border-color .2s, box-shadow .2s, transform .25s;
          text-decoration: none;
          color: inherit;
        }
        .cu-card:hover {
          border-color: rgba(69,40,41,.35);
          box-shadow: 0 4px 18px rgba(69,40,41,.07);
          transform: translateX(-3px);
        }

        .cu-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--bob-pale);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--bob);
          flex-shrink: 0;
          transition: background .2s;
        }
        .cu-card:hover .cu-card-icon { background: var(--bob); color: white; }

        .cu-card-label {
          font-size: .62rem;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--gray-l);
          display: block;
          margin-bottom: .12rem;
        }
        .cu-card-val {
          font-size: .88rem;
          font-weight: 600;
          color: var(--ink);
          line-height: 1.3;
        }

        /* social buttons */
        .cu-social-label {
          font-size: .62rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--gray-l);
          margin-bottom: .7rem;
          display: block;
        }
        .cu-socials { display: flex; gap: .6rem; }
        .cu-social-btn {
          display: flex;
          align-items: center;
          gap: .45rem;
          padding: .52rem 1.1rem;
          border: 1.5px solid var(--border);
          border-radius: 40px;
          font-family: 'Tajawal', sans-serif;
          font-size: .8rem;
          font-weight: 600;
          color: var(--dark);
          background: var(--white);
          cursor: pointer;
          transition: all .2s;
          text-decoration: none;
        }
        .cu-social-btn:hover { border-color: var(--bob); color: var(--bob); background: var(--bob-pale); }

        /* ════════════════════════════════
           FORM COLUMN
        ════════════════════════════════ */
        .cu-form-wrap {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 2rem 2.2rem 2.4rem;
          box-shadow: 0 4px 32px rgba(0,0,0,.05);
          animation: fadeUp .55s ease .08s both;
        }

        .cu-form-header {
          margin-bottom: 1.8rem;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid var(--border);
        }
        .cu-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.55rem;
          font-weight: 600;
          color: var(--ink);
          line-height: 1.2;
          margin-bottom: .25rem;
        }
        .cu-form-sub {
          font-size: .78rem;
          color: var(--gray);
        }

        .cu-form  { display: flex; flex-direction: column; gap: 1rem; }
        .cu-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .cu-field { display: flex; flex-direction: column; gap: .32rem; }

        .cu-label {
          font-size: .67rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--gray);
        }

        .cu-input, .cu-select, .cu-textarea {
          background: var(--off);
          border: 1.5px solid var(--border);
          border-radius: 5px;
          padding: .72rem .95rem;
          font-family: 'Tajawal', sans-serif;
          font-size: .9rem;
          color: var(--dark);
          outline: none;
          width: 100%;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .cu-input:focus, .cu-select:focus, .cu-textarea:focus {
          border-color: var(--bob);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(69,40,41,.08);
        }
        .cu-textarea {
          resize: vertical;
          min-height: 130px;
          line-height: 1.75;
        }
        .cu-select {
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left .9rem center;
          padding-left: 2.2rem;
        }

        .cu-char-hint {
          font-size: .65rem;
          color: var(--gray-l);
          text-align: left;
          margin-top: .15rem;
        }

        .cu-error {
          font-size: .82rem;
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: .6rem .9rem;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: .4rem;
        }

        .cu-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          padding: .88rem 2rem;
          background: var(--bob);
          color: white;
          border: none;
          border-radius: 5px;
          font-family: 'Tajawal', sans-serif;
          font-size: .95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background .2s, transform .2s;
          width: 100%;
          letter-spacing: .04em;
        }
        .cu-submit:hover:not(:disabled) { background: var(--bob-l); transform: translateY(-1px); }
        .cu-submit:disabled { opacity: .6; cursor: not-allowed; }

        /* whatsapp shortcut */
        .cu-wa-note {
          display: flex;
          align-items: center;
          gap: .55rem;
          margin-top: .75rem;
          padding: .65rem .9rem;
          background: #f0fdf4;
          border: 1px solid #b3e0ca;
          border-radius: 5px;
          font-size: .78rem;
          color: #2e7d5a;
        }
        .cu-wa-note a { color: #2e7d5a; font-weight: 700; text-decoration: underline; }

        /* ── SUCCESS ── */
        .cu-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 3.5rem 2rem;
          gap: .8rem;
          animation: fadeUp .45s ease both;
        }
        .cu-success-icon {
          width: 72px;
          height: 72px;
          background: rgba(69,40,41,.08);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: .5rem;
          animation: pop .5s ease both;
        }
        .cu-success h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.7rem;
          font-weight: 600;
          color: var(--ink);
        }
        .cu-success p {
          font-size: .88rem;
          color: var(--gray);
          max-width: 300px;
          line-height: 1.8;
        }
        .cu-success-back {
          margin-top: .5rem;
          padding: .65rem 1.8rem;
          background: var(--bob);
          color: white;
          border: none;
          border-radius: 5px;
          font-family: 'Tajawal', sans-serif;
          font-size: .88rem;
          cursor: pointer;
          font-weight: 600;
          transition: background .2s;
        }
        .cu-success-back:hover { background: var(--bob-l); }

        @media(max-width:900px){
          .cu-main { grid-template-columns: 1fr; gap: 2rem; padding: 2rem 1.2rem 4rem; }
          .cu-row  { grid-template-columns: 1fr; }
          .cu-form-wrap { padding: 1.5rem 1.3rem 2rem; }
        }
      `}</style>

      {/* ── HERO — global page-hero from index.css ── */}
      <header className="page-hero">
        <div className="page-hero__pattern" />
        <div className="page-hero__glow" />
        <div className="page-hero__inner">
          <span className="page-hero__eyebrow">
            <Mail size={10} /> تواصل معنا
          </span>
          <h1 className="page-hero__title">نحن هنا لمساعدتك</h1>
          <p className="page-hero__sub">سؤال، اقتراح، أو طلب خاص — فريقنا جاهز للرد عليك</p>
          <div className="page-hero__rule">
            <div className="page-hero__rule-line" />
            <div className="page-hero__rule-dot" />
            <div className="page-hero__rule-line" />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div className="cu-main">

        {/* ── INFO COLUMN ── */}
        <div className="cu-info">
          <p className="cu-info-lead">
            يسعدنا التواصل معك في أي وقت. سواء كان لديك استفسار عن عطر، طلب خاص، أو تحتاج إلى مساعدة في طلبك — نحن دائماً هنا.
          </p>

          <div className="cu-cards">
            {CONTACT_ITEMS.map(({ icon: Icon, label, value, href, external }) => {
              const inner = (
                <>
                  <div className="cu-card-icon"><Icon size={17} /></div>
                  <div>
                    <span className="cu-card-label">{label}</span>
                    <span className="cu-card-val">{value}</span>
                  </div>
                </>
              );
              return href ? (
                <a
                  key={label}
                  href={href}
                  className="cu-card"
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {inner}
                </a>
              ) : (
                <div key={label} className="cu-card">{inner}</div>
              );
            })}
          </div>

          <span className="cu-social-label">تابعنا على</span>
          <div className="cu-socials">
            <a href="https://www.instagram.com/sam.perfume?igsh=MTRmeHRiODE2MmFiYw==" target="_blank" rel="noreferrer" className="cu-social-btn">
              <FaInstagram size={14} /> إنستغرام
            </a>

            <a href="https://www.facebook.com/share/1Li9qxxJYm/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="cu-social-btn">
              <FaFacebook  size={14} /> فيسبوك
            </a>
          </div>
        </div>

        {/* ── FORM COLUMN ── */}
        <div className="cu-form-wrap">
          {success ? (
            <div className="cu-success">
              <div className="cu-success-icon">
                <CheckCircle size={32} color="#452829" strokeWidth={1.5} />
              </div>
              <h3>تم إرسال رسالتك ✓</h3>
              <p>شكراً على تواصلك معنا. سنرد عليك خلال أوقات الدوام في أقرب وقت ممكن.</p>
              <button className="cu-success-back" onClick={() => setSuccess(false)}>
                إرسال رسالة أخرى
              </button>
            </div>
          ) : (
            <>
              <div className="cu-form-header">
                <div className="cu-form-title">أرسل لنا رسالة</div>
                <div className="cu-form-sub">سنرد عليك خلال 24 ساعة في أيام الدوام</div>
              </div>

              <form className="cu-form" onSubmit={handleSubmit}>
                <div className="cu-row">
                  <div className="cu-field">
                    <label className="cu-label">الاسم *</label>
                    <input
                      className="cu-input"
                      type="text"
                      name="name"
                      placeholder="اسمك الكريم"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="cu-field">
                    <label className="cu-label">رقم الهاتف</label>
                    <input
                      className="cu-input"
                      type="tel"
                      name="phone"
                      placeholder="05X XXX XXXX"
                      value={form.phone}
                      onChange={handleChange}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="cu-field">
                  <label className="cu-label">البريد الإلكتروني</label>
                  <input
                    className="cu-input"
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={handleChange}
                    dir="ltr"
                  />
                </div>

                <div className="cu-field">
                  <label className="cu-label">موضوع الرسالة</label>
                  <select
                    className="cu-select"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option value="">اختر موضوع الرسالة...</option>
                    {SUBJECTS.map(s => (
                      <option key={s.v} value={s.v}>{s.l}</option>
                    ))}
                  </select>
                </div>

                <div className="cu-field">
                  <label className="cu-label">الرسالة *</label>
                  <textarea
                    className="cu-textarea"
                    name="message"
                    placeholder="اكتب رسالتك هنا، وسنرد عليك في أقرب وقت..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                  <span className="cu-char-hint">{form.message.length} / 500</span>
                </div>

                {error && <div className="cu-error">⚠ {error}</div>}

                <button className="cu-submit" type="submit" disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> جاري الإرسال...</>
                    : <><Send size={15} /> إرسال الرسالة</>}
                </button>

                <div className="cu-wa-note">
                  <FaWhatsapp size={16} />
                  تفضّل التواصل المباشر؟{" "}
                  <a href="https://wa.me/message/6GBQWGLBSFR7A1" target="_blank" rel="noreferrer">
                    راسلنا على واتساب
                  </a>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}