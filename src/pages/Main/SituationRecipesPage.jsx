import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import PageHeader from '../../components/common/PageHeader';
import RecipeCard from '../../components/card/RecipeCard';
import { getSituationCategoryById } from '../../constants/categories';
import { getTaggedRecipes } from '../../api/recipeApi';
import './SituationRecipesPage.css';

const SituationRecipesPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const meta = getSituationCategoryById(categoryId);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meta) {
      setLoading(false);
      setRecipes([]);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const list = await getTaggedRecipes(meta.apiCategory, {
          size: 20,
          sort: 'LATEST',
        });
        if (!cancelled) {
          setRecipes(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error('상황별 레시피 조회 실패:', e);
        if (!cancelled) setRecipes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [meta]);

  if (!meta) {
    return (
      <div className="situation-recipes-page">
        <PageHeader
          title="목록"
          onBack={() => navigate(-1)}
          onHome={() => navigate('/main')}
        />
        <main className="situation-recipes-page__main">
          <p className="situation-recipes-page__hint">잘못된 카테고리입니다.</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="situation-recipes-page">
      <PageHeader
        title={meta.label}
        onBack={() => navigate(-1)}
        onHome={() => navigate('/main')}
      />
      <main className="situation-recipes-page__main">
        {loading ? (
          <p className="situation-recipes-page__hint">불러오는 중…</p>
        ) : (
          <div className="situation-recipes-page__list">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.recipeId} recipe={recipe} />
            ))}
            {recipes.length === 0 && (
              <p className="situation-recipes-page__hint">레시피가 없어요.</p>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default SituationRecipesPage;
