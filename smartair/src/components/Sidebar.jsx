import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import MobileNav from './MobileNav.jsx';

import '../styles/Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  const [showAccount, setShowAccount] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Dispositivi', path: '/devices', icon: '🔧' },
  ];

  const isActive = path => location.pathname === path;

  return (
    <>
    <MobileNav menuItems={menuItems} />
    <div className="sidebar-body">
      {/* Header */}
      <div className="sidebar-header">
        <h2>SmartAir</h2>
        <p>v1.0</p>
      </div>

      {/* Menu */}
      <nav className="sidebar-items-container">
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="sidebar-item"
            data-active={isActive(item.path)}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Account */}
      <div className="acc-btn-container">
        <button
          onClick={() => setShowAccount(!showAccount)}
          className="acc-btn"
        >
          👤 {user?.email?.split('@')[0] || 'Account'}
        </button>

        {showAccount && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => navigate('/account')}
              data-active={isActive('/account')}
              className="sidebar-item"
            >
              Impostazioni
            </button>
            <button
              onClick={() => signOut(auth)}
              className="acc-exit-btn"
            >
              Esci
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}