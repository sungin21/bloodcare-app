import React from "react";
import Layout from "../components/shared/Layout/Layout";
import MyMap from "../components/Map/MyMap";

const LocationMapPage = () => {
  return (
    <Layout>
      <div className="container mt-4">
        <h2 className="text-primary fw-bold text-center mb-3">
          📍 My Saved Location
        </h2>
        <p className="text-center text-muted mb-4">
          This map shows your current saved location from the database.
        </p>
        <MyMap />
      </div>
    </Layout>
  );
};

export default LocationMapPage;
