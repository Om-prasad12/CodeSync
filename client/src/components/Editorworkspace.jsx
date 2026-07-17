import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { useFileExplorer } from './Sidebar helper/FileExplorerContext';
import { getMonacoLanguage } from './Sidebar helper/Getfileicon';
import Editor, { loader } from '@monaco-editor/react';

// Registered once, globally, before any <Editor> mounts.
loader.init().then((monaco) => {
  monaco.editor.defineTheme('codesync-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#030712',
      'editor.lineHighlightBackground': '#111827',
      'editorGutter.background': '#030712',
      'minimap.background': '#030712',
      'editorCursor.foreground': '#60a5fa',       // custom cursor color (blue-400)
      'editorCursor.background': '#030712',
    },
  });
});

const MIN_LEFT_PERCENT = 25;
const MAX_LEFT_PERCENT = 80;
const MIN_VERTICAL_PERCENT = 15;
const MAX_VERTICAL_PERCENT = 85;

// Deterministic gradient per username — same person always gets the same
// color within a session, mirroring Navbar's getAvatarGradient approach.
const VIEWER_GRADIENTS = [
  'from-blue-500 to-blue-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-pink-500 to-rose-400',
  'from-amber-500 to-orange-400',
  'from-cyan-500 to-sky-400',
];

const getViewerGradient = (name) => {
  if (!name) return VIEWER_GRADIENTS[0];
  const charSum = name.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return VIEWER_GRADIENTS[charSum % VIEWER_GRADIENTS.length];
};

// One avatar bubble with a custom floating tooltip on hover (matches the
// hover-label pattern already used in the collapsed sidebar's FileRow/etc.)
const ViewerAvatar = ({ username }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`w-6 h-6 rounded-full bg-gradient-to-tr ${getViewerGradient(username)} flex items-center justify-center text-[10px] font-semibold text-white ring-2 ring-gray-900 shadow-md cursor-default transition-transform hover:scale-110 hover:z-10 relative`}
      >
        {username?.[0]?.toUpperCase() || '?'}
        {/* Live indicator dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-gray-900 animate-pulse" />
      </div>

      {/* Custom floating tooltip */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow-lg transition-all pointer-events-none
          ${hovered ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible'}`}
      >
        {username}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
      </div>
    </div>
  );
};

