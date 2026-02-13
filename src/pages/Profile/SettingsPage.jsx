import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import { useUser } from '../../context/UserContext';
import './SettingsPage.css';

const SETTINGS_ITEMS = [
  { id: 'notifications', icon: 'notifications', label: '알림', path: '/profile/settings/notifications' },
  { id: 'mypage', icon: 'person', label: '마이페이지', path: '/profile' },
  { id: 'my-recipes', icon: 'edit_note', label: '내가 쓴 레시피', path: '/profile/my-recipes' },
  { id: 'my-reviews', icon: 'rate_review', label: '내가 쓴 후기', path: '/profile/my-reviews' },
  { id: 'saved', icon: 'bookmark', label: '저장', path: '/recipe-saved' },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleBack = () => navigate(-1);

  const handleItemClick = (item) => {
    if (item.id === 'mypage') {
      navigate('/profile');
      return;
    }
    navigate(item.path);
  };

  const handleFabClick = () => {
    navigate('/profile');
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <button type="button" className="settings-header__back" onClick={handleBack} aria-label="뒤로가기">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="settings-header__title">설정</h1>
        <button type="button" className="settings-header__gear" aria-label="설정" disabled>
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="settings-main">
        <ul className="settings-list">
          {SETTINGS_ITEMS.map((item) => (
            <li key={item.id} className="settings-list-item">
              <button
                type="button"
                className="settings-item-button"
                onClick={() => handleItemClick(item)}
              >
                <span className="material-symbols-outlined settings-item-icon">{item.icon}</span>
                <span className="settings-item-label">{item.label}</span>
                <span className="material-symbols-outlined settings-item-chevron">chevron_right</span>
              </button>
            </li>
          ))}
          <li className="settings-list-item">
            <button type="button" className="settings-item-button settings-item-logout" onClick={logout}>
              <span className="settings-item-label">로그아웃</span>
            </button>
          </li>
        </ul>
      </main>

      <button
        type="button"
        className="settings-fab"
        aria-label="추가"
        onClick={handleFabClick}
      >
        <span className="material-symbols-outlined">add</span>
      </button>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
