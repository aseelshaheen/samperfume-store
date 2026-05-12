import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import logo from "./../assets/logopage.webp";

const API_BASE = "/api";
const ADMIN_EMAIL = "samperfume8@gmail.com";
const saveToken = (token) => localStorage.setItem("sp_token", token);

export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setError("");
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
    setForm({ email: "", password: "", confirm: "" });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!form.email || !form.password) return setError("يرجى ملء جميع الحقول");
    if (mode === "register" && form.password !== form.confirm)
      return setError("كلمتا المرور غير متطابقتين");
    if (form.password.length < 6)
      return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "حدث خطأ، حاول مجدداً");
      } else {
        saveToken(data.token);

        // ── Auto-redirect admin email ──────────────────────────────
        if (form.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setSuccess("مرحباً بك في لوحة الإدارة! جاري التحويل...");
          setTimeout(() => {
            window.location.href = "/admin";
          }, 900);
          return;
        }

        setSuccess(
          mode === "login"
            ? `أهلاً بعودتك، ${data.user?.username || ""}!`
            : "تم إنشاء حسابك بنجاح 🎉"
        );
        setTimeout(() => onSuccess?.(data.user, data.token), 900);
      }
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقق من تشغيل الباك-إند.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => e.key === "Enter" && handleSubmit();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Tajawal:wght@300;400;500;700&display=swap');
        
        :root {
          --bob:#452829; 
          --bob-hover:#5c3637; 
          --black:#0e0e0e;
          --surface:#faf8f6; 
          --border:#e5dfd8; 
          --text:#1a1a1a;
          --muted:#888; 
          --error:#c0392b; 
          --success:#2e7d5a; 
          --white:#ffffff;
        }

        body { 
          font-family:'Tajawal',sans-serif; 
          direction:rtl; 
          margin:0; 
          background:var(--white); 
          color:var(--text); 
        }

        .auth-root { 
          min-height:100vh; 
          display:grid; 
          grid-template-columns:1fr 1fr; 
        }

        .auth-visual {
          position:relative; 
          display:flex; 
          flex-direction:column;
          align-items:center; 
          justify-content:center; 
          padding:0; 
          overflow:hidden;
        }

        /* Container for the background image */
        .image-container { 
          position:absolute; 
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1; 
          margin-bottom:0; 
        }

        /* The full background image */
        .image-container img { 
          width:100%; 
          height:100%; 
          object-fit:cover; 
          opacity:1; 
          filter:saturate(0.9); 
        }

        /* * NEW: Semi-transparent dark overlay.
         * Set z-index to 2 to sit above the image.
         */
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6); /* Adjust the 0.6 to make it more or less dark */
          z-index: 2;
        }

        /* Content layer that sits over the overlay and image */
        .auth-visual-content { 
          position:relative; 
          z-index:3; /* Sit above the overlay layer */
          text-align:center; 
          color:white; 
          padding: 3rem; 
          width: 100%;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: flex-end; 
          height: 100%; 
        }

        /* Tagline color set to full white for better contrast */
        .visual-tagline { 
          font-size:0.75rem; 
          letter-spacing:0.26em; 
          text-transform:uppercase; 
          color:#ffffff; /* Pure white contrast */
          font-weight:600; 
          display:block; 
          margin-bottom: 2rem; 
        }

        /* Glow orbs preserved */
        .orb { 
          position:absolute; 
          border-radius:50%; 
          filter:blur(80px); 
          opacity:0.18; 
          pointer-events:none; 
          z-index:1.5; 
        }
        .orb-1 { width:320px; height:320px; background:var(--bob); top:-80px; left:-80px; }
        .orb-2 { width:200px; height:200px; background:#8b5e3c; bottom:120px; right:-40px; }

        /* Form panel styles unchanged */
        .auth-form-panel { display:flex; align-items:center; justify-content:center; padding:2rem; background:var(--surface); }
        .auth-card { width:100%; max-width:420px; background:white; border:1px solid var(--border); border-radius:4px; padding:2.8rem 2.4rem; box-shadow:0 4px 40px rgba(0,0,0,0.06); }
        .auth-tabs { display:grid; grid-template-columns:1fr 1fr; background:var(--surface); border-radius:3px; padding:4px; margin-bottom:2.2rem; }
        .tab-btn { background:none; border:none; font-family:'Tajawal',sans-serif; font-size:0.92rem; font-weight:500; color:var(--muted); padding:0.55rem; cursor:pointer; border-radius:2px; transition:all 0.25s; }
        .tab-btn.active { background:var(--bob); color:white; font-weight:700; }
        .auth-heading { font-family:'Playfair Display',serif; font-size:1.55rem; color:var(--black); font-weight:700; margin-bottom:0.4rem; line-height:1.3; }
        .auth-sub { font-size:0.84rem; color:var(--muted); margin-bottom:1.8rem; line-height:1.6; }
        .field { margin-bottom:1.1rem; }
        .field label { display:block; font-size:0.8rem; font-weight:600; color:#555; margin-bottom:0.38rem; letter-spacing:0.03em; }
        .input-wrap { position:relative; }
        .field input { width:100%; border:1.5px solid var(--border); border-radius:3px; padding:0.7rem 0.9rem; font-family:'Tajawal',sans-serif; font-size:0.92rem; color:var(--text); background:white; transition:border-color 0.2s,box-shadow 0.2s; outline:none; direction:ltr; text-align:right; box-sizing:border-box; }
        .field input:focus { border-color:var(--bob); box-shadow:0 0 0 3px rgba(69,40,41,0.1); }
        .pw-toggle { position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--muted); padding:0; }
        .msg { font-size:0.82rem; border-radius:3px; padding:0.6rem 0.9rem; margin-bottom:1rem; font-weight:500; display:flex; align-items:center; gap:0.4rem; }
        .msg.error   { background:#fdf0f0; color:var(--error);   border:1px solid #f5c6c6; }
        .msg.success { background:#f0faf5; color:var(--success); border:1px solid #b3e0ca; }
        .submit-btn { width:100%; background:var(--bob); color:white; border:none; padding:0.85rem; font-family:'Tajawal',sans-serif; font-size:1rem; font-weight:700; cursor:pointer; border-radius:3px; display:flex; align-items:center; justify-content:center; gap:0.5rem; transition:background 0.25s,transform 0.2s; }
        .submit-btn:hover:not(:disabled) { background:var(--bob-hover); transform:translateY(-2px); }
        .submit-btn:disabled { opacity:0.65; cursor:not-allowed; }
        .auth-divider { display:flex; align-items:center; gap:0.8rem; margin:1.4rem 0; color:var(--muted); font-size:0.78rem; }
        .auth-divider::before,.auth-divider::after { content:''; flex:1; height:1px; background:var(--border); }
        .switch-hint { text-align:center; font-size:0.83rem; color:var(--muted); }
        .switch-hint button { background:none; border:none; color:var(--bob); font-family:'Tajawal'; font-weight:700; cursor:pointer; text-decoration:underline; padding:0; }
        
        @keyframes spin { to { transform:rotate(360deg); } }
        @media (max-width:768px) { .auth-visual { display:none; } .auth-root { grid-template-columns:1fr; } }
      `}</style>

      <div className="auth-root">
        <div className="auth-visual">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="image-container">
            <img loading="lazy" src={logo} alt="SamPerfume" />
          </div>
          
          {/* This is the new semi-transparent dark box */}
          <div className="image-overlay" />

          <div className="auth-visual-content">
            <span className="visual-tagline">عطور فاخرة · فلسطين</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={`tab-btn ${mode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                تسجيل الدخول
              </button>
              <button
                className={`tab-btn ${mode === "register" ? "active" : ""}`}
                onClick={() => switchMode("register")}
              >
                إنشاء حساب
              </button>
            </div>

            <h2 className="auth-heading">
              {mode === "login" ? "أهلاً بعودتك" : "انضم إلينا"}
            </h2>
            <p className="auth-sub">
              {mode === "login"
                ? "سجّل دخولك للوصول إلى حسابك وطلباتك"
                : "أنشئ حسابك وابدأ رحلة العطور الفاخرة"}
            </p>

            {error && <div className="msg error">⚠ {error}</div>}
            {success && <div className="msg success">✓ {success}</div>}

            <div className="field">
              <label>البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={set("email")}
                onKeyDown={handleKey}
              />
            </div>
            <div className="field">
              <label>كلمة المرور</label>
              <div className="input-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  onKeyDown={handleKey}
                  style={{ paddingLeft: "2.4rem" }}
                />
                <button
                  className="pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                  type="button"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {mode === "register" && (
              <div className="field">
                <label>تأكيد كلمة المرور</label>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={set("confirm")}
                  onKeyDown={handleKey}
                />
              </div>
            )}

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <>
                  {mode === "login" ? "دخول" : "إنشاء الحساب"}
                  <ArrowLeft size={16} />
                </>
              )}
            </button>

            <div className="auth-divider">أو</div>
            <p className="switch-hint">
              {mode === "login" ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
              <button
                onClick={() =>
                  switchMode(mode === "login" ? "register" : "login")
                }
              >
                {mode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}