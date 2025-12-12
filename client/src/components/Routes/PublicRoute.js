import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // read auth state from redux
  const { user, loading } = useSelector((state) => state.auth);

  // Show nothing while checking (prevents redirect flash)
  if (loading) return null;

  // User exists → redirect to homepage
  if (token && user) {
    return <Navigate to="/" replace />;
  }

  // Otherwise allow login/register page
  return children;
};

export default PublicRoute;
