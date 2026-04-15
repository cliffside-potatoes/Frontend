import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import BottomNav from '../../components/common/BottomNav';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import TextInput from '../../components/common/TextInput';
import ColorPicker from '../../components/ui/ColorPicker';
import { fridgeApi } from '../../api/fridgeApi';
import {
  DEFAULT_CATEGORY_COLOR_HEX,
  toCategoryColorHex,
} from '../../utils/categoryColors';
import './CategorySettingsPage.css';

const DROPDOWN_OPTIONS = [
  { value: 'edit', label: '수정' },
  { value: 'delete', label: '삭제', danger: true },
];

const CategorySettingsPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [dropdownCategoryId, setDropdownCategoryId] = useState(null);
  const [deleteModalCategoryId, setDeleteModalCategoryId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editModalCategory, setEditModalCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_CATEGORY_COLOR_HEX);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);

    try {
      const fridge = await fridgeApi.getMyFridge();
      const nextCategories = Array.isArray(fridge?.categories) ? fridge.categories : [];
      setCategories(nextCategories);
      setSelectedId((prev) =>
        nextCategories.some((category) => category.id === prev) ? prev : null
      );
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      setCategories([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleCategoryOptionSelect = (value, categoryId) => {
    setDropdownCategoryId(null);

    if (value === 'delete') {
      setDeleteModalCategoryId(categoryId);
      return;
    }

    if (value === 'edit') {
      const targetCategory = categories.find((category) => category.id === categoryId);

      if (!targetCategory) return;

      setEditModalCategory(targetCategory);
      setEditName(targetCategory.label);
      setEditColor(toCategoryColorHex(targetCategory.color));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalCategoryId) return;

    setDeleting(true);

    try {
      await fridgeApi.deleteCategory(deleteModalCategoryId);
      setDeleteModalCategoryId(null);
      await loadCategories();
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      alert('카테고리를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editModalCategory) return;

    const trimmedName = editName.trim();
    if (!trimmedName) return;

    setSaving(true);

    try {
      await fridgeApi.updateCategory(editModalCategory.id, {
        name: trimmedName,
        color: editColor,
        storageType: editModalCategory.location,
      });

      setEditModalCategory(null);
      await loadCategories();
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      alert('카테고리를 수정하지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const freezerCategories = categories.filter((category) => category.location === 'FROZEN');
  const refrigeratedCategories = categories.filter(
    (category) => category.location === 'REFRIGERATED'
  );

  return (
    <div className="category-settings-page">
      <PageHeader
        title="카테고리 설정"
        onBack={() => navigate(-1)}
        onHome={() => navigate('/main')}
      />

      <main className="category-settings-page__main">
        {loading ? (
          <p className="category-settings-page__empty">불러오는 중...</p>
        ) : (
          <>
            <section className="category-settings-page__section">
              <h2 className="category-settings-page__section-title">냉동실</h2>
              {freezerCategories.length === 0 ? (
                <p className="category-settings-page__empty">현재 냉동실이 비어있어요!</p>
              ) : (
                <CategoryList
                  categories={freezerCategories}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  dropdownCategoryId={dropdownCategoryId}
                  setDropdownCategoryId={setDropdownCategoryId}
                  onOptionSelect={handleCategoryOptionSelect}
                />
              )}
            </section>

            <section className="category-settings-page__section">
              <h2 className="category-settings-page__section-title">냉장고</h2>
              {refrigeratedCategories.length === 0 ? (
                <p className="category-settings-page__empty">현재 냉장고가 비어있어요!</p>
              ) : (
                <CategoryList
                  categories={refrigeratedCategories}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  dropdownCategoryId={dropdownCategoryId}
                  setDropdownCategoryId={setDropdownCategoryId}
                  onOptionSelect={handleCategoryOptionSelect}
                />
              )}
            </section>
          </>
        )}
      </main>

      <div className="category-settings-page__actions">
        <PrimaryButton fullWidth onClick={() => navigate('/refrigerator/category')}>
          카테고리 추가
        </PrimaryButton>
      </div>

      <Modal
        isOpen={deleteModalCategoryId != null}
        onClose={() => setDeleteModalCategoryId(null)}
        title="카테고리를 삭제하시겠어요?"
        description="카테고리에 포함된 재료도 함께 삭제됩니다."
        confirmLabel={deleting ? '삭제 중...' : '삭제'}
        cancelLabel="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalCategoryId(null)}
        variant="danger"
      />

      {editModalCategory && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setEditModalCategory(null)}
            aria-hidden="true"
          />
          <div className="modal category-edit-modal">
            <h3 className="modal-title">카테고리 수정</h3>
            <div className="category-edit-modal__field">
              <TextInput
                label="카테고리 이름"
                value={editName}
                onChange={setEditName}
                placeholder="카테고리 이름을 입력해주세요"
              />
            </div>
            <div className="category-edit-modal__field">
              <label className="category-edit-modal__label">색상</label>
              <button
                type="button"
                className="category-edit-modal__color-trigger"
                onClick={() => setColorPickerOpen(true)}
              >
                <span
                  className="category-edit-modal__color-preview"
                  style={{
                    backgroundColor: editColor,
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    display: 'inline-block',
                  }}
                />
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn--cancel"
                onClick={() => setEditModalCategory(null)}
              >
                취소
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--confirm"
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim()}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </>
      )}

      <ColorPicker
        isOpen={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        value={editColor}
        onChange={setEditColor}
      />

      <BottomNav />
    </div>
  );
};

const CategoryList = ({
  categories,
  selectedId,
  setSelectedId,
  dropdownCategoryId,
  setDropdownCategoryId,
  onOptionSelect,
}) => (
  <ul className="category-settings-page__list">
    {categories.map((category) => (
      <li
        key={category.id}
        className={`category-settings-page__item ${
          selectedId === category.id ? 'category-settings-page__item--selected' : ''
        }`}
        onClick={() => setSelectedId(category.id)}
      >
        <span
          className="category-settings-page__color"
          style={{ backgroundColor: toCategoryColorHex(category.color) }}
        />
        <span className="category-settings-page__label">{category.label}</span>
        <button
          type="button"
          className="category-settings-page__more"
          onClick={(event) => {
            event.stopPropagation();
            setDropdownCategoryId(
              dropdownCategoryId === category.id ? null : category.id
            );
          }}
          aria-label="카테고리 옵션"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
        {dropdownCategoryId === category.id && (
          <Dropdown
            isOpen
            onClose={() => setDropdownCategoryId(null)}
            options={DROPDOWN_OPTIONS}
            onSelect={(value) => onOptionSelect(value, category.id)}
          />
        )}
      </li>
    ))}
  </ul>
);

export default CategorySettingsPage;
