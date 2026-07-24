import React from 'react';
import '../styles/medical.css'; // puedes poner los estilos directamente en medical.css

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Aceptar', cancelText = 'Cancelar' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>{cancelText}</button>
          <button className="btn-outline" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;