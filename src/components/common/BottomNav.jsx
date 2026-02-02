import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
  { id: 1, icon: 'home', label: '홈', path: '/' },
  { id: 2, icon: 'comment', label: '피드', path: '/feed' },
  { id: 3, icon: 'kitchen', label: 'my 냉장고', path: '/refrigerator' },
  { id: 4, icon: 'bookmark', label: '레시피 저장', path: '/recipe-saved' },
  { id: 5, icon: 'person', label: '마이페이지', path: '/profile' },
];

const BottomNav = () => (
  <nav className="bottom-navigation">
    {navItems.map((item) => (
      <NavLink
        key={item.id}
        to={item.path}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        end={item.path === '/'}
      >
        <span className="material-symbols-outlined nav-icon">{item.icon}</span>
        <span className="nav-label">{item.label}</span>
      </NavLink>
    ))}
  </nav>
);

export default BottomNav;