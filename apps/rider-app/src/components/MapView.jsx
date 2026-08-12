import React, { useEffect, useState, useRef } from "react";
import { calculateDistance } from "@ride/utils";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const riderGpsIcon = new L.DivIcon({
  className: "bg-transparent border-none",
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <span class="absolute w-full h-full bg-blue-500 rounded-full opacity-40 animate-ping"></span>
      <div class="relative z-10 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const MapInteractionListener = ({ onDrag }) => {
  useMapEvents({
    dragstart: () => {
      onDrag();
    },
  });
  return null;
};

const MapUpdater = ({
  pickupLocation,
  dropoffLocation,
  driverLocation,
  currentLocation,
  rideState,
  isAutoFollowing,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!isAutoFollowing) return;

    // Center the map based on the typed Pickup and Dropoff locations, NOT the GPS
    if (
      pickupLocation?.lat &&
      dropoffLocation?.lat &&
      !["accepted", "in_progress"].includes(rideState)
    ) {
      const bounds = [
        [pickupLocation.lat, pickupLocation.lng],
        [dropoffLocation.lat, dropoffLocation.lng],
      ];
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (
      driverLocation?.lat &&
      ["accepted", "in_progress"].includes(rideState)
    ) {
      map.panTo([driverLocation.lat, driverLocation.lng], {
        animate: true,
        duration: 1,
      });
    } else if (currentLocation && !pickupLocation?.lat) {
      // Only snap to GPS if they haven't typed a pickup location yet
      map.panTo(currentLocation, {
        animate: true,
        duration: 1,
      });
    }
  }, [
    map,
    pickupLocation,
    dropoffLocation,
    driverLocation,
    currentLocation,
    rideState,
    isAutoFollowing,
  ]);

  return null;
};

function MapView({
  pickupLocation,
  dropoffLocation,
  driverLocation,
  rideState,
}) {
  const defaultCenter = [11.0168, 76.9558];

  const [currentLocation, setCurrentLocation] = useState(null);
  const [isAutoFollowing, setIsAutoFollowing] = useState(true);
  const [routePath, setRoutePath] = useState([]);
  const lastFetchedParams = useRef(null);

  // GPS Tracking Effect (Only sets currentLocation for the blue dot)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.error("⚠️ Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => console.warn("📍 GPS Error:", error.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // OSRM Routing Effect
  useEffect(() => {
    const fetchRoute = async () => {
      let start, end;

      if (
        rideState === "accepted" &&
        driverLocation?.lat &&
        pickupLocation?.lat
      ) {
        start = driverLocation;
        end = pickupLocation;
      } else if (
        rideState === "in_progress" &&
        driverLocation?.lat &&
        dropoffLocation?.lat
      ) {
        start = driverLocation;
        end = dropoffLocation;
      } else if (
        pickupLocation?.lat && //   Strictly checking for pickupLocation prop
        dropoffLocation?.lat &&
        !["accepted", "in_progress"].includes(rideState)
      ) {
        //  Set route start to the typed Pickup Location, not current GPS!
        start = pickupLocation;
        end = dropoffLocation;
      } else {
        setRoutePath([]);
        lastFetchedParams.current = null;
        return;
      }

      if (lastFetchedParams.current) {
        const { prevStart, prevEnd, prevState } = lastFetchedParams.current;

        if (prevState === rideState) {
          const startDistanceMoved = calculateDistance(
            prevStart.lat,
            prevStart.lng,
            start.lat,
            start.lng,
          );
          const endDistanceMoved = calculateDistance(
            prevEnd.lat,
            prevEnd.lng,
            end.lat,
            end.lng,
          );

          if (startDistanceMoved < 0.05 && endDistanceMoved === 0) return;
        }
      }

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
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
            prevStart: start,
            prevEnd: end,
            prevState: rideState,
          };
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
      }
    };

    fetchRoute();
  }, [
    pickupLocation,
    dropoffLocation,
    driverLocation,
    rideState, // Removed currentLocation from dependency so GPS updates don't recalculate static routes
  ]);

  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-brand-beige dark:bg-brand-dark">
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapUpdater
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          driverLocation={driverLocation}
          currentLocation={currentLocation}
          rideState={rideState}
          isAutoFollowing={isAutoFollowing}
        />

        <MapInteractionListener onDrag={() => setIsAutoFollowing(false)} />

        {/* The Route Path */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="#077A7D"
            weight={4}
            dashArray={rideState === "accepted" ? "5, 10" : ""}
          />
        )}

        {/* Physical Blue Dot (User's real GPS) */}
        {currentLocation &&
          !["accepted", "in_progress"].includes(rideState) && (
            <Marker position={currentLocation} icon={riderGpsIcon} />
          )}

        {/*  Pickup Marker strictly placed at the typed pickupLocation coords */}
        {pickupLocation?.lat && (
          <Marker
            position={[pickupLocation.lat, pickupLocation.lng]}
            icon={pickupIcon}
          />
        )}

        {/* Dropoff Marker */}
        {dropoffLocation?.lat && (
          <Marker
            position={[dropoffLocation.lat, dropoffLocation.lng]}
            icon={dropoffIcon}
          />
        )}

        {/* Driver Marker */}
        {driverLocation?.lat &&
          (rideState === "accepted" || rideState === "in_progress") && (
            <Marker
              position={[driverLocation.lat, driverLocation.lng]}
              icon={driverIcon}
            />
          )}
      </MapContainer>

      {/* Recenter Button */}
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
            xmlns="http://www.w3.org/2000/svg"
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
}

export default MapView;
