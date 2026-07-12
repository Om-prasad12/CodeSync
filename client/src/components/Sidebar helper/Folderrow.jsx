import React, { useState } from 'react';
import { MdMoreVert, MdEdit, MdDelete, MdKeyboardArrowRight, MdNoteAdd, MdCreateNewFolder } from 'react-icons/md';
import { useFileExplorer } from './FileExplorerContext';
import { getFileIcon } from './Getfileicon';
import ActionMenu from './ActionMenu';
import FileTree from './FileTree';

/**
 * A folder node — closed by default, holds its own open/closed state locally.
 * Arrow rotates right -> down on open (same visual language as project rows),
 * regardless of whether it currently has children.
 */
const FolderRow = ({ node, depth }) => {
  const { expanded, openMenuFor, toggleMenu, handleFolderAction } = useFileExplorer();
  const [isOpen, setIsOpen] = useState(false);
  const indent = expanded ? { paddingLeft: `${depth * 14 + 4}px` } : undefined;

  if (!expanded) {
    return (
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center py-2.5 px-3 cursor-pointer hover:bg-gray-800 transition-colors group rounded-md mx-1"
      >
        {getFileIcon(node.name, true)}
        <div className="absolute left-full rounded-md px-2 py-1 ml-6 z-50 bg-gray-800 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
          {node.name}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        data-menu-anchor
        onClick={() => setIsOpen((prev) => !prev)}
        style={indent}
        className="relative flex items-center justify-between py-1.5 pr-3 hover:bg-gray-800 cursor-pointer text-sm transition-colors group rounded-md mx-1 text-gray-300"
      >
        <div className="flex items-center min-w-0 flex-1">
          <MdKeyboardArrowRight
            className={`w-4 h-4 flex-shrink-0 text-gray-500 transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
          />
          <span className="ml-0.5">{getFileIcon(node.name, true)}</span>
          <span className="ml-2 truncate">{node.name}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu(node._id);
          }}
          className="p-1 rounded-md hover:bg-gray-700 transition-colors flex-shrink-0"
          aria-label={`Folder actions for ${node.name}`}
        >
          <MdMoreVert className="w-5 h-5 text-gray-400" />
        </button>

        {openMenuFor === node._id && (
          <ActionMenu
            items={[
              { label: 'New File', icon: <MdNoteAdd className="w-4 h-4" />, action: () => handleFolderAction('new-file', node._id, node.name) },
              { label: 'New Folder', icon: <MdCreateNewFolder className="w-4 h-4" />, action: () => handleFolderAction('new-folder', node._id, node.name) },
              { label: 'Rename Folder', icon: <MdEdit className="w-4 h-4" />, action: () => handleFolderAction('rename', node._id, node.name) },
              { label: 'Delete Folder', icon: <MdDelete className="w-4 h-4" />, action: () => handleFolderAction('delete', node._id, node.name), danger: true }
            ]}
          />
        )}
      </div>

      {isOpen && (
        <div>
          {node.children.length === 0 ? (
            <div style={expanded ? { paddingLeft: `${(depth + 1) * 14 + 12}px` } : undefined} className="py-1 text-xs text-gray-500">
              Empty
            </div>
          ) : (
            <FileTree nodes={node.children} depth={depth + 1} />
          )}
        </div>
      )}
    </div>
  );
};

export default FolderRow;