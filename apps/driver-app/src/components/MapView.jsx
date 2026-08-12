import React, { useEffect, useState, useRef } from "react";
import { calculateDistance } from "@ride/utils";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- CUSTOM ICONS ---
const driverIcon = new L.DivIcon({
  className: "bg-transparent border-none",
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <span class="absolute w-full h-full bg-[#077A7D] rounded-full opacity-50 animate-ping"></span>
      <div class="relative z-10 w-6 h-6 bg-[#06202B] border-2 border-[#7AE2CF] rounded-full flex items-center justify-center text-[10px] shadow-lg">🚗</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const pickupIcon = new L.DivIcon({
  className: "bg-transparent border-none",
  html: `<div class="w-4 h-4 bg-[#06202B] rounded-full border-2 border-[#077A7D] shadow-lg"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dropoffIcon = new L.DivIcon({
  className: "bg-transparent border-none",
  html: `<div class="w-4 h-4 bg-[#7AE2CF] rounded-full border-2 border-[#06202B] shadow-lg"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
// -------------------------------------------------------------

const MapUpdater = ({ center, isAutoFollowing }) => {
  const map = useMap();
  useEffect(() => {
    if (isAutoFollowing && center) {
      map.panTo(center, { animate: true, duration: 1 });
    }
  }, [center, map, isAutoFollowing]);
  return null;
};

const MapInteractionListener = ({ onDrag }) => {
  useMapEvents({
    dragstart: () => {
      onDrag();
    },
  });
  return null;
};

const MapView = ({ driverState, rideData, onLocationUpdate }) => {
  const defaultCenter = [11.0168, 76.9558];

  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [isAutoFollowing, setIsAutoFollowing] = useState(true);
  const [routePath, setRoutePath] = useState([]);

  const onLocationUpdateRef = useRef(onLocationUpdate);
  const lastFetchedParams = useRef(null);

  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate;
  }, [onLocationUpdate]);

  //   Guarantee the Rider gets a location when the ride starts, even if GPS is off.
  useEffect(() => {
    if (
      ["en_route_pickup", "active_trip"].includes(driverState) &&
      currentLocation
    ) {
      if (onLocationUpdateRef.current) {
        onLocationUpdateRef.current({
          lat: currentLocation[0],
          lng: currentLocation[1],
        });
      }
    }
  }, [driverState]); // Only fires when the ride phase changes

  // GPS Tracking Effect
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn(
        "⚠️ Geolocation not supported. Relying on default fallback.",
      );
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
        setCurrentLocation([currentLat, currentLng]);

        if (onLocationUpdateRef.current) {
          onLocationUpdateRef.current({ lat: currentLat, lng: currentLng });
        }
      },
      (error) => {
        console.warn("📍 GPS Error/Denied. Using fallback location.");
        // If GPS is denied mid-session, still broadcast the fallback coordinates
        if (onLocationUpdateRef.current) {
          onLocationUpdateRef.current({
            lat: defaultCenter[0],
            lng: defaultCenter[1],
          });
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // OSRM Routing Effect
  useEffect(() => {
    const getRoute = async () => {
      if (!currentLocation) return;

      let destLat, destLng;

      if (driverState === "en_route_pickup" && rideData?.pickupLocation) {
        destLat = rideData.pickupLocation.lat;
        destLng = rideData.pickupLocation.lng;
      } else if (driverState === "active_trip" && rideData?.dropoffLocation) {
        destLat = rideData.dropoffLocation.lat;
        destLng = rideData.dropoffLocation.lng;
      } else {
        setRoutePath([]);
        lastFetchedParams.current = null;
        return;
      }

      const currentLat = currentLocation[0];
      const currentLng = currentLocation[1];

      if (lastFetchedParams.current) {
        const { prevLat, prevLng, prevState } = lastFetchedParams.current;

        if (prevState === driverState) {
          const distanceMoved = calculateDistance(
            prevLat,
            prevLng,
            currentLat,
            currentLng,
          );
          if (distanceMoved < 0.05) return;
        }
      }

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${currentLng},${currentLat};${destLng},${destLat}?overview=full&geometries=geojson`,
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates;
          const leafletCoords = coordinates.map((coord) => [
            coord[1],
            coord[0],
          ]);

          setRoutePath(leafletCoords);
          lastFetchedParams.current = {
            prevLat: currentLat,
            prevLng: currentLng,
            prevState: driverState,
          };
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
      }
    };

    getRoute();
  }, [driverState, rideData, currentLocation]);

  const renderMapOverlay = () => {
    if (driverState === "offline") {
      return (
        <div className="absolute inset-0 bg-brand-beige/80 dark:bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <span className="bg-brand-dark text-brand-beige dark:bg-brand-beige dark:text-brand-dark px-6 py-3 rounded-full font-bold shadow-xl">
            Map Offline
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-full bg-brand-beige dark:bg-brand-dark">
      <div className="absolute inset-0 z-0 ">
        <MapContainer
          center={defaultCenter}
          zoom={15}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater
            center={currentLocation}
            isAutoFollowing={isAutoFollowing}
          />
          <MapInteractionListener onDrag={() => setIsAutoFollowing(false)} />

          {currentLocation && driverState !== "offline" && (
            <Marker position={currentLocation} icon={driverIcon} />
          )}

          {driverState === "en_route_pickup" && rideData?.pickupLocation && (
            <>
              <Marker
                position={[
                  rideData.pickupLocation.lat,
                  rideData.pickupLocation.lng,
                ]}
                icon={pickupIcon}
              />
              {routePath.length > 0 && (
                <Polyline
                  positions={routePath}
                  color="#077a7d"
                  weight={4}
                  dashArray="5, 10"
                />
              )}
            </>
          )}

          {driverState === "active_trip" && rideData?.dropoffLocation && (
            <>
              <Marker
                position={[
                  rideData.dropoffLocation.lat,
                  rideData.dropoffLocation.lng,
                ]}
                icon={dropoffIcon}
              />
              {routePath.length > 0 && (
                <Polyline positions={routePath} color="#077a7d" weight={5} />
              )}
            </>
          )}
        </MapContainer>
      </div>

      {renderMapOverlay()}

      {!isAutoFollowing && (
        <button
          onClick={() => setIsAutoFollowing(true)}
          className="absolute top-4 right-4 z-[1000] bg-white dark:bg-brand-dark text-brand-teal dark:text-brand-mint p-3 rounded-full shadow-lg border border-brand-teal/20 dark:border-brand-mint/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          aria-label="Recenter map"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MapView;
