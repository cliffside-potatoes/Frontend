import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, onBack, onHome }) => {
  return (
    <header className="page-header">
      <button type="button" className="page-header__back" onClick={onBack} aria-label="뒤로가기">
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <div className="page-header__title-wrap">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      <button type="button" className="page-header__home" onClick={onHome} aria-label="홈">
        <span className="material-symbols-outlined">home</span>
      </button>
    </header>
  );
};

export default PageHeader;
