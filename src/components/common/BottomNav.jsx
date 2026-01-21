import React from 'react';
import './BottomNav.css';

const BottomNav = () => {
  const navItems = [
    { id: 1, icon: 'home', label: '홈', path: '/', isActive: false },
    { id: 2, icon: 'list_alt', label: '피드', path: '/feed', isActive: false },
    { id: 3, icon: 'kitchen', label: 'my 냉장고', path: '/main', isActive: true },
    { id: 4, icon: 'bookmark', label: '레시피 저장', path: '/recipe-saved', isActive: false },
    { id: 5, icon: 'person', label: '마이페이지', path: '/profile', isActive: false },
  ];

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${item.isActive ? 'active' : ''}`}
        >
          {/* 구글 매터리얼 심볼 적용 부분 */}
          <span className="material-symbols-outlined nav-icon">
            {item.icon}
          </span>
          <span className="nav-label">{item.label}</span>
        </div>
      ))}
    </nav>
  );
};

export default BottomNav;