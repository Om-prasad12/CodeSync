import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdExpandMore, MdLogout, MdPerson } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
  { id: 'python', label: 'Python', color: 'text-emerald-400' },
  { id: 'cpp', label: 'C++', color: 'text-pink-400' },
  { id: 'java', label: 'Java', color: 'text-orange-400' },
  { id: 'typescript', label: 'TypeScript', color: 'text-sky-400' },
  { id: 'go', label: 'Go', color: 'text-cyan-400' },
  { id: 'rust', label: 'Rust', color: 'text-amber-500' },
];

// A small set of gradient pairs — picked deterministically from the username
// so the same person always gets the same color, but different users vary.
const AVATAR_GRADIENTS = [
  'from-blue-600 to-blue-500',
  'from-violet-600 to-purple-500',
  'from-emerald-600 to-teal-500',
  'from-pink-600 to-rose-500',
  'from-amber-600 to-orange-500',
  'from-cyan-600 to-sky-500',
];

const getAvatarGradient = (name) => {
  if (!name) return AVATAR_GRADIENTS[0];
  const charSum = name
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[charSum % AVATAR_GRADIENTS.length];
};

const Navbar = ({ activeLanguage, onSelectLanguage, username,onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Internal fallback state — lets the dropdown work standalone even if
  // no activeLanguage/onSelectLanguage props are passed from a parent.
  const [internalLanguage, setInternalLanguage] = useState('javascript');
  const dropdownRef = useRef(null);
  const accountMenuRef = useRef(null);
  const navigate = useNavigate();

  const isLoggedIn = !!username;
  const initial = username?.trim()?.[0]?.toUpperCase() || 'U';
  const avatarGradient = getAvatarGradient(username);

  const currentLanguageId = activeLanguage ?? internalLanguage;
  const selected =
    LANGUAGES.find((l) => l.id === currentLanguageId) || LANGUAGES[0];

  // Close both dropdowns when clicking outside them
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
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

const handleLogout = async () => {
  setAccountMenuOpen(false);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );

    toast.success(res.data?.message || 'Logged out successfully');
    onLogout?.();
  } catch (err) {
    const message = err.response?.data?.message || 'Logout failed. Please try again.';
    console.error('Logout error:', err);
    toast.error(message);
  }
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

      {/* Right: Login button OR Profile avatar */}
      <div className="flex-shrink-0 mr-2">
        {isLoggedIn ? (
          <div className="relative" ref={accountMenuRef}>
            <button
              onClick={() => setAccountMenuOpen((prev) => !prev)}
              className={`
                flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full
                border transition-colors
                ${accountMenuOpen
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-gray-800/60 border-gray-700 hover:bg-gray-800 hover:border-gray-600'}
              `}
            >
              <span
                className={`
                  w-8 h-8 rounded-full bg-gradient-to-tr ${avatarGradient}
                  flex items-center justify-center text-sm font-semibold text-white
                  ring-2 ring-gray-900 shadow-md
                `}
              >
                {initial}
              </span>
              <span className="text-sm font-medium text-gray-200 max-w-[110px] truncate">
                {username}
              </span>
              <MdExpandMore
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  accountMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden">
                <div className="px-3 py-2.5 border-b border-gray-700">
                  <p className="text-sm font-medium text-white truncate">{username}</p>
                </div>
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                >
                  <MdPerson className="w-4 h-4 text-gray-400" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <MdLogout className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
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