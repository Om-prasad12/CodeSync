import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import EditorWorkspace from "../components/Editorworkspace";
import {
  FileExplorerProvider,
  useFileExplorer,
} from "../components/Sidebar helper/Fileexplorercontext";
import { useProjectExplorer } from "../components/Sidebar helper/useProjectExplorer";
import { getMonacoLanguage } from "../components/Sidebar helper/Getfileicon";

function Dashboard({ username, userId, onLogout, isLoggedIn }) {
  const [expanded, setExpanded] = useState(true);

  return (
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
  const { closeFile, selectedFile, selectedFileContent } = useFileExplorer();

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
    runCode,
  } = useProjectExplorer(isLoggedIn, username, userId, closeFile, selectedFile);

  // Run-code state — lives here since Navbar (trigger) and EditorWorkspace
  // (input/output display) are siblings, both needing access to it.
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState(null); // { text, isError } | null
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (!selectedFile || isRunning) return;

    setIsRunning(true);
    setConsoleOutput(null);

    const language = getMonacoLanguage(selectedFile.name);
    const result = await runCode(language, selectedFileContent ?? '', consoleInput);

    if (result) {
      setConsoleOutput({
        text: result.output || '(no output)',
        isError: !result.success,
      });
    }
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        username={username}
        onLogout={onLogout}
        onRun={handleRun}
        canRun={!!selectedFile}
        running={isRunning}
      />

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
          <EditorWorkspace
            saveFileContent={updateFileContent}
            inputValue={consoleInput}
            onInputChange={setConsoleInput}
            outputContent={consoleOutput}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;