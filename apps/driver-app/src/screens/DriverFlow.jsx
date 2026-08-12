import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AppLayout from "../layout/AppLayout";
import socket from "../../services/socket";

// Imports matching your structure
import Header from "../components/Header";
import MapView from "../components/MapView";
import OnlineTogglePanel from "../components/OnlineTogglePanel";
import IncomingRequestPanel from "../components/IncomingRequestPanel";
import EnRouteToPickupPanel from "../components/EnRouteToPickupPanel";
import ActiveTripPanel from "../components/ActiveTripPanel";
import TripSummaryPanel from "../components/TripSummaryPanel";
import ScreenLoader from "../components/ScreenLoader";

const DriverFlow = () => {
  const { driver } = useContext(AuthContext);

  // Core state machine for the driver's flow
  const [driverState, setDriverState] = useState("offline"); // offline, online_idle, receiving_request, en_route_pickup, active_trip, trip_complete
  const [currentRideData, setCurrentRideData] = useState(null);

  useEffect(() => {
    const hydrateDriverSession = async () => {
      // Ensure we actually have a logged-in driver before proceeding
      if (!driver || !driver._id) return;

      //  Instantly re-join the driver's dedicated Socket.io room
      socket.emit("joinDriverRoom", driver._id);
      console.log("🔄 Re-joining socket room for driver:", driver._id);

      try {
        //  Fetch the active ride from your new backend endpoint
        const token = localStorage.getItem("driverToken");
        const response = await fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/rides/current/driver",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        //  Restore state if an active ride is found
        if (data.ride) {
          console.log("🚖 Active ride recovered:", data.ride);
          setCurrentRideData(data.ride);

          // Map the database status back to your React state machine
          switch (data.ride.status) {
            case "requested":
              setDriverState("receiving_request");
              break;
            case "accepted":
              setDriverState("en_route_pickup");
              break;
            case "in_progress":
              setDriverState("active_trip");
              break;
            default:
              setDriverState("online_idle");
          }
        } else {
          console.log(
            `✅ No active ride. Database says driver is: ${data.dutyStatus}`,
          );

          if (data.dutyStatus === "online") {
            setDriverState("online_idle");
          } else {
            setDriverState("offline");
          }
        }
      } catch (error) {
        console.error("❌ Failed to hydrate driver session:", error);
      }
    };

    hydrateDriverSession();
  }, [driver]); // Dependency array ensures this runs when the driver object is loaded

  useEffect(() => {
    // Only listen for incoming rides if the driver is online and waiting
    if (driverState === "online_idle") {
      const handleNewRide = (newRide) => {
        console.log("🚕 NEW RIDE REQUEST RECEIVED:", newRide);
        console.log("👤 POPULATED RIDER INFO:", newRide.rider);
        console.log("🚕 New Ride Broadcast Received:", newRide);

        // Save the ride payload from backend into state
        setCurrentRideData(newRide);

        // Transition state machine to show IncomingRequestPanel
        setDriverState("receiving_request");
      };

      // Subscribe to the exact event name your backend emits
      socket.on("newRideRequest", handleNewRide);

      // Cleanup listener when driverState changes or component unmounts
      return () => {
        socket.off("newRideRequest", handleNewRide);
      };
    }
  }, [driverState]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const storedDriver = JSON.parse(localStorage.getItem("driver") || "{}");

    const driverId =
      driver?._id ||
      driver?.id ||
      storedDriver._id ||
      storedDriver.id ||
      storedUser._id ||
      storedUser.id ||
      localStorage.getItem("driverToken");

    console.log("🔌 Initializing Driver Socket for ID:", driverId);

    const joinRoom = () => {
      if (driverId) {
        console.log(`🟢 Driver joining room: driver_${driverId}`);
        socket.emit("joinDriverRoom", driverId);
      } else {
        console.warn("⚠️ Could not find Driver ID to join socket room!");
      }
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect(); // Ensure socket is connected if it was disconnected
    }

    socket.on("connect", joinRoom);

    // 2. Listen for cancellations from the Rider
    const handleRideCancelled = (data) => {
      console.log("🚫 Ride was cancelled by the driver:", data);

      // Completely clear active trip state & reset screen
      setCurrentRideData(null);
      setDriverState("online_idle");

      setTimeout(() => {
        if (data.cancelledBy === "driver") {
          alert("You cancelled the ride.");
        } else if (data.cancelledBy !== "rider") {
          alert("Your ride has been cancelled.");
        } else if (data.cancelledBy === "rider") {
          alert("Your rider has cancelled the ride.");
        }
      }, 100);
    };

    socket.on("rideCancelled", handleRideCancelled);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("rideCancelled", handleRideCancelled);
    };
  }, [driver]); // Re-run if auth context driver loads in

  const handleLocationUpdate = async (coords) => {
    //  MICROSCOPE LOG: Prove the function is being called and show the exact state
    console.log("⚙️ Interval Tick! Data state:", {
      hasRideData: !!currentRideData,
      rider: currentRideData?.rider,
    });

    if (
      driverState === "online_idle" ||
      driverState === "active_trip" ||
      driverState === "en_route_pickup"
    ) {
      try {
        const token = localStorage.getItem("driverToken");
        await fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/drivers/location",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
          },
        );
      } catch (err) {
        console.error("Failed to save location to DB", err);
      }
    }
    const isActivelyWithRider =
      driverState === "en_route_pickup" || driverState === "active_trip";

    // Safely check for the rider using currentRideData (NOT driverState!)
    if (isActivelyWithRider && currentRideData && currentRideData.rider) {
      const targetRiderId =
        currentRideData.rider._id ||
        currentRideData.rider.id ||
        currentRideData.rider;

      //  SUCCESS LOG
      console.log("📍 Emitting Location to Rider:", targetRiderId, coords);

      socket.emit("driverLocationUpdate", {
        riderId: targetRiderId,
        lat: coords.lat,
        lng: coords.lng,
      });
    } else {
      console.warn("⚠️ Cannot emit: currentRideData or rider is missing!");
    }
  };

  return (
    <AppLayout>
      <Header></Header>
      <ScreenLoader />
      {/* 
        The main container takes up the full viewport height minus any header/nav.
        Using bg-brand-beige for light mode and bg-brand-dark for dark mode.
      */}
      <div className="relative w-full flex-1 overflow-hidden bg-brand-beige dark:bg-brand-dark transition-colors duration-300">
        {/* Base Map Layer (Z-0) */}
        <div className="absolute inset-0 z-0">
          <MapView
            driverState={driverState}
            rideData={currentRideData}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>

        {/*  UI Overlay Layer (Z-10) - Positioned at the bottom for mobile thumbs */}
        <div className="absolute bottom-0 w-full z-10 p-4 pointer-events-none pb-8">
          <div className="max-w-md mx-auto pointer-events-auto">
            {/* Render specific panels based on current driver state */}
            {(driverState === "offline" || driverState === "online_idle") && (
              <OnlineTogglePanel
                currentState={driverState}
                setDriverState={setDriverState}
              />
            )}

            {driverState === "receiving_request" && (
              <IncomingRequestPanel
                rideData={currentRideData}
                setDriverState={setDriverState}
              />
            )}

            {driverState === "en_route_pickup" && (
              <EnRouteToPickupPanel
                rideData={currentRideData}
                setDriverState={setDriverState}
                setCurrentRideData={setCurrentRideData}
              />
            )}

            {driverState === "active_trip" && (
              <ActiveTripPanel
                rideData={currentRideData}
                setDriverState={setDriverState}
              />
            )}

            {driverState === "trip_complete" && (
              <TripSummaryPanel
                rideData={currentRideData}
                setDriverState={setDriverState}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DriverFlow;
