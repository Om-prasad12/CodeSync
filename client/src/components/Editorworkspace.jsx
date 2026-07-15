import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { useFileExplorer } from './Sidebar helper/FileExplorerContext';

const MIN_LEFT_PERCENT = 25;
const MAX_LEFT_PERCENT = 80;
const MIN_VERTICAL_PERCENT = 15;
const MAX_VERTICAL_PERCENT = 85;

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
          {selectedFile && (
            <button
              type="button"
              onClick={requestCloseFile}
              className="p-1 rounded-md hover:bg-gray-700 transition-colors flex-shrink-0 ml-2"
              aria-label="Close file"
            >
              <MdClose className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-gray-950 text-gray-200 p-3 text-sm">
          {selectedFile ? (
            fileContentLoading ? (
              <span className="text-gray-500">Loading file...</span>
            ) : (
              <textarea
                key={selectedFile._id}
                value={selectedFileContent ?? ''}
                onChange={(e) => updateDraftContent(e.target.value)}
                spellCheck={false}
                className="block w-full h-full bg-transparent outline-none resize-none text-gray-200 font-mono"
              />
            )
          ) : (
            <textarea
              key="empty-editor"
              value=""
              readOnly
              rows={1}
              spellCheck={false}
              className="block w-full h-full bg-transparent outline-none resize-none text-gray-200 placeholder-gray-600 font-mono"
              placeholder="// Start typing your code here..."
            />
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