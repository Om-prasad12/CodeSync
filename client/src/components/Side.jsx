import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MdClose,
  MdMoreVert,
  MdOpenInNew,
  MdEdit,
  MdDelete,
  MdDataObject,
  MdInsertDriveFile,
  MdFolder,
  MdKeyboardArrowRight,
  MdNoteAdd,
  MdCreateNewFolder,
  MdPersonAdd,
  MdPersonRemove
} from 'react-icons/md';
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiCplusplus,
  SiRust,
  SiMarkdown,
  SiGo,
  SiGit
} from 'react-icons/si';
import { FaJava, FaReact } from 'react-icons/fa';
import { VscFiles, VscRepo } from 'react-icons/vsc';

const Sidebar = ({ expanded, setExpanded, isLoggedIn }) => {
  const [openMenuFor, setOpenMenuFor] = useState(null); // shared across file/folder/project rows — ids are unique per doc
  const [project, setProject] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // currently expanded project id
  const [fileItems, setFileItems] = useState(null); // flat file/folder list for the currently expanded project — null until fetched
  const [filesCache, setFilesCache] = useState({}); // { [projectId]: files[] } — keeps files in memory once fetched
  const [selectedFile, setSelectedFile] = useState(null); // for future use (opening a file)
  const [filesLoading, setFilesLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/project`,
          { withCredentials: true }
        );
        setProject(res.data?.projects || res.data || []);
      } catch (err) {
        console.log('Failed to fetch projects:', err);
      }
    };

    if (isLoggedIn) {
      fetchProjects();
    }
  }, [isLoggedIn]);

  // Close whichever 3-dot menu is open on any click outside that menu/its trigger
  useEffect(() => {
    if (!openMenuFor) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-menu-anchor]')) {
        setOpenMenuFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuFor]);

  const fetchProjectFiles = async (projectId) => {
    // Already fetched this project's files this session -> reuse, don't hit the network again
    if (filesCache[projectId]) {
      setFileItems(filesCache[projectId]);
      return;
    }

    setFilesLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/file/project/${projectId}`,
        { withCredentials: true }
      );
      const fetched = res.data?.files || res.data || [];
      setFileItems(fetched);
      setFilesCache((prev) => ({ ...prev, [projectId]: fetched }));
    } catch (err) {
      console.log('Failed to fetch project files:', err);
      setFileItems([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    if (selectedProject === projectId) {
      // clicked the already-expanded project -> collapse it
      setSelectedProject(null);
      setFileItems(null);
      return;
    }
    // collapse whatever was open, expand the new one
    setSelectedProject(projectId);
    setSelectedFile(null);
    fetchProjectFiles(projectId);
  };

  const toggleMenu = (id) => {
    setOpenMenuFor((prev) => (prev === id ? null : id));
  };

  const handleFileAction = (action, fileName) => {
    console.log(`${action} clicked for file ${fileName}`);
    setOpenMenuFor(null);
  };

  const handleFolderAction = (action, folderId, folderName) => {
    console.log(`${action} clicked for folder ${folderName} (${folderId})`);
    setOpenMenuFor(null);
  };

  const handleProjectAction = (action, projectId, projectName) => {
    console.log(`${action} clicked for project ${projectName} (${projectId})`);
    setOpenMenuFor(null);
  };

  // Build a nested tree from the flat [{ _id, parentId, type, name, ... }] list
  // your API returns. parentId === null (or undefined) means root-level.
  const buildTree = (items, parentId = null) =>
    items
      .filter((item) => (item.parentId || null) === parentId)
      .map((item) => ({
        ...item,
        children: item.type === 'folder' ? buildTree(items, item._id) : []
      }));

  // Real brand icon + color per language/file type. isFolder lets the same
  // helper handle folder entries in the tree too.
  const getFileIcon = (fileName = '', isFolder = false) => {
    if (isFolder) {
      return <MdFolder className="w-4 h-4 text-amber-400" />;
    }
    if (fileName.endsWith('.js')) {
      return <SiJavascript className="w-4 h-4 text-yellow-400" />;
    } else if (fileName.endsWith('.jsx')) {
      return <FaReact className="w-4 h-4 text-sky-400" />;
    } else if (fileName.endsWith('.ts')) {
      return <SiTypescript className="w-4 h-4 text-blue-400" />;
    } else if (fileName.endsWith('.tsx')) {
      return <FaReact className="w-4 h-4 text-blue-300" />;
    } else if (fileName.endsWith('.py')) {
      return <SiPython className="w-4 h-4 text-emerald-400" />;
    } else if (fileName.endsWith('.cpp') || fileName.endsWith('.cc') || fileName.endsWith('.h')) {
      return <SiCplusplus className="w-4 h-4 text-pink-400" />;
    } else if (fileName.endsWith('.java')) {
      return <FaJava className="w-4 h-4 text-orange-400" />;
    } else if (fileName.endsWith('.go')) {
      return <SiGo className="w-4 h-4 text-cyan-400" />;
    } else if (fileName.endsWith('.rs')) {
      return <SiRust className="w-4 h-4 text-amber-500" />;
    } else if (fileName.endsWith('.md')) {
      return <SiMarkdown className="w-4 h-4 text-blue-300" />;
    } else if (fileName.endsWith('.json')) {
      return <MdDataObject className="w-4 h-4 text-gray-400" />;
    } else if (fileName === '.gitignore') {
      return <SiGit className="w-4 h-4 text-orange-500" />;
    }
    return <MdInsertDriveFile className="w-4 h-4 text-gray-300" />;
  };

  // Generic dropdown menu — used by file, folder, and project rows.
  // items: [{ label, icon, action, danger }]
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

  // A single file row (leaf node) — icon + name + 3-dot menu
  const FileRow = ({ node, depth }) => {
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

  // A folder row — manages its own open/closed state, closed by default.
  // Arrow rotates right -> down on open, and back on close, same as project rows.
  const FolderRow = ({ node, depth }) => {
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

  // Recursively renders a list of tree nodes (files and folders mixed)
  const FileTree = ({ nodes, depth }) => (
    <div className={expanded ? 'space-y-0.5' : 'space-y-2 pt-1'}>
      {nodes.map((node) =>
        node.type === 'folder' ? (
          <FolderRow key={node._id} node={node} depth={depth} />
        ) : (
          <FileRow key={node._id} node={node} depth={depth} />
        )
      )}
    </div>
  );

  const ProjectItem = ({ id, name }) => {
    const isOpen = selectedProject === id;
    const tree = fileItems ? buildTree(fileItems) : [];

    if (!expanded) {
      return (
        <div
          onClick={() => handleProjectClick(id)}
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
          onClick={() => handleProjectClick(id)}
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
            {filesLoading && (
              <div className="px-3 py-1 text-xs text-gray-500">Loading files...</div>
            )}
            {!filesLoading && tree.length === 0 && (
              <div className="px-3 py-1 text-xs text-gray-500">No files</div>
            )}
            {!filesLoading && tree.length > 0 && <FileTree nodes={tree} depth={0} />}
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
                <VscFiles className="w-5 h-5 text-gray-300 flex-shrink-0" />
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

        <div className="flex-1 overflow-y-auto py-2">
          {/* Projects — only fetched/shown when logged in. Each project's nested tree renders below it. */}
          {isLoggedIn && project.length > 0 && (
            <>
              {expanded && (
                <div className="px-3 py-1 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">projects</span>
                </div>
              )}
              <div className={expanded ? "space-y-1 mb-3" : "space-y-2 pt-1 mb-3"}>
                {project.map((p) => (
                  <ProjectItem key={p._id || p.id} id={p._id || p.id} name={p.name} />
                ))}
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
  );
};

export default Sidebar;