const EditorWorkspace = ({
  inputContent,
  outputContent,
  saveFileContent,
}) => {
  const {
    selectedFile,
    selectedFileContent,
    updateDraftContent,
    isDirty,
    markSaved,
    fileContentLoading,
    selectFile,
    closeFile,
    requestCloseFile,
    pendingAction,
    cancelPendingAction,
    fileViewers, // others currently viewing this same file, via socket presence
  } = useFileExplorer();

  const containerRef = useRef(null);
  const rightColRef = useRef(null);

  const [leftWidth, setLeftWidth] = useState(60);
  const [inputHeight, setInputHeight] = useState(50);
  const [saving, setSaving] = useState(false);

  const draggingRef = useRef(null);

  const handleVerticalDown = () => {
    draggingRef.current = 'vertical';
  };

  const handleHorizontalDown = () => {
    draggingRef.current = 'horizontal';
  };

  const handleMouseMove = useCallback((e) => {
    if (draggingRef.current === 'vertical' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let percent = ((e.clientX - rect.left) / rect.width) * 100;
      percent = Math.min(MAX_LEFT_PERCENT, Math.max(MIN_LEFT_PERCENT, percent));
      setLeftWidth(percent);
    } else if (draggingRef.current === 'horizontal' && rightColRef.current) {
      const rect = rightColRef.current.getBoundingClientRect();
      let percent = ((e.clientY - rect.top) / rect.height) * 100;
      percent = Math.min(MAX_VERTICAL_PERCENT, Math.max(MIN_VERTICAL_PERCENT, percent));
      setInputHeight(percent);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Saves whatever is currently open — used by Ctrl+S and by the unsaved-changes popup.
  const handleSave = useCallback(async () => {
    if (!selectedFile || saving) return;
    setSaving(true);
    try {
      await saveFileContent(selectedFile._id, selectedFileContent);
      markSaved(selectedFileContent);
    } catch (err) {
      console.log('Failed to save file:', err);
    } finally {
      setSaving(false);
    }
  }, [selectedFile, selectedFileContent, saving, saveFileContent, markSaved]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Resolves whatever pendingAction is waiting (a blocked close or a blocked file switch).
  const resolvePendingAction = async (shouldSave) => {
    if (shouldSave) {
      await handleSave();
    }

    if (pendingAction?.type === 'close') {
      closeFile();
    } else if (pendingAction?.type === 'switch') {
      selectFile(pendingAction.file, pendingAction.content);
    }

    cancelPendingAction();
  };

  return (
    <div
      ref={containerRef}
      className="flex w-full h-full bg-gray-950 select-none relative"
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #374151;
          border-radius: 9999px;
          border: none;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #4b5563;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #374151 transparent;
        }
      `}</style>

      {/* Left: Code editor */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="flex flex-col min-w-0 border-r border-gray-700"
      >
        <div className="h-9 flex items-center justify-between px-3 bg-gray-900 border-b border-gray-700 text-xs text-gray-400 font-medium">
          <span className="truncate flex items-center gap-1.5">
            {selectedFile ? selectedFile.name : 'Code Editor'}
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />
            )}
            {saving && <span className="text-gray-500 text-[11px]">Saving...</span>}
          </span>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Viewer presence avatars — only rendered when someone else has this file open */}
            {selectedFile && fileViewers && fileViewers.length > 0 && (
              <div className="flex items-center -space-x-2">
                {fileViewers.slice(0, 3).map((viewer) => (
                  <ViewerAvatar key={viewer.userId} username={viewer.username} />
                ))}
                {fileViewers.length > 3 && (
                  <div className="relative group">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-semibold text-gray-300 ring-2 ring-gray-900 shadow-md cursor-default">
                      +{fileViewers.length - 3}
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {fileViewers.slice(3).map((v) => v.username).join(', ')}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedFile && (
              <button
                type="button"
                onClick={requestCloseFile}
                className="p-1 rounded-md hover:bg-gray-700 transition-colors flex-shrink-0"
                aria-label="Close file"
              >
                <MdClose className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0 bg-gray-950">
          {selectedFile ? (
            fileContentLoading ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                Loading file...
              </div>
            ) : (
              <Editor
                path={selectedFile._id}
                height="100%"
                language={getMonacoLanguage(selectedFile.name)}
                theme="codesync-dark"
                value={selectedFileContent ?? ''}
                onChange={(value) => updateDraftContent(value ?? '')}
                options={{
                  automaticLayout: true,
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12},
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  cursorStyle: 'line',
                  cursorBlinking: 'smooth',
                  cursorWidth: 2,
                }}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-600 font-mono">
              // Select a file to start editing
            </div>
          )}
        </div>
      </div>

      {/* Vertical divider */}
      <div
        onMouseDown={handleVerticalDown}
        className="w-1 cursor-col-resize bg-gray-800 hover:bg-blue-500 transition-colors flex-shrink-0"
      />

      {/* Right: Input (top) + Output (bottom) */}
      <div
        ref={rightColRef}
        style={{ width: `${100 - leftWidth}%` }}
        className="flex flex-col min-w-0"
      >
        <div
          style={{ height: `${inputHeight}%` }}
          className="flex flex-col min-h-0"
        >
          <div className="h-9 flex items-center px-3 bg-gray-900 border-b border-gray-700 text-xs text-gray-400 font-medium flex-shrink-0">
            Input
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-gray-950 text-gray-200 p-3 text-sm">
            {inputContent ?? (
              <textarea
                rows={1}
                className="block w-full h-full bg-transparent outline-none resize-none text-gray-200 placeholder-gray-600"
                placeholder="Enter program input here..."
              />
            )}
          </div>
        </div>

        <div
          onMouseDown={handleHorizontalDown}
          className="h-1 cursor-row-resize bg-gray-800 hover:bg-blue-500 transition-colors flex-shrink-0"
        />

        <div
          style={{ height: `${100 - inputHeight}%` }}
          className="flex flex-col min-h-0 border-t border-gray-700"
        >
          <div className="h-9 flex items-center px-3 bg-gray-900 border-b border-gray-700 text-xs text-gray-400 font-medium flex-shrink-0">
            Output
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-gray-950 text-gray-200 p-3 text-sm font-mono">
            {outputContent ?? (
              <span className="text-gray-500">// Program output will appear here</span>
            )}
          </div>
        </div>
      </div>

      {/* Unsaved changes confirm popup — handles both "close file" and "switch file" cases */}
      {pendingAction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={cancelPendingAction}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-80 rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-xl"
          >
            <h3 className="text-sm font-medium text-gray-200 mb-1">Unsaved changes</h3>
            <p className="text-xs text-gray-400 mb-4">
              {selectedFile?.name} has unsaved changes.{' '}
              {pendingAction.type === 'switch'
                ? `Save before opening ${pendingAction.file?.name}?`
                : 'Save before closing?'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelPendingAction}
                className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => resolvePendingAction(false)}
                className="px-3 py-1.5 rounded-md text-sm text-red-400 hover:bg-gray-800 transition-colors"
              >
                Don't Save
              </button>
              <button
                type="button"
                onClick={() => resolvePendingAction(true)}
                className="px-3 py-1.5 rounded-md text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorWorkspace;