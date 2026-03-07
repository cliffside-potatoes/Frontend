import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import TextInput from '../../components/common/TextInput';
import BottomNav from '../../components/common/BottomNav';
import Pill from '../../components/ui/Pill';
import SuggestionList from '../../components/ui/SuggestionList';
import { fridgeApi } from '../../api/fridgeApi';
import './RefrigeratorPage.css';

const RefrigeratorPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [ingredientsByCategory, setIngredientsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const [inputValue, setInputValue] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);

  const loadFridge = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fridgeApi.getMyFridge();
      const data = res.data?.data ?? res.data ?? {};

      const rawCategories = Array.isArray(data.categories) ? data.categories : [];
      const cats = rawCategories.map((cat) => ({
        id: String(cat.categoryId ?? cat.id),
        label: cat.name ?? cat.label ?? '',
        color: cat.color ?? '#e0e0e0',
        location: cat.location ?? 'FRIDGE',
      }));

      const ingMap = {};
      rawCategories.forEach((cat) => {
        const catId = String(cat.categoryId ?? cat.id);
        ingMap[catId] = (cat.ingredients ?? []).map((ing) => ({
          id: String(ing.ingredientId ?? ing.id),
          label: ing.name ?? ing.label ?? '',
          color: cats.find((c) => c.id === catId)?.color ?? '#e0e0e0',
        }));
      });

      setCategories(cats);
      setIngredientsByCategory(ingMap);
    } catch (error) {
      console.error('냉장고 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFridge();
  }, [loadFridge]);

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate('/');
  const handleAddCategory = () => navigate('/refrigerator/category');
  const handleCategorySettings = () => navigate('/refrigerator/category/settings');

  const handleInputChange = async (val) => {
    setInputValue(val);
    setSelectedIndex(-1);

    if (!val?.trim()) {
      setSuggestions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fridgeApi.searchIngredients(val.trim());
      const data = res.data?.data ?? res.data ?? [];
      const names = Array.isArray(data)
        ? data.map((item) => (typeof item === 'string' ? item : item.name ?? ''))
        : [];
      setSuggestions(names.filter(Boolean));
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSuggestion = async (name) => {
    if (!activeCategoryId) return;
    setInputValue('');
    setSuggestions([]);

    try {
      await fridgeApi.addIngredient({ name, categoryId: Number(activeCategoryId) });
      await loadFridge();
    } catch (error) {
      console.error('재료 추가 실패:', error);
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    try {
      await fridgeApi.deleteIngredient(ingredientId);
      await loadFridge();
    } catch (error) {
      console.error('재료 삭제 실패:', error);
    }
  };

  const hasCategories = categories.length > 0;

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
              {categories.filter((c) => c.location === 'FREEZER').length === 0 && (
                <p className="refrigerator-page__empty">현재 냉동실이 비어있어요!</p>
              )}
              {categories
                .filter((c) => c.location === 'FREEZER')
                .map((cat) => (
                  <CategoryBlock
                    key={cat.id}
                    cat={cat}
                    ingredients={ingredientsByCategory[cat.id] || []}
                    activeCategoryId={activeCategoryId}
                    setActiveCategoryId={setActiveCategoryId}
                    inputValue={inputValue}
                    handleInputChange={handleInputChange}
                    handleSelectSuggestion={handleSelectSuggestion}
                    handleDeleteIngredient={handleDeleteIngredient}
                    suggestions={suggestions}
                    selectedIndex={selectedIndex}
                    searchLoading={searchLoading}
                  />
                ))}
            </section>

            <section className="refrigerator-page__section">
              <h2 className="refrigerator-page__section-title">냉장고</h2>
              {!hasCategories || categories.filter((c) => c.location !== 'FREEZER').length === 0 ? (
                <p className="refrigerator-page__empty">현재 냉장고가 비어있어요!</p>
              ) : (
                <div className="refrigerator-page__content">
                  {categories
                    .filter((c) => c.location !== 'FREEZER')
                    .map((cat) => (
                      <CategoryBlock
                        key={cat.id}
                        cat={cat}
                        ingredients={ingredientsByCategory[cat.id] || []}
                        activeCategoryId={activeCategoryId}
                        setActiveCategoryId={setActiveCategoryId}
                        inputValue={inputValue}
                        handleInputChange={handleInputChange}
                        handleSelectSuggestion={handleSelectSuggestion}
                        handleDeleteIngredient={handleDeleteIngredient}
                        suggestions={suggestions}
                        selectedIndex={selectedIndex}
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
    </div>
  );
};

const CategoryBlock = ({
  cat,
  ingredients,
  activeCategoryId,
  setActiveCategoryId,
  inputValue,
  handleInputChange,
  handleSelectSuggestion,
  handleDeleteIngredient,
  suggestions,
  selectedIndex,
  searchLoading,
}) => (
  <div className="refrigerator-page__category-block">
    <div className="refrigerator-page__category-header">
      <span className="refrigerator-page__category-color" style={{ backgroundColor: cat.color }} />
      <h3 className="refrigerator-page__category-title">{cat.label}</h3>
      <Pill color={cat.color} asButton onClick={() => setActiveCategoryId(cat.id)} className="refrigerator-page__category-add">
        +
      </Pill>
    </div>
    <div className="refrigerator-page__ingredients">
      {ingredients.map((ing) => (
        <div key={ing.id} className="refrigerator-page__ingredient">
          <Pill color={ing.color}>{ing.label}</Pill>
          <button
            type="button"
            className="refrigerator-page__icon-btn"
            onClick={() => handleDeleteIngredient(ing.id)}
            aria-label="삭제"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      ))}
    </div>
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
          emptyMessage={
            inputValue?.trim() && !searchLoading && suggestions.length === 0
              ? '매칭되는 재료가 아직 없어요! 🤔'
              : null
          }
        />
      </div>
    )}
  </div>
);

export default RefrigeratorPage;
