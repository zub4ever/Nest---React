import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { toast } from '../services/notifications';
import './Layout.css';

const MOBILE_BREAKPOINT = 768;

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  // Desktop: sidebarCollapsed = fininha (70px)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile: sidebarOpenMobile = drawer aberto/fechado
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  const [expandedMenus, setExpandedMenus] = useState({ users: false });
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => {
      const mobileNow = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobileNow);

      if (mobileNow) {
        // entrando no mobile: fecha drawer e remove colapso
        setSidebarOpenMobile(false);
        setSidebarCollapsed(false);
      } else {
        // entrando no desktop: garante drawer fechado
        setSidebarOpenMobile(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpenMobile((v) => !v); // drawer
    } else {
      setSidebarCollapsed((v) => !v); // colapsa/expande
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) setSidebarOpenMobile(false);
  };

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊', type: 'link' },
    {
      key: 'users',
      name: 'Usuários',
      icon: '👥',
      type: 'expandable',
      submenu: [
        { path: '/users', name: 'Listar', icon: '📋' },
        { path: '/create-user', name: 'Criar Usuário', icon: '➕' },
      ],
    },
  ];

  const sidebarClass = [
    'sidebar',
    isMobile ? 'mobile' : 'desktop',
    isMobile
      ? (sidebarOpenMobile ? 'open' : 'closed')
      : (sidebarCollapsed ? 'collapsed' : ''),
  ]
    .filter(Boolean)
    .join(' ');

  const mainClass = [
    'main-content',
    !isMobile && sidebarCollapsed ? 'sidebar-collapsed' : '',
    !isMobile && !sidebarCollapsed ? 'sidebar-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button className="sidebar-toggle" onClick={handleToggleSidebar}>
              ☰
            </button>
            <h1 className="navbar-title">Sistema de Usuários</h1>
          </div>

          <div className="navbar-right">
            <div className="user-menu">
              <span className="user-name">👤 {user?.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="layout-body">
        {/* Overlay (só no mobile e só quando aberto) */}
        {isMobile && sidebarOpenMobile && (
          <div className="sidebar-overlay show" onClick={closeMobileSidebar}></div>
        )}

        {/* Sidebar */}
        <aside className={sidebarClass}>
          <div className="sidebar-header">
            <h3>Menu</h3>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <div key={item.path || item.key} className="sidebar-menu-group">
                {item.type === 'link' ? (
                  <Link
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-text">{item.name}</span>
                  </Link>
                ) : (
                  <>
                    <button
                      className={`sidebar-item expandable ${expandedMenus[item.key] ? 'expanded' : ''}`}
                      onClick={() => toggleMenu(item.key)}
                      type="button"
                    >
                      {/* ✅ Agrupa ícone + texto (resolve o espaçamento) */}
                      <span className="sidebar-left">
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-text">{item.name}</span>
                      </span>

                      <span className="expand-icon">
                        {expandedMenus[item.key] ? '▼' : '▶'}
                      </span>
                    </button>

                    {expandedMenus[item.key] && (
                      <ul className="sidebar-submenu">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              onClick={closeMobileSidebar}
                              className={`sidebar-subitem ${location.pathname === subItem.path ? 'active' : ''}`}
                            >
                              <span className="sidebar-icon">{subItem.icon}</span>
                              <span className="sidebar-text">{subItem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={mainClass}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
