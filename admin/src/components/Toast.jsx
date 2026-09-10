import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        <span>{type === 'error' ? '⚠️' : '✨'}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
