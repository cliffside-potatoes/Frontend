import React from 'react';
import './BottomNav.css';

const BottomNav = () => {
  const navItems = [
    { id: 1, icon: '🏠', label: '홈', path: '/', isActive: false },
    { id: 2, icon: '📋', label: '피드', path: '/feed', isActive: false },
    { id: 3, icon: '❄️', label: 'my 냉장고', path: '/main', isActive: true },
    { id: 4, icon: '🔖', label: '레시피 저장', path: '/recipe-saved', isActive: false },
    { id: 5, icon: '👤', label: '마이페이지', path: '/profile', isActive: false },
  ];

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${item.isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </div>
      ))}
    </nav>
  );
};

export default BottomNav;
