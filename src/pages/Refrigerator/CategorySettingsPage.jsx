import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import BottomNav from '../../components/common/BottomNav';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import './CategorySettingsPage.css';

const MOCK_CATEGORIES = [
  { id: '1', label: '채소', color: '#c8e6c9' },
  { id: '2', label: '육류', color: '#ffcdd2' },
];

const DROPDOWN_OPTIONS = [
  { value: 'edit', label: '수정' },
  { value: 'order', label: '순서변경' },
  { value: 'delete', label: '삭제', danger: true },
];

const CategorySettingsPage = ({ onBack, onAddCategory }) => {
  const [categories] = useState(MOCK_CATEGORIES);
  const [selectedId, setSelectedId] = useState(null);
  const [dropdownCategoryId, setDropdownCategoryId] = useState(null);
  const [deleteModalCategoryId, setDeleteModalCategoryId] = useState(null);

  const freezerEmpty = true;
  const fridgeCategories = categories;

  const handleCategoryOptionSelect = (value, categoryId) => {
    setDropdownCategoryId(null);
    if (value === 'delete') setDeleteModalCategoryId(categoryId);
  };
  const handleConfirmDelete = () => setDeleteModalCategoryId(null);

  return (
    <div className="category-settings-page">
      <PageHeader title="카테고리 설정" onBack={onBack} onHome={() => {}} />

      <main className="category-settings-page__main">
        <section className="category-settings-page__section">
          <h2 className="category-settings-page__section-title">냉동실</h2>
          {freezerEmpty && <p className="category-settings-page__empty">현재 냉장고가 비어있어요!</p>}
        </section>

        <section className="category-settings-page__section">
          <h2 className="category-settings-page__section-title">냉장고</h2>
          <ul className="category-settings-page__list">
            {fridgeCategories.map((cat) => (
              <li
                key={cat.id}
                className={`category-settings-page__item ${selectedId === cat.id ? 'category-settings-page__item--selected' : ''}`}
                onClick={() => setSelectedId(cat.id)}
              >
                <span className="category-settings-page__color" style={{ backgroundColor: cat.color }} />
                <span className="category-settings-page__label">{cat.label}</span>
                <button
                  type="button"
                  className="category-settings-page__more"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownCategoryId(dropdownCategoryId === cat.id ? null : cat.id);
                  }}
                  aria-label="옵션"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                {dropdownCategoryId === cat.id && (
                  <Dropdown
                    isOpen
                    onClose={() => setDropdownCategoryId(null)}
                    options={DROPDOWN_OPTIONS}
                    onSelect={(value) => handleCategoryOptionSelect(value, cat.id)}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <div className="category-settings-page__actions">
        <PrimaryButton fullWidth onClick={onAddCategory}>
          카테고리 추가
        </PrimaryButton>
      </div>

      <Modal
        isOpen={deleteModalCategoryId != null}
        onClose={() => setDeleteModalCategoryId(null)}
        title="카테고리를 삭제하시겠어요?"
        description="하단에 포함된 재료들도 함께 삭제 됩니다"
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalCategoryId(null)}
        variant="danger"
      />

      <BottomNav />
    </div>
  );
};

export default CategorySettingsPage;
