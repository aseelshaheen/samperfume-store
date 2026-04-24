import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  LogOut, Menu, ChevronRight, BarChart3, Star
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

        .sidebar{width:var(--sidebar-w);background:var(--white);border-left:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;right:0;bottom:0;z-index:200;transition:width 0.3s cubic-bezier(0.4,0,0.2,1);overflow:hidden;}
        .sidebar.collapsed{width:var(--sidebar-col);}

        .sidebar-top{padding:1.2rem 1rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:0.6rem;min-height:62px;}
        .sidebar-logo{display:flex;flex-direction:column;overflow:hidden;white-space:nowrap;transition:opacity 0.2s;}
        .sidebar.collapsed .sidebar-logo{opacity:0;width:0;}
        .logo-text{font-family:'Playfair Display',serif;font-size:1.1rem;color:#666;letter-spacing:0.08em;line-height:1;}
        .logo-sub{font-size:0.58rem;letter-spacing:0.2em;color:var(--bob);text-transform:uppercase;font-weight:600;}

        .collapse-btn{background:none;border:none;color:var(--muted);cursor:pointer;padding:0.3rem;border-radius:4px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;}
        .collapse-btn:hover{color:var(--text);background:var(--surface);}

        .sidebar-nav{flex:1;padding:1rem 0.5rem;display:flex;flex-direction:column;gap:0.15rem;overflow-y:auto;scrollbar-width:none;}
        .nav-item{display:flex;align-items:center;gap:0.7rem;padding:0.68rem 0.75rem;border-radius:6px;cursor:pointer;border:none;background:none;color:var(--muted);font-family:'Tajawal',sans-serif;font-size:0.88rem;font-weight:500;width:100%;text-align:right;transition:all 0.2s;white-space:nowrap;overflow:hidden;}
        .nav-item:hover{background:var(--surface);color:var(--text);}
        .nav-item.active{background:var(--bob-faint);color:var(--bob);border-right:2.5px solid var(--bob);font-weight:700;}
        .nav-label{overflow:hidden;transition:opacity 0.2s,width 0.3s;}
        .sidebar.collapsed .nav-label{opacity:0;width:0;}

        .sidebar-user{padding:0.85rem 0.75rem;border-top:1px solid var(--border);display:flex;align-items:center;gap:0.65rem;overflow:hidden;}
        .user-avatar{width:32px;height:32px;background:var(--bob);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;color:white;flex-shrink:0;}
        .user-info{overflow:hidden;flex:1;}
        .user-name{font-size:0.82rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .user-role{font-size:0.62rem;color:var(--bob);letter-spacing:0.1em;text-transform:uppercase;}
        .sidebar.collapsed .user-info{display:none;}
        .sidebar.collapsed .logout-btn{display:none;}
        .logout-btn{background:none;border:none;color:var(--muted);cursor:pointer;padding:0.3rem;border-radius:4px;display:flex;transition:color 0.2s;flex-shrink:0;}
        .logout-btn:hover{color:#c0392b;}

        .admin-main{flex:1;margin-right:var(--sidebar-w);transition:margin-right 0.3s cubic-bezier(0.4,0,0.2,1);min-height:100vh;background:var(--surface);}
        .admin-main.collapsed{margin-right:var(--sidebar-col);}

        .admin-topbar{height:62px;background:var(--white);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 2rem;position:sticky;top:0;z-index:100;box-shadow:0 1px 8px rgba(0,0,0,0.04);}
        .topbar-title{font-family:'Playfair Display',serif;font-size:1.05rem;color:var(--text);font-weight:600;}
        .topbar-badge{font-size:0.7rem;background:var(--bob-faint);color:var(--bob);border:1px solid rgba(69,40,41,0.2);padding:0.2rem 0.65rem;border-radius:20px;letter-spacing:0.06em;font-weight:700;}

        .admin-content{padding:2rem;}
        .mobile-menu-btn{display:none;background:none;border:none;color:var(--text);cursor:pointer;}
        .mobile-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:199;}

        @media(max-width:768px){
          .sidebar{transform:translateX(100%);transition:transform 0.3s ease;width:var(--sidebar-w) !important;}
          .sidebar.mobile-open{transform:translateX(0);}
          .admin-main{margin-right:0 !important;}
          .mobile-menu-btn{display:flex;}
          .mobile-overlay{display:block;}
          .admin-content{padding:1rem;}
        }
          @media(max-width:768px){
  .sidebar{transform:translateX(100%);transition:transform 0.3s ease;width:var(--sidebar-w) !important;}
  .sidebar.mobile-open{transform:translateX(0);}
  .admin-main{margin-right:0 !important;}
  .mobile-menu-btn{display:flex;}
  .mobile-overlay{display:block;}
  .admin-content{padding:0.75rem;}
  .admin-topbar{padding:0 0.75rem;}
  .topbar-title{font-size:0.9rem;}
  .admin-content{padding:0.65rem;overflow-x:hidden;}
  .admin-topbar{padding:0 0.65rem;}
  .topbar-title{font-size:0.85rem;}
  .topbar-badge{font-size:0.62rem;padding:0.15rem 0.5rem;}
}
  @media(max-width:400px){
  .admin-content{padding:0.5rem;}
  .stats-grid{grid-template-columns:1fr 1fr;gap:0.35rem;}
  .stat-card{padding:0.5rem;}
  .stat-value{font-size:0.95rem;}
  .stat-label{font-size:0.54rem;}
}
      `}</style>

      <div className="admin-root">
        {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

        <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
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
                onClick={() => { onNavigate(id); setMobileOpen(false); }}
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

        <main className={`admin-main ${collapsed ? "collapsed" : ""}`}>
          <div className="admin-topbar">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
            <span className="topbar-title">{navItems.find(n => n.id === activePage)?.label ?? "لوحة التحكم"}</span>
            <span className="topbar-badge">Admin</span>
          </div>
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </>
  );
}