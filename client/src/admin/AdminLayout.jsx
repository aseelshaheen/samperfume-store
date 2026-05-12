import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  LogOut, Menu, ChevronRight, BarChart3, Star, X
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "لوحة التحكم",  icon: LayoutDashboard },
  { id: "orders",    label: "الطلبات",       icon: ShoppingBag },
  { id: "perfumes",  label: "العطور",         icon: Package },
  { id: "users",     label: "المستخدمون",    icon: Users },
  { id: "reviews",   label: "التقييمات",     icon: Star },
  { id: "stats",     label: "الإحصائيات",    icon: BarChart3 },
];

export default function AdminLayout({ children, activePage, onNavigate, adminUser, onLogout }) {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Tajawal:wght@300;400;500;700&display=swap');
        :root {
          --bob:#452829; --bob-light:#5c3637; --bob-faint:rgba(69,40,41,0.08);
          --black:#1a1a1a; --border:#e8e2dc; --text:#1a1a1a; --muted:#888;
          --surface:#faf8f6; --white:#ffffff; --sidebar-w:240px; --sidebar-col:64px;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Tajawal',sans-serif;direction:rtl;background:var(--surface);color:var(--text);}
        .admin-root{display:flex;min-height:100vh;}

        /* ── Sidebar ── */
        .sidebar {
  width: var(--sidebar-w);
  background: var(--white);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 62px;     
  right: 0;
  bottom: 0;
  z-index: 200;
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
}
        .sidebar.collapsed{width:var(--sidebar-col);}

        .sidebar-top{
          padding:1.2rem 1rem;border-bottom:1px solid var(--border);
          display:flex;align-items:center;justify-content:space-between;gap:0.6rem;min-height:62px;
        }
        .sidebar-logo{display:flex;flex-direction:column;overflow:hidden;white-space:nowrap;transition:opacity 0.2s;}
        .sidebar.collapsed .sidebar-logo{opacity:0;width:0;}
        .logo-text{font-family:'Playfair Display',serif;font-size:1.1rem;color:#666;letter-spacing:0.08em;line-height:1;}
        .logo-sub{font-size:0.58rem;letter-spacing:0.2em;color:var(--bob);text-transform:uppercase;font-weight:600;}

        .collapse-btn{
          background:none;border:none;color:var(--muted);cursor:pointer;padding:0.3rem;
          border-radius:4px;display:flex;align-items:center;justify-content:center;
          transition:all 0.2s;flex-shrink:0;
        }
        .collapse-btn:hover{color:var(--text);background:var(--surface);}

        .sidebar-nav{flex:1;padding:1rem 0.5rem;display:flex;flex-direction:column;gap:0.15rem;overflow-y:auto;scrollbar-width:none;}
        .nav-item{
          display:flex;align-items:center;gap:0.7rem;padding:0.68rem 0.75rem;border-radius:6px;
          cursor:pointer;border:none;background:none;color:var(--muted);font-family:'Tajawal',sans-serif;
          font-size:0.88rem;font-weight:500;width:100%;text-align:right;transition:all 0.2s;
          white-space:nowrap;overflow:hidden;
        }
        .nav-item:hover{background:var(--surface);color:var(--text);}
        .nav-item.active{background:var(--bob-faint);color:var(--bob);border-right:2.5px solid var(--bob);font-weight:700;}
        .nav-label{overflow:hidden;transition:opacity 0.2s,width 0.3s;}
        .sidebar.collapsed .nav-label{opacity:0;width:0;}

        .sidebar-user{
          padding:0.85rem 0.75rem;border-top:1px solid var(--border);
          display:flex;align-items:center;gap:0.65rem;overflow:hidden;
        }
        .user-avatar{
          width:32px;height:32px;background:var(--bob);border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:0.78rem;font-weight:700;color:white;flex-shrink:0;
        }
        .user-info{overflow:hidden;flex:1;}
        .user-name{font-size:0.82rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .user-role{font-size:0.62rem;color:var(--bob);letter-spacing:0.1em;text-transform:uppercase;}
        .sidebar.collapsed .user-info{display:none;}
        .sidebar.collapsed .logout-btn{display:none;}
        .logout-btn{
          background:none;border:none;color:var(--muted);cursor:pointer;padding:0.3rem;
          border-radius:4px;display:flex;transition:color 0.2s;flex-shrink:0;
        }
        .logout-btn:hover{color:#c0392b;}

        /* ── Main ── */
        .admin-main{
          flex:1;margin-right:var(--sidebar-w);
          transition:margin-right 0.3s cubic-bezier(0.4,0,0.2,1);
          min-height:100vh;background:var(--surface);
        }
        .admin-main.collapsed{margin-right:var(--sidebar-col);}

        /* ── Topbar — always dark on admin pages, no scroll flash ── */
        .admin-topbar{
          height:62px;
          background:#1a1a1a;
          border-bottom:1px solid rgba(255,255,255,0.08);
          display:flex;align-items:center;justify-content:space-between;
          padding:0 1.5rem;position:sticky;top:0;z-index:100;
          box-shadow:0 1px 12px rgba(0,0,0,0.18);
        }
        .topbar-left{display:flex;align-items:center;gap:0.85rem;}
        .topbar-title{font-family:'Playfair Display',serif;font-size:1.05rem;color:#f0ebe5;font-weight:600;}
        .topbar-badge{
          font-size:0.7rem;background:rgba(69,40,41,0.4);color:#e09a8a;
          border:1px solid rgba(69,40,41,0.5);padding:0.2rem 0.65rem;
          border-radius:20px;letter-spacing:0.06em;font-weight:700;
        }

        .admin-content{padding:1.5rem;}

        /* ── Mobile menu btn — now styled for dark topbar ── */
        .mobile-menu-btn{
          display:none;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);
          color:#e0d8d0;cursor:pointer;border-radius:6px;padding:0.35rem;
          transition:all 0.2s;
        }
        .mobile-menu-btn:hover{background:rgba(255,255,255,0.15);color:white;}

        /* ── Mobile overlay ── */
        .mobile-overlay{
          display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);
          backdrop-filter:blur(2px);z-index:199;
        }

        /* ── Mobile bottom nav bar ── */
        .mobile-bottom-nav{
          display:none;position:fixed;bottom:0;left:0;right:0;z-index:300;
          background:#1a1a1a;border-top:1px solid rgba(255,255,255,0.1);
          padding:0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom));
        }
        .mobile-bottom-nav-inner{
          display:flex;justify-content:space-around;align-items:center;
        }
        .mob-nav-btn{
          display:flex;flex-direction:column;align-items:center;gap:0.18rem;
          background:none;border:none;cursor:pointer;padding:0.3rem 0.5rem;
          color:#888;font-family:'Tajawal',sans-serif;font-size:0.58rem;
          border-radius:6px;transition:all 0.18s;min-width:44px;
        }
        .mob-nav-btn.active{color:#e09a8a;}
        .mob-nav-btn:active{transform:scale(0.93);}
        .mob-nav-more{
          display:flex;flex-direction:column;align-items:center;gap:0.18rem;
          background:none;border:none;cursor:pointer;padding:0.3rem 0.5rem;
          color:#888;font-family:'Tajawal',sans-serif;font-size:0.58rem;
          border-radius:6px;transition:all 0.18s;min-width:44px;
        }
        .mob-nav-more:active{transform:scale(0.93);}

        /* ── Mobile drawer (for "More") ── */
        .mob-drawer-overlay{
          position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:400;
          opacity:0;pointer-events:none;transition:opacity 0.25s;
        }
        .mob-drawer-overlay.open{opacity:1;pointer-events:auto;}
        .mob-drawer{
          position:fixed;bottom:0;left:0;right:0;z-index:401;
          background:#1a1a1a;border-radius:16px 16px 0 0;
          border-top:1px solid rgba(255,255,255,0.1);
          padding:1rem 1rem calc(1rem + env(safe-area-inset-bottom));
          transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .mob-drawer.open{transform:translateY(0);}
        .mob-drawer-handle{
          width:36px;height:4px;background:rgba(255,255,255,0.2);
          border-radius:2px;margin:0 auto 1rem;
        }
        .mob-drawer-title{
          font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;
          color:#666;font-weight:700;margin-bottom:0.75rem;font-family:'Tajawal',sans-serif;
        }
        .mob-drawer-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;}
        .mob-drawer-item{
          display:flex;align-items:center;gap:0.65rem;padding:0.75rem;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
          border-radius:8px;cursor:pointer;color:#aaa;
          font-family:'Tajawal',sans-serif;font-size:0.84rem;
          transition:all 0.18s;
        }
        .mob-drawer-item.active{
          background:rgba(69,40,41,0.25);border-color:rgba(69,40,41,0.4);color:#e09a8a;
        }
        .mob-drawer-item:active{transform:scale(0.97);}
        .mob-drawer-divider{height:1px;background:rgba(255,255,255,0.07);margin:0.75rem 0;}
        .mob-drawer-logout{
          display:flex;align-items:center;gap:0.65rem;padding:0.75rem;
          background:rgba(192,57,43,0.1);border:1px solid rgba(192,57,43,0.25);
          border-radius:8px;cursor:pointer;color:#e08a82;
          font-family:'Tajawal',sans-serif;font-size:0.84rem;width:100%;
          transition:all 0.18s;
        }
        .mob-drawer-logout:active{transform:scale(0.98);}

        /* ── Responsive ── */
        @media(max-width:768px){
          .sidebar{display:none;}
          .admin-main{margin-right:0 !important;}
          .mobile-menu-btn{display:flex;}
          .mobile-overlay{display:block;}
          .admin-content{padding:0.85rem 0.75rem 5rem;}
          .admin-topbar{padding:0 0.85rem;}
          .topbar-title{font-size:0.9rem;}
          .mobile-bottom-nav{display:block;}
        }

        @media(max-width:400px){
          .admin-content{padding:0.6rem 0.5rem 5rem;}
        }
      `}</style>

      <div className="admin-root">

        {/* Desktop sidebar */}
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-top">
            <div className="sidebar-logo">
              <span className="logo-text">SamPerfume</span>
              <span className="logo-sub">لوحة الإدارة</span>
            </div>
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              <ChevronRight size={15} style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${activePage === id ? "active" : ""}`}
                onClick={() => onNavigate(id)}
              >
                <Icon size={17} />
                <span className="nav-label">{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="user-avatar">{adminUser?.username?.[0]?.toUpperCase() ?? "A"}</div>
            <div className="user-info">
              <div className="user-name">{adminUser?.username ?? "Admin"}</div>
              <div className="user-role">مدير</div>
            </div>
            <button className="logout-btn" onClick={onLogout} title="تسجيل الخروج">
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className={`admin-main ${collapsed ? "collapsed" : ""}`}>
          <div className="admin-topbar">
            <div className="topbar-left">
              <span className="topbar-title">{navItems.find(n => n.id === activePage)?.label ?? "لوحة التحكم"}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
              <span className="topbar-badge">Admin</span>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"#888" }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:"#452829", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", fontWeight:700, color:"white" }}>
                  {adminUser?.username?.[0]?.toUpperCase() ?? "A"}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-content">{children}</div>
        </main>

        {/* Mobile bottom navigation */}
        <MobileBottomNav
          activePage={activePage}
          onNavigate={onNavigate}
          adminUser={adminUser}
          onLogout={onLogout}
        />
      </div>
    </>
  );
}

