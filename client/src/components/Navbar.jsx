import React, { useState, useRef, useEffect } from 'react';
import { MdExpandMore } from 'react-icons/md';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
  { id: 'python', label: 'Python', color: 'text-emerald-400' },
  { id: 'cpp', label: 'C++', color: 'text-pink-400' },
  { id: 'java', label: 'Java', color: 'text-orange-400' },
  { id: 'typescript', label: 'TypeScript', color: 'text-sky-400' },
  { id: 'go', label: 'Go', color: 'text-cyan-400' },
  { id: 'rust', label: 'Rust', color: 'text-amber-500' },
];

const Navbar = ({ activeLanguage, onSelectLanguage, isLoggedIn = false, onLoginClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Internal fallback state — lets the dropdown work standalone even if
  // no activeLanguage/onSelectLanguage props are passed from a parent.
  const [internalLanguage, setInternalLanguage] = useState('javascript');
  const dropdownRef = useRef(null);

  const currentLanguageId = activeLanguage ?? internalLanguage;
  const selected =
    LANGUAGES.find((l) => l.id === currentLanguageId) || LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang) => {
    setInternalLanguage(lang.id);
    onSelectLanguage?.(lang.id);
    setDropdownOpen(false);
  };

  return (
    <header className="w-full h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 relative z-50">
      {/* Left: Logo */}
      <div className="flex items-center flex-shrink-0 ml-2">
        <span className="font-mono text-xl font-semibold tracking-tight">
          <span className="text-gray-500">&lt;</span>
          <span className="text-white">CodeSync</span>
          <span className="text-blue-400">/</span>
          <span className="text-gray-500">&gt;</span>
        </span>
      </div>

      {/* Middle: Language dropdown */}
      <div className="absolute left-1/2 -translate-x-1/2" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-750 border border-gray-700 text-sm text-gray-200 transition-colors min-w-[150px] justify-between"
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${selected.color.replace('text-', 'bg-')}`} />
            {selected.label}
          </span>
          <MdExpandMore
            className={`w-4 h-4 text-gray-400 transition-transform ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full mt-1 left-0 w-full min-w-[180px] bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden">
            {LANGUAGES.map((lang) => {
              const isActive = lang.id === selected.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleSelect(lang)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors
                    ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${lang.color.replace('text-', 'bg-')}`} />
                    {lang.label}
                  </span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Login button */}
      <div className="flex-shrink-0 mr-2">
        {isLoggedIn ? (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-md text-gray-200 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-xs font-medium text-white">
              U
            </span>
            Account
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="px-4 py-1.5 rounded-md bg-gradient-to-tr from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-md font-medium text-white transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;