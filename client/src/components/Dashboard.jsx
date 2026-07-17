import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import EditorWorkspace from "../components/Editorworkspace";
import {
  FileExplorerProvider,
  useFileExplorer,
} from "../components/Sidebar helper/FileExplorerContext";
import { useProjectExplorer } from "../components/Sidebar helper/useProjectExplorer";

function Dashboard({ username, userId, onLogout, isLoggedIn }) {
  const [expanded, setExpanded] = useState(true);

  return (
    // Provider has to wrap DashboardInner, since DashboardInner is the one
    // that calls useFileExplorer() — a hook can only read a context from
    // INSIDE that context's provider, never from the same component that
    // renders the provider itself.
    <FileExplorerProvider expanded={expanded} username={username} userId={userId}>
      <DashboardInner
        username={username}
        userId={userId}
        onLogout={onLogout}
        isLoggedIn={isLoggedIn}
        expanded={expanded}
        setExpanded={setExpanded}
      />
    </FileExplorerProvider>
  );
}

function DashboardInner({
  username,
  userId,
  onLogout,
  isLoggedIn,
  expanded,
  setExpanded,
}) {
  // Pulled out here so we can pass them into useProjectExplorer — that hook
  // needs to know the currently open file (and how to close it) so it can
  // force-close a file whose parent project just got closed/switched.
  const { closeFile, selectedFile } = useFileExplorer();

  const {
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
    updateFileContent,
  } = useProjectExplorer(isLoggedIn, username, userId, closeFile, selectedFile);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar username={username} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          expanded={expanded}
          setExpanded={setExpanded}
          isLoggedIn={isLoggedIn}
          project={project}
          selectedProject={selectedProject}
          fileItems={fileItems}
          filesLoading={filesLoading}
          handleProjectClick={handleProjectClick}
          createProject={createProject}
          renameProject={renameProject}
          deleteProject={deleteProject}
          addCollaborator={addCollaborator}
          removeCollaborator={removeCollaborator}
          createFile={createFile}
          createFolder={createFolder}
          renameFile={renameFile}
          deleteFile={deleteFile}
        />

        <div className="flex-1 overflow-auto bg-gray-950">
          <EditorWorkspace saveFileContent={updateFileContent} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;