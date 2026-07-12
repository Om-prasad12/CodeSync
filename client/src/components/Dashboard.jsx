import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import EditorWorkspace from "../components/Editorworkspace";

function Dashboard({username,onLogout,isLoggedIn}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar username={username} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          expanded={expanded}
          setExpanded={setExpanded}
          isLoggedIn={isLoggedIn}
        />

        <div className="flex-1 overflow-auto bg-gray-950">
          <EditorWorkspace />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;