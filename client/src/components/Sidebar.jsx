import React from 'react';
import { MdClose, MdInsertDriveFile } from 'react-icons/md';
import { VscFiles } from 'react-icons/vsc';
import { FileExplorerProvider } from './Sidebar helper/FileExplorerContext';
import { useProjectExplorer } from './Sidebar helper/useProjectExplorer';
import ProjectItem from './Sidebar helper/ProjectItem';

const Sidebar = ({ expanded, setExpanded, isLoggedIn }) => {
  const { project, selectedProject, fileItems, filesLoading, handleProjectClick } =
    useProjectExplorer(isLoggedIn);

  return (
    <FileExplorerProvider expanded={expanded}>
      <aside
        className={`
          min-h-screen transition-all duration-300 bg-gray-900 border-r border-gray-700
          ${expanded ? 'w-64' : 'w-16'}
        `}
      >
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
                  <div className="absolute left-full rounded-md px-2 py-1 ml-6 z-50 bg-gray-800 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
                    Explorer
                  </div>
                </>
              ) : (
                <>
                  <VscFiles className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  <span className="ml-2 text-white font-medium text-sm">Explorer</span>
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

          {/* Projects */}
          <div className="flex-1 overflow-y-auto py-2">
            {isLoggedIn && project.length > 0 && (
              <>
                {expanded && (
                  <div className="px-3 py-1 mb-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">projects</span>
                  </div>
                )}
                <div className={expanded ? 'space-y-1 mb-3' : 'space-y-2 pt-1 mb-3'}>
                  {project.map((p) => {
                    const id = p._id || p.id;
                    const isOpen = selectedProject === id;
                    return (
                      <ProjectItem
                        key={id}
                        id={id}
                        name={p.name}
                        isOpen={isOpen}
                        fileItems={isOpen ? fileItems : null}
                        filesLoading={isOpen && filesLoading}
                        onClick={() => handleProjectClick(id)}
                      />
                    );
                  })}
                </div>
              </>
            )}
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
    </FileExplorerProvider>
  );
};

export default Sidebar;