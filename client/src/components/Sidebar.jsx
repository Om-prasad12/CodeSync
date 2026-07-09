import React, { useState } from 'react';
import {
  MdInsertDriveFile,
  MdDescription,
  MdClose,
  MdMoreVert,
  MdOpenInNew,
  MdEdit,
  MdDelete,
  MdDataObject,
  MdCode
} from 'react-icons/md';
import { VscFiles } from 'react-icons/vsc';

const Sidebar = ({ expanded, setExpanded }) => {
  const [openMenuFor, setOpenMenuFor] = useState(null);

  const fileItems = [
    { name: 'index.js' },
    { name: 'App.jsx' },
    { name: 'main.py' },
    { name: 'server.cpp' },
    { name: 'README.md' },
    { name: 'package.json' },
    { name: '.gitignore' },
  ];

  const toggleFileMenu = (fileName) => {
    setOpenMenuFor((prev) => (prev === fileName ? null : fileName));
  };

  const handleFileAction = (action, fileName) => {
    console.log(`${action} clicked for ${fileName}`);
    setOpenMenuFor(null);
  };

  // Icon + color per language/file type
  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.js')) {
      return <MdInsertDriveFile className="w-4 h-4 text-yellow-400" />;
    } else if (fileName.endsWith('.jsx')) {
      return <MdCode className="w-4 h-4 text-sky-400" />;
    } else if (fileName.endsWith('.ts')) {
      return <MdCode className="w-4 h-4 text-blue-400" />;
    } else if (fileName.endsWith('.tsx')) {
      return <MdCode className="w-4 h-4 text-blue-300" />;
    } else if (fileName.endsWith('.py')) {
      return <MdInsertDriveFile className="w-4 h-4 text-emerald-400" />;
    } else if (fileName.endsWith('.cpp') || fileName.endsWith('.cc') || fileName.endsWith('.h')) {
      return <MdInsertDriveFile className="w-4 h-4 text-pink-400" />;
    } else if (fileName.endsWith('.java')) {
      return <MdInsertDriveFile className="w-4 h-4 text-orange-400" />;
    } else if (fileName.endsWith('.go')) {
      return <MdInsertDriveFile className="w-4 h-4 text-cyan-400" />;
    } else if (fileName.endsWith('.rs')) {
      return <MdInsertDriveFile className="w-4 h-4 text-amber-500" />;
    } else if (fileName.endsWith('.md')) {
      return <MdDescription className="w-4 h-4 text-blue-400" />;
    } else if (fileName.endsWith('.json')) {
      return <MdDataObject className="w-4 h-4 text-gray-400" />;
    } else if (fileName === '.gitignore') {
      return <MdInsertDriveFile className="w-4 h-4 text-gray-400" />;
    }
    return <MdInsertDriveFile className="w-4 h-4 text-gray-300" />;
  };

  const FileItem = ({ name, isActive = false }) => {
    // Collapsed rail: icon only, with hover tooltip showing the name
    if (!expanded) {
      return (
        <div
          className={`
            relative flex items-center justify-center py-2.5 px-3 cursor-pointer
            hover:bg-gray-800 transition-colors group rounded-md mx-1
            ${isActive ? 'bg-gradient-to-tr from-blue-600 to-blue-500' : ''}
          `}
        >
          {getFileIcon(name)}
          <div className="absolute left-full rounded-md px-2 py-1 ml-6 z-50 bg-gray-800 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
            {name}
          </div>
        </div>
      );
    }

    // Expanded row: icon + name + 3-dot menu
    return (
      <div
        className={`
          relative flex items-center justify-between py-2 px-3 hover:bg-gray-800 cursor-pointer text-sm
          transition-colors group rounded-md mx-1
          ${isActive ? 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white' : 'text-gray-300'}
        `}
      >
        <div className="flex items-center min-w-0 flex-1 pr-2">
          {getFileIcon(name)}
          <span className="ml-2 truncate">{name}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFileMenu(name);
          }}
          className="p-1 rounded-md hover:bg-gray-700 transition-colors flex-shrink-0"
          aria-label={`File actions for ${name}`}
        >
          <MdMoreVert className="w-5 h-5 text-gray-400" />
        </button>

        {openMenuFor === name && (
          <div className="absolute right-2 top-10 z-50 w-36 rounded-md border border-gray-700 bg-gray-900 shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileAction('open', name);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
            >
              <MdOpenInNew className="w-4 h-4" />
              Open
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileAction('rename', name);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
            >
              <MdEdit className="w-4 h-4" />
              Rename
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileAction('delete', name);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
            >
              <MdDelete className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`
      min-h-screen transition-all duration-300 bg-gray-900 border-r border-gray-700
      ${expanded ? "w-64" : "w-16"}
    `}>
      <nav className="h-full flex flex-col">
        {/* Header */}
        <div className="p-3 flex justify-between items-center border-b border-gray-700">
          <div
            className={`flex items-center relative group ${!expanded ? 'justify-center w-full cursor-pointer hover:bg-gray-800 rounded-md p-2 transition-colors' : ''}`}
            onClick={!expanded ? () => setExpanded(true) : undefined}
          >
            {!expanded ? (
              <>
                <MdInsertDriveFile className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <div className={`
                  absolute left-full rounded-md px-2 py-1 ml-6 z-50
                  bg-gray-800 text-white text-sm
                  invisible opacity-0 -translate-x-3 transition-all
                  group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                  whitespace-nowrap
                `}>
                  Explorer
                </div>
              </>
            ) : (
              <>
                <VscFiles className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <span className="ml-2 text-white font-medium text-sm">
                  Explorer
                </span>
              </>
            )}
          </div>
          {expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              <MdClose className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* File list — same array drives both collapsed (icons only) and expanded (full rows) */}
        <div className="flex-1 overflow-y-auto py-2">
          {expanded && (
            <div className="px-3 py-1 mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">wispy</span>
            </div>
          )}

          <div className={expanded ? "space-y-1" : "space-y-2 pt-1"}>
            {fileItems.map((file) => (
              <FileItem
                key={file.name}
                name={file.name}
                isActive={file.isActive}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        {expanded && (
          <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
            <div className="flex justify-between items-center space-x-2">
              <span>LF</span>
              <span>Line 5:36</span>
              <span>UTF8</span>
              <span>2 spaces</span>
              <span>main</span>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;