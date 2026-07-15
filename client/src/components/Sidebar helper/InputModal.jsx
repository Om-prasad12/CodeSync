import React, { useState } from 'react';

/**
 * Generic text-input popup used for any action needing a single value
 * (new file/folder name, rename, collaborator email, etc.)
 * Enter confirms, Escape or backdrop click cancels.
 */
const InputModal = ({
  title,
  label,
  placeholder,
  initialValue = '',
  confirmLabel = 'Save',
  onConfirm,
  onCancel
}) => {
  const [value, setValue] = useState(initialValue);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-xl"
      >
        <h3 className="text-sm font-medium text-gray-200 mb-3">{title}</h3>

        {label && (
          <label className="block text-xs text-gray-400 mb-1">{label}</label>
        )}
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') onCancel();
          }}
          className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!value.trim()}
            onClick={handleConfirm}
            className="px-3 py-1.5 rounded-md text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;