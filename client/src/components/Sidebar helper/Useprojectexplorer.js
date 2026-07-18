import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { socket } from '../../socket';
import {
  createUserJoinedHandler,
  createUserLeftHandler,
  createFileCreatedHandler,
  createFileRenamedHandler,
  createFileDeletedHandler,
  createCollaboratorAddedHandler,
  createCollaboratorRemovedHandler,
  createProjectUpdatedHandler,
  createProjectDeletedHandler
} from "./socketHandlers";

/**
 * Owns all the data-fetching for the explorer:
 * - loads the project list once isLoggedIn is true
 * - loads a project's files on demand (accordion-style expand/collapse)
 * - caches files per project in memory so re-opening a project you already
 *   viewed this session doesn't refetch (only clears on full refresh/close)
 * - joins/leaves the socket.io room for whichever project is open, and reacts
 *   to real-time events broadcast by other collaborators in that room
 */
export const useProjectExplorer = (isLoggedIn, username, userId,closeFile,selectedFile) => {
  // List of all projects the logged-in user owns/collaborates on
  const [project, setProject] = useState([]);

  // Which project is currently expanded/open in the sidebar (null = none open)
  const [selectedProject, setSelectedProject] = useState(null);

  // Flat list of files/folders belonging to the currently open project
  const [fileItems, setFileItems] = useState(null);

  // In-memory cache so switching back to a previously-opened project
  // this session doesn't re-hit the API — shape: { [projectId]: files[] }
  const [filesCache, setFilesCache] = useState({});

  // Loading flag shown in the sidebar while a project's files are being fetched
  const [filesLoading, setFilesLoading] = useState(false);

  // Tracks which socket room we're currently in, so cleanup can leave the
  // CORRECT (previous) room even after selectedProject has already changed —
  // a plain variable/state wouldn't survive being read inside the effect's
  // cleanup closure correctly across renders, a ref does.
  const currentRoomRef = useRef(null);

  // ---------------------------------------------------------------------
  // Fetch the user's project list once, whenever they log in
  // ---------------------------------------------------------------------
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
        toast.error(err.response?.data?.message || 'Failed to load projects');
      }
    };

    if (isLoggedIn) {
      fetchProjects();
    }
  }, [isLoggedIn]);

  // ---------------------------------------------------------------------
  // Socket room join/leave + all real-time event listeners for the
  // currently open project. Re-runs whenever the open project, username,
  // or userId changes (username/userId are needed inside the handlers to
  // tell "my own action" apart from "someone else's action").
  // ---------------------------------------------------------------------
  useEffect(() => {
    // Join the room for whichever project is now open
    if (selectedProject) {
      socket.emit("join-project", { projectId: selectedProject, username });
      currentRoomRef.current = selectedProject;
    }

    // Each handler is created fresh on every effect run so it "closes over"
    // the CURRENT selectedProject/userId/etc. — this keeps the comparisons
    // inside each handler (e.g. "was this done by me?") accurate.
    const handleUserJoined = createUserJoinedHandler();
    const handleUserLeft = createUserLeftHandler();

    const handleFileCreated = createFileCreatedHandler({
      userId,
      selectedProject,
      setFileItems,
      setFilesCache,
    });

    const handleFileRenamed = createFileRenamedHandler({
      userId,
      selectedProject,
      setFileItems,
      setFilesCache,
    });

    const handleFileDeleted = createFileDeletedHandler({
      userId,
      selectedProject,
      setFileItems,
      setFilesCache,
    });

    const handleCollaboratorAdded = createCollaboratorAddedHandler({
      userId,
      refetchProject,
    });

    const handleCollaboratorRemoved = createCollaboratorRemovedHandler({
      userId,
      refetchProject,
      setProject,
      selectedProject,
      setSelectedProject,
      setFileItems,
    });

    const handleProjectUpdated = createProjectUpdatedHandler({
      userId,
      setProject,
    });

    const handleProjectDeleted = createProjectDeletedHandler({
      userId,
      setProject,
      setFilesCache,
      selectedProject,
      setSelectedProject,
      setFileItems,
    });

    // Register every listener
    socket.on("user-joined-project", handleUserJoined);
    socket.on("user-left-project", handleUserLeft);
    socket.on("file:created", handleFileCreated);
    socket.on("file:renamed", handleFileRenamed);
    socket.on("file:deleted", handleFileDeleted);
    socket.on("collaborator:added", handleCollaboratorAdded);
    socket.on("collaborator:removed", handleCollaboratorRemoved);
    socket.on("project:updated", handleProjectUpdated);
    socket.on("project:deleted", handleProjectDeleted);

    // Cleanup: runs before this effect re-runs (e.g. switching projects) AND
    // on unmount. Leaves the room we joined and removes every listener we
    // registered above, so we never end up with duplicate listeners stacking
    // up across re-renders.
    return () => {
      if (currentRoomRef.current) {
        socket.emit("leave-project", { projectId: currentRoomRef.current, username });
        currentRoomRef.current = null;
      }

      socket.off("user-joined-project", handleUserJoined);
      socket.off("user-left-project", handleUserLeft);
      socket.off("file:created", handleFileCreated);
      socket.off("file:renamed", handleFileRenamed);
      socket.off("file:deleted", handleFileDeleted);
      socket.off("collaborator:added", handleCollaboratorAdded);
      socket.off("collaborator:removed", handleCollaboratorRemoved);
      socket.off("project:updated", handleProjectUpdated);
      socket.off("project:deleted", handleProjectDeleted);
    };
  }, [selectedProject, username, userId]);

  // ---------------------------------------------------------------------
  // Loads a project's files, using the in-memory cache if we've already
  // fetched them this session (accordion open/close doesn't refetch).
  // ---------------------------------------------------------------------
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
      toast.error(err.response?.data?.message || 'Failed to load project files');
      setFileItems([]);
    } finally {
      setFilesLoading(false);
    }
  };

  // ---------------------------------------------------------------------
  // Re-fetches a single project (used after collaborator add/remove, since
  // those events change a populated sub-array we don't want to hand-patch
  // — a fresh GET guarantees our copy exactly matches the server).
  // ---------------------------------------------------------------------
  const refetchProject = async (projectId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/project/${projectId}`,
        { withCredentials: true }
      );
      const updated = res.data;

      setProject((prev) =>
        prev.map((p) => ((p._id || p.id) === projectId ? updated : p))
      );
    } catch (err) {
      console.log("Failed to refetch project:", err);
      toast.error(err.response?.data?.message || 'Failed to refresh project');
    }
  };

  // ---------------------------------------------------------------------
  // Toggles a project open/closed in the sidebar (accordion-style — only
  // one project's files are fetched/shown at a time).
  // ---------------------------------------------------------------------
  const handleProjectClick = (projectId) => {
    if (selectedProject === projectId) {
      //close the project if it's already open
      if (selectedFile && selectedFile.project === projectId) {
        closeFile();
      }
      setSelectedProject(null);
      setFileItems(null);
      return;
    }
    setSelectedProject(projectId);
    fetchProjectFiles(projectId);
  };

  // =======================================================================
  // Project management actions (REST calls). Each one updates local state
  // directly after a successful response — no need to wait for the socket
  // event to bounce back, since the corresponding socket handler already
  // skips updates where "I" was the one who triggered the action.
  // =======================================================================

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
      toast.error(err.response?.data?.message || 'Failed to create project');
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
      toast.error(err.response?.data?.message || 'Failed to rename project');
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
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const addCollaborator = async (projectId, email) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/project/${projectId}/collaborators`,
        { email },
        { withCredentials: true }
      );
      // Actor also refreshes their own copy of the project so the newly
      // added collaborator shows up immediately in their own UI too.
      await refetchProject(projectId);
      toast.success('Collaborator added successfully');
    } catch (err) {
      console.log('Failed to add collaborator:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const removeCollaborator = async (projectId, email) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/project/${projectId}/collaborators`,
        { data: { email }, withCredentials: true }
      );
      await refetchProject(projectId);
      toast.success('Collaborator removed successfully');
    } catch (err) {
      console.log('Failed to remove collaborator:', err);
      toast.error(err.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  // =======================================================================
  // File/folder management actions (REST calls)
  // =======================================================================

  const createFile = async (projectId, fileName, parentId) => {
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
      toast.error(err.response?.data?.message || 'Failed to create file');
    }
  };

  const createFolder = async (projectId, folderName, parentId) => {
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
      toast.error(err.response?.data?.message || 'Failed to create folder');
    }
  };

  const renameFile = async (fileId, newName) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/file/${fileId}`,
        { name: newName },
        { withCredentials: true }
      );

      const updated = res.data.data;

      setFileItems((prev) =>
        prev.map((item) => (item._id === fileId ? updated : item))
      );

      setFilesCache((prev) => ({
        ...prev,
        [selectedProject]: prev[selectedProject].map((item) =>
          item._id === fileId ? updated : item
        ),
      }));

      return updated; // callers (e.g. FileRow) use this to react to the fresh object
    } catch (err) {
      console.log("Failed to rename:", err);
      toast.error(err.response?.data?.message || 'Failed to rename file');
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
      toast.error(err.response?.data?.message || 'Failed to delete file');
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
      toast.error(err.response?.data?.message || 'Failed to delete folder');
    }
  };

  const updateFileContent = async (fileId, content) => {
    try {
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
    } catch (err) {
      console.log('Failed to update file content:', err);
      toast.error(err.response?.data?.message || 'Failed to save file');
    }
  };

  const runCode = async (language, code, input) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/execute`,
      { language, code, input },
      { withCredentials: true }
    );
    return res.data; // { success, stage, output, exitCode }
  } catch (err) {
    console.log('Failed to execute code:', err);
    toast.error(err.response?.data?.message || 'Failed to run code');
    return null;
  }
};

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
    runCode,
  };
};