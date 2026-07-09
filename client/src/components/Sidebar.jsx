import React, { useState, createContext} from 'react';
import { 
  MdChevronRight, 
  MdExpandMore, 
  MdFolder, 
  MdFolderOpen, 
  MdInsertDriveFile, 
  MdDescription,
  MdMenu,
  MdClose
} from 'react-icons/md';
import { VscFiles } from 'react-icons/vsc';

const SidebarContext = createContext();

const Sidebar = ({ expanded, setExpanded }) => {
  const [expandedFolders, setExpandedFolders] = useState({
    src: true,
    '.github': false,
    'node_modules': false
  });

  const toggleFolder = (folderName) => {
    if (!expanded) return; // Don't toggle folders when collapsed
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.js')) {
      return <MdInsertDriveFile className="w-4 h-4 text-yellow-400" />;
    } else if (fileName.endsWith('.md')) {
      return <MdDescription className="w-4 h-4 text-blue-400" />;
    } else if (fileName === '.gitignore') {
      return <MdInsertDriveFile className="w-4 h-4 text-gray-400" />;
    }
    return <MdInsertDriveFile className="w-4 h-4 text-gray-300" />;
  };

  const FolderItem = ({ name, isExpanded, onToggle, children, level = 0 }) => {
    if (!expanded && level > 0) return null; // Hide nested folders when collapsed
    
    return (
      <div>
        <div 
          className={`
            relative flex items-center py-2 px-3 hover:bg-gray-800 cursor-pointer text-sm
            transition-colors group rounded-md mx-1
          `}
          onClick={onToggle}
        >
          {expanded && (
            <div style={{ paddingLeft: `${level * 16}px` }} className="flex items-center w-full">
              {isExpanded ? (
                <MdExpandMore className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
              ) : (
                <MdChevronRight className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
              )}
              {isExpanded ? (
                <MdFolderOpen className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
              ) : (
                <MdFolder className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
              )}
              <span className="text-gray-300">{name}</span>
            </div>
          )}

          {!expanded && (
            <div className="flex items-center justify-center w-full">
              <MdFolder className="w-5 h-5 text-blue-400" />
            </div>
          )}

          {/* Tooltip when collapsed */}
          {!expanded && (
            <div className={`
              absolute left-full rounded-md px-2 py-1 ml-6 z-50
              bg-gray-800 text-white text-sm
              invisible opacity-0 -translate-x-3 transition-all
              group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
              whitespace-nowrap
            `}>
              {name}
            </div>
          )}
        </div>
        
        {expanded && isExpanded && children && (
          <div className="transition-all duration-200">{children}</div>
        )}
      </div>
    );
  };

  const FileItem = ({ name, level = 0, isActive = false }) => {
    if (!expanded && level > 0) return null; // Hide nested files when collapsed
    
    return (
      <div 
        className={`
          relative flex items-center py-2 px-3 hover:bg-gray-800 cursor-pointer text-sm
          transition-colors group rounded-md mx-1
          ${isActive ? 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white' : 'text-gray-300'}
        `}
      >
        {expanded && (
          <div style={{ paddingLeft: `${8 + level * 16}px` }} className="flex items-center w-full">
            {getFileIcon(name)}
            <span className="ml-2">{name}</span>
          </div>
        )}

        {!expanded && (
          <div className="flex items-center justify-center w-full">
            {getFileIcon(name)}
          </div>
        )}

        {/* Tooltip when collapsed */}
        {!expanded && (
          <div className={`
            absolute left-full rounded-md px-2 py-1 ml-6 z-50
            bg-gray-800 text-white text-sm
            invisible opacity-0 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            whitespace-nowrap
          `}>
            {name}
          </div>
        )}

        {/* Active indicator */}
        {isActive && !expanded && (
          <div className="absolute right-1 w-2 h-2 rounded bg-blue-400" />
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
                {/* Tooltip for file icon */}
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

        {/* Collapsed state - just show main icons */}
        {!expanded && (
          <div className="flex-1 py-4">
            <div className="space-y-2">
              {/* Explorer icon with tooltip */}
              <div
                className="relative flex items-center justify-center py-3 px-3 hover:bg-gray-800 cursor-pointer group rounded-md mx-1"
                onClick={() => setExpanded(true)}
              >
                <VscFiles className="w-5 h-5 text-gray-300" />
                <div className={`
                  absolute left-full rounded-md px-2 py-1 ml-6 z-50
                  bg-gray-800 text-white text-sm
                  invisible opacity-0 -translate-x-3 transition-all
                  group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                  whitespace-nowrap
                `}>
                  Explorer
                </div>
              </div>
              
              {/* Show only root level items */}
              <FolderItem
                name=".github"
                isExpanded={false}
                onToggle={() => setExpanded(true)}
              />
              
              <FolderItem
                name="node_modules"
                isExpanded={false}
                onToggle={() => setExpanded(true)}
              />
              
              <FolderItem
                name="src"
                isExpanded={false}
                onToggle={() => setExpanded(true)}
              />
              
              <FileItem name=".gitignore" />
              <FileItem name="README.md" />
            </div>
          </div>
        )}

        {/* Expanded state - show full tree */}
        {expanded && (
          <SidebarContext.Provider value={{ expanded }}>
            <div className="flex-1 overflow-y-auto py-2">
              {/* Project Root */}
              <div className="px-3 py-1 mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">wispy</span>
              </div>

              {/* Full file tree */}
              <FolderItem
                name=".github"
                isExpanded={expandedFolders['.github']}
                onToggle={() => toggleFolder('.github')}
              />

              <FolderItem
                name="node_modules"
                isExpanded={expandedFolders['node_modules']}
                onToggle={() => toggleFolder('node_modules')}
              />

              <FolderItem
                name="src"
                isExpanded={expandedFolders['src']}
                onToggle={() => toggleFolder('src')}
              >
                <FileItem name="index.js" level={1} isActive={true} />
              </FolderItem>

              <FileItem name=".gitignore" />
              <FileItem name="README.md" />
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
              <div className="flex justify-between items-center space-x-2">
                <span>LF</span>
                <span>Line 5:36</span>
                <span>UTF8</span>
                <span>2 spaces</span>
                <span>main</span>
              </div>
            </div>
          </SidebarContext.Provider>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;