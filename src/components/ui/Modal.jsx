import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, description, confirmLabel, cancelLabel, onConfirm, onCancel, variant = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="modal__title">{title}</h2>}
        {description && <p className="modal__description">{description}</p>}
        <div className="modal__actions">
          {cancelLabel && (
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onCancel ?? onClose}>
              {cancelLabel}
            </button>
          )}
          {confirmLabel && (
            <button type="button" className={`modal__btn modal__btn--confirm modal__btn--${variant}`} onClick={onConfirm}>
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
