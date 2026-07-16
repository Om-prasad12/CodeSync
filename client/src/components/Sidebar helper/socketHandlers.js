import { toast } from "react-toastify";


export const createUserJoinedHandler = () => {
  return ({ username }) => {
    toast.success(`${username} joined the project`);
  };
};

export const createUserLeftHandler = () => {
  return ({ username }) => {
    toast.info(`${username} left the project`);
  };
};

export const createFileCreatedHandler = ({
  userId,
  selectedProject,
  setFileItems,
  setFilesCache,
}) => {
  return ({ file, createdBy, username }) => {
    if (createdBy === userId) return;
    if (file.project !== selectedProject) return;

    setFileItems((prev) => {
      if ((prev || []).some((f) => f._id === file._id)) return prev;
      return [...(prev || []), file];
    });

    setFilesCache((prev) => ({
      ...prev,
      [selectedProject]: [...(prev[selectedProject] || []), file],
    }));

    toast.info(`A new ${file.type} "${file.name}" was added by ${username}`);
  };
};

export const createFileRenamedHandler = ({
  userId,
  selectedProject,
  setFileItems,
  setFilesCache,
}) => {
  return ({ file, renamedBy, username }) => {
    if (renamedBy === userId) return;
    if (file.project !== selectedProject) return;

    setFileItems((prev) =>
      (prev || []).map((item) => (item._id === file._id ? file : item))
    );

    setFilesCache((prev) => ({
      ...prev,
      [selectedProject]: (prev[selectedProject] || []).map((item) =>
        item._id === file._id ? file : item
      ),
    }));

    toast.info(`"${file.name}" was renamed by ${username}`);
  };
};

export const createFileDeletedHandler = ({
  userId,
  selectedProject,
  setFileItems,
  setFilesCache,
}) => {
  return ({ fileIds, deletedBy, username }) => {
    if (deletedBy === userId) return;

    setFileItems((prev) =>
      (prev || []).filter((item) => !fileIds.includes(item._id))
    );

    setFilesCache((prev) => ({
      ...prev,
      [selectedProject]: (prev[selectedProject] || []).filter(
        (item) => !fileIds.includes(item._id)
      ),
    }));

    toast.info(
      fileIds.length > 1
        ? `A folder and its contents were deleted by ${username}`
        : `A file was deleted by ${username}`
    );
  };
};


export const createCollaboratorAddedHandler = ({ userId, refetchProject }) => {
  return ({ projectId, addedBy, removedBy, username }) => {
    const actorId = addedBy ?? removedBy;
    if (actorId === userId) return; // skip self, my UI already knows

    refetchProject(projectId);
    toast.info(`${username} updated the collaborators list`);
  };
};


export const createCollaboratorRemovedHandler = ({
  userId,
  refetchProject,
  setProject,
  selectedProject,
  setSelectedProject,
  setFileItems,
}) => {
  return ({ projectId, removedBy, removedCollaboratorId, username }) => {
    if (removedBy === userId) return;

    if (removedCollaboratorId === userId) {
      setProject((prev) => prev.filter((p) => (p._id || p.id) !== projectId));

      if (selectedProject === projectId) {
        setSelectedProject(null);
        setFileItems(null);
      }

      toast.warning(`You were removed from a project by ${username}`);
      return;
    }

    refetchProject(projectId);
    toast.info(`${username} removed a collaborator`);
  };
};

export const createProjectUpdatedHandler = ({ userId, setProject }) => {
  return ({ projectId, updatedName, updatedBy, username }) => {
    if (updatedBy === userId) return; // I already know, my own REST call updated my state

    setProject((prev) =>
      prev.map((p) =>
        (p._id || p.id) === projectId ? { ...p, name: updatedName } : p
      )
    );

    toast.info(`${username} renamed the project to "${updatedName}"`);
  };
};

export const createProjectDeletedHandler = ({
  userId,
  setProject,
  setFilesCache,
  selectedProject,
  setSelectedProject,
  setFileItems,
}) => {
  return ({ projectId, projectName, deletedBy, username }) => {
    if (deletedBy === userId) return; // I already know, my own REST call handled my state

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

    toast.warning(`"${projectName}" was deleted by ${username}`);
  };
};