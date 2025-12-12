import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../../services/API";
import { setUser } from "../../redux/Features/auth/authSlice";

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");

  // 🔥 FIX — useEffect must be BEFORE any return
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/auth/current-user");
        if (data?.success) {
          dispatch(setUser(data.user));
        }
      } catch (err) {
        localStorage.removeItem("token");
        dispatch(setUser(null));
      }
    };

    if (token && !user) {
      fetchUser();
    }
  }, [token, user, dispatch]);

  // 🔥 NOW the conditional return is allowed
  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
