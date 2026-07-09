import React, { useState, useRef, useCallback, useEffect } from 'react';

const MIN_LEFT_PERCENT = 25;
const MAX_LEFT_PERCENT = 80;
const MIN_VERTICAL_PERCENT = 15;
const MAX_VERTICAL_PERCENT = 85;

const EditorWorkspace = ({
  editorContent,
  inputContent,
  outputContent,
}) => {
  const containerRef = useRef(null);
  const rightColRef = useRef(null);

  const [leftWidth, setLeftWidth] = useState(60); // % of full width
  const [inputHeight, setInputHeight] = useState(50); // % of right column height

  const draggingRef = useRef(null); // 'vertical' | 'horizontal' | null

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

  return (
    <div
      ref={containerRef}
      className="flex w-full h-full bg-gray-950 select-none"
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
          background-color: #374151; /* gray-700, matches panel theme */
          border-radius: 9999px;
          border: none;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #4b5563; /* gray-600, lightens on hover */
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
        <div className="h-9 flex items-center px-3 bg-gray-900 border-b border-gray-700 text-xs text-gray-400 font-medium">
          Code Editor
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-gray-950 text-gray-200 p-3 text-sm">
          {editorContent ?? (
            <textarea
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
        {/* Input */}
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

        {/* Horizontal divider */}
        <div
          onMouseDown={handleHorizontalDown}
          className="h-1 cursor-row-resize bg-gray-800 hover:bg-blue-500 transition-colors flex-shrink-0"
        />

        {/* Output */}
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
    </div>
  );
};

export default EditorWorkspace;