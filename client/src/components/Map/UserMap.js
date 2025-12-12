import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import API from "../../services/API";

// 🧭 Custom marker icons (using free OpenStreetMap-style icons)
const redIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

const blueIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
  className: "blue-marker",
});

const UserMap = ({ latitude, longitude }) => {
  const [donors, setDonors] = useState([]);
  const [radius, setRadius] = useState(10); // default 10 km
  const [loading, setLoading] = useState(false);

  // Fetch donors near your location
  const fetchNearbyDonors = async () => {
    if (!latitude || !longitude) return;
    setLoading(true);
    try {
      const { data } = await API.get(
        `/location/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
      );
      if (data?.success) setDonors(data.donors);
    } catch (err) {
      console.error("Error fetching nearby donors:", err);
    }
    setLoading(false);
  };

 
useEffect(() => {
  fetchNearbyDonors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [latitude, longitude, radius]);


  return (
    <div>
      {/* 🧭 Radius Filter */}
      <div className="mb-3">
        <label htmlFor="radius">Show donors within: </label>
        <select
          id="radius"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="ms-2"
        >
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="20">20 km</option>
          <option value="50">50 km</option>
        </select>
      </div>

      <div
        style={{
          height: "450px",
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          {/* 🗺️ OpenStreetMap Tiles */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />

          {/* 🔵 Your Location */}
          <Marker position={[latitude, longitude]} icon={blueIcon}>
            <Popup>📍 You are here</Popup>
          </Marker>

          {/* 🔵 Circle around your location to show radius */}
          <Circle
            center={[latitude, longitude]}
            radius={radius * 1000}
            pathOptions={{ color: "blue", fillOpacity: 0.1 }}
          />

          {/* ❤️ Nearby Donors */}
          {donors.map((donor) => (
            <Marker
              key={donor._id}
              icon={redIcon}
              position={[
                donor.location.coordinates[1],
                donor.location.coordinates[0],
              ]}
            >
              <Popup>
                <strong>{donor.user?.name || "Donor"}</strong> <br />
                Blood Group: {donor.user?.bloodGroup || "Unknown"} <br />
                📧 {donor.user?.email || "N/A"} <br />
                Distance: {(donor.distance / 1000).toFixed(2)} km away
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {loading && <p className="text-muted mt-2">Loading nearby donors...</p>}
    </div>
  );
};

export default UserMap;