/* ── Mobile bottom nav with drawer for secondary items ── */
const PRIMARY_NAV = [
  { id: "dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { id: "orders",    label: "الطلبات",  icon: ShoppingBag },
  { id: "perfumes",  label: "العطور",   icon: Package },
  { id: "users",     label: "المستخدمون", icon: Users },
];

const SECONDARY_NAV = [
  { id: "reviews", label: "التقييمات", icon: Star },
  { id: "stats",   label: "الإحصائيات", icon: BarChart3 },
];

function MobileBottomNav({ activePage, onNavigate, adminUser, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isSecondaryActive = SECONDARY_NAV.some(n => n.id === activePage);

  return (
    <>
      <style>{`
        @media(min-width:769px){ .mobile-bottom-nav,.mob-drawer-overlay,.mob-drawer{ display:none !important; } }
      `}</style>

      {/* Drawer overlay */}
      <div className={`mob-drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />

      {/* Bottom sheet drawer */}
      <div className={`mob-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="mob-drawer-handle" />
        <div className="mob-drawer-title">المزيد</div>

        <div className="mob-drawer-grid">
          {SECONDARY_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`mob-drawer-item ${activePage === id ? "active" : ""}`}
              onClick={() => { onNavigate(id); setDrawerOpen(false); }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="mob-drawer-divider" />

        <div style={{ display:"flex", alignItems:"center", gap:"0.65rem", padding:"0.5rem 0", color:"#888", fontSize:"0.8rem", fontFamily:"Tajawal,sans-serif", marginBottom:"0.5rem" }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"#452829", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:700, color:"white" }}>
            {adminUser?.username?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div>
            <div style={{ color:"#ccc", fontSize:"0.82rem" }}>{adminUser?.username ?? "Admin"}</div>
            <div style={{ color:"#452829", fontSize:"0.62rem", letterSpacing:"0.08em", textTransform:"uppercase" }}>مدير النظام</div>
          </div>
        </div>

        <button className="mob-drawer-logout" onClick={() => { setDrawerOpen(false); onLogout(); }}>
          <LogOut size={15} />
          تسجيل الخروج
        </button>
      </div>

      {/* Bottom nav bar */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          {PRIMARY_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`mob-nav-btn ${activePage === id ? "active" : ""}`}
              onClick={() => onNavigate(id)}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
          <button
            className="mob-nav-more"
            onClick={() => setDrawerOpen(true)}
            style={{ color: isSecondaryActive ? "#e09a8a" : "#888" }}
          >
            <Menu size={20} />
            <span style={{ fontSize:"0.58rem", fontFamily:"Tajawal,sans-serif" }}>المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
}