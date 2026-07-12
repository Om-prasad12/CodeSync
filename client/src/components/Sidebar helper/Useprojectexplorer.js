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

  return {
    project,
    selectedProject,
    fileItems,
    filesLoading,
    handleProjectClick
  };
};