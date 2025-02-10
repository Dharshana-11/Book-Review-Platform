import React, { createContext, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // Check if access_token exists in localStorage for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access_token"));

  // Retrieve the username from localStorage (not the full user object)
  const savedUsername = localStorage.getItem("username");
  const [username, setUsername] = useState(savedUsername || null); // Use saved username or default to null

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username"); // Remove username data on logout
    setIsAuthenticated(false);
    setUsername(null);
    window.location.href = "/login"; // Redirect to login
  };

  const login = (userData) => {
    localStorage.setItem("access_token", userData.access_token);
    localStorage.setItem("refresh_token", userData.refresh_token);
    localStorage.setItem("username", userData.username); // Store username in localStorage
    setIsAuthenticated(true);
    setUsername(userData.username); // Set the username in state
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, username, setUsername, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
