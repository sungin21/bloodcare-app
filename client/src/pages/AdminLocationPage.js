import React, { useEffect, useState } from "react";
import Layout from "../components/shared/Layout/Layout";
import Spinner from "../components/shared/Spinner";
import API from "../services/API";
import moment from "moment";

const AdminLocationPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      const { data } = await API.get("/location/all");
      if (data.success) {
        // Some backends return data.data, some data.locations
        setLocations(data.data || data.locations || []);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <Layout>
      <div className="container mt-4">
        <h2 className="text-center mb-4 text-primary fw-bold">
          🌍 User Locations
        </h2>
        {loading ? (
          <Spinner />
        ) : (
          <table className="table table-striped table-bordered shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Address</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {locations.length > 0 ? (
                locations.map((loc, index) => (
                  <tr key={loc._id}>
                    <td>{index + 1}</td>
                    <td>{loc.user?.name || "Unknown"}</td>
                    <td>{loc.user?.email || "N/A"}</td>
                    <td>
                      {loc.location?.coordinates
                        ? loc.location.coordinates[1]
                        : "N/A"}
                    </td>
                    <td>
                      {loc.location?.coordinates
                        ? loc.location.coordinates[0]
                        : "N/A"}
                    </td>
                    <td>{loc.address || "N/A"}</td>
                    <td>
                      {moment(loc.createdAt).format("DD/MM/YYYY hh:mm A")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No location data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default AdminLocationPage;
