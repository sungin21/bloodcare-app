import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

// Toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster, toast } from "react-hot-toast";

// Routes & Components
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import PublicRoute from "./components/Routes/PublicRoute";

import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Donar from "./pages/Dashboard/Donar";
import Hospitals from "./pages/Dashboard/Hospitals";
import OrganisationPage from "./pages/Dashboard/OrganisationPage";
import Consumer from "./pages/Dashboard/Consumer";
import Donation from "./pages/Donation";
import Analytics from "./pages/Dashboard/Analytics";

import DonarList from "./pages/Admin/DonarList";
import HospitalList from "./pages/Admin/HospitalList";
import OrgList from "./pages/Admin/OrgList";
import AdminHome from "./pages/Admin/AdminHome";
import AdminLocationPage from "./pages/AdminLocationPage";
import LocationMapPage from "./pages/LocationMapPage";
import PendingHospitals from "./pages/Admin/PendingHospitals";
import DonorRequests from "./pages/DonorRequests";

// ✅ front-end socket helper
import { createSocket } from "./services/socket";
// ======================================================
// 🔔 SOCKET LISTENER COMPONENT (FINAL SAFE VERSION)
// ======================================================
function SocketListeners() {
  const token = localStorage.getItem("token");
  const socketRef = React.useRef(null);

  useEffect(() => {
    if (!token) {
      console.log("❌ No token → socket not created");
      return;
    }

    // Create socket only inside useEffect
    socketRef.current = createSocket(token);

    // ⛔ null-check immediately
    if (!socketRef.current) {
      console.log("❌ createSocket returned null");
      return;
    }

    // Wait until socket connects
    socketRef.current.on("connect", () => {
      console.log("🟢 Global socket connected:", socketRef.current.id);

      // Safe listeners
      socketRef.current.on("requestAccepted", () => {
        toast.success("🎉 Your blood request was ACCEPTED!");
      });

      socketRef.current.on("requestRejected", () => {
        toast.error("❌ Your blood request was REJECTED.");
      });
    });

    // Handle connection errors
    socketRef.current.on("connect_error", (err) => {
      console.log("❌ Global socket connection failed:", err.message);
    });

    // Clean-up
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  return null;
}



// ======================================================
// 🚀 MAIN APP  (no BrowserRouter here)
// ======================================================
function App() {
  return (
    <>
      {/* GLOBAL TOAST NOTIFICATIONS */}
      <ToastContainer />
      <Toaster position="top-right" />

      {/* GLOBAL SOCKET LISTENER */}
      <SocketListeners />

      <Routes>
        {/* ---------- ADMIN ROUTES ---------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donar-list"
          element={
            <ProtectedRoute>
              <DonarList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hospital-list"
          element={
            <ProtectedRoute>
              <HospitalList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/org-list"
          element={
            <ProtectedRoute>
              <OrgList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/locations"
          element={
            <ProtectedRoute>
              <AdminLocationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pending-hospitals"
          element={
            <ProtectedRoute>
              <PendingHospitals />
            </ProtectedRoute>
          }
        />

        {/* ---------- DASHBOARD ROUTES ---------- */}
        <Route
          path="/donar"
          element={
            <ProtectedRoute>
              <Donar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hospital"
          element={
            <ProtectedRoute>
              <Hospitals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orgnaisation"
          element={
            <ProtectedRoute>
              <OrganisationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consumer"
          element={
            <ProtectedRoute>
              <Consumer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donation"
          element={
            <ProtectedRoute>
              <Donation />
            </ProtectedRoute>
          }
        />

        {/* ---------- LOCATION ---------- */}
        <Route
          path="/my-location"
          element={
            <ProtectedRoute>
              <LocationMapPage />
            </ProtectedRoute>
          }
        />

        {/* ---------- DONOR REQUESTS ---------- */}
        <Route
          path="/donor/requests"
          element={
            <ProtectedRoute>
              <DonorRequests />
            </ProtectedRoute>
          }
        />

        {/* ---------- MAIN HOME ---------- */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* ---------- AUTH ROUTES ---------- */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
