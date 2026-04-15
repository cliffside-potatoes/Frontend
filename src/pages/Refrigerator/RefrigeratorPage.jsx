import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import TextInput from '../../components/common/TextInput';
import BottomNav from '../../components/common/BottomNav';
import GuestLoginPrompt from '../../components/common/GuestLoginPrompt';
import { useUser } from '../../context/UserContext';
import Pill from '../../components/ui/Pill';
import SuggestionList from '../../components/ui/SuggestionList';
import { fridgeApi } from '../../api/fridgeApi';
import { toCategoryColorHex } from '../../utils/categoryColors';
import './RefrigeratorPage.css';

const RefrigeratorPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing } = useUser();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const loadFridge = useCallback(async () => {
    setLoading(true);

    try {
      const fridge = await fridgeApi.getMyFridge();
      const nextCategories = Array.isArray(fridge?.categories) ? fridge.categories : [];

      setCategories(nextCategories);
      setActiveCategoryId((prev) =>
        nextCategories.some((category) => category.id === prev) ? prev : null
      );
    } catch (error) {
      console.error('냉장고 조회 실패:', error);
      setCategories([]);
      setActiveCategoryId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!isLoggedIn) {
      setLoading(false);
      setCategories([]);
      setActiveCategoryId(null);
      return;
    }
    void loadFridge();
  }, [loadFridge, isInitializing, isLoggedIn]);

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate('/main');
  const handleAddCategory = () => navigate('/refrigerator/category');
  const handleCategorySettings = () => navigate('/refrigerator/category/settings');

  const handleOpenCategoryInput = (categoryId) => {
    setInputValue('');
    setSuggestions([]);
    setActiveCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleInputChange = async (value) => {
    setInputValue(value);

    if (!value?.trim()) {
      setSuggestions([]);
      return;
    }

    setSearchLoading(true);

    try {
      const nextSuggestions = await fridgeApi.searchIngredients(value.trim());
      setSuggestions(nextSuggestions);
    } catch (error) {
      console.error('재료 자동완성 조회 실패:', error);
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    if (!activeCategoryId) return;

    const selectedSuggestion =
      typeof suggestion === 'string'
        ? suggestions.find((item) => item.label === suggestion)
        : suggestion;

    if (!selectedSuggestion) {
      return;
    }

    try {
      await fridgeApi.addIngredient({
        categoryId: activeCategoryId,
        ingredientId: selectedSuggestion.ingredientId,
        ingredientName: selectedSuggestion.ingredientName,
      });

      setInputValue('');
      setSuggestions([]);
      setActiveCategoryId(null);
      await loadFridge();
    } catch (error) {
      console.error('재료 추가 실패:', error);
      alert('재료를 추가하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    try {
      await fridgeApi.deleteIngredient(ingredientId);
      await loadFridge();
    } catch (error) {
      console.error('재료 삭제 실패:', error);
      alert('재료를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const freezerCategories = useMemo(
    () => categories.filter((category) => category.location === 'FROZEN'),
    [categories]
  );

  const refrigeratedCategories = useMemo(
    () => categories.filter((category) => category.location === 'REFRIGERATED'),
    [categories]
  );

  return (
    <div className="refrigerator-page">
      <PageHeader title="내 냉장고" onBack={handleBack} onHome={handleHome} />

      <main className="refrigerator-page__main">
        {loading ? (
          <p className="refrigerator-page__empty">불러오는 중...</p>
        ) : (
          <>
            <section className="refrigerator-page__section">
              <h2 className="refrigerator-page__section-title">냉동실</h2>

              {freezerCategories.length === 0 ? (
                <p className="refrigerator-page__empty">현재 냉동실이 비어있어요!</p>
              ) : (
                freezerCategories.map((category) => (
                  <CategoryBlock
                    key={category.id}
                    category={category}
                    activeCategoryId={activeCategoryId}
                    inputValue={inputValue}
                    onOpenInput={handleOpenCategoryInput}
                    onInputChange={handleInputChange}
                    onSelectSuggestion={handleSelectSuggestion}
                    onDeleteIngredient={handleDeleteIngredient}
                    suggestions={suggestions}
                    searchLoading={searchLoading}
                  />
                ))
              )}
            </section>

            <section className="refrigerator-page__section">
              <h2 className="refrigerator-page__section-title">냉장고</h2>

              {refrigeratedCategories.length === 0 ? (
                <p className="refrigerator-page__empty">현재 냉장고가 비어있어요!</p>
              ) : (
                <div className="refrigerator-page__content">
                  {refrigeratedCategories.map((category) => (
                    <CategoryBlock
                      key={category.id}
                      category={category}
                      activeCategoryId={activeCategoryId}
                      inputValue={inputValue}
                      onOpenInput={handleOpenCategoryInput}
                      onInputChange={handleInputChange}
                      onSelectSuggestion={handleSelectSuggestion}
                      onDeleteIngredient={handleDeleteIngredient}
                      suggestions={suggestions}
                      searchLoading={searchLoading}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
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

      <GuestLoginPrompt afterLoginPath="/refrigerator" />
    </div>
  );
};

const CategoryBlock = ({
  category,
  activeCategoryId,
  inputValue,
  onOpenInput,
  onInputChange,
  onSelectSuggestion,
  onDeleteIngredient,
  suggestions,
  searchLoading,
}) => (
  <div className="refrigerator-page__category-block">
    <div className="refrigerator-page__category-header">
      <span
        className="refrigerator-page__category-color"
        style={{ backgroundColor: toCategoryColorHex(category.color) }}
      />
      <h3 className="refrigerator-page__category-title">{category.label}</h3>
      <Pill
        color={toCategoryColorHex(category.color)}
        asButton
        onClick={() => onOpenInput(category.id)}
        className="refrigerator-page__category-add"
      >
        +
      </Pill>
    </div>

    <div className="refrigerator-page__ingredients">
      {category.ingredients.map((ingredient) => (
        <div key={ingredient.id} className="refrigerator-page__ingredient">
          <Pill color={toCategoryColorHex(ingredient.color)}>
            {ingredient.label}
          </Pill>
          <button
            type="button"
            className="refrigerator-page__icon-btn"
            onClick={() => onDeleteIngredient(ingredient.id)}
            aria-label="재료 삭제"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      ))}
    </div>

    {activeCategoryId === category.id && (
      <div className="refrigerator-page__input-wrap">
        <TextInput
          value={inputValue}
          onChange={onInputChange}
          placeholder="재료 입력"
          className="refrigerator-page__input"
        />
        <SuggestionList
          items={suggestions}
          selectedIndex={-1}
          onSelect={onSelectSuggestion}
          emptyMessage={
            inputValue?.trim() && !searchLoading && suggestions.length === 0
              ? '매칭되는 재료가 아직 없어요!'
              : null
          }
        />
      </div>
    )}
  </div>
);

export default RefrigeratorPage;
