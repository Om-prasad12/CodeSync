import React, { useState } from 'react';
import { MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Signup = ({ onAuthSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters long.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/signup`,
        {
          username: name,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      toast.success(res.data?.message || 'Account created successfully');

      // Tell App.jsx to re-check auth NOW, so isLoggedIn/username update
      // before we navigate — otherwise "/" still thinks we're logged out.
      await onAuthSuccess?.();
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(message);
      setError(message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <span className="font-mono text-2xl font-semibold tracking-tight">
            <span className="text-gray-500">&lt;</span>
            <span className="text-white">codesync</span>
            <span className="text-blue-400">/</span>
            <span className="text-gray-500">&gt;</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-6">
          <h1 className="text-lg font-semibold text-white mb-1">Create your account</h1>
          <p className="text-sm text-gray-400 mb-6">
            Sign up to start saving your code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Name</label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 focus-within:border-blue-500 transition-colors">
                <MdPerson className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600 px-2 py-2"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 focus-within:border-blue-500 transition-colors">
                <MdEmail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600 px-2 py-2"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Password</label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 focus-within:border-blue-500 transition-colors">
                <MdLock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600 px-2 py-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-500 hover:text-gray-300 flex-shrink-0"
                >
                  {showPassword ? (
                    <MdVisibilityOff className="w-4 h-4" />
                  ) : (
                    <MdVisibility className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Confirm Password</label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 focus-within:border-blue-500 transition-colors">
                <MdLock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600 px-2 py-2"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-md bg-gradient-to-tr from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-sm font-medium text-white transition-colors mt-2"
            >
              Sign Up
            </button>
          </form>

          {/* Login button below */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => { navigate('/login'); }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;