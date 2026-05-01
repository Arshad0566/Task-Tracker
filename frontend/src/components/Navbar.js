import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>📋</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#6366f1' }}>TaskFlow</span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[
            { to: '/dashboard', label: '🏠 Dashboard' },
            { to: '/projects', label: '📁 Projects' },
            { to: '/my-tasks', label: '✅ My Tasks' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              color: isActive(to) ? '#6366f1' : '#64748b',
              background: isActive(to) ? '#e0e7ff' : 'transparent',
              transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 500, textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
