import React, { useState } from "react";
import { MdMoreVert, MdOpenInNew, MdEdit, MdDelete } from "react-icons/md";
import { useFileExplorer } from "./Fileexplorercontext";
import { getFileIcon } from "./Getfileicon";
import ActionMenu from "./Actionmenu";
import InputModal from "./InputModal";

const FileRow = ({ node, depth, renameFile, deleteFile }) => {
  const {
    expanded,
    openMenuFor,
    toggleMenu,
    selectedFile,
    requestSelectFile,
    closeFile,
    isDirty,
  } = useFileExplorer();

  const isActive = selectedFile && (selectedFile._id || selectedFile.id) === node._id;
  const [activeModal, setActiveModal] = useState(null);
  const indent = expanded ? { paddingLeft: `${depth * 14 + 12}px` } : undefined;

  if (!expanded) {
    return (
      <div
        className={`
          relative flex items-center justify-center py-2.5 px-3 cursor-pointer
          hover:bg-gray-800 transition-colors group rounded-md mx-1
          ${isActive ? "bg-gradient-to-tr from-blue-600 to-blue-500" : ""}
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
      onClick={() => requestSelectFile(node, node.content)}
      style={indent}
      className={`
        relative flex items-center justify-between py-1.5 pr-3 hover:bg-gray-800 cursor-pointer text-sm
        transition-colors group rounded-md mx-1
        ${isActive ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-white" : "text-gray-300"}
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
            {
              label: "Open",
              icon: <MdOpenInNew className="w-4 h-4" />,
              action: () => {
                toggleMenu(node._id);
                requestSelectFile(node, node.content);
              },
            },
            {
              label: "Rename",
              icon: <MdEdit className="w-4 h-4" />,
              action: () => {
                toggleMenu(node._id);
                setActiveModal("rename");
              },
            },
            {
              label: "Delete",
              icon: <MdDelete className="w-4 h-4" />,
              action: () => {
                toggleMenu(node._id);
                if (isActive) {
                  closeFile();
                }
                deleteFile(node._id);
              },
              danger: true,
            },
          ]}
        />
      )}
      {activeModal === "rename" && (
        <InputModal
          title="Rename File"
          label="File Name"
          initialValue={node.name}
          confirmLabel="Rename"
          onConfirm={async (val) => {
            const updated = await renameFile(node._id, val);
            if (isActive && updated) {
              requestSelectFile(updated, updated.content);
            }
            setActiveModal(null);
          }}
          onCancel={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default FileRow;