import React from 'react';
import {
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdKeyboardArrowRight,
  MdNoteAdd,
  MdCreateNewFolder,
  MdPersonAdd,
  MdPersonRemove
} from 'react-icons/md';
import { VscRepo } from 'react-icons/vsc';
import { useFileExplorer } from './FileExplorerContext';
import { buildTree } from './Buildtree';
import ActionMenu from './ActionMenu';
import FileTree from './FileTree';

/**
 * One project in the sidebar. Clicking it expands/collapses its file tree
 * (accordion — opening another project closes this one, handled by the parent
 * only tracking a single `selectedProject` id). Its own 3-dot menu covers
 * project-level actions: new file/folder at root, rename/delete project,
 * add/remove collaborator.
 */
const ProjectItem = ({ id, name, isOpen, fileItems, filesLoading, onClick }) => {
  const { expanded, openMenuFor, toggleMenu, handleProjectAction } = useFileExplorer();
  const tree = fileItems ? buildTree(fileItems) : [];

  if (!expanded) {
    return (
      <div
        onClick={onClick}
        className="relative flex items-center justify-center py-2.5 px-3 cursor-pointer hover:bg-gray-800 transition-colors group rounded-md mx-1"
      >
        <VscRepo className={`w-4 h-4 ${isOpen ? 'text-purple-300' : 'text-purple-400'}`} />
        <div className="absolute left-full rounded-md px-2 py-1 ml-6 z-50 bg-gray-800 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
          {name}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        data-menu-anchor
        onClick={onClick}
        className="relative flex items-center justify-between py-2 px-2 hover:bg-gray-800 cursor-pointer text-sm transition-colors group rounded-md mx-1 text-gray-300"
      >
        <div className="flex items-center min-w-0 flex-1">
          <MdKeyboardArrowRight
            className={`w-4 h-4 flex-shrink-0 text-gray-500 transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
          />
          <VscRepo className="w-4 h-4 text-purple-400 flex-shrink-0 ml-0.5" />
          <span className="ml-2 truncate">{name}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu(id);
          }}
          className="p-1 rounded-md hover:bg-gray-700 transition-colors flex-shrink-0"
          aria-label={`Project actions for ${name}`}
        >
          <MdMoreVert className="w-5 h-5 text-gray-400" />
        </button>

        {openMenuFor === id && (
          <ActionMenu
            items={[
              { label: 'New File', icon: <MdNoteAdd className="w-4 h-4" />, action: () => handleProjectAction('new-file', id, name) },
              { label: 'New Folder', icon: <MdCreateNewFolder className="w-4 h-4" />, action: () => handleProjectAction('new-folder', id, name) },
              { label: 'Rename Project', icon: <MdEdit className="w-4 h-4" />, action: () => handleProjectAction('rename', id, name) },
              { label: 'Delete Project', icon: <MdDelete className="w-4 h-4" />, action: () => handleProjectAction('delete', id, name), danger: true },
              { label: 'Add Collaborator', icon: <MdPersonAdd className="w-4 h-4" />, action: () => handleProjectAction('add-collaborator', id, name) },
              { label: 'Remove Collaborator', icon: <MdPersonRemove className="w-4 h-4" />, action: () => handleProjectAction('remove-collaborator', id, name) }
            ]}
          />
        )}
      </div>

      {isOpen && (
        <div className="border-l border-gray-800 ml-4 py-1">
          {filesLoading && <div className="px-3 py-1 text-xs text-gray-500">Loading files...</div>}
          {!filesLoading && tree.length === 0 && (
            <div className="px-3 py-1 text-xs text-gray-500">No files</div>
          )}
          {!filesLoading && tree.length > 0 && <FileTree nodes={tree} depth={0} />}
        </div>
      )}
    </div>
  );
};

export default ProjectItem;