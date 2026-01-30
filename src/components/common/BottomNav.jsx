import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 1, icon: 'home', label: '홈', path: '/' },
    { id: 2, icon: 'comment', label: '피드', path: '/feed' },
    { id: 3, icon: 'kitchen', label: 'my 냉장고', path: '/main' },
    { id: 4, icon: 'bookmark', label: '레시피 저장', path: '/recipe-saved' },
    { id: 5, icon: 'person', label: '마이페이지', path: '/profile' },
  ];

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="material-symbols-outlined nav-icon">
              {item.icon}
            </span>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;