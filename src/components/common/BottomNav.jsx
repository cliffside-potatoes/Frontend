import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './BottomNav.css';

const navItems = [
  { id: 1, icon: 'home', label: '홈', path: '/main' },
  { id: 2, icon: 'comment', label: '피드', path: '/feed' },
  { id: 3, icon: 'kitchen', label: 'my 냉장고', path: '/refrigerator' },
  { id: 4, icon: 'bookmark', label: '레시피 저장', path: '/recipe-saved' },
  { id: 5, icon: 'person', label: '마이페이지', path: '/profile' },
];

const protectedPaths = new Set(['/refrigerator', '/recipe-saved', '/profile']);

const BottomNav = () => {
  const { isInitializing } = useUser();

  const handleClick = (event, item) => {
    if (!protectedPaths.has(item.path)) return;

    if (isInitializing) {
      event.preventDefault();
    }
  };

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end={item.path === '/main'}
          onClick={(event) => handleClick(event, item)}
        >
          <span className="material-symbols-outlined nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
