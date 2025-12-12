import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import API from "../../services/API";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "10px",
};

const MyMap = () => {
  const [coords, setCoords] = useState(null);

  // ✅ Load Google Maps script
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
  });

  // ✅ Fetch your saved location from backend
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { data } = await API.get("/location/me");
        if (data.success) {
          const [lng, lat] = data.location.location.coordinates;
          setCoords({ lat, lng });
        }
      } catch (err) {
        console.error("Error fetching location:", err);
      }
    };
    fetchLocation();
  }, []);

  if (!isLoaded) return <p>Loading map...</p>;
  if (!coords) return <p>No location data found. Please save your location first.</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={coords}
      zoom={14}
    >
      {/* ✅ Marker for your location */}
      <Marker
        position={coords}
        title="You are here"
        icon={{
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        }}
      />
    </GoogleMap>
  );
};

export default React.memo(MyMap);
