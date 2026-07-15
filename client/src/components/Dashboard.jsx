import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import EditorWorkspace from "../components/Editorworkspace";
import { FileExplorerProvider } from "../components/Sidebar helper/FileExplorerContext";
import { useProjectExplorer } from "../components/Sidebar helper/useProjectExplorer";

function Dashboard({ username, onLogout, isLoggedIn }) {
  const [expanded, setExpanded] = useState(true);
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
  } = useProjectExplorer(isLoggedIn);

  return (
    <FileExplorerProvider expanded={expanded}>
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
    </FileExplorerProvider>
  );
}

export default Dashboard;
