import React, { useEffect, useState } from "react";
import API from "../../services/API";
import { toast } from "react-hot-toast";
import Layout from "../../components/shared/Layout/Layout";

const PendingHospitals = () => {
  const [hospitals, setHospitals] = useState([]);

  const loadPending = async () => {
    try {
      const res = await API.get("/admin/pending-hospitals");
      if (res.data.success) {
        setHospitals(res.data.hospitals || []);
      }
    } catch (err) {
      console.error("Error fetching pending hospitals:", err);
      toast.error("Failed to load pending hospitals");
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (hospitalId) => {
    try {
      // 1️⃣ Send OTP
      const otpRes = await API.post("/admin/send-approval-otp");
      if (!otpRes.data.success) {
        toast.error(otpRes.data.message || "Failed to send OTP");
        return;
      }
      toast.success("OTP sent to your admin email");

      // 2️⃣ Ask for OTP
      const otp = window.prompt("Enter OTP sent to your email:");
      if (!otp) {
        toast("Approval cancelled.");
        return;
      }

      // 3️⃣ Approve with OTP
      const res = await API.patch(`/admin/approve-hospital/${hospitalId}`, {
        otp,
      });

      if (res.data.success) {
        toast.success("Hospital approved");
        loadPending();
      } else {
        toast.error(res.data.message || "Failed to approve hospital");
      }
    } catch (err) {
      console.error("Error approving hospital:", err);
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (hospitalId) => {
    try {
      const res = await API.patch(`/admin/reject-hospital/${hospitalId}`);
      if (res.data.success) {
        toast.success("Hospital rejected");
        loadPending();
      } else {
        toast.error(res.data.message || "Failed to reject hospital");
      }
    } catch (err) {
      console.error("Error rejecting hospital:", err);
      toast.error("Reject failed");
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h3>Pending Hospital Approvals</h3>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No pending hospitals.
                </td>
              </tr>
            ) : (
              hospitals.map((h) => (
                <tr key={h._id}>
                  <td>{h.HospitalName}</td>
                  <td>{h.email}</td>
                  <td>{h.phone}</td>
                  <td>{h.address}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleApprove(h._id)}
                    >
                      Approve (OTP)
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(h._id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default PendingHospitals;
