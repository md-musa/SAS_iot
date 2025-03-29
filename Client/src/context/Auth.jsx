import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("user");
  const [user, setUser] = useState(JSON.parse(currentUser) || null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, login, logout }}>{children}</AuthContext.Provider>;
};

// Custom Hook to use Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};
