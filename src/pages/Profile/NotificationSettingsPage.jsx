import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import './NotificationSettingsPage.css';

const STORAGE_KEY = 'helpfridge_notification_enabled';

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const handleBack = () => navigate(-1);

  return (
    <div className="notification-settings-page">
      <header className="notification-settings-header">
        <button type="button" className="ns-header__back" onClick={handleBack} aria-label="뒤로가기">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="ns-header__title">알림</h1>
        <div className="ns-header__spacer" />
      </header>

      <main className="notification-settings-main">
        <div className="ns-row">
          <span className="ns-row__label">푸시 알림</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            className={`ns-switch ${enabled ? 'ns-switch--on' : ''}`}
            onClick={() => setEnabled((v) => !v)}
          >
            <span className="ns-switch__thumb" />
          </button>
        </div>
        <p className="ns-description">새로운 레시피, 댓글, 좋아요 등 알림을 받을 수 있어요.</p>
      </main>

      <BottomNav />
    </div>
  );
};

export default NotificationSettingsPage;
