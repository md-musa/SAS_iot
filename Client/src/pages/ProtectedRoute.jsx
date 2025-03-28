import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token in localStorage (remember me) or sessionStorage
    const user = localStorage.getItem("user");
    console.log("user form Local storage", user);
    if (user) setUser(JSON.parse(user));
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};
export default ProtectedRoute;
