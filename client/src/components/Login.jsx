import React, { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = ({onAuthSuccess}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      toast.success(res.data?.message || 'Logged in successfully');
      await onAuthSuccess?.();
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      // toast.error(message);
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
          <h1 className="text-lg font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-6">
            Log in to access your saved files.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400 block">Password</label>
                <button
                  type="button"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
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

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-md bg-gradient-to-tr from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-sm font-medium text-white transition-colors mt-2"
            >
              Log In
            </button>
          </form>

          {/* Signup button below */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => { navigate('/signup'); }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;