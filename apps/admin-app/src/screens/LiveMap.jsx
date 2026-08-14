import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Car, RefreshCw } from "lucide-react";
import { renderToString } from "react-dom/server";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const carHtml = renderToString(
  <div
    style={{
      backgroundColor: "#0d9488",
      color: "white",
      padding: "4px",
      borderRadius: "50%",
      border: "2px solid white",
      boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
    }}
  >
    <Car size={20} strokeWidth={2.5} />
  </div>,
);

const carIcon = L.divIcon({
  html: carHtml,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});
// ------------------------

const LiveMap = () => {
  const { token } = useContext(AuthContext);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Defaulting to Coimbatore, India
  const mapCenter = [11.0168, 76.9558];

  useEffect(() => {
    fetchLiveDrivers();
    // Set up an interval to refresh driver locations every 60 seconds automatically
    const interval = setInterval(fetchLiveDrivers, 6000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchLiveDrivers = async () => {
    setLoading(true); // Ensure loading state triggers on manual refresh
    try {
      const response = await fetch(
        "https://ride-hailing-backend-coan.onrender.com/api/admin/live-map",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (data.success) {
        setDrivers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch live locations", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-brand-teal/10 dark:border-brand-mint/10 pb-4 sm:pb-6 shrink-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark dark:text-brand-beige">
            God-Mode Map
          </h1>
          <p className="text-sm sm:text-base text-brand-dark/70 dark:text-brand-beige/70 font-medium mt-1">
            Real-time fleet tracking and active ride monitoring.
          </p>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-brand-dark dark:text-brand-beige uppercase tracking-wider">
              {drivers.length} Online
              <span className="hidden sm:inline"> Drivers</span>
            </span>
          </div>

          <button
            onClick={fetchLiveDrivers}
            disabled={loading}
            className="p-2 sm:p-2.5 rounded-xl bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal dark:bg-brand-mint/10 dark:hover:bg-brand-mint/20 dark:text-brand-mint transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh map data"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full grow min-h-100 sm:min-h-0 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-brand-teal/20 dark:border-brand-mint/20 shadow-lg relative z-0">
        {loading && drivers.length === 0 ? (
          <div className="absolute inset-0 bg-brand-teal/5 dark:bg-brand-mint/5 flex items-center justify-center z-10">
            <span className="animate-pulse text-sm sm:text-base font-bold text-brand-teal dark:text-brand-mint">
              Initializing Satellite Uplink...
            </span>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {drivers.map((driver) => {
              // Safety check: Ensure coordinates exist using your exact schema field
              if (
                !driver.currentLocation ||
                !driver.currentLocation.lat ||
                !driver.currentLocation.lng
              )
                return null;

              return (
                <Marker
                  key={driver._id}
                  position={[
                    driver.currentLocation.lat,
                    driver.currentLocation.lng,
                  ]}
                  icon={carIcon}
                >
                  <Popup className="rounded-xl">
                    <div className="p-1">
                      <h3 className="font-black text-gray-900 text-sm">
                        {driver.name}
                      </h3>
                      <p className="text-gray-500 text-xs font-medium mb-2">
                        {driver.phone}
                      </p>
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-gray-500">
                          Vehicle
                        </p>
                        <p className="text-xs font-bold text-gray-800">
                          {driver.vehicle?.make} {driver.vehicle?.model}
                        </p>
                        <p className="text-xs text-gray-600 font-mono mt-1">
                          {driver.vehicle?.licensePlate || "No Plate"}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default LiveMap;
