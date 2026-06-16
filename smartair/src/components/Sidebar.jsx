import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

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
    <div style={{
      width: 240,
      height: '100vh',
      background: '#1a1a1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: 16,
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #333' }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>SmartAir</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aaa' }}>v1.0</p>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1 }}>
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '12px 16px',
              margin: '8px 0',
              border: 'none',
              borderRadius: 8,
              background: isActive(item.path) ? '#2196f3' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => !isActive(item.path) && (e.target.style.background = '#333')}
            onMouseLeave={e => !isActive(item.path) && (e.target.style.background = 'transparent')}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Account */}
      <div style={{ paddingTop: 16, borderTop: '1px solid #333' }}>
        <button
          onClick={() => setShowAccount(!showAccount)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#333',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            cursor: 'pointer',
            fontSize: 13,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.target.style.background = '#444'}
          onMouseLeave={e => e.target.style.background = '#333'}
        >
          👤 {user?.email?.split('@')[0] || 'Account'}
        </button>

        {showAccount && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => navigate('/account')}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                margin: '4px 0',
                background: 'transparent',
                border: '1px solid #555',
                borderRadius: 6,
                color: 'white',
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Impostazioni
            </button>
            <button
              onClick={() => signOut(auth)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                margin: '4px 0',
                background: '#f44336',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Esci
            </button>
          </div>
        )}
      </div>
    </div>
  );
}