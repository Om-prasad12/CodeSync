import React from 'react';

/**
 * items: [{ label, icon, action, danger }]
 * Rendered by whichever row (file/folder/project) currently has its menu open.
 */
const ActionMenu = ({ items }) => (
  <div className="absolute right-2 top-8 z-50 w-44 rounded-md border border-gray-700 bg-gray-900 shadow-lg overflow-hidden">
    {items.map(({ label, icon, action, danger }) => (
      <button
        key={label}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          action();
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-800 ${
          danger ? 'text-red-400' : 'text-gray-200'
        }`}
      >
        {icon}
        {label}
      </button>
    ))}
  </div>
);

export default ActionMenu;