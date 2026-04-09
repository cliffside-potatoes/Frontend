import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import Modal from '../../components/ui/Modal';
import { useUser } from '../../context/UserContext';
import { withdrawMePermanent } from '../../api/userApi';
import './SettingsPage.css';

const SETTINGS_ITEMS = [
  { id: 'notifications', icon: 'notifications', label: '알림', path: '/profile/settings/notifications' },
  { id: 'mypage', icon: 'person', label: '마이페이지', path: '/profile' },
  { id: 'my-recipes', icon: 'edit_note', label: '내가 쓴 레시피', path: '/profile/my-recipes' },
  { id: 'my-reviews', icon: 'rate_review', label: '내가 쓴 후기', path: '/profile/my-reviews' },
  { id: 'saved', icon: 'bookmark', label: '저장', path: '/recipe-saved' },
];

const clearLocalUserData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('myPosts');
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useUser();

  const [permanentWithdrawModalOpen, setPermanentWithdrawModalOpen] = useState(false);
  const [permanentWithdrawing, setPermanentWithdrawing] = useState(false);

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

  const handlePermanentWithdraw = async () => {
    setPermanentWithdrawing(true);

    try {
      await withdrawMePermanent();
      clearLocalUserData();
      alert('회원탈퇴가 완료되었습니다.');
      navigate('/main', { replace: true });
    } catch (error) {
      console.error('회원탈퇴 실패:', error);

      if (error?.status === 404) {
        alert('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      alert('회원탈퇴에 실패했어. 잠시 후 다시 시도해줘.');
    } finally {
      setPermanentWithdrawing(false);
      setPermanentWithdrawModalOpen(false);
    }
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

          <li className="settings-list-item">
            <button
              type="button"
              className="settings-item-button settings-item-withdraw"
              onClick={() => setPermanentWithdrawModalOpen(true)}
            >
              <span className="settings-item-label">회원탈퇴</span>
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

      <Modal
        isOpen={permanentWithdrawModalOpen}
        onClose={() => setPermanentWithdrawModalOpen(false)}
        title="회원탈퇴 하시겠어요?"
        description="계정과 연관된 데이터가 삭제되며, 복구할 수 없습니다."
        cancelLabel="취소"
        confirmLabel={permanentWithdrawing ? '처리 중...' : '탈퇴하기'}
        onCancel={() => setPermanentWithdrawModalOpen(false)}
        onConfirm={handlePermanentWithdraw}
        variant="danger"
      />

      <BottomNav />
    </div>
  );
};

export default SettingsPage;