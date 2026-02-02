import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import TextInput from '../../components/common/TextInput';
import BottomNav from '../../components/common/BottomNav';
import Pill from '../../components/ui/Pill';
import SuggestionList from '../../components/ui/SuggestionList';
import './RefrigeratorPage.css';

const MOCK_CATEGORIES = [
  { id: '1', label: '채소', color: '#c8e6c9' },
  { id: '2', label: '육류', color: '#ffcdd2' },
];

const MOCK_INGREDIENTS = {
  '1': [{ id: 'i1', label: '토마토', color: '#c8e6c9' }],
  '2': [{ id: 'i2', label: '소고기', color: '#ffcdd2' }],
};

const RefrigeratorPage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const freezerEmpty = true;
  const fridgeCategories = MOCK_CATEGORIES;
  const fridgeIngredients = MOCK_INGREDIENTS;
  const hasCategories = fridgeCategories?.length > 0;

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate('/');
  const handleAddCategory = () => navigate('/refrigerator/category');
  const handleCategorySettings = () => navigate('/refrigerator/category/settings');
  const handleInputChange = (val) => {
    setInputValue(val);
    if (val?.trim()) {
      setSuggestions(['토마토', '토마토 쥬스']);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
    }
  };
  const handleSelectSuggestion = () => {
    setInputValue('');
    setSuggestions([]);
  };
  const handleDeleteIngredient = () => {};
  const handleEditIngredient = () => {};

  return (
    <div className="refrigerator-page">
      <PageHeader title="내 냉장고" onBack={handleBack} onHome={handleHome} />

      <main className="refrigerator-page__main">
        <section className="refrigerator-page__section">
          <h2 className="refrigerator-page__section-title">냉동실</h2>
          {freezerEmpty && <p className="refrigerator-page__empty">현재 냉장고가 비어있어요!</p>}
        </section>

        <section className="refrigerator-page__section">
          <h2 className="refrigerator-page__section-title">냉장고</h2>
          {!hasCategories ? (
            <p className="refrigerator-page__empty">현재 냉장고가 비어있어요!</p>
          ) : (
            <div className="refrigerator-page__content">
              {fridgeCategories.map((cat) => (
                <React.Fragment key={cat.id}>
                  <Pill color={cat.color} asButton onClick={() => setActiveCategoryId(cat.id)}>
                    {cat.label} +
                  </Pill>
                  {(fridgeIngredients[cat.id] || []).map((ing) => (
                    <div key={ing.id} className="refrigerator-page__ingredient">
                      <Pill color={ing.color}>{ing.label}</Pill>
                      <button type="button" className="refrigerator-page__icon-btn" onClick={handleDeleteIngredient} aria-label="삭제">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                      <button type="button" className="refrigerator-page__icon-btn" onClick={handleEditIngredient} aria-label="수정">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </div>
                  ))}
                  {activeCategoryId === cat.id && (
                    <div className="refrigerator-page__input-wrap">
                      <TextInput
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="재료 입력"
                        className="refrigerator-page__input"
                      />
                      <SuggestionList
                        items={suggestions}
                        selectedIndex={selectedIndex}
                        onSelect={handleSelectSuggestion}
                        emptyMessage={inputValue?.trim() && suggestions.length === 0 ? '매칭되는 재료가 아직 없어요! 🤔' : null}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </section>
      </main>

      <div className="refrigerator-page__actions">
        <PrimaryButton fullWidth onClick={handleAddCategory}>
          카테고리 추가
        </PrimaryButton>
        <PrimaryButton fullWidth onClick={handleCategorySettings}>
          카테고리 설정
        </PrimaryButton>
      </div>

      <BottomNav />
    </div>
  );
};

export default RefrigeratorPage;
