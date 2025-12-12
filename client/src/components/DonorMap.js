import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import OTPModal from "./OTPModal";

import API from "../services/API";
import { createSocket } from "../services/socket";
import { toast } from "react-hot-toast";

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DonorMap = () => {
  const [donors, setDonors] = useState([]);
  const [center, setCenter] = useState([12.9716, 77.5946]);
  const socketRef = useRef(null);

  const token = localStorage.getItem("token");

  // OTP Modal State
  const [showOtp, setShowOtp] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);

  useEffect(() => {
    const loadDonors = async (lat, lng) => {
      try {
        const res = await API.get(
          `/location/nearby?latitude=${lat}&longitude=${lng}`
        );
        setDonors(res.data.donors || []);
      } catch (err) {
        console.error("Nearby donor fetch failed:", err.response?.data || err.message);
      }
    };

    // ============================
    // SOCKET SAFE CONNECTION
    // ============================

    if (token) {
      socketRef.current = createSocket(token);

      socketRef.current.on("connect", () => {
        console.log("🟢 Socket connected:", socketRef.current.id);

        // Real-time donor update listener
        socketRef.current.on("donorUpdated", (payload) => {
          setDonors((prev) => {
            const exists = prev.find((d) => d._id === payload._id);
            return exists
              ? prev.map((d) => (d._id === payload._id ? payload : d))
              : [...prev, payload];
          });
        });
      });

      socketRef.current.on("connect_error", (err) => {
        console.log("❌ Socket connection failed:", err.message);
      });
    } else {
      console.log("❌ No token found — socket not created");
    }

    // ============================
    // GEOLOCATION
    // ============================
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setCenter([lat, lng]);
        loadDonors(lat, lng);
      },
      () => loadDonors(center[0], center[1])
    );

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // When user clicks "Request Blood (OTP)"
  const openOtpModal = (donor) => {
    setSelectedDonor(donor);
    setShowOtp(true);
  };

  // OTP Modal callback
  const handleOTPAction = async (action, email, otp) => {
    try {
      if (action === "send") {
        const res = await API.post("/otp/send", { email });
        if (res.data.success) toast.success("OTP sent to email");
      }

      if (action === "verify") {
        const verifyRes = await API.post("/otp/verify", { email, otp });

        if (!verifyRes.data.success) {
          toast.error(verifyRes.data.message);
          return;
        }

        toast.success("OTP verified!");

        // Now send the blood request
        const result = await API.post("/request/send", {
          donorId: selectedDonor.user._id,
          bloodGroup: selectedDonor.user.bloodGroup,
          message: `Need ${selectedDonor.user.bloodGroup} urgently.`,
        });

        if (result.data.success) {
          toast.success("Blood request sent!");
          setShowOtp(false);
        } else {
          toast.error(result.data.message || "Failed to send request");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <OTPModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        onVerify={handleOTPAction}
      />

      <div style={{ height: "80vh", width: "100%", marginTop: "1rem" }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {donors.map((d) => (
            <Marker
              key={d._id}
              position={[d.location.coordinates[1], d.location.coordinates[0]]}
            >
              <Popup>
                <b>{d.user?.name}</b> <br />
                🩸 {d.user?.bloodGroup} <br />
                📍 {d.address} <br />
                <button
                  className="btn btn-danger btn-sm mt-2"
                  onClick={() => openOtpModal(d)}
                >
                  Request Blood (OTP)
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
};

export default DonorMap;
