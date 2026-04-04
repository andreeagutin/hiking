import { useEffect } from 'react';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-form-delete" onClick={onConfirm}>Șterge</button>
          <button className="btn btn-form-cancel" onClick={onCancel}>Anulează</button>
        </div>
      </div>
    </div>
  );
}
