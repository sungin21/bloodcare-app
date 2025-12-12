import React from "react";
import Layout from "../components/shared/Layout/Layout";
import LocationTracker from "../components/LocationTracker";

const UserDashboard = () => {
  return (
    <Layout>
      <div className="container mt-4">
        <h2 className="text-primary mb-4">Welcome, Donor!</h2>
        <LocationTracker />
      </div>
    </Layout>
  );
};

export default UserDashboard;

