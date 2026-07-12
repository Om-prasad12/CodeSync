import React, { createContext, useContext, useState, useEffect } from 'react';

const FileExplorerContext = createContext(null);

export const useFileExplorer = () => {
  const ctx = useContext(FileExplorerContext);
  if (!ctx) {
    throw new Error('useFileExplorer must be used inside <FileExplorerProvider>');
  }
  return ctx;
};

/**
 * Holds everything shared across file/folder/project rows:
 * - expanded (sidebar collapsed vs full width)
 * - openMenuFor / toggleMenu (which 3-dot menu is open, closes on outside click)
 * - selectedFile (for future "open file in editor" work)
 * - the three action handlers (file / folder / project) — currently just log,
 *   swap the console.log lines for real API calls when ready.
 */
export const FileExplorerProvider = ({ expanded, children }) => {
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuFor((prev) => (prev === id ? null : id));
  };

  // Close whichever 3-dot menu is open on any click outside its anchor
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

  const value = {
    expanded,
    openMenuFor,
    toggleMenu,
    selectedFile,
    setSelectedFile,
    handleFileAction,
    handleFolderAction,
    handleProjectAction
  };

  return (
    <FileExplorerContext.Provider value={value}>
      {children}
    </FileExplorerContext.Provider>
  );
};