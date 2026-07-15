import React, { createContext, useContext, useState, useEffect } from 'react';

const FileExplorerContext = createContext(null);

export const useFileExplorer = () => {
  const ctx = useContext(FileExplorerContext);
  if (!ctx) {
    throw new Error('useFileExplorer must be used inside <FileExplorerProvider>');
  }
  return ctx;
};

export const FileExplorerProvider = ({ expanded, children }) => {
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileContent, setSelectedFileContent] = useState(null); // live editor buffer
  const [savedContent, setSavedContent] = useState(null); // last-saved baseline
  const [fileContentLoading, setFileContentLoading] = useState(false);

  // { type: 'switch', file, content } | { type: 'close' } | null
  // Set whenever the user tries to switch/close while the open file is dirty.
  const [pendingAction, setPendingAction] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuFor((prev) => (prev === id ? null : id));
  };

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

  const isDirty = !!selectedFile && selectedFileContent !== savedContent;

  // Actually performs the switch — no dirty-check, callers decide when it's safe to call this.
  const selectFile = async (file, contentOrFetcher) => {
    const id = file._id || file.id;
    const alreadySelected = selectedFile && (selectedFile._id || selectedFile.id) === id;

    setSelectedFile(file);

    if (alreadySelected && selectedFileContent != null) {
      return;
    }

    if (typeof contentOrFetcher === 'function') {
      setFileContentLoading(true);
      try {
        const content = await contentOrFetcher();
        setSelectedFileContent(content ?? '');
        setSavedContent(content ?? '');
      } catch (err) {
        console.log('Failed to fetch file content:', err);
        setSelectedFileContent('');
        setSavedContent('');
      } finally {
        setFileContentLoading(false);
      }
    } else {
      const value = contentOrFetcher ?? '';
      setSelectedFileContent(value);
      setSavedContent(value);
    }
  };

  // What FileRow/menus should call instead of selectFile directly — guards against
  // silently discarding unsaved changes when switching to a different file.
  const requestSelectFile = (file, content) => {
    const id = file._id || file.id;
    const sameFile = selectedFile && (selectedFile._id || selectedFile.id) === id;

    if (sameFile) {
      selectFile(file, content); // no-op-safe, see selectFile's alreadySelected guard
      return;
    }

    if (isDirty) {
      setPendingAction({ type: 'switch', file, content });
    } else {
      selectFile(file, content);
    }
  };

  const closeFile = () => {
    setSelectedFile(null);
    setSelectedFileContent(null);
    setSavedContent(null);
  };

  const requestCloseFile = () => {
    if (isDirty) {
      setPendingAction({ type: 'close' });
    } else {
      closeFile();
    }
  };

  const cancelPendingAction = () => setPendingAction(null);

  const updateDraftContent = (content) => {
    setSelectedFileContent(content);
  };

  const markSaved = (content) => {
    setSavedContent(content);
  };

  const value = {
    expanded,
    openMenuFor,
    toggleMenu,
    selectedFile,
    setSelectedFile,
    selectedFileContent,
    updateDraftContent,
    savedContent,
    markSaved,
    isDirty,
    fileContentLoading,
    selectFile,
    requestSelectFile,
    closeFile,
    requestCloseFile,
    pendingAction,
    cancelPendingAction,
  };

  return (
    <FileExplorerContext.Provider value={value}>
      {children}
    </FileExplorerContext.Provider>
  );
};