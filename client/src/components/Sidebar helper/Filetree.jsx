import React from 'react';
import { useFileExplorer } from './FileExplorerContext';
import FileRow from './FileRow';
import FolderRow from './FolderRow';

/** Renders a mixed list of file/folder tree nodes at a given indent depth */
const FileTree = ({ nodes, depth }) => {
  const { expanded } = useFileExplorer();

  return (
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
};

export default FileTree;