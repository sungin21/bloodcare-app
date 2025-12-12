import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/shared/Spinner";
import Layout from "../components/shared/Layout/Layout";
import Modal from "../components/shared/modal/Modal";
import API from "../services/API";
import moment from "moment";
import UserMap from "../components/Map/UserMap";
import LiveTracker from "../components/Map/LiveTracker";
import DonorMap from "../components/DonorMap";

const HomePage = () => {
  const { loading, error, user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [coords, setCoords] = useState({ latitude: "", longitude: "" });
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  // Fetch inventory
  const getBloodRecords = async () => {
    try {
      const res = await API.get("/inventory/get-inventory");
      if (res.data?.success) setData(res.data.inventory || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  useEffect(() => {
    getBloodRecords();
    // eslint-disable-next-line
  }, []);

  // redirect admin to admin page (keeps effect synchronous)
  if (user?.role === "admin") {
    navigate("/admin");
    return null;
  }

  return (
  <Layout>
    {error && alert(error)}

    {loading ? (
      <Spinner />
    ) : (
      <div className="dashboard-container">

        {/* Top Page Header */}
        <div className="page-header-beauty">
          <h1 className="page-title-beauty">Dashboard</h1>
          <p className="page-subtext">Your personalized overview and activity summary</p>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stats-card">
            <h4>Welcome</h4>
            <p className="stats-value">{user?.name || "—"}</p>
          </div>

          <div className="stats-card">
            <h4>Your Role</h4>
            <p className="stats-value">{user?.role || "—"}</p>
          </div>

          <div className="stats-card">
            <h4>Records Found</h4>
            <p className="stats-value">{data?.length || 0}</p>
          </div>
        </div>

        {/* INVENTORY SECTION */}
        <div className="section-header">
          <h3 className="section-title-beauty">Blood Inventory</h3>
          <button
            className="add-btn-beauty"
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop"
          >
            + Add Inventory
          </button>
        </div>

        <div className="section-card">
          <table className="beautiful-table">
            <thead>
              <tr>
                <th>Blood Group</th>
                <th>Inventory Type</th>
                <th>Quantity</th>
                <th>Donor Email</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.length ? (
                data.map((record) => (
                  <tr key={record._id}>
                    <td>{record.bloodGroup}</td>
                    <td>{record.inventoryType}</td>
                    <td>{record.quantity} ML</td>
                    <td>{record.email}</td>
                    <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data-beauty">No inventory records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* NEARBY DONORS SECTION */}
        <div className="section-card" style={{ marginTop: 35 }}>
          <h3 className="section-title-beauty">Nearby Donors</h3>

          <LiveTracker
            onLocationChange={({ latitude, longitude, address }) => {
              setCoords({ latitude, longitude });
              setAddress(address);
            }}
          />

          {coords.latitude && (
            <>
              <div className="location-info">
                <p><strong>Latitude:</strong> {coords.latitude}</p>
                <p><strong>Longitude:</strong> {coords.longitude}</p>
                <p><strong>Address:</strong> {address}</p>
              </div>

              <div className="map-box-beauty">
                <UserMap latitude={coords.latitude} longitude={coords.longitude} />
              </div>
            </>
          )}

          <h4 className="sub-map-title">All Donors</h4>
          <div className="map-box-beauty small-map">
            <DonorMap />
          </div>
        </div>

        <Modal />
      </div>
    )}
  </Layout>
);

};

export default HomePage;
