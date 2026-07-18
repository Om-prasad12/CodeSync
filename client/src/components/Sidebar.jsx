import React, { useState } from "react";
import { MdClose, MdAdd } from "react-icons/md";
import ProjectItem from "./Sidebar helper/Projectitem";
import InputModal from "./Sidebar helper/InputModal";

const Sidebar = ({
  expanded,
  setExpanded,
  isLoggedIn,
  project,
  selectedProject,
  fileItems,
  filesLoading,
  handleProjectClick,
  renameProject,
  deleteProject,
  addCollaborator,
  removeCollaborator,
  createFile,
  createFolder,
  renameFile,
  deleteFile,
  createProject,
}) => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  return (
    <aside
      className={`
        min-h-screen transition-all duration-300 bg-gray-900 border-r border-gray-700
        ${expanded ? "w-64" : "w-16"}
      `}
    >
      <nav className="h-full flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-700">
          {expanded ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNewProjectModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 transition-colors"
              >
                <MdAdd className="w-4 h-4" />
                New Project
              </button>
              <button
                onClick={() => setExpanded(false)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <MdClose className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setExpanded(true)}
              className="relative flex items-center justify-center w-full cursor-pointer hover:bg-gray-800 rounded-md p-2 transition-colors group"
            >
              <MdAdd className="w-5 h-5 text-gray-300 flex-shrink-0" />
              <div className="absolute left-full rounded-md px-2 py-1 ml-6 z-50 bg-gray-800 text-white text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
                New Project
              </div>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="flex-1 overflow-y-auto py-2">
          {isLoggedIn && project.length > 0 && (
            <>
              {expanded && (
                <div className="px-3 py-1 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    projects
                  </span>
                </div>
              )}
              <div
                className={expanded ? "space-y-1 mb-3" : "space-y-2 pt-1 mb-3"}
              >
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
                      renameProject={renameProject}
                      deleteProject={deleteProject}
                      addCollaborator={addCollaborator}
                      removeCollaborator={removeCollaborator}
                      createFile={createFile}
                      createFolder={createFolder}
                      renameFile={renameFile}
                      deleteFile={deleteFile}
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

      {showNewProjectModal && (
        <InputModal
          title="New Project"
          label="Project name"
          placeholder="e.g. my-awesome-app"
          confirmLabel="Create"
          onConfirm={(val) => {
            createProject(val);
            setShowNewProjectModal(false);
          }}
          onCancel={() => setShowNewProjectModal(false)}
        />
      )}
    </aside>
  );
};

export default Sidebar;