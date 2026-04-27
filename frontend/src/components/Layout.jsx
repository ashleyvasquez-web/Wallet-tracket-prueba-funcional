import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: 'fa-chart-pie', label: 'Panel Principal' },
    { path: '/transactions', icon: 'fa-right-left', label: 'Transacciones' },
    { path: '/budgets', icon: 'fa-sack-dollar', label: 'Presupuestos' },
    { path: '/categories', icon: 'fa-tags', label: 'Categorías' },
    { path: '/settings', icon: 'fa-gear', label: 'Configuración' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <i className="fas fa-wallet"></i>
          <h1>Wallet Tracker</h1>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-details">
              <p className="user-name">{user?.username || 'Usuario'}</p>
              <p className="user-email">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;