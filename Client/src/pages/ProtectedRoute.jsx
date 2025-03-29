import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/Auth";

const ProtectedRoute = ({ children }) => {
  const{user} = useAuth();


  console.log("parsed user", user);
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};
export default ProtectedRoute;
