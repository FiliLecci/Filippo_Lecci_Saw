import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

import '../styles/MobileNav.css';


export default function MobileNav({ menuItems = []}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  const [showAccount, setShowAccount] = useState(false);

  const isActive = path => location.pathname === path;
  
  return (
    <>
      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <img src="/icons/logo_trasp.png" alt="SmartAir" width="44" height="44" />
      </button>
      {isOpen && (
        <div className="mobile-drawer" onClick={() => setIsOpen(false)}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
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
        </div>        
      )}
    </>
  );
}