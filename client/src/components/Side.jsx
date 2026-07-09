import { MoreVertical, ChevronLast, ChevronFirst } from "lucide-react"
import { useContext, createContext } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { FiMail,FiFile,FiHome } from "react-icons/fi";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { CgProfile } from "react-icons/cg";

const SidebarContext = createContext()

export default function Sidebar({expanded, setExpanded}) {
  

  return (
    <aside  className={`
      h-screen transition-all duration-300
      ${expanded ? "w-64" : "w-16"}
    `}>
      <nav className="h-full flex flex-col bg-gray-900 border-r border-gray-700 shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <p className={`overflow-hidden transition-all text-white ${
              expanded ? "w-32" : "w-0"
            }`}>Dashboard</p>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">
            <SidebarItem icon={<FiHome size={20} />} text="Home" to="/" active/>
            <SidebarItem icon={<MdOutlinePeopleAlt size={20} />} text="Patient" to="/patient" alert />
            <SidebarItem icon={<FiMail size={20} />} text="Message" to="/message" alert />
            <SidebarItem icon={<FiFile size={20} />} text="Report" to="/report" />
            <SidebarItem icon={<SlCalender size={20} />} text="Calendar" to="/calendar" />
          </ul>
        </SidebarContext.Provider>

        {/* <div className="border-t flex p-3">
          <CgProfile className="w-6 h-6"/>
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
          `}
          >
            <div className="leading-4">
              <h4 className="font-semibold">John Doe</h4>
              <span className="text-xs text-gray-600">johndoe@gmail.com</span>
            </div>
            <MoreVertical size={20} />
          </div>
        </div> */}
      </nav>
    </aside>
  )
}

export function SidebarItem({ icon, text, alert, to }) {
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`
        relative flex items-center py-3 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          isActive
            ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-white"
            : "hover:bg-gray-800 text-gray-300"
        }`}
    >
      {icon}
      <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
        {text}
      </span>

      {alert && (
        <div className={`absolute right-2 w-2 h-2 rounded bg-blue-400 ${expanded ? "" : "top-2"}`} />
      )}

      {!expanded && (
        <div
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-gray-800 text-white text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
        `}
        >
          {text}
        </div>
      )}
    </NavLink>
  );
}
