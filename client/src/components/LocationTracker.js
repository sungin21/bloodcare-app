import React, { useState } from "react";
import axios from "axios";

const LocationTracker = () => {
  const [coords, setCoords] = useState({ latitude: "", longitude: "" });
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in your browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setCoords({ latitude, longitude });

        // optional: get address using Google Geocoding API
        let addressText = `Lat: ${latitude}, Long: ${longitude}`;
        try {
          const res = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_API_KEY`
          );
          if (res.data.results && res.data.results[0]) {
            addressText = res.data.results[0].formatted_address;
          }
        } catch (error) {
          console.warn("Could not fetch address:", error);
        }

        setAddress(addressText);

        // send to backend
        try {
          await axios.post(
            "/api/location/add",
            { latitude, longitude, address: addressText },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          alert("Location saved successfully!");
        } catch (error) {
          console.error("Error saving location:", error);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoading(false);
      }
    );
  };

  return (
    <div className="card p-3 shadow-md">
      <h4>Track My Location</h4>
      <button className="btn btn-primary" onClick={getLocation} disabled={loading}>
        {loading ? "Fetching..." : "Get My Location"}
      </button>
      <p>Latitude: {coords.latitude}</p>
      <p>Longitude: {coords.longitude}</p>
      <p>Address: {address}</p>
    </div>
  );
};

export default LocationTracker;
