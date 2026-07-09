import Sidebar from "./components/Sidebar"
import Navbar from "./components/Navbar"
import EditorWorkspace from "./components/Editorworkspace"
import { useState } from "react"

function App() {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="App flex flex-col h-screen overflow-hidden">
      {/* Top: full-width navbar */}
      <Navbar />

      {/* Below: sidebar + main content area, side by side */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar expanded={expanded} setExpanded={setExpanded} />

        {/* Editor / main content goes here */}
        <div className="flex-1 overflow-auto bg-gray-950">
          {/* e.g. <Editor /> */}
        <EditorWorkspace/>
        </div>
      </div>
    </div>
  )
}

export default App