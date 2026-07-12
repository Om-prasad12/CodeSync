import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [username, setUsername] = useState("");

  // Reusable — called once on load, AND again after login/signup succeed,
  // so React's state stays in sync with the actual cookie/session.
  const checkAuth = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/auth/isloggedin`,
        { withCredentials: true },
      );
      setIsLoggedIn(res.data.loggedIn);
      setUsername(res.data.user?.username || "");
    } catch (err) {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Called after logout succeeds — no API call needed here, the Navbar
  // already made that request. This just clears local React state so
  // the routes below re-evaluate and redirect to /login on their own.
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername("");
  }, []);

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <Login onAuthSuccess={checkAuth} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <SignUp onAuthSuccess={checkAuth} />
            )
          }
        />

        <Route
          path="/"
          element={ isLoggedIn ? (
            <Dashboard username={username} onLogout={handleLogout} isLoggedIn={isLoggedIn} />
          ) : (
            <Navigate to="/login" replace />
          )}
        />
      </Routes>

      <ToastContainer
        theme="dark"
        position="top-center"
        autoClose={3000}
        newestOnTop
      />
    </>
  );
}

export default App;