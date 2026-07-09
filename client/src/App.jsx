import Sidebar from "./components/Sidebar"
import Side from "./components/Side"
import { useState } from "react"
function App() {
  const [expanded, setExpanded] = useState(true)
  return (
    <>
      <div className="App flex h-screen overflow-hidden">
        {/* <Side expanded={expanded} setExpanded={setExpanded} /> */}
        <Sidebar expanded={expanded} setExpanded={setExpanded} />
      </div>
    </>
  )
}

export default App

