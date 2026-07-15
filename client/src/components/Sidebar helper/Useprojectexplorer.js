import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Owns all the data-fetching for the explorer:
 * - loads the project list once isLoggedIn is true
 * - loads a project's files on demand (accordion-style expand/collapse)
 * - caches files per project in memory so re-opening a project you already
 *   viewed this session doesn't refetch (only clears on full refresh/close)
 */
export const useProjectExplorer = (isLoggedIn) => {
  const [project, setProject] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [fileItems, setFileItems] = useState(null); // flat list for the open project
  const [filesCache, setFilesCache] = useState({}); // { [projectId]: files[] }
  const [filesLoading, setFilesLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/project`,
          { withCredentials: true }
        );
        setProject(res.data?.projects || res.data || []);
        console.log(res.data);
      } catch (err) {
        console.log('Failed to fetch projects:', err);
      }
    };

    if (isLoggedIn) {
      fetchProjects();
    }
  }, [isLoggedIn]);

  const fetchProjectFiles = async (projectId) => {
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
      setSelectedProject(null);
      setFileItems(null);
      return;
    }
    setSelectedProject(projectId);
    fetchProjectFiles(projectId);
  };

  // For project management actions (rename, delete, add/remove collaborators), we can define functions that call the backend API and update the state accordingly.

  const createProject = async (projectName) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/project`,
        { name: projectName },
        { withCredentials: true }
      );
      const newProject = res.data?.project || res.data?.data || res.data;
      setProject((prev) => [...prev, newProject]);
    } catch (err) {
      console.log('Failed to create project:', err);
    }
  };

  const renameProject = async (projectId, newName) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/project/${projectId}`,
        { name: newName },
        { withCredentials: true }
      );
      setProject((prev) =>
        prev.map((p) => ((p._id || p.id) === projectId ? { ...p, name: res.data?.name || newName } : p))
      );
    } catch (err) {
      console.log('Failed to rename project:', err);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/project/${projectId}`, {
        withCredentials: true
      });
      setProject((prev) => prev.filter((p) => (p._id || p.id) !== projectId));
      setFilesCache((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      if (selectedProject === projectId) {
        setSelectedProject(null);
        setFileItems(null);
      }
    } catch (err) {
      console.log('Failed to delete project:', err);
    }
  };

  const addCollaborator = async (projectId, email) => {
    try {
      const res=await axios.post(
        `${import.meta.env.VITE_BASE_URL}/project/${projectId}/collaborators`,
        { email },
        { withCredentials: true }
      );
      console.log('Collaborator added successfully',res);
    } catch (err) {
      console.log('Failed to add collaborator:', err);
    }
  };

  const removeCollaborator = async (projectId, email) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/project/${projectId}/collaborators`,
        { data: { email }, withCredentials: true }
      );
    } catch (err) {
      console.log('Failed to remove collaborator:', err);
    }
  };

  const createFile= async (projectId, fileName, parentId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/file`,
        { projectId, name: fileName, type: 'file', parentId: parentId || null },
        { withCredentials: true }
      );
      const newFile = res.data.data;
      setFilesCache((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newFile]
      }));
      if (selectedProject === projectId) {
        setFileItems((prev) => [...(prev || []), newFile]);
      }
    } catch (err) {
      console.log('Failed to create file:', err);
    }
  };
  
  const createFolder = async (projectId, folderName,parentId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/file`,
        { projectId, name: folderName, type: 'folder', parentId: parentId || null },
        { withCredentials: true }
      );
      const newFolder = res.data.data;
      setFilesCache((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newFolder]
      }));
      if (selectedProject === projectId) {
        setFileItems((prev) => [...(prev || []), newFolder]);
      }
    } catch (err) {
      console.log('Failed to create folder:', err);
    }
  };

  const renameFile = async (fileId, newName) => {
  try {
    const res = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/file/${fileId}`,
      {
        name: newName,
      },
      {
        withCredentials: true,
      }
    );

    const updated = res.data.data;

    setFileItems((prev) =>
      prev.map((item) =>
        item._id === fileId ? updated : item
      )
    );

    setFilesCache((prev) => ({
      ...prev,
      [selectedProject]: prev[selectedProject].map((item) =>
        item._id === fileId ? updated : item
      ),
    }));
    return updated; //added so callers can react to the fresh object
  } catch (err) {
    console.log("Failed to rename:", err);
  }
};

const deleteFile = async (fileId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/file/${fileId}`,
        { withCredentials: true }
      );

      setFileItems((prev) => (prev || []).filter((item) => item._id !== fileId));

      setFilesCache((prev) => ({
        ...prev,
        [selectedProject]: (prev[selectedProject] || []).filter(
          (item) => item._id !== fileId
        ),
      }));
    } catch (err) {
      console.log("Failed to delete:", err);
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/file/${folderId}`,
        { withCredentials: true }
      );

      setFileItems((prev) => (prev || []).filter((item) => item._id !== folderId));

      setFilesCache((prev) => ({
        ...prev,
        [selectedProject]: (prev[selectedProject] || []).filter(
          (item) => item._id !== folderId
        ),
      }));
    } catch (err) {
      console.log("Failed to delete folder:", err);
    }
  };
  const updateFileContent = async (fileId, content) => {
    const res = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/file/content/${fileId}`,
      { content },
      { withCredentials: true }
    );

    const updated = res.data.data;

    setFileItems((prev) =>
      (prev || []).map((item) => (item._id === fileId ? updated : item))
    );

    setFilesCache((prev) => ({
      ...prev,
      [selectedProject]: (prev[selectedProject] || []).map((item) =>
        item._id === fileId ? updated : item
      ),
    }));

    return updated;
  };

  
  

  // createFolderAtRoot follows the same shape as createFileAtRoot, just type: 'folder'

  return {
    project,
    selectedProject,
    fileItems,
    filesLoading,
    handleProjectClick,
    createProject,
    renameProject,
    deleteProject,
    addCollaborator,
    removeCollaborator,
    createFile,
    createFolder,
    renameFile,
    deleteFile,
    deleteFolder,
    updateFileContent,
  };
};