import  { useEffect, useRef} from "react";
import API from "../../services/API";
import { createSocket } from "../../services/socket";

const LiveTracker = ({ onPositionUpdate }) => {
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    socketRef.current = createSocket(token);

    return () => socketRef.current?.disconnect();
  }, [token]);

  useEffect(() => {
    const sendLocation = async (lat, lng, address) => {
      try {
        await API.post(
          "/location/add",
          { latitude: lat, longitude: lng, address },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch {}
    };

    const handlePosition = (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const address = `Lat: ${lat}, Long: ${lng}`;

      socketRef.current?.emit("updateLocation", {
        latitude: lat,
        longitude: lng,
        address,
      });

      sendLocation(lat, lng, address);
      onPositionUpdate && onPositionUpdate({ lat, lng });
    };

    const id = navigator.geolocation.watchPosition(handlePosition, () => {}, {
      enableHighAccuracy: false,
    });

    return () => navigator.geolocation.clearWatch(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default LiveTracker;