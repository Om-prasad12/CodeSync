import React from 'react';
import { MdMoreVert, MdOpenInNew, MdEdit, MdDelete } from 'react-icons/md';
import { useFileExplorer } from './Fileexplorercontext';
import { getFileIcon } from './Getfileicon';
import ActionMenu from './ActionMenu';

/** A single file leaf in the tree — icon + name + 3-dot menu (Open/Rename/Delete) */
const FileRow = ({ node, depth }) => {
  const { expanded, openMenuFor, toggleMenu, selectedFile, setSelectedFile, handleFileAction } =
    useFileExplorer();

  const isActive = selectedFile === node._id;
  const indent = expanded ? { paddingLeft: `${depth * 14 + 12}px` } : undefined;

  if (!expanded) {
    return (
      <div
        className={`
          relative flex items-center justify-center py-2.5 px-3 cursor-pointer
          hover:bg-gray-800 transition-colors group rounded-md mx-1
          ${isActive ? 'bg-gradient-to-tr from-blue-600 to-blue-500' : ''}
        `}
      >
        {getFileIcon(node.name)}
        <div className="absolute left-full rounded-md px-2 py-1 ml-6 z-50 bg-gray-800 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
          {node.name}
        </div>
      </div>
    );
  }

  return (
    <div
      data-menu-anchor
      onClick={() => setSelectedFile(node._id)}
      style={indent}
      className={`
        relative flex items-center justify-between py-1.5 pr-3 hover:bg-gray-800 cursor-pointer text-sm
        transition-colors group rounded-md mx-1
        ${isActive ? 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white' : 'text-gray-300'}
      `}
    >
      <div className="flex items-center min-w-0 flex-1 pr-2">
        {getFileIcon(node.name)}
        <span className="ml-2 truncate">{node.name}</span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu(node._id);
        }}
        className="p-1 rounded-md hover:bg-gray-700 transition-colors flex-shrink-0"
        aria-label={`File actions for ${node.name}`}
      >
        <MdMoreVert className="w-5 h-5 text-gray-400" />
      </button>

      {openMenuFor === node._id && (
        <ActionMenu
          items={[
            { label: 'Open', icon: <MdOpenInNew className="w-4 h-4" />, action: () => handleFileAction('open', node.name) },
            { label: 'Rename', icon: <MdEdit className="w-4 h-4" />, action: () => handleFileAction('rename', node.name) },
            { label: 'Delete', icon: <MdDelete className="w-4 h-4" />, action: () => handleFileAction('delete', node.name), danger: true }
          ]}
        />
      )}
    </div>
  );
};

export default FileRow;