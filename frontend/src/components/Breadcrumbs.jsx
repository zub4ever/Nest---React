import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    const breadcrumbMap = {
      '/dashboard': [
        { label: 'Dashboard', path: '/dashboard', isActive: true }
      ],
      '/users': [
        { label: 'Dashboard', path: '/dashboard', isActive: false },
        { label: 'Usuários', path: '/users', isActive: true }
      ],
      '/create-user': [
        { label: 'Dashboard', path: '/dashboard', isActive: false },
        { label: 'Usuários', path: '/users', isActive: false },
        { label: 'Criar Usuário', path: '/create-user', isActive: true }
      ]
    };
    
    return breadcrumbMap[path] || [];
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="breadcrumbs">
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="breadcrumbs-item">
            {crumb.isActive ? (
              <span className="breadcrumbs-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="breadcrumbs-link">
                {crumb.label}
              </Link>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className="breadcrumbs-separator">▶</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;