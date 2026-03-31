import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import TextInput from '../../components/common/TextInput';
import BottomNav from '../../components/common/BottomNav';
import Pill from '../../components/ui/Pill';
import SuggestionList from '../../components/ui/SuggestionList';
import { fridgeApi } from '../../api/fridgeApi';
import './RefrigeratorPage.css';

const COLOR_ENUM_MAP = {
  RED: '#EF4444',
  BLUE: '#3B82F6',
  GREEN: '#22C55E',
};

const DEFAULT_CATEGORY_COLOR = '#90CAF9';

const isHexColor = (value) =>
  typeof value === 'string' &&
  /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());

const normalizeCategoryColor = (color) => {
  if (!color) return DEFAULT_CATEGORY_COLOR;

  const trimmed = String(color).trim();

  if (isHexColor(trimmed)) {
    return trimmed.toUpperCase();
  }

  if (COLOR_ENUM_MAP[trimmed]) {
    return COLOR_ENUM_MAP[trimmed];
  }

  return DEFAULT_CATEGORY_COLOR;
};

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
      const sections = Array.isArray(data.items) ? data.items : [];

      const nextCategories = [];
      const nextIngredientsMap = {};

      sections.forEach((section) => {
        const storageType = section?.storageType ?? 'REFRIGERATED';
        const rawCategories = Array.isArray(section?.categories) ? section.categories : [];

        rawCategories.forEach((cat) => {
          const categoryId = String(cat?.categoryId ?? '');
          const normalizedCategory = {
            id: categoryId,
            label: cat?.categoryName ?? '',
            color: cat?.color ?? DEFAULT_CATEGORY_COLOR,
            location: storageType,
            order: cat?.categoryOrder ?? 0,
          };

          nextCategories.push(normalizedCategory);

          nextIngredientsMap[categoryId] = Array.isArray(cat?.ingredients)
            ? cat.ingredients.map((ing) => ({
              id: String(ing?.fridgeIngredientId ?? ''),
              label: ing?.ingredientName ?? '',
              color: normalizedCategory.color,
            }))
            : [];
        });
      });

      nextCategories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      setCategories(nextCategories);
      setIngredientsByCategory(nextIngredientsMap);
    } catch (error) {
      console.error('냉장고 조회 실패:', error);
      setCategories([]);
      setIngredientsByCategory({});
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
      const data = res.data?.data ?? res.data ?? {};
      const items = Array.isArray(data?.items) ? data.items : [];

      const normalizedSuggestions = items
        .map((item) => ({
          ingredientId: item?.ingredientId,
          ingredientName: item?.ingredientName ?? '',
        }))
        .filter((item) => item.ingredientId != null && item.ingredientName);

      setSuggestions(normalizedSuggestions);
    } catch (error) {
      console.error('재료 자동완성 조회 실패:', error);
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSuggestion = async (ingredientName) => {
    if (!activeCategoryId) return;

    const selectedSuggestion = suggestions.find(
      (item) => item.ingredientName === ingredientName
    );

    if (!selectedSuggestion?.ingredientId) {
      return;
    }

    setInputValue('');
    setSuggestions([]);

    try {
      await fridgeApi.addIngredient({
        categoryId: Number(activeCategoryId),
        ingredientId: Number(selectedSuggestion.ingredientId),
      });

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

  const freezerCategories = useMemo(
    () => categories.filter((c) => c.location === 'FROZEN'),
    [categories]
  );

  const refrigeratedCategories = useMemo(
    () => categories.filter((c) => c.location === 'REFRIGERATED'),
    [categories]
  );

  const suggestionNames = suggestions.map((item) => item.ingredientName);

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
                freezerCategories.map((cat) => (
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
                    suggestions={suggestionNames}
                    selectedIndex={selectedIndex}
                    searchLoading={searchLoading}
                  />
                ))
              )}
            </section>

            <section className="refrigerator-page__section">
              <h2 className="refrigerator-page__section-title">냉장고</h2>

              {!hasCategories || refrigeratedCategories.length === 0 ? (
                <p className="refrigerator-page__empty">현재 냉장고가 비어있어요!</p>
              ) : (
                <div className="refrigerator-page__content">
                  {refrigeratedCategories.map((cat) => (
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
                      suggestions={suggestionNames}
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
      <span
        className="refrigerator-page__category-color"
        style={{ backgroundColor: normalizeCategoryColor(cat.color) }}
      />
      <h3 className="refrigerator-page__category-title">{cat.label}</h3>
      <Pill
        color={normalizeCategoryColor(cat.color)}
        asButton
        onClick={() => setActiveCategoryId(cat.id)}
        className="refrigerator-page__category-add"
      >
        +
      </Pill>
    </div>

    <div className="refrigerator-page__ingredients">
      {ingredients.map((ing) => (
        <div key={ing.id} className="refrigerator-page__ingredient">
          <Pill color={normalizeCategoryColor(ing.color)}>{ing.label}</Pill>
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