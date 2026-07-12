import React from 'react';
import { MdInsertDriveFile, MdDataObject, MdFolder } from 'react-icons/md';
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

/**
 * Real brand icon + color per language/file type.
 * Pass isFolder=true to get the folder icon instead (used by folder/project rows).
 */
export const getFileIcon = (fileName = '', isFolder = false) => {
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