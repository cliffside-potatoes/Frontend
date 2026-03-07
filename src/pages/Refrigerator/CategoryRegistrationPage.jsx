import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ToggleButton from '../../components/common/ToggleButton';
import TextInput from '../../components/common/TextInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import ColorPicker from '../../components/ui/ColorPicker';
import { fridgeApi } from '../../api/fridgeApi';
import './CategoryRegistrationPage.css';

const LOCATION_OPTIONS = [
  { value: 'FREEZER', label: '냉동실' },
  { value: 'FRIDGE', label: '냉장고' },
];

const CategoryRegistrationPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('FREEZER');
  const [categoryName, setCategoryName] = useState('');
  const [color, setColor] = useState('#90caf9');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    setLoading(true);
    try {
      await fridgeApi.createCategory({ name: categoryName.trim(), color, location });
      navigate(-1);
    } catch (error) {
      console.error('카테고리 생성 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-registration-page">
      <PageHeader title="카테고리 등록" onBack={() => navigate(-1)} onHome={() => navigate('/')} />

      <main className="category-registration-page__main">
        <div className="category-registration-page__field">
          <label className="category-registration-page__label">위치 선택</label>
          <ToggleButton options={LOCATION_OPTIONS} value={location} onChange={setLocation} />
        </div>

        <div className="category-registration-page__field">
          <TextInput
            label="카테고리 입력"
            value={categoryName}
            onChange={setCategoryName}
            placeholder="카테고리 입력"
          />
        </div>

        <div className="category-registration-page__field">
          <label className="category-registration-page__label">색상</label>
          <button
            type="button"
            className="category-registration-page__color-trigger"
            onClick={() => setColorPickerOpen(true)}
          >
            <span className="category-registration-page__color-preview" style={{ backgroundColor: color }} />
            <span className="material-symbols-outlined">expand_more</span>
          </button>
        </div>

        <PrimaryButton fullWidth onClick={handleSubmit} disabled={loading || !categoryName.trim()}>
          {loading ? '등록 중...' : '등록'}
        </PrimaryButton>
      </main>

      <ColorPicker isOpen={colorPickerOpen} onClose={() => setColorPickerOpen(false)} value={color} onChange={setColor} />
    </div>
  );
};

export default CategoryRegistrationPage;
