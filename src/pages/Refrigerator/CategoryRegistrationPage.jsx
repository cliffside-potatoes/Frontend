import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ToggleButton from '../../components/common/ToggleButton';
import TextInput from '../../components/common/TextInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import ColorPicker from '../../components/ui/ColorPicker';
import './CategoryRegistrationPage.css';

const LOCATION_OPTIONS = [
  { value: 'freezer', label: '냉동실' },
  { value: 'fridge', label: '냉장고' },
];

const CategoryRegistrationPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('freezer');
  const [categoryName, setCategoryName] = useState('');
  const [color, setColor] = useState('#90caf9');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleSubmit = () => {};

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

        <PrimaryButton fullWidth onClick={handleSubmit}>
          등록
        </PrimaryButton>
      </main>

      <ColorPicker isOpen={colorPickerOpen} onClose={() => setColorPickerOpen(false)} value={color} onChange={setColor} />
    </div>
  );
};

export default CategoryRegistrationPage;